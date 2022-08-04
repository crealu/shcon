const canvas = document.getElementById('canvas');
gl = canvas.getContext('webgl');
// const updateVS = particleUpdateVS;
// const updateFS = particleUpdateFS;
// const renderVS = particleRenderVS;
// const renderFS = particleRenderFS;

const particleUpdateVS = `
#ifdef GL_ES
precision mediump float;
#endif

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
#ifdef GL_ES
precision mediump float;
#endif

in float v_Age;

void main() {
  discard;
}
`;

const particleRenderVS = `
#ifdef GL_ES
precision mediump float;
#endif

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
#ifdef GL_ES
precision mediump float;
#endif

out vec4 o_FragColor;
void main() {
  o_FragColor = vec4(1.0);
}
`;

let finalProgram;

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createGLProgram(gl, vsSource, fsSource, varyings) {
  const shaderProgram = gl.createProgram();
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);

  /* Specify varyings to be captured in the transform feedback buffer. */
  if (varyings != null) {
    gl.transformFeedbackVaryings(program, varyings, gl.INTERLEAVED_ATTRIBS);
  }
  gl.linkProgram(program);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Cannot initialize');
    return null;
  }

  return shaderProgram;
}

function initRandomRGData(size_x, size_y) {
  var d = [];
  for (var i = 0; i < size_x * size_y; ++i) {
    d.push(Math.random() * 255.0);
    d.push(Math.random() * 255.0);
  }
  return new Uint8Array(d);
}

function initParticleData(num_parts, min_age, max_age) {
  let data = [];
  for (let i = 0; i < num_parts; ++i) {
    // position
    data.push(0.0);
    data.push(0.0);

    let life = min_age + Math.random() * (max_age - min_age);
    // set age to max. life + 1 to ensure the particle gets initialized
    // on first invocation of particle update shader
    data.push(life + 1);
    data.push(life);

    // velocity
    data.push(0.0);
    data.push(0.0);
  }
  return data;
}

