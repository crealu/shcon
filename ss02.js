const vs = `
precision mediump float;
attribute vec4 a_position;

void main() {
  gl_Position = a_position * 10.0;
}
`;

const fs = `
precision mediump float;

uniform vec3 u_resolution;
uniform float u_time;

vec3 palette(float t) {
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.763, 0.416, 0.357);

  return a + b * cos(3.14 * (c * t + d));
  // return a + b * cos(6.28318 * (c * t + d));
}

float circle(vec2 st, float radius) {
  return fract(step((radius * 0.001), dot(st, st) * 3.0) * 0.25);
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  vec2 uv0 = uv;
  vec3 finalColor = vec3(0.0);
  float speed = 0.1;
  float x = 0.9 * sin(speed * u_time);
  float y = -0.9 * cos(speed * u_time);
  vec2 translate = vec2(x, y);

  for (float i = 0.0; i < 4.0; i++) {
    uv /= tan(speed * u_time) * circle(uv, 0.001);
    uv = (fract(uv * 0.5) - 0.5);

    float d = length(uv) * exp(-length(uv0));
    vec3 col = palette(length(uv0) + i * 0.4 + u_time * 0.4);

    d = sin(d * 8.0 - u_time) / 8.0;
    d = abs(d);
    d = pow(0.005 / d, 1.2);
    
    finalColor += col * d;
  }

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

// vec2 uv = gl_FragCoord.xy / u_resolution.xy * 2.0 - 1.0;
// d = step(0.0, 0.1, d);
// uv.x *= u_resolution.x / u_resolution.y;
// uv = uv - 0.5 * 2.0;
// float red = 1.0;
// float blue = 0.0;

// if (u_time > 5.0) {
//   for (float i = 0.0; i < 1.0; i += 0.01) {
//     red = red + finalColor.x * (1.0 - i * u_time);
//     blue = blue + finalColor.x * (0.0 + i * u_time);
//   }
// } else {
//   for (float i = 0.0; i < 1.0; i += 0.01) {
//     blue = blue + finalColor.x * (1.0 - i * u_time);
//     red = red + finalColor.x * (0.0 + i * u_time);
//   }
// }

