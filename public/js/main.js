const canvas = document.getElementsByClassName('the-canvas')[0];
const iku = document.getElementById('iku');
const selection = document.getElementsByClassName('selection')[0];
const foreground = document.getElementsByClassName('foreground')[0];
const controls = document.getElementsByClassName('controls')[0];
const pauseButton = controls.children[0];
const resetButton = controls.children[1];

// if gl is initialized before setting canvas width and height, 
// the canvas will visually be cut off at the screens halfway point

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gl = canvas.getContext('webgl');
let standardSetup = new ShaderSetup(gl, canvas);
let inputSetup = new ShaderInputSetup(gl, canvas);
let program;

function parseBoth(sn, text) {
  let shaders = text.split('//**');
  program = sn == 11 || sn == 2 ? inputSetup : standardSetup;
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
  // iku.style.opacity = '0';
  foreground.classList.add('vanish');
  canvas.classList.add('reveal');
  controls.classList.add('reveal');
  program.render();
}

function displayCanvas() {    
  canvas.classList.add('reveal');
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
  program.pause();
}

function handleReset(event) {
  program.reset();
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
iku.addEventListener('click', handleClick);
pauseButton.addEventListener('click', handlePause);
resetButton.addEventListener('click', handleReset);
window.addEventListener('load', handleLoad);
window.addEventListener('keydown', handleKeyPress);