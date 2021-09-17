//TODO: En passant - log
//TODO: Timer
//TODO: Check - visual and illegal moves - *err* sound
//TODO: winner/loser - points system - multiple games
//TODO: Stalemate
//TODO: Engine
//TODO: other gui stuff

let game;
let moveSound1;
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
	createCanvas(800,800);
	game = new Game();
	game.board.display();
}
function draw(){
	game.board.display();
	//console.log(mouseX);
}
function mousePressed(){
	if(mouseButton == LEFT){
		game.selectedPos.x = Math.floor(mouseX / 100);
		game.selectedPos.y = Math.floor(mouseY / 100);
		game.board.offset.x = mouseX % 100;
		game.board.offset.y = mouseY % 100;
		game.board.pieceInHand = game.board.squares[game.selectedPos.x][game.selectedPos.y].copy();
		game.board.squares[game.selectedPos.x][game.selectedPos.y].shouldDisplay = false;

	}
}
function mouseReleased(){
	if(mouseButton == LEFT){
		game.board.squares[game.selectedPos.x][game.selectedPos.y].shouldDisplay = true;
		game.board.pieceInHand = new Empty();
		game.board.tryMove(game.selectedPos, new Vector(Math.floor(mouseX / 100), Math.floor(mouseY / 100)));
		game.selectedPos = new Vector(-1,-1);
	}
}
function move(one, two, three, four){
	game.board.move(one,two,three,four);
}
class Game{
	constructor(){
		this.board = new Board();
		this.isWhiteTurn = true;
		this.selectedPos = new Vector(-1,-1);
	}
}
class Board{
	constructor(){
		this.pieceInHand = new Empty();
		this.offset = new Vector(0,0);

		this.squares = [];
		for(let i = 0; i < 8; i++){
			let row = [];
			for(let j = 0; j < 8; j++){
				row.push(new Empty());
			}
			this.squares.push(row);
		}
		this.reset();
	}
	copy(returnAsSim){
		let b;
		if(returnAsSim){
			b = new Simulation();
		}
		else{
			b = new Board();
		}
		for(let i = 0; i < 8; i++){
			for(let j = 0; j < 8; j++){
				b.squares[i][j] = this.squares[i][j].copy();
			}
		}
		return b;
	}
	tryMove(start, end){
		//Castle
		if(
			start.x == 4 && start.y == 0 && this.squares[start.x][start.y].constructor.name == "King" &&
			end.x == start.x + 2 && end.y == start.y && this.squares[7][start.y].constructor.name == "Rook" && 
			this.squares[start.x][start.y].timesMoved == 0 && this.squares[7][start.y].timesMoved == 0 && (function(board){
				for(let i = start.x + 1; i < 7; i++){
					if(board.squares[i][start.y].constructor.name != "Empty" || 
						this.isSquareAttacked(!game.isWhiteTurn, new Vector(i,start.y))){
						return false;
					}
				}
				return true;
			})(this) && !this.isSquareAttacked(!game.isWhiteTurn, start)){
			this.move(start,end);
			this.move(new Vector(7,start.y), new Vector(end.x - 1, start.y));
			game.isWhiteTurn = !game.isWhiteTurn;
			return;
		} else if(
			start.x == 4 && start.y == 7 && this.squares[start.x][start.y].constructor.name == "King" &&
			end.x == start.x + 2 && end.y == start.y && this.squares[7][start.y].constructor.name == "Rook" &&
			this.squares[start.x][start.y].timesMoved == 0 && this.squares[7][start.y].timesMoved == 0 && (function(board){
				for(let i = start.x + 1; i < 7; i++){
					if(board.squares[i][start.y].constructor.name != "Empty" || 
						this.isSquareAttacked(!game.isWhiteTurn, new Vector(i,start.y))){
						return false;
					}
				}
				return true;
			})(this) && !this.isSquareAttacked(!game.isWhiteTurn, start)){
			this.move(start,end);
			this.move(new Vector(7,start.y), new Vector(end.x - 1, start.y));
			game.isWhiteTurn = !game.isWhiteTurn;
			return;
		} else if(
			start.x == 4 && start.y == 0 && this.squares[start.x][start.y].constructor.name == "King" &&
			end.x == start.x - 2 && end.y == start.y && this.squares[0][start.y].constructor.name == "Rook" &&
			this.squares[start.x][start.y].timesMoved == 0 && this.squares[0][start.y].timesMoved == 0 && (function(board){
				for(let i = start.x - 1; i > 0; i--){
					if(board.squares[i][start.y].constructor.name != "Empty" || 
						this.isSquareAttacked(!game.isWhiteTurn, new Vector(i,start.y))){
						return false;
					}
				}
				return true;
			})(this) && !this.isSquareAttacked(!game.isWhiteTurn, start)){
			this.move(start,end);
			this.move(new Vector(0,start.y), new Vector(end.x + 1, start.y));
			game.isWhiteTurn = !game.isWhiteTurn;
			return;
		} else if(
			start.x == 4 && start.y == 7 && this.squares[start.x][start.y].constructor.name == "King" &&
			end.x == start.x - 2 && end.y == start.y && this.squares[0][start.y].constructor.name == "Rook" &&
			this.squares[start.x][start.y].timesMoved == 0 && this.squares[0][start.y].timesMoved == 0 && (function(board){
				for(let i = start.x - 1; i > 0; i--){
					if(board.squares[i][start.y].constructor.name != "Empty" || 
						this.isSquareAttacked(!game.isWhiteTurn, new Vector(i,start.y))){
						return false;
					}
				}
				return true;
			})(this) && !this.isSquareAttacked(!game.isWhiteTurn, start)){
			this.move(start,end);
			this.move(new Vector(0,start.y), new Vector(end.x + 1, start.y));
			game.isWhiteTurn = !game.isWhiteTurn;
			return;
		}

		//En Passant
		//ihnfi

		if(this.squares[start.x][start.y].constructor.name == "Empty"){
			return;	
		}
		if(this.squares[start.x][start.y].isWhite != game.isWhiteTurn){
			return;
		}
		if(this.squares[start.x][start.y].constructor.isLegalMove(this,this.squares[start.x][start.y].isWhite,start,end)){
			if(this.isSquareAttacked(!game.isWhiteTurn, this.getKingPos(game.isWhiteTurn))){
				let sim = this.copy(true);
				sim.move(start, end);
				if(sim.isSquareAttacked(!game.isWhiteTurn, sim.getKingPos(game.isWhiteTurn))){
					return;
				}
			}
			this.move(start, end);
			game.isWhiteTurn = !game.isWhiteTurn;
			return;
		}
	}
	checkForEvents(){
		//Queening--TODO: gui for different pieces
		for(let i = 0; i < 8; i++){
			if(this.squares[i][0].constructor.name == "Pawn"){
				this.squares[i][0] = new Queen(this.squares[i][0].isWhite);
			} else if(this.squares[i][7].constructor.name == "Pawn"){
				this.squares[i][7] = new Queen(this.squares[i][7].isWhite);
			}
		}
		if(this.isCheckmate(!game.isWhiteTurn)){
			alert((game.isWihteTurn ? "Black" : "White") + " has won!");
			this.reset();
		}
	}
	isCheckmate(onWhite){
		//return true;
		//Checkmate
		if(this.isSquareAttacked(!onWhite, this.getKingPos(onWhite))){
			for(let startx = 0; startx < 8; startx++){
				for(let starty = 0; starty < 8; starty++){
					for(let endx = 0; endx < 8; endx++){
						for(let endy = 0; endy < 8; endy++){
							let b = this.copy(true);
							if(this.squares[startx][starty].isWhite != onWhite || 
								this.squares[startx][starty].constructor.name == "Empty"){
								continue;
							}
							b.tryMove(new Vector(startx, starty), new Vector(endx, endy));
							if(!b.isSquareAttacked(!onWhite, b.getKingPos(onWhite))){
								return false;
							}
						}
					}
				}
			}
			return true;
		}
		return false;

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
	move(start, end, other, other2){
		if(other != undefined){
			start = new Vector(start,end);
			end = new Vector(other, other2);
		}
		this.squares[end.x][end.y] = this.squares[start.x][start.y].copy();
		this.squares[end.x][end.y].timesMoved++;
		this.squares[start.x][start.y] = new Empty();
		this.display();
		moveSound1.play();
		this.checkForEvents();
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
		if(this.pieceInHand.constructor.name != "Empty"){
			if(this.pieceInHand.isWhite){
				image(this.pieceInHand.constructor.whiteImage, mouseX - this.offset.x, mouseY - this.offset.y);
			} else{
				image(this.pieceInHand.constructor.blackImage, mouseX - this.offset.x, mouseY - this.offset.y);
			}
		}
	}
	reset(){
		for(let i = 0; i < 8; i++){
			for(let j = 0; j < 8; j++){
				this.squares[i][j] = new Empty();
			}
		}
		this.squares[0][0] = new Rook   (false);
		this.squares[1][0] = new Knight (false);
		this.squares[2][0] = new Bishop (false);
		this.squares[3][0] = new Queen (false);
		this.squares[4][0] = new King   (false);
		this.squares[5][0] = new Bishop (false);
		this.squares[6][0] = new Knight (false);
		this.squares[7][0] = new Rook   (false);
		this.squares[0][1] = new Pawn   (false);
		this.squares[1][1] = new Pawn   (false);
		this.squares[2][1] = new Pawn   (false);
		this.squares[3][1] = new Pawn   (false);
		this.squares[4][1] = new Pawn   (false);
		this.squares[5][1] = new Pawn   (false);
		this.squares[6][1] = new Pawn   (false);
		this.squares[7][1] = new Pawn   (false);

		this.squares[0][7] = new Rook   (true );
		this.squares[1][7] = new Knight (true );
		this.squares[2][7] = new Bishop (true );
		this.squares[3][7] = new Queen  (true );
		this.squares[4][7] = new King   (true );
		this.squares[5][7] = new Bishop (true );
		this.squares[6][7] = new Knight (true );
		this.squares[7][7] = new Rook   (true );
		this.squares[0][6] = new Pawn   (true );
		this.squares[1][6] = new Pawn   (true );
		this.squares[2][6] = new Pawn   (true );
		this.squares[3][6] = new Pawn   (true );
		this.squares[4][6] = new Pawn   (true );
		this.squares[5][6] = new Pawn   (true );
		this.squares[6][6] = new Pawn   (true );
		this.squares[7][6] = new Pawn   (true );
	}
}
class Simulation extends Board{
	move(start, end, other, other2){
		if(other != undefined){
			start = new Vector(start,end);
			end = new Vector(other, other2);
		}
		this.squares[end.x][end.y] = this.squares[start.x][start.y].copy();
		this.squares[end.x][end.y].timesMoved++;
		this.squares[start.x][start.y] = new Empty();
		//this.display();
		//moveSound1.play();

	}
	tryMove(start, end){
		//Castle
		if(
			start.x == 4 && start.y == 0 && this.squares[start.x][start.y].constructor.name == "King" &&
			end.x == start.x + 2 && end.y == start.y && this.squares[7][start.y].constructor.name == "Rook" && 
			this.squares[start.x][start.y].timesMoved == 0 && this.squares[7][start.y].timesMoved == 0 && (function(board){
				for(let i = start.x + 1; i < 7; i++){
					if(board.squares[i][start.y].constructor.name != "Empty" || 
						board.isSquareAttacked(!game.isWhiteTurn, new Vector(i,start.y))){
						return false;
					}
				}
				return true;
			})(this) && !this.isSquareAttacked(!game.isWhiteTurn, start)){
			this.move(start,end);
			this.move(new Vector(7,start.y), new Vector(end.x - 1, start.y));
			//game.isWhiteTurn = !game.isWhiteTurn;
			return;
		} else if(
			start.x == 4 && start.y == 7 && this.squares[start.x][start.y].constructor.name == "King" &&
			end.x == start.x + 2 && end.y == start.y && this.squares[7][start.y].constructor.name == "Rook" &&
			this.squares[start.x][start.y].timesMoved == 0 && this.squares[7][start.y].timesMoved == 0 && (function(board){
				for(let i = start.x + 1; i < 7; i++){
					if(board.squares[i][start.y].constructor.name != "Empty" || 
						board.isSquareAttacked(!game.isWhiteTurn, new Vector(i,start.y))){
						return false;
					}
				}
				return true;
			})(this) && !this.isSquareAttacked(!game.isWhiteTurn, start)){
			this.move(start,end);
			this.move(new Vector(7,start.y), new Vector(end.x - 1, start.y));
			//game.isWhiteTurn = !game.isWhiteTurn;
			return;
		} else if(
			start.x == 4 && start.y == 0 && this.squares[start.x][start.y].constructor.name == "King" &&
			end.x == start.x - 2 && end.y == start.y && this.squares[0][start.y].constructor.name == "Rook" &&
			this.squares[start.x][start.y].timesMoved == 0 && this.squares[0][start.y].timesMoved == 0 && (function(board){
				for(let i = start.x - 1; i > 0; i--)	{
					if(board.squares[i][start.y].constructor.name != "Empty" || 
						board.isSquareAttacked(!game.isWhiteTurn, new Vector(i,start.y))){
						return false;
					}
				}
				return true;
			})(this) && !this.isSquareAttacked(!game.isWhiteTurn, start)){
			this.move(start,end);
			this.move(new Vector(0,start.y), new Vector(end.x + 1, start.y));
			//game.isWhiteTurn = !game.isWhiteTurn;
			return;
		} else if(
			start.x == 4 && start.y == 7 && this.squares[start.x][start.y].constructor.name == "King" &&
			end.x == start.x - 2 && end.y == start.y && this.squares[0][start.y].constructor.name == "Rook" &&
			this.squares[start.x][start.y].timesMoved == 0 && this.squares[0][start.y].timesMoved == 0 && (function(board){
				for(let i = start.x - 1; i > 0; i--){
					if(board.squares[i][start.y].constructor.name != "Empty" || 
						board.isSquareAttacked(!game.isWhiteTurn, new Vector(i,start.y))){
						return false;
					}
				}
				return true;
			})(this) && !this.isSquareAttacked(!game.isWhiteTurn, start)){
			this.move(start,end);
			this.move(new Vector(0,start.y), new Vector(end.x + 1, start.y));
			//game.isWhiteTurn = !game.isWhiteTurn;
			return;
		}

		//En Passant
		//ihnfi

		if(this.squares[start.x][start.y].constructor.name == "Empty"){
			return;
		}
		if(this.squares[start.x][start.y].isWhite != game.isWhiteTurn){
			return;
		}
		if(this.squares[start.x][start.y].constructor.isLegalMove(this,this.squares[start.x][start.y].isWhite,start,end)){
			this.move(start,end);
			//game.isWhiteTurn = !game.isWhiteTurn;
			return;
		}
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
		return true;
	} 
	if((start.x != end.x) || (start.y == end.y)){
		return false;
	}
	if(isWhite){
		if(start.y == 6){
			return (end.y == 5) || (end.y == 4) && board.squares[end.x][end.y].constructor.name == "Empty";
		} else{
			return (end.y == start.y - 1)  && board.squares[end.x][end.y].constructor.name == "Empty";
		}
	} else{
		if(start.y == 1){
			return (end.y == 2) || (end.y == 3) && board.squares[end.x][end.y].constructor.name == "Empty";
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
