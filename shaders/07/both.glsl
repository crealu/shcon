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


