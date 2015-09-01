function createCalculator(){
	
	var myObj = {};
	var value = 0;
	
	myObj.value = function(){
		return value;
	};
	myObj.add = function(number){
		value += number;
		return value;
	};
	myObj.subtract = function(number){
		value -= number;
		return value;
	};

	return myObj;
};