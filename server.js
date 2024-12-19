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

app.post('/one-shader', (req, res) => {
	res.sendFile('shaders/07/both.glsl', root);
});

app.post('/shaders', (req, res) => {
	let n = req.body.n;
	res.sendFile('shaders/0' + n + '/both.glsl', root);
})

app.listen(port, () => { 
	console.log(`listening on ${port}`)
});