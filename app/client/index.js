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

	function setActiveArtist(artist){
		Session.set("artist", artist);
		Session.set("artistImage", artist.images[0].url);
	}

	Template.index.events({
		'click ul.related-artists li': function () {
			setActiveArtist(this)
			fetchRelatedArtists(this.id);
			getTopTrackFromArtist(this.id);
		}
	});

}



if (Meteor.isServer) {
}
