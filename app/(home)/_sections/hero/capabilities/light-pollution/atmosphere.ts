import { frontalContour, frontalSilhouette, frontalSilhouetteGeometry } from '../../landscape'

const { viewBoxWidth, viewBoxHeight, translateY } = frontalSilhouetteGeometry
const heightRange = viewBoxHeight - translateY

/** One filtered height lookup, not a Euclidean SDF or a slope-normalized distance. */
export const terrainShader = `
uniform sampler2D u_contour;
uniform vec4 u_horizon; // sample count, last contour x/y, closing y
uniform vec4 u_terrain;
uniform vec2 u_resolution;
vec2 terrainHeight() {
  vec2 pixel = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);
  vec2 p = (pixel - u_terrain.xy) / u_terrain.zw;
  float edge;
  // The final 0.94-unit closing segment is too steep for a uniform height table.
  if (p.x > u_horizon.y) {
    edge = mix(u_horizon.z, u_horizon.w,
      clamp((p.x - u_horizon.y) / (${viewBoxWidth}.0 - u_horizon.y), 0.0, 1.0));
  } else {
    float u = (clamp(p.x / u_horizon.y, 0.0, 1.0) * (u_horizon.x - 1.0) + 0.5) / u_horizon.x;
    vec2 encoded = texture(u_contour, vec2(u, 0.5)).rg;
    edge = dot(encoded, vec2(256.0, 1.0)) * (255.0 / 65535.0) * ${heightRange}.0 + ${translateY}.0;
  }
  return vec2(edge - p.y, p.x / ${viewBoxWidth}.0);
}
float terrainCoverage(float height) {
  float halfFootprint = max(0.5 * fwidth(height), 0.00001);
  return smoothstep(-halfFootprint, halfFootprint, height);
}`

export const atmosphereVertexShader = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

export const atmosphereFragmentShader = `#version 300 es
precision highp float;
${terrainShader}
uniform vec3 u_atmosphere;
out vec4 out_color;
void main() {
  vec2 terrain = terrainHeight();
  float intensity = u_atmosphere.x;
  float d = terrain.x;
  float source = exp(-pow((terrain.y - 0.52) / (0.2 + 0.48 * intensity), 2.0));
  float height = mix(24.0, 720.0, intensity * intensity);
  float density = exp(-max(d, 0.0) / height) * source * intensity;
  float air = (1.0 - exp(-2.1 * density)) * terrainCoverage(d) * u_atmosphere.y;
  float rimWidth = mix(1.2, 13.0, intensity);
  float rim = exp(-abs(d) / rimWidth) * source * intensity * 0.72 * u_atmosphere.z;
  // Only the continuous rim intentionally spills onto the mountain.
  float alpha = 1.0 - (1.0 - air) * (1.0 - rim);
  vec3 color = mix(vec3(0.965, 0.663, 0.404), vec3(1.0, 0.82, 0.65), rim * 0.45);
  out_color = vec4(color * alpha, alpha);
}`

/** Read shared M/L/H geometry once, retaining precision for the steep closing segment. */
export function createContourVertices(): Float64Array {
  const vertices: number[] = []
  let y = 0
  for (const match of frontalContour.matchAll(/([MLH])([\d.]+)(?: ([\d.]+))?/g)) {
    if (match[1] !== 'H') y = Number(match[3])
    vertices.push(Number(match[2]), y + translateY)
  }
  const closure = frontalSilhouette.d.slice(frontalContour.length).match(/^L([\d.]+) ([\d.]+)/)
  if (closure) vertices.push(Number(closure[1]), Number(closure[2]) + translateY)
  if (vertices.length < 4 || vertices.length > 256) throw new Error('Hero atmosphere: invalid shared contour')
  return new Float64Array(vertices)
}

/** O(samples + vertices), only at initialization. RG8 decodes linearly even across byte carries. */
export function createHorizonLookup(maxTextureSize: number) {
  if (!Number.isInteger(maxTextureSize) || maxTextureSize < 2048)
    throw new Error('Hero atmosphere: insufficient texture size')
  const width = 2048
  const vertices = createContourVertices()
  const last = vertices.length - 4
  const endX = vertices[last]
  const data = new Uint8Array(width * 2)
  let segment = 0
  for (let index = 0; index < width; index += 1) {
    const x = (index * endX) / (width - 1)
    while (segment + 2 < last && vertices[segment + 2] < x) segment += 2
    const fraction = (x - vertices[segment]) / (vertices[segment + 2] - vertices[segment])
    const y = vertices[segment + 1] + fraction * (vertices[segment + 3] - vertices[segment + 1])
    const encoded = Math.round(((y - translateY) / heightRange) * 65535)
    data[index * 2] = encoded >> 8
    data[index * 2 + 1] = encoded & 255
  }
  return { width, data, endX, endY: vertices[last + 1], closingY: vertices[last + 3] }
}

export interface TerrainPlacement {
  readonly left: number
  readonly top: number
  readonly scaleX: number
  readonly scaleY: number
}
