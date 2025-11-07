precision mediump float;

uniform vec3 u_resolution;
uniform float u_time;

void main() {
  // D is dimension
  vec2 D = u_resolution.xy;

  // F is field
  vec2 F = 3.0 * gl_FragCoord.xy - u_resolution.xy;
    
  // I is the viewport
  vec2 I = (F + F - D) / D.y / .7;
    
  // S is speed
  float S = u_time * .9;
    
  // O is output
  vec4 O;
    
  // particle count
  float count = 200.0;

  // B is bounds
  float B = 1.2;

  // animate 200 particles, C is circle
  for (float C = 0.0; C < 200.0; C++) {
    float sin1 = sin(C * .18 + S * .5);
    float cos1 = cos(C * .2 * (.96 + sin(S) * .04) + S);
    
    float sin2 = sin(S * 4. + C * .033);
    vec4 cos2 = cos(C * .022 - S - S + log(1. + length(I) * 4.) + vec4(0.0, 1.0, 2.0, 0.0));
    
    float d1 = abs(length(I - vec2(sin1, cos1)) + .015 * sin2);
    vec4 d2 = 1. + cos2;
    
    float num = .003;
    

    O += pow(num / d1 * d2, O + B);
  }

  gl_FragColor = O;
}
