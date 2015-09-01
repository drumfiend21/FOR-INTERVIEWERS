var express = require('express');
var router = express.Router();

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.render('add.html');
// });

router.get('/', function (req, res) {
	var userName = req.params.name;

		res.render('add.html', {
			title: "ADD A PAGE"
			
			
			
		})
		
});


router.post('/submit', function (req, res) {
	var models = require('../models/');		
	var secret;

	var stringGen = function(title){
		if(title === ""){
			var str = "";
			var alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
			for(var i = 0; i<4; i++){
				var num = Math.floor((Math.random()*25)+1)
				str += alpha[num];
			}
			return str;
		}else{
			var modTitle = title;
			var re = /\W/g;
			var sp = /\s/g;
			var modTitleTwo = modTitle.replace(sp,"_");
			var modTitleThree = modTitleTwo.replace(re,"");
			return modTitleThree;

		}
	}

	var numGen = function(){

		var str = "";
		for(var i = 0; i < 4; i++ ){
	  		str+=(Math.floor(Math.random()*10));
	  	}
	  	return str
	}


	var title = req.body.title,
		body = req.body.content,
		url_name = stringGen(title);
		tags = req.body.tags
		var sp = /\s/g;
		var tagsTwo = tags.replace(sp,"").split("#")
		tagsTwo.shift();
		

					

		// var urlName = req.params.name;
		
		models.Page.find({title: title}, function(err, page){
		  	// console.log(page.length, numGen())
		  	console.log(page.length)

		  	// var numArr = [];
		  	// for(var i = 1; i < page.length+1; i++ ){
		  	// 	numArr.push(i)
		  	// }

		  	// if(page.length === 0){
			  	// var tit = page[0].title;
			  	// var fin = tit.toUpperCase();
			  	// secret = "sec/"+fin;
			  	// var tags = page[0].tags;
			  	// res.render( 'show', { title: fin , body: page[0].body, tags: page[0].tags} );

			// }
			// if(page.length > 0){
			  	// var tit = title;
			  	// var fin = tit.toUpperCase();
			  	secret = "sec/"+title+numGen(); 
			  	// var tags = page[0].tags;
			  	// console.log(fin);
				// res.render( 'show', { title: fin , body: page[0].body, tags: page[0].tags} );

			// }
				// console.log(secret)
	
			var page = new models.Page({ 'title': title, 'body': body, 'url_name': url_name, 'tags': tagsTwo, 'sec_url': secret });
		    page.save();
		    res.redirect('/');

		  

	    });	
	
	

			

});

module.exports = router;
