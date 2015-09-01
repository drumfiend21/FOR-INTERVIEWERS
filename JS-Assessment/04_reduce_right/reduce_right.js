var reduceRight = function(arr, start, combine){
	var prev = start;
	for(var i = arr.length-1; i > -1; i--){
	    prev= combine(prev,arr[i]);
	}
	return prev;	
}

var reduceRightRecursive= function(arr, start, combine){
	// var prev = start;
	// if(arr===[]){
	// 	return prev;
	// }
	// var p = arr.pop();
	// prev = combine(prev, p);
	// reduceRightRecursive();
	// var str = arr.join("");
	// value = 0
	// line = "";
	// if(value === arr.length-1){
	// 	return line; 
	// }
	// value+=1
	// return reduceRightRecursive(value)

	// if()
	var func = function(x, prev){
		var cat = prev;



		if(arr.length === x){
			console.log(cat)
			return cat;
		}
		
		// console.log(cat , arr[x]);
		cat = combine(arr[x], cat);
		// console.log(cat)


		return func(x+1, cat);
	}
	func(0, start);

}

