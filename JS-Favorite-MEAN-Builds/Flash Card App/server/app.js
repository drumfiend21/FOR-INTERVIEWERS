var path = require('path');
var express = require('express');
var FlashCardModel = require('./models/flash-card-model');
var bodyParser = require('body-parser');
var logger = require('morgan');

var app = express(); // Create an express app!
module.exports = app; // Export it so it can be require('')'d

// The path of our public directory. ([ROOT]/public)
var publicPath = path.join(__dirname, '../public');

// The path of our index.html file. ([ROOT]/index.html)
var indexHtmlPath = path.join(__dirname, '../index.html');

// http://nodejs.org/docs/latest/api/globals.html#globals_dirname
// for more information about __dirname

// http://nodejs.org/api/path.html#path_path_join_path1_path2
// for more information about path.join

// When our server gets a request and the url matches
// something in our public folder, serve up that file
// e.g. angular.js, style.css
app.use(express.static(publicPath));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// If we're hitting our home page, serve up our index.html file!
app.get('/', function (req, res) {
    res.sendFile(indexHtmlPath);
});


app.use(function (req, res, next) {
    next();
});

app.post('/cards', function (req, res) {
    console.log("card post route was hit")
    var body = req.body;



    //get info off body
    

    var newCard = new FlashCardModel(req.body);

    newCard.save(function(err, page) {
        console.log("save worked");
        res.send(page)
    })
});

app.put('/cards/:id', function(req,res){
    FlashCardModel.findOne({ _id: req.params.id }, function(err, card) {
        console.log("put request received by server")
        console.log("old card", card)
        console.log("edited card", req.body)

        card.category = req.body.category
        card.question = req.body.question
        card.answers = Array.prototype.map.call(req.body.answers, function(arg) {
          return arg;
        });



        card.save(function(err, data){

            if(err) throw new error("saving edited card issue")

        })



    });


})

app.delete('/cards/:id', function(req,res){
    FlashCardModel.findOne({ _id: req.params.id }, function(err, card) {
        console.log("put request received by server")
        console.log("old card", card)
        console.log("edited card", req.body)

        card.remove()



        card.save(function(err, data){

            if(err) throw new error("issue deleting card")

        })



    });


})

app.get('/cards', function (req, res) {

    
    var modelParams = {};

    if (req.query.category) {
        modelParams.category = req.query.category;
    }

    FlashCardModel.find(modelParams, function (err, cards) {
        console.log(cards.length)
        setTimeout(function () {
            res.send(cards);
        }, Math.random() * 1000);
    });

});

