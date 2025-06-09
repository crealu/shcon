class ShaderSetup {
	constructor(gl, cnv) {
		this.program = null;
		this.gl = gl;
		this.vs = null;
		this.fs = null;
		this.buffers = null;
		this.positions = [];
		this.canvas = cnv;
		this.uTime = '';
		this.time = 0.0;
		this.limit = 12;
		this.id = '';
	}

	setup(vs, fs) {
		this.initProgram(vs, fs);
		this.initBuffers();
		this.initLocations();
		this.clear();
		this.render();
	}

	loadShader(type, source) {
		const shader = this.gl.createShader(type);
		this.gl.shaderSource(shader, source);
		this.gl.compileShader(shader);

		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			this.gl.deleteShader(shader);
			return null;
		}

		return shader;
	}

	initProgram(vsSource, fsSource) {
		this.vs = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
		this.fs = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

		const shaderProgram = this.gl.createProgram();
		this.gl.attachShader(shaderProgram, this.vs);
		this.gl.attachShader(shaderProgram, this.fs);
		this.gl.linkProgram(shaderProgram);
		this.gl.useProgram(shaderProgram);

		this.program = shaderProgram;
	}

	initBuffers() {
		this.positions = [-1, -1, -1, 3, 3, -1];

		const positionBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.positions), this.gl.STATIC_DRAW);
	
		this.buffers = {
			position: positionBuffer
		}
	}

	initLocations() {
		this.gl.useProgram(this.program);

		const positionLocation = this.gl.getAttribLocation(this.program, "a_position");
		this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);  
		this.gl.enableVertexAttribArray(positionLocation);

		const uResolution = this.gl.getUniformLocation(this.program, 'u_resolution');
		this.gl.uniform3f(uResolution, this.canvas.width, this.canvas.height, 1.0);

		const uniformTime = this.gl.getUniformLocation(this.program, 'u_time');
		this.gl.uniform1f(uniformTime, this.time);

		// this.gl.enable(gl.BLEND);
		// this.gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		this.uTime = uniformTime;	
	}

	reset() {
		this.time = 0;
		this.render();
	}

	clear() {
		// this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		// this.gl.clearDepth(1.0);
		// this.gl.enable(this.gl.DEPTH_TEST);
		// this.gl.depthFunc(this.gl.LEQUAL);

		this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		// this.gl.clearDepth(1.0);
		this.gl.enable(gthis.l.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);
	}

	pause() {
		window.cancelAnimationFrame(this.id);
	}

	render() {
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

// class AlphaShader extends ShaderSetup {
// 	constructor(gl, canvas) {
// 		super(gl, canvas);
// 	}

// 	clear() {		
// 		// this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
// 		// // this.gl.clearDepth(1.0);
// 		// this.gl.enable(this.gl.DEPTH_TEST);
// 		// this.gl.depthFunc(this.gl.LEQUAL);


// 		gl.clearColor(0.0, 0.0, 0.0, 0.0);
// 		gl.clear(gl.COLOR_BUFFER_BIT);
// 		// gl.clearDepth(1.0);
// 		gl.enable(gl.DEPTH_TEST);
// 		gl.depthFunc(gl.LEQUAL);

// 	}
// }

