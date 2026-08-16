import type { PackedStarData, StarInstanceLevel } from './packed-star-data'
import { selectStarInstancePrefix } from './packed-star-data'
import { skyRendering } from '../../config/sky-rendering'

export interface WebglStarViewport {
  readonly width: number
  readonly height: number
  readonly devicePixelRatio: number
}

export interface WebglStarFrame {
  readonly progress: number
  readonly animationTime: number
}

export interface WebglStarRenderer {
  resize(viewport: WebglStarViewport): void
  draw(frame: WebglStarFrame): void
  setInstanceCount(count: StarInstanceLevel): void
  destroy(): void
}

interface WebglStarRendererOptions {
  readonly onDraw?: (durationMs: number) => void
}

interface Resources {
  readonly program: WebGLProgram
  readonly vao: WebGLVertexArrayObject
  readonly buffers: readonly WebGLBuffer[]
  readonly indexBuffer: WebGLBuffer
  readonly viewport: WebGLUniformLocation
  readonly progress: WebGLUniformLocation
  readonly time: WebGLUniformLocation
  readonly twinkleAmplitude: WebGLUniformLocation
  readonly twinkleBaseFrequency: WebGLUniformLocation
  readonly twinkleSpeedMultiplier: WebGLUniformLocation
  readonly starInitialOpacity: WebGLUniformLocation
  readonly starFinalOpacity: WebGLUniformLocation
  readonly parallaxBaseSpeed: WebGLUniformLocation
  readonly parallaxLayerSpread: WebGLUniformLocation
  readonly sizeMin: WebGLUniformLocation
  readonly sizeRange: WebGLUniformLocation
  readonly sizeLayerWeight: WebGLUniformLocation
  readonly sizeRarity: WebGLUniformLocation
}

const vertexShader = `#version 300 es
layout(location=0) in vec2 a_corner;
layout(location=1) in vec2 a_origin;
layout(location=2) in vec4 a_star;
layout(location=3) in vec4 a_color;
layout(location=4) in float a_layer;
uniform vec2 u_viewport;
uniform float u_progress;
uniform float u_time;
uniform float u_twinkleAmplitude;
uniform float u_twinkleBaseFrequency;
uniform float u_twinkleSpeedMultiplier;
uniform float u_starInitialOpacity;
uniform float u_starFinalOpacity;
uniform float u_parallaxBaseSpeed;
uniform float u_parallaxLayerSpread;
uniform float u_sizeMin;
uniform float u_sizeRange;
uniform float u_sizeLayerWeight;
uniform float u_sizeRarity;
out vec2 v_corner;
out vec4 v_color;
out float v_alpha;
void main() {
  float twinkle = (1.0 - u_twinkleAmplitude) + sin(u_time * (u_twinkleBaseFrequency + a_star.w * u_twinkleSpeedMultiplier) + a_star.x * 6.2831853) * u_twinkleAmplitude;
  float layer = 1.0 + a_layer * u_parallaxLayerSpread;
  vec2 origin = a_origin;
  origin.y = fract(origin.y - u_progress * u_parallaxBaseSpeed * layer);
  float sizeRamp = mix(pow(a_star.y, u_sizeRarity), a_layer, u_sizeLayerWeight);
  float size = (u_sizeMin + sizeRamp * u_sizeRange) * twinkle;
  vec2 cssPosition = origin * u_viewport + a_corner * size;
  vec2 clip = cssPosition / u_viewport * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  v_corner = a_corner;
  v_color = a_color;
  v_alpha = a_star.z * mix(u_starInitialOpacity, u_starFinalOpacity, u_progress);
}`

const fragmentShader = `#version 300 es
precision highp float;
in vec2 v_corner;
in vec4 v_color;
in float v_alpha;
out vec4 out_color;
void main() {
  float distanceFromCenter = length(v_corner);
  float core = smoothstep(1.0, 0.0, distanceFromCenter * 1.8);
  float halo = smoothstep(1.0, 0.0, distanceFromCenter) * 0.28;
  float alpha = (core + halo) * v_alpha * v_color.a;
  out_color = vec4(v_color.rgb * alpha, alpha);
}`

