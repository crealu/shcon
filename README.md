# Shcon
A project exploring GLSL shader programming and a consideration on its implementation in user intefaces and experiences.

<a href="https://shcon-902b612ebe5d.herokuapp.com/random">Live</a>
<br>
<img src="./public/img/capture1.png" width="300">


&nbsp;
## Prerequisites
Node.js (v18.16.0 or greater) installed on local machine.

&nbsp;
## Installation & Setup
1. Clone the repository.
2. Navigate to cloned directory and run `npm i`
3. In a terminal window, run `npm run dev`
4. Open browser window to localhost:9800

&nbsp;
## Featues
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
This project includes a custom class, ShaderSetup, designed to simplify the setup, creation, and management of WebGL shader programs renderd on an HTML canvas.
It handles shader compilation, buffer initialization, and rendering on an HTML canvas.



&nbsp;
## Contributing
Want to contribute? Please fork the repo and submit a pull request.
