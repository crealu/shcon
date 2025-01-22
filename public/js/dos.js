const canvas1 = document.getElementById('cnv-1');
const canvas2 = document.getElementById('cnv-2');
const iku = document.getElementById('iku');
const gl1 = canvas1.getContext('webgl', { alpha: true });
const gl2 = canvas2.getContext('webgl', { alpha: true });

const setup1 = new AlphaShader(gl1, canvas1);
const setup2 = new AlphaShader(gl2, canvas2);

function parseBoth(text) {
  let shaders = text.split('//**');
  setup(shaders[0], shaders[1]);
}

async function fetchShaders() {
  const data = { n: 8 };
  // alpha works with 5

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

function pause() {
  setup1.pause();
  setup2.pause();
}

function handleClick() {
  // iku.style.opacity = '0';
  canvas1.classList.add('reveal');
  canvas2.classList.add('reveal');
  start();
}

function handleLoad() {
  fetchShaders();
}

function handleKeyPress(event) {
  if (event.key == 'j') {
    handleClick();
    console.log('started')
  } else if (event.key == 'p') {
    pause();
  }
}

iku.addEventListener('click', handleClick);
window.addEventListener('load', handleLoad);
window.addEventListener('keydown', handleKeyPress);
