var router = require('express').Router();

// var tweetBank = require('../tweetBank');
var sqlTweets = require('../models/index.js')


function routes (io) {
	router.get('/', function (req, res) {
		// send the index.html
		sqlTweets.Tweet.findAll({ include: [sqlTweets.User] }).then(function(user){
			res.render('index', {
				title: 'Twitter.js - all tweets',
				showForm: true,
				tweets: user,
		});



		})

	});

	//ALL of the name, tweet for all user/tweet objects

	router.get('/users/:name', function (req, res) {
		var userName = req.params.name;
		sqlTweets.User.findAll({where : { name : userName }}).then(function(user){

					user[0].getTweets().then(function(tweets){

						res.render('index', {
							title: 'Posts by - ' + userName,
							showForm: true,
							tweets: tweets

						})
					})

				})
			
	});

	//name, tweet prop for a given name

	router.get('/users/:name/tweets/:id', function (req, res) {
		var userName = req.params.name;
		var tweetId = parseInt(req.params.id);
			sqlTweets.User.findAll({where : { name : userName }}).then(function(user){

					user[0].getTweets({where : {id : tweetId}}).then(function(tweets){

						res.render('index', {
							title: 'Posts by - ' + userName,
							showForm: true,
							tweets: tweets

						})
					})

				})
	});

	//name, tweet prop for a given name for a given tweet id

	router.post('/submit', function (req, res) {
		var tweetName = req.body.name,
			tweetText = req.body.text;
			sqlTweet.User.create({ name: tweetName}).then(function(user) {
				// sqlTweet.Tweet.create({ tweet: tweetText}).then(function(userTwo){

					
				// })

		})



		// tweetBank.add(tweetName, tweetText);
		// var allTweets = tweetBank.list(),
		// 	newTweet = allTweets[allTweets.length - 1];
		// io.sockets.emit('new_tweet', newTweet);
		// res.redirect('/');
	});

	//name,text

	return router;
}


module.exports = routes;