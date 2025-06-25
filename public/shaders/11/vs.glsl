#ifdef GL_ES
precision mediump float;
#endif

attribute vec4 a_position;

void main(void) {
  gl_Position = a_position;
}