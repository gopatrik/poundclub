
Router.configure({
	layoutTemplate: 'main'
});

var gameController = function () {
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
			case 38: // up
			case 40: // down
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
		}
	}
};

var splashController = function () {
	// start by listening for up key
	document.onkeydown = function KeyPressed( e ) {
		var key = ( window.event ) ? event.keyCode : e.keyCode;
		if(key == 38){
			proceedFromStart();
		}
	};
}

var noController = function () {
	document.onkeydown = function KeyPressed( e ) {
		// 
	};
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

				
				fetchActiveArtist(element.start);
				getTopTrackFromArtist(element.start, true)
				fetchRelatedArtists(element.start, function () {
					Session.set("related", Session.get("related-fetched"));
				});

				fetchStartGoalArtists(element.start, element.goal);
			};

			setController(splashController);
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

			fetchActiveArtist(this.params.artistId1);
			getTopTrackFromArtist (this.params.artistId1, true)
			fetchRelatedArtists(this.params.artistId1, function () {
				Session.set("related", Session.get("related-fetched"));
			});

			fetchStartGoalArtists(this.params.artistId1, this.params.artistId2);
			setController(splashController);

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
});

var selectedRelatedArtistIndex = 3;

if (Meteor.isClient) {
	Meteor.startup(function () {
		
		Session.set("splash", true);
		Session.set("showArtistPicker", false);
		setController(splashController);
	});

	UI.registerHelper('startArtist', function() {
		return Session.get("startArtist");
	});

	UI.registerHelper('goalArtist', function() {
		return Session.get("goalArtist");
	});

	function fetchStartGoalArtists(startId, goalId){
		$.ajax({
			url: 'https://api.spotify.com/v1/artists/'+startId,
			success: function (response) {
				Session.set("startArtist", response);
			}
		});

		$.ajax({
			url: 'https://api.spotify.com/v1/artists/'+goalId,
			success: function (response) {
				Session.set("goalArtist", response);
			}
		});
	};

	function fetchActiveArtist(artistId) {
		$.ajax({
			url: 'https://api.spotify.com/v1/artists/'+artistId,
			success: function (response) {

				// Session.set("artist", response);
				// Session.set("artistImage", response.images[0].url);
				setActiveArtist(response);
			}
		});
	}

	function fetchRelatedArtists(artistId, callback) {
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
				// Session.set("related-fetched", relatedArtists);
				Session.set("related", relatedArtists);
				// if(callback){
				// 	callback();
				// };
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
			setController(noController);
			Router.go('highscore');
		}
	}

	var audio;
	function getTopTrackFromArtist (artistId, fadeIn) {
		$.ajax({
			url: 'https://api.spotify.com/v1/artists/' + artistId + '/top-tracks?country=SE',
			success: function (response) {
				// console.log(response.tracks[0].preview_url);
				if(audio){
					// audio.pause();
					$(audio).animate({volume:0}, 2000);
				}
				newAudio = new Audio(response.tracks[0].preview_url);
				newAudio.play();

				if(fadeIn){
					newAudio.volume = 0;
					$(newAudio).animate({volume:1}, 5000);
				}

				audio = newAudio;

				Session.set("playingsong", {name:response.tracks[0].name, id:response.tracks[0].id});
				// Session.set("toptrack", response.tracks[0].preview_url);
			}
		});
	}

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
		if(song)
		return song.name;
	}

	Template.index.onboarding = function(){
		return Session.get("onboarding");
	}

	Template.twitterHandles.random = function () {
		var handles = ["oscrse", "gopatrik"];
		return Math.floor(Math.random()*2) == 0 ? {one: handles[0], two: handles[1]} : {one: handles[1], two: handles[0]};
	}

	function setActiveArtist(artist){
		Session.set("artist", artist);
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

	function setController (controller) {
		controller();
	};

	// function desetController () {
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

	function loadArtist (artist) {

		Session.set("fetchingRelated", true);

		fetchRelatedArtists(artist.id);

		getTopTrackFromArtist(artist.id);

		setActiveArtist(artist)

	};

	var selectedArtistResultIndex = 0;
	Template.artistSearch.events({
		'keyup input[name=artistGoalSearchField]': function (e) {
			// console.log();
			var name = $(e.target).val();
			if(name.length > 0){
				fetchFirstArtist(name, function (response) {
					Session.set("goalArtistSearchResults", {results: response.artists.items.slice(0,4)});
				});
			}
		},
		'keyup input[name=artistStartSearchField]': function (e) {
			// console.log();
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
			setController(splashController);
			$(e.target).parent().children('ul.search-results').fadeOut();
		},
		'focus input[name=artistGoalSearchField], focus input[name=artistStartSearchField]': function (e) {
			setController(noController);
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
		}


		// 1 - go to onboarding
		if(userNotOnboarded()){
			Session.set("onboarding", true);
		}else{ //3 start game
			startGame();
		}

	};

	function startGame () {
		setController(gameController);
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



}