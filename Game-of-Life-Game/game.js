var gameOfLife = {
  width: 12,
  height: 12,
  stepInterval: null,
  count: 1,

  createAndShowBoard: function () {
    // create <table> element
    var goltable = document.createElement("tbody");
    
    // build Table HTML
    var tablehtml = '';
    for (var h=0; h<this.height; h++) {
      tablehtml += "<tr id='row+" + h + "'>";
      for (var w=0; w<this.width; w++) {
        tablehtml += "<td data-status='dead' id='" + w + "-" + h + "'></td>";
      }
      tablehtml += "</tr>";
    }
    goltable.innerHTML = tablehtml;
    
    // add table to the #board element
    var board = document.getElementById('board');
    board.appendChild(goltable);
    
    // once html elements are added to the page, attach events to them
    this.setupBoardEvents();
  },

  forEachCell: function (iteratorFunc) {
    /* 
      Write forEachCell here. You will have to visit
      each cell on the board, call the "iteratorFunc" function,
      and pass into func, the cell and the cell's x & y
      coordinates. For example: iteratorFunc(cell, x, y)
    */
  },
  
  setupBoardEvents: function() {
    // each board cell has an CSS id in the format of: "x-y" 
    // where x is the x-coordinate and y the y-coordinate
    // use this fact to loop through all the ids and assign
    // them "on-click" events that allow a user to click on 
    // cells to setup the initial state of the game
    // before clicking "Step" or "Auto-Play"
    
    // clicking on a cell should toggle the cell between "alive" & "dead"
    // for ex: an "alive" cell be colored "blue", a dead cell could stay white
    
    // EXAMPLE FOR ONE CELL
    // Here is how we would catch a click event on just the 0-0 cell
    // You need to add the click event on EVERY cell on the board
    
    var onCellClick = function (e) {
      // QUESTION TO ASK YOURSELF: What is "this" equal to here?
      
      // how to set the style of the cell when it's clicked
      if (this.getAttribute('data-status') == 'dead') {
        this.className = "alive";
        this.setAttribute('data-status', 'alive');
      } else {
        this.className = "dead";
        this.setAttribute('data-status', 'dead');
      }
    };
    
    // cells = document.getElementsByTagName('td');
    var x = document.getElementById("board")
    cells = x.getElementsByTagName("td")
    for(var i=0 ; i < cells.length; i++ ){
      cells[i].onclick = onCellClick;
    };
  },

  step: function () {
    // Here is where you want to loop through all the cells
    // on the board and determine, based on it's neighbors,
    // whether the cell should be dead or alive in the next
    // evolution of the game. 
    //
    // You need to:
    // 1. Count alive neighbors for all cells
    // 2. Set the next state of all cells based on their alive neighbors
    //    w-1, h-1   w, h-1    w+1, h-1
    //    w-1,h       w,h      w+1, h
    //    w-1, h+1   w, h+1    w+1, h+1
    //
    //   var w = this.width
    //
    //    i-w-1  i-w  i-w+1
    //    i-1     i   i+1
    //    i+w-1  i+w  i+w+1
    //
    //
    //try and grab boxes.  If they are undefined, don't do anyrthing
    //
    //Any live cell with two or three live neighbors lives on to the next generation.
    //
    //Any live cell with fewer than two live neighbors dies, as if caused by under-population.
    //
    //Any live cell with more than three live neighbors dies, as if by overcrowding.
    //
    //Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.

    // left searches, if cell[i] does not have previous sibling
    // top searches, if [i] < this.width
    // bottom searches, if this.width*this.height-this.width < i < this.width*this.height 
    // right searches, if cell[i] does not have next sibling 
    countArr = [];
    copyArray = []
    for (var i = 0; i < (gameOfLife.width*gameOfLife.height); i++) {
        copyArray.push(cells[i]) 
    }

    // console.log(copyArray);

    for(var i=0 ; i < copyArray.length; i++ ){
      lifeCount = 0;
      // console.log(copyArray[i]);

      if(copyArray[i].previousSibling === null && i < gameOfLife.width) {
        if(copyArray[i+1].getAttribute("data-status") === "alive"){
          lifeCount++
        }
        if(copyArray[i+gameOfLife.width].getAttribute("data-status") === "alive"){
          lifeCount++
        }
        if(copyArray[i+gameOfLife.width+1].getAttribute("data-status") === "alive"){
          lifeCount++
        }
      }

      else if(copyArray[i].previousSibling && i < gameOfLife.width && copyArray[i].nextSibling){
         if(copyArray[i-1].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i+1].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i+gameOfLife.width-1].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i+gameOfLife.width].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i+gameOfLife.width+1].getAttribute("data-status") === "alive"){
          lifeCount++
        }
      }

      else if(copyArray[i].previousSibling && i < gameOfLife.width && copyArray[i].nextSibling === null) {
        if(copyArray[i-1].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i+gameOfLife.width].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i+gameOfLife.width-1].getAttribute("data-status") === "alive"){
          lifeCount++
        }
      }

      else if(copyArray[i].previousSibling === null && i > gameOfLife.width-1 && i < (gameOfLife.width * gameOfLife.height - gameOfLife.width)) {
        if(copyArray[i-gameOfLife.width].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i-gameOfLife.width+1].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i+1].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i+gameOfLife.width].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i+gameOfLife.width+1].getAttribute("data-status") === "alive"){
          lifeCount++
        }
      }

      else if(copyArray[i].nextSibling === null && i > gameOfLife.width && i < (gameOfLife.width * gameOfLife.height - gameOfLife.width)) {
        if(copyArray[i-gameOfLife.width-1].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i-gameOfLife.width].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i-1].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i+gameOfLife.width-1].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i+gameOfLife.width].getAttribute("data-status") === "alive"){
          lifeCount++
        }
      }

      else if(copyArray[i].previousSibling === null && i >= (gameOfLife.width * gameOfLife.height - gameOfLife.width)) {
        if(copyArray[i-gameOfLife.width].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i-gameOfLife.width+1].getAttribute("data-status") === "alive"){
          lifeCount++
        } 

        if(copyArray[i+1].getAttribute("data-status") === "alive"){
          lifeCount++
        }
      }

      else if(copyArray[i].previousSibling && i > (gameOfLife.width * gameOfLife.height - gameOfLife.width) && copyArray[i].nextSibling) {
        if(copyArray[i-gameOfLife.width-1].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i-gameOfLife.width].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i-gameOfLife.width+1].getAttribute("data-status") === "alive"){
          lifeCount++
        } 

        if(copyArray[i-1].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i+1].getAttribute("data-status") === "alive"){
          lifeCount++
        }
      }

      else if(i === (gameOfLife.width * gameOfLife.height-1)) {
        if(copyArray[i-gameOfLife.width-1].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i-gameOfLife.width].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i-1].getAttribute("data-status") === "alive"){
          lifeCount++
        }
      }
      else {

        // console.log(copyArray[i]);

        if(copyArray[i-gameOfLife.width-1].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i-gameOfLife.width].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i-gameOfLife.width+1].getAttribute("data-status") === "alive"){
          lifeCount++
        } 

        if(copyArray[i-1].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i+1].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i+gameOfLife.width-1].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i+gameOfLife.width].getAttribute("data-status") === "alive"){
          lifeCount++
        }

        if(copyArray[i+gameOfLife.width+1].getAttribute("data-status") === "alive"){
          lifeCount++
        }
      }

      countArr.push(lifeCount);      
    };

          // copyArray[i].lifeCount = lifeCount;

      for(var i = 0; i < countArr.length ; i++){

      // if (copyArray[i].getAttribute("data-status") === "alive") {
      //   if (lifeCount < 2) {
      //     cells[i].className = "dead";
      //     cells[i].setAttribute("data-status", "dead");
      //   }
      //   else if (lifeCount > 3) {
      //     cells[i].className = "dead";
      //     cells[i].setAttribute("data-status", "dead");
      //   }
      // } else {
      //   if (lifeCount === 3) {
      //     cells[i].className = "alive";
      //     cells[i].setAttribute("data-status", "alive");
      //   }
      // }
      if (cells[i].getAttribute("data-status") === "alive") {
        if (countArr[i] < 2) {
          cells[i].className = "dead";
          cells[i].setAttribute("data-status", "dead");
        }
        else if (countArr[i] > 3) {
          cells[i].className = "dead";
          cells[i].setAttribute("data-status", "dead");
        }
      } else {
        if (countArr[i] === 3) {
          cells[i].className = "alive";
          cells[i].setAttribute("data-status", "alive");
        }
      }
    }
      // if(countArr[i] > 3){
      //   cells[i].className = "dead";
      //   cells[i].setAttribute("data-status", "dead");
      // }



      
  


    
  },

  enableAutoPlay: function () {
    // Start Auto-Play by running the 'step' function
   // automatically repeatedly every fixed time interval
   

   if(gameOfLife.stepInterval === null){
     gameOfLife.stepInterval = setInterval(gameOfLife.step, 500);
     console.log(gameOfLife.stepInterval)
    
   }else{
     clearInterval(gameOfLife.count);
     console.log(gameOfLife.count)
     gameOfLife.stepInterval = null;
     gameOfLife.count++;
 


   }
    
  }
};

var clear = function (){
  for(var i=0 ; i < cells.length; i++ ){
    cells[i].className = "dead";
    cells[i].setAttribute('data-status', 'dead');
  };
}
var clearButton = document.getElementById("clear_btn");
clearButton.onclick = clear;

//create random func
//when button clicks
//run for loop over td elements
//math random # between 0-1
//if # <=.5 set params to alive
//else set to dead

var resetRandom = function(){
  for(var i=0 ; i < cells.length; i++ ){
    var num = Math.random();
    if(num < .5){
      cells[i].className = "alive";
      cells[i].setAttribute('data-status', 'alive');

    }else{
      cells[i].className = "dead";
      cells[i].setAttribute('data-status', 'dead');
    }
  };
}

var resetButton = document.getElementById("reset_btn");
resetButton.onclick = resetRandom;

var stepButton = document.getElementById("step_btn");
stepButton.onclick = gameOfLife.step;


var autoButton = document.getElementById("play_btn");
autoButton.onclick = gameOfLife.enableAutoPlay;






  gameOfLife.createAndShowBoard();