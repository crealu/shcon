mapboxgl.accessToken = 'pk.eyJ1Ijoic2hjb25yZXMiLCJhIjoiY201eGFpaGtrMDA1dDJucHRodnZ4aDRvayJ9.hhgg_FcQRxFw3F7CUZPuBg';

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

// const helsinki = mapaboxgl.MercatorCoordinate.fromLngLat({
// 	lng: 25.004,
// 	lat: 60.239
// })

// const berlin = mapboxgl.MercatorCoordinate.fromLngLat({
// 	lng: 13.403,
// 	lat: 52.562
// });

// const kyiv = mapboxgl.MercatorCoordinate.fromLngLat({
// 	lng: 30.498,
// 	lat: 50.541
// });

const helsinki = mapboxgl.MercatorCoordinate.fromLngLat({
	lng: 25.004,
	lat: 60.239
})

const berlin = mapboxgl.MercatorCoordinate.fromLngLat({
	lng: 13.403,
	lat: 52.562
});

const kyiv = mapboxgl.MercatorCoordinate.fromLngLat({
	lng: 0.0,
	lat: 0.0
});

// const place = mapboxgl.MercatorCoordinate.fromLngLat({
// 	lng: 0.0,
// 	lat: 0.0
// });

let positions = [
	helsinki.x,
	helsinki.y,
	berlin.x,
	berlin.y,
	kyiv.x,
	kyiv.y
];

let time = 0.0;

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

		const fragmentSource = `
			uniform float u_time;

			void main() {
		    vec3 color = vec3(1.0, 0.5, 0.5);
				gl_FragColor = vec4(color, 0.5);
			}
		`;

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
		gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.aPos);

		// this.uMatrix = gl.getUniformLocation(this.program, 'u_matrix');
		// gl.uniformMatrix4fv(this.uMatrix, false, matrix);

		this.buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

		gl.useProgram(this.program);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	},

	render: function(gl, matrix, time) {
		time += 0.01;

		gl.uniformMatrix4fv(
			gl.getUniformLocation(this.program, 'u_matrix'),
			matrix
		);

		gl.uniform1f(
			gl.getUniformLocation(this.program, 'u_time'), time
		);

		// gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		// gl.enableVertexAttribArray(this.aPos);
		// gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);
		console.log(time);

		this.render_id = window.requestAnimationFrame(() => this.render(gl, matrix, time));


		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
	}
}

map.on('load', () => {
	map.addLayer(highlightLayer);
});