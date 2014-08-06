
Router.configure({
	layoutTemplate: 'main'
});

var artists = {
	'jonsi': {id:"3khg8RDB6nMuw34w1IHS6Y"},
	'The Black Keys': {id:"7mnBLXK823vNxN3UWB7Gfz"},
	'The White Stripes': {id:"4F84IBURUo98rz4r61KF70"}

}

window.startArtistId = artists["The Black Keys"].id;
window.goalArtistId = artists["The White Stripes"].id;


Router.map(function() {
	this.route('home', {
		path: '/',
		template:'index',
		waitOn: function () {
			return Meteor.subscribe('hello');
		}
	});

	this.route('highscore', {
		path: '/highscore',
		template:'toplist'
	});
});

var selectedIndex = 3;

if (Meteor.isClient) {
	Meteor.startup(function () {
		fetchActiveArtist(window.startArtistId);
		getTopTrackFromArtist (window.startArtistId, true)
		fetchRelatedArtists(window.startArtistId, function () {
			Session.set("related", Session.get("related-fetched"));
		});

		Session.set("splash", true);
	});

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
	  	    	var relatedArtists = response.artists.slice(0,5);
	  	    	for (var i = relatedArtists.length - 1; i >= 0; i--) {
	  	    		relatedArtists[i]["coverImage"] = relatedArtists[i].images[1];
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

	function checkWin(){
		console.log(Session.get("artist").id);
		if(Session.get("artist").id == window.goalArtistId){
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
	  	    	// newAudio.volume = 0;

	  	    	// $(newAudio).animate({volume: 100}, 1000)

	  	    	audio = newAudio;

	  	    	Session.set("playingsong", response.tracks[0].name);
	  	        // Session.set("toptrack", response.tracks[0].preview_url);
	  	    }
	  	});
	}

	Template.index.splash = function () {
		return Session.get("splash");
	};

	Template.index.rendered = function () {
		setSelected(selectedIndex);
	};

	Template.splasha.artist = function () {
		return Session.get("artist");
	};

	Template.main.artistImage = function () {
		return Session.get("artistImage");
	}

	Template.index.artist = function () {
		return Session.get("artist");
	};

	Template.index.related = function () {
		return Session.get("related");
	};

	Template.index.songname = function () {
		return Session.get("playingsong");
	}

	function setActiveArtist(artist){
		Session.set("artist", artist);
		Session.set("artistImage", artist.images[0].url);
		checkWin();
	};

	function setSelected (index) {
		$("ul.related-artists li:nth-child("+selectedIndex+") .artistBoxContainer").removeClass("selected");

		var sbox = $("ul.related-artists li:nth-child("+index+") .artistBoxContainer");
		sbox.addClass("selected");
		selectedIndex = index;

	}

	function hideSplash () {
			$('.splash').hide(200, function () {
				Session.set("splash", false);
				// var titles = $('.titles');
				// titles.removeClass('hide');
				titles.addClass('.fade-in-full')
			});
	}

	Template.missions.current = function () {
		return {start: window.startArtistId, goal:window.goalArtistId};
	}

	function loadArtist (artist) {

		Session.set("fetchingRelated", true);

		fetchRelatedArtists(artist.id);
		getTopTrackFromArtist(artist.id);
		// function  (argument) {

		setActiveArtist(artist)

		// $('ul.related-artists li:nth-child('+selectedIndex+') .image').addClass('swosh-out');
		// $("ul.related-artists").animate({

		// }, 200, "linear", function () {
		// 	if(!Session.get("fetchingRelated")){
		// 		Session.set("related", Session.get("related-fetched"));
		// 	}

		// })

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

	Template.splasha.events({
		'click button[name=start]': function () {
			console.log("asdas")
			hideSplash();
		}
	});

	document.onkeydown = function KeyPressed( e )
	  {
	    var key = ( window.event ) ? event.keyCode : e.keyCode;

	    switch(key){
		    case 37: // left
		    	if(selectedIndex > 1){
		    		setSelected(selectedIndex - 1);
		    	}else{
		    		setSelected(5);
		    	}
		    	break;
		    case 39: // right
		    	if(selectedIndex < 5){
		    		setSelected(selectedIndex + 1);
		    	}else{
		    		setSelected(1);
		    	}
		    	break;
		    case 32: // space
		    case 38: // up
		    case 40: // down
		    	Session.set("score", Session.get("score")+1);

				// $("section.background").addClass('fade-out');

				$("ul.related-artists li:nth-child("+selectedIndex+") .artistBoxContainer").addClass('move-up');

				setTimeout(function () {
					$("ul.related-artists").addClass('move-down');
					$("ul.related-artists li:nth-child("+selectedIndex+") .artistBoxContainer").removeClass('move-up');
					loadArtist(Session.get("related")[selectedIndex-1]);
					setTimeout(function () {
						$("ul.related-artists").removeClass('move-down');
						$("ul.related-artists").addClass('swosh-in');
					},200);
				},200);

		   //  	$("ul.related-artists li:nth-child("+selectedIndex+") .artistBoxContainer").slideUp(100, function () {
		   //  		loadArtist(Session.get("related")[selectedIndex-1]);
					// $("ul.related-artists li:nth-child("+selectedIndex+") .artistBoxContainer").fadeIn(400);
					// $("section.background").removeClass('fade-out');
					// $("section.background").removeClass('fade-in');
					// $("section.background").addClass('fade-in');
		   //  	});
		    	break;
	    }
	  }

}