function setPropertiesOnObjLiteral (object){
	object.x = 7;
	object.y = 8;
	object.onePlus = function(number){
		return (number + 1);
	}
}

function setPropertiesOnArrayObj (arrayObject){
	arrayObject.hello = function(){
		return "Hello!"
	};
	arrayObject.full = "stack";
	arrayObject[0] = 5;
	arrayObject.twoTimes = function(number){
		return number*2;
	};
}

function setPropertiesOnFunctionObj(functionObject){
	functionObject.year = 2015;
	functionObject.divideByTwo = function (number){
		return (number/2);
	}
	functionObject.prototype.helloWorld = function(){
		return "Hello World";
	}
}

