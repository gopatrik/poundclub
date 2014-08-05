
Router.configure({
	layoutTemplate: 'main'
});

var artists = {
	'jonsi': {id:"3khg8RDB6nMuw34w1IHS6Y"},
	'The Black Keys': {id:"7mnBLXK823vNxN3UWB7Gfz"}
}


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

if (Meteor.isClient) {
	Meteor.startup(function () {
		fetchActiveArtist(artists["jonsi"].id);
		fetchRelatedArtists(artists["jonsi"].id);
		Session.set("splash", true);
		setSelected(1);
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

	function fetchRelatedArtists(artistId) {
	  	$.ajax({
	  	    url: 'https://api.spotify.com/v1/artists/'+artistId+'/related-artists',
	  	    success: function (response) {
	  	    	var relatedArtists = response.artists.slice(0,5);
	  	    	for (var i = relatedArtists.length - 1; i >= 0; i--) {
	  	    		relatedArtists[i]["coverImage"] = relatedArtists[i].images[1];
	  	    	};

	  	        Session.set("related", relatedArtists);
	  	    }
	  	});
	}
	var audio;
	function getTopTrackFromArtist (artistId) {
		$.ajax({
	  	    url: 'https://api.spotify.com/v1/artists/' + artistId + '/top-tracks?country=SE',
	  	    success: function (response) {
	  	    	// console.log(response.tracks[0].preview_url);

	  	    	if(audio){
	  	    		audio.pause();
	  	    	}
	  	    	audio = new Audio(response.tracks[0].preview_url);
	  	    	audio.play();

	  	    	Session.set("playingsong", response.tracks[0].name);
	  	        // Session.set("toptrack", response.tracks[0].preview_url);
	  	    }
	  	});
	}

	Template.index.splash = function () {
		return Session.get("splash");
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
	};


	var selectedIndex = 1;
	function setSelected (index) {
		$("ul.related-artists li:nth-child("+selectedIndex+") .image").removeClass("selected");

		var sbox = $("ul.related-artists li:nth-child("+index+") .image");
		sbox.addClass("selected");
		selectedIndex = index;

	}

	function loadArtist (artist) {
		if(Session.get("splash")){
			$('.splash').hide(200, function () {
				Session.set("splash", false);
				var titles = $('.titles');
				titles.removeClass('hide');
				titles.addClass('.fade-in-full')
			});

		};

		setActiveArtist(artist)
		fetchRelatedArtists(artist.id);
		getTopTrackFromArtist(artist.id);
	};

	Template.artistBox.events({
		'click .image': function (e) {
			loadArtist(this);
			setSelected($(e.target).parent().index()+1);
		}
	});

	

	// Template.main.events({
	// 	'keypress body': function () {
	// 		console.log("key");
	// 	}
	// });


	document.onkeydown = function KeyPressed( e )
	  {
	    var key = ( window.event ) ? event.keyCode : e.keyCode;

	    switch(key){
		    case 37: // left
		    	if(selectedIndex > 1){
		    		setSelected(selectedIndex - 1);
		    	}
		    	break;
		    case 39: // right
		    	if(selectedIndex < 5){
		    		setSelected(selectedIndex + 1);
		    	}
		    	break;
		    case 32: // space
		    case 38: // up
		    case 40: // down

				$("section.background").addClass('fade-out');
		    	$("ul.related-artists li:nth-child("+selectedIndex+") .artistBoxContainer").slideUp(100, function () {
		    		loadArtist(Session.get("related")[selectedIndex-1]);
					$("ul.related-artists li:nth-child("+selectedIndex+") .artistBoxContainer").fadeIn(400);
					$("section.background").removeClass('fade-out');
					$("section.background").removeClass('fade-in');
					$("section.background").addClass('fade-in');
		    	});
		    	break;
	    }
	  }

}