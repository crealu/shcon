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
// let inputSetup = new ShaderInputSetup(gl, canvas);
let program;

function parseBoth(sn, text) {
  let shaders = text.split('//**');
  program = sn == 11 ? inputSetup : standardSetup;
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

function handleKeyPress(event) {
  if (event.key == 'j') {
    displayCanvas();
  } else if (event.key == 'p') {
    program.pause();
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

// class ShaderInputSetup extends ShaderSetup {
//   constructor(gl, canvas) {
//     super(gl, canvas);
//     this.offset = 2.0;
//     this.axis = 0.0;
//     this.size = 0.5;
//     this.color = [0.0, 0.5, 1.0];
//   }

//   initLocations() {
//     this.gl.useProgram(this.program);

//     const positionLocation = this.gl.getAttribLocation(this.program, "a_position");
//     this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);  
//     this.gl.enableVertexAttribArray(positionLocation);

//     const uResolution = this.gl.getUniformLocation(this.program, 'u_resolution');
//     this.gl.uniform3f(uResolution, this.canvas.width, this.canvas.height, 1.0);

//     const uniformTime = this.gl.getUniformLocation(this.program, 'u_time');
//     this.gl.uniform1f(uniformTime, this.time);

//     const uniformOffset = this.gl.getUniformLocation(this.program, 'u_offset');
//     this.gl.uniform1f(uniformOffset, this.offset);

//     const uniformAxis = this.gl.getUniformLocation(this.program, 'u_axis');
//     this.gl.uniform1f(uniformAxis, this.axis);    

//     const uniformSize = this.gl.getUniformLocation(this.program, 'u_size');
//     this.gl.uniform1f(uniformSize, this.size);    

//     const uniformColor = this.gl.getUniformLocation(this.program, 'u_color');
//     this.gl.uniform3f(uniformColor, this.color[0], this.color[1], this.color[2]);
    
//     this.uTime = uniformTime; 
//   }

//   render() {
//     this.time += 0.01;

//     this.gl.uniform1f(this.uTime, this.time);
//     this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);  

//     if (this.time >= this.limit) {
//       this.pause();
//       return;
//     }

//     this.id = window.requestAnimationFrame(() => this.render());
//   }
// }