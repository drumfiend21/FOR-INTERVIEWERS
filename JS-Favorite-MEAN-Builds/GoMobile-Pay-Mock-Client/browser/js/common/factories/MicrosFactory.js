app.factory('MicrosFactory', function ($http){
	return {
		getAllMicros: function (){
			return $http.get("/api/micros")
			.then(function (response){
				return response.data;
			});
		},
		getMicroById: function (microid){
			return $http.get("/api/micros/" + microid)
			.then(function (response){
				return response.data;
			});
		},
		getMicroByName: function (microname){
			return $http.get("/api/micros/name/" + microname)
			.then(function (response){
				return response.data;
			});
		},
		getMicrosBySpice: function (spicelevel){
			return $http.get("/api/micros/spice/" + spicelevel)
			.then(function (response){
				return response.data;
			});
		},
		createMicro: function (micro) {
			return $http.post("/api/micros", micro)
			.then(function (response) {
				return response.data;
			});
		},
		editMicroById: function (id, micro) {
			return $http.put('/api/micros/' + id, micro)
			.then(function (response) {
				return response.data;
			});
		},
		deleteMicroById: function (id) {
			return $http.delete('/api/micros/' + id);
		},
	};
});