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
uniform float u_knob;

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
}

//**

#ifdef GL_ES
precision mediump float;
#endif

uniform vec3 u_resolution;
uniform float u_time;
uniform float u_knob;

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
}

$$$

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
  vec3 c1 = vec3(0.9, 0.0, 0.0);
  vec3 c2 = vec3(1.0, 1.0, 1.0);

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

  vec3 color = vec3(1.0, 1.0, 1.0);

  for (float i = 0.0; i < 4.0; i++) {
    field = fract(field * 1.1) - 0.5;

    dia = length(field) * exp(-length(field0));

    vec3 col = vec3(0.0, 0.0, 0.5);
    col += theme();
    col -= smoothstep(0.1, 0.2 / tlt.x, dia);

    dia = sin(dia * 4.0 * u_time);
    dia = abs(dia);
    dia = pow(0.1 / dia, 1.2);

    color += col * dia;
  }

  gl_FragColor = vec4(color, 1.0);
}

$$$

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

bool with_time = true;

float circle(vec2 p, float r) {
  return length(p) - r;
  // return (length(p) * r) + 0.5;
}

float circle2(vec2 p, float r, vec3 color) {
  return length(p) - r;
}

float box(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float parallelogram(vec2 p, float wi, float he, float sk) {
    vec2 e = vec2(sk, he);
    p = (p.y < 0.0) ? -p : p;
    vec2  w = p - e; 
    w.x -= clamp(w.x, -wi, wi);
    vec2 d = vec2(dot(w, w), -w.y);
    float s = p.x * e.y - p.y * e.x;
    p = (s < 0.0) ? -p : p;
    vec2  v = p - vec2(wi, 0); 
    v -= e * clamp(dot(v, e) / dot(e, e), -1.0, 1.0);
    d = min(d, vec2(dot(v, v), wi * he - abs(s)));
    return sqrt(d.x) * sign(-d.y);
}

float noise(vec2 p) {
  return sin(p.x) * sin(p.y);
}

vec3 shadow(vec3 color, float shape) {
  for (float i = 1.0; i < 4.0; i++) {
    float co = 8.0 * sin(u_time/10.0) * cos(u_time);
    float d = dot(co, shape);
    color /= smoothstep(0.1, 0.15, shape);
    color = mix(color, vec3(0.8, 0.5, 0.3), d);
  }
  return color;
}

vec3 mf(vec2 field, vec3 color) {
  float s = 0.101;
  float fs = 0.1;

  field += vec2(0.5, 0.3);
  float c = circle2(field, 0.2, color);
  color *= smoothstep(0.1, s, c);
  color = shadow(color, c);
  field -= vec2(0.7, 0.0);

  field += vec2(0.55, -0.4);
  float b1 = box(field, vec2(0.05, 0.4));
  color *= smoothstep(0.1, s, b1);
  color = shadow(color, b1);
  field -= vec2(0.55, -0.4);

  field += vec2(-0.2, -0.4);
  float b2 = box(field, vec2(0.05, 0.4));
  color *= smoothstep(0.1, s, b2);
  color = shadow(color, b2);
  field -= vec2(-0.2, 0.4);

  field += vec2(0.0, 0.2);
  float p1 = parallelogram(field, 0.05, 0.2, 0.15);
  color *= smoothstep(0.1, s, p1);
  color = shadow(color, p1);
  field -= vec2(0.0, 0.2);

  field += vec2(0.35, 0.2);
  float p2 = parallelogram(field, 0.05, 0.2, -0.15);
  color *= smoothstep(0.1, s, p2);
  color = shadow(color, p2);
  field -= vec2(0.35, 0.2);
  
  field += vec2(-0.4, 0.4);
  float b3 = box(field, vec2(0.15, 0.025));
  color *= smoothstep(0.1, s, b3);
  color = shadow(color, b3);
  field -= vec2(-0.4, 0.4);

  field += vec2(-0.4, 0.025);
  float b4 = box(field, vec2(0.15, 0.025));
  color *= smoothstep(0.1, s, b4);
  color = shadow(color, b4);

  return color;
}

void main() {
  vec2 view = 2.0 * gl_FragCoord.xy - u_resolution.xy;
  float axis = u_resolution.y;
  vec2 field = view / axis;

  vec3 color = vec3(0.5, 0.0, 0.0);
  color = mf(field, color);

  for (float i = 1.0; i < 2.0; i++) {
    // field = fract(field * 1.5) - 0.5;
    // float co = sin(fract(field.x * field.y) * 4.0 + u_time) / 8.0;
    float d = dot(cos(u_time), field.x*field.y);
    // color += smoothstep(0.1, 0.2, co);
    color = mix(color, vec3(0.0, 0.0, 0.5), d);
  }
  
  gl_FragColor = vec4(color, 1.0);
}

$$$

precision mediump float;

attribute vec4 a_position;

void main() {
    gl_Position = a_position;
}

//**

precision mediump float;

uniform vec3 u_resolution;
uniform float u_time;

vec2 setOffset(float q, float x, float y) {
    vec2 offset = vec2(0.0);

    if (q == 1.0)
        offset = vec2(x, y);
    else if (q == 2.0)
        offset = vec2(-x, y);
    else if (q == 3.0)
        offset = vec2(x, -y * 2.0);
    else if (q == 4.0)
        offset = vec2(-x, -y);

    return offset;
}

vec3 eclipse(vec2 f, vec3 c, float q) {
    float radius = 0.1;
    float speed = 10.0;
    float br = 0.01;

    for (int i = 0; i < 5; i++) {
        float circle = length(f) - radius;
        circle /= 0.5;
        float x = sin((float(i) / speed) * u_time);
        float y = cos((float(i) / speed) * u_time);
        vec2 offset = setOffset(q, x, y);
        circle = fract(circle) * 4.0;
        f += offset;
        c /= circle;
    }

    return c;
}

void main() {
    vec2 view = 2.0 * gl_FragCoord.xy - u_resolution.xy;
    float axis = u_resolution.y;
    vec2 field = view / axis;
    vec2 field0 = field;

    vec3 color = vec3(
        0.99,
        abs(0.67-sin(u_time)/2.0),
        abs(0.67-cos(u_time)/2.0)
    );

    color = eclipse(field, color, 1.0);
    color = eclipse(field0, color, 2.0);
    color = eclipse(field0, color, 3.0);
    color = eclipse(field0, color, 4.0);

    gl_FragColor = vec4(color, 1.0);
}

$$$

precision highp float;

attribute vec4 a_position;

void main() {
    gl_Position = a_position;
}

//**

precision highp float;

uniform vec3 u_resolution;
uniform float u_time;
uniform float u_moon;

vec2 setOffset(float q, float x, float y) {
    vec2 offset = vec2(0.0);

    if (q == 1.0)
        offset = vec2(x, y);
    else if (q == 2.0)
        offset = vec2(-x, y);
    else if (q == 3.0)
        offset = vec2(x, -y);
    else if (q == 4.0)
        offset = vec2(-x, -y);

    return offset;
}

vec3 eclipse(vec2 f, vec3 c, float q) {
    float speed = 5.0;
    float radius = 0.2 - abs(0.2 - (0.2 * sin(u_time)));
    float br = 0.01;

    for (int i = 0; i < 5; i++) {
        float circle = length(f) - radius;
        float x = sin((float(i) / speed) * u_time);
        float y = cos((float(i) / speed) * u_time);
        vec2 offset = setOffset(q, x, y);
        circle = fract(circle) * 3.0;
        f += offset;
        c *= 1.0 - (0.5 / circle);
        // c /= circle;
    }

    return c;
}

void main() {
    vec2 view = 2.0 * gl_FragCoord.xy - u_resolution.xy;
    float axis = u_resolution.x;
    vec2 field = view / axis;
    vec2 field0 = field;

    vec3 color = vec3(
        abs(0.67-sin(u_time)/2.0),
        0.99,
        abs(0.67-cos(u_time)/2.0)
    );

    color = eclipse(field, color, 1.0);
    // color = eclipse(field, color, 2.0);
    // color = eclipse(field, color, 3.0);
    color = eclipse(field, color, 4.0);

    gl_FragColor = vec4(color, 0.5);
}

$$$

precision highp float;

attribute vec4 a_position;

void main() {
    gl_Position = a_position;
}

//**

precision mediump float;

uniform vec3 u_resolution;
uniform float u_time;
uniform float u_moon;

vec2 setOffset(float q, float x, float y) {
    vec2 offset = vec2(0.0);

    if (q == 1.0)
        offset = vec2(x, y);
    else if (q == 2.0)
        offset = vec2(-x, y);
    else if (q == 3.0)
        offset = vec2(x, -y);
    else if (q == 4.0)
        offset = vec2(-x, -y);

    return offset;
}

vec3 eclipse(vec2 f, vec3 c, float q) {
    float radius = 0.1;
    float speed = 5.0;  // Slower speed
    float br = 0.01;

    for (int i = 0; i < 5; i++) {
        float circle = length(f) - radius;
        float x = sin((float(i) / speed) * u_time);
        float y = cos((float(i) / speed) * u_time);
        vec2 offset = setOffset(q, x, y);
        circle = fract(circle) * 3.0; // Slightly different circle calculation
        f += offset;
        c /= circle;
    }

    return c;
}

void main() {
    vec2 view = 2.0 * gl_FragCoord.xy - u_resolution.xy;
    float axis = u_resolution.y;
    vec2 field = view / axis;
    vec2 field0 = field;

    vec3 color = vec3(
        0.8,
        abs(0.5 - sin(u_time) / 1.5), // Different color calculation
        abs(0.5 - cos(u_time) / 1.5)
    );

    color = eclipse(field, color, 1.0);
    color = eclipse(field0, color, 2.0);
    color = eclipse(field0, color, 3.0);
    color = eclipse(field0, color, 4.0);

    gl_FragColor = vec4(color, 1.0);
}

$$$

precision highp float;

attribute vec4 a_position;

void main() {
    gl_Position = a_position;
}

//**

precision mediump float;

uniform vec3 u_resolution;
uniform float u_time;
uniform float u_moon;

vec2 setOffset(float q, float x, float y) {
    vec2 offset = vec2(0.0);

    if (q == 1.0)
        offset = vec2(x, y);
    else if (q == 2.0)
        offset = vec2(-x, y);
    else if (q == 3.0)
        offset = vec2(x, -y);
    else if (q == 4.0)
        offset = vec2(-x, -y);
    else if (q == 5.0)  // Extra offset
        offset = vec2(0.0, -y);

    return offset;
}

vec3 eclipse(vec2 f, vec3 c, float q) {
    float radius = 0.1;
    float speed = 10.0;
    float br = 0.01;

    for (int i = 0; i < 6; i++) {
        float circle = length(f) - radius;
        float x = sin((float(i) / speed) * u_time);
        float y = cos((float(i) / speed) * u_time);
        vec2 offset = setOffset(q, x, y);
        circle = fract(circle) * 5.0;
        f += offset;
        c /= circle;
    }

    return c;
}

void main() {
    vec2 view = 2.0 * gl_FragCoord.xy - u_resolution.xy;
    float axis = u_resolution.y;
    vec2 field = view / axis;
    vec2 field0 = field;

    vec3 color = vec3(
        0.9,
        abs(0.55 - sin(u_time) / 2.0),
        abs(0.55 - cos(u_time) / 2.0)
    );

    color = eclipse(field, color, 1.0);
    color = eclipse(field0, color, 2.0);
    color = eclipse(field0, color, 3.0);
    color = eclipse(field0, color, 4.0);
    color = eclipse(field0, color, 5.0);  // Extra eclipse pass

    gl_FragColor = vec4(color, 1.0);
}
