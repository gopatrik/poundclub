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
	  	$.ajax({
	  	    url: 'https://api.spotify.com/v1/artists/'+artists["jonsi"].id,
	  	    success: function (response) {

	  	        Session.set("dump", response);
	  	    }
	  	});


	  	$.ajax({
	  	    url: 'https://api.spotify.com/v1/artists/'+artists["jonsi"].id+'/related-artists',
	  	    success: function (response) {
	  	        Session.set("related", response);
	  	    }
	  	});


	});

  Template.index.dump = function () {
  	return Session.get("dump");
  };

  Template.index.related = function () {
  	return Session.get("related");
  };

}



if (Meteor.isServer) {
}
