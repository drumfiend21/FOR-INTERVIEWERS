var mongoose = require("mongoose");
var should = require("should");
var Article = require("../models/article");
/**
 *
 * Start here!
 *
 * These tests describe the model that you'll be setting up in models/article.js
 *
 */

describe("Articles", function () {

    /**
     * Your model should have two fields (both required) of title and body
     *
     * Check out the 'required' validator: http://mongoosejs.com/docs/api.html#schematype_SchemaType-required
     *  
     */

    // NOTE: THE FOLLOWING TWO ASSERTIONS ARE DEPENDENCIES TO THE
    // article_route.test.js ASSERTIONS.
    it("should have a title and body field of String", function (done) {

        var article = new Article({
            title: "My Article",
            body: "Isn't this interesting?"
        });

        article.save(function (err) {
            article.title.should.equal("My Article");
            article.body.should.equal("Isn't this interesting?");
            done(err);
        });

    });

    it('should require a title and a body', function (done) {

        var article = new Article({
            title: "My Second Article"
        });

        article.save(function (err) {
            // console.log(err)
            err.message.should.equal("Validation failed");
            done();
        });

    });

    // NOTE: THE REMAINING ASSERTIONS DO *NOT* HAVE 
    // TO BE DONE BEFORE articles_route.test.js

    /**
     * Set up an instance method called asJSON that
     * will output the **JSON stringified** representation of the model.
     *
     * http://mongoosejs.com/docs/guide.html#methods
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
     */
    it('should have an instance method to get itself as JSON', function (done) {

        Article.findOne({ title: "My Article" }, function (err, article) {
            var jsonArticle = article.asJSON();
            jsonArticle.should.match(/"title":"My Article"/);
            done(err);
        });

    });


    /**
     * Set up a static method called findByTitle that's a convenience
     * method to find an article by its title.
     *
     * http://mongoosejs.com/docs/guide.html#statics
     */
    it("should have a static method to find ONE article with a specific title", function (done) {

        Article.findByTitle("My Article", function (err, article) {
            article.body.should.equal("Isn't this interesting?");
            done(err);
        });

    });


    /**
     * Your Article model should also have a tags field that's an array
     * but when we access it, we should get the string joined by a comma
     */
    it("should have a tags field of [] that has a custom getter", function (done) {

        var article = new Article({
            title: "Taggy",
            body: "So Taggy"
        });

        article.tags = ["tag1", "tag2", "tag3"];
        article.tags.should.equal("tag1,tag2,tag3");
        
        done();

    });

});
