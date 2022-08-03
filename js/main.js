let shaderProgram, buffers;
const theVS = vertShader;
const theFS = fragShader;

shaderProgram = initShaderProgram(gl, theVS, theFS);
buffers = initBuffers(gl);

setupProgram(gl, shaderProgram, buffers);
drawScene(gl, shaderProgram, buffers, 0.0);

// const uniformLocProjection = gl.getUniformLocation(shaderProgram, 'projection');
// const uniformLocView = gl.getUniformLocation(shaderProgram, 'projection');
// const uniformLocCTime = gl.getUniformLocation(shaderProgram, 'ctime');

let then = 0.0;
let raf;
function render(now) {
  now *= 0.001;
  const deltaTime = now - then;

  if (deltaTime >= 12.57) {
    window.cancelAnimationFrame(render);
    return;
  }

  drawScene(gl, shaderProgram, buffers, deltaTime);
  raf = window.requestAnimationFrame(render);
}
raf = window.requestAnimationFrame(render);
