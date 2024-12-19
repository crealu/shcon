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