
const chessWebAPI = require('chess-web-api');
const {Chess} = require('chess.js');
const chessAPI = new chessWebAPI();

const tf = require('@tensorflow/tfjs-node');





// load i/o conversion tables

const nodesFromLetter = {
	'p' : [1,0,0,0,0,0,0,0,0,0,0,0],
	'P' : [0,0,0,0,0,0,1,0,0,0,0,0],
	'n' : [0,1,0,0,0,0,0,0,0,0,0,0],
	'N' : [1,0,0,0,0,0,0,1,0,0,0,0],
	'b' : [0,0,1,0,0,0,0,0,0,0,0,0],
	'B' : [0,0,0,0,0,0,0,0,1,0,0,0],
	'r' : [0,0,0,1,0,0,0,0,0,0,0,0],
	'R' : [0,0,0,0,0,0,0,0,0,1,0,0],
	'q' : [0,0,0,0,1,0,0,0,0,0,0,0],
	'Q' : [0,0,0,0,0,0,0,0,0,0,1,0],
	'k' : [0,0,0,0,0,1,0,0,0,0,0,0],
	'K' : [0,0,0,0,0,0,0,0,0,0,0,1],
}

// const nodesFromLetter = {
// 	'p' : [true,false,false,false,false,false,false,false,false,false,false,false],
// 	'P' : [false,false,false,false,false,false,true,false,false,false,false,false],
// 	'n' : [false,true,false,false,false,false,false,false,false,false,false,false],
// 	'N' : [true,false,false,false,false,false,false,true,false,false,false,false],
// 	'b' : [false,false,true,false,false,false,false,false,false,false,false,false],
// 	'B' : [false,false,false,false,false,false,false,false,true,false,false,false],
// 	'r' : [false,false,false,true,false,false,false,false,false,false,false,false],
// 	'R' : [false,false,false,false,false,false,false,false,false,true,false,false],
// 	'q' : [false,false,false,false,true,false,false,false,false,false,false,false],
// 	'Q' : [false,false,false,false,false,false,false,false,false,false,true,false],
// 	'k' : [false,false,false,false,false,true,false,false,false,false,false,false],
// 	'K' : [false,false,false,false,false,false,false,false,false,false,false,true],
// }

global.allPossibleWhiteMoves = [];
global.allPossibleBlackMoves = [];

