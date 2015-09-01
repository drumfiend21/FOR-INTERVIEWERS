var router = require('express').Router();


var User = require('./user.model.js');

router.get('/', function (req, res) {
	res.render('home');
});

router.get('/signup', function (req, res) {
	res.render('signup');
});

router.post('/signup', function (req, res, next) {
	//intercept and set as hash
	//will call the virtual because "password" is a key name and calls using "="

	//add salt to document


	//store req.body -> username
	//store hashed pass
	User.create(req.body, function (err, user) {
		if (err) next(err);
		req.session.userId = user._id
		else res.redirect('/success');
	});
});

router.get('/login', function (req, res) {
	res.render('login');
});

router.post('/login', function (req, res, next) {
	User.findOne(req.body.name, function (err, user) {
		if (err) next(err);
		else if (!user) res.redirect('/failure');
		else {

			if(user.authenticate(req.body.password)){
				req.session.userId = user._id
				res.redirect('/success');	
			}
			else{
				res.redirect('/failure')
			}
		}
	});
});

router.get('/membersOnly', function (req, res, next) {
	if(req.session.userId){
		console.log("authenticated for members only")
		res.render('secret');
	}else{
		console.log("did not authenticate for members only")
		res.redirect('/failure')
	}
});

router.get('/logout', function (req, res, next) {
	delete req.session.userId
	res.redirect('/')
});

router.get('/success', function (req, res) {
	res.render('success');
});

router.get('/failure', function (req, res, next) {
	var err = new Error('Not Authenticated');
	err.status = 401;
	next(err);
});

module.exports = router;