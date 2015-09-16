
//ON BUTTON CLICK, LAUNCH IFRAME

var testingiFrameDomain = "http://192.168.1.139:1337";

$("#checkout-button").on('click', function(){
  $('html').append('<link rel="stylesheet" href="'+ testingiFrameDomain +'/iframe.css" type="text/css"/>')
  $('html').append("<div id='checkout-bg' class='checkout-fadein' style='background-color: gray; position: absolute; display: block; width: 100%; top: 0; left: 0; height: 100%; z-index: 9998;'></div>").show()     
  var framein = function(){
    
      $("<iframe id='tchopay-iframe' class='iframe-fadein' src='"+testingiFrameDomain+"/checkout'></iframe>").appendTo($('html')).animate({top: "+10%"}, 500, 'easeInOutBack')
      $("<img src='"+testingiFrameDomain+"/images/iframe-close.png' id='close-button' height='50' style='display:none' width='50'>").appendTo($('html'))
      $("#close-button").fadeIn(2000)
      // $('html').append('<button type="button" class="iframe-fadein" id="close-button" style="">x<button>').animate({top: "10%"}, 500, 'easeInOutBack')
          var init = {

          	chargeAmount : $("#tchopay-script").attr("data-amount"),
          	transactionHashValue : $("#tchopay-script").attr("data-transactionHashValue"),
          	apiKey : $("#tchopay-script").attr("data-key"),
          	timestamp : $("#tchopay-script").attr("data-timestamp")

          }

          //SEND INIT MESSAGE TO IFRAME
          var messageInit = function(){
			$("#close-button").on('click', function(){
				$("#tchopay-iframe").animate({top: "-100%"}, 500, 'easeInOutBack')
				$("#close-button").hide().remove()
				$("#checkout-bg").hide().remove()
				var removeIframe = function(){
					$("#tchopay-iframe").remove()
				}
				setTimeout(removeIframe, 2000)
			})
          		//Message TchoPay transaction initialization information
              var frame = document.getElementById('tchopay-iframe');
              frame.contentWindow.postMessage(init, testingiFrameDomain);
          }
          setTimeout(messageInit, 2000)


  }    
  setTimeout(framein, 500)

  //LISTEN FOR MESSAGES FROM IFRAME
  window.addEventListener("message", function(event){
    // console.log("web app registered message from iframe: ", event.origin)
    if(event.origin === testingiFrameDomain){
      if(event.data.hasOwnProperty("key") && event.data.hasOwnProperty("hashed")){
        console.log("WEB APP FRONT END RECEIVED OUTCOME!  We will now send to our back end: ", event.data)
        
        $.post( "/api/orders/confirm", event.data)
        .done(function( data ) {
          // alert( "Data Loaded: " + data );
        });

      }else{
        console.log(event.data)
      }
    }

  });

})