function setupParticleBufferVAO(gl, buffers, vao) {
  gl.bindVertexArray(vao);
  for (var i = 0; i < buffers.length; i++) {
    var buffer = buffers[i];
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer_object);
    var offset = 0;
    for (var attrib_name in buffer.attribs) {
      if (buffer.attribs.hasOwnProperty(attrib_name)) {
        /* Set up vertex attribute pointers for attributes that are stored in this buffer. */
        var attrib_desc = buffer.attribs[attrib_name];
        gl.enableVertexAttribArray(attrib_desc.location);
        gl.vertexAttribPointer(
          attrib_desc.location,
          attrib_desc.num_components,
          attrib_desc.type,
          false,
          buffer.stride,
          offset);
        /* we're only dealing with types of 4 byte size in this demo, unhardcode if necessary */
        var type_size = 4;

        /* Note that we're cheating a little bit here: if the buffer has some irrelevant data
           between the attributes that we're interested in, calculating the offset this way
           would not work. However, in this demo, buffers are laid out in such a way that this code works :) */
        offset += attrib_desc.num_components * type_size;

        if (attrib_desc.hasOwnProperty("divisor")) { /* we'll need this later */
          gl.vertexAttribDivisor(attrib_desc.location, attrib_desc.divisor);
        }
      }
    }
  }
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function init(
    gl,
    num_particles,
    particle_birth_rate,
    min_age,
    max_age,
    min_theta,
    max_theta,
    min_speed,
    max_speed,
    gravity)
{
  /* Do some parameter validation */
  if (max_age < min_age) {
    throw "Invalid min-max age range.";
  }
  if (max_theta < min_theta || min_theta < -Math.PI || max_theta > Math.PI) {
    throw "Invalid theta range.";
  }
  if (min_speed > max_speed) {
    throw "Invalid min-max speed range.";
  }

  let update_program, render_program;
  let varyings = ['v_Position', 'v_Age', 'v_Life', 'v_Velocity'];

  /* Create programs for updating and rendering the particle system. */
  update_program = createGLProgram(gl, particleUpdateVS, particleUpdateFS, varyings);
  render_program = createGLProgram(gl, particleRenderVS, particleRenderFS, null);

  /* Capture attribute locations from program objects. */
  var update_attrib_locations = {
    i_Position: {
      location: gl.getAttribLocation(update_program, "i_Position"),
      num_components: 2,
      type: gl.FLOAT
    },
    i_Age: {
      location: gl.getAttribLocation(update_program, "i_Age"),
      num_components: 1,
      type: gl.FLOAT
    },
    i_Life: {
      location: gl.getAttribLocation(update_program, "i_Life"),
      num_components: 1,
      type: gl.FLOAT
    },
    i_Velocity: {
      location: gl.getAttribLocation(update_program, "i_Velocity"),
      num_components: 2,
      type: gl.FLOAT
    }
  };
  var render_attrib_locations = {
    i_Position: {
      location: gl.getAttribLocation(render_program, "i_Position"),
      num_components: 2,
      type: gl.FLOAT
    }
  };

  /* These buffers shall contain data about particles. */
  var buffers = [
    gl.createBuffer(),
    gl.createBuffer(),
  ];
  /* We'll have 4 VAOs... */
  var vaos = [
    gl.createVertexArray(), /* for updating buffer 1 */
    gl.createVertexArray(), /* for updating buffer 2 */
    gl.createVertexArray(), /* for rendering buffer 1 */
    gl.createVertexArray() /* for rendering buffer 2 */
  ];

  /* this has information about buffers and bindings for each VAO. */
  var vao_desc = [
    {
      vao: vaos[0],
      buffers: [{
        buffer_object: buffers[0],
        stride: 4 * 6,
        attribs: update_attrib_locations
      }]
    },
    {
      vao: vaos[1],
      buffers: [{
        buffer_object: buffers[1],
        stride: 4 * 6,
        attribs: update_attrib_locations
      }]
    },
    {
      vao: vaos[2],
      buffers: [{
        buffer_object: buffers[0],
        stride: 4 * 6,
        attribs: render_attrib_locations
      }],
    },
    {
      vao: vaos[3],
      buffers: [{
        buffer_object: buffers[1],
        stride: 4 * 6,
        attribs: render_attrib_locations
      }],
    },
  ];

  /* Populate buffers with some initial data. */
  var initial_data = new Float32Array(initParticleData(num_particles, min_age, max_age));
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers[0]);
  gl.bufferData(gl.ARRAY_BUFFER, initial_data, gl.STREAM_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers[1]);
  gl.bufferData(gl.ARRAY_BUFFER, initial_data, gl.STREAM_DRAW);

  /* Set up VAOs */
  for (var i = 0; i < vao_desc.length; i++) {
    setupParticleBufferVAO(gl, vao_desc[i].buffers, vao_desc[i].vao);
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  /* Create a texture for random values. */
  var rg_noise_texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, rg_noise_texture);
  gl.texImage2D(gl.TEXTURE_2D,
                0,
                gl.RG8,
                512, 512,
                0,
                gl.RG,
                gl.UNSIGNED_BYTE,
                initRandomRGData(512, 512));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  /* Set up blending */
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  return {
    particle_sys_buffers: buffers,
    particle_sys_vaos: vaos,
    read: 0,
    write: 1,
    particle_update_program: update_program,
    particle_render_program: render_program,
    num_particles: initial_data.length / 6,
    old_timestamp: 0.0,
    rg_noise: rg_noise_texture,
    total_time: 0.0,
    born_particles: 0,
    birth_rate: particle_birth_rate,
    gravity: gravity,
    origin: [0.0, 0.0],
    min_theta: min_theta,
    max_theta: max_theta,
    min_speed: min_speed,
    max_speed: max_speed
  };
}

