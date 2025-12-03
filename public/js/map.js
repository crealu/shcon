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
			void main() {
				vec3 c = vec3(1.0, 0.0, 1.0);
				gl_FragColor = vec4(c, 0.5);
			}
		`
	}
]

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

	let positions = [
		helsinki.x,
		helsinki.y,
		berlin.x,
		berlin.y,
		kyiv.x,
		kyiv.y
	];

	const highlightLayer = {
		id: 'highlight',
		type: 'custom',

		onAdd: function(map, gl) {
			const vertexSource = `
				uniform mat4 u_matrix;
				attribute vec2 a_position;
				void main() {
					gl_Position = u_matrix * vec4(a_position, 0.0, 1.0);
				}
			`;

			const fragmentSource = fragmentSources[0].glsl;

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
			gl.useProgram(this.program);
			gl.uniformMatrix4fv(
				gl.getUniformLocation(this.program, 'u_matrix'),
				false,
				matrix
			);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
			gl.enableVertexAttribArray(this.aPos);
			gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
		}
	}

	map.on('load', () => {
		map.addLayer(highlightLayer);
	});
}

async function handlePageLoad() {
	const res = await fetch('/token');
	const json = await res.json();
	const token = json.data;
	mapboxgl.accessToken = token;
	initializeMapbox();
}

window.addEventListener('load', handlePageLoad);