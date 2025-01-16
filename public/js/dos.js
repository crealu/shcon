const canvas1 = document.getElementById('cnv-1');
const canvas2 = document.getElementById('cnv-2');
const iku = document.getElementById('iku');

// canvas1.width = window.innerWidth;
// canvas1.height = window.innerHeight;
// canvas2.width = window.innerWidth;
// canvas2.height = window.innerHeight;

const gl1 = canvas1.getContext('webgl');
const gl2 = canvas2.getContext('webgl');

const setup1 = new ShaderSetup(gl1, canvas1);
const setup2 = new ShaderSetup(gl2, canvas2);

function parseBoth(text) {
  console.log(text);
  let shaders = text.split('//**');
  setup(shaders[0], shaders[1]);
}

async function fetchShaders() {
  const data = { n: 1 };

  const options = {
    method: 'post',
    headers: {'Content-Type': 'application/json'},    
    body: JSON.stringify(data)
  }

  await fetch('/shaders', options)
    .then(res => res.text())
    .then(data => { parseBoth(data) })
    .catch(err => { console.log(err) })
}

function setup(vs, fs) {
  setup1.initProgram(vs, fs);
  setup1.initBuffers();
  setup1.initLocations();  

  setup2.initProgram(vs, fs);
  setup2.initBuffers();
  setup2.initLocations();
}

function start() {
  setup1.render();
  setup2.render();
}

function handleClick() {
  iku.style.opacity = '0';
  canvas1.classList.add('reveal');
  canvas2.classList.add('reveal');
  start();
}

function displayCanvas() {    
  canvas.style.display = 'block';
  canvas.classList.add('reveal');
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
