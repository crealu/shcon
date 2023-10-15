const canvas = document.getElementById('canvas');
gl = canvas.getContext('webgl');

let inp = document.querySelector('input');
let posOffset = 0;
let vertexNum = 4;

const projectionMatrix = mat4.create();
const modelViewMatrix = mat4.create();

const fieldOfView = 60 * Math.PI / 180;
const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
const zNear = 0.1;
const zFar = 100.0;

const numComponentsPosition = 2;
const type = gl.FLOAT;
const normalize = false;
const stride = 0;
const offset = 0;

let uniformLocProjection;
let uniformLocView;
let uniformLocCTime;
let uniformVal;

let logTime = true;
let positions = [];

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

function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const shaderProgram = gl.createProgram();

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Cannot initialize');
    return null;
  }

  return shaderProgram;
}

function initAndRedraw(newFS) {
  gl.deleteProgram(shaderProgram);
  shaderProgram = null;
  shaderProgram = initShaderProgram(gl, vertShader, newFS);
  buffers = initBuffers(gl);
  drawScene(gl, shaderProgram, buffers, 0);
}

function initBuffers(gl) {
  positions = [
    -1.0,  1.0,
     1.0,  1.0,
    -1.0, -1.0,
     1.0, -1.0
  ];

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return {
    position: positionBuffer
  }
}

function setupProgram(gl, program, buffers) {
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(gl.getAttribLocation(program, 'vertPosition'),
    numComponentsPosition, type, normalize, stride, offset);
  gl.enableVertexAttribArray(gl.getAttribLocation(program, 'vertPosition'));

  mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -1.0]);
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  uniformLocProjection = gl.getUniformLocation(program, 'projection');
  uniformLocView = gl.getUniformLocation(program, 'view');
  uniformLocCTime = gl.getUniformLocation(program, 'ctime');
  uniformVal = gl.getUniformLocation(program, 'val');
}

function drawScene(gl, program, buffers, deltatime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniformMatrix4fv(uniformLocProjection, false, projectionMatrix);
  gl.uniformMatrix4fv(uniformLocView, false, modelViewMatrix);
  gl.uniform1f(uniformLocCTime, deltatime);
  gl.uniform1f(uniformVal, inp.value);

  gl.drawArrays(gl.TRIANGLE_STRIP, posOffset, vertexNum);
  logTime ? console.log(uniformLocProjection) : null;
  logTime = false;
}
