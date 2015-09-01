module.exports = function (io) {

	var express = require('express');
	var router = express.Router();
	// could use one line instead: var router = require('express').Router();
	var tweetBank = require('../tweetBank');

	router.get('/', function (req, res) {
	  var tweets = tweetBank.list();
	  res.render( 'index', { title: 'All tweets', tweets: tweets, showForm: true } );
	});

	router.get('/users/:name', function(req, res) {
	  var name = req.params.name;
	  var list = tweetBank.find( {name: name} );
	  res.render( 'index', { title: 'Twitter.js - Posts by '+name, tweets: list, showForm: true, name: name  } );
	});

	router.get('/users/:name/tweets/:id', function(req, res) {
	  var name = req.params.name;
	  var ip = req.params.id;
	  var list = tweetBank.find( {name: name, id: Number(ip)} );
	  // console.log({id: Number(ip) })
	  // console.log(list)
	  res.render( 'index', { title: 'Twitter.js - Posts by '+name, tweets: list, id: ip } );
	});

	router.post('/submit', function(req, res) {
	  var name = req.body.name;
	  var text = req.body.text;
	  tweetBank.add(name, text);
	  // res.redirect('/');
	  io.sockets.emit('new_tweet', { name: name , text: text });
	});



	// router.use(function(req, res){

	// 	res.status(404).send('Not found!');

	// });

	// module.exports = router;

  return router;
};