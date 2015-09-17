
//ON BUTTON CLICK, LAUNCH IFRAME

var testingiFrameDomain = "http://localhost:1337";

$("#checkout-button").on('click', function(){
  $('html').append('<link rel="stylesheet" href="'+ testingiFrameDomain +'/iframe.css" type="text/css"/>')
  $('html').append("<div id='checkout-bg' class='checkout-fadein' style='background-color: gray; position: absolute; display: block; width: 100%; top: 0; left: 0; height: 100%; z-index: 9998;'></div>").show()     
  var framein = function(){
      $("<iframe id='tchopay-iframe' class='iframe-hidden' src='"+testingiFrameDomain+"/checkout'></iframe>").appendTo($('html'))
      $("<img src='"+testingiFrameDomain+"/images/iframe-close.png' id='close-button' height='50' width='50'>").appendTo($('html'))
      $("#tchopay-iframe").addClass("iframe-hidden topup")
      $("#close-button").addClass("closebutton-topup")
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
    if(event.origin === testingiFrameDomain){
      if(event.data.hasOwnProperty("key") && event.data.hasOwnProperty("hashed")){
        
        $.post("/api/orders/confirm", event.data)
        .done(function( data ) {
          // alert( "Data Loaded: " + data );
          //response index: 
          //0. initial outcome hash from front end did not evaluate.  Do not send to tchopay for confirmation.
          //  vv(after sending to tchopay for confirmation)vv
          //1. received back from tchopay but not confirmed
          //2. did not hear back from tchopay
          //3. success

          //Message TchoPay transaction initialization information
          var frame = document.getElementById('tchopay-iframe');
          frame.contentWindow.postMessage(data, testingiFrameDomain);

        });

      }else{
        console.log(event.data)
      }
    }

  });

})


// window.addEventListener("message", function(event){console.log("message from Tchopay iframe:", event)});