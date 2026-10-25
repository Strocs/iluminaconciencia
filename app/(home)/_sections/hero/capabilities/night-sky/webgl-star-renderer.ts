import { nightSkyConfig } from './config'
import type { MappedStarData } from './star-mapper'
import type { SkyCrop } from './sky-crop'

export interface WebglStarViewport {
  readonly width: number
  readonly height: number
  readonly devicePixelRatio: number
}

export interface WebglStarRenderer {
  resize(viewport: WebglStarViewport, crop: SkyCrop): void
  draw(timeMs: number): boolean
  destroy(): void
}

interface StarResources {
  readonly program: WebGLProgram
  readonly vao: WebGLVertexArrayObject
  readonly buffers: readonly WebGLBuffer[]
  readonly originBuffer: WebGLBuffer
  readonly starBuffer: WebGLBuffer
  readonly colorBuffer: WebGLBuffer
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
  data: Float32Array | Uint16Array | number,
  usage: number
): WebGLBuffer => {
  const buffer = gl.createBuffer()
  if (!buffer) throw new Error('Hero sky WebGL: buffer allocation failed')
  gl.bindBuffer(target, buffer)
  if (typeof data === 'number') gl.bufferData(target, data, usage)
  else gl.bufferData(target, data, usage)
  return buffer
}

const buildStarResources = (gl: WebGL2RenderingContext, data: MappedStarData): StarResources => {
  const program = createProgram(gl, vertexShader, fragmentShader)
  const vao = gl.createVertexArray()
  if (!vao) throw new Error('Hero sky WebGL: vertex array allocation failed')
  gl.bindVertexArray(vao)
  const corners = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  // Reserve full capacity once; resize uploads only the selected instance prefix.
  const originBuffer = createBuffer(gl, gl.ARRAY_BUFFER, data.origins.byteLength, gl.DYNAMIC_DRAW)
  const starBuffer = createBuffer(gl, gl.ARRAY_BUFFER, data.stars.byteLength, gl.DYNAMIC_DRAW)
  const colorBuffer = createBuffer(gl, gl.ARRAY_BUFFER, data.colors.byteLength, gl.DYNAMIC_DRAW)
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
    originBuffer,
    starBuffer,
    colorBuffer,
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
  const visibleOrigins = new Float32Array(data.origins.length)
  const visibleStars = new Float32Array(data.stars.length)
  const visibleColors = new Float32Array(data.colors.length)
  const amplitude = nightSkyConfig.twinkle.amplitude
  const maximumTwinkle = Math.abs(1 - amplitude) + Math.abs(amplitude)
  let visibleStarCount = 0

  const starResources = buildStarResources(gl, data)

  // This renderer owns the context; blending and twinkle configuration stay constant.
  gl.useProgram(starResources.program)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.clearColor(0, 0, 0, 0)
  gl.uniform1f(starResources.twinkleAmplitude, nightSkyConfig.twinkle.amplitude)
  gl.uniform1f(starResources.twinkleBaseFrequency, nightSkyConfig.twinkle.baseFrequency)
  gl.uniform1f(starResources.twinkleSpeedMultiplier, nightSkyConfig.twinkle.speedMultiplier)

  const releaseStars = (value: StarResources): void => {
    for (const buffer of value.buffers) gl.deleteBuffer(buffer)
    gl.deleteBuffer(value.indexBuffer)
    gl.deleteVertexArray(value.vao)
    gl.deleteProgram(value.program)
  }

  let viewport: WebglStarViewport | null = null
  let destroyed = false

  return {
    resize: (nextViewport, nextCrop) => {
      if (destroyed || !(nextViewport.width > 0) || !(nextViewport.height > 0)) return
      viewport = nextViewport
      canvas.width = Math.max(1, Math.round(nextViewport.width * nextViewport.devicePixelRatio))
      canvas.height = Math.max(1, Math.round(nextViewport.height * nextViewport.devicePixelRatio))
      gl.viewport(0, 0, canvas.width, canvas.height)
      // Projection uniforms change with the viewport, not with animation time.
      gl.useProgram(starResources.program)
      gl.uniform2f(starResources.viewport, Math.max(1, nextViewport.width), Math.max(1, nextViewport.height))
      gl.uniform2f(starResources.cropScale, nextCrop.scaleX, nextCrop.scaleY)
      gl.uniform2f(starResources.cropOffset, nextCrop.offsetX, nextCrop.offsetY)

      // Keep any quad that can touch the viewport during its entire twinkle cycle.
      const width = Math.max(1, nextViewport.width)
      const height = Math.max(1, nextViewport.height)
      visibleStarCount = 0
      for (let index = 0; index < starCount; index += 1) {
        const originIndex = index * 2
        const starIndex = index * 4
        const x = (data.origins[originIndex] * nextCrop.scaleX - nextCrop.offsetX) * width
        const y = (data.origins[originIndex + 1] * nextCrop.scaleY - nextCrop.offsetY) * height
        // One CSS-pixel guard preserves edge coverage despite floating-point rounding.
        const margin = data.stars[starIndex + 1] * maximumTwinkle + 1
        if (x + margin < 0 || x - margin > width || y + margin < 0 || y - margin > height) continue

        const targetOrigin = visibleStarCount * 2
        const targetStar = visibleStarCount * 4
        visibleOrigins[targetOrigin] = data.origins[originIndex]
        visibleOrigins[targetOrigin + 1] = data.origins[originIndex + 1]
        // Copy existing attributes in source order; never reseed retained stars.
        for (let component = 0; component < 4; component += 1) {
          visibleStars[targetStar + component] = data.stars[starIndex + component]
          visibleColors[targetStar + component] = data.colors[starIndex + component]
        }
        visibleStarCount += 1
      }
      if (visibleStarCount > 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, starResources.originBuffer)
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, visibleOrigins, 0, visibleStarCount * 2)
        gl.bindBuffer(gl.ARRAY_BUFFER, starResources.starBuffer)
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, visibleStars, 0, visibleStarCount * 4)
        gl.bindBuffer(gl.ARRAY_BUFFER, starResources.colorBuffer)
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, visibleColors, 0, visibleStarCount * 4)
      }
    },
    draw: (timeMs) => {
      if (destroyed || !viewport || gl.isContextLost()) return false
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.useProgram(starResources.program)
      gl.bindVertexArray(starResources.vao)
      gl.uniform1f(starResources.time, timeMs / 1_000)
      gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, visibleStarCount)
      gl.bindVertexArray(null)
      // Context loss still triggers fallback without synchronizing GPU diagnostics per frame.
      return !gl.isContextLost()
    },
    destroy: () => {
      if (destroyed) return
      destroyed = true
      releaseStars(starResources)
    }
  }
}
