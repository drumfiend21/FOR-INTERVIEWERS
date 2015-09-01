count = 0
var repeat = function(func,n){
	if(count<n){
		count+=1;
		func();
		repeat(func,n); 
	}
	count=0
	return 
}


var repeatIterative=function(func, n){
	for(var i = 0; i < n; i++){
		func();
	}
	return 
}