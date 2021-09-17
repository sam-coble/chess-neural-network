

let game;
let moveSound1;
const varToString = varObj => Object.keys(varObj)[0]

function preload(){
	King.whiteImage = loadImage("assets\\whiteKing.png");
	King.blackImage = loadImage("assets\\blackKing.png");
	Pawn.whiteImage = loadImage("assets\\whitePawn.png");
	Pawn.blackImage = loadImage("assets\\blackPawn.png");
	Queen.whiteImage = loadImage("assets\\whiteQueen.png");
	Queen.blackImage = loadImage("assets\\blackQueen.png");
	Rook.whiteImage = loadImage("assets\\whiteRook.png");
	Rook.blackImage = loadImage("assets\\blackRook.png");
	Knight.whiteImage = loadImage("assets\\whiteKnight.png");
	Knight.blackImage = loadImage("assets\\blackKnight.png");
	Bishop.whiteImage = loadImage("assets\\whiteBishop.png");
	Bishop.blackImage = loadImage("assets\\blackBishop.png");

	moveSound1 = loadSound("assets\\move1.mp3");
}
function setup(){
	var canvas = createCanvas(800,800);
	canvas.parent("sketch-holder")
	game = new Game();

}
function draw(){
	game.display();
}
let isShiftPressed = false;
function keyPressed(){
	if(mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > width){
		return;
	}
	if(key == ' '){
		game.makeBestMove();
	}
	else if(key == 'e'){
		console.log(game.baseEvaluate());
	}
	if(keyCode == SHIFT){
		isShiftPressed = true;
	}
}
function keyReleased(){
	if(keyCode == SHIFT){
		isShiftPressed = false;
	}
	if(key == 'h'){
		game.getHikaruMove();
	}
}
function mousePressed(){
	if(mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > width){
		return;
	}
	if(mouseButton == LEFT){
		game.selectedPos.x = Math.floor(mouseX / 100);
		game.selectedPos.y = Math.floor(mouseY / 100);
		game.pieceInHandOffset.x = mouseX % 100;
		game.pieceInHandOffset.y = mouseY % 100;
		game.pieceInHand = game.board.squares[game.selectedPos.x][game.selectedPos.y].copy();
		game.board.squares[game.selectedPos.x][game.selectedPos.y].shouldDisplay = false;

	}
} 
function mouseReleased(){
	if(mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > width){
		return;
	}
	if(mouseButton == LEFT){
		game.board.squares[game.selectedPos.x][game.selectedPos.y].shouldDisplay = true;
		game.pieceInHand = new Empty();
		let _tryMove = arr => isShiftPressed ? game.move(...arr) : game.tryMove(...arr);
		_tryMove([game.selectedPos, new Vector(Math.floor(mouseX / 100), Math.floor(mouseY / 100))]);
		game.selectedPos = new Vector(-1,-1);
	}
}
class Game{
	constructor(){
		this.isWhitesTurn = true;
		this.board = new Board("normal");
		this.whiteTimer = new Timer(60.0);
		this.blackTimer = new Timer(60.0);
		this.whiteScore = 0;
		this.blackScore = 0;

		this.pieceInHand = new Empty();
		this.pieceInHandOffset = new Vector(0, 0);
		this.selectedPos = new Vector(-1, -1);

		this.wc;
		this.bc;
		this.startClock(true);

		this.log = [];
		this.htmlLog = document.getElementById("log");

	}
	getFen(){
		let b = new Chess();
		b.clear();

		if(!this.isWhitesTurn){
			b.load(b.fen().replace('w','b'));
		}

		for(let i = 0; i < 8; i++){
			for(let j = 0; j < 8; j++){
				if(this.board.squares[i][j].constructor.name == 'Empty'){
					continue;
				}
				b.put(
					{
						type: this.board.squares[i][j].constructor.fenletter,
						color: (this.board.squares[i][j].isWhite ? 'w' : 'b')
					},
					String.fromCharCode(i+97) + (-1 * j + 8)
				);
			}
		}
		console.log(b.fen());
		return  b.fen();
	}
	loadFen(fen){
		this.board.clear();
		this.isWhitesTurn = fen.includes('w');
		
		let j = 0;
		let b = new Array([],[],[],[],[],[],[],[]);
		for(let i =  0; i <  fen.length; i++){
			if(fen.charAt(i) == '/'){
				j++;
				continue;
			}
			else if(fen.charCodeAt(i) >=  '1'.charCodeAt() && fen.charCodeAt(i) <= '8'.charCodeAt()){
				for(let ii = 0; ii < fen.charAt(i); ii++){
					b[j].push('-');
				}
			}
			else{
				b[j].push(fen.charAt(i));
			}
		}

		for(let i = 0; i < b.length; i++){
			for(let j = 0; j < b[i].length; j++){
				switch(b[j][i].toLowerCase()){
					case 'p':
						this.board.squares[i][j] = new Pawn(b[j][i].charCodeAt() <= 'a'.charCodeAt());
						break;
					case 'k':
						this.board.squares[i][j] = new King(b[j][i].charCodeAt() <= 'a'.charCodeAt());
						break;
					case 'q':
						this.board.squares[i][j] = new Queen(b[j][i].charCodeAt() <= 'a'.charCodeAt());
						break;
					case 'n':
						this.board.squares[i][j] = new Knight(b[j][i].charCodeAt() <= 'a'.charCodeAt());
						break;
					case 'b':
						this.board.squares[i][j] = new Bishop(b[j][i].charCodeAt() <= 'a'.charCodeAt());
						break;
					case 'r':
						this.board.squares[i][j] = new Rook(b[j][i].charCodeAt() <= 'a'.charCodeAt());
						break;
				}
				
			}
		}
	}
	async getHikaruMove(){
		// let fen = this.getFen();
		// let g = new Chess(fen);
		// let move = JSON.parse(await ajax("/moverequest").post({"fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"}).then(res=>res));
		// if(g.move(move) === null){
		// 	console.log('help');
		// }
		// this.loadFen(g.fen());
		this.loadFen(await ajax("/moverequest").post({"fen": this.getFen()})/*.then(res=>res)*/);
		moveSound1.play();
	}
	startClock(isWhite){
		if(isWhite){
			this.wc = setInterval(_.bind(this.whiteTimer.tick, this.whiteTimer, [true]), 1000 * Timer.minTime);
		}
		else{
			this.bc = setInterval(() => this.blackTimer.tick(false), 1000 * Timer.minTime);
		}
	}
	stopClock(isWhite){
		if(isWhite){
			clearInterval(this.wc);
		}
		else{
			clearInterval(this.bc);
		}
	}
	display(){
		this.board.display();
		if(this.pieceInHand.constructor.name != "Empty"){
			if(this.pieceInHand.isWhite){
				image(
					this.pieceInHand.constructor.whiteImage, 
					mouseX - this.pieceInHandOffset.x, mouseY - this.pieceInHandOffset.y
				);
			} else{
				image(
					this.pieceInHand.constructor.blackImage, 
					mouseX - this.pieceInHandOffset.x, mouseY - this.pieceInHandOffset.y
				);
			}
			//image(this.pieceinhand.isWhite ? this.pieceInHand.constructor.whiteImage : this.pieceInHand.constructor.blackImage, mouseX - this.pieceInHandOffset.x, mouseY - this.pieceInHandOffset.y);
			fill(255,0,0);
		}
	}
	move(start, end, other, other2){
		if(other != undefined){
			start = new Vector(start,end);
			end = new Vector(other, other2);
		}
		this.board.squares[end.x][end.y] = this.board.squares[start.x][start.y].copy();
		this.board.squares[end.x][end.y].timesMoved++;
		this.board.squares[start.x][start.y] = new Empty();
		this.display();

		try{
			moveSound1.play();
		}
		catch(err){
			console.log("error playing sound");
		}


		this.checkForEvents(true);
		this.stopClock(this.isWhitesTurn);
		this.startClock(!this.isWhitesTurn);
		this.logMove(end);
	}
	logMove(end){
		this.log.push(this.board.squares[end.x][end.y].constructor.letter + String.fromCharCode(end.x+97) + (-1* end.y + 8));
		let cell;
		if(this.log.length % 2 == 1){
			let row = this.htmlLog.insertRow(Math.floor(this.log.length / 2));
			row.id = Math.ceil(this.log.length / 2) - 1;
			cell = row.insertCell(0);
		}
		else{
			cell = document.getElementById(Math.floor(this.log.length / 2) - 1).insertCell(1);
		}
		cell.innerHTML = this.log[this.log.length - 1]
	}
	returnAsSim(){
		let sim = new Simulation();
		for(let i = 0; i < 8; i++){
			for(let j = 0; j < 8; j++){
				sim.board.squares[i][j] = this.board.squares[i][j];	
			}
		}
		sim.isWhitesTurn = this.isWhitesTurn;
		return sim;
	}
	tryMove(start, end){
		if(this.board.squares[start.x][start.y].constructor.name == "Empty"){
			return false;
		}
		if(this.board.squares[start.x][start.y].isWhite != this.isWhitesTurn){
			return false;
		}
		if(this.board.squares[start.x][start.y].constructor.isLegalMove(this.board, this.board.squares[start.x][start.y].isWhite, start, end)){
			let sim = this.returnAsSim();
			sim.move(start,end);
			if(sim.board.isSquareAttacked(!sim.isWhitesTurn, sim.board.getKingPos(sim.isWhitesTurn))){
				//results in check
				return false;
			}
			this.move(start, end);
			this.isWhitesTurn = !this.isWhitesTurn;
			return true;
		}
	}
	checkForEvents(shouldCheckCheckmate){
		for(let i = 0; i < 8; i++){
			if(this.board.squares[i][0].constructor.name == "Pawn"){
				this.board.squares[i][0] = new Queen(this.board.squares[i][0].isWhite);
			} else if(this.board.squares[i][7].constructor.name == "Pawn"){
				this.board.squares[i][7] = new Queen(this.board.squares[i][7].isWhite);
			}
		}
		if(shouldCheckCheckmate){
			if(this.board.isCheckmate(!this.isWhitesTurn)){
				alert((game.isWhitesTurn ? "White" : "Black") + " has won!");
				this.board.resetNormal(true);
			}
		}
	}
	baseEvaluate(){
		//points of pieces. control of center. how far pawns are advanced. how centeral pieces are.  # of squares attacked
		let whiteTotal = 0, blackTotal = 0;
		for(let i = 0; i < 8; i++){
			for(let j = 0; j < 8; j++){

				if(this.board.isSquareAttacked(true, new Vector(i, j))){
					whiteTotal += 0.05;
				}
				if(this.board.isSquareAttacked(false, new Vector(i, j))){
					blackTotal += 0.05;
				}


				if(this.board.squares[i][j].constructor.name == "Empty"){
					continue;
				}
				else{
					if(this.board.squares[i][j].isWhite){
						whiteTotal += this.board.squares[i][j].constructor.pointValue;
					}
					else{
						blackTotal += this.board.squares[i][j].constructor.pointValue;
					}
				}


				if(this.board.squares[i][j].constructor.name == "Pawn"){
					if(this.board.squares[i][j].isWhite){
						whiteTotal += 0.000025 * (Math.E ** (1.6 * (((-1 * j) + 8))));
					}
					else{
						blackTotal += 0.000025 * (Math.E ** (1.6 * (j + 1)));
					}
				}
			}
		}

		return whiteTotal - blackTotal;
	}
	getBestMove(){
		let bestEval = this.isWhitesTurn ? -10000 : 10000;
		let bestCoords = [-1, -1, -1, -1];
		for(let i = 0; i < 8; i++){
			for(let j = 0; j < 8; j++){
				if(this.board.squares[i][j].constructor.name == "Empty" ||
					this.board.squares[i][j].isWhite != this.isWhitesTurn){
					continue;
				}
				let sim = this.returnAsSim(this.isWhitesTurn);
				let tempStartingPiece = sim.board.squares[i][j];
				for(let endx = 0; endx < 8; endx++){
					for(let endy = 0; endy < 8; endy++){
						let tempEndingPiece = sim.board.squares[endx][endy];
						if(sim.tryMove(new Vector(i, j), new Vector(endx, endy))){
							let e = sim.baseEvaluate();
							if(this.isWhitesTurn){
								if(e > bestEval){
									bestEval = e;
									bestCoords = [i, j, endx, endy];
								}
							}
							else{
								if(e < bestEval){
									bestEval = e;
									bestCoords = [i, j, endx, endy];
								}
							}
						}
						sim.board.squares[i][j] = tempStartingPiece;
						sim.board.squares[endx][endy] = tempEndingPiece;
					}
				}
			}
		}
		console.log(bestEval);
		return bestCoords;
	}
	makeBestMove(){
		let coords = this.getBestMove();
		this.tryMove(new Vector(coords[0], coords[1]), new Vector(coords[2], coords[3]));
	}

}
class Simulation{
	constructor(){
		this.board = new Board();
		this.isWhitesTurn = true;
		this.tryMove = Game.prototype.tryMove;
		this.checkForEvents = Game.prototype.checkForEvents;	
		this.returnAsSim = Game.prototype.returnAsSim;
		this.baseEvaluate = Game.prototype.baseEvaluate;
	}
	move(start, end, other, other2){
		if(other != undefined){
			start = new Vector(start,end);
			end = new Vector(other, other2);
		}
		this.board.squares[end.x][end.y] = this.board.squares[start.x][start.y];
		this.board.squares[end.x][end.y].timesMoved++;
		this.board.squares[start.x][start.y] = new Empty();
		this.checkForEvents(false);
	}
}
class Board{
	constructor(setup){
		this.squares = [];
		for(let i = 0; i < 8; i++){
			this.squares.push([]);
			for(let j = 0; j < 8; j++){
				this.squares[i].push(new Empty());
			}
		}
		if(setup != undefined){
			switch(setup){
				case "normal":
					this.resetNormal(false);
					break;
				case "960":
					this.reset960(false);
					break;
				default:
					console.log("invalid reset state");
			}
		}
	}
	returnAsSim(isWhitesTurn){
		let sim = new Simulation();
		for(let i = 0; i < 8; i++){
			for(let j = 0; j < 8; j++){
				sim.board.squares[i][j] = this.squares[i][j];	
			}
		}
		sim.isWhitesTurn = isWhitesTurn;
		return sim;
	}
	isCheckmate(againstWhite){
		if(!this.isSquareAttacked(!againstWhite, this.getKingPos(againstWhite))){
			return false;
		}
		else{
			for(let startx = 0; startx < 8; startx++){
				for(let starty = 0; starty < 8; starty++){
					if(this.squares[startx][starty].constructor.name == "Empty" ||
						this.squares[startx][starty].isWhite != againstWhite){
						continue;
					}
					let sim = this.returnAsSim(againstWhite);
					let tempStartingPiece = sim.board.squares[startx][starty];
					for(let endx = 0; endx < 8; endx++){
						for(let endy = 0; endy < 8; endy++){
							let tempEndingPiece = sim.board.squares[endx][endy];
							if(sim.tryMove(new Vector(startx, starty), new Vector(endx, endy))){
								if(!sim.board.isSquareAttacked(!againstWhite, sim.board.getKingPos(againstWhite))){
									return false;
								}
							}
							sim.board.squares[startx][starty] = tempStartingPiece;
							sim.board.squares[endx][endy] = tempEndingPiece;
						}
					}
				}
			}
			return true;
		}
	}
	getKingPos(isWhite){
		for(let i = 0; i < 8; i++){
			for(let j = 0; j < 8; j++){
				if(this.squares[i][j].constructor.name == "King" && this.squares[i][j].isWhite == isWhite){
					return new Vector(i,j);
				}
			}
		}
	}
	isSquareAttacked(isByWhite, pos, pos2){
		if(pos2 != undefined){
			pos = new Vector(pos,pos2);
		}
		for(let i = 0; i < 8; i++){
			for(let j = 0; j < 8; j++){
				if(this.squares[i][j].constructor.name == "Empty" || this.squares[i][j].isWhite != isByWhite){
					continue;
				}
				if(this.squares[i][j].constructor.canAttack(this, isByWhite, new Vector(i,j), pos)){
					return true;
				}
			}
		}
		return false;
	}
	display(){
		let white = color('rgb(181, 136, 99)');
		let black = color('rbg(240, 217, 181)');
		let b = false;
		for(let  i = 0; i < 8; i++){
			b = !b;
			for(let j = 0; j < 8; j++){
				b = !b;
				fill(b ? white : black);
				rect(100 * i, 100 * j, 100, 100);
				if((this.squares[i][j].constructor.name != "Empty") && this.squares[i][j].shouldDisplay){
					if(this.squares[i][j].isWhite){
						image(
							this.squares[i][j].constructor.whiteImage,
							i * 100, j * 100
						);
					} else{
						image(
							this.squares[i][j].constructor.blackImage,
							i * 100, j * 100
						);
					}
				}
			}
		}
		
	}
	clear(){
		for(let i = 0; i < 8; i++){
			for(let j = 0; j < 8; j++){
				this.squares[i][j] = new Empty();
			}
		}
	}
	resetNormal(shouldClear){
		CLEAR: {
			if(!shouldClear){
				break CLEAR;
			}
			for(let i = 0; i < 8; i++){
				for(let j = 0; j < 8; j++){
					this.squares[i][j] = new Empty();
				}
			}
		}
		this.squares[0][0] = new Rook	(false);
		this.squares[1][0] = new Knight	(false);
		this.squares[2][0] = new Bishop	(false);
		this.squares[3][0] = new Queen	(false);
		this.squares[4][0] = new King	(false);
		this.squares[5][0] = new Bishop	(false);
		this.squares[6][0] = new Knight	(false);
		this.squares[7][0] = new Rook	(false);
		this.squares[0][1] = new Pawn	(false);
		this.squares[1][1] = new Pawn	(false);
		this.squares[2][1] = new Pawn	(false);
		this.squares[3][1] = new Pawn	(false);
		this.squares[4][1] = new Pawn	(false);
		this.squares[5][1] = new Pawn	(false);
		this.squares[6][1] = new Pawn	(false);
		this.squares[7][1] = new Pawn	(false);

		this.squares[0][7] = new Rook	(true );
		this.squares[1][7] = new Knight	(true );
		this.squares[2][7] = new Bishop	(true );
		this.squares[3][7] = new Queen	(true );
		this.squares[4][7] = new King	(true );
		this.squares[5][7] = new Bishop	(true );
		this.squares[6][7] = new Knight	(true );
		this.squares[7][7] = new Rook	(true );
		this.squares[0][6] = new Pawn	(true );
		this.squares[1][6] = new Pawn	(true );
		this.squares[2][6] = new Pawn	(true );
		this.squares[3][6] = new Pawn	(true );
		this.squares[4][6] = new Pawn	(true );
		this.squares[5][6] = new Pawn	(true );
		this.squares[6][6] = new Pawn	(true );
		this.squares[7][6] = new Pawn	(true );
	}
	reset960(){
		this.resetNormal();
	}
}

