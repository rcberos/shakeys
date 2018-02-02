var app = angular.module('MainModule', ['ui.bootstrap']);

app.controller('MainController', function($scope, $http, $timeout, $interval, $window){
	function get_accounts(){
        $scope.currentTemp = "/fb-account";
        if(!$scope.$$phase) {
			$scope.$apply();
		}

		var url = "https://graph.facebook.com/v2.10/me/accounts?fields=name,access_token,picture&access_token="+$scope.FB_Token;
		console.log(url)
		$http.get(url).then(function(response){
			console.log(response);
			$scope.FB_Accounts = response.data.data;

			// $scope.FB_Comments = response.data.data;
		});
	}

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
					get_accounts();
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
					get_accounts();
				});
				// console.log(fb_info);
	    		
	    	} else if (response.status === 'not_authorized') {
	    		
	    	} else {
	    		
	    	}
		}, {scope: 'email'});
	}

	$scope.get_page = function(page_id, token){
		$scope.currentTemp = "/fb-post";
        if(!$scope.$$phase) {
			$scope.$apply();
		}

		page_id = "ShakeysPH";
		$scope.FB_Token = token;

		var url = "https://graph.facebook.com/v2.10/"+page_id+"/posts?fields=id,picture,message&access_token="+$scope.FB_Token;
		$http.get(url).then(function(response){
			console.log(response);
			$scope.FB_Posts = response.data.data;
		})

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
		var url = "https://graph.facebook.com/v2.10/"+$scope.page_name+"/posts?fields=id,picture,message&access_token="+$scope.FB_Token;
		$http.get(url).then(function(response){
			console.log(response);
			$scope.FB_Posts = response.data.data;
		})
	}

	$scope.show_replies = function(index){
		$scope.showReplies = true;
		$scope.commentReply = $scope.FB_Comments[index].comments;
	}

	$scope.get_comment = function(post_id){
		$scope.currentTemp = "/fb-comment";
        if(!$scope.$$phase) {
			$scope.$apply();
		}
		// $scope.currentBottom = "/fb-comment";
  //       if(!$scope.$$phase) {
		// 	$scope.$apply();
		// }
		// var url = "https://graph.facebook.com/v2.12/"+post_id+"?fields=id,picture,message&access_token="+$scope.FB_Token;
		var url = "https://graph.facebook.com/v2.10/"+post_id+"/comments?fields=id,message,from{name,id,picture},comments{id,message,from{picture,id,name}}&access_token="+$scope.FB_Token;
		console.log(url)
		$http.get(url).then(function(response){
			console.log(response);
			$scope.FB_Comments = response.data.data;
		});
	}
});

