app.factory('ReviewsFactory', function ($http){
	return {
		getAllReviews: function (){
			return $http.get("/api/reviews")
			.then(function (response){
				return response.data;
			});
		},
		getReviewById: function (reviewid){
			return $http.get("/api/reviews/" + reviewid)
			.then(function (response){
				return response.data;
			});
		},
		createReview: function (review) {
			return $http.post("/api/reviews", review)
			.then(function (response) {
				return response.data;
			});
		},
		editReviewById: function (id, review) {
			return $http.put('/api/reviews/' + id, review)
			.then(function (response) {
				return response.data;
			});
		},
		deleteReviewById: function (id) {
			return $http.delete('/api/reviews/' + id);
		},
	};
});