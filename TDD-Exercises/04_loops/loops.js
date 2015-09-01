function repeat(iterated, numTimes){

	var line = "";
	for(var i = 1 ; i <= numTimes; i++){
		line += iterated;
	}
	return line;
}

function sum(array){

	var sum = 0;
	for(var i = 0; i < array.length; i++){
		sum+=array[i];
	}
	return sum;
}

function gridGenerator(num){
//Odd lines always starts with #
//Even line always starts with " "
//is always alternating between "#" and " "

	var grid = "";
	for (var i = 1; i <= num; i++){
			for(var j = 1; j <= num ; j++){
				if(i%2 !== 0 && j%2 === 0){
					grid += " ";
				}
				if(i%2 !== 0 && j%2 !== 0){
					grid += "#";
				}
			
				if(i%2 === 0 && j%2 === 0){
					grid += "#";
				}
				if(i%2 === 0 && j%2 !== 0){
					grid += " ";
				}
			}			
		grid += "\n";
	}
	return grid;
}

function largestTriplet(c){
	var tripArray = []; 
	for(var a = 1 ; a<c ; a++){
		for(var b = 2 ; b<c ; b++){
			if(((a*a)+(b*b)===(c*c)) && b>a){
				tripArray.push([a,b,c]);
			}else{
			    for(var k = c-1 ; k > 0 ; k--){
			         if(((a*a)+(b*b)===(k*k)) && b>a){
			            tripArray.push([a,b,k]); 
			         }  
			    }
			}
			
		}

	}
	
	var max = tripArray[0][1];
	for(var i = 0 ; i<tripArray.length; i++){
		if( (tripArray[i][1]) > max ){
			max = tripArray[i][1];
		}
	}

	for(var j=0 ; j<tripArray.length; j++){
	    if(max===tripArray[j][1]){
	        return tripArray[j];
	    }
	}
};

function join(array, delimit){
	var string = "";
	for (var i = 0; i <array.length ; i++){
		if(delimit == "/" && i !== array.length-1){
			string += (array[i]+"/");
		}else{
			string += array[i];
		}
	}
	return string;
};

function paramify(object){
    var array = [];
    for(var key in object){
        if(object.hasOwnProperty(key.toString())){
            array.push(key+"="+object[key]);
        }
    }
    var sortArray = array.sort();
    var string = "";
    for(var i=0; i < sortArray.length; i++){
        if(i === sortArray.length-1){
            string += sortArray[i];
        }else{
            string += sortArray[i]+"&";
        }
    }
    return string;
}