function loadMoveTables(){

	global.allPossibleWhiteMoves = [];
	global.allPossibleBlackMoves = [];

	const board = new Chess();
	board.clear();


	//white

	//all queen (rook + bishop) and knight moves
	for(let i = 0; i < 8; i++){
		for(let j = 0; j < 8; j++){

			board.put({type: 'q', color: 'w'}, String.fromCharCode(i + 97) + (j + 1) );

			global.allPossibleWhiteMoves = global.allPossibleWhiteMoves.concat(
				board.moves({verbose:true})
			);


			board.put({type: 'n', color: 'w'}, String.fromCharCode(i + 97) + (j + 1) );

			global.allPossibleWhiteMoves = global.allPossibleWhiteMoves.concat(
				board.moves({verbose:true})
			);

			board.remove(String.fromCharCode(i + 97) + (j + 1) );
		}
	}

	//all pawn promotions
	for(let i = 0; i < 8; i++){
		//places pawn on 7th rank
		board.put({type: 'p', color: 'w'}, String.fromCharCode(i+97) + 7);

		//places knights to be captured on 8th rank
		board.put({type: 'n', color: 'b'}, String.fromCharCode(i+96) + 8);
		board.put({type: 'n', color: 'b'}, String.fromCharCode(i+98) + 8);


		global.allPossibleWhiteMoves = global.allPossibleWhiteMoves.concat(board.moves({verbose: true}));

		board.remove(String.fromCharCode(i+97) + 7);
		board.remove(String.fromCharCode(i+96) + 8);
		board.remove(String.fromCharCode(i+98) + 8);
	}

	//kingside castle
	global.allPossibleWhiteMoves.push(
		{
			color: 'w',
			from: 'e1',
			to: 'g1',
			flags: 'k',
			piece: 'k',
			san: 'O-O'
		}
	);

	//queenside castle
	global.allPossibleWhiteMoves.push(
		{
			color: 'w',
			from: 'e1',
			to: 'c1',
			flags: 'q',
			piece: 'k',
			san: 'O-O-O'
		}
	);


	//black

	board.load('8/8/8/8/8/8/8/8 b - - 0 50');

	//all queen (rook + bishop) and knight moves
	for(let i = 0; i < 8; i++){
		for(let j = 0; j < 8; j++){

			board.put({type: 'q', color: 'b'}, String.fromCharCode(i + 97) + (j + 1) );

			global.allPossibleBlackMoves = global.allPossibleBlackMoves.concat(
				board.moves({verbose:true})
			);


			board.put({type: 'n', color: 'b'}, String.fromCharCode(i + 97) + (j + 1) );

			global.allPossibleBlackMoves = global.allPossibleBlackMoves.concat(
				board.moves({verbose:true})
			);

			board.remove(String.fromCharCode(i + 97) + (j + 1) );
		}
	}

	//all pawn promotions
	for(let i = 0; i < 8; i++){
		//places pawn on 2nd rank
		board.put({type: 'p', color: 'b'}, String.fromCharCode(i+97) + 2);

		//places knights to be captured on 1st rank
		board.put({type: 'n', color: 'w'}, String.fromCharCode(i+96) + 1);
		board.put({type: 'n', color: 'w'}, String.fromCharCode(i+98) + 1);


		global.allPossibleBlackMoves = global.allPossibleBlackMoves.concat(board.moves({verbose: true}));

		board.remove(String.fromCharCode(i+97) + 2);
		board.remove(String.fromCharCode(i+96) + 1);
		board.remove(String.fromCharCode(i+98) + 1);

	}

	//kingside castle
	global.allPossibleBlackMoves.push(
		{
			color: 'b',
			from: 'e8',
			to: 'g8',
			flags: 'k',
			piece: 'k',
			san: 'O-O'
		}
	);

	//queenside castle
	global.allPossibleBlackMoves.push(
		{
			color: 'b',
			from: 'e8',
			to: 'c8',
			flags: 'q',
			piece: 'k',
			san: 'O-O-O'
		}
	);


	console.log("move tables loaded...\n");
}


function getNodesFromMove(move){

	const nodes = Array(1882);
	for(let i = 0; i < 1882; i++){
		nodes[i] = 0;
	}

	let  index;

	if(move.color == 'w'){
		if(global.allPossibleWhiteMoves.length == 0){
			console.log("not loaded");
		}
		index = global.allPossibleWhiteMoves.findIndex(
			element => {

				return (element.from === move.from &&
						element.to === move.to &&
						((move.promotion == undefined) ? true : element.promotion === move.promotion));
			}
		);
	}
	else{
		if(global.allPossibleBlackMoves.length == 0){
			console.log("not loaded");
		}
		index = global.allPossibleBlackMoves.findIndex(
			element => {

				return (element.from === move.from &&
						element.to === move.to &&
						((move.promotion == undefined) ? true : element.promotion === move.promotion));
			}
		);
	}

	if(index == -1){
		console.log('problem: ', move.to);
	}

	nodes[index] = 1;

	
	//return as array
	//return nodes;



	//return  as typed array
	return new Uint8Array(nodes);

}

function  getMoveFromNodes(nodes, isWhite, shouldGoThrough){
	if(shouldGoThrough == undefined){
		shouldGoThrough = false;
	}
	if(shouldGoThrough){
		let index = 0;
		let  max = nodes[0];
		for(let i = 1, n = nodes.length; i < n; i++){
			if(nodes[i] > max){
				max = nodes[i];
				index = i;
			}
		}
		if(isWhite){
			return global.allPossibleWhiteMoves[index];
		}
		else{
			return global.allPossibleBlackMoves[index];
		}
	}
	else{
		if(isWhite){
			return global.allPossibleWhiteMoves[nodes.indexOf(1)];
		}
		else{
			return global.allPossibleBlackMoves[nodes.indexOf(1)];
		}
	}
	console.log('something went wrong');


	
	
}


