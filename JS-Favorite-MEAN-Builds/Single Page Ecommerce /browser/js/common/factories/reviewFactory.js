app.factory('reviewFCT', function ($http, $localStorage, CartFactory, AuthService) {

    var saveReview = function (reviewObj) {
        return $http.post('/api/review/', reviewObj, function (data) {
            return data.data;
        });
    }

    var getUnwrittenReviews = function (userId) {
    	return $http.get('/api/review/unwritten', function (data) {
    		return data.data;
    	});
    }


    return {
        saveReview: saveReview,
        getUnwrittenReviews: getUnwrittenReviews
    };

});
