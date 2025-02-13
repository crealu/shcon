precision mediump float;

uniform vec3 u_resolution;
uniform float u_time;

const mat2 m = mat2(0.80, 0.40, -0.40, 0.80);

float noise(vec2 p)
{
    return sin(p.x) * sin(p.y);
}

float fbm4(vec2 p)
{
    float f = 0.0;

    f += 0.5000 * noise(p);
    p = m * p * 2.02;

    f += 0.2500 * noise(p);
    p = m * p * 2.03;

    f += 0.1250 * noise(p);
    p = m * p * 2.01;

    f += 0.0625 * noise(p);

    return f / 0.9375;
}

float fbm6(vec2 p)
{
    float f = 0.0;

    f += 0.500000 * (0.5 + 0.9 * noise(p)); 
    p = m * p * 2.02;

    f += 0.250000 * (0.5 + 0.5 * noise(p)); 
    p = m * p * 2.03;

    f += 0.125000 * (0.5 + 0.7 * noise(p)); 
    p = m * p * 2.01;

    f += 0.062500 * (0.5 + 0.6 * noise(p)); 
    p = m * p * 2.04;

    f += 0.031250 * (0.5 + 0.5 * noise(p)); 
    p = m * p * 2.01;

    f += 0.015625 * (0.5 + 0.5 * noise(p));

    return f / 0.46875;
}
 
vec2 fbm4_2(vec2 p)
{
    return vec2(fbm4(p), fbm4(p + vec2(7.8)));
}

vec2 fbm6_2(vec2 p)
{
    return vec2(fbm6(p + vec2(16.8)), fbm6(p + vec2(11.5)));
}

float func(vec2 q, vec4 ron, float t)
{
    vec2 len1 = vec2(0.27, 0.23) * t; 
    vec2 len2 = length(q) * vec2(4.1, 4.3);
    q += 0.03 * sin(len1 + len2 / t);

	vec2 o = fbm4_2(0.9 * q);
    o += 0.04 * sin(vec2(0.12, 0.14) + length(o));

    vec2 n = fbm6_2(3.0 * o);
	ron = vec4(o, n);

    float f = 0.5 + 0.5 * fbm4(1.8 * q + 6.0 * n);

    return mix(f, f * f * sin(f*t) * 3.5, f * abs(n.x));
}

void main()
{
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
    float e = 2.0 / u_resolution.y;

    vec4 on = vec4(0.0);
    float f = func(p, on, u_time);

	vec3 col = vec3(0.0);
    col = mix(vec3(0.3, 0.9, 0.4), vec3(0.3, 0.05, 0.05), f);
    col = mix(col, vec3(0.9, 0.9, 0.9), dot(on.zw, on.zw));
    // col = mix(col, vec3(0.4, 0.1, 0.3), 0.2 + 0.5 * on.x * on.y);
    float adj = smoothstep(1.2, 1.3, abs(on.y) + abs(on.w));
    col = mix(col, vec3(0.0, 0.2, 0.4), 0.5 * adj);
    col = clamp(col * f * 1.0, 0.1, 0.5);

    vec4 kk = vec4(0.0);
    float f1 = func(p + vec2(e, 0.0), kk, u_time);
    float f2 = func(p + vec2(0.0, e), kk, u_time);
    vec3 unnorm = vec3(f1 - f, e, f2 - f);
    vec3 nor = normalize(unnorm);

    vec3 v1 = vec3(0.9, 0.2, -0.4);
    vec3 lig = normalize(v1);

    float dif = clamp(0.3 + 0.9 * dot(nor, lig), 0.5, 1.0);

    vec3 lin1 = vec3(0.86, 0.63, 0.82);
    vec3 lin2 = vec3(0.42, 0.53, 0.59);
    vec3 lin = lin2 * (nor.x * 0.5 + 0.5) + lin1 * dif + smoothstep(sin(u_time), 0.1, 0.1);

    col *= 1.2 * lin;
	col = 1.0 - col;
	col = 1.1 * col * col;
    
    gl_FragColor = vec4(col, 1.0);
}