function getNodesFromFen(fen){
	let nodes = [];
	for(let i = 0,n = fen.length; i < n; i++){

		const code = fen.charCodeAt(i);

		if(code === 32){//32 = ' '
			const game = new Chess();
			game.load(fen);
			nodes.push((game.turn() == 'w') ? 1 : 0);

			return nodes;
		}

		if(code === 47){// 47 = '/'
			continue;
		}

		else if(code <= 56 && code >= 49){// 56 = '8'; 49 = '1'

			for(let j = 0; j < code - 48; j++){

				nodes = nodes.concat([0,0,0,0,0,0,0,0,0,0,0,0]);
				//nodes = nodes.concat([false,false,false,false,false,false,false,false,false,false,false,false]);


			}
			continue;

		}
		else{

			nodes = nodes.concat(nodesFromLetter[fen.charAt(i)]);


		}
	}

	const game = new Chess();
	game.load(fen);
	nodes.push((game.turn() == 'w') ? 1 : 0);



	//return as Array
	//return nodes;


	//return as typed array
	return new Uint8Array(nodes);
}

function getFenFromNodes(nodes_){
	const nodes = [...nodes_]

	let board = '';


	OUTER: for(let i = 0, n = nodes.length - 1; i < n; i += 12){
		let arr = nodes.splice(0,12);
		//console.log(arr);
		let keys = Object.keys(nodesFromLetter);


		INNER: for(let j = 0, m = keys.length; j < m; j++){
			if(JSON.stringify(nodesFromLetter[keys[j]]) == JSON.stringify(arr)){
				board += keys[j];
				continue OUTER;
			}
		}
		board += ' ';
	}


	//console.log('board: ' + board);

	let game = new Chess();
	game.clear();

	if(nodes[nodes.length - 1] < 0.5){
		game.load(game.fen().replace('w', 'b'));
	}

	for(let i = 0, n = board.length; i < n; i++){
		if(board.charAt(i) == ' '){
			continue;
		}
		else{
			
			game.put(
				{
					type: board.charAt(i).toLowerCase(),
					color: (board.charAt(i).charCodeAt() >= 97) ? 'b' : 'w'
				},
				String.fromCharCode( (i % 8 ) + 97) + (-1 * ( 1 + Math.floor(i / 8 ) ) + 9)
			);
			
		}
	}
	return game.fen();
}

function getChessObjectFromPGN(game_pgn){
	const game =  new Chess();
	game.load_pgn(game_pgn);
	return game;
}

function getFensFromGame(game, targetPlayerIsWhite) {
	
	const moves = game.history();
	const newGame = new Chess();

	const fens = [newGame.fen()];

	for (let i = 0, n = moves.length; i < n; i++) {
		newGame.move(moves[i]);
		fens.push(newGame.fen());
	}

	if(targetPlayerIsWhite == undefined){
		return fens;
	}
	else if(targetPlayerIsWhite){
		return fens.filter((element, index) => {
  			return index % 2 === 0;
		});
	}
	else{
		return fens.filter((element, index) => {
			return index % 2 === 1;
		});
	}

}

// function getGamesFromMonth(username, year, month){
	
// 	chessAPI.getPlayerCompleteMonthlyArchives(username , year , month)
// 		.then(function(res) {

// 			//console.log(res.body.games.length);

// 			return res.body.games;

// 	    }, function(err) {
// 	        console.error(err);
// 	    });

// }

async function getGamesFromMonth(username, year, month){
	
	const g = await chessAPI.getPlayerCompleteMonthlyArchives(username , year , month);

	return g.body.games;
		

}

