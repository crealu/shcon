const canvas = document.getElementsByClassName('the-canvas')[0];
const iku = document.getElementById('iku');
const ikur = document.getElementsByClassName('ikur')[0];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gl = canvas.getContext('webgl');
let time = 0.0;
const timeLimit = 12;
let uniformTime;
let id;
let theProgram;
let vs, fs;

function parseBoth(text) {
  let shaders = text.split('//**');
  vs = shaders[0];
  fs = shaders[1];

  console.log(vs);
  start(shaders[0], shaders[1]);
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

function initShaderProgram(vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);

  return shaderProgram;
}

function initBuffers() {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 3, 3, -1]), gl.STATIC_DRAW);
}

function initLocation() {
  const positionLocation = gl.getAttribLocation(theProgram, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);  
}

function initUniforms() {
  const uResolution = gl.getUniformLocation(theProgram, 'u_resolution');
  gl.uniform3f(uResolution, canvas.width, canvas.height, 1.0);

  const uTime = gl.getUniformLocation(theProgram, 'u_time');
  gl.uniform1f(uTime, time);

  return uTime;
}

function start(theVS, theFS) {
  theProgram = initShaderProgram(theVS, theFS);
  initBuffers();
  initLocation();
  uniformTime = initUniforms();
}

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clearDepth(1.0);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);

function render(now) {
  time += 0.01;
  
  gl.uniform1f(uniformTime, time);
  gl.drawArrays(gl.TRIANGLES, 0, 3);  

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
  // iku.style.opacity = '0';
  canvas.style.display = 'block';
  canvas.classList.add('reveal');

  setTimeout(() => {
    ikur.classList.add('slide-up');
    setTimeout(() => {
      // ikur.style.animation = null;
      ikur.classList.add('active-reading');
      ikur.classList.remove('slide-up');
      // setTimeout(())
    }, 500);
    // canvas.style.display = '1';
  }, 500);
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
