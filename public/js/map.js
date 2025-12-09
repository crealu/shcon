let vertexSources = [
	{
		glsl: `
			uniform mat4 u_matrix;
			attribute vec2 a_position;
			void main() {
				gl_Position = u_matrix * vec4(a_position, 0.0, 1.0);
			}
		`
	}
]

let fragmentSources = [
	{
		glsl: `
			void main() {
				gl_FragColor = vec4(1.0, 0.0, 1.0, 0.5);
			}
		`
	},
	{
		glsl: `
			precision mediump float;

			uniform float u_time;

			void main() {

				vec2 shape = vec2(1.0, 1.0);
				vec3 c = vec3(1.0, 0.0, sin(u_time));

				c *= length(shape) + 0.5;

				gl_FragColor = vec4(c, 0.5);
			}
		`
	},
	{
		glsl: `
			precision mediump float;

			uniform vec3 u_resolution;
			uniform float u_time;

			void main() {
				vec2 view = 2.0 * gl_FragCoord.xy - u_resolution.xy;
				float axis = u_resolution.y;
				vec2 field = view / axis;

				float shape = length(field) - 0.5;
				vec3 c = vec3(1.0, 0.0, sin(u_time));

				c *= smoothstep(0.5, 0.51, shape);

				gl_FragColor = vec4(c, 0.5);
			}
		`
	}
]

let time = 1.0;
let running = true;

function initializeMapbox() {
	const map = new mapboxgl.Map({
		container: 'map',
		zoom: 3,
		center: [7.5, 58],
		style: 'mapbox://styles/mapbox/standard',
		config: {
			basemap: {
				theme: 'monochrome'
			}
		},
		antialias: true,
		projection: 'mercator'
	});

	const helsinki = mapboxgl.MercatorCoordinate.fromLngLat({
		lng: 25.004,
		lat: 60.239
	})

	const berlin = mapboxgl.MercatorCoordinate.fromLngLat({
		lng: 13.403,
		lat: 52.562
	});

	const kyiv = mapboxgl.MercatorCoordinate.fromLngLat({
		lng: 30.498,
		lat: 50.541
	});

	const budapest = mapboxgl.MercatorCoordinate.fromLngLat({
		lng: 47.56,
		lat: 18.99
	});

	let positions = [
		helsinki.x,
		helsinki.y,
		berlin.x,
		berlin.y,
		kyiv.x,
		kyiv.y,
		budapest.x,
		budapest.y
	];

	const highlightLayer = {
		id: 'highlight',
		type: 'custom',

		onAdd: function(map, gl) {
			const vertexSource = vertexSources[0].glsl;
			const fragmentSource = fragmentSources[2].glsl;

			const vertexShader = gl.createShader(gl.VERTEX_SHADER);
			gl.shaderSource(vertexShader, vertexSource);
			gl.compileShader(vertexShader);

			const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
			gl.shaderSource(fragmentShader, fragmentSource);
			gl.compileShader(fragmentShader);

			this.program = gl.createProgram();
			gl.attachShader(this.program, vertexShader);
			gl.attachShader(this.program, fragmentShader);
			gl.linkProgram(this.program);

			this.aPos = gl.getAttribLocation(this.program, 'a_position');

			this.buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
		},

		render: function(gl, matrix) {
			time += 0.01;
			gl.useProgram(this.program);

			gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

			this.uMatrix = gl.getUniformLocation(this.program, 'u_matrix');
			gl.uniformMatrix4fv(this.uMatrix, false, matrix);

			this.uTime = gl.getUniformLocation(this.program, 'u_time');
			gl.uniform1f(this.uTime, time);

			this.uResolution = gl.getUniformLocation(this.program, 'u_resolution');
			gl.uniform3f(this.uResolution, 600, 500, 1.0);

			gl.enableVertexAttribArray(this.aPos);
			gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);

			// this line breaks the computer
			// map.triggerRepaint()

			if (!running) {
				console.log('Program stopped');
				console.log(`Time: ${time}`)
			}
		}
	}

	map.on('load', () => {
		map.addLayer(highlightLayer);
	});

	map.on('click', (event) => {
		let longitude = event.lngLat.lng;
		let latitude = event.lngLat.lat;
		const location = mapboxgl.MercatorCoordinate.fromLngLat({
			lng: longitude,
			lat: latitude
		});

		console.log(location);
		console.dir(location);
	})
}

async function handlePageLoad() {
	const res = await fetch('/token');
	const json = await res.json();
	const token = json.data;
	mapboxgl.accessToken = token;
	initializeMapbox();
}

function handleKeyDown(event) {
	if (event.key == 'p') {
		running = false;
	}
}

window.addEventListener('load', handlePageLoad);
window.addEventListener('keydown', handleKeyDown);