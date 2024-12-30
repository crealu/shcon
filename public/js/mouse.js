const canvas = document.getElementsByClassName('the-canvas')[0];
const btn = document.getElementsByClassName('start-btn')[0];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gl = canvas.getContext('webgl');
let termination = 12;
let mouse = { x: 0, y: 0 }
let time = 0.0;
// let uniformTime;
// let uniforomMouse;

let uniforms = {
  time: null,
  mouse: null
};

let theProgram;
let id;
let vs, fs;

let red = 1.0;
let drag = false;
let dragStart;
let dragEnd;
let cameraZ = 0.0;
let cameraZChange = 0.5;
let timeLimit = 12

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

  const uMouse = gl.getUniformLocation(theProgram, 'u_mouse');
  gl.uniform2f(uMouse, mouse.x, mouse.y);

  // const uCameraZ = gl.getUniformLocation(theProgram, 'u_camera_z');
  // gl.uniform1f(uCameraZ, cameraZ);

  return {
    time: uTime,
    mouse: uMouse
  }
} 

function start(theVS, theFS) {
  theProgram = initShaderProgram(theVS, theFS);
  initBuffers();
  initLocation();
  uniforms = initUniforms();
}

function parseBoth(text) {
  let shaders = text.split('//**');
  vs = shaders[0];
  fs = shaders[1];

  console.log(vs);
  start(shaders[0], shaders[1]);
}

async function fetchShaders() {
  const data = {};

  const options = {
    method: 'post',
    headers: {'Content-Type': 'application/json'},    
    body: JSON.stringify(data)
  }

  await fetch('/mouse-shaders', options)
    .then(res => res.text())
    .then(data => { parseBoth(data) })
    .catch(err => { console.log(err) })
}

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clearDepth(1.0);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);

function render() {
  time += 0.01;
  mouse = mouse;
  // uniforms.cameraZ = lerp(uniforms.cameraZ, cameraZChange, 0.01);

  gl.uniform1f(uniforms.time, time);
  gl.uniform2f(uniforms.mouse, mouse.x, mouse.y);
  // gl.uniform1f(uniforms.cameraZ, cameraZ);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  if (time >= timeLimit) {
    window.cancelAnimationFrame(render);
    window.location.reload();
    return;
  }

  id = window.requestAnimationFrame(render);

  // if (time < termination) {
  //     requestAnimationFrame(render);
  // } else {
  //     cancelAnimationFrame(render);
  // }
}

// function lerp(a, b, alpha) {
//   return a + alpha * (b - a);
// }

function handleButtonClick() {
  btn.classList.add('hide');
  canvas.classList.add('reveal');
  render();
}

function handleMouseDown(event) {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
  drag = true;
}

function handleMouseMove(event) {
  if (drag) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    dragStart = dragEnd;
  }
}

function handleMouseUp(event) {
  drag = false;
  mouse.x = event.clientX;
  mouse.y = event.clientY;
}

function handleKeyPress(event) {
  if (event.key == 'j') {    
    btn.classList.add('hide');
    canvas.classList.add('reveal');
    render();
  }

  if (event.key == 'w') {
    // cameraZ += 0.05;
    cameraZChange += 0.05;
  } else if (event.key == 's') {
    // cameraZ -= 0.05;
    cameraZChange -= 0.05;
  }
  console.log(cameraZ);
}

function handleLoad() {
  fetchShaders();
}

btn.addEventListener('click', handleButtonClick);
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
window.addEventListener('keypress', handleKeyPress);
window.addEventListener('load', handleLoad);

// redInput.addEventListener('input', () => {
//   console.log(redInput.value);
//   red = parseInt(redInput.value);
// })

// window.addEventListener('click', (event) => {
//   mouse.x = event.clientX;
//   mouse.y = event.clientY;
// });

