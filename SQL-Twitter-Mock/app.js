var express = require('express'),
	logger = require('morgan'),
	swig = require('swig'),
	bodyParser = require('body-parser'),
	socketio = require('socket.io');



var app = express();

require('./models')

// where to find files to render
app.set('views', __dirname + '/views');
// what kind of files to render
app.set('view engine', 'html');
// how to render 'html' files
app.engine('html', swig.renderFile);
// caching off
swig.setDefaults({ cache: false });

// body parsing
app.use(bodyParser.urlencoded({extended: true}));
// urlencoded, e.g. name=Omri&favoriteColor=transparent
app.use(bodyParser.json());

// log
app.use(logger('dev'));

// express.static file server
app.use(express.static(__dirname + '/public'));

// // custom file server
// app.use(function (req, res, next) {
// 	require('fs').readFile(__dirname + '/public' + req.path, function (err, data) {
// 		if (err) next();
// 		else res.send(data);
// 	});
// });

// listen
var port = 3000;
var server = app.listen(port, function () {
	console.log('Server listening on port', port);
});

var io = socketio.listen(server);

var rootRouter = require('./routes')(io);

app.use(rootRouter);
