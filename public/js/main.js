const canvas = document.getElementsByClassName('the-canvas')[0];
const iku = document.getElementById('iku');
const gl = canvas.getContext('webgl');
const theSetup = new ShaderSetup(gl, canvas);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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

async function fetchShaders() {
  let number = randomIntFromRange(1, 8);

  let data = {n: number}

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
  iku.style.opacity = '0';
  canvas.style.display = 'block';
  canvas.classList.add('reveal');
  theSetup.render();
}

function displayCanvas() {    
  canvas.style.display = 'block';
  canvas.classList.add('reveal');
  // theSetup.render();
}

function handleLoad() {
  fetchShaders();
}

function handleKeyPress(event) {
  if (event.key == 'j') {
    displayCanvas();
  } else if (event.key == 'p') {
    pause();
  }
}

iku.addEventListener('click', handleClick);
window.addEventListener('load', handleLoad);
window.addEventListener('keydown', handleKeyPress);