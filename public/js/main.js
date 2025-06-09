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
let theSetup = new ShaderSetup(gl, canvas);

function parseBoth(text) {
  let shaders = text.split('//**');
  start(shaders[0], shaders[1]);
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
    .then(data => { parseBoth(data) })
    .catch(err => { console.log(err) })
}

function start(vs, fs) {
  theSetup.initProgram(vs, fs);
  theSetup.initBuffers();
  theSetup.initLocations();
} 

function handleClick() {
  // iku.style.opacity = '0';
  foreground.classList.add('vanish');
  canvas.classList.add('reveal');
  controls.classList.add('reveal');
  theSetup.render();
}

function displayCanvas() {    
  canvas.classList.add('reveal');
}

function handleLoad() {
  fetchShader(1);
}

function handleKeyPress(event) {
  if (event.key == 'j') {
    displayCanvas();
  } else if (event.key == 'p') {
    theSetup.pause();
  }
}

function changeOption(event) {
  let number = parseInt(event.target.value);
  fetchShader(number);
}

function handlePause(event) {
  theSetup.pause();
}

function handleReset(event) {
  theSetup.reset();
}

selection.addEventListener('change', changeOption)
iku.addEventListener('click', handleClick);
pauseButton.addEventListener('click', handlePause);
resetButton.addEventListener('click', handleReset);
window.addEventListener('load', handleLoad);
window.addEventListener('keydown', handleKeyPress);