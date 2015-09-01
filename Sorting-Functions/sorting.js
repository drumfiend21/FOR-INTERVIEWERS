
var swapped

var bubbleSort = function(arr){
	var inSort = function(x){ 

		var left, right

		if(arr.length === 0){
			return arr
		}
		if(arr[x] > arr[x+1]){
			swapped = true;
				left = arr[x];
				right = arr[x+1];

			arr[x] = right;
			arr[x+1] = left;	
		}
		if(x === arr.length-1){	
			if(swapped){
				swapped = false;
				return inSort(0);
			}else{
				return arr;		
			}
		}
		var newNum = x+1
		return inSort(newNum)
	}
	return inSort(0);
}



var merge = function(arr1, arr2){
	var result = [];
	var pushTwo = function(){
		result.push(arr2[0]);
		nextArr1 = arr1
		nextArr2 = arr2.slice(1)
	}
	var pushOne = function(){
		result.push(arr1[0]);
		nextArr1 = arr1.slice(1)
		nextArr2 = arr2
	}
	if(arr1.length ===0 && arr2.length!== 0){
		pushTwo();
	}
	if(arr2.length===0 && arr1.length!== 0	){
		pushOne();
	}
	if(arr1[0]>arr2[0]){
		pushTwo();
	}
	if(arr1[0]<arr2[0]){
		pushOne();
	}
	if(arr1.length !==0 || arr2.length!==0){
		return result = result.concat(merge(nextArr1, nextArr2));
	}else{
		return result
	}
}

function split(wholeArray) {

    /* your code here to define the firstHalf and secondHalf arrays */
    //intake a whole array
    //new array  = oldarray slice at length/2

    var firstHalf = wholeArray;
    var secondHalf = firstHalf.splice(Math.round(firstHalf.length/2));

    return [firstHalf, secondHalf];
}



function mergeSort(array) {

    /* your code here */

    	if(array.length === 1){
    		return array;
    	}
    	var spl = split(array);
    	var left = spl[0];
    	var right = spl[1];
    	
		// console.log(left)
		// console.log(right)

    	var ska = mergeSort(left);
    	var be = mergeSort(right);

		return (merge(ska,be));

}

for(var i=12; i <= 17; i++) {
    var num_items = Math.pow(2,i);
    var native_test_array = [];
    var b_test_array = [];
    var m_test_array = []
    for(var j=0; j < num_items; j++) {
        var rand = Math.floor(Math.random() * num_items);
        native_test_array.push(rand);
        b_test_array.push(rand);
        m_test_array.push(rand);
    }

    console.time(num_items + " merge");
    mergeSort(m_test_array);
    console.timeEnd(num_items + " merge");  
}

