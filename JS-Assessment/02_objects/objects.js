var Vehicle = function (lic, color){
	this.licensePlate = lic;
	this.color = color;
}

Vehicle.prototype.beep = function(){
	return "BEEP, BEEP";
}

Vehicle.prototype.changeColor = function(color){
	this.color = color;	
}

var Truck = function (lic, color,trans){
	Vehicle.call(this, lic, color);
	this.transmission = trans;
}

Truck.prototype = Object.create(Vehicle.prototype);
Truck.prototype.constructor = Truck;