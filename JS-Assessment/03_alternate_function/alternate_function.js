var alternate = function(func){
	count=0
	var obj = function(){
		if(count%2===0){
			count++;
			return func();
		}else{
			count++;
			return;
		}
	}
	return obj;
}