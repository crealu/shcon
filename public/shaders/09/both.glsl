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
  vec3 a1 = vec3(0.5, 0.5, 0.5);
  vec3 b1 = vec3(0.5, 0.1, 0.5);
  vec3 c1 = vec3(0.2, 1.0, 1.0);
  vec3 d1 = vec3(0.0, 1.0, 1.0);

  vec3 a = vec3(154.0/255.0, 212.0/255.0, 240.0/255.0);
  vec3 b = vec3(76.0/255.0, 159.0/255.0, 130.0/255.0);
  vec3 c = vec3(253.0/255.0, 221.0/255.0, 52.0/255.0);
  vec3 d = vec3(148.0/255.0, 47.0/255.0, 89.0/255.0);
  vec3 e = vec3(235.0/255.0, 73.0/255.0, 134.0/255.0);
  vec3 f = vec3(233.0/255.0, 63.0/255.0, 51.0/255.0);
  vec3 g = vec3(237.0/255.0, 187.0/255.0, 98.0/255.0);
  vec3 h = vec3(239.0/255.0, 134.0/255.0, 52.0/255.0);

  return a1 + b * cos(3.14 * (c1 * t + d1));
}

vec3 palette2(float t) {
  return .5+.5*cos(6.28318*(t+vec3(.3,.416,.557)));
}

vec3 palette3(float t) {
  return .5+.5*cos(6.28318*(t+vec3(.5,.716,.557)));
}

// distance to scene
float map(vec3 p, float ti) {
  p.z += ti * 0.4;

  p.xy = (fract(p.xy) - 0.5);
  p.z = mod(p.z, 0.25) - 0.125;
  // p = fract(p) - 0.5;

  float box = sdOctahedron(p, 0.15);

  return box;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  vec2 m = (u_mouse.xy * 2.0 - u_resolution.xy) / u_resolution.y;

  // initialization
  vec3 ro = vec3(0.0, 0.0, -3.0);       // origin
  vec3 rd = normalize(vec3(uv, 1.0));   // direction
  vec3 col = vec3(0);                   // color
  float t = 0.0;                        // total distance traveled


  // vertical rotation camera
  ro.yz *= rot2D(-m.y);
  rd.yz *= rot2D(-m.y);  

  // horizontal rotation camera
  ro.xz *= rot2D(-m.x + u_time/10.0);
  rd.xz *= rot2D(-m.x + u_time/10.0);  

  // ro.xz *= rot2D(-m.x);
  // rd.xz *= rot2D(-m.x);
  
  // default circular motion
  m = vec2(cos(u_time) * 0.2, sin(u_time) * 0.2);
  // if (u_mouse.z < 0.0);

  // raymarching
  float x = 0.0;
  for (float x = 0.0; x < 80.0; x++) {
    vec3 p = ro + rd * t;       // position along the ray

    p.xy *= rot2D(t * 0.2 + m.x);
    p.y += sin(t*(m.y + 1.0) * 0.5) * 0.35;

    float d = map(p, u_time);   // current distnace to scene
    t += d;                     // march the ray      

    // col = vec3(x) / 80.0;

    if (d < 0.001 || t > 100.0) break;
  }

  col = palette3(t * 0.04 + float(x) * 0.005);

  gl_FragColor = vec4(col, 1.0);
}