# Temperature

## Topics

- Closure & Encapsulation
- Constructor Functions
- new Keyword
- Constructor.prototype
- Object's Prototype


Create f2c and c2f functions.  After completion create a Temperature class that privately encapsulates values by creating getter and setter functions.  Here are a few resources to review to understand Getters And Setters:

- [JavaScript Getters and Setters - John Resig](http://ejohn.org/blog/javascript-getters-and-setters/);
- [JavaScript Getters and Setters - Jack Franklin](http://javascriptplayground.com/blog/2013/12/es5-getters-setters/);

Getters and Setters allow you to create shortcuts for accessing and manipulating an object.  You can also prevent users from accessing values you don't want them to access directly.

Here is an example:

```
var MyConstructor = function(state){
	var _myState = "I am from " + state + "!";

	this.getState = function(){
		return myState;
	}

	this.setState = function(newState){
		_myState = newState;
	}
}
```


