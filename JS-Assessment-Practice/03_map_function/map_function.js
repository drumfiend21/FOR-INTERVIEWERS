var tripleAll=function(arr){
	var newArr = arr.map(function(n){
		return n*3

	})
	return newArr;
}

var tripleAllIterative=function(arr){
	var newArr= [];
	arr.forEach(function(n){
		newArr.push(n*3)
	})

	return newArr;
}