#ifdef GL_ES
precision mediump float;
#endif

attribute vec4 a_position;

void main(void) {
  gl_Position = a_position;
}

//**

#ifdef GL_ES
precision mediump float;
#endif

uniform vec3 u_resolution;
uniform float u_time;

vec3 palette(float t) {
  vec3 a = vec3(239.0, 134.0, 52.0) / 255.0;
  vec3 b = vec3(23.0, 230.0, 135.0) / 255.0;
  vec3 c = vec3(233.0, 62.0, 220.0) / 255.0;
  vec3 d = vec3(0.0, 0.5, 1.0);

  return a + b * cos(3.14 * (c * t + d));
}

void main() {
  vec2 view = gl_FragCoord.xy * 2.0 - u_resolution.xy;
  float axis = u_resolution.y;
  vec2 field = view / axis;
  vec2 field0 = field;
  
  vec3 finalColor = vec3(0.0);

  for (float i = 0.0; i < 4.0; i++) {
    field = fract(field * 1.5) - 0.5;

    float d = length(field) * exp(-length(field0));
    vec3 col = palette(length(field0) + i * 0.4 + u_time * 0.4);

    d = tan(d * 8.0 + u_time) / 8.0;
    d = abs(d);
    d = pow(0.01 / d, 1.2);

    finalColor += col * d;
  }

  gl_FragColor = vec4(finalColor, 1.0);
}