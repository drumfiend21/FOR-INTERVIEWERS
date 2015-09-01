
var createFunctions = function(n){
    var arr = [];
    // var myFunc = function(){
    for(var i = 0 ; i < n ; i++){
        var obj = function(x){
            return function(){
               return x;
            }
        }(i);
        arr.push(obj);
    }
    // }
    // myFunc();
    return arr;
}