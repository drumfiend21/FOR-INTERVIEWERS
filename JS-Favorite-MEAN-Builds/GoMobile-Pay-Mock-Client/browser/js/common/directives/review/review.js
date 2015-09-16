app.directive('review', function(ReviewsFactory, BlendsFactory, AuthService) {
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/review/review.html',
        scope: {
            review: '=',
            blend: '='
        },
        link: function(scope) {

            AuthService.getLoggedInUser().then(function (currUser){
                scope.userId = currUser._id;
            });

            scope.showReviews = function () {
             console.log("blend is ", scope.blend);
              BlendsFactory.getBlendById(scope.blend._id).then(function(blend){
                console.log("blend reviews are ", blend);
                scope.revArr = blend.reviews;
                //console.log("got reviews!");
              });
            };

            scope.showReviews();

            scope.newReview = function(star, comment) {
                var newReview = {
                    rating: star,
                    comment: comment,
                    blend: scope.blend._id,
                    user: scope.userId
                };
                
                ReviewsFactory.createReview(newReview).then(function(review) {
                  console.log('YAYYYY! NEW REVIEW CREATED!', review._id);
                  
                  scope.blend.reviews = scope.blend.reviews.map(function(review){return review._id;});
                  scope.blend.reviews.push(review._id);
                  console.log("with new id", scope.blend);
                  BlendsFactory.editBlendById(scope.blend._id, {reviews: scope.blend.reviews});
                }).then(function(){
                  scope.showReviews();
                });

            };
        }
    };
});