
Router.configure({
	layoutTemplate: 'main'
});

Meteor.controllers = {
	gameController: function () {
		document.onkeydown = function KeyPressed( e ) {
			var key = ( window.event ) ? event.keyCode : e.keyCode;

			switch(key){
				case 37: // left
					if(selectedRelatedArtistIndex > 1){
						setSelected(selectedRelatedArtistIndex - 1);
					}else{
						setSelected(5);
					}
					break;
				case 39: // right
					if(selectedRelatedArtistIndex < 5){
						setSelected(selectedRelatedArtistIndex + 1);
					}else{
						setSelected(1);
					}
					break;
				case 32: // space
					Meteor.functions.addToSpotify();
					break;
				case 13: // enter
				case 38: // up
					Session.set("score", Session.get("score")+1);

					// $("section.background").addClass('fade-out');

					$("ul.related-artists li:nth-child("+selectedRelatedArtistIndex+") .artistBoxContainer").addClass('move-up');

					setTimeout(function () {
						$("ul.related-artists").addClass('move-down');
						$("ul.related-artists li:nth-child("+selectedRelatedArtistIndex+") .artistBoxContainer").removeClass('move-up');
						loadArtist(Session.get("related")[selectedRelatedArtistIndex-1]);
						setTimeout(function () {
							$("ul.related-artists").removeClass('move-down');
							$("ul.related-artists").addClass('swosh-in');
						},200);
					},200);

					break;
				case 40: // down
					playNext();
					break;
			}
		}
	},
	discoverController: function () {
		document.onkeydown = function KeyPressed( e ) {
			var key = ( window.event ) ? event.keyCode : e.keyCode;

			switch(key){
				case 37: // left
					if(selectedRelatedArtistIndex > 1){
						setSelected(selectedRelatedArtistIndex - 1);
					}else{
						setSelected(5);
					}
					break;
				case 39: // right
					if(selectedRelatedArtistIndex < 5){
						setSelected(selectedRelatedArtistIndex + 1);
					}else{
						setSelected(1);
					}
					break;
				case 32: // space
					Meteor.functions.addToSpotify();
					break;
				case 13: // enter
				case 38: // up
					Session.set("score", Session.get("score")+1);

					// $("section.background").addClass('fade-out');

					$("ul.related-artists li:nth-child("+selectedRelatedArtistIndex+") .artistBoxContainer").addClass('move-up');

					setTimeout(function () {
						$("ul.related-artists").addClass('move-down');
						$("ul.related-artists li:nth-child("+selectedRelatedArtistIndex+") .artistBoxContainer").removeClass('move-up');

						// loadArtist(Session.get("related")[selectedRelatedArtistIndex-1]);

						Router.go('/discover/'+Session.get("related")[selectedRelatedArtistIndex-1].id);

						setTimeout(function () {
							$("ul.related-artists").removeClass('move-down');
							$("ul.related-artists").addClass('swosh-in');
						},200);
					},200);

					break;
				case 40: // down
					playNext();
					break;
			}
		};
	},
	splashController: function () {
		// start by listening for up key
		document.onkeydown = function KeyPressed( e ) {
			var key = ( window.event ) ? event.keyCode : e.keyCode;
			if(key == 38){
				proceedFromStart();
			}
		};
	},

	discoveryOnboardController: function () {
		// start by listening for up key
		document.onkeydown = function KeyPressed( e ) {
			var key = ( window.event ) ? event.keyCode : e.keyCode;
			if(key == 38){
				
				if(!userIsIncognito()){
					localStorage.setItem("discoveronboardingDone", "true");
				}

				Session.set("incognito", true)


				Router.go('/discover');
			}
		};
	},

	noController: function () {
		document.onkeydown = function KeyPressed( e ) {
			// 
		};
	}
};