function render(gl, state, timestamp_millis) {
  var num_part = state.born_particles;

  /* Calculate time delta. */
  var time_delta = 0.0;
  if (state.old_timestamp != 0) {
    time_delta = timestamp_millis - state.old_timestamp;
    if (time_delta > 500.0) {
      /* If delta is too high, pretend nothing happened.
         Probably tab was in background or something. */
      time_delta = 0.0;
    }
  }

  /* Here's where birth rate parameter comes into play.
     We add to the number of active particles in the system
     based on birth rate and elapsed time. */
  if (state.born_particles < state.num_particles) {
    state.born_particles = Math.min(state.num_particles,
                    Math.floor(state.born_particles + state.birth_rate * time_delta));
  }
  /* Set the previous update timestamp for calculating time delta in the
     next frame. */
  state.old_timestamp = timestamp_millis;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(state.particle_update_program);

  /* Most of the following is trivial setting of uniforms */
  gl.uniform1f(
    gl.getUniformLocation(state.particle_update_program, "u_TimeDelta"),
    time_delta / 1000.0);
  gl.uniform1f(
    gl.getUniformLocation(state.particle_update_program, "u_TotalTime"),
    state.total_time);
  gl.uniform2f(
    gl.getUniformLocation(state.particle_update_program, "u_Gravity"),
    state.gravity[0], state.gravity[1]);
  gl.uniform2f(
    gl.getUniformLocation(state.particle_update_program, "u_Origin"),
    state.origin[0],
    state.origin[1]);
  gl.uniform1f(
    gl.getUniformLocation(state.particle_update_program, "u_MinTheta"),
    state.min_theta);
  gl.uniform1f(
    gl.getUniformLocation(state.particle_update_program, "u_MaxTheta"),
    state.max_theta);
  gl.uniform1f(
    gl.getUniformLocation(state.particle_update_program, "u_MinSpeed"),
    state.min_speed);
  gl.uniform1f(
    gl.getUniformLocation(state.particle_update_program, "u_MaxSpeed"),
    state.max_speed);
  state.total_time += time_delta;
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, state.rg_noise);
  gl.uniform1i(
    gl.getUniformLocation(state.particle_update_program, "u_RgNoise"),
    0);

  /* Bind the "read" buffer - it contains the state of the particle system
    "as of now".*/
  gl.bindVertexArray(state.particle_sys_vaos[state.read]);

  /* Bind the "write" buffer as transform feedback - the varyings of the
     update shader will be written here. */
  gl.bindBufferBase(
    gl.TRANSFORM_FEEDBACK_BUFFER, 0, state.particle_sys_buffers[state.write]);

  /* Since we're not actually rendering anything when updating the particle
     state, disable rasterization.*/
  gl.enable(gl.RASTERIZER_DISCARD);

  /* Begin transform feedback! */
  gl.beginTransformFeedback(gl.POINTS);
  gl.drawArrays(gl.POINTS, 0, num_part);
  gl.endTransformFeedback();
  gl.disable(gl.RASTERIZER_DISCARD);
  /* Don't forget to unbind the transform feedback buffer! */
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);

  /* Now, we draw the particle system. Note that we're actually
     drawing the data from the "read" buffer, not the "write" buffer
     that we've written the updated data to. */
  gl.bindVertexArray(state.particle_sys_vaos[state.read + 2]);
  gl.useProgram(state.particle_render_program);
  gl.drawArrays(gl.POINTS, 0, num_part);

  /* Finally, we swap read and write buffers. The updated state will be
     rendered on the next frame. */
  var tmp = state.read;
  state.read = state.write;
  state.write = tmp;

  /* This just loops this function. */
  window.requestAnimationFrame(function(ts) { render(gl, state, ts); });
}

function main() {
  // var canvas_element = document.getElementById("canvas");
  // canvas_element.width = 800;
  // canvas_element.height = 600;
  // var webgl_context = canvas_element.getContext("webgl2");
  if (gl != null) {
    // document.body.appendChild(canvas_element);
    var state =
      init(
        gl,
        10000, /* number of particles */
        0.5, /* birth rate */
        1.01, 1.15, /* life range */
        Math.PI/2.0 - 0.5, Math.PI/2.0 + 0.5, /* direction range */
        0.5, 1.0, /* speed range */
        [0.0, -0.8]); /* gravity */

    /* Makes the particle system follow the mouse pointer */
    canvas.onmousemove = function(e) {
      var x = 2.0 * (e.pageX - this.offsetLeft)/this.width - 1.0;
      var y = -(2.0 * (e.pageY - this.offsetTop)/this.height - 1.0);
      state.origin = [x, y];
    };
    window.requestAnimationFrame(
      function(ts) { render(gl, state, ts); });
  } else {
    document.write("WebGL2 is not supported by your browser");
  }
}

main();
