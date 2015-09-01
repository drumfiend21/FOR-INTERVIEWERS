describe("stringAddition", function() {

	it("should handle an empty String", function(){
		expect(stringAddition("")).toEqual(0);
	});

	it("should handle a String without Numbers", function(){
		expect(stringAddition("Hello")).toEqual(0);
	});

	it("should handle a String with Numbers", function(){
		expect(stringAddition("Hello5")).toEqual(5);
	});

	it("should handle a String with multiple Numbers", function(){
		expect(stringAddition("66He7llo5")).toEqual(78);
	});

	it("should handle a String with multiple words and Numbers", function(){
		expect(stringAddition("H3llo7, 5 W0rld22!")).toEqual(37);
	});

	it("should handle a String with all vowels", function(){
		expect(stringAddition("AeIoU")).toEqual(0);
	});
});