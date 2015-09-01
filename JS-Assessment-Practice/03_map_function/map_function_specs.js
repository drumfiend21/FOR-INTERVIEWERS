describe("map function", function(){
	var array;
	
	beforeEach(function(){
		array = Array.prototype;
	});

	describe("tripleAllIterative", function(){

		
		it("returns an array", function(){
			expect(tripleAllIterative([])).toEqual([]);
		});

		it("returns an array with integers", function(){
			expect(tripleAllIterative([1,4,5])).toEqual([3,12,15]);
		});

		it("does not use Array.prototype.map", function(){
			spyOn(array, "map");
			
			tripleAllIterative([1,2,3]);
			expect(array.map.calls.count()).toEqual(0);
		});
	});


	describe("tripleAll using Array.prototype.map", function(){

		it("returns an array", function(){
			expect(tripleAll([])).toEqual([]);
		});

		it("returns an array with integers", function(){
			expect(tripleAll([5,6,7])).toEqual([15,18,21]);
		});

		it("Uses Array.prototype.map and does not use a for/while loop", function(){
			spyOn(array, "map");
			// console.log(window.Array.prototype.map);
			tripleAll([1,2,3]);
			expect(array.map.calls.count()).toEqual(1);
		});
	});

});