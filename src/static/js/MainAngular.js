var app = angular.module('MainModule', ['ui.bootstrap']);

app.controller('MainController', function($scope, $http, $timeout, $interval, $window){
	$scope.testing = "asd";
	$scope.transit = {
		origin: "",
		destination: "",
		distance: "",
		duration: "",
		departure: "",
		arrival: "",
		steps: []
	}
	$scope.driving = {
		origin: "",
		destination: "",
		distance: "",
		duration: "",
		departure: "",
		arrival: "",
		steps: []
	}
	$scope.walking = {
		origin: "",
		destination: "",
		distance: "",
		duration: "",
		departure: "",
		arrival: "",
		steps: []
	}

	$scope.getRoute = function() {

		// console.log($("<p>Hello, <b>World</b></p>").text());
		console.log($scope.location);
		// $window.alert('route');
		var googleKey = "AIzaSyBzkIn3jgwgs1u_5MUoE7d-7Fh2xEZMzpo";

		var directionsService = new google.maps.DirectionsService;
		directionsService.route({
          origin: $scope.location.origin,  // Haight.
          destination: $scope.location.destination,  
          travelMode: google.maps.TravelMode['TRANSIT']
        }, function(response, status) {
          if (status == 'OK') {
          	console.log(response);
          	console.log(response.routes[0].legs[0].distance.text);
          	$scope.transit.origin = response.routes[0].legs[0].start_address;
          	$scope.transit.destination = response.routes[0].legs[0].end_address;
          	$scope.transit.distance = response.routes[0].legs[0].distance.text;
          	$scope.transit.duration = response.routes[0].legs[0].duration.text;
          	$scope.transit.arrival = response.routes[0].legs[0].arrival_time.text;
          	$scope.transit.departure = response.routes[0].legs[0].departure_time.text;

          	$scope.transit.steps = [];
          	for(var i=0; i< response.routes[0].legs[0].steps.length; i++){
          		var regex = /(<([^>]+)>)/ig
				,   body = response.routes[0].legs[0].steps[i].instructions
				,   result = body.replace(regex, "");
          		$scope.transit.steps.push((i+1)+'] '+result);
          		console.log($(response.routes[0].legs[0].steps[i].instructions).text());
          	}
          	console.log($scope.transit.steps);

          	if(!$scope.$$phase) {
				$scope.$apply();
			}
          } else {
            window.alert('TRANSIT Directions request failed due to ' + status);
          }
        });
	
		var directionsService2 = new google.maps.DirectionsService;
		directionsService2.route({
          origin: $scope.location.origin,  // Haight.
          destination: $scope.location.destination,  
          travelMode: google.maps.TravelMode['DRIVING']
        }, function(response, status) {
          if (status == 'OK') {
          	console.log(response);
          	console.log(response.routes[0].legs[0].distance.text);
          	$scope.driving.origin = response.routes[0].legs[0].start_address;
          	$scope.driving.destination = response.routes[0].legs[0].end_address;
          	$scope.driving.distance = response.routes[0].legs[0].distance.text;
          	$scope.driving.duration = response.routes[0].legs[0].duration.text;
          	// $scope.driving.arrival = response.routes[0].legs[0].arrival_time.text;
          	// $scope.driving.departure = response.routes[0].legs[0].departure_time.text;

          	$scope.driving.steps = [];
          	for(var i=0; i< response.routes[0].legs[0].steps.length; i++){
          		var regex = /(<([^>]+)>)/ig
				,   body = response.routes[0].legs[0].steps[i].instructions
				,   result = body.replace(regex, "");

				// console.log(result);

          		$scope.driving.steps.push((i+1)+'] '+result);
          		// console.log($(response.routes[0].legs[0].steps[i].instructions).text());
          		          	}
          	console.log($scope.driving.steps);

          	if(!$scope.$$phase) {
				$scope.$apply();
			}
          } else {
            window.alert('DRIVING Directions request failed due to ' + status);
          }
        });

		var directionsService3 = new google.maps.DirectionsService;
		directionsService3.route({
          origin: $scope.location.origin,  // Haight.
          destination: $scope.location.destination,  
          travelMode: google.maps.TravelMode['WALKING']
        }, function(response, status) {
          if (status == 'OK') {
          	console.log(response);
          	console.log(response.routes[0].legs[0].distance.text);
          	$scope.walking.origin = response.routes[0].legs[0].start_address;
          	$scope.walking.destination = response.routes[0].legs[0].end_address;
          	$scope.walking.distance = response.routes[0].legs[0].distance.text;
          	$scope.walking.duration = response.routes[0].legs[0].duration.text;
          	// $scope.driving.arrival = response.routes[0].legs[0].arrival_time.text;
          	// $scope.driving.departure = response.routes[0].legs[0].departure_time.text;

          	$scope.walking.steps = [];
          	for(var i=0; i< response.routes[0].legs[0].steps.length; i++){
          		var regex = /(<([^>]+)>)/ig
				,   body = response.routes[0].legs[0].steps[i].instructions
				,   result = body.replace(regex, "");

				// console.log(result);

          		$scope.walking.steps.push((i+1)+'] '+result);
          	}
          	console.log($scope.walking.steps);

          	if(!$scope.$$phase) {
				$scope.$apply();
			}
          } else {
            window.alert('WALKING Directions request failed due to ' + status);
          }
        });

	}

	
});

