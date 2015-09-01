var vowelsCount = function(str){
	
	var vow = ["a","e","i","o","u"];
	var lineArr = str.toLowerCase().split("");
	var cat = [];

	lineArr.forEach(function(li){
		for(var i = 0; i < lineArr.length ; i++){
			if(li === vow[i]){
				cat.push(li);
			}
		}
	});
	return cat.length;
}