var app = angular.module('MainModule', ['ui.bootstrap']);

app.controller('MainController', function($scope, $http, $timeout, $interval, $window){
	$scope.is_logged_in = 0;



	$scope.Blaster = "YYYYY";

	$scope.fb_login = function(){
		FB.login(function(response) {
	        console.log(response);
			if (response.status === 'connected') {
				$scope.is_logged_in = 1;
				console.log($scope.is_logged_in);
				// console.log(response);

	            fb_info.is_logged_in = 1;
	            fb_info.user_token = response.authResponse.accessToken;
	            fb_info.user_token_exp = Date.now() + response.authResponse.expiresIn*1000;

				FB.api('/me', 'GET', {fields: 'name,picture.height(100).width(100)'}, function(response) {

	                fb_info.name = response.name;
	                fb_info.picture = response.picture.data.url;
	                console.log(fb_info.user_token);

					
				});
				console.log(fb_info);
	    		
	    	} else if (response.status === 'not_authorized') {
	    		
	    	} else {
	    		
	    	}
		}, {scope: 'email'});
	}
});

