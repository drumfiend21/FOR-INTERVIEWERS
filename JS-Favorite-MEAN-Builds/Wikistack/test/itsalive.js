var chai = require("chai")
var expect = chai.expect;
var spies = require('chai-spies');
chai.use(spies);

describe("simple math", function(){
	it("confirms basic arithmetic", function(){
		expect(2+2).to.equal(4)
	})
})


describe("setTimeout", function(){
	it("should take about 1000 ms", function(done){
		this.timeout(1200);
		setTimeout(done,1000)
	})

})

describe("forEach", function(){
	it("should be called for every item in the array", function(){
		var arr = [1,2,3,4,5,6,7,8,9,10];
		var func = function(el){return el};
		var spy = chai.spy(func);
		arr.forEach(spy);
		expect(spy).to.have.been.called.exactly(10)
	})
})