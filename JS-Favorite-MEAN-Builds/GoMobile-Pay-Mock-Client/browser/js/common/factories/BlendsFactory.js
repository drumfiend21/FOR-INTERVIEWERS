app.factory('BlendsFactory', function ($http){
	return {
		getAllBlends: function (){
			return $http.get("/api/blends")
			.then(function (response){
				var filteredBlends = response.data.filter(function(blend){
             	var instock = true; 
                blend.micros.forEach(function(micro){
                    if (micro.inventory === 0){
                        instock = false;
                    }
                });
                return instock; 
            });

				return filteredBlends;
			});
		},
		getBlendById: function (blendid){
			return $http.get("/api/blends/" + blendid)
			.then(function (response){
				return response.data;
			});
		},
		getBlendByName: function (blendname){ // don't have this route yet
			return $http.get("/api/blends/name/" + blendname)
			.then(function (response){
				return response.data;
			});
		},
		createBlend: function (blend) {
			return $http.post("/api/blends", blend)
			.then(function (response) {
				return response.data;
			});
		},
		editBlendById: function (id, blend) {
			return $http.put('/api/blends/' + id, blend)
			.then(function (response) {
				return response.data;
			});
		},
		deleteBlendById: function (id) {
			return $http.delete('/api/blends/' + id);
		}
	};
});