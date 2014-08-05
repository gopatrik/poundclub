Router.configure({
	layoutTemplate: 'main'
});

Router.map(function() {
	this.route('home', {
		path: '/',
		template:'index'
	});
});


if (Meteor.isClient) {
  Template.index.rendered = function () {
  	$.ajax({
  	    url: 'https://api.spotify.com/v1/albums/1fgtiyeUDIoUayYbwroqVH',
  	    success: function (response) {
  	        console.log(response);
  	    }
  	});
  };
}

if (Meteor.isServer) {
}