Router.map(function() {
	this.route('home', {
		path: '/',
		template:'index',
		onAfterAction: function () {
			if (location.host != 'localhost:3000') {
				GAnalytics.pageview('home');
			}
			var array = SetupArtists.find().fetch();
			if(array.length > 0){	
				var randomIndex = Math.floor( Math.random() * array.length );
				var element = array[randomIndex];

				getArtist(element.start,function (artist) {
					setActiveArtist(artist);
				});

				getTopTrackFromArtist(element.start, true)

				fetchRelatedArtists(element.start);

				fetchStartGoalArtists(element.start, element.goal);
			};

			Meteor.functions.setController(Meteor.controllers.splashController);
		},
		waitOn: function () {
     		return Meteor.subscribe('setupartists');
    	},
    	fastRender:true
	});



	this.route('challenge', {
		path: '/challenge/:artistId1/:artistId2',
		template:'index',
		onAfterAction: function () {
			if (location.host != 'localhost:3000') {
				GAnalytics.pageview('challenge');
			}


			getArtist(this.params.artistId1,function (artist) {
				setActiveArtist(artist);
			});

			getTopTrackFromArtist (this.params.artistId1, true)
			fetchRelatedArtists(this.params.artistId1);

			fetchStartGoalArtists(this.params.artistId1, this.params.artistId2);
			Meteor.functions.setController(Meteor.controllers.splashController);

		}
	});

	this.route('highscore', {
		path: '/highscore',
		template:'toplist',
		onAfterAction: function () {
			GAnalytics.pageview('settings');
			if(!Session.get("startArtist") || !Session.get("goalArtist")){
				Router.go('home');
			}
		},
		waitOn: function () {
			return Meteor.subscribe('highscore');
		}
	});

	this.route('auth', {
		path: '/auth',
		action: function () {
			var hash = {};
			location.hash.replace(/^#\/?/, '').split('&').forEach(function(kv) {
				var spl = kv.indexOf('=');
				if (spl != -1) {
					hash[kv.substring(0, spl)] = decodeURIComponent(kv.substring(spl+1));
				}
			});

			if (hash.access_token) {
				window.opener.postMessage(JSON.stringify({
					type:'access_token',
					access_token: hash.access_token,
					expires_in: hash.expires_in || 0
				}), '*');

				window.close();
			}
		}
	});

	this.route('discoverOnboard', {
		path: '/discover/tutorial',
		template:'discoverOnboarding',
		onAfterAction: function () {
			if (location.host != 'localhost:3000') {
				GAnalytics.pageview('/discover/tutorial');
			};

			Meteor.functions.setController(Meteor.controllers.discoveryOnboardController);
			
		}
	});

	this.route('discover', {
		path: '/discover',
		template:'discover',
		onAfterAction: function () {
			if (location.host != 'localhost:3000') {
				GAnalytics.pageview('/discover');
			};

			if(!userIsIncognito()){

				if(discoverUserNotOnboarded()){
					Router.go("/discover/tutorial");
					return;
				};
			} else {
				//Session.set("incognito", true)
				// Router.go("/discover/tutorial");
				// return;
			}	

						// loadArtist();
			Meteor.functions.setController(Meteor.controllers.discoverController);
			getArtist("6KcmUwBzfwLaYxdfIboqcp",function(artist){
				loadArtist(artist);
				Session.set("startArtist", artist);
			});
			setTimeout(function () {
				setSelected(selectedRelatedArtistIndex);
			}, 200);
		}
	});

	this.route('discover', {
		path: '/discover/:artistId',
		template:'discover',
		onAfterAction: function () {
			if (location.host != 'localhost:3000') {
				GAnalytics.pageview('/discover/specific');
			};
			// loadArtist();
			Meteor.functions.setController(Meteor.controllers.discoverController);
			getArtist(this.params.artistId,function(artist){
				loadArtist(artist);
				Session.set("startArtist", artist);
			});
			setTimeout(function () {
				setSelected(selectedRelatedArtistIndex);
			}, 200);
		}
	});
});

var selectedRelatedArtistIndex = 3;

