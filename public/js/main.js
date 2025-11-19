const canvas = document.getElementsByClassName('the-canvas')[0];
const startBtn = document.getElementsByClassName('start-btn')[0];
const selection = document.getElementsByClassName('selection')[0];
const foreground = document.getElementsByClassName('foreground')[0];
const controls = document.getElementsByClassName('controls')[0];
const pauseButton = document.getElementsByClassName('control-btn')[0];
const resetButton = document.getElementsByClassName('control-btn')[1];
const cancelButton = document.getElementsByClassName('control-btn')[2];
const keyInfo = document.getElementsByClassName('key-info')[0];

// if gl is initialized before setting canvas width and height, 
// the canvas will visually be cut off at the screens halfway point

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gl = canvas.getContext('webgl');
let standardSetup = new ShaderSetup(gl, canvas);
let inputSetup = new ShaderInputSetup(gl, canvas);
let program;
let shaderNumber = 0;

function parseBoth(sn, text) {
  let shaders = text.split('//**');
  program = sn == 11 || sn == 2 ? inputSetup : standardSetup;
  shaderNumber = sn;
  start(program, shaders[0], shaders[1]);
}

function parseAll(text) {
  progs = text.split('$$$');

  progs.forEach(program => {
    let shaders = program.split('**//');
    programs.push(shaders);
  });

  let vs = programs[0][0];
  let fs = programs[0][1];
  start(vs, fs);
}

function randomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min * 1) + min);
}

async function fetchShader(shaderNumber) {
  let data = { n: shaderNumber }

  const options = {
    method: 'post',
    headers: {'Content-Type': 'application/json'},    
    body: JSON.stringify(data)
  }

  await fetch('/one-shader', options)
    .then(res => res.text())
    .then(data => { 
      parseBoth(shaderNumber, data)
    })
    .catch(err => { console.log(err) })
}

function start(setup, vs, fs) {
  setup.initProgram(vs, fs);
  setup.initBuffers();
  setup.initLocations();
  program = setup;
}

function handleClick() {
  foreground.classList.add('vanish');
  // canvas.classList.add('reveal');
  // controls.classList.add('reveal');
  if (shaderNumber == 2) {
    keyInfo.style.display = 'block';
  }

  program.running = true;

  setTimeout(() => {
    program.render();
    canvas.classList.add('reveal');
  }, 350);

  setTimeout(() => {
    controls.classList.add('reveal');
  }, 350);
}

function showForeground() {
  foreground.classList.remove('vanish');
}

function displayCanvas() {    
  canvas.classList.add('reveal');
}

function hideCanvas() {
  canvas.classList.remove('reveal');
}

function handleLoad() {
  fetchShader(1);
}

function changeUniforms(key) {
  if (key == 'o') {
    program.offset = program.offset == 3.0 ? 2.0 : 3.0;
  } else if (key == 'a') {
    program.axis = program.axis == 1.0 ? 0.0 : 1.0;
  } else if (key == 's') {
    program.size = program.size == 0.1 ? 0.3 : 0.1;
  } else if (key == 'c') {
    console.log('change color');
  }
}

function handleKeyPress(event) {
  if (event.key == 'j') {
    displayCanvas();
  } else if (event.key == 'p') {
    program.pause();
  } else {
    changeUniforms(event.key);
  }
  changeMode(event);
}

function changeOption(event) {
  let number = parseInt(event.target.value);
  fetchShader(number);
}

function handlePause(event) {
  let source = ''
  if (program.running) {
    program.pause();
    source = './img/play-btn.png';
  } else {
    program.resume();
    source = './img/pause-btn.png';
  }

  pauseButton.children[0].src = source;
}

function handleReset(event) {
  program.reset();
}

function handleCancel(event) {
  controls.classList.remove('reveal');
  hideCanvas();

  setTimeout(() => {
    program.reset();
    program.pause();
    showForeground();
  }, 400)
}

function changeMode(event) {
  if (event.key == 'm') {
    if (program.mode == 3.0) {
      program.mode = 0.0;
    } else {
      program.mode += 1.0;
    }
  }
  console.log(program.mode);
}

selection.addEventListener('change', changeOption)
startBtn.addEventListener('click', handleClick);
pauseButton.addEventListener('click', handlePause);
resetButton.addEventListener('click', handleReset);
cancelButton.addEventListener('click', handleCancel);
window.addEventListener('load', handleLoad);
window.addEventListener('keydown', handleKeyPress);