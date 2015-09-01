var createArgumentMap = function(func){
	var obj = {};
	for(var i =0; i < arguments.length; i++){
	    obj["a"+[i]] = arguments[i]
	}
	return obj;
}

var keyAdder = function(obj){
	var arr= [];
	if(typeof obj === "function"){
    	cra = new obj();
	}else{
		cra = obj
	}

	for(var key in cra){
		if(cra.hasOwnProperty(key)){
			arr.push(cra[key])
		}
	}
	var sum = 0;
	arr.forEach(function(num){
		if(typeof num === "number"){
    		sum = sum+num;
		}
	});
	return sum;	
}