if (Meteor.isClient) {
	Meteor.startup(function () {
		
		Session.set("splash", true);
		Session.set("showArtistPicker", false);
		Meteor.functions.setController(Meteor.controllers.splashController);
	});

	UI.registerHelper('startArtist', function() {
		return Session.get("startArtist");
	});

	UI.registerHelper('goalArtist', function() {
		return Session.get("goalArtist");
	});

	UI.registerHelper('playingsong', function() {
		return Session.get("playingsong");
	});

	function fetchStartGoalArtists(startId, goalId){
		getArtist(startId, function (artist) {
			Session.set("startArtist", artist);
		});

		getArtist(goalId, function (artist) {
			Session.set("goalArtist", artist);
		});
	};

	function getArtist(artistId, callback){
		$.ajax({
			url: 'https://api.spotify.com/v1/artists/'+artistId,
			success: function (artist) {
				callback(artist);
			}
		});
	};

	function fetchRelatedArtists(artistId) {
		$.ajax({
			url: 'https://api.spotify.com/v1/artists/'+artistId+'/related-artists',
			success: function (response) {
				var relatedArtists = response.artists.slice(0,3);
				var randomNum1 = minmaxRandom(4, response.artists.length-1);
				var randomNum2 = minmaxRandom(4, response.artists.length-1);
				while(randomNum1 == randomNum2){
					randomNum1 = minmaxRandom(4, response.artists.length-1);
				}
				relatedArtists.push(response.artists[randomNum1]);
				relatedArtists.push(response.artists[randomNum2]);

				for (var i = relatedArtists.length - 1; i >= 0; i--) {
					var image = relatedArtists[i].images[relatedArtists[i].images.length-2]
					if(image != null || image != undefined){
						relatedArtists[i]["coverImage"] = image;
					} else {
						relatedArtists[i]["coverImage"] = {url:"/images/unknown.jpg"};
						relatedArtists[i].images[0] = {url:"/images/unknownLarge.jpg"};
					}
				};

				Session.set("fetchingRelated", false);
				Session.set("related", relatedArtists);
			}
		});
	}

	function minmaxRandom(min, max){
		return Math.floor(Math.random()*(max-min+1)+min);
	}

	function checkWin(){
		if(!Session.get('goalArtist')){
			return;
		}

		if(Session.get("artist").id == Session.get("goalArtist").id){
			Meteor.functions.setController(Meteor.controllers.noController);
			Router.go('highscore');
		}
	}

	var audio;
	function getTopTrackFromArtist (artistId, fadeIn) {
		$.ajax({
			url: 'https://api.spotify.com/v1/artists/' + artistId + '/top-tracks?country=SE',
			success: function (response) {
				playSong(response, fadeIn);
			}
		});
	};

	function playSong(response,fadeIn){
				if(audio){
					// audio.pause();
					audio.removeEventListener('ended',playNext);
					$(audio).animate({volume:0}, 2000);
				}
				newAudio = new Audio(response.tracks[0].preview_url);
				newAudio.play();

				if(fadeIn){
					newAudio.volume = 0;
					$(newAudio).animate({volume:1}, 5000);
				}

				audio = newAudio;

				audio.addEventListener('ended',playNext);

				Session.set("playingsong", {name:response.tracks[0].name, id:response.tracks[0].id, tracks:response.tracks.splice(1,response.tracks.length-1)});
				document.title = "The Artist Hunt / ♫ "+ response.tracks[0].artists[0].name + " – " + response.tracks[0].name;
				// Session.set("toptrack", response.tracks[0].preview_url);
	};

	function playNext(){
		var song = Session.get("playingsong");

		if(song.tracks.length > 0){
			playSong(song,true);
		};
	};

	Template.index.splash = function () {
		return Session.get("splash");
	};

	Template.splashScreen.chooseArtist = function () {
		return Session.get("showArtistPicker");
	};

	Template.splashScreen.artist = function () {
		return Session.get("artist");
	};

	Template.main.artistImage = function () {
		return Session.get("artistImage");
	}

	Template.gameBoard.artist = function () {
		return Session.get("artist");
	};

	Template.relatedArtists.related = function () {
		return Session.get("related");
	};


	Template.gameBoard.songname = function () {
		var song = Session.get("playingsong");
		if(song){
			return song.name;
		}
	}

	Template.index.onboarding = function(){
		return Session.get("onboarding");
	}

	Template.index.incognito = function(){
		return Session.get("incognito");
	}

	Template.twitterHandles.random = function () {
		var handles = ["oscrse", "gopatrik"];
		return Math.floor(Math.random()*2) == 0 ? {one: handles[0], two: handles[1]} : {one: handles[1], two: handles[0]};
	}

	function setActiveArtist(artist){
		Session.set("artist", artist);
		if(Router.current().route.name == 'discover'){ // todo: not optimal
			Session.set("startArtist", artist);
		};
		if(artist.images[0]){
			Session.set("artistImage", artist.images[0].url);
		}
		checkWin();
	};

	function setSelected (index) {
		$("ul.related-artists li:nth-child("+selectedRelatedArtistIndex+") .artistBoxContainer").removeClass("selected");

		var sbox = $("ul.related-artists li:nth-child("+index+") .artistBoxContainer");
		sbox.addClass("selected");
		selectedRelatedArtistIndex = index;

	}

	function hideSplash () {
		if(Session.get("splash")){
			$('.splash').addClass('move-up');
			setTimeout(function () {
				Session.set("splash", false);
				$('.titles').addClass('.fade-in-full');
			},200);
		}
	}

	

	// function deMeteor.functions.setController () {
	// 	document.onkeydown = undefined;
	// };

	Template.missions.current = function () {
		var goalArtist = Session.get("goalArtist");
		var startArtist = Session.get("startArtist");
		if(startArtist && goalArtist){
			return {start: startArtist, goal: goalArtist, startImage:startArtist.images[0].url, goalImage:goalArtist.images[0].url};
		}
	}

	Template.missions.randomSet = function () {
		
		var array = SetupArtists.find().fetch();
		var randomIndex = Math.floor( Math.random() * array.length );
		var element = array[randomIndex];
		return element
	}


	Template.artistSearch.discoverSearch = function () {
		return Router.current().route.name == 'discover';
	};

	function loadArtist (artist) {

		Session.set("fetchingRelated", true);

		fetchRelatedArtists(artist.id);

		getTopTrackFromArtist(artist.id);

		setActiveArtist(artist)

	};

	var selectedArtistResultIndex = 0;
	Template.artistSearch.events({
		'keyup input[name=artistGoalSearchField]': function (e) {
			var name = $(e.target).val();
			if(name.length > 0){
				fetchFirstArtist(name, function (response) {
					Session.set("goalArtistSearchResults", {results: response.artists.items.slice(0,4)});
				});
			}
		},
		'keyup input[name=artistStartSearchField]': function (e) {
			var name = $(e.target).val();
			if(name.length > 0){
				fetchFirstArtist(name, function (response) {
					Session.set("startArtistSearchResults", {results: response.artists.items.slice(0,4)});
				});
			}
		},
		'keydown .artistForms input':function (e) {

			if(e.keyCode == 40 || e.keyCode == 38){ // go down
				var resultList = $(e.target).parent().children('ul.search-results');

				var listlength = resultList.children('li').length;

				resultList.children('li:nth-child('+(selectedArtistResultIndex)+')').removeClass('selected');

				if(e.keyCode == 40 && selectedArtistResultIndex < listlength){ // down
					selectedArtistResultIndex += 1;
				}else if(e.keyCode == 38 && selectedArtistResultIndex > 1){ //up
					selectedArtistResultIndex -= 1;
				}

				resultList.children('li:nth-child('+(selectedArtistResultIndex)+')').addClass('selected');
			}

			switch(e.keyCode){
				case 13: // enter

					break;
			}
		},
		'click .artistGoalSearch .search-results li':function () {
			Session.set("goalArtist", this);
		},
		'keydown .artistGoalSearch input': function (e) {
			if(e.keyCode == 13){
				var list = Session.get("goalArtistSearchResults");
				if(list.results.length > 0){
					Session.set("goalArtist", list.results[selectedArtistResultIndex-1]);
					$('input[name=artistGoalSearchField]').blur();
				}
			};
		},
		'keydown .artistStartSearch input': function (e) {
			if(e.keyCode == 13){
				var list = Session.get("startArtistSearchResults");
				if(list.results.length > 0){
					var artist = list.results[selectedArtistResultIndex-1];
					loadArtist(artist);
					Session.set("startArtist", artist);
					$('input[name=artistStartSearchField]').blur();
				};
			};
		},
		'click .artistStartSearch .search-results li':function () {
			loadArtist(this);
			Session.set("startArtist", this);
		},
		'blur input[name=artistGoalSearchField], blur input[name=artistStartSearchField]': function (e) {

			if(Router.current().route.name == 'discover'){ // todo: not optimal
				Meteor.functions.setController(Meteor.controllers.discoverController);
			}else{
				Meteor.functions.setController(Meteor.controllers.splashController);
			};
			$(e.target).parent().children('ul.search-results').fadeOut();
		},
		'focus input[name=artistGoalSearchField], focus input[name=artistStartSearchField]': function (e) {
			Meteor.functions.setController(Meteor.controllers.noController);
			$(e.target).parent().children('ul.search-results').show();
		}

	});

	Template.artistSearch.goalSearchResult = function () {
		return Session.get("goalArtistSearchResults");
	};

	Template.artistSearch.startSearchResult = function () {
		return Session.get("startArtistSearchResults");
	};

	function fetchFirstArtist (name, callback) {
		$.ajax({
			url: 'https://api.spotify.com/v1/search',
			data: {
				q: name,
				type: 'artist'
			},
			success: function (response) {
				callback(response);
			}
		});
	};

	// start by listening for up key
	document.onkeydown = function KeyPressed( e ) {
		var key = ( window.event ) ? event.keyCode : e.keyCode;
		if(key == 38){
			proceedFromStart();
		}
	}


	// sorry
	function proceedFromStart () {
		hideSplash();


		// 2, was at onboarding, set up for game
		if(Session.get("onboarding")){
			Session.set("onboarding", false);
			if(userIsIncognito()){
				startGame();
				return;
			}else{
				localStorage.setItem("onboardingDone", "true");
			}
		};

		// 1 - go to onboarding
		if(userNotOnboarded()){
			Session.set("onboarding", true);
		}else{ //3 start game
			startGame();
		}

	};

	function startGame () {
		Meteor.functions.setController(Meteor.controllers.gameController);
		setTimeout(function () {
			setSelected(selectedRelatedArtistIndex);
		},800);
	};

	function userIsIncognito() {
		try {
		  localStorage.setItem('incognito', "true");// try to use localStorage      
		} catch (e) { // user is incognito
		    return true;
		};

		localStorage.removeItem('incognito');
		return false;
	};

	function userNotOnboarded () {
		// uses local storage to see if user onboarded
		return (localStorage.getItem("onboardingDone") == "false" ||
			localStorage.getItem("onboardingDone") === null)
	};

	function discoverUserNotOnboarded () {
		// uses local storage to see if user onboarded
		return (localStorage.getItem("discoveronboardingDone") == "false" ||
			localStorage.getItem("discoveronboardingDone") === null)
	};

	Template.artistBox.events({
		'click .image': function (e) {
			loadArtist(this);
			setSelected($(e.target).parent().index()+1);
			Session.set("score", Session.get("score")+1);
		}
	});

	Template.score.clicks = function () {
		return Session.get("score");
	}

	Template.splashScreen.events({
		'click button[name=start]': function () {
			proceedFromStart();
		},

		'click .chooseCustom':function () {
			Session.set("showArtistPicker", true);
		}

	});

	Template.spotifyControls.songPaused = function () {
		return Session.get("songPaused");
	}

	Template.spotifyControls.songAdded = function () {
		var s = Session.get("songAdded");

		if(s){
			return s.song == Session.get("playingsong").id;
		}
	}

	Template.shareArtist.sharing = function () {
		return Session.get("shareArtist");
	};

	Template.shareArtist.events({
		'click .share-button': function () {
			Session.set("shareArtist", true);
		},
		'blur input.artist-link':function () {
			Session.set("shareArtist", false);
		}
	});

	Template.musicControls.events({
		'click .next-song': function () {
			playNext();
		},
		'click .play-song':function (e) {
			if (audio.paused == true) {
				audio.play();
				Session.set("songPaused", false);
			};
		},
		'click .pause-song':function (e) {
			if (audio.paused == false) {
				audio.pause();
				Session.set("songPaused", true);
			};
		}
	});



}