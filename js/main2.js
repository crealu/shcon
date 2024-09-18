const canvas = document.getElementById('the-canvas');
const canvas1 = document.getElementById('cnv-1');
const canvas2 = document.getElementById('cnv-2');
const iku = document.getElementById('iku');

// canvas1.width = window.innerWidth;
// canvas1.height = window.innerHeight;
// canvas2.width = window.innerWidth;
// canvas2.height = window.innerHeight;

let gl = canvas1.getContext('webgl');
let gl2 = canvas2.getContext('webgl');

let time = 0.0, time2 = 0.0;
const timeLimit = 12;
let uniformTime, uniformTime2;
let id;
let theProgram, theProgram2;
let vs, fs;

function parseBoth(text) {
  let shaders = text.split('//**');
  start1(shaders[0], shaders[1]);
  start2(shaders[0], shaders[2]);
}

async function fetchShaders() {
  await fetch('/get-shaders')
    .then(res => res.text())
    .then(data => { parseBoth(data) })
    .catch(err => { console.log(err) })
}

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
  gl.useProgram(shaderProgram);

  return shaderProgram;
}

function initBuffers(gl) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 3, 3, -1]), gl.STATIC_DRAW);
}

function initLocation(gl, program) {
  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);  
}

function initUniforms(gl, program, t) {
  const uResolution = gl.getUniformLocation(program, 'u_resolution');
  gl.uniform3f(uResolution, canvas.width, canvas.height, 1.0);

  const uTime = gl.getUniformLocation(program, 'u_time');
  gl.uniform1f(uTime, t);

  return uTime;
}

// function start(theVS, theFS) {
//   start1(theVS, theFS);
//   start2(theVS, theFS);
// }

function start1(theVS, theFS) {
  theProgram = initShaderProgram(gl, theVS, theFS);
  initBuffers(gl, theProgram);
  initLocation(gl, theProgram);
  uniformTime = initUniforms(gl, theProgram, time);
}

function start2(theVS, theFS) {
  theProgram2 = initShaderProgram(gl2, theVS, theFS);
  initBuffers(gl2, theProgram2);
  initLocation(gl2, theProgram2);
  uniformTime2 = initUniforms(gl2, theProgram2, time2);
}

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clearDepth(1.0);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);

gl2.clearColor(0.0, 0.0, 0.0, 1.0);
gl2.clearDepth(1.0);
gl2.enable(gl2.DEPTH_TEST);
gl2.depthFunc(gl2.LEQUAL);

function render(now) {
  time += 0.01;
  time2 += 0.01;
  
  gl.uniform1f(uniformTime, time);
  gl.drawArrays(gl.TRIANGLES, 0, 3);  

  gl2.uniform1f(uniformTime2, time2);
  gl2.drawArrays(gl2.TRIANGLES, 0, 3);

  if (time >= timeLimit) {
    window.cancelAnimationFrame(render);
    return;
  }

  id = window.requestAnimationFrame(render);
}

function pause() {
  window.cancelAnimationFrame(id);
}

iku.addEventListener('click', () => {
  iku.style.opacity = '0';
  canvas.style.opacity = '1';
  render();
})

window.addEventListener('keypress', (event) => {
  if (event.key == 'j') {
    render();
  } else if (event.key == 'p') {
    pause();
  }
})

window.addEventListener('load', () => {
  fetchShaders();;
})
