var canvas;
var context;
var x_offset = 0;
var y_offset = 0;
var cell_size = 30;

var board;
var is_mouse_down = false;
var is_mouse_click = false;
var kb_highlight_cell = [0,0]
var kb_highlight_duration = 5;
var kb_highlight_timeout = 0;

var simulate_delay = 2;
var simulate_timeout = 0;
var pause_simulation = false;


window.onload = init;

// Initialize canvas & context and request rendering of the first frame
function init() {
	canvas = document.getElementById('board-canvas');
	context = canvas.getContext('2d');

	canvas.width = document.body.clientWidth;
	canvas.height = document.body.clientHeight;

	board = new Board(canvas, 30, 1, 'black', 'gray' );

	

	//board.scroll(50, 50);

	// resize canvas on window resize
	window.onresize = () => {
		canvas.width = document.body.clientWidth;
		canvas.height = document.body.clientHeight;
	};

	// disable context menu from canvas
	canvas.oncontextmenu = (e) => { 
		e.preventDefault(); return false;
	}

	// Set event listeners for manipulating the board
		// Move board with Mouse
		canvas.addEventListener('mousedown', (e) => {
			is_mouse_down = true;
			is_mouse_click = true;

			let help = document.getElementById("help")
			if(!help.classList.contains("hidden")) {
				help.classList.add("hidden")
			}
		})

		canvas.addEventListener('mouseup', (e) => {
			is_mouse_down = false;
			if(is_mouse_click) 
				board.OnCellClick(e)
		})

		canvas.addEventListener('mousemove', (e) => { 
			if (is_mouse_down) { 
				is_mouse_click = false
				board.OnScroll(e) 
			} 
		})

		// Move board with Keyboard
		window.addEventListener('keydown', (e) => {
			if (e.key == "Up" || e.key == "ArrowUp")  {
				kb_highlight_cell[0] -= 1
				kb_highlight_timeout = kb_highlight_duration
			}else if (e.key == "Down" || e.key == "ArrowDown")  {
				kb_highlight_cell[0] += 1
				kb_highlight_timeout = kb_highlight_duration
			}else if (e.key == "Left" || e.key == "ArrowLeft")  {
				kb_highlight_cell[1] -= 1
				kb_highlight_timeout = kb_highlight_duration
			}else if (e.key == "Right" || e.key == "ArrowRight")  {
				kb_highlight_cell[1] += 1
				kb_highlight_timeout = kb_highlight_duration
			}else if ( e.key == "Enter")  {
				kb_highlight_timeout = kb_highlight_duration
				board.OnCellKbKeyPress(kb_highlight_cell[0], kb_highlight_cell[1])
			} else if (e.key == " ") {
				pause_simulation = !pause_simulation;
			}
		})

		// help button event
		document.getElementById("help-button").addEventListener ("click", () => {
			document.getElementById("help").classList.toggle("hidden");
		})

	window.requestAnimationFrame(mainLoop);
}

function renderFPS(fps) {
    context.font = '18px Console';
    context.fillStyle = 'red';
    context.fillText( fps , 5, 20);
}


// Game of Life main loop
// Handles the rendering logic of the high level components of the game
//	such as the board
function mainLoop (timeStamp) {

    secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;		// elapsed time since last frame 
    this.oldTimeStamp = timeStamp;

    fps = Math.round(1 / secondsPassed);						// calculate fps

	context.fillStyle = 'red';
	context.fillRect(0, 0, canvas.width, canvas.height);		// Clear Canvas

	board.draw(context);

	// render cell highlighted by keyboard keypress
	if (kb_highlight_timeout > 0 ) {
		board.highlightCell(context, kb_highlight_cell[0], kb_highlight_cell[1], "yellow")
		kb_highlight_timeout -= secondsPassed
	}

	// simulate next generation
	if (!pause_simulation) {
		if (simulate_timeout <= 0 ) {
			board.simulateGeneration()
			simulate_timeout = simulate_delay
		}else {
			simulate_timeout -= secondsPassed
		}
	}

	renderFPS(fps);				// render fps

	// Keep requesting new frames
	window.requestAnimationFrame(mainLoop);
}

