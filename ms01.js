const canvas = document.getElementById('the-canvas');
let btn = document.querySelector('button');

btn.addEventListener('click', () => {
  console.log('clicked');
  btn.style.display = 'none';
  render();
});

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gl = canvas.getContext('webgl');
let time = 0.0;

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

const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vs);
const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fs);

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 3, 3, -1]), gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

const uResolution = gl.getUniformLocation(shaderProgram, 'u_resolution');
gl.uniform3f(uResolution, canvas.width, canvas.height, 1.0);

const uTime = gl.getUniformLocation(shaderProgram, 'u_time');
gl.uniform1f(uTime, time);

function render() {
  time += 0.01;
  gl.uniform1f(uTime, time);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  requestAnimationFrame(render);
}

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clearDepth(1.0);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
