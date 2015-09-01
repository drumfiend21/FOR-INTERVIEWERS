// 06_Functional 
var doubler = function(element){
	return element*2;
}

var map = function(array , iterativeFunction){
	var iteratedArray = [];
	for(var i = 0 ; i < array.length ; i++){
		iteratedArray.push(iterativeFunction(array[i]));
	}
	return iteratedArray;
}

var filter = function(array, iterativeFunction){
	var iteratedArray = [];
	for(var i = 0 ; i < array.length ; i++){
		if(iterativeFunction(array[i])===true){
			iteratedArray.push(array[i]);
		}
	}
	return iteratedArray;
}

var contains = function(collection, match){
    var count = 0;
    for(var i in collection){
		if(collection[i] === match){
			count++;
			return true;
		}
	}
	if(count === 0){
		return false;
	}
}

var countWords = function(sentence){
	return sentence.split(" ").length;
}

var reduce = function(array, start, iterativeFunction){
	var combined = 0;
	for(var i = start ; i < array.length ; i++){
		combined = iterativeFunction(combined,array[i]);
	}
	return combined;
}

var countWordsInReduce = function(combined, sentence){
	return combined + sentence.split(" ").length;
}

var sum = function(array){
	return reduce(array, 0, function(a,b){return a+b;});
}

var every = function(array, iterativeFunction){
	var boo = 0;
	for(var i=0; i<array.length; i++){
		boo = boo + iterativeFunction(array[i]);
	}
	if(boo === 0 || boo === array.length){
		return true;
	}else{
		return false;
	}
}

var any = function(array, iterativeFunction){
	var boo = 0;
	for(var i=0; i<array.length; i++){
		boo = boo + iterativeFunction(array[i]);
	}
	if(boo === 0 || boo === array.length){
		return false;
	}else{
		return true;
	}	
}