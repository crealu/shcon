# Shcon
A project that explores GLSL programming and various shaders in context.

<br>
<img src="./public/img/capture1.png" width="300">
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

<br>
<img src="./public/img/capture3.png" width="300">

&nbsp;
## Features

- Selectable shader programs
- Randomly regenerating drawings
- Animation start, stop and reset
- Drawing mode toggle
- Keyboard input
- Mouse input
- Page menu navigation
- Custom ShaderSetup class definition

&nbsp;
## Contexts

### HTML Canvas
Program renders and animates within a standard HTML canvas element.

### MapboxGL Custom Layer
Program renders as a fill for custom MapboxGL layer.

&nbsp;
## ShaderSetup Documentation
Included in this project is a custom class, ShaderSetup, designed to simplify the setup, execution, and management of WebGL shader programs.
It handles shader compilation, buffer initialization, and rendering in each respective context.

&nbsp;
## Contributing
Want to contribute? Please fork the repository and submit a pull request.
