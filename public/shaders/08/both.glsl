precision mediump float;

attribute vec4 a_position;

void main() {
  gl_Position = a_position;
}

//**

precision mediump float;

uniform vec3 u_resolution;
uniform float u_time;
uniform float u_mode;

float box(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  vec2 max1 = max(d, 0.0);
  float max2 = max(d.x, d.y);
  float min1 = min(max2, 0.0);
  return length(max1) + min1;
}

void main() {
  vec2 view = 2.0 * gl_FragCoord.xy - u_resolution.xy;
  float axis = u_resolution.y;
  vec2 field = view / axis;
  vec2 field0 = field;

  float radius = 0.2;

  vec2 size = vec2(0.5);
  float b = box(field, size);

  // yellow color
  vec4 color = vec4(0.99, 0.87, 0.20, 1.0);

  if (u_mode == 0.0) {
    color *= smoothstep(0.05, 0.051, b);
  } else if (u_mode == 1.0) {
    color *= smoothstep(0.05, 0.05 + abs(0.059 - cos(u_time)), fract(b) * 3.0);
  } else if (u_mode == 2.0) {
    color *= smoothstep(0.05 * sin(u_time), 0.05 + abs(0.059 - cos(u_time)), fract(b) * 3.0);
  } else {
    color *= smoothstep(0.05, 0.051, fract(b) * 3.0);
  }

  gl_FragColor = color;
}