if(Meteor.isClient){
	Meteor.functions = {
		setController: function (controller) {
			controller();
		},
		addToSpotify: function(){
			var spotifyUser = Session.get("spotifyUser");
			if(spotifyUser){
				var song = Session.get("playingsong");
				if(!song){
					return;
				};

				$.ajax({
					type:'PUT',
					headers: {
			        	'Authorization': 'Bearer ' + spotifyUser.access_token
			    	},
					url: 'https://api.spotify.com/v1/me/tracks?ids='+song.id,
					success: function (response) {
						alert('never happens');
					}
				});

				Session.set("songAdded", {song: song.id});
			}else{
				var auth = Meteor.functions.auth();
				auth.openLogin();
			}
		},
		auth: function () {
			var CLIENT_ID = '';
			var REDIRECT_URI = '';

			if (location.host == 'localhost:3000') {
				CLIENT_ID =	'1cfa9a116cce4bafaa1249fb22c64e63';
				REDIRECT_URI = 'http://localhost:3000/auth';
			} else {
				CLIENT_ID = '1cfa9a116cce4bafaa1249fb22c64e63';
				REDIRECT_URI = 'http://www.theartisthunt.com/auth';
			}

			function getLoginURL(scopes) {
				return 'https://accounts.spotify.com/authorize?client_id=' + CLIENT_ID
					+ '&redirect_uri=' + encodeURIComponent(REDIRECT_URI)
					+ '&scope=' + encodeURIComponent(scopes.join(' '))
					+ '&response_type=token';
			}

			window.addEventListener("message", receiveMessage, false);
			return {
				openLogin: function() {
					var url = getLoginURL([
						'user-library-read',
						'user-library-modify'
					]);
					// 'user-read-private',
					// 'playlist-read-private',
					// 'playlist-modify-public',
					// 'playlist-modify-private',

					var w = window.open(url, 'Spotify', 'WIDTH=400, HEIGHT=600');

					// window.location = url;
				},
				getAccessToken: function() {
					var expires = 0 + localStorage.getItem('pa_expires', '0');
					if ((new Date()).getTime() > expires) {
						return '';
					}
					var token = localStorage.getItem('pa_token', '');
					return token;
				},
				setAccessToken: function(token, expires_in) {
					localStorage.setItem('pa_token', token);
					localStorage.setItem('pa_expires', (new Date()).getTime() + expires_in);
					// _token = token;
					// _expires = expires_in;
				},
				getUsername: function() {
					var username = localStorage.getItem('pa_username', '');
					return username;
				},
				setUsername: function(username) {
					localStorage.setItem('pa_username', username);
				},
				getUserCountry: function() {
					var userCountry = localStorage.getItem('pa_usercountry', 'US');
					return userCountry;
				},
				setUserCountry: function(userCountry) {
					localStorage.setItem('pa_usercountry', userCountry);
				}
			}
		}
	}

	Template.spotifyControls.events({
		'click .logIn':function () {
			var l = Meteor.functions.auth();
			l.openLogin();
		},
		'click .addSong':function (e) {
			Meteor.functions.addToSpotify();
			$('.addSong .plus').fadeOut(100);
			setTimeout(function () {
				$('.addSong .plus').fadeIn(100);
			}, 100);
		}
	});

	Template.spotifyControls.loggedIn = function () {
		return Session.get("spotifyUser");
	};

	function receiveMessage(e){
		if(e.data){
			var data = JSON.parse(e.data);
			Session.set("spotifyUser", data);
		}
	};


	
}