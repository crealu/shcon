#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.1415926

uniform vec3 u_resolution;
uniform float u_time;
uniform float u_knob;

vec3 palette(float t) {
  vec3 a = vec3(239.0, 134.0, 52.0) / 255.0;
  vec3 b = vec3(233.0, 73.0, 135.0) / 255.0;
  vec3 c = vec3(233.0, 62.0, 50.0) / 255.0;
  vec3 d = vec3(0.0, 1.0, 1.0);

  return a + b * cos(3.14 * (c * t + d));
}

void main() {
  vec2 view = gl_FragCoord.xy * 2.0 - u_resolution.xy;
  float axis = u_resolution.y;
  vec2 uv = view / axis;
  vec2 uv0 = uv;
  
  vec3 finalColor = vec3(0.0);

  for (float i = 0.0; i < 4.0; i++) {
    uv = fract(uv * 1.5) - 0.5;

    float d = length(uv) * exp(-length(uv0));
    vec3 col = palette(length(uv0) + i * 0.4 + u_time * 0.4);

    d = tan(d * 8.0 + u_time) / 8.0;
    d = abs(d);
    d = pow(0.01 / d, 1.2);

    finalColor += col * d;
  }

  gl_FragColor = vec4(finalColor, 1.0);