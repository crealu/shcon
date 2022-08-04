const vertShader = `
#ifdef GL_ES
precision mediump float;
#endif

attribute vec4 vertPosition;
uniform mat4 projection;
uniform mat4 view;

void main(void) {
  gl_Position = projection * view * vertPosition;
}
`;

const fragShader = `
#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.1415926

vec2 resolution;
uniform float ctime;
uniform float val;

vec2 rotate2D(vec2 _st, float _angle) {
  _st -= 0.5;
  _st = mat2(
    cos(_angle), -sin(_angle), sin(_angle), cos(_angle)
  ) * _st;
  _st += 0.5;
  return _st;
}

vec2 tile(vec2 _st, float _zoom) {
  _st *= _zoom;
  return fract(_st);
}

vec2 rotateTilePattern(vec2 _st) {
    _st *= 2.0;

    float index = 0.0;
    index += step(1.0, mod(_st.x, 2.0));
    index += step(1.0, mod(_st.y, 2.0)) * 2.0;

    _st = fract(_st);

    if (index == 1.0) {
        _st = rotate2D(_st, PI * 0.5);
    } else if (index == 2.0) {
        _st = rotate2D(_st, PI * val);
    } else if (index == 3.0) {
        _st = rotate2D(_st, PI * val/3.0);
    }

    return _st;
}

void main() {
  resolution = vec2(600.0, 600.0);
  vec2 st = gl_FragCoord.xy / resolution.xy;

  st = tile(st, 0.25);
  st = rotateTilePattern(st);

  // Make more interesting combinations
  //st = tile(st, 2.0);
  //st = rotate2D(st, -PI * ctime * 0.25);
  st = rotateTilePattern(st * 2.0);
  //st = rotate2D(st, PI * ctime * 0.55);

  gl_FragColor = vec4(vec3(step(st.x, st.y)), 1.0);
}`;

const particleUpdateVS = `
precision mediump float;

uniform float u_TimeDelta;
uniform sampler2D u_RgNoise;
uniform vec2 u_Gravity;
uniform vec2 u_Origin;

uniform float u_MinTheta;
uniform float u_MaxTheta;

uniform float u_MinSpeed;
uinform float u_MaxSpeed;

in vec2 i_Position;
in float i_Age;
in float i_Life;
in vec2 i_Velocity;

out vec2 v_Position;
out float v_Age;
out float v_Life;
out vec2 v_Velocity;

void main() {
  if (i_Age >= i_Life) {
    ivec2 noise_coord = ivec2(gl_VertexID % 512, gl_VertexID / 512);
    vec2 rand = texelFetch(u_RgNoise, noise_coord, 0).rg;

    float theta = u_MinTheta + rand.r * (u_MaxTheta - u_MinTheta);

    float x = cos(theta);
    float y = sin(theta);

    v_Position = u_Origin;
    v_Age = 0.0;
    v_Life = i_Life;

    v_Velocity = vec2(x, y) * (u_MinSpeed + rand.g * (u_MaxSpeed - u_MinSpeed));
  } else {
    v_Position = i_Position + i_Velocity * u_TimeDelta;
    v_Age = i_Age + u_TimeDelta;
    v_Life = i_Life;
    v_Velocity = i_Velociy + u_Gravity * u_TimeDelta;
  }
}
`;

const particleUpdateFS = `
precision mediump float;
in float v_Age;

void main() {
  discard;
}
`;

const particleRenderVS = `
precision mediump float;

in vec2 i_Position;
in float i_Age;
in float i_Life;
in vec2 i_Velocity;

void main() {
  gl_PointSize = 1.0;
  gl_Position = vec4(i_Position, 0.0, 1.0);
}
`;

const particleRenderFS = `
precision mediump float;

out vec4 o_FragColor;
void main() {
  o_FragColor = vec4(1.0);
}
`;

// bottom
