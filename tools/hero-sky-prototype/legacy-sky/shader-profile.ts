/** Historical offline export data only; no WebGL implementation or lifecycle. */
export const vertexShader = `#version 300 es
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

export const fragmentShader = `#version 300 es
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
