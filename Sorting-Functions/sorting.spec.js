describe('Bubble Sort', function(){
    it('handles an empty array', function(){
        expect( bubbleSort([]) ).toEqual( [] );
    });
});

describe('Bubble Sort', function(){
    it('handles a single item', function(){
        expect( bubbleSort([1]) ).toEqual( [1] );
    });
});



describe('Bubble Sort', function(){
    it('handles an array with multiple unsorted elements', function(){
        expect( bubbleSort([4,2,3,1]) ).toEqual( [1,2,3,4] );
    });
});

describe('Bubble Sort', function(){
    it('handles an array with multiple unsorted elements', function(){
        expect( bubbleSort([4,2,9,3,1]) ).toEqual( [1,2,3,4,9] );
    });
});

describe('Bubble Sort', function(){
    it('handles an array with multiple unsorted elements', function(){
        expect( bubbleSort([1,16,10,17,15,2,14,18,9,13,19,11,20,3,12,8,4,7,5,6]) ).toEqual( [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] );
    });
});

describe('Merge', function(){
    it('is able to merge two sorted arrays', function(){
        expect(merge([1,3,5], [2,4,6]) ).toEqual([1,2,3,4,5,6])
    });
});

describe('Merge', function(){
    it('is able to merge two sorted arrays', function(){
        expect(merge([1,7,9], [3,5]) ).toEqual([1,3,5,7,9])
    });
});

describe('Split Array function', function() {
  it('is able to split an array into two halves', function() {
        expect(split([1,2,3,4,5,6]) ).toEqual([ [1,2,3],[4,5,6] ])
  });
});

describe('Split Array function', function() {
  it('is able to split an array into two halves', function() {
        expect(split([1,2,3,4,5,6,7]) ).toEqual([ [1,2,3,4],[5,6,7] ])
  });
});

describe('Merge Sort', function(){
    it('is able to sort an array', function(){
        expect(mergeSort( [1,7,9,5,3,2,8,4,6] )).toEqual([1,2,3,4,5,6,7,8,9])
    });
});

describe('Merge Sort', function(){
    it('is able to sort an array', function(){
        expect(mergeSort( [1,7,9,5,3,2,8,4,6,10] )).toEqual([1,2,3,4,5,6,7,8,9,10])
    });
});

describe('Merge Sort', function(){
    it('is able to sort an array', function(){
        expect(mergeSort( [1,19,11,18,7,9,20,12,14,17,5,3,2,15,13,8,4,16,6,10] )).toEqual([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20])
    });
});