const express = require('express');
const port = 9800;
const app = express();

app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

const root = { root: './' }

app.get('/', (req, res) => {
	res.sendFile('index.html', root);
});

app.get('/get-shaders', (req, res) => {
	res.sendFile('shaders/01/both.glsl', root);
});

app.listen(port, () => { 
	console.log(`listening on ${port}`)
});