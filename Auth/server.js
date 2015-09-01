var express = require('express'),
	fs = require('fs'),
	http = require('http'),
	session = require('express-session'),
	swig = require('swig'),
	logger = require('morgan'),
	bodyParser = require('body-parser');


var app = express();

var key;
var cert;




app.set('views', __dirname + '/pages');
app.set('view engine', 'html');
app.engine('html', swig.renderFile);
swig.setDefaults({cache: false});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(session({
    // resave is only necessary for certain session stores
    // in our case we shouldn't need it
    resave: false,
    // by setting saveUninitialized to false
    // we will be preventing the session from being created
    // until it has data associated with it
    saveUninitialized: false,
    // the secret encrypts the session id
    secret: 'tongiscool',
    cookie: {
        // this keeps the session cookie from being sent over HTTP
        // otherwise it would be easy to hijack the session!
        secure: false
    }
}));
app.use(require('./routes'));


app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

app.use(function (err, req, res, next) {
	err.status = err.status || 500;
	res.render('error', {error: err});
});

fs.readFile('./key.pem', function (err, keyData) {
	if (err) console.log(err);
	key = keyData
	console.log("We have the key", key);

	fs.readFile('./cert.pem', function (err, certData) {

		if (err) console.log(err);
		cert = certData;
		console.log("We have the cert", cert);

		var options = {
		    key: key,
		    cert: cert
		};

		console.log("consolidated as options", options)
		
		var port = 1337;
		app.listen(port, function (err) {
			if (err) console.log(err)
			console.log('Server ready on port', port);
		});

	});

});

