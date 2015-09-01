app.factory('FlashCardsFactory', function ($http) {
    return {
        loadcheck: true,
        getFlashCards: function (category) {
            if(category){
                return $http.get('/cards?category='+category).then(function (response) {
                    console.log("category call", category)
                    console.log(response.data)
                    return response.data;
                });
            }else{
                return $http.get('/cards/').then(function (response) {
                    console.log("root call", response.data)
                    return response.data;
                });                
            }


        },
        addNewCard : function(card){

            return $http.put('/cards/'+card._id, card).then(function(data){
                return data.data;

            });

            
        },
        deleteCard: function(card){
            console.log("delete hit")
            return $http.delete('/cards/'+card._id, card).then(function(data){
                return data.data

            });
        }

 
    };


});