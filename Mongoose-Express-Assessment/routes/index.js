var express = require('express');
var router = express.Router();

var Article = require('../models/article');

/**
 *
 *___ _____ _   ___ _____   _  _ ___ ___ ___
 / __|_   _/_\ | _ \_   _| | || | __| _ \ __|
 \__ \ | |/ _ \|   / | |   | __ | _||   / _|
 |___/ |_/_/ \_\_|_\ |_|   |_||_|___|_|_\___|
						CREATE ADDITIONAL ROUTES
 */

// Respond with a list of all articles.
router.get('/articles', function (req, res) {

	Article.find(function(err, pages){
	    if(pages){
	    	res.json(pages)
	    }
		else{
			res.json([]);
		}
	});
});

// Respond with one article.
router.get('/articles/:id', function (req, res) {

	var id = req.params.id;

	Article.findOne({_id: id}, function(err, page){

		if(!page){

			return next(new Error("ID is not correct!"))
		}
		else{
			res.json(page)
		}

	})
});

// Use the request to create an article.
router.post('/articles', function (req, res) {

	var data = req.body

	if(!data.body){
		return next(new Error("ID is not correct!"))
	}
	else{

	    var obj = new Article();
	    obj.title = data.title;
	    obj.body = data.body;
	    obj.save(function(err){
		    var wrapObj = {
		    	message: "Created Successfully",
		    	article: obj
		    }
		    res.json(wrapObj);
	    })
	}
});

// Use the request to update a specific article.
router.put('/articles/:id', function (req, res) {

	Article.findOne({_id: req.params.id}, function(err, doc){

    	doc.title = req.body.title;
	  	doc.save(function(err){
			    var wrapObj = {
			    	message: "Updated Successfully",
			    	article: doc
			    }
			    res.json(wrapObj);  		
	  	})
	  
    })

});

router.use(function (err, req, res, next) {
	res.status(500).send(err.message);
});

module.exports = router;
