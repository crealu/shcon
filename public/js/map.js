mapboxgl.accessToken = '';

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

const helsinki = mapaboxgl.MercatorCoordinate.fromLngLat({
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

const highlightLayer = {
	id: 'highlight',
	type: 'custom',

	onAdd: function(map, gl) {
		const vertexSource = `
			uniform mat4 u_matrix;
			attribute vec4 a_position;
			void main() {
				gl_Position = u_matrix * vec4(a_position, 0.0, 1.0);
			}
		`;

		const fragmentSource = `
			void main() {
				gl_FragColor = vec4(1.0, 0.0, 0.0, 0.5);
			}
		`;

		const vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSrouce(vertexShader, vertextSource);
		gl.compileShader(vertexShader);

		const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragmentShader, fragmentSource);
		gl.compileShader(fragmentShader);

		this.program = gl.createProgram();
		gl.attachShader(this.program, vertexShader);
		gl.attachShader(this.program, fragmentShader);
		gl.linkProgram(this.program);

		this.aPos = gl.getAttribLocation(this.program, 'a_position');

	},

	render: function(gl, matrix) {
		gl.useProgram(this.program);
		gl.uniformMatrix4fv();
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
	}
}

map.on('load', () => {
	// map.addLayer(hightlightLayer);
});