var express = require('express');
var router = express.Router();
var model = require('../models/index.js')


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


/* GET home page. */
router.get('/', function(req, res, next) {
  model.Page.find(function(err, pages){

  	res.render('index', { docs: pages });

  })
 
});


router.get('/submit', function(req, res, next) {
  // model.Page.find(function(err, pages){
  	// res.render('index', { docs: pages });

  		var tags = req.query.tagSearch
  		var sp = /\s/g;
		var tagsTwo = tags.replace(sp,"").split("#")
		tagsTwo.shift();
		console.log(tags);  //[ 'elephant', 'pants', '1940' ]
		
		model.Page.find({
		    // $elemMatch matches array subdocuments
		    // $in matches a set of possibilities
		    tags: {$elemMatch: {$in: tagsTwo}}
		}).exec(function(err,pages){

			res.render('index', { docs: pages });



		});


  // })
 
});

router.get('/delete', function(req, res, next) {
  var referrerUrl = req.headers.referer.replace("http://localhost:3000/wiki/","");
  
  console.log(referrerUrl, referrerUrl.indexOf("sec/"))

  if(referrerUrl.indexOf("sec/") === -1){
   
    model.Page.find({url_name: referrerUrl}, function(err, doc){
    	
    	console.log(doc)
    	doc[0].remove();
  		res.redirect("/");
	  
    })

  }else{

	  model.Page.find({sec_url: referrerUrl}, function(err, doc){
	  	// console.log(referrerUrl)
	  	// console.log(doc)
	  	doc[0].remove();
	  	res.redirect("/");

		})
	} 
});


//for editing documents
// var oldTitle = "";
// var oldBody = "";
// var oldTags = "";
var oldUrl = "";

router.get('/edit/submit', function(req, res, next) {
    var referrerUrl = req.headers.referer.replace("http://localhost:3000/wiki/","");
    var data = req.query;
    var title = stringGen(data.title);
    var tags = data.tags;
    var sp = /\s/g;
	var tagsTwo = tags.replace(sp,"").split("#")
	tagsTwo.shift();
// {title: data.title }, { url_name: title }, {tags: data.tags } , {$set :{body: data.content }},
    

  if(referrerUrl.indexOf("sec/")<1){
   
    model.Page.find({sec_url: oldUrl}, function(err, doc){
    	// console.log(doc)
    	doc[0].title = data.title;
    	doc[0].body = data.content;
    	doc[0].tags = tagsTwo;
	  	doc[0].save(function(err){

	  		res.redirect("/");

	  	})
	  
    })

  }else{

    model.Page.find({url_name: oldUrl}, function(err, doc){
    	// console.log(doc)
    	doc[0].title = data.title;
    	doc[0].body = data.content;
    	doc[0].tags = tagsTwo;
	  	doc[0].save(function(err){

	  		res.redirect("/");

	  	})
	  
    })
  	


  }





 
});


router.get('/pageSubmit', function(req, res, next) {
    var referrerUrl = req.headers.referer.replace("http://localhost:3000/wiki/","");
    var data = req.query;
    // console.log(data.tagSearch)
    console.log(data)

    model.Page.find({title: data.tagSearch}, function(err, doc){
    	// console.log(doc)
    // 	doc[0].title = data.title;
    // 	doc[0].body = data.content;
    // 	doc[0].tags = tagsTwo;
	  	// doc[0].save(function(err){

	  	// res.redirect("/");

  	}).exec(function(err,morepages){
			// console.log(morepages)
			// res.render('index', { docs: morepages });
			res.redirect("/wiki/"+req.query.tagSearch)
	})
	  	
	
});




router.get('/edit', function(req, res, next) {
  var referrerUrl = req.headers.referer.replace("http://localhost:3000/wiki/","");
  oldUrl = referrerUrl
  console.log(referrerUrl)
  // console.log(referrerUrl.indexOf("sec/"))

  if(referrerUrl.indexOf("sec/")<1){

  	model.Page.find({sec_url: referrerUrl}, function(err,doc){
  		console.log(doc);
  		res.render("edit", { tags: doc[0].tags, body: doc[0].body, title: doc[0].title});
	})
  }else{
  	
  	model.Page.find({url_name: referrerUrl}, function(err,doc){

  		res.render("edit", { tags: doc[0].tags, body: doc[0].body, title: doc[0].title});

	})

  }

 
});


router.get('/similars', function(req, res, next) {
  // model.Page.find(function(err, pages){

  // 	res.render('index', { docs: pages });

  var referrerUrl = req.headers.referer.replace("http://localhost:3000/wiki/","");

  console.log(referrerUrl)
  model.Page.find({sec_url: referrerUrl}, function(err, page){
  		// console.log(page)
  		// console.log(page[0].tags)

			model.Page.find({
			    // $elemMatch matches array subdocuments
			    // $in matches a set of possibilities
			    tags: {$elemMatch: {$in: page[0].tags}},
			    url_name: { $ne: referrerUrl }
			}).exec(function(err,morepages){
				// console.log(morepages)
				res.render('index', { docs: morepages });
			})


  })
 
});

router.get('/wiki/sec/:name', function(req, res) {

  console.log("you're in")

  var urlName = req.params.name;


  model.Page.find({sec_url: "sec/"+urlName}, function(err, page){
	  	var tit = page[0].title;
	  	var fin = tit.toUpperCase();
	  	var tags = page[0].tags;
	  	res.render( 'show', { title: fin , body: page[0].body, tags: page[0].tags} );

  })


});

router.get('/wiki/:name', function(req, res) {
  var urlName = req.params.name;
  model.Page.find({url_name: urlName}, function(err, page){
  	console.log(page.length)
  	var numArr = [];
  	for(var i = 1; i < page.length+1; i++ ){
  		numArr.push(i)
  	}

  	if(page.length === 1){
	  	var tit = page[0].title;
	  	var fin = tit.toUpperCase();
	  	var tags = page[0].tags;
	  	res.render( 'show', { title: fin , body: page[0].body, tags: page[0].tags} );
	}else{

		//page is an array, loop through the array on a new disambiguation page
		
		
    	// console.log(doc)

    	res.render( 'disambiguation', { pages: page} );

	}

  })

});

// router.get('/wiki/:tag', function(req, res) {
//   var tagName = req.params.tag;
//   model.Page.find({tag: urlName}, function(err, page){
//   	var tit = page[0].title;
//   	var fin = tit.toUpperCase();
//   	var tagsConcatted = page[0].tags.join(",")
//   	console.log(tagsConcatted)
//   	res.render( 'show', { title: fin , body: page[0].body, tags: tagsConcatted });
//   })

// });



module.exports = router;