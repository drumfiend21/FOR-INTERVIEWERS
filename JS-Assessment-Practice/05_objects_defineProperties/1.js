var Mammal = function(name){
	
	Object.defineProperties(this, {
	  "name": {
	    value: name,
	    writable: true
	  },
	  "offspring": {
	    value: [],
	    writable: true
	  }

	});

};

Mammal.prototype.sayHello = function(){
	return "My name is "+this.name+", I'm a Mammal";
}; 

Mammal.prototype.haveBaby = function(){
	var obj = {};
	obj.name = "Baby "+this.name;
	this.offspring.push(obj);
	return obj;
};

var Cat = function(name, color){
	Mammal.call(this, name);
	var color;
	Object.defineProperty(this, 'color', {
	  // get: function() { return color; },
	  // set: function(newValue) { color = newValue; },
	  // enumerable: true,
	  // configurable: true
	  value: color, writable: true
	});

	this.haveBaby = function(color){
		var obj = new Cat();
		obj.color = color;
		obj.name = "Baby "+this.name;
		this.offspring.push(obj);
		return obj;
	}
};

Cat.prototype = Object.create(Mammal.prototype);
Cat.prototype.constructor = Cat;
	

