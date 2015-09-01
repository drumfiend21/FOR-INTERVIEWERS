describe("Mammal class", function() {
  beforeEach(function() {
    spyOn(Object, "defineProperties").and.callThrough();
    myMammal = new Mammal("Joe");
  });

  it("should take name in its constructor", function() {
    expect(myMammal.name).toEqual("Joe");    
  });

  it("should have an array called offspring", function() { 
    expect(myMammal.offspring).toEqual([]);    
  });

  it("should have used Object.defineProperties to add name and offspring", function(){
    expect(Object.defineProperties).toHaveBeenCalled();
  })

  it("should have a sayHello function", function() {
    expect(myMammal.sayHello()).toEqual("My name is Joe, I'm a Mammal");
  });

  it("should have a haveBaby function", function() {
    child = myMammal.haveBaby()
    expect(child.name).toEqual("Baby Joe");
    expect(myMammal.offspring).toEqual([child]);
  });

});



describe("Cat class", function() {
  
  beforeEach(function() {
    spyOn(Mammal, 'call').and.callThrough();
    spyOn(Object, "defineProperty").and.callThrough();
    cat = new Cat("Stewart", "Tabby"); 
  });

  // TEST FOR Mammal.call() in Cat, spy in beforeEach
  it("calls the Mammal Constructor", function(){
    expect(Mammal.call).toHaveBeenCalled();
  });

  it("should have a name, color in its constructor", function() {
    expect(cat.name).toEqual("Stewart");
    expect(cat.color).toEqual("Tabby");
  });

  it("should have an array called offspring from the Mammal constructor", function() {
    expect(cat.offspring).toEqual([]);
  });

  it("should inherit all methods from Mammal", function() {
    expect(typeof Cat.prototype.haveBaby).toEqual("function");
    expect(Cat.hasOwnProperty('toString')).toEqual(false);
  });

  it("should use Object.create inherits methods from Mammal", function(){
    expect(Cat.prototype.offspring).toEqual(undefined);
  })

  it("should have used Object.defineProperties to add color property", function(){
    expect(Object.defineProperty).toHaveBeenCalled();
  })
  it("should have it's own haveBaby method that takes only a color", function() {
    green_cat = cat.haveBaby("green");
    expect(cat.offspring).toEqual([green_cat]);
    expect(green_cat.name).toEqual("Baby Stewart");
    expect(green_cat.color).toEqual("green");

  });

  it("the cat haveBaby is actually a Cat and not a Mammal", function(){
    blue_cat = cat.haveBaby("blue");
    expect(blue_cat instanceof Cat).toEqual(true);
  });

});