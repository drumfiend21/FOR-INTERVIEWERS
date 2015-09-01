var factorial = function(n){
	if(n === 0){
		return 1;
	}
	return n * factorial(n-1);
}

var factorialIterative = function(n){
	var current = 1;
	for(var i = n; i>0; i--){
		current = current * i; 
	}
	return current;
}

var fib = function(n){

	if(n === 0 || n === 1 ){
		return 1;
	}
	return fib(n-1) + fib(n-2);
}

//call object's tostring method because it behaves desirably
//and apply to a new function
//using .call(this)

var type = function(vb){
	var ob = /\[object |\]/g;
	return Object.prototype.toString.call(vb).replace(ob, "");
	
}

var factorial = function(n){
	if(n === 0){
		return 1;
	}
	return n * factorial(n-1);
}

var factorialIterative = function(n){
	var current = 1;
	for(var i = n; i>0; i--){
		current = current * i; 
	}
	return current;
}

var fib = function(n){

	if(n === 0 || n === 1 ){
		return 1;
	}
	return fib(n-1) + fib(n-2);
}

//call object's tostring method because it behaves desirably
//and apply to a new function
//using .call(this)

var type = function(vb){
	var ob = /\[object |\]/g;
	return Object.prototype.toString.call(vb).replace(ob, "");
	
}

var stringify = function(input){
	var output = '';
	var mu = type(input);
	if (mu === "Object"){
        output+="{"
      	Object.keys(input).forEach(function (key) {
	        output+="\""+key+"\""+": "
			output+=stringify(input[key]);			
			if(Object.keys(input)[Object.keys(input).length-1]!==key){
				    output+=","
			}
      	});
      	output+="}"
	}
	if(mu === "Array"){
		
		output+="["
		for (var i = 0; i < input.length; i++){
			output+=stringify(input[i])
			if(i !== input.length-1){
				output+=","	
			}
		}
		output+="]"

	}
	if(mu==="Null"){
		output+=null

	}
	if(mu === "Undefined"){
		output+=undefined
	}
	if(mu==="Boolean"){
		output+=String(input);
	}
	if(mu==="Number"){
		output+=String(input);
	}
	
	if(mu === "Function"){
		output+=String(input);
	}

	if(mu === "String"){
		output+= "\""+input.toString()+"\"";
	}

	
	return output

}