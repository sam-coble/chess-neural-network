const express = require('express');
const path = require('path')
const {readFile} = require('fs').promises;

const app = express();
const bodyParser = require('body-parser')

const urlencodedParser = bodyParser.urlencoded({ extended: false })



const tf = require('@tensorflow/tfjs-node');
const {Chess} = require('chess.js');
const wc = require('./webchess.js');

const getContentType = extension => {

	switch(extension){

		case '.map':

		case '.js':
			return 'application/javascript';

		case '.css':
			return 'text/css';

		case '.jpg':
			return 'image/jpg';

		case '.png':
			return 'image/png';

		case '.mp3':
			return 'audio/mpeg';

		case '.ico':
			return 'image/vnd';

		case '':
			return  'text/html';

		default:
			throw `bad file extension: ${extension}`;

	}

}


app.use( express.static( __dirname + '/Chess' ));





async function loadModel(loadFrom){
	const m = await tf.loadLayersModel(loadFrom);
	console.log(m.summary());
	console.log('Model Loaded...');
	return m;
}

// const model = loadModel('file://./models/model4/two/model.json').then((res) => {
// 		return res;
// 	}, (err) => {
// 		console.log('err');
// 	});


function indexOfMax(arr) {
	if (arr.length === 0) {
		return -1;
	}

	let max = arr[0];
	let maxIndex = 0;

	for (let i = 1; i < arr.length; i++) {
		if (arr[i] > max) {
			maxIndex = i;
			max = arr[i];
		}
	}

	return maxIndex;
}

app.post('/moverequest', urlencodedParser, async (req, res) => {

	const chess = new Chess();

	if(chess.validate_fen(req.body.fen).valid){

		chess.load(req.body.fen);





		const inputTensor = tf.tensor2d([wc.getNodesFromFen(req.body.fen)]);
		const prediction = model.predict(inputTensor).arraySync()[0];
		let move;


		do{
	

			move = wc.getMoveFromNodes(prediction, chess.turn() == 'w', true);

			prediction[indexOfMax(prediction)] = 0;


		} while( chess.move(move) === null );

		//res.send(JSON.stringify(move));
		res.send(chess.fen());



	}
	else{
		res.send('invalid FEN');
	}



});


app.get('/*', async (req, res) => {

	// console.log(req.url);

	try{

		switch(req.url){
			case '/':

				res.header('Content-Type', 'text/html');

				res.send( await readFile('./index.html', 'utf8') );

				break;


			default: 

					
				try{
					
					res.header('Content-Type', getContentType( path.extname(req.url) ) );
				

					res.send( await readFile('.' + req.url) );

				}
				catch(err){

					res.header('Content-Type', 'text/html');

					res.send('404 Fie Not Found');


					throw "404 file not found";

				}
		}

	}
	catch(err){
		console.log(err);
	}



});

wc.loadMoveTables();

app.listen(process.env.PORT || 3000, () => console.log(`App Available`));

let model; 
loadModel('file://./models/model6/epoch10/model.json').then(res => {
	model = res;
});

