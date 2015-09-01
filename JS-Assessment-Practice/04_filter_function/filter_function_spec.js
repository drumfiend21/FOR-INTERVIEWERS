describe("using Array.prototype.filter & Array.prototype.map", function(){
	var array;
	var messages;
	
	beforeEach(function(){
		array = Array.prototype;
		messages = 
			[{message: "Lorem ipsum dolor sit amet, aenean elit, in risus morbi urna sit, lorem lobortis purus convallis maecenas"},
			 {message: "Dictum urna, at sit rhoncus elit"},
			 {message: "Cras lectus vestibulum elementum tellus, nibh aliquet sit facilisis"},
			 {message: "Sed libero wisi, fermentum elit sed et."},
			 {message: "Etiam nulla porttitor, tincidunt velit varius, id quis pede, tellus mauris eu mi metus, adipiscing ratione velit. Dolor vitae vel egestas amet in magnis. Dictum vehicula purus tortor amet ante eget."}
			];
	});

	describe("getMessages", function(){

		it("returns all messages < 50 characters", function(){			
			var returnArray = [
				"Dictum urna, at sit rhoncus elit",
				"Sed libero wisi, fermentum elit sed et."
				];
			expect(getMessages(messages)).toEqual(returnArray);	
		});

		// How can you "method chain" and use map and filter together?
		it("calls Array.prototype.map", function(){
			spyOn(array, "map").and.callThrough();
			getMessages(messages);
			expect(array.map).toHaveBeenCalled();
		})

		it("calls Array.prototype.filter", function(){
			spyOn(array, "filter").and.callThrough()
			getMessages(messages);
			expect(array.filter).toHaveBeenCalled();
		})

	});

});