const createShader = (gl: WebGL2RenderingContext, type: number, source: string): WebGLShader => {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Hero sky WebGL: shader allocation failed')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader
  const detail = gl.getShaderInfoLog(shader) ?? 'unknown compile failure'
  gl.deleteShader(shader)
  throw new Error(`Hero sky WebGL: shader compilation failed: ${detail}`)
}

const createProgram = (gl: WebGL2RenderingContext): WebGLProgram => {
  const program = gl.createProgram()
  if (!program) throw new Error('Hero sky WebGL: program allocation failed')
  const vertex = createShader(gl, gl.VERTEX_SHADER, vertexShader)
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader)
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program
  const detail = gl.getProgramInfoLog(program) ?? 'unknown link failure'
  gl.deleteProgram(program)
  throw new Error(`Hero sky WebGL: shader linking failed: ${detail}`)
}

const requiredUniform = (gl: WebGL2RenderingContext, program: WebGLProgram, name: string): WebGLUniformLocation => {
  const location = gl.getUniformLocation(program, name)
  if (location) return location
  throw new Error(`Hero sky WebGL: uniform ${name} is unavailable`)
}

const createBuffer = (gl: WebGL2RenderingContext, target: number, data: BufferSource): WebGLBuffer => {
  const buffer = gl.createBuffer()
  if (!buffer) throw new Error('Hero sky WebGL: buffer allocation failed')
  gl.bindBuffer(target, buffer)
  gl.bufferData(target, data, gl.STATIC_DRAW)
  return buffer
}

