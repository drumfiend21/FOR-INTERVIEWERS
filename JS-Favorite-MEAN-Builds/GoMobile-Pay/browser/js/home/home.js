app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'HomeController'

    });
});

app.controller('HomeController', function ($scope, AuthService, $state) {






//   //set hash
//   var transactionHash = "th_9f574e73d80a2715912fd59caa32903058b01882"

//   //BEFORE SERVING HTML
//   //push the transactionHash into the page HTML being served, store it on 
//   //the global variable, "transactionHashValue", supplied by us for your front end javascript.
//   //Also, push the timestamp into the page HTML being served, store it on 
//   //the global variable, "timestamp", supplied by us for your front end javascript
//   //E.g. using swig
// console.log("this script is running")
// console.log($('#tchopay-script'))
//   $("#tchopay-script").attr("data-transactionhashvalue", "th_9f574e73d80a2715912fd59caa32903058b01882")
//   $("#tchopay-script").attr("data-transactiontimestamp", Date.now())





























        //with JQuery
   //      $("#checkout-button").on('click', function(){
			// $('html').append('<link rel="stylesheet" href="iframe.css" type="text/css" />')
   //          $('html').append("<div id='checkout-bg' class='checkout-fadein' style='background-color: gray; position: absolute; display: block; width: 100%; top: 0; left: 0; height: 100%; z-index: 9998;'></div>").show()     
   //          var framein = function(){
   //              $("<iframe id='tchopay-iframe' class='iframe-fadein' style='display: block; position: absolute; width: 20%; padding: 20px; top: 100%; left: 27.5%; right: 27.5%; background-color: white; border-radius: 30px; height: 600px; margin: 0 auto; z-index: 9999;' src='/checkout'></iframe>").appendTo($('html')).animate({top: "+10%"}, 500, 'easeInOutBack')
   //              // $('html').append('<button type="button" class="iframe-fadein" id="close-button" style="">x<button>').animate({top: "10%"}, 500, 'easeInOutBack')
   //          }    
   //          setTimeout(framein, 500)
 
   //      })

        //without Jquery

        // document.getElementById("checkout-button").addEventListener('mouseup', function() {
        //     console.log("clicked the mouse",document.getElementsByTagName('html'))
        //     document.getElementsByTagName('html').insertAdjacentHTML('afterbegin', '<link rel="stylesheet" href="iframe.css" type="text/css" />');
        //     document.getElementsByTagName('html').insertAdjacentHTML('afterbegin', "<div id='checkout-bg' class='checkout-fadein' style='background-color: gray; position: absolute; display: block; width: 100%; top: 0; left: 0; height: 100%; z-index: 9998;'></div>");
        //     document.createElement('<link rel="stylesheet" href="iframe.css" type="text/css" />');
        //     document.createElement("<div id='checkout-bg' class='checkout-fadein' style='background-color: gray; position: absolute; display: block; width: 100%; top: 0; left: 0; height: 100%; z-index: 9998;'></div>")

        //     var framein = function(){
        //         document.getElementsByTagName('html').insertAdjacentHTML('afterbegin', "<iframe id='tchopay-iframe' class='iframe-fadein' style='display: block; position: absolute; width: 20%; padding: 20px; top: 100%; left: 27.5%; right: 27.5%; background-color: white; border-radius: 30px; height: 600px; margin: 0 auto; z-index: 9999;' src='/checkout'></iframe>")
        //         // $('html').append('<button type="button" class="iframe-fadein" id="close-button" style="">x<button>').animate({top: "10%"}, 500, 'easeInOutBack')
        //     }    
        //     setTimeout(framein, 500)

        // });

        // $("#close-button").on('click', function(){
        //     console.log("#checkout-bg")
        //     $('#checkout-bg').toggleClass("checkout-fadein checkout-fadeout")
        //     var framein = function(){
        //         $("#tchopay-iframe").animate({top: "-10%"}, 500, 'easeInOutBack').toggleClass("iframe-fadein iframe-fadeout")
        //     }    
        //     setTimeout(framein, 500)
        //     $('html').remove('<link rel="stylesheet" href="iframe.css" type="text/css" />')
 
        // })        



    


});