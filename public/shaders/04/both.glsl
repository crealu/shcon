precision mediump float;

attribute vec4 a_position;

void main() {
    gl_Position = a_position;
}

//**

precision mediump float;

uniform vec3 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
// uniform float u_red;

float circle(vec3 p, float s) {
  return length(p) - s;
}

float other(vec3 q) {
  q = abs(q) - vec3(0.2);
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdHexagon(vec2 p, float r)
{
  const vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
  p = abs(p);
  p -= 2.0 * min(dot(k.xy, p.xy), 0.0) * k.xy;
  p -= vec2(clamp(p.x, -k.z * r, k.z * r), r);
  return length(p) * sign(p.y);
}

float map(vec3 p, vec2 m, float t) {
  vec3 position1 = vec3(-1.0, 0.0, -1.0);
  vec3 position2 = vec3(0.0, 0.0, 0.0);
  vec3 position3 = vec3(1.0, 0.0, 1.0);

  float c1 = circle(p - position1, 0.5) * 0.2;
  float c2 = circle(p - position2, 0.5) * 0.2;
  float c3 = circle(p - position3, 0.5) * 0.2;

  // c1 = smoothstep(0.0, c1, 0.5);
  // c2 = smoothstep(0.0, c2, 0.5);
  // c3 = smoothstep(0.0, c3, 0.5);
  p = abs(p) - 0.5; 

  float ground = p.y + 2.1;

  return min(abs(0.012 - min(min(c1, c2), c3)), ground);
}

mat2 rot2D(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  vec2 mo = (u_mouse.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  
  // initialization
  vec3 ro = vec3(0.0, 0.0, -3.0);       // origin
  vec3 rd = normalize(vec3(uv, 1.0));   // direction
  float t = 0.0;                        // total distance traveled
  vec3 col = vec3(0.0);

  // vertical rotation camera
  ro.yz *= rot2D(-mo.y);
  rd.yz *= rot2D(-mo.y); 

  // horizontal rotation camera
  ro.xz *= rot2D(u_time);
  rd.xz *= rot2D(u_time);
  // ro.yz *= rot2D(-mo.y);
  // rd.yz *= rot2D(-mo.y);  

  // z rotation camera
  // ro.xz *= rot2D(u_time/10.0);
  // rd.xz *= rot2D(u_time/10.0);

  // raymarching
  for (float i = 0.0; i < 80.0; i++) {
    vec3 p = ro + rd * t;       // position along the ray
    float d = map(p, mo, u_time);       // current distnace to scene
    t += d;                     // march the ray      
    
    col = vec3(i) / 80.0;

    if (d < 0.001 || t > 100.0) break;
  }

  float r = mo.x;
  float b = abs(mo.y - 1.0);

  col = vec3(0.5, sin(t * 0.2), 0.8);

  gl_FragColor = vec4(col, 1.0);
}