export function createWebglStarRenderer(
  canvas: HTMLCanvasElement,
  data: PackedStarData,
  initialCount: StarInstanceLevel = 2_000,
  options: WebglStarRendererOptions = {}
): WebglStarRenderer {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true })
  if (!gl) throw new Error('Hero sky WebGL: WebGL2 is unavailable')

  const capacity = data.metadata.maxInstances
  const origins = new Float32Array(capacity * 2)
  const stars = new Float32Array(capacity * 4)
  const colors = new Float32Array(capacity * 4)
  const layers = new Float32Array(capacity)
  for (let index = 0; index < capacity; index += 1) {
    const sourceIndex = data.amplification[index * 2]
    const replicaOrdinal = data.amplification[index * 2 + 1]
    const record = sourceIndex * 8
    const colorIndex = Math.round(data.records[record + 6] * 255)
    const paletteOffset = colorIndex * 4
    const target = index * 4
    origins[index * 2] = (data.records[record] + ((replicaOrdinal * 0.61803398875) % 1) * 0.1) % 1
    origins[index * 2 + 1] = (data.records[record + 1] + ((replicaOrdinal * 0.41421356237) % 1) * 0.1) % 1
    stars[target] = data.records[record + 2]
    stars[target + 1] = data.records[record + 3]
    stars[target + 2] = data.records[record + 4]
    stars[target + 3] = data.records[record + 5]
    colors[target] = data.palette[paletteOffset] / 255
    colors[target + 1] = data.palette[paletteOffset + 1] / 255
    colors[target + 2] = data.palette[paletteOffset + 2] / 255
    colors[target + 3] = data.palette[paletteOffset + 3] / 255
    layers[index] = data.records[record + 7]
  }

  const buildResources = (): Resources => {
    const program = createProgram(gl)
    const vao = gl.createVertexArray()
    if (!vao) throw new Error('Hero sky WebGL: vertex array allocation failed')
    gl.bindVertexArray(vao)
    const corners = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]))
    const originBuffer = createBuffer(gl, gl.ARRAY_BUFFER, origins)
    const starBuffer = createBuffer(gl, gl.ARRAY_BUFFER, stars)
    const colorBuffer = createBuffer(gl, gl.ARRAY_BUFFER, colors)
    const layerBuffer = createBuffer(gl, gl.ARRAY_BUFFER, layers)
    const indexBuffer = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 2, 1, 3]))
    const buffers = [corners, originBuffer, starBuffer, colorBuffer, layerBuffer]
    const layouts: readonly [number, WebGLBuffer, number][] = [
      [0, corners, 2],
      [1, originBuffer, 2],
      [2, starBuffer, 4],
      [3, colorBuffer, 4],
      [4, layerBuffer, 1]
    ]
    for (const [location, buffer, size] of layouts) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.enableVertexAttribArray(location)
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0)
      if (location > 0) gl.vertexAttribDivisor(location, 1)
    }
    gl.bindVertexArray(null)
    return {
      program,
      vao,
      buffers,
      indexBuffer,
      viewport: requiredUniform(gl, program, 'u_viewport'),
      progress: requiredUniform(gl, program, 'u_progress'),
      time: requiredUniform(gl, program, 'u_time'),
      twinkleAmplitude: requiredUniform(gl, program, 'u_twinkleAmplitude'),
      twinkleBaseFrequency: requiredUniform(gl, program, 'u_twinkleBaseFrequency'),
      twinkleSpeedMultiplier: requiredUniform(gl, program, 'u_twinkleSpeedMultiplier'),
      starInitialOpacity: requiredUniform(gl, program, 'u_starInitialOpacity'),
      starFinalOpacity: requiredUniform(gl, program, 'u_starFinalOpacity'),
      parallaxBaseSpeed: requiredUniform(gl, program, 'u_parallaxBaseSpeed'),
      parallaxLayerSpread: requiredUniform(gl, program, 'u_parallaxLayerSpread'),
      sizeMin: requiredUniform(gl, program, 'u_sizeMin'),
      sizeRange: requiredUniform(gl, program, 'u_sizeRange'),
      sizeLayerWeight: requiredUniform(gl, program, 'u_sizeLayerWeight'),
      sizeRarity: requiredUniform(gl, program, 'u_sizeRarity')
    }
  }

  const release = (value: Resources): void => {
    for (const buffer of value.buffers) gl.deleteBuffer(buffer)
    gl.deleteBuffer(value.indexBuffer)
    gl.deleteVertexArray(value.vao)
    gl.deleteProgram(value.program)
  }

  let resources = buildResources()
  let viewport: WebglStarViewport | null = null
  let instanceCount = selectStarInstancePrefix(data, initialCount)
  let destroyed = false

  return {
    resize: (nextViewport) => {
      if (destroyed) return
      viewport = nextViewport
      canvas.width = Math.max(1, Math.round(nextViewport.width * nextViewport.devicePixelRatio))
      canvas.height = Math.max(1, Math.round(nextViewport.height * nextViewport.devicePixelRatio))
      gl.viewport(0, 0, canvas.width, canvas.height)
    },
    draw: (frame) => {
      if (destroyed || !viewport) return
      const startedAt = performance.now()
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(resources.program)
      gl.bindVertexArray(resources.vao)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      gl.uniform2f(resources.viewport, Math.max(1, viewport.width), Math.max(1, viewport.height))
      gl.uniform1f(resources.progress, Math.min(1, Math.max(0, frame.progress)))
      gl.uniform1f(resources.time, frame.animationTime / 1_000)
      gl.uniform1f(resources.twinkleAmplitude, skyRendering.twinkle.amplitude)
      gl.uniform1f(resources.twinkleBaseFrequency, skyRendering.twinkle.baseFrequency)
      gl.uniform1f(resources.twinkleSpeedMultiplier, skyRendering.twinkle.speedMultiplier)
      gl.uniform1f(resources.starInitialOpacity, skyRendering.starOpacity.initial)
      gl.uniform1f(resources.starFinalOpacity, skyRendering.starOpacity.final)
      gl.uniform1f(resources.parallaxBaseSpeed, skyRendering.parallax.baseSpeed)
      gl.uniform1f(resources.parallaxLayerSpread, skyRendering.parallax.layerSpread)
      gl.uniform1f(resources.sizeMin, skyRendering.starSize.min)
      gl.uniform1f(resources.sizeRange, skyRendering.starSize.max - skyRendering.starSize.min)
      gl.uniform1f(resources.sizeLayerWeight, skyRendering.starSize.layerWeight)
      gl.uniform1f(resources.sizeRarity, skyRendering.starSize.rarity)
      gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, instanceCount)
      gl.bindVertexArray(null)
      options.onDraw?.(performance.now() - startedAt)
    },
    setInstanceCount: (count) => {
      if (!destroyed) instanceCount = selectStarInstancePrefix(data, count)
    },
    destroy: () => {
      if (destroyed) return
      destroyed = true
      release(resources)
    }
  }
}