async function getAllDataAndLabelsFromMonth(username, year, month , increment){
	
	if(increment == undefined){
		increment = 1;
	}

	

	return getGamesFromMonth(username, year, month).then(res => {

		const data_ = [];
		const labels_ = [];
		
	

		for(let j = 0, m = res.length; j < m; j += increment){

			if(Math.floor(m/10) === j){
				console.log(`Loading Games(${month}): 10%...`);
			}
			else if(Math.floor(m/4) === j){
				console.log(`Loading Games(${month}): 25%...`);
			}
			else if(Math.floor(m/2) === j){
				console.log(`Loading Games(${month}): 50%...`);
			}
			else if(Math.floor(m * 0.75) === j){
				console.log(`Loading Games(${month}): 75%...`);
			}
			else if(j === m -1){
				console.log(`Loading Games(${month}): 100%...`);
			}




			const chessObj = getChessObjectFromPGN(res[j].pgn);

			//get fens for "data"
			const fens = getFensFromGame(
				chessObj, 
				res[j].white.username == username
			);

			

			//get moves for "labels"
			let moves = chessObj.history({verbose: true});


			moves = moves.filter((element, index) => {
				return ((index % 2) === ((res[j].white.username == username) ? 0 : 1));
			});



			//if fens is larger than moves because user lost on time or resigned,
			//then remove  the last position to keep the arrays aligned.
			
			if(fens.length != moves.length){
				fens.pop();
			}


			//assign fen and move nodes to 'data' and 'labels' arrays

			for(let i = 0, n = fens.length; i < n; i++){
				data_.push(getNodesFromFen(fens[i]));
			}

			for(let i = 0, n = moves.length; i < n; i++){

				labels_.push(getNodesFromMove(moves[i]));
			}

		}
		

		console.log("Length of data: " + data_.length);
		console.log("Length of data[0]: " + data_[0].length  );
		console.log("Length of labels: " + labels_.length);
		console.log("Length of labels[0]: " + labels_[0].length + "\n");


		const used = process.memoryUsage().heapUsed / 1024 / 1024;
		console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);



		const obj = {
			data: data_,
			labels : labels_,
		};
		
		return obj;

		

		//console.log('\n\npos: ' + data[40], 'move: ' + labels[40]);

		

	}, err => {
		throw err;
	});

	

	

}




async function makeSaveModel(modelName){
	



		
	const model = tf.sequential(
		{
			layers: [
				tf.layers.dense({
					inputShape : [769],
					units : 1500,
					actication : 'relu'
				}),

				tf.layers.dense({
					units : 2500,
					activation : 'relu'
				}),

				tf.layers.dense({
					units: 1882,
					activation : 'softmax'
				}),
			]
		}
	);


	console.log(model.summary());




	await model.save(modelName);


	

		
}



// async function trainModel(modelName){
	


// 	getAllDataAndLabelsFromMonth('Hikaru', 2020,[1]).then( async (res) => {

		
// 		//load model
// 		const model = await tf.loadLayersModel(modelName)


// 		console.log('Model Summary: ', model.summary() + '\n');


// 		console.log('\n\nStarting Training...\n\n');


// 		model.compile({
// 			optimizer: 'adam',
// 			loss: 'meanSquaredError',
// 			metrics: ['accuracy']
// 		});


// 		function onBatchEnd(batch, logs) {
// 			console.log('\nAccuracy', logs.acc);
// 		}


// 		const d = tf.tensor(res.data);
// 		const l = tf.tensor(res.labels);



// 		model.fit(
// 			d,
// 			l,
// 			{
// 				epochs: 30,
// 				batchSize: 64,
// 				callbacks: {onBatchEnd}

// 			}
// 		).then(info => {
// 			console.log('Final accuracy', info.history.acc);
// 		});


// 		model.save('file://./models/firstModel/trained/one');


// 	}, err => {
// 		console.log('\n\n\n\nERROR: \n'  + err);
// 	});

		
// }

