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

// bottom
