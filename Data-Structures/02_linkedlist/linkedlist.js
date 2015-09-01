var LinkedList = function(){
    this.head = undefined;
    this.headobj = undefined;
    this.tail = undefined;
    
    this.addToTail = function(arg){

        tode = new Node(arg);
        if(this.head===undefined && this.tail===undefined){
          this.head = tode;
          this.tail = tode;
        }else{
          this.tail.next = tode;
          tode.previous = this.tail
          this.tail = tode;
        }

    }
    this.removeTail = function() {

        if(this.head===undefined && this.tail===undefined){
          return 
        }
        var curr = this.tail;
        if(this.head===this.tail){
          this.tail = undefined;
          this.head = undefined
        }else{
          this.tail = curr.previous
          this.tail.next = null;
        }
        return curr.value;
    }

    this.removeHead = function(){

        var currHead = this.head
        if(this.head===undefined && this.tail===undefined){
          return undefined;
        }
        if(currHead.next !== null){
          currHead.next.previous = null;
          this.head = currHead.next
        }else{
          this.head = undefined;
          this.tail = undefined;
        }
        return currHead.value;


        
    }
    this.search = function(val){
      var curr = this.head;
      
      var _search = function(x){
        var currTwo;
        


        if(typeof val === "function"){
          if(val(x)===true){
            return x.value;
          }
        }

        if(x === null){
          return null;
        }

        if(val===x.value || val === x.value.name){
          return (x.value)
        }
        currTwo = x.next;
        
        return _search(currTwo);

      }
      return _search(curr);
        
    }

    this.addToHead = function(arg){

        tode = new Node(arg);
        if(this.head===undefined && this.tail===undefined){
          this.head = tode;
          this.tail = tode;
        }else{
          this.head.previous = tode;
          tode.next = this.head
          this.head = tode;
        }

    }



}

var Node = function(arg) {
    this.value = arg;
    this.next = null;
    this.previous = null;
}
