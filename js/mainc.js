const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
document.body.append(canvas);
const glctx = canvas.getContext("webgl2");

const numParticles = 1000; // 100000
const birthRate = 0.5;
const minAge = 1.01;
const maxAge = 1.5;
const minTheta = Math.PI / 2.0 - 0.5;
const maxTheta = Math.PI / 2.0 + 0.5;
const minSpeed = 0.1;
const maxSpeed = 0.2;
let gravity = [-0.5, 0.0];

const varyings = ["v_Position", "v_Age", "v_Life", "v_Velocity"];
let raf;

let theUpdateShaders = [
  {name: "particle-update-vert", type: glctx.VERTEX_SHADER},
  {name: "passthru-frag-shader", type: glctx.FRAGMENT_SHADER}
];

let theRenderShaders = [
  {name: "particle-render-vert", type: glctx.VERTEX_SHADER},
  {name: "particle-render-frag", type: glctx.FRAGMENT_SHADER}
];

window.addEventListener('keypress', (event) => {
  if (event.key == 'a') {
    window.cancelAnimationFrame(main);
  }
});

function createShader(gl, shader_info) {
  let shader = gl.createShader(shader_info.type);
  let i = 0;
  let shader_source = document.getElementById(shader_info.name).text;
  while (/\s/.test(shader_source[i])) i++;
  shader_source = shader_source.slice(i);
  gl.shaderSource(shader, shader_source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw "Could not compile " + shader_info.name + "\n" + gl.getShaderInfoLog(shader);
  }
  return shader;
}

function createGLProgram(gl, shader_list, transform_feedback_varyings) {
  const program = gl.createProgram();
  for (let i = 0; i < shader_list.length; i++) {
    let shader_info = shader_list[i];
    let shader = createShader(gl, shader_info);
    gl.attachShader(program, shader);
  }

  if (transform_feedback_varyings != null) {
    gl.transformFeedbackVaryings(program, transform_feedback_varyings, gl.INTERLEAVED_ATTRIBS);
  }

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error_message = gl.getProgramInfoLog(program);
    throw "Could not link program.\n" + error_message;
  }

  return program;
}

function getRandomRGData(size_x, size_y) {
  var d = [];
  for (var i = 0; i < size_x * size_y; ++i) {
    d.push(Math.random() * 255.0);
    d.push(Math.random() * 255.0);
  }
  return new Uint8Array(d);
}

function initParticleData() {
  var data = [];
  for (var i = 0; i < numParticles; ++i) {
    data.push(0.0);
    data.push(0.0);
    var life = minAge + Math.random() * (maxAge - minAge);
    data.push(life + 1);
    data.push(life);
    data.push(0.0);
    data.push(0.0);
  }
  return data;
}

function setupParticleBufferVAO(gl, buffers, vao) {
  gl.bindVertexArray(vao);
  console.log(buffers.length);
  for (var i = 0; i < buffers.length; i++) {
    var buffer = buffers[i];
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer_object);
    var offset = 0;
    for (var attrib_name in buffer.attribs) {
      if (buffer.attribs.hasOwnProperty(attrib_name)) {
        var attrib_desc = buffer.attribs[attrib_name];
        gl.enableVertexAttribArray(attrib_desc.location);
        gl.vertexAttribPointer(
          attrib_desc.location,
          attrib_desc.num_components,
          attrib_desc.type,
          false,
          buffer.stride,
          offset);
        var type_size = 4; /* we're only dealing with types of 4 byte size in this demo, unhardcode if necessary */
        offset += attrib_desc.num_components * type_size;
        if (attrib_desc.hasOwnProperty("divisor")) {
          gl.vertexAttribDivisor(attrib_desc.location, attrib_desc.divisor);
        }
      }
    }
  }
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function setAttribProps(gl, program, attribute, compNum) {
  return {
    location: gl.getAttribLocation(program, attribute),
    num_components: compNum,
    type: gl.FLOAT
  };
}

