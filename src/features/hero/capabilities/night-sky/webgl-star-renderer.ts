import { nightSkyConfig } from './config'
import type { MappedStarData } from './star-mapper'
import { computeSkyCrop, type SkyCrop } from './sky-crop'

export interface WebglStarViewport {
  readonly width: number
  readonly height: number
  readonly devicePixelRatio: number
}

export interface WebglStarRenderer {
  resize(viewport: WebglStarViewport): void
  draw(timeMs: number): void
  destroy(): void
}

interface StarResources {
  readonly program: WebGLProgram
  readonly vao: WebGLVertexArrayObject
  readonly buffers: readonly WebGLBuffer[]
  readonly indexBuffer: WebGLBuffer
  readonly viewport: WebGLUniformLocation
  readonly cropScale: WebGLUniformLocation
  readonly cropOffset: WebGLUniformLocation
  readonly time: WebGLUniformLocation
  readonly twinkleAmplitude: WebGLUniformLocation
  readonly twinkleBaseFrequency: WebGLUniformLocation
  readonly twinkleSpeedMultiplier: WebGLUniformLocation
}

const vertexShader = `#version 300 es
layout(location=0) in vec2 a_corner;
layout(location=1) in vec2 a_origin;
layout(location=2) in vec4 a_star;
layout(location=3) in vec4 a_color;
uniform vec2 u_viewport;
uniform vec2 u_cropScale;
uniform vec2 u_cropOffset;
uniform float u_time;
uniform float u_twinkleAmplitude;
uniform float u_twinkleBaseFrequency;
uniform float u_twinkleSpeedMultiplier;
out vec2 v_corner;
out vec4 v_color;
out float v_alpha;
void main() {
  float twinkle = (1.0 - u_twinkleAmplitude) + sin(u_time * (u_twinkleBaseFrequency + a_star.w * u_twinkleSpeedMultiplier) + a_star.x * 6.2831853) * u_twinkleAmplitude;
  float size = a_star.y * twinkle;
  vec2 cssPosition = (a_origin * u_cropScale - u_cropOffset) * u_viewport + a_corner * size;
  vec2 clip = cssPosition / u_viewport * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  v_corner = a_corner;
  v_color = a_color;
  v_alpha = a_star.z;
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

const createProgram = (gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram => {
  const program = gl.createProgram()
  if (!program) throw new Error('Hero sky WebGL: program allocation failed')
  const vertex = createShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
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

const createBuffer = (
  gl: WebGL2RenderingContext,
  target: number,
  data: Float32Array | Uint16Array,
  usage: number
): WebGLBuffer => {
  const buffer = gl.createBuffer()
  if (!buffer) throw new Error('Hero sky WebGL: buffer allocation failed')
  gl.bindBuffer(target, buffer)
  gl.bufferData(target, data, usage)
  return buffer
}

const buildStarResources = (gl: WebGL2RenderingContext, data: MappedStarData): StarResources => {
  const program = createProgram(gl, vertexShader, fragmentShader)
  const vao = gl.createVertexArray()
  if (!vao) throw new Error('Hero sky WebGL: vertex array allocation failed')
  gl.bindVertexArray(vao)
  const corners = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const originBuffer = createBuffer(gl, gl.ARRAY_BUFFER, data.origins, gl.STATIC_DRAW)
  const starBuffer = createBuffer(gl, gl.ARRAY_BUFFER, data.stars, gl.STATIC_DRAW)
  const colorBuffer = createBuffer(gl, gl.ARRAY_BUFFER, data.colors, gl.STATIC_DRAW)
  const indexBuffer = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 2, 1, 3]), gl.STATIC_DRAW)
  const buffers = [corners, originBuffer, starBuffer, colorBuffer]
  const layouts: readonly [number, WebGLBuffer, number][] = [
    [0, corners, 2],
    [1, originBuffer, 2],
    [2, starBuffer, 4],
    [3, colorBuffer, 4]
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
    cropScale: requiredUniform(gl, program, 'u_cropScale'),
    cropOffset: requiredUniform(gl, program, 'u_cropOffset'),
    time: requiredUniform(gl, program, 'u_time'),
    twinkleAmplitude: requiredUniform(gl, program, 'u_twinkleAmplitude'),
    twinkleBaseFrequency: requiredUniform(gl, program, 'u_twinkleBaseFrequency'),
    twinkleSpeedMultiplier: requiredUniform(gl, program, 'u_twinkleSpeedMultiplier')
  }
}

export function createWebglStarRenderer(canvas: HTMLCanvasElement, data: MappedStarData): WebglStarRenderer {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true })
  if (!gl) throw new Error('Hero sky WebGL: WebGL2 is unavailable')

  const starCount = data.stars.length / 4

  const starResources = buildStarResources(gl, data)

  const releaseStars = (value: StarResources): void => {
    for (const buffer of value.buffers) gl.deleteBuffer(buffer)
    gl.deleteBuffer(value.indexBuffer)
    gl.deleteVertexArray(value.vao)
    gl.deleteProgram(value.program)
  }

  let viewport: WebglStarViewport | null = null
  let crop: SkyCrop = { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 }
  let destroyed = false

  return {
    resize: (nextViewport) => {
      if (destroyed) return
      viewport = nextViewport
      if (nextViewport.height > 0) {
        crop = computeSkyCrop(nextViewport.width / nextViewport.height)
      }
      canvas.width = Math.max(1, Math.round(nextViewport.width * nextViewport.devicePixelRatio))
      canvas.height = Math.max(1, Math.round(nextViewport.height * nextViewport.devicePixelRatio))
      gl.viewport(0, 0, canvas.width, canvas.height)
    },
    draw: (timeMs) => {
      if (destroyed || !viewport) return
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

      gl.useProgram(starResources.program)
      gl.bindVertexArray(starResources.vao)
      gl.uniform2f(starResources.viewport, Math.max(1, viewport.width), Math.max(1, viewport.height))
      gl.uniform2f(starResources.cropScale, crop.scaleX, crop.scaleY)
      gl.uniform2f(starResources.cropOffset, crop.offsetX, crop.offsetY)
      gl.uniform1f(starResources.time, timeMs / 1_000)
      gl.uniform1f(starResources.twinkleAmplitude, nightSkyConfig.twinkle.amplitude)
      gl.uniform1f(starResources.twinkleBaseFrequency, nightSkyConfig.twinkle.baseFrequency)
      gl.uniform1f(starResources.twinkleSpeedMultiplier, nightSkyConfig.twinkle.speedMultiplier)
      gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, starCount)
      gl.bindVertexArray(null)
    },
    destroy: () => {
      if (destroyed) return
      destroyed = true
      releaseStars(starResources)
    }
  }
}
