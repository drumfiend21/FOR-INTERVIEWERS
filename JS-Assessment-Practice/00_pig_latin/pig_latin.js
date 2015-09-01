// looper should take a string as an argument, a match variable, and a function)
var vow = ["a","e","i","o","u","y"];
var cons = ["b","c","d","f","g","h","j","k","l","m","n","p","q","r","s","t","v","w","x","z"];


var translate = function(string){

	var splits = string.split(" ");

	var multiwordArr = []

	splits.forEach(function(word){
	    var arr = [];

		for(var j = 0; j<vow.length; j++){
			if(word[0]===vow[j]){
				multiwordArr.push(word+"ay");
				return multiwordArr;
			}	
		}

		if(word.slice(0,3) === "sch"){
			multiwordArr.push(word.slice(3)+"schay")
			return multiwordArr;
		}

		if(word.slice(0,2) === "qu"){
			multiwordArr.push(word.slice(2)+"quay")
			return multiwordArr;
		}

		if(word.slice(0,2) === "th"){
			multiwordArr.push(word.slice(2)+"thay")
			return multiwordArr;
		}

		var tp = word.split("");
		cons.forEach(function(i){
			for(var p =0; p<4; p++){
				if(tp[0]===i){
					tp.push(tp.shift());

				}
				if(tp[0] === "q" && tp[1]==="u"){
					console.log("yes")
					tp.push(tp.shift());
					tp.push(tp.shift());
				}
			}
			
		});
		tp.push("a","y")
		var line = tp.join("")
 		multiwordArr.push(line);
	});
	return multiwordArr.join(" ");
}