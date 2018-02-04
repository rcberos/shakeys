var app = angular.module('MainModule', ['ui.bootstrap']);

app.controller('MainController', function($scope, $http, $timeout, $interval, $window){

	var blaster = [1,2,3,4,5,6,7,8,9,10];
	for(var i=0;i<blaster.length; i++){
		console.log(blaster[i]);
		if(i==2){
			blaster.splice(i, 1);
			i=i-1;
		}
	}


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

	$scope.get_page = function(page_id, token, page_name, picture){
		$scope.currentTemp = "/fb-post";
        if(!$scope.$$phase) {
			$scope.$apply();
		}

		$scope.FB_Name = page_name;
		$scope.FB_Picture = picture;

		page_id = "ShakeysPH";
		$scope.FB_Token = token;

		var url = "https://graph.facebook.com/v2.10/"+page_id+"/posts?fields=id,picture,message,comments.summary(true)&access_token="+$scope.FB_Token;
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

	$scope.show_replies = function(index, id){
		$scope.replyTemp = '/fb_reply';
		if(!$scope.$$phase) {
			$scope.$apply();
		}
		console.log('show_replies');
		console.log(index);

		var url = "https://graph.facebook.com/v2.10/"+id+"/comments?fields=id,from{id,name,picture},message&access_token="+$scope.FB_Token;
		$http.get(url).then(function(response){
			console.log(response);
			$scope.showReplies = true;
			$scope.commentReply = response.data.data;
			if(!$scope.$$phase) {
				$scope.$apply();
			}
			// $scope.FB_Posts = response.data.data;
		})


		// $scope.showReplies = true;
		// $scope.commentReply = $scope.FB_ShowComments[index].comments.data;
		// console.log($scope.FB_Comments[index]);
		// if(!$scope.$$phase) {
		// 	$scope.$apply();
		// }
	}

	$scope.myFilter = function(post) {
		var isMatch = false;

		if ($scope.filter_words.length>0) {
			// var parts = $scope.inputText.split(' ');

			$scope.filter_words.forEach(function(part) {
				console.log("SEARCH");
				console.log(part);
				console.log(post);
				if (new RegExp(part).test(post.message)) {
					isMatch = true;
				}
			});
		} else {
			isMatch = true;
		}

		return isMatch;
    };

	$scope.filter_words = [];

	function updateShowComment(){
		$scope.FB_ShowComments = [];

		if($scope.filter_words.length == 0){
			$scope.FB_ShowComments = $scope.FB_Comments;
		}	
		else{
			for(var i=0; i<$scope.FB_Comments.length; i++){
				
				console.log($scope.FB_Comments[i].message);
				console.log('MESSAGE');
				console.log($scope.FB_Comments);
				for(var j=0; j<$scope.filter_words.length; j++){
					console.log($scope.filter_words[j]);
					var n = $scope.FB_Comments[i].message.toLowerCase().search($scope.filter_words[j].toLowerCase());
					if(n>=0){
						$scope.FB_ShowComments.push($scope.FB_Comments[i]);
						break;
					}
				}
			}
		}
			
	}

	$scope.add_word = function(){
		var word = document.getElementById('addword').value;
		$scope.filter_words.push(word);
		if(!$scope.$$phase) {
			$scope.$apply();
		}

		updateShowComment();

	}

	$scope.remove_word = function(word){
		for(var i=0; i<$scope.filter_words.length; i++){
			if($scope.filter_words[i] == word){
				$scope.filter_words.splice(i,1);
				break;
			}
		}
		updateShowComment();
	}

	$scope.get_comment = function(post_id){
		$scope.currentTemp = "/fb-comment";
        if(!$scope.$$phase) {
			$scope.$apply();
		}

		var url = "https://graph.facebook.com/v2.10/"+post_id+"?fields=id,message,picture&access_token="+$scope.FB_Token;
		console.log(url)
		$http.get(url).then(function(response){
			console.log(response);
			$scope.FB_SinglePost = response.data;
			if(!$scope.$$phase) {
				$scope.$apply();
			}
			console.log($scope.FB_SinglePost);
		});

		$scope.FB_Comments = [];
		$scope.FB_ShowComments = [];


		// // var url = "https://graph.facebook.com/v2.12/"+post_id+"?fields=id,picture,message&access_token="+$scope.FB_Token;
		var url = "https://graph.facebook.com/v2.10/"+post_id+"/comments?fields=id,message,created_time,from{name,id,picture},comments.summary(true){id,message,from{picture,id,name}}&limit=500&summary=true&access_token="+$scope.FB_Token;
		
		scan_comments(url);
		// console.log(url)
		// $http.get(url).then(function(response){
		// 	console.log(response);
		// 	$scope.FB_Comments = response.data.data;
		// });
	}


	$scope.reply_to_comment = function(index){
		var comment_id = $scope.FB_ShowComments[index].id;
		console.log(comment_id);


		var url = "https://graph.facebook.com/v2.10/"+comment_id+"/comments";
		var data = {
			message: "wow",
			access_token: $scope.FB_Token
		}
		$http.post(url, data).then(function(response){
			console.log(response);
		})
	}

	function scan_comments(url){
		console.log('scan');
		$http.get(url).then(function(response){
			console.log(response);
			// $scope.FB_Comments = response.data.data;
			// $scope.FB_Comments.push(response.data.data);

			for(var i=0; i<response.data.data.length; i++){
				$scope.FB_Comments.push(response.data.data[i]);
				for(var j=0; j<$scope.filter_words.length; j++){
					var n = response.data.data[i].message.toLowerCase().search($scope.filter_words[j].toLowerCase());
					if(n>=0){
						$scope.FB_ShowComments.push(response.data.data[i]);
					}
				}
				if($scope.filter_words.length==0){
					$scope.FB_ShowComments.push(response.data.data[i]);
				}
			}

			if (angular.isDefined(response.data.paging.next)) {
				console.log(response.data.paging.next);
			  scan_comments(response.data.paging.next);
			}
			console.log($scope.FB_Comments);
		});
	}



});

