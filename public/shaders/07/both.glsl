precision mediump float;
attribute vec4 a_position;

void main() {
  gl_Position = a_position * 10.0;
}

//**

precision mediump float;

uniform vec3 u_resolution;
uniform float u_time;

vec3 palette(float t) {
  vec3 a = vec3(163.0/255.0, 211.0/255.0, 240.0/255.0);
  vec3 b = vec3(75.0/255.0, 159.0/255.0, 130.0/255.0);
  vec3 c = vec3(235.0/255.0, 187.0/255.0, 97.0/255.0);
  vec3 d = vec3(0.563, 0.816, 0.457);

  // return a + b * cos(3.14 * (c * t + d));
  return a + b * cos(6.28318 * (c * t + d));
}

float circle(vec2 st, float radius) {
  return step(radius * 0.01, dot(st, st) * 3.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  vec2 uv0 = uv;
  vec3 color = vec3(0.0);
  float speed = 0.1;
  float x = 0.9 * sin(speed * u_time);
  float y = -0.9 * cos(speed * u_time);
  vec2 translate = vec2(x, y);

  for (float i = 0.0; i < 4.0; i++) {
    float sign = sin(speed * u_time);

    if (sign > 0.0) {
      uv /= sign;
    } else {
      uv /= sign;
    }
    
    uv += translate;
    uv = fract(uv) - 0.5;

    float d = length(uv) * exp(-length(uv0));
    vec3 col = palette(length(uv0) + i * 0.2 + u_time * 0.4);

    d = sin(d * 8.0 + u_time) / 8.0;
    d = abs(d);
    d = pow(0.005 / d, 1.2);
    
    color += col * d;
  }

  gl_FragColor = vec4(color, 1.0);
}


