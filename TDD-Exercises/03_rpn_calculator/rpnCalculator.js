		var RPNCalculator = function(){
			this.stack = [];
			var array = this.stack;
			this.lastVal = 0;
		};

		RPNCalculator.prototype.operation = function(operation){
			if(this.stack.length === 0){
				throw "rpnCalculator is empty";
			}else{
				var last = this.stack.pop(); 
				var middle = this.stack.pop(); 
				if(operation == "plus"){
	    			var sum = middle+last;
				}else if(operation == "minus"){
				    var sum = middle - last;
				}else if(operation == "times"){
				    var sum = middle*last;
				}else if(operation == "divide"){
				    var sum = middle/last;
				}else{
				    return "specify operation";
				}
				this.stack.push(sum);
				this.lastVal = sum;
				return RPNCalculator.prototype.value();
			}
		};

		RPNCalculator.prototype.push = function(num){
			this.stack.push(num);	
		};

		RPNCalculator.prototype.value = function(){
			return this.lastVal;
		};

		RPNCalculator.prototype.plus = function(){
			this.operation("plus");
		};

		RPNCalculator.prototype.minus = function(){
			this.operation("minus");
		};

		RPNCalculator.prototype.divide = function(){
            this.operation("divide");
		};

		RPNCalculator.prototype.times = function(){
            this.operation("times");
		};