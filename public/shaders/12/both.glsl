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
uniform float u_var1;

vec4 anim(vec4 o, vec2 i, float c, float s) {
  return
    pow(u_var1 / 
      abs(length(i - vec2(sin(c * .18 + s), cos(c * .19 + s * .19))))
      * 
      (
        1.0 + cos(c + vec4(0, 1., 2., 0))
      ), 
      o + 1.2
    );
}

void main() {
	vec2 view = gl_FragCoord.xy * 2.0 - u_resolution.xy;
	float axis = u_resolution.y;
	vec2 field = view / axis / 0.5;

  float speed = u_time * .5;
    
  vec4 o;

  for (float C = 0.0; C < 200.0; C++) {
    o += anim(o, field, C, speed);
  }

  gl_FragColor = o;
}