async function trainModel(loadFrom, saveTo){
	


	const dl = await getAllDataAndLabelsFromMonth('Hikaru', 2020,2,1);

	let dl2 = await getAllDataAndLabelsFromMonth('Hikaru', 2020,3);

	dl.data = dl.data.concat(dl2.data);
	dl.labels = dl.labels.concat(dl2.labels);

	
	dl2 = await getAllDataAndLabelsFromMonth('Hikaru', 2020,4, 1);

	dl.data = dl.data.concat(dl2.data);
	dl.labels = dl.labels.concat(dl2.labels);


	dl2 = await getAllDataAndLabelsFromMonth('Hikaru', 2020,5, 1);

	dl.data = dl.data.concat(dl2.data);
	dl.labels = dl.labels.concat(dl2.labels);

	dl2 = undefined;

	function shuffle(obj1, obj2) {
		var index = obj1.length;
		var rnd, tmp1, tmp2;

		while (index) {
			rnd = Math.floor(Math.random() * index);
			index -= 1;
			tmp1 = obj1[index];
			tmp2 = obj2[index];
			obj1[index] = obj1[rnd];
			obj2[index] = obj2[rnd];
			obj1[rnd] = tmp1;
			obj2[rnd] = tmp2;
		}
	}

	shuffle(dl.data, dl.labels);
	console.log('Data Shuffled...');

	//load model
	const model = await tf.loadLayersModel(loadFrom)


	model.summary();

	console.log('\n\nStarting Training...\n\n');


	function customLoss(y_start, y_pred){

		// %n is for batches with less than 64 elements


		let loss = tf.losses.meanSquaredError(y_start, y_pred);


		const arr = y_pred.arraySync();

		for(let i = 0, n = arr.length; i < 64; i++){


			const board = new Chess(getFenFromNodes( dl.data[ (batchNumber * 64) + (i % n) ] ) );


			const move = getMoveFromNodes(arr[i % n], board.turn() == 'w', true);

			if(board.move(move) === null){
				loss = loss.add(tf.scalar(0.00003));
			}
			board.undo();


			// if(i === 0){
			// 	console.log('\t\tpredicted move: ' + move + '\t\t\t\tplayed move: ' )
			// }
		}

		return  loss;

	}


	model.compile({
		optimizer: 'adam',
		loss: customLoss,
		metrics: ['accuracy']
	});

	console.log('Model Compiled...')


	let batchNumber = 0;
	function onBatchEnd(batch, logs) {
		// console.log('Accuracy', logs.acc);
		batchNumber++;
	}
	let epochNumber = 0;
	function onEpochEnd(batch, logs){
		batchNumber = 0;
		const used = process.memoryUsage().heapUsed / 1024 / 1024;
		console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
		epochNumber++;


		if(epochNumber % 2 == 0){
			model.save(saveTo + `/epoch${epochNumber}`);
		}
	}





	// // fit (not dataset) stuff

	// const d = tf.tensor2d(dl.data,[dl.data.length, dl.data[0].length], 'bool');
	// const l = tf.tensor2d(dl.labels, [dl.labels.length, dl.labels[0].length], 'bool');

	// dl.labels = undefined;


	// const used = process.memoryUsage().heapUsed / 1024 / 1024;
	// console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);



	// model.fit(
	// 	d,
	// 	l,
	// 	{
	// 		epochs: 200,
	// 		batchSize: 64,
	// 		callbacks: {onBatchEnd, onEpochEnd},
	// 		shuffle: false

	// 	}
	// ).then(info => {
	// 	console.log('Final accuracy', info.history.acc);
	// 	model.save(saveTo);
	// 	console.log('model saved');
	// });











	//dataset  stuff

	function* gendata(){
		for(let i_ = 0; i_ < dl.data.length; i_++){
			yield tf.tensor(dl.data[i_ % dl.data.length]).clone();
		}
	}
	function* genlabels(){
		for(let j_ = 0; j_ < dl.labels.length; j_++){
			yield tf.tensor(dl.labels[j_ % dl.labels.length]).clone();
		}
	}


	const xs = tf.data.generator(gendata);
	const ys = tf.data.generator(genlabels);



	const ds = tf.data.zip({xs,ys}).batch(64);


	//dl.labels = undefined;


	const used = process.memoryUsage().heapUsed / 1024 / 1024;
	console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);



	const info = await model.fitDataset(
		ds,
		{
			epochs: 200,
			callbacks: {onBatchEnd, onEpochEnd},

		}
	)
	
	console.log('Final accuracy', info.history.acc);
	model.save(saveTo);
	console.log('model saved');



		
}



