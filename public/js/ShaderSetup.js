class ShaderSetup {
	constructor(canvasElement, vertexShader, fragmentShader) {
		this.canvas = canvasElement;
		this.gl = null;
		this.program = null;
		this.time = 0.0;
		this.limit = 12;
		this.uTime = '';
		this.id = '';
		this.vs = vertexShader;
		this.fs = fragmentShader;
		this.setup();
	}

	loadShader(gl, type, source) {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			gl.deleteShader(shader);
			return null;
		}

		return shader;
	}

	initProgram(vsSource, fsSource) {
		const vertexShader = loadShader(this.gl, this.gl.VERTEX_SHADER, vsSource);
		const fragmentShader = loadShader(this.gl, this.gl.FRAGMENT_SHADER, fsSource);

		const shaderProgram = gl.createProgram();
		this.gl.attachShader(shaderProgram, vertexShader);
		this.gl.attachShader(shaderProgram, fragmentShader);
		this.gl.linkProgram(shaderProgram);
		this.gl.useProgram(shaderProgram);

		return shaderProgram;
	}

	initBuffers() {
		const positionBuffer = gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 3, 3, -1]), this.gl.STATIC_DRAW);
	}

	initLocation() {
		const positionLocation = gl.getAttribLocation(this.program, "a_position");
		this.gl.enableVertexAttribArray(positionLocation);
		this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);  
	}

	initUniforms() {
		const uResolution = this.gl.getUniformLocation(this.program, 'u_resolution');
		this.gl.uniform3f(uResolution, canvas.width, canvas.height, 1.0);

		const uniformTime =this. gl.getUniformLocation(this.program, 'u_time');
		this.gl.uniform1f(uniformTime, time);

		return uniformTime;
	}

	setup() {
		this.gl = this.canvas.getContext('webgl');
		this.program = initProgram(this.vs, this.fs);
		this.initBuffer();
		this.initLocation();
		this.uTime = this.initUniforms();

		this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		this.gl.clearDepth(1.0);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);
	}

	clear() {

	}

	render() {
		this.time += 0.01;

		this.gl.uniform1f(this.uniformTime, this.time);
		this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);  

		if (this.time >= this.limit) {
			window.cancelAnimationFrame(this.render);
			return;
		}

		this.id = window.requestAnimationFrame(this.render);
	}

	pause() {
		window.cancelAnimationFrame(this.id);
	}
}