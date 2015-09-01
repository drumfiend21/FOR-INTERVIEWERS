var Queue = function() {

    var length= 0;
    var qArray = []; 
    this.enqueue = function(arg){
        qArray[qArray.length] = arg;
        length+=1;
    }
    this.dequeue = function(){
        if(length===0){
            return undefined;
        }
        length -=1;
        var dArray = [];
        var zero;
        var storeZero = function(){
            zero = qArray[0];
        }
        storeZero();
        var inFunc = function(){
            for (var i = 1; i < qArray.length; i++) {
               dArray[i-1] = qArray[i]; 
            }
        }
        inFunc();
        qArray = dArray;
//         console.log(dArray)
//         console.log(qArray)
        return zero;
        // qArray = dArray;
        


        //return qArray.splice(0,1);
    }
    this.size = function(){
        return length;
    }

}