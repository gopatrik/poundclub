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
		template:'index'
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
	});

	function fetchActiveArtist(artistId) {
		$.ajax({
		    url: 'https://api.spotify.com/v1/artists/'+artistId,
		    success: function (response) {

		        Session.set("artist", response);
		        Session.set("artistImage", response.images[0].url);
		    }
		});
	}

	function fetchRelatedArtists(artistId) {
	  	$.ajax({
	  	    url: 'https://api.spotify.com/v1/artists/'+artistId+'/related-artists',
	  	    success: function (response) {
	  	        Session.set("related", response.artists.slice(0,5));
	  	    }
	  	});
	}

	function getTopTrackFromArtist (artistId) {
		$.ajax({
	  	    url: 'https://api.spotify.com/v1/artists/' + artistId + '/top-tracks?country=SE',
	  	    success: function (response) {
	  	    	// console.log(response.tracks[0].preview_url);

	  	    	// var audio = new Audio(response.tracks[0].preview_url);
	  	    	// audio.play();
	  	        // Session.set("toptrack", response.tracks[0].preview_url);
	  	    }
	  	});
	}

	Template.main.artistImage = function () {
		return Session.get("artistImage");
	}

	

	Template.index.artist = function () {
		return Session.get("artist");
	};

	Template.index.related = function () {
		return Session.get("related");
	};

	Template.index.events({
		'click ul.related-artists li': function () {
			fetchActiveArtist(this.id);
			fetchRelatedArtists(this.id);
			getTopTrackFromArtist(this.id);
		}
	});

}



if (Meteor.isServer) {
}