async function loadAndPredict(loadFrom, month, dl){


	const model = await tf.loadLayersModel(loadFrom);
	if(dl == undefined){
		dl = await getAllDataAndLabelsFromMonth('Hikaru', 2020, month, 1);
	}

	//let  pos = 48;


	const d = tf.tensor2d(dl.data);


	const prediction = model.predict(d);

	const predarr = prediction.arraySync();

	let total = 0;
	let rmtotal = 0;

	for(let i = 0, n = predarr.length; i < n; i++){
		const board = new Chess();
		board.load(getFenFromNodes(dl.data[i]));


		const  actual = getMoveFromNodes(dl.labels[i],board.turn() == 'w');
		const pred = getMoveFromNodes(predarr[i], board.turn() == 'w', true);

		if(actual.to == pred.to && actual.from == pred.from){
			total++;
		}
		if(board.move(pred) !== null){
			rmtotal++;
		}
	}

	console.log(`month: ${month}\taccuracy of real moves: `, rmtotal / predarr.length);
	console.log(`model:${loadFrom.slice(-18,-11)}\taccuracy of predicted moves: `, total / predarr.length)
	// console.log('\n\nBoard: \n' + board.ascii() + 
	// 	'\nTurn:\t' + board.turn() + 
	// 	'\n\nActual Move:\n' + actual.from + '\t' + actual.to + 
	// 	'\n\nPrediction:\n' + pred.from + '\t' + pred.to
	// );
}

async function predictMultiple(files, month){
	
	const dl = await getAllDataAndLabelsFromMonth('Hikaru', 2020, month, 1);
	

	//let  pos = 48;


	const d = tf.tensor2d(dl.data);

	for(let i = 0; i < files.length; i++){


		const model = await tf.loadLayersModel(files[i]);

		const prediction = model.predict(d);

		const predarr = prediction.arraySync();

		let total = 0;
		let rmtotal = 0;

		for(let i = 0, n = predarr.length; i < n; i++){
			const board = new Chess();
			board.load(getFenFromNodes(dl.data[i]));


			const  actual = getMoveFromNodes(dl.labels[i],board.turn() == 'w');
			const pred = getMoveFromNodes(predarr[i], board.turn() == 'w', true);

			if(actual.to == pred.to && actual.from == pred.from){
				total++;
			}
			if(board.move(pred) !== null){
				rmtotal++;
			}
		}

		console.log(`model:${files[i].slice(-18,-11)}\taccuracy of real moves: `, rmtotal / predarr.length);
		console.log(`month: ${month}\taccuracy of predicted moves: `, total / predarr.length)
	}
	// console.log('\n\nBoard: \n' + board.ascii() + 
	// 	'\nTurn:\t' + board.turn() + 
	// 	'\n\nActual Move:\n' + actual.from + '\t' + actual.to + 
	// 	'\n\nPrediction:\n' + pred.from + '\t' + pred.to
	// );
}

// loadMoveTables();
// trainModel('file://./models/model6/model.json','file://./models/model6');
// makeSaveModel('file://./models/model6');
// loadAndPredict('file://./models/model5/one/one/one/epoch60/model.json', 6);



