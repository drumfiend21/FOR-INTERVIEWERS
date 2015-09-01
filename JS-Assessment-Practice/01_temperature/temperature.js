var f2c = function(fahrTemp){
	return (fahrTemp-32) * 5/9;
};
var c2f = function(celTemp){
	return (celTemp *9/5) + 32;
};
function Temperature (f){
	// this.f = f;
	var fahr = f;
	var celc = f2c(f);

	this.fahrenheit = function(){
		return fahr;
	}
	this.celcius = function(){
	    return celc;
	}
	this.setF = function(t){
		if(typeof t !== "number"){
			throw new Error("you have to use a number");
		}
		fahr = t;
		celc = f2c(t);
	
	}
	this.setC = function(c){
		if(typeof c !== "number"){
			throw new Error("you have to use a number");
		}
		celc = c;
		fahr = c2f(c);
	
	}
}
Temperature.prototype.setFahrenheit = function(f){
	this.setF(f);
}
Temperature.prototype.setCelcius = function(c){
	this.setC(c);
}
Temperature.prototype.celcius = function(){
	var f = this.fahrenheit();
	return f2c(f);
}

