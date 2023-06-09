var canvas;
var context;
var x_offset = 0;
var y_offset = 0;
var cell_size = 30;

var board;
var is_mouse_down = false;
var is_mouse_click = false;
var kb_highlight_cell = [0, 0]
var kb_highlight_duration = 5;
var kb_highlight_timeout = 0;

var simulate_delay = 1;
var simulate_delay_min = 0.01;
var simulate_delay_max = 10;
var simulate_timeout = 0;
var pause_simulation = true;

var simulate_delay_step = 0.05;
var zoom_factor = 2;

window.onload = init;


function togglePlayPause(isPlaying) {
	playButton = document.getElementById('play-button');
	pauseButton = document.getElementById('pause-button');

	playButton.classList.toggle('hidden', !isPlaying)
	pauseButton.classList.toggle('hidden', isPlaying)
}



function init() {
	canvas = document.getElementById('board-canvas');
	context = canvas.getContext('2d');

	canvas.width = document.body.clientWidth;
	canvas.height = document.body.clientHeight;

	board = new Board(canvas, 30, 1, 'black', 'gray');

	window.onresize = () => {
		canvas.width = document.body.clientWidth;
		canvas.height = document.body.clientHeight;
	};


	canvas.oncontextmenu = (e) => {
		e.preventDefault(); return false;
	}

	canvas.addEventListener('mousedown', (e) => {
		is_mouse_down = true;
		is_mouse_click = true;
		document.getElementById("help-msg-outer").classList.toggle("hidden", true);
	})


	canvas.addEventListener('mouseup', (e) => {
		is_mouse_down = false;
		if (is_mouse_click) {
			boardPosition = board.OnCellClick(e)
			kb_highlight_cell[0] = boardPosition[0]
			kb_highlight_cell[1] = boardPosition[1]
		}
	})

	canvas.addEventListener('mousemove', (e) => {
		if (is_mouse_down) {
			is_mouse_click = false
			board.OnScroll(e)
		}
	})

	// Move board with Keyboard
	window.addEventListener('keydown', (e) => {
		if (e.key == "Up" || e.key == "ArrowUp") {
			kb_highlight_cell[0] -= 1
			kb_highlight_timeout = kb_highlight_duration
		} else if (e.key == "Down" || e.key == "ArrowDown") {
			kb_highlight_cell[0] += 1
			kb_highlight_timeout = kb_highlight_duration
		} else if (e.key == "Left" || e.key == "ArrowLeft") {
			kb_highlight_cell[1] -= 1
			kb_highlight_timeout = kb_highlight_duration
		} else if (e.key == "Right" || e.key == "ArrowRight") {
			kb_highlight_cell[1] += 1
			kb_highlight_timeout = kb_highlight_duration
		} else if (e.key == "Enter") {
			kb_highlight_timeout = kb_highlight_duration
			board.OnCellKbKeyPress(kb_highlight_cell[0], kb_highlight_cell[1])
		} else if (e.key == " ") {
			pause_simulation = !pause_simulation;
			togglePlayPause(pause_simulation)
		}
	})


	// help button event
	document.getElementById("help-button").addEventListener("click", () => {
		document.getElementById("help-msg-outer").classList.toggle("hidden");
	})


	// play-pause-buttons
	document.getElementById("play-button").addEventListener("click", () => {
		pause_simulation = false;
		togglePlayPause(pause_simulation);
	})

	document.getElementById("pause-button").addEventListener("click", () => {
		pause_simulation = true;
		togglePlayPause(pause_simulation);
	})


	// fast-forward|backward
	document.getElementById("fast-forward").addEventListener("click", () => {
		simulate_delay -= simulate_delay_step
		simulate_delay = (simulate_delay < simulate_delay_min) ? simulate_delay_min : simulate_delay
	})

	document.getElementById("fast-backward").addEventListener("click", () => {
		simulate_delay += simulate_delay_step;
		simulate_delay = (simulate_delay > simulate_delay_max) ? simulate_delay_max : simulate_delay
	})

	// clear
	document.getElementById("clear-button").addEventListener("click", () => {
		board.resetWorld()
	})

	// zoom-in|out
	document.getElementById("zoom-out").addEventListener("click", () => {
		board.zoomWorld(-zoom_factor)
	})
	
	document.getElementById("zoom-in").addEventListener("click", () => {
		board.zoomWorld(zoom_factor)
	})

	// help msg
	let helpOuterContainer = document.getElementById("help-msg-outer");
	helpOuterContainer.addEventListener("click", () => {
		helpOuterContainer.classList.toggle("hidden", true)
	})

	document.getElementById("help-msg-inner").addEventListener("click", (e) => {
		e.stopPropagation()
	})

	document.getElementById("help-msg-close").addEventListener("click", (e) => {
		helpOuterContainer.classList.toggle("hidden", true)
		e.stopPropagation()
	})


	window.requestAnimationFrame(mainLoop);
}

function renderFPS(fps) {
	context.font = '18px Console';
	context.fillStyle = 'red';
	context.fillText(fps, 5, 20);
}


// Game of Life main loop
// Handles the rendering logic of the high level components of the game
//	such as the board
function mainLoop(timeStamp) {

	secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;		// elapsed time since last frame 
	this.oldTimeStamp = timeStamp;

	fps = Math.round(1 / secondsPassed);						// calculate fps

	context.fillStyle = 'red';
	context.fillRect(0, 0, canvas.width, canvas.height);		// Clear Canvas

	board.draw(context);

	// render cell highlighted by keyboard keypress
	if (kb_highlight_timeout > 0) {
		board.highlightCell(context, kb_highlight_cell[0], kb_highlight_cell[1], "yellow")
		kb_highlight_timeout -= secondsPassed
	}

	// simulate next generation
	if (!pause_simulation) {
		if (simulate_timeout <= 0) {
			board.simulateGeneration()
			simulate_timeout = simulate_delay
		} else {
			simulate_timeout -= secondsPassed
		}
	}

	renderFPS(fps);				// render fps

	// Keep requesting new frames
	window.requestAnimationFrame(mainLoop);
}

