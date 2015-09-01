
var getMessages = function(arr){
	var newArr= arr.map(function(n){
		return n.message;
	});
	var newerArr = newArr.filter(function(i){
			if(i.length<50){
			return i
			}
	});
	return newerArr;


}