var chai = require("chai")
var expect = chai.expect;
var spies = require('chai-spies');
chai.use(spies);

var Page = require('../models/index').Page


describe("page model", function(){
	describe("validations", function(){
		
		var page
		beforeEach(function(done) {
		    // runs before each test in this block
		    page = new Page();
		    done();
		});

		it("should err without a title", function(done){
			//on save
			page.validate(function(err){
				expect(err.errors).to.have.property('title');
				done();
			})
			
		})
		it("should err without a body", function(){
			page.validate(function(err){
				expect(err.errors).to.have.property('body');
				done();
			})
		})
		// xit("should err without a url_name", function(){})
		// xit("should err without a owner_id", function(){})
		// xit("should err without a date", function(){})
		// xit("should err without a status", function(){})
		// xit("should err without tags", function(){})
		
		afterEach(function() {
		  // runs after each test in this block
		});
	})
	
	describe("statics", function(){
		describe("findByTag", function(){
			xit("should find pages of a specified tag", function(){

			})
			xit("does not find pages without a specified tag", function(){

			})
		})
	})

	describe("methods", function(){
		describe("computeUrlName", function(){
			xit("should create url_name property", function(){

			})
			xit("replaces non-alphanumeric and whitespace with a '_' ", function(){

			})
		})
		describe("getSimilar", function(){
			xit("finds pages with any same tags", function(){

			})
			xit("never gets itself", function(){

			})
			xit("never gets pages without same tags", function(){

			})
		})
	})

	describe("virtuals", function(){
		xit("returns the url_name prepended by '/wiki/' ", function(){})
	})

	describe("hooks", function(){
		describe("save pre hook", function(){	
			xit("should invoke computeUrlName", function(){

			})
		})
	})

})