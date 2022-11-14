// This class represents the infinite board on which the Game Of Life takes place in
// It also handles representation of the cells | elements that are player in it
// The view rendered on the screen is a region or section of the infinite board
// The board allows scrolling so that the viewport can be adjusted to view
//    different regions or sections
class Board {
	constructor(canvas, cell_size, line_size, bg_color, line_color) {
		this.canvas = canvas;

		this.offset_x = 0;
		this.offset_y = 0;

		this.cell_size = cell_size;
		this.line_size = line_size;

		this.bg_color = bg_color;
		this.line_color = line_color;

		this.cells = {}				// Cells that were alive at the start of the generation
									//   Only cells that are here are rendered
									//   cells added from user interactions go here and their effect
									//     will start in next generation from the one they are added in
		this.new_cells = {}			// Cells that have come to life in current generation
									//    rendering for these will start in next generation
									//    after they are added to the cells list 
		this.dead_cells = {}		// Cells that have died in current generation
									//   rendering for these stops in next generation
									//   when they are removed from the cells list
	}

	isCellAlive(row, col) {
		if (row + ":" + col in this.cells )	return true
		else return false
	}

	addCellToCells (cell_row, cell_column) {
		this.cells[cell_row + ":" + cell_column] = true
	}

	addCellToNewCells (cell_row, cell_column) {
		this.new_cells[cell_row + ":" + cell_column] = true
	}

	addCellToDeadCells (cell_row, cell_column) {
		this.dead_cells[cell_row + ":" + cell_column] = true
	}

	killCell(row, col) {
		delete this.cells[row + ":" + col]
	}

	// This function handles board scrolling
	// Works by modifying the offset of the section in the infinite board to be viewed
	// This function should only be called from scrolling events 
	OnScroll(event) {
		this.offset_x += event.movementX
		this.offset_y += event.movementY
	}

	OnCellKbKeyPress(row, col) {
		if (this.isCellAlive(row, col)) this.killCell(row, col )
		else this.addCellToCells(row, col )
	}

	//
	OnCellClick(event) {
		const rect = self.canvas.getBoundingClientRect()

		var x = (event.clientX - rect.left) - this.offset_x 
		var y = (event.clientY - rect.top)  - this.offset_y

		var col = Math.floor(x / (this.cell_size + this.line_size))
		var row = Math.floor(y / (this.cell_size + this.line_size))

		if (this.isCellAlive(row, col)) this.killCell(row, col )
		else this.addCellToCells(row, col )
	}

	// This member function handles rendering cells on the board
	// Note that the cell row and col values are 0 indexed
	//
	// @param ctx: the screen context
	// @param row: the cell row index on the board
	// @param col: the cell column index on the board
	// @param color: the cell color
	drawCell(ctx, row, col, color ='red') {
		// compute cell pixel position
		var x = col * (this.cell_size + this.line_size) + this.line_size;
		var y = row * (this.cell_size + this.line_size) + this.line_size;

		x += this.offset_x	// Add x scroll
		y += this.offset_y	// Add y scroll

		// no need to render cell if out of current viewport
		if (x + this.cell_size < 0 || y + this.cell_size < 0 ||
			x > this.canvas.width || y > this.canvas.width)
			return

		ctx.fillStyle = color;
		ctx.fillRect(x, y, this.cell_size , this.cell_size );
	}


	// This member function handles rendering cells on the board
	// Note that the cell row and col values are 0 indexed
	//
	highlightCell(ctx, row, col, color = 'green') {

		var highlight_padding = this.line_size / 2
		var highlight_rect_size = this.cell_size + highlight_padding

		// compute cell pixel position
		var x = col * (this.cell_size + this.line_size) + highlight_padding;
		var y = row * (this.cell_size + this.line_size) + highlight_padding;

		x += this.offset_x	// Add x scroll
		y += this.offset_y	// Add y scroll

		// if cell is outside current viewport, scroll to it
		if (x < 0 ) this.offset_x += this.cell_size
		else if ((x+ this.cell_size + this.line_size) > this.canvas.width ) {
			this.offset_x -= this.cell_size
			x -= this.cell_size
		}

		if (y < 0 ) this.offset_y += this.cell_size
		else if ((y+ this.cell_size + this.line_size) > this.canvas.height ) {
			this.offset_y -= this.cell_size
			y -= this.cell_size
		}

		ctx.beginPath();
		ctx.moveTo(x, y); 
		ctx.lineTo(x, y + highlight_rect_size ); 
		ctx.lineTo(x + highlight_rect_size, y + highlight_rect_size ); 
		ctx.lineTo(x + highlight_rect_size, y ); 
		ctx.closePath();

		ctx.strokeStyle = color;
		ctx.lineWidth = this.line_size + 2;
		ctx.stroke();
		ctx.lineWidth = this.line_size;
	}

