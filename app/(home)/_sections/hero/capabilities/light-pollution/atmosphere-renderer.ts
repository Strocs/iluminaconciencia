import {
  atmosphereFragmentShader,
  atmosphereVertexShader,
  createHorizonLookup,
  type TerrainPlacement
} from './atmosphere'

export interface AtmosphereViewport {
  readonly width: number
  readonly height: number
  readonly devicePixelRatio: number
}

export interface AtmosphereRenderer {
  resize(viewport: AtmosphereViewport, terrain: TerrainPlacement): void
  draw(intensity: number): boolean
  destroy(): void
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Hero atmosphere: shader allocation failed')
  try {
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(`Hero atmosphere: shader compilation failed: ${gl.getShaderInfoLog(shader)}`)
    }
    return shader
  } catch (error) {
    gl.deleteShader(shader)
    throw error
  }
}

/** Owns only the atmosphere context: one triangle, one immutable RG8 lookup, no animation clock. */
export function createAtmosphereRenderer(canvas: HTMLCanvasElement): AtmosphereRenderer {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true })
  if (!gl) throw new Error('Hero atmosphere: WebGL2 is unavailable')
  const releases: (() => void)[] = []
  const destroyResources = () =>
    releases
      .splice(0)
      .reverse()
      .forEach((release) => release())
  const uniform = (program: WebGLProgram, name: string) => {
    const location = gl.getUniformLocation(program, name)
    if (location === null) throw new Error(`Hero atmosphere: uniform ${name} is unavailable`)
    return location
  }
  let program: WebGLProgram
  let vao: WebGLVertexArrayObject
  let terrainUniform: WebGLUniformLocation
  let resolution: WebGLUniformLocation
  let atmosphere: WebGLUniformLocation
  try {
    const allocatedProgram = gl.createProgram()
    if (!allocatedProgram) throw new Error('Hero atmosphere: program allocation failed')
    program = allocatedProgram
    releases.push(() => gl.deleteProgram(allocatedProgram))
    const shaders: WebGLShader[] = []
    try {
      shaders.push(compileShader(gl, gl.VERTEX_SHADER, atmosphereVertexShader))
      shaders.push(compileShader(gl, gl.FRAGMENT_SHADER, atmosphereFragmentShader))
      shaders.forEach((shader) => gl.attachShader(program, shader))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(`Hero atmosphere: shader linking failed: ${gl.getProgramInfoLog(program)}`)
      }
    } finally {
      shaders.forEach((shader) => gl.deleteShader(shader))
    }
    const allocatedVao = gl.createVertexArray()
    if (!allocatedVao) throw new Error('Hero atmosphere: vertex array allocation failed')
    vao = allocatedVao
    releases.push(() => gl.deleteVertexArray(allocatedVao))
    const texture = gl.createTexture()
    if (!texture) throw new Error('Hero atmosphere: texture allocation failed')
    releases.push(() => gl.deleteTexture(texture))
    const horizon = createHorizonLookup(gl.getParameter(gl.MAX_TEXTURE_SIZE))
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG8, horizon.width, 1, 0, gl.RG, gl.UNSIGNED_BYTE, horizon.data)
    gl.useProgram(program)
    gl.uniform1i(uniform(program, 'u_contour'), 0)
    gl.uniform4f(uniform(program, 'u_horizon'), horizon.width, horizon.endX, horizon.endY, horizon.closingY)
    terrainUniform = uniform(program, 'u_terrain')
    resolution = uniform(program, 'u_resolution')
    atmosphere = uniform(program, 'u_atmosphere')
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.clearColor(0, 0, 0, 0)
    if (gl.getError() !== gl.NO_ERROR) throw new Error('Hero atmosphere: resource initialization failed')
  } catch (error) {
    destroyResources()
    throw error
  }

  let destroyed = false
  let sized = false
  return {
    resize: (viewport, terrain) => {
      if (destroyed || !(viewport.width > 0) || !(viewport.height > 0)) return
      const width = Math.max(1, Math.round(viewport.width * viewport.devicePixelRatio))
      const height = Math.max(1, Math.round(viewport.height * viewport.devicePixelRatio))
      if (canvas.width !== width) canvas.width = width
      if (canvas.height !== height) canvas.height = height
      gl.viewport(0, 0, width, height)
      gl.useProgram(program)
      gl.uniform2f(resolution, width, height)
      const scaleX = width / viewport.width
      const scaleY = height / viewport.height
      gl.uniform4f(
        terrainUniform,
        terrain.left * scaleX,
        terrain.top * scaleY,
        terrain.scaleX * scaleX,
        terrain.scaleY * scaleY
      )
      sized = true
    },
    draw: (intensity) => {
      if (destroyed || !sized || gl.isContextLost()) return false
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(program)
      gl.bindVertexArray(vao)
      gl.uniform3f(atmosphere, intensity, 1, 1)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      gl.bindVertexArray(null)
      return !gl.isContextLost() && gl.getError() === gl.NO_ERROR
    },
    destroy: () => {
      if (destroyed) return
      destroyed = true
      destroyResources()
    }
  }
}
