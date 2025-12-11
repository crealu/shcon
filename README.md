# Shcon
A project exploring GLSL shader programming in various contexts.

<br>
<img src="./public/img/capture1.png" width="300">
<br>
<a href="https://shcon-902b612ebe5d.herokuapp.com/random">Explore Shcon</a>

&nbsp;
## Requirements
Node.js 18+
```
node -v
```

npm 10+
```
npm -v
```

&nbsp;
## Installation & Setup
1. Clone repository
```
gh repo clone crealu/shcon
```

2. In project folder install dependencies
```
npm install
```

3. Start development server
```
npm run dev
```

4. Navigate to localhost in browser window
```
localhost:9800
```

&nbsp;
## Features
Animation start and stop controlled by user input.
- 'J' to start (and speed up)
- 'P' to stop (and slow down)

Application endpoints that serve pages with various functionality
<br>
<a href="https://shcon-902b612ebe5d.herokuapp.com/random">Random</a>
- `/random` displays a randomly chosen shader animation from the shaders folder 
<img src="./public/img/capture2.png" width="300">

&nbsp;
<a href="https://shcon-902b612ebe5d.herokuapp.com/mouse">Mouse</a>
- `/mouse` for mouse click interactivity
<img src="./public/img/capture3.png" width="300">

&nbsp;
<a href="https://shcon-902b612ebe5d.herokuapp.com/Dos">Dos</a>
- `/dos` renders animations in two separate canvases
<img src="./public/img/capture4.png" width="300">

&nbsp;
## ShaderSetup Documentation
Included in this project is a custom class, ShaderSetup, designed to simplify the setup, execution, and management of WebGL shader programs.
It handles shader compilation, buffer initialization, and rendering in each respective context.

&nbsp;
## Contributing
Want to contribute? Please fork the repository and submit a pull request.