	//
	drawVerticalLine (ctx, start_x, start_y) {
		ctx.fillStyle = this.line_color;
		ctx.fillRect(start_x, start_y, this.line_size, this.canvas.height );
	}

	drawHorizontalLine (ctx, start_x, start_y) {
		ctx.fillStyle = this.line_color;
		ctx.fillRect(start_x, start_y, this.canvas.width, this.line_size );
	}

	//
	draw( ctx ) {
		ctx.fillStyle = this.bg_color;
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);		// Clear Canvas

		var x = this.offset_x % (this.cell_size + ctx.lineWidth)
		var y = this.offset_y % (this.cell_size + ctx.lineWidth)

		while (x <= this.canvas.width || y <= this.canvas.height) {

			if (x <= this.canvas.width)
				this.drawVerticalLine( ctx, x, 0, x );
				
			if (y <= this.canvas.height)
				this.drawHorizontalLine( ctx, 0, y );

			x += this.cell_size + this.line_size;
			y += this.cell_size + this.line_size;
		}

		for (var cell in this.cells ) {
			var row_col = cell.split(":")
			this.drawCell(ctx, parseInt(row_col[0]), parseInt(row_col[1]), 'red')
		}
	}

	// Checks the population status of a cell
	// returns the number of neighbours a cell has
	cellPopulation(row, col) {
		var neighbour_count = 0

		if (this.isCellAlive(row - 1, col)) neighbour_count += 1		// N
		if (this.isCellAlive(row - 1, col + 1)) neighbour_count += 1	// NE
		if (this.isCellAlive(row, col + 1)) neighbour_count += 1		// E
		if (this.isCellAlive(row + 1, col + 1)) neighbour_count += 1	// SE
		if (this.isCellAlive(row + 1, col)) neighbour_count += 1		// S
		if (this.isCellAlive(row + 1, col - 1)) neighbour_count += 1	// Sw
		if (this.isCellAlive(row, col - 1)) neighbour_count += 1		// W
		if (this.isCellAlive(row - 1, col - 1)) neighbour_count += 1	// NW

		return neighbour_count
	}



	//
	simulateGeneration() {
		var dead_cells = []
		var new_cells = []

		for (var cell in this.cells ) {
			var row_col = cell.split(":")
			var row = parseInt(row_col[0])
			var col = parseInt(row_col[1])

			var population = this.cellPopulation(row, col) 
			if (population < 2 || population > 3) 
				this.addCellToDeadCells( row,col )

			// check neighbours
			population = this.cellPopulation(row - 1, col) 
			if ( population == 3) this.addCellToNewCells( row - 1, col )

			population = this.cellPopulation(row - 1, col + 1) 
			if ( population == 3) this.addCellToNewCells(row - 1, col + 1 )

			population = this.cellPopulation(row, col + 1) 
			if ( population == 3) this.addCellToNewCells( row, col + 1 )
			
			population = this.cellPopulation(row + 1, col + 1) 
			if ( population == 3) this.addCellToNewCells( row + 1, col + 1 )
			
			population = this.cellPopulation(row + 1, col) 
			if ( population == 3) this.addCellToNewCells( row + 1, col )
			
			population = this.cellPopulation(row + 1, col - 1) 
			if ( population == 3) this.addCellToNewCells( row + 1, col - 1 )
			
			population = this.cellPopulation(row, col - 1) 
			if ( population == 3) this.addCellToNewCells( row, col - 1 )
			
			population = this.cellPopulation(row - 1, col - 1) 
			if ( population == 3) this.addCellToNewCells( row - 1, col - 1 )
		}

		for (var cell in this.dead_cells ) {
			var row_col = cell.split(":")
			var row = parseInt(row_col[0])
			var col = parseInt(row_col[1])

			this.killCell( row, col )
		}

		this.cells = Object.assign({}, this.cells, this.new_cells);

		this.new_cells = {}
		this.dead_cells = {}
	}
}
