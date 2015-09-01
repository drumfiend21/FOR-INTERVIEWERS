// Functions.js

function concat_string(){
	var arr = Array.prototype.slice.call(arguments);
	var line = "";
	for(var i = 0; i < arr.length ; i++){
		line += arr[i];
	}
	return line;
};

function yourFunctionRunner(){
	var arr = Array.prototype.slice.call(arguments);
	var line = "";
	for(var i = 0; i < arr.length ; i++){
		line += arr[i]();
	}
	return line;
};

function makeAdder(A){
	function Func(num2){	
		var line = num2+A
		return line;
	}
	return Func;
}

var once =  function(func){
	var count = 0;
	var dec = function(){
		if(count===0){
			count++;
			func();
		}
	}
	return dec;
}

function createObjectWithTwoClosures(){
	var number = 0;
	var Obj = {};
	Obj.oneIncrementer = function(){
			number+=1;
	};
	Obj.tensIncrementer = function(){
			number+=10;
	};
	Obj.getValue = function(){
		    return number;
	};
	return Obj;
}
	