#ifdef GL_ES
precision mediump float;
#endif

uniform vec3 u_resolution;
uniform float u_time;

uniform float u_offset;
uniform float u_axis;
uniform float u_size;
uniform vec3 u_color;


void main() {
  // declarations
  vec2 view = gl_FragCoord.xy * u_offset - u_resolution.xy;

  float axis = u_resolution.y;

  if (u_axis == 1.0) {
    axis = u_resolution.x;
  }

  vec2 field = view / axis;

  float shape = length(field) - u_size;

  vec3 color = vec3(u_color);

  // operations
  color += color * shape;

  // output
  gl_FragColor = vec4(color, 1.0);
}