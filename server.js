const express = require('express');
const port = process.env.PORT || 9800;
const app = express();

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

app.get('/dos', (req, res) => {
	res.sendFile('dos.html', root);
});

app.get('/mouse', (req, res) => {
	res.sendFile('mouse.html', root);
});

app.post('/mouse-shaders', (req, res) => {
	res.sendFile('shaders/09/both.glsl', root);
});

app.post('/one-shader', (req, res) => {
	res.sendFile(`shaders/0${req.body.n.toString()}/both.glsl`, root);
});

app.post('/shaders', (req, res) => {
	let sn = req.body.n.toString();
	console.log(sn);
	res.sendFile('shaders/0' + sn + '/both.glsl', root);
});

app.listen(port, () => { console.log(`listening on ${port}`) });
