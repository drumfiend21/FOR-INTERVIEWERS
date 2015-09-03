var init = false;
var current = 0;
var progress = 0;
var answeredCorrectly = 0;
var countries = [
  "United States",
  "Angola",
  "Argentina",
  "Sierra Leone",
  "Dominican Republic"
];

var countryId = [
  "united-states",
  "angola",
  "argentina",
  "sierra-leone",
  "dominican-republic"
];

var answers = [
  [
    "Boston",
    "Washington D.C.",
    "Boone"
  ],
  [
    "Luanda",
    "Huambo",
    "Lobito"
  ],
  [
    "Rosario",
    "Cordoba",
    "Buenos Aires"
  ],
  [
    "Kenema",
    "Freetown",
    "Bo"
  ],
  [
    "La Romana",
    "Santiago",
    "Santo Domingo"
  ]
];

var correctAnswers = [1,0,2,1,2];

var animateCounter = function(){
    $("#badge").animate({
      top: "-=2%"
    }, 200);
  $("#badge").animate({
      top: "+=2%"
    }, 200);
}

var flipShip = function(bool){
  if(bool === false){
    $("#ship").addClass('flipped');
  }
  if(bool === true){
    $("#ship").removeClass('flipped');
  }
}

var setWelcome = function(){
  $('#country-welcome').text("Welcome to "+countries[current]+"!");    
}

var evaluateAnswer = function(){ 
  if($("input:checked").val() === answers[current][correctAnswers[current]]){ 
    animateCounter();
    answeredCorrectly++;
  }
  //update display
  $('#num-correct').text(answeredCorrectly); 
  if(init === true){
    setProgressBar(); 
  }
  init = true;
}
    
var setQuestion = function(){
  $('#question').text("What is the capital of "+countries[current]+"?");    
}
    
var setAnswers = function(){
  for(var i=0; i < 3; i++){
    $("#radio"+i).val(answers[current][i]);
    $("#ans"+i).text(answers[current][i]);
  }
}

var setProgressBar = function(){
  progress = progress + 20;
  $("#bar").css("width", progress+"%")
};

var changeCard = function(){
  setWelcome();
  setQuestion();
  setAnswers(); 
}

var scene = function(shipMove, landMove, order, bool){
    $("#card").delay(1000).fadeOut("slow", function(){
      //set card
      $(":radio").prop('checked', false);
      changeCard();
      //move ship
      flipShip(bool);
      $("#ship").show().animate({
        left: shipMove
      }, 5000)
      $("#"+countryId[current]).show();
      //move land
      $("#first-half").show().animate({
        left: landMove,
      }, 5000, function(){});
      $("#second-half").show().animate({
        left: landMove,
      }, 5000, function() {
        //remove old images
        $("#"+order+"-half").hide();
        $("#"+countryId[current-1]).hide();
        //fade in card
        $("#card").fadeIn();
      }); 
    });
}

var finishGame = function(){
  $("#card").fadeOut('slow', function(){
      $("#final-score").text(answeredCorrectly+"/5!");
      $("#finish").fadeIn();
      $("#start").hide();
      $("#title").fadeIn();
    });  
}

var changeScene = function(){
  if(current === 0 || current === 2){
    scene("+=45%", "-=50%", "first", true);
  }
  if(current ===1){
    scene("-=35%", "+=50%", "second", false);
  }
  if(current===3){
    scene("-=55%", "+=50%", "second", false);
  }
  if(current === 4){
    finishGame()  
  }
}

//Submit actions 
$('#submit').on('click', function(){
  if(current < 5 && $("input:checked" ).length > 0){
    evaluateAnswer();  
    changeScene();
    current = current+1;    
  }
})

//Initialize card
setWelcome();
setQuestion();
setAnswers();
evaluateAnswer();

//Initialize Scene
$('#start').on('click', function(){
  $("#title").fadeOut();
  $("#instructions").fadeIn();
  //move ship
  flipShip(false);
  $("#ship").show()
    .animate({
    left: "-=80%"
  }, 5000)
  //move land
  $("#first-half").show().animate({
      left: "+=50%",
    }, 5000, function() {
      $("#instructions").fadeOut();  
      $("#card").fadeIn(); 
  });  
})