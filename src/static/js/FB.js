window.fbAsyncInit = function() {
    FB.init({
      appId      : '1567078173606071',
      xfbml      : true,
      version    : 'v2.9'
    });
    FB.getLoginStatus(function(response) {
    	console.log(response);
    	if (response.status === 'connected') {

            fb_info.is_logged_in = 1;
            fb_info.user_token = response.authResponse.accessToken;
            fb_info.user_token_exp = Date.now() + response.authResponse.expiresIn*1000;




    		FB.api('/me', 'GET', {fields: 'name,picture.height(100).width(100)'}, function(response) {

                fb_info.name = response.name;
                fb_info.picture = response.picture.data.url;
                console.log(fb_info);

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