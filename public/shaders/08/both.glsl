precision mediump float;

attribute vec4 a_position;

void main() {
  gl_Position = a_position * 10.0;
}

//**

precision mediump float;

uniform vec3 u_resolution;
uniform float u_time;
uniform float u_moon;

void main() {
  vec2 view = 2.0 * gl_FragCoord.xy - u_resolution.xy;
  float axis = u_resolution.y;
  vec2 field = view / axis;

  float radius = 0.2;
  vec3 color = vec3(0.99, 0.87, 0.20);
  vec3 color1 = vec3(0.86, 0.63, 0.82);

  for (int i = 0; i < 5; i++) {
    float circle = length(field) - radius;
    float x = sin((float(i) / 5.0) * u_time);
    float y = cos((float(i) / 5.0) * u_time);    

    vec2 offset = vec2(x, y);

    field += offset / 2.0;
    color -= abs(1.0 - circle);
    circle = fract(circle) * 1.0;
    color = mix(color, color1, circle);
  }

  gl_FragColor = vec4(color, 1.0);
}