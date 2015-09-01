describe("repeat", function(){
	var total;
	var adderFunc;

	beforeEach(function(){
		total = 0;
		adderFunc = function(){
			return total += 1;
		}		
	});			


	describe("repeat function recursively", function(){
		it("returns the proper value", function(){
			repeat(adderFunc, 5);
			expect(total).toEqual(5);	
		});

		it("calls itself n + 1 times", function(){
			var n = 5;
			spyOn(window, "repeat").and.callThrough();
			repeat(adderFunc, 5);		
			expect(repeat.calls.count()).toEqual(n+1);
		});
	});

	describe("repeat function iterative", function(){
		it("returns the proper value", function(){
			repeatIterative(adderFunc, 10);
			expect(total).toEqual(10);
		});
		
		it("nevers calls itself", function(){
			spyOn(window, "repeatIterative").and.callThrough();
			repeatIterative(7);
			expect(repeatIterative.calls.count()).toEqual(1);
		});
	});	
	
	

});




