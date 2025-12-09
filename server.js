const express = require('express');
const port = process.env.PORT || 9800;
const app = express();

// const dotenv = require('dotenv');
// dotenv.config({ path: '.env' });

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

const root = { root: './public' }

app.get('/', (req, res) => {
	res.sendFile('index.html', root);
});

app.get('/random', (req, res) => {
	res.sendFile('random.html', root);
});

app.get('/mouse', (req, res) => {
	res.sendFile('mouse.html', root);
});

app.get('/map', (req, res) => {
	res.sendFile('map.html', root);
});

app.get('/token', (req, res) => {
	const token = process.env.MAPBOX_TOKEN;
	res.send({ data: token });
})

app.post('/mouse-shaders', (req, res) => {
	res.sendFile('shaders/09/both.glsl', root);
});

app.post('/one-shader', (req, res) => {
	let n = req.body.n.toString();

	if (n.length == 1) {
		n = '0' + n;
	}

	res.sendFile(`shaders/${n}/both.glsl`, root);
});

app.post('/shaders', (req, res) => {
	let sn = req.body.n.toString();
	console.log(sn);
	res.sendFile('shaders/0' + sn + '/both.glsl', root);
});

app.listen(port, () => { console.log(`listening on ${port}`) });