// let arr = [];
// for(let z = 2; z <= 38; z+=2){
// 	arr.push(`file://./models/model6/epoch${z}/model.json`);
// }
// predictMultiple(
// 	arr,
// 	7,
// )

exports.getNodesFromFen = getNodesFromFen;
exports.nodesFromLetter = nodesFromLetter;
exports.loadMoveTables = loadMoveTables;
exports.getMoveFromNodes = getMoveFromNodes;

// async function mm(){
// 	const o = await getAllDataAndLabelsFromMonth('Hikaru', 2020, 4);
// 	console.log(o.labels.length, o.data.length);
// 	const used = process.memoryUsage().heapUsed / 1024 / 1024;
// 	console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
// }
// mm();





// async function newmain(loadFrom, saveTo){
// 	function shuffle(obj1, obj2) {
// 		var index = obj1.length;
// 		var rnd, tmp1, tmp2;

// 		while (index) {
// 			rnd = Math.floor(Math.random() * index);
// 			index -= 1;
// 			tmp1 = obj1[index];
// 			tmp2 = obj2[index];
// 			obj1[index] = obj1[rnd];
// 			obj2[index] = obj2[rnd];
// 			obj1[rnd] = tmp1;
// 			obj2[rnd] = tmp2;
// 		}
// 	}
	
// 	const dl = await getAllDataAndLabelsFromMonth('Hikaru', 2020,3,25);


// 	for(let uu = 0; uu < 200; uu++){
// 		function customLoss(y_start, y_pred){

// 			// %n is for batches with less than 64 elements


// 			let loss = tf.losses.meanSquaredError(y_start, y_pred);


// 			const arr = y_pred.arraySync();

// 			for(let i = 0, n = arr.length; i < 64; i++){


// 				const board = new Chess(getFenFromNodes( dl.data[ (batchNumber * 64) + (i % n) ] ) );


// 				const move = getMoveFromNodes(arr[i % n], board.turn() == 'w', true);

// 				if(board.move(move) === null){
// 					loss = loss.add(tf.scalar(0.00005));
// 				}
// 				board.undo();


// 				// if(i === 0){
// 				// 	console.log('\t\tpredicted move: ' + move + '\t\t\t\tplayed move: ' )
// 				// }
// 			}

// 			return  loss;

// 		}
// 		shuffle(dl.data, dl.labels);
// 		console.log('Data Shuffled...');

// 		//load model
// 		const model = await tf.loadLayersModel(loadFrom)


// 		console.log('Model Summary: ', model.summary() + '\n');


// 		console.log('\n\nStarting Training...\n\n');

// 		model.compile({
// 			optimizer: 'adam',
// 			loss: customLoss,
// 			metrics: ['accuracy']
// 		});

// 		console.log('Model Compiled...')


// 		let batchNumber = 0;
// 		function onBatchEnd(batch, logs) {
// 			console.log('\nAccuracy', logs.acc);
// 			batchNumber++;
// 		}
// 		function onEpochEnd(batch, logs){
// 			batchNumber = 0;
// 			const used = process.memoryUsage().heapUsed / 1024 / 1024;
// 			console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
// 		}





// 		// fit (not dataset) stuff

// 		const d = tf.tensor2d(dl.data,[dl.data.length, dl.data[0].length], 'bool').clone();
// 		const l = tf.tensor2d(dl.labels, [dl.labels.length, dl.labels[0].length], 'bool').clone();

// 		// dl.labels = undefined;


// 		const used = process.memoryUsage().heapUsed / 1024 / 1024;
// 		console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);



// 		const info = await model.fit(
// 			d,
// 			l,
// 			{
// 				epochs: 1,
// 				batchSize: 64,
// 				callbacks: {onBatchEnd, onEpochEnd},
// 				shuffle: false

// 			}
// 		);
// 		console.log('Final accuracy', info.history.acc);
// 		model.save(saveTo);
// 		console.log('model saved');
// 	}

// }
// newmain('file://./models/model5/one/one/model.json','file://./models/model5/one/one/one');