class Timer{
	constructor(startingTime){// *not actually seconds buy 0.1 seconds
		this.seconds = startingTime + this.constructor.minTime;
		this.tick();
	}
	tick(isWhite){
		this.seconds -= this.constructor.minTime;

		document.form[isWhite ? "whiteTimer" : "blackTimer"].value = this.constructor.formatString(this.seconds);
	}
}
Timer.minTime = 0.1;
Timer.formatString = function(time){
	time *= 10;
	if(time > 200){
		return Math.floor(time / 600.1) + ':' + 
		((Math.floor(time / 10) < 10) ? (' ' + Math.floor(time / 10)) : Math.floor(time / 10));
	}
	else{
		return Math.floor(time / 600.1) + ':' + ((Math.floor(time / 10) < 10) ? (' ' + Math.floor(time / 10)) : Math.floor(time / 10)) + 
		'.' + Math.floor(time % 10);
	}
}
class Piece{
	constructor(isWhite, timesMoved){
		this.isWhite = isWhite == undefined ? true : isWhite;
		this.shouldDisplay = true;
		this.timesMoved = timesMoved == undefined ? 0 : timesMoved;
	}
	copy(){
		return new this.constructor(this.isWhite, this.timesMoved);
	}
}
class King extends Piece{

}
class Pawn extends Piece{

}
class Queen extends Piece{

}
class Rook extends Piece{

}
class Knight extends Piece{
	
}
class Bishop extends Piece{

}
class Empty extends Piece{

}
King.isLegalMove = function(board, isWhite, start, end){
	if(!King.canAttack(board, isWhite, start, end)){
		return false;
	}
	return !board.isSquareAttacked(!isWhite,end);
}
King.canAttack = function(board, isWhite, start, end){
	if(start.x == end.x && start.y == end.y){
		return false;
	} else if(board.squares[end.x][end.y].constructor.name != "Empty" && board.squares[end.x][end.y].isWhite == isWhite){
		return false;
	}
	return Math.abs(start.x - end.x) <= 1 && Math.abs(start.y - end.y) <= 1;
}
Pawn.isLegalMove = function(board, isWhite, start, end){
	if(Pawn.canAttack(board, isWhite, start, end) && ((board.squares[end.x][end.y].isWhite != isWhite) && 
		board.squares[end.x][end.y].constructor.name != "Empty")){
		console.log('hu');
		return true;
	} 
	if((start.x != end.x) || (start.y == end.y)){
		return false;
	}
	if(isWhite){
		if(start.y == 6){
			return ((end.y == 5) || (end.y == 4)) && board.squares[end.x][end.y].constructor.name == "Empty" && board.squares[end.x][5].constructor.name == "Empty";
		} else{
			return (end.y == start.y - 1)  && board.squares[end.x][end.y].constructor.name == "Empty";
		}
	} else{
		if(start.y == 1){
			return ((end.y == 2) || (end.y == 3)) && board.squares[end.x][end.y].constructor.name == "Empty" && board.squares[end.x][2].constructor.name == "Empty";
		} else{
			return (end.y == start.y + 1) && board.squares[end.x][end.y].constructor.name == "Empty";
		}
	}
}
Pawn.canAttack = function(board, isWhite, start, end){
	//return Math.abs((start.x - end.x) != 1) && (isWhite ? start.y - 1 == end.y : start.y + 1 == end.y);
	if(Math.abs(start.x - end.x) != 1){
		return false;
	} else{
		if(isWhite){
			return start.y - 1 == end.y;
		} else {
			return start.y + 1 == end.y;
		}
	}
}
Queen.isLegalMove = function(board, isWhite, start, end){
	return Rook.isLegalMove(board, isWhite, start, end) || Bishop.isLegalMove(board, isWhite, start, end);
}
Queen.canAttack = function(board, isWhite, start, end){
	return Queen.isLegalMove(board, isWhite, start, end);
}
Rook.isLegalMove = function(board, isWhite, start, end){
	if((start.x == end.x && start.y == end.y) || (start.x != end.x && start.y != end.y)){
		return false;
	}
	if(start.x == end.x){
		if(start.y < end.y){
			for(let i = start.y + 1; i < end.y; i++){
				if(board.squares[start.x][i].constructor.name != "Empty"){
					return false;
				}
			}
		} else{
			for(let i = start.y - 1; i > end.y; i--){
				if(board.squares[start.x][i].constructor.name != "Empty"){
					return false;
				}
			}
		}
	} else{
		if(start.x < end.x){
			for(let i = start.x + 1; i < end.x; i++){
				if(board.squares[i][start.y].constructor.name != "Empty"){
					return false;
				}
			}
		} else{
			for(let i = start.x - 1; i > end.x; i--){
				if(board.squares[i][start.y].constructor.name != "Empty"){
					return false;
				}
			}
		}
	}
	return board.squares[end.x][end.y].constructor.name == "Empty" || board.squares[end.x][end.y].isWhite != isWhite;

}
Rook.canAttack = function(board, isWhite, start, end){
	return Rook.isLegalMove(board, isWhite, start, end);
}
Knight.isLegalMove = function(board, isWhite, start, end){
	if((Math.abs(start.x - end.x) == 2 && Math.abs(start.y - end.y) == 1) ==
		(Math.abs(start.x - end.x) == 1 && Math.abs(start.y - end.y) == 2)){
		return false;
	}
	return board.squares[end.x][end.y].constructor.name == "Empty" || board.squares[end.x][end.y].isWhite != isWhite;
}
Knight.canAttack = function(board, isWhite, start, end){
	return Knight.isLegalMove(board, isWhite, start, end);
}
Bishop.isLegalMove = function(board, isWhite, start, end){
	if(Math.abs(start.x - end.x) != Math.abs(start.y - end.y)){
		return false;
	}
	if(start.x == end.x && start.y == end.y){
		return false;
	}
	if(start.x < end.x && start.y < end.y){
		for(let i = 1; i < Math.abs(start.x - end.x); i++){
			if(board.squares[start.x + i][start.y + i].constructor.name != "Empty"){
				return false;
			}
		}
	} else if(start.x < end.x && start.y > end.y){
		for(let i = 1; i < Math.abs(start.x - end.x); i++){
			if(board.squares[start.x + i][start.y - i].constructor.name != "Empty"){
				return false;
			}
		}
	} else if(start.x > end.x && start.y < end.y){
		for(let i = 1; i < Math.abs(start.x - end.x); i++){
			if(board.squares[start.x - i][start.y + i].constructor.name != "Empty"){
				return false;
			}
		}
	} else if(start.x > end.x && start.y > end.y){
		for(let i = 1; i < Math.abs(start.x - end.x); i++){
			if(board.squares[start.x - i][start.y - i].constructor.name != "Empty"){
				return false;
			}
		}
	}
	return (board.squares[end.x][end.y].constructor.name == "Empty") || (board.squares[end.x][end.y].isWhite != isWhite);
}
Bishop.canAttack = function(board, isWhite, start, end){
	return Bishop.isLegalMove(board, isWhite, start, end);
}



King.pointValue   = 1000;
Pawn.pointValue   = 1;
Queen.pointValue  = 9;
Rook.pointValue   = 5;
Knight.pointValue = 3;
Bishop.pointValue = 3;

King.letter = 'K';
Pawn.letter = '';
Queen.letter = 'Q';
Rook.letter = 'R';
Knight.letter = 'N';
Bishop.letter = 'B';

King.fenletter = 'k';
Pawn.fenletter = 'p';
Queen.fenletter = 'q';
Rook.fenletter = 'r';
Knight.fenletter = 'n';
Bishop.fenletter = 'b';

King.blackImage;
King.whiteImage;
Pawn.blackImage;
Pawn.whiteImage;
Queen.blackImage;
Queen.whiteImage;
Rook.blackImage;
Rook.whiteImage;
Knight.blackImage;
Knight.whiteImage;
Bishop.blackImage;
Bishop.whiteImage;