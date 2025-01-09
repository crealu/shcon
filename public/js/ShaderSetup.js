class ShaderSetup {
	constructor(gl, canvas) {
		this.program = null;
		this.gl = gl;
		this.vs = null;
		this.fs = null;
		this.buffers = null;
		this.positions = [];

		this.canvas = canvas;
		this.uTime = '';
		this.time = 0.0;
		this.limit = 12;
		this.id = '';
	}

	initProgram(vsSource, fsSource) {
		this.vs = loadShader(this.gl, this.gl.VERTEX_SHADER, vsSource);
		this.fs = loadShader(this.gl, this.gl.FRAGMENT_SHADER, fsSource);

		const shaderProgram = this.gl.createProgram();
		this.gl.attachShader(shaderProgram, this.vs);
		this.gl.attachShader(shaderProgram, this.fs);
		this.gl.linkProgram(shaderProgram);
		this.gl.useProgram(shaderProgram);

		this.program = shaderProgram;
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

	initBuffers() {
		this.positions = [-1, -1, -1, 3, 3, -1];

		const positionBuffer = gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.positions), this.gl.STATIC_DRAW);
	
		this.buffers = {
			position: positionBuffer
		}
	}

	initLocations() {
		this.gl.useProgram(this.program);

		const positionLocation = gl.getAttribLocation(this.program, "a_position");
		this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);  
		this.gl.enableVertexAttribArray(positionLocation);

		const uResolution = this.gl.getUniformLocation(this.program, 'u_resolution');
		this.gl.uniform3f(uResolution, this.canvas.width, this.canvas.height, 1.0);

		const uniformTime =this. gl.getUniformLocation(this.program, 'u_time');
		this.gl.uniform1f(uniformTime, time);

		this.uTime = uniformTime;	
	}

	setup() {
		this.initProgram(this.vs, this.fs);
		this.initBuffers();
		this.initLocations();
		this.render();
	}

	reset(vs, fs) {
		this.initProgram(vs, fs);
		this.initBuffers();
		this.initLocations();
		this.render();
	}

	clear() {
		this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		this.gl.clearDepth(1.0);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);
	}

	pause() {
		window.cancelAnimationFrame(this.id);
	}

	render() {
		this.clear();

		this.time += 0.01;

		this.gl.uniform1f(this.uTime, this.time);
		this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);  

		if (this.time >= this.limit) {
			this.pause();
			return;
		}

		this.id = window.requestAnimationFrame(() => this.render());
	}
}