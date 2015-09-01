var Mammal = function(name){
	this.name = name;
	this.offspring = [];
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
	this.color = color;
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


