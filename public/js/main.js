const canvas = document.getElementsByClassName('the-canvas')[0];
const canvas1 = document.getElementsByClassName('next-canvas')[0];
const iku = document.getElementById('iku');
const ikur = document.getElementsByClassName('ikur')[0];

iku.style.display = 'none';

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas1.width = window.innerWidth;
canvas1.height = window.innerHeight;

let gl = canvas.getContext('webgl');
let gl1 = canvas1.getContext('webgl');
let overallTime = 0.0, shaderTime = 0.0;
const timeLimit = 12;
let uniformTime;
let id, nextId;
let theProgram, nextProgram;
let vs, fs, vsn, fsn;
let programs = [];

function parseBoth(text) {
  let shaders = text.split('//**');
  vs = shaders[0];
  fs = shaders[1];

  console.log(vs);
  start(shaders[0], shaders[1]);
}

function parseAll(text) {
  progs = text.split('$$$');
  progs.forEach(program => {
    let shaders = program.split('**//');
    programs.push(shaders);
  });

  vs = programs[0][0]
  fs = programs[0][1];
  start(gl, vs, fs);

  console.log(programs);

  // console.log(vs);
  // start(shaders[0], shaders[1]);
}

async function fetchShaders() {
  await fetch('/get-shaders')
    .then(res => res.text())
    .then(data => { 
      parseBoth(data) 
      parseAll(data);
    })
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

function initLocation(gl) {
  const positionLocation = gl.getAttribLocation(theProgram, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);  
}

function initUniforms(gl) {
  const uResolution = gl.getUniformLocation(theProgram, 'u_resolution');
  gl.uniform3f(uResolution, canvas.width, canvas.height, 1.0);

  const uTime = gl.getUniformLocation(theProgram, 'u_time');
  gl.uniform1f(uTime, time);

  return uTime;
}

function start(gl, theVS, theFS) {
  theProgram = initShaderProgram(gl, theVS, theFS);
  initBuffers(gl);
  initLocation(gl);
  uniformTime = initUniforms(gl);
}

function clear(gl) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
}

// gl.clearColor(0.0, 0.0, 0.0, 1.0);
// gl.clearDepth(1.0);
// gl.enable(gl.DEPTH_TEST);
// gl.depthFunc(gl.LEQUAL);

clear(gl);

let step = 10;

function swapCanvas() {
  canvas.classList.add('vanish');
  canvas1.classList.add('reveal');
  start(gl1, programs[1][0], programs[1][1]);
  renderNext();
}

function render(now) {
  shaderTime += 0.01;
  overAllTime += shaderTime;
  
  gl.uniform1f(uniformTime, shaderTime);
  gl.drawArrays(gl.TRIANGLES, 0, 3);  

  if (overalltime >= step) {
    shaderTime = 0.0;
    swapCanvas();
    // renderNext();
  }

  if (shaderTime >= timeLimit) {
    window.cancelAnimationFrame(render);
    return;
  }

  id = window.requestAnimationFrame(render);
}

function renderNext(now) {
  shaderTime += 0.01;
  overAllTime += shaderTime;
  
  gl1.uniform1f(uniformTime, shaderTime);
  gl1.drawArrays(gl1.TRIANGLES, 0, 3);  

  if (overalltime >= step) {
    swapCanvas();
    renderNext();
  }

  if (shaderTime >= timeLimit) {
    window.cancelAnimationFrame(renderNext);
    return;
  }

  nextId = window.requestAnimationFrame(renderNext);
}

function pause() {
  window.cancelAnimationFrame(id);
}

iku.addEventListener('click', () => {
  // iku.style.opacity = '0';
  canvas.style.display = 'block';
  canvas.classList.add('reveal');

  // setTimeout(() => {
  //   ikur.classList.add('slide-up');
  //   setTimeout(() => {
  //     // ikur.style.animation = null;
  //     ikur.classList.add('active-reading');
  //     ikur.classList.remove('slide-up');
  //     // setTimeout(())
  //   }, 500);
  //   // canvas.style.display = '1';
  // }, 500);
  render();
})

window.addEventListener('keypress', (event) => {
  if (event.key == 'j') {
    canvas.style.display = 'block';
    canvas.classList.add('reveal');
    render();
  } else if (event.key == 'p') {
    pause();
  }
})

window.addEventListener('load', () => {
  fetchShaders();;
})
