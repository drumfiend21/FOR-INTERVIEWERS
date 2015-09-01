var Mammal = function(name){
	
	Object.defineProperties(this, {
	  "name": {value: name, writable: true},
	  "offspring": {value: [], writable: true}
	});
};

Mammal.prototype.sayHello = function(){
	return "My name is "+this.name+", I'm a Mammal";
}; 

Mammal.prototype.haveBaby = function(){
	var obj = new this.constructor("Baby "+this.name);
	this.offspring.push(obj);
	return obj;
};

var Cat = function(name, color){
	Mammal.call(this, name);
	var color;
	Object.defineProperty(this, "color" {
	  value: color
	});
};

Cat.prototype = Object.create(Mammal.prototype);
Cat.prototype.constructor = Cat;
	

