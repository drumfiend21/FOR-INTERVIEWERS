var traverseDomAndCollectElements = function(matchFunc, startEl) {
  var resultSet = [];
  
  if (typeof startEl === "undefined") {
    startEl = document.body;
  }

  // your code here
  // traverse the DOM tree and collect matching elements in resultSet
  // use matchFunc to identify matching elements

  //loop through the DOM and for each element, run matchFunc on that element
  element = startEl;
  // count= 0;
  undNum = 0;

//Tips
//use the length 
//

// count = false

  var domTravFunc = function(z){
    // if(element.length=== count){
    //   return
    // }
    // if(undNum>1){
    //   return
    // }
    

    if(matchFunc(z)){
      resultSet.push(z);
    }

    // if(count){
      for(var i = 0; i < z.children.length ; i++){
        console.log(z.children[i]);
        domTravFunc(z.children[i])
      }
    // }

    // count= true;

    // element = element.children
    // domTravFunc()

    // if(Object.prototype.toString.call(z)=== "[object HTMLCollection]"){
    //   element = z.child
    //   return domTravFunc(element);
    // }
    
    // if(z.hasChildNodes()){
    //   element = z.children
    //   return domTravFunc(element);
    // }

    // if(z === "undefined"){
    //   undNum++;
    //   element = z.nextSibling;
    //   return;
    // }

    // element = z.nextSibling

    // // element = startEl.childNodes
    // // count++;
    // return domTravFunc(element);
  }
  domTravFunc(element);

  //   var domTravFunc = function(z){
  //   if(z === undefined){
  //     return
  //   }
  //   if(matchFunc(z)){
  //     resultSet.push(z);
  //   }

  //   if(z.hasChildNodes()){
  //     element = z.children
  //     return domTravFunc(z.children)
  //   }
    
  //   return domTravFunc(element, index++);
  // }
  // domTravFunc(element);

return resultSet;


};


// detect and return the type of selector
// return one of these types: id, class, tag.class, tag
//
var selectorTypeMatcher = function(selector) {
  if (selector.indexOf('#') === 0)
       return 'id';
   else if (selector.indexOf('.') === 0 )
       return 'class';
   else if (selector.indexOf('.') > 0)
       return 'tag.class';
   return 'tag';
};


// NOTE ABOUT THE MATCH FUNCTION
// remember, the returned matchFunction takes an *element* as a
// parameter and returns true/false depending on if that element
// matches the selector.

var matchFunctionMaker = function(selector) {
  var selectorType = selectorTypeMatcher(selector);
  var matchFunction;
  if (selectorType === "id") {
    // define matchFunction for id
    matchFunction = function (el) {
      return el.id && (el.id.toLowerCase() === selector.slice(1).toLowerCase());
    }; 

  } else if (selectorType === "class") {
    // define matchFunction for class
    matchFunction = function (el) {
      var sm = el.className.split(" ")  
      return sm.filter(function(val){
        return val ===selector.slice(1);  
      })[0]===selector.slice(1);
      // return el.className && (el.className.toLowerCase() === selector.toLowerCase());
    }; 

    
  } else if (selectorType === "tag.class") {
    // define matchFunction for tag.class
      matchFunction = function (el) {
       var sm = el.className.split(" ");
       console.log(sm[0]);
       return el.className && ((el.tagName.toLowerCase()+"."+sm.filter(function(val){
           return val === selector.slice(selectorType.indexOf('.'));
       })[0] === selector.toLowerCase()) || (el.tagName.toLowerCase()+"."+el.className.toLowerCase() === selector.toLowerCase()));
     };

  } else if (selectorType === "tag") {
    // define matchFunction for tag
    matchFunction = function (el) {
      return el.tagName && (el.tagName.toLowerCase() === selector.toLowerCase());
    };    
  }
  return matchFunction;
};

var $ = function(selector) {
  var elements;
  var selectorMatchFunc = matchFunctionMaker(selector);
  elements = traverseDomAndCollectElements(selectorMatchFunc);
  return elements;
};