function init(gl) {
  if (maxAge < minAge) throw "Invalid min-max age range.";
  if (minSpeed > maxSpeed) throw "Invalid min-max speed range.";
  if (maxTheta < minTheta || minTheta < -Math.PI || maxTheta > Math.PI) {
    throw "Invalid theta range.";
  }
  let update_program = createGLProgram(gl, theUpdateShaders, varyings);
  let render_program = createGLProgram(gl, theRenderShaders, null);
  let update_attrib_locations = {
    i_Position: setAttribProps(gl, update_program, "i_Position", 2),
    i_Age: setAttribProps(gl, update_program, "i_Age", 1),
    i_Life: setAttribProps(gl, update_program, "i_Life", 1),
    i_Velocity: setAttribProps(gl, update_program, "i_Velocity", 2)
  };
  let render_attrib_locations = {
    i_Position: setAttribProps(gl, render_program, "i_Position", 2)
  };
  let vaos = [
    gl.createVertexArray(),
    gl.createVertexArray(),
    gl.createVertexArray(),
    gl.createVertexArray()
  ];
  let buffers = [
    gl.createBuffer(),
    gl.createBuffer(),
  ];
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
  var initial_data = new Float32Array(initParticleData());
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers[0]);
  gl.bufferData(gl.ARRAY_BUFFER, initial_data, gl.STREAM_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers[1]);
  gl.bufferData(gl.ARRAY_BUFFER, initial_data, gl.STREAM_DRAW);
  for (var i = 0; i < vao_desc.length; i++) {
    setupParticleBufferVAO(gl, vao_desc[i].buffers, vao_desc[i].vao);
  }

  gl.clearColor(0.0, 0.0, 1.0, 1.0);
  var rg_noise_texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, rg_noise_texture);
  gl.texImage2D(gl.TEXTURE_2D,
                0,
                gl.RG8,
                512, 512,
                0,
                gl.RG,
                gl.UNSIGNED_BYTE,
                getRandomRGData(512, 512));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  return {
    particle_sys_buffers: buffers,
    particle_sys_vaos: vaos,
    read: 0,
    write: 1,
    update_program: update_program,
    render_program: render_program,
    numParticles: initial_data.length / 6,
    old_timestamp: 0.0,
    rg_noise: rg_noise_texture,
    total_time: 0.0,
    born_particles: 0,
    birth_rate: birthRate,
    origin: [0.0, 0.0],
  };
}

function render(gl, state, timestamp_millis) {
  let num_part = state.born_particles;
  let time_delta = 0.0;
  if (state.old_timestamp != 0) {
    time_delta = timestamp_millis - state.old_timestamp;
    if (time_delta > 500.0) {
      time_delta = 0.0;
    }
  }
  if (state.born_particles < state.numParticles) {
    state.born_particles = Math.min(state.numParticles,
                    Math.floor(state.born_particles + state.birth_rate * time_delta));
  }
  state.old_timestamp = timestamp_millis;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(state.update_program);
  gl.uniform1f(gl.getUniformLocation(state.update_program, "u_TimeDelta"), time_delta / 1000.0);
  gl.uniform1f(gl.getUniformLocation(state.update_program, "u_TotalTime"), state.total_time);
  gl.uniform2f(gl.getUniformLocation(state.update_program, "u_Gravity"), gravity[0], gravity[1]);
  gl.uniform2f(gl.getUniformLocation(state.update_program, "u_Origin"), state.origin[0], state.origin[1]);
  gl.uniform1f(gl.getUniformLocation(state.update_program, "u_MinTheta"), minTheta);
  gl.uniform1f(gl.getUniformLocation(state.update_program, "u_MaxTheta"), maxTheta);
  gl.uniform1f(gl.getUniformLocation(state.update_program, "u_MinSpeed"), minSpeed);
  gl.uniform1f(gl.getUniformLocation(state.update_program, "u_MaxSpeed"), maxSpeed);
  state.total_time += time_delta;

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, state.rg_noise);
  gl.uniform1i(gl.getUniformLocation(state.update_program, "u_RgNoise"), 0);
  gl.bindVertexArray(state.particle_sys_vaos[state.read]);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, state.particle_sys_buffers[state.write]);
  gl.enable(gl.RASTERIZER_DISCARD);
  gl.beginTransformFeedback(gl.POINTS);
  gl.drawArrays(gl.POINTS, 0, num_part);
  gl.endTransformFeedback();
  gl.disable(gl.RASTERIZER_DISCARD);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
  gl.bindVertexArray(state.particle_sys_vaos[state.read + 2]);
  gl.useProgram(state.render_program);
  gl.drawArrays(gl.POINTS, 0, num_part);
  var tmp = state.read;
  state.read = state.write;
  state.write = tmp;
  window.requestAnimationFrame(function(ts) { render(gl, state, ts); });
}

function main() {
  if (glctx != null) {
    var state = init(glctx);
    canvas.onmousemove = function(e) {
      var x = 2.0 * (e.pageX - this.offsetLeft)/this.width - 1.0;
      var y = -(2.0 * (e.pageY - this.offsetTop)/this.height - 1.0);
      state.origin = [x, y];
    };
    // raf = window.requestAnimationFrame((ts) => render(glctx, state, ts));
    window.requestAnimationFrame(
      function(ts) {
        render(glctx, state, ts);
      }
    );
  }
}
