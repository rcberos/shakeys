var app = angular.module('MainModule', ['ui.bootstrap']);

app.controller('MainController', function($scope, $http, $timeout, $interval, $window){
	window.fbAsyncInit = function() {
	    FB.init({
	      appId      : '1567078173606071',
	      xfbml      : true,
	      version    : 'v2.12'
	    });
	    FB.getLoginStatus(function(response) {
	    	console.log(response);
	    	if (response.status === 'connected') {


	    		$scope.is_logged_in = 1;
				$scope.FB_Token = response.authResponse.accessToken;
				if(!$scope.$$phase) {
					$scope.$apply();
				}
				console.log($scope.is_logged_in);
				FB.api('/me', 'GET', {fields: 'name,picture.height(100).width(100)'}, function(response) {

	                $scope.FB_Name = response.name;
	                $scope.FB_Picture = response.picture.data.url;
	                $scope.currentTemp = "/fb-search";
	                if(!$scope.$$phase) {
						$scope.$apply();
					}
				});
	    		

	    	} else if (response.status === 'not_authorized') {
	    		
	    	} else {
	    		
	    	}
	    });
	};
	(function(d, s, id){
	    var js, fjs = d.getElementsByTagName(s)[0];
	    if (d.getElementById(id)) {return;}
	    js = d.createElement(s); js.id = id;
	    js.src = "//connect.facebook.net/en_US/sdk.js";
	    fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));
	$scope.is_logged_in = 0;



	$scope.page_name = "";

	$scope.fb_login = function(){
		FB.login(function(response) {
	        console.log(response);
			if (response.status === 'connected') {
				$scope.is_logged_in = 1;
				$scope.FB_Token = response.authResponse.accessToken;
				if(!$scope.$$phase) {
					$scope.$apply();
				}
				console.log($scope.is_logged_in);
				FB.api('/me', 'GET', {fields: 'name,picture.height(100).width(100)'}, function(response) {

	                $scope.FB_Name = response.name;
	                $scope.FB_Picture = response.picture.data.url;
	                $scope.currentTemp = "/fb-search";
	                if(!$scope.$$phase) {
						$scope.$apply();
					}
				});
				// console.log(fb_info);
	    		
	    	} else if (response.status === 'not_authorized') {
	    		
	    	} else {
	    		
	    	}
		}, {scope: 'email'});
	}

	$scope.search_page = function(){
		$scope.currentBottom = "/fb-post";
        if(!$scope.$$phase) {
			$scope.$apply();
		}

		$scope.page_name = document.getElementById('page_name').value;
		console.log($scope.page_name);
		if(!$scope.$$phase) {
			$scope.$apply();
		}
		console.log($scope.page_name);
		var url = "https://graph.facebook.com/v2.12/"+$scope.page_name+"/posts?fields=id,picture,message&access_token="+$scope.FB_Token;
		$http.get(url).then(function(response){
			console.log(response);
			$scope.FB_Posts = response.data.data;
		})
	}

	$scope.get_comment(post_id){
		$scope.currentBottom = "/fb-comment";
        if(!$scope.$$phase) {
			$scope.$apply();
		}
		// var url = "https://graph.facebook.com/v2.12/"+post_id+"?fields=id,picture,message&access_token="+$scope.FB_Token;
		var url = "https://graph.facebook.com/v2.12/"+post_id+"/comments?fields=id,message,from{name,id,picture},comments{id,message,from{picture,id,name}}&access_token="+$scope.FB_Token;
		$http.get(url).then(function(response){
			console.log(response);
			$scope.FB_Comments = response.data.data;
		});
	}
});

