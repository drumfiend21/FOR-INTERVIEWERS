var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(__dirname + '/public'));
app.use('/', routes);






module.exports = app;
