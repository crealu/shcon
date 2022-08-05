const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.append(canvas);
const glctx = canvas.getContext("webgl2");

const numParticles = 1000; // 100000
const birthRate = 0.5;
const minAge = 1.01;
const maxAge = 1.5;
const minTheta = Math.PI / 2.0 - 0.2;
const maxTheta = Math.PI / 2.0 + 0.2;
const minSpeed = 0.1;
const maxSpeed = 0.8;
let gravity = [0.0, -0.8];
let bornParticles = 0;
let origin = [0.0, 0.0];

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

function createShader(gl, info) {
  let shader = gl.createShader(info.type);
  let i = 0;
  let source = document.getElementById(info.name).text;
  while (/\s/.test(source[i])) i++;
  source = source.slice(i);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw "Could not compile " + info.name + "\n" + gl.getShaderInfoLog(shader);
  }
  return shader;
}

function createGLProgram(gl, shaderList, tfVaryings) {
  const program = gl.createProgram();
  for (let i = 0; i < shaderList.length; i++) {
    let info = shaderList[i];
    let shader = createShader(gl, info);
    gl.attachShader(program, shader);
  }

  if (tfVaryings != null) {
    gl.transformFeedbackVaryings(program, tfVaryings, gl.INTERLEAVED_ATTRIBS);
  }

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error_message = gl.getProgramInfoLog(program);
    throw "Could not link program.\n" + error_message;
  }

  return program;
}

function getRandomRGData(sizeX, sizeY) {
  let d = [];
  for (let i = 0; i < sizeX * sizeY; ++i) {
    d.push(Math.random() * 255.0);
    d.push(Math.random() * 255.0);
  }
  return new Uint8Array(d);
}

function initParticleData() {
  let data = [];
  let life = minAge + Math.random() * (maxAge - minAge);
  for (let i = 0; i < numParticles; ++i) {
    data.push(0.0);
    data.push(0.0);
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
  let theUpdateProgram = createGLProgram(gl, theUpdateShaders, varyings);
  let theRenderProgram = createGLProgram(gl, theRenderShaders, null);
  let attribLocsUpdate = {
    i_Position: setAttribProps(gl, theUpdateProgram, "i_Position", 2),
    i_Age: setAttribProps(gl, theUpdateProgram, "i_Age", 1),
    i_Life: setAttribProps(gl, theUpdateProgram, "i_Life", 1),
    i_Velocity: setAttribProps(gl, theUpdateProgram, "i_Velocity", 2)
  };
  let attribLocsRender = {
    i_Position: setAttribProps(gl, theRenderProgram, "i_Position", 2)
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
        attribs: attribLocsUpdate
      }]
    },
    {
      vao: vaos[1],
      buffers: [{
        buffer_object: buffers[1],
        stride: 4 * 6,
        attribs: attribLocsUpdate
      }]
    },
    {
      vao: vaos[2],
      buffers: [{
        buffer_object: buffers[0],
        stride: 4 * 6,
        attribs: attribLocsRender
      }],
    },
    {
      vao: vaos[3],
      buffers: [{
        buffer_object: buffers[1],
        stride: 4 * 6,
        attribs: attribLocsRender
      }],
    },
  ];
  var initialParticleData = new Float32Array(initParticleData());
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers[0]);
  gl.bufferData(gl.ARRAY_BUFFER, initialParticleData, gl.STREAM_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers[1]);
  gl.bufferData(gl.ARRAY_BUFFER, initialParticleData, gl.STREAM_DRAW);
  for (var i = 0; i < vao_desc.length; i++) {
    setupParticleBufferVAO(gl, vao_desc[i].buffers, vao_desc[i].vao);
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  var rgNoiseTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, rgNoiseTexture);
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
    theUpdateProgram: theUpdateProgram,
    theRenderProgram: theRenderProgram,
    numParticles: initialParticleData.length / 6,
    oldTimestamp: 0.0,
    rg_noise: rgNoiseTexture,
    total_time: 0.0,
    origin: [0.0, 0.0],
  };
}

function render(gl, state, msTimestamp) {
  let num_part = bornParticles;
  let deltaTime = 0.0;
  if (state.oldTimestamp != 0) {
    deltaTime = msTimestamp - state.oldTimestamp;
    if (deltaTime > 500.0) {
      deltaTime = 0.0;
    }
  }
  if (bornParticles < state.numParticles) {
    bornParticles = Math.min(numParticles, Math.floor(bornParticles + birthRate * deltaTime));
  }
  state.oldTimestamp = msTimestamp;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(state.theUpdateProgram);
  gl.uniform1f(gl.getUniformLocation(state.theUpdateProgram, "u_TimeDelta"), deltaTime / 1000.0);
  gl.uniform1f(gl.getUniformLocation(state.theUpdateProgram, "u_TotalTime"), state.total_time);
  gl.uniform2f(gl.getUniformLocation(state.theUpdateProgram, "u_Gravity"), gravity[0], gravity[1]);
  gl.uniform2f(gl.getUniformLocation(state.theUpdateProgram, "u_Origin"), origin[0], origin[1]);
  gl.uniform1f(gl.getUniformLocation(state.theUpdateProgram, "u_MinTheta"), minTheta);
  gl.uniform1f(gl.getUniformLocation(state.theUpdateProgram, "u_MaxTheta"), maxTheta);
  gl.uniform1f(gl.getUniformLocation(state.theUpdateProgram, "u_MinSpeed"), minSpeed);
  gl.uniform1f(gl.getUniformLocation(state.theUpdateProgram, "u_MaxSpeed"), maxSpeed);
  state.total_time += deltaTime;

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, state.rg_noise);
  gl.uniform1i(gl.getUniformLocation(state.theUpdateProgram, "u_RgNoise"), 0);
  gl.bindVertexArray(state.particle_sys_vaos[state.read]);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, state.particle_sys_buffers[state.write]);
  gl.enable(gl.RASTERIZER_DISCARD);
  gl.beginTransformFeedback(gl.POINTS);
  gl.drawArrays(gl.POINTS, 0, num_part);
  gl.endTransformFeedback();
  gl.disable(gl.RASTERIZER_DISCARD);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
  gl.bindVertexArray(state.particle_sys_vaos[state.read + 2]);
  gl.useProgram(state.theRenderProgram);
  gl.drawArrays(gl.POINTS, 0, 0);
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
      origin = [x, y];
    };
    console.log(state);
    // raf = window.requestAnimationFrame((ts) => render(glctx, state, ts));
    window.requestAnimationFrame(
      function(ts) {
        render(glctx, state, ts);
      }
    );
  }
}


window.addEventListener('keypress', (event) => {
  if (event.key == 'a') {
    window.cancelAnimationFrame(main);
  }
});

window.onload = main();
