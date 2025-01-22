precision mediump float;

attribute vec4 a_position;

void main() {
  gl_Position = a_position;
}

//**

precision mediump float;

uniform vec3 u_resolution;
uniform float u_time;
// uniform float u_moon;

float circle(vec2 p, float r) {
  return length(p) - r;
}

float box(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  vec2 max1 = max(d, 0.0);
  float max2 = max(d.x, d.y);
  float min1 = min(max2, 0.0);
  return length(max1) + min1;
  // return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}


void main() {
  vec2 view = 2.0 * gl_FragCoord.xy - u_resolution.xy;
  float axis = u_resolution.y;
  vec2 field = view / axis;
  vec2 field0 = field;

  float radius = 0.2;
  float c = circle(field, radius);

  vec2 size = vec2(0.5);
  // float b = box(field, size);

  // yellow color
  vec4 color = vec4(0.99, 0.87, 0.20, 1.0);

  // color on outside and fade to nothing transparency at center
  // color *= c;

  // color on outside and fade to white at circle radius (0.2)
  // color /= c;

  // color on outside and stronger gradient but fade to transparency at center
  // color += c;

  // color on inside (white until radius) and fade to transparency on outside
  // color -= c;

  for (int i = 0; i < 2; i++) {
    float x = 1.0 - (float(i) / 10.0);
    float y = 1.0 - (float(i) / 10.0);    
    vec2 offset = vec2(x, y);
    field += offset;
    float b = box(field, size);
    color = mix(color, color / 2.0 , b);
  }

  // for (int i = 0; i < 5; i++) {
  //   float circle = length(field) - radius;
  //   float x = sin((float(i) / 5.0) * u_time);
  //   float y = cos((float(i) / 5.0) * u_time);    

  //   vec2 offset = vec2(x, y);

  //   field += offset / 2.0;
  //   color -= abs(1.0 - circle);
  //   circle = fract(circle) * 1.0;
  //   color = mix(color, color1, circle);
  // }

  gl_FragColor = color;
}