var express = require('express');
var morgan = require('morgan');
var swig = require('swig');
var tweet = require('./tweetBank.js');
var routes = require('./routes/');
var bodyParser = require('body-parser');
var socketio = require('socket.io');
var app = express();

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

var io = socketio.listen(server);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');


app.use('/',routes(io));
app.use(morgan('dev'));

swig.setDefaults({ cache: false });

// var beelbs = [{name: 'Tom'}, {name: 'Helbin'}, {name: 'Drongo'}];




// app.get('/', function (req, res) {
//   res.render( 'index', {title: 'Hall of Fame', people: beelbs} );
// });

// app.get('/news', function (req, res) {
//   res.send('This is old news!');
// });

app.use(express.static(__dirname + '/public'));