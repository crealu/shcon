precision mediump float;

attribute vec4 a_position;

void main(void) {
  gl_Position = a_position;
}

//**

precision mediump float;

uniform vec3 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec3 u_color;
uniform float u_scheme;

float sdSphere(vec3 p, float s) {
  return length(p) - s;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdOctahedron(vec3 p, float s) {
  p = abs(p);
  return (p.x + p.y + p.z - s) * 0.57735027;
}

// smooth minimum creates a union between shapes
float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * h * k * (1.0 / 6.0);
}

mat2 rot2D(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

vec3 palette1(float t) {
  vec3 a = vec3(0.6, 0.5, 0.4);
  vec3 b = vec3(0.5, 0.2, 0.7);
  vec3 c = vec3(0.2, 0.7, 1.0);
  vec3 d = vec3(0.0, 1.0, 1.0);

  return a + b * cos(3.14 * (c * t + d));
}

vec3 palette2(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.3, 0.416, 0.557)));
}

vec3 palette3(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.5, 0.716, 0.557)));
}

vec3 palette4(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.55, 0.0, 1.0)));
}

// distance to scene
float map(vec3 p, float ti) {
  p.z += ti * 0.4;

  p.xy = (fract(p.xy) - 0.5);
  p.z = mod(p.z, 0.25) - 0.125;
  // p = fract(p) - 0.5;

  // float box = sdOctahedron(p, 0.15);
  // float box = sdBox(p, vec3(0.15));
  // float pi = 3.1415;
  // float frequency = 10.0;
  // float fluc = 0.5 * (1.0 + sin(2 * pi * 10.0 * u_time));
  
  float size = 0.09;
  // float size = 0.5 * sin(ti / 2.0);
  float box = sdSphere(p, size);

  return box;
}

void main() {
  vec2 view = 2.0 * gl_FragCoord.xy - u_resolution.xy;
  float axis = u_resolution.y;
  vec2 field = view / axis;
  vec2 field0 = field;

  vec2 m = (u_mouse.xy * 2.0 - u_resolution.xy) / u_resolution.y;

  // initialization
  vec3 ro = vec3(0.0, 0.0, -3.0);         // origin
  vec3 rd = normalize(vec3(field, 1.0));  // direction
  vec3 col = vec3(0);                     // color
  float t = 0.0;                          // total distance traveled

  // horizontal rotation camera
  ro.xy *= rot2D(-m.x + u_time / 10.0);
  // rd.xy *= rot2D(-m.x + u_time / 10.0);

  // ro.xy *= rot2D(-m.y + u_time / 10.0);
  // rd.xy *= rot2D(-m.y + u_time / 10.0);

  // default circular motion
  // m = vec2(cos(u_time) * 0.2, sin(u_time) * 0.2);

  // ray marching
  float x = 0.0;
  for (float x = 0.0; x < 80.0; x++) {
    vec3 p = ro + rd * t;       // position along the ray

    // p.zy *= rot2D(t * 0.2 + m.x);
    p.xz *= rot2D(m.x);
    p.y += sin(t * (m.y + 1.0) * 0.5) * 0.35;

    float d = map(p, u_time);   // current distnace to scene
    t += d;                     // march the ray      

    if (d < 0.001 || t > 100.0) break;
  }
  
  col = palette2(t * 0.04 + float(x) * 0.005);

  gl_FragColor = vec4(col, 1.0);
}