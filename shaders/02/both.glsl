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

vec2 translate(float time) {
  float mag = 4.0;
  float x = sin(time) / mag;
  float y = cos(time) / mag;
  return vec2(x, y);
}

vec3 theme() {
  vec3 c1 = vec3(0.0, 0.0, 0.5);
  vec3 c2 = vec3(0.6, 0.0, 0.3);

  return c1 + cos(3.14 * c2);
}

void main() {
  vec2 view = 2.0 * gl_FragCoord.xy - u_resolution.xy;
  float axis = u_resolution.x;
  vec2 field = view / axis;
  vec2 field0 = field;

  vec2 tlt = translate(u_time);
  // vec2 center = vec2(0.5, 0.5);
  // field = fract(field * 1.5);
  // field -= center;
  // field -= tlt;


  float dia = length(field);

  vec3 color = vec3(0.0, 0.0, 1.0);

  for (float i = 0.0; i < 4.0; i++) {
    field = fract(field * 1.1) - 0.5;

    dia = length(field) * exp(-length(field0));

    vec3 col = vec3(0.4, 0.1, 0.8);
    col += theme();
    col -= smoothstep(0.1, 0.2 / tlt.x, dia);

    dia = sin(dia * 4.0 * u_time);
    dia = abs(dia);
    dia = pow(0.1 / dia, 1.2);

    color += col * dia;
  }


  gl_FragColor = vec4(color, 1.0);
}