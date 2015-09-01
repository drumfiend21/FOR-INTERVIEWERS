describe("alternate", function() {
  var message;
  beforeEach(function(){
     message = "";
  })

  it("should return a function object", function(){
    var funcReturned = alternate(function(){
      message += "hey";
    });
    expect(typeof funcReturned === "function").toEqual(true)
  })

  it("should add 'hey' to message on alternate function calls", function() {
    var sayHeyOnAlternateCalls = alternate(function() {
      message += "hey";
    });
    sayHeyOnAlternateCalls();
    expect(message).toEqual("hey");
    sayHeyOnAlternateCalls();
    expect(message).toEqual("hey");
    sayHeyOnAlternateCalls();
    expect(message).toEqual("heyhey");
    sayHeyOnAlternateCalls();
    expect(message).toEqual("heyhey");
  });

});