precision mediump float;

attribute vec4 a_position;

void main(void) {
  gl_Position = a_position;
}

//**

precision mediump float;

uniform vec3 u_resolution;
uniform float u_time;
uniform float u_mode;

vec4 anim1(vec4 o, vec2 i, float c, float s) {
  return
    pow(.003 / 
      abs(length(i - vec2(sin(c + s)))) 
      * 
      (
        1. + cos(c + vec4(0, 1., 2., 0))
      ), 
      o + 1.2
    );
}

vec4 anim2(vec4 o, vec2 i, float c, float s) {
  return
    pow(.003 / 
      abs(length(i - vec2(sin(c + s), cos(c + s))))
      * 
      (
        1. + cos(c + vec4(0, 1., 2., 0))
      ), 
      o + 1.2
    );
}

vec4 anim3(vec4 o, vec2 i, float c, float s) {
  return
    pow(.003 / 
      abs(length(i - vec2(sin(c * .18 + s), cos(c * .19 + s))))
      * 
      (
        1. + cos(c + vec4(0, 1., 2., 0))
      ), 
      o + 1.2
    );
}

vec4 anim4(vec4 o, vec2 i, float c, float s) {
  return
    pow(.003 / 
      abs(length(i - vec2(sin(c * .18 + s), cos(c * .19 + s * .19))))
      * 
      (
        1.0 + cos(c + vec4(0, 1., 2., 0))
      ), 
      o + 1.2
    );
}


vec4 phishy(vec4 o, vec2 i, float c, float s) {
  return
    pow(.003 / 
      abs(length(i - vec2(sin(c * .43 + s), cos(c + s)))) 
      * 
      (
        1. + cos(c + vec4(0, 1., 2., 0))
      ), 
      o + 1.2
    );
}

void main() {

  // vec2 view = 2.0 * gl_FragCoord.xy - u_resolution.xy;
  // float axis = u_resolution.y;
  // vec2 field = view / axis;

  // D is dimension
  vec2 D = u_resolution.xy;

  float trig = 0.0;

  // F is field
  // vec2 F = 4.0 * gl_FragCoord.xy - D;

  // F as view
  vec2 F = 2.0 * gl_FragCoord.xy - u_resolution.xy;
  float A = u_resolution.y;
  vec2 I = F / A / .7;
    
  // I is the viewport
  // vec2 I = (F - D) / D.y;

  // S is speed
  float S = u_time * .5;
    
  // O is output
  vec4 O;
    
  // particle count
  float count = 200.0;

  // B is bounds
  float B = 1.2;

  for (float C = 0.0; C < 200.0; C++) {
    if (u_mode == 0.0) {
      O += anim1(O, I, C, S);
    } else if (u_mode == 1.0) {
      O += anim2(O, I, C, S);
    } else if (u_mode == 2.0) {
      O += anim3(O, I, C, S);
    } else if (u_mode == 3.0) {
      O += anim4(O, I, C, S);
    }
  }

  gl_FragColor = O;


  // I, C, S, O
  // pow(.003 /
  //  abs(
  //    length(I - 
  //      vec2(
  //        sin(C * .18 + S * .5),
  //        cos(C * .2 * (.96 + sin(S) * .04) + S)
  //      )
  //    ) + .015 * sin(S * 4. + C * .033)
  //  ) * 
  //  (
  //    1. + 
  //    cos(C++ * .022 - S - S +
  //      log(1. + length(I) * 4.) +
  //      vec4(0, 1, 2, 0)
  //    )
  //  ), 
  //  O - O + 1.2
  // );
}