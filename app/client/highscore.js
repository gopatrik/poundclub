if (Meteor.isClient) {
	Meteor.startup(function () {
	
	




		Session.set("finalScore", 1000);
		Session.set("tag", 'username');
		Session.set("startingArtistId", '12345');
		Session.set("endingArtistId", '54321');


		Template.toplist.finalScore = function () {
			return Session.get("finalScore");
		};

		Template.toplist.events = {

			


		    'submit form.yo': function (e) {

		    var score = Session.get("finalScore");
			var yoName = $("#yoText").val();
			var id1 = Session.get("startingArtistId");
			var id2 = Session.get("endingArtistId");



			Highscores.insert({score: score, name: yoName, id1: id1, id2: id2 });

	    	e.preventDefault();

		    $.ajax({
		    	type: "POST",
			    url: 'http://api.justyo.co/yo/',
			    data: 'api_token=797471a2-1e3f-0e8e-ee3d-342bf3b86f43&username=' + yoName,
			    success: function (response) {
			    	//do nothing
	   			}
			});
		    }
		};

	});
}


if (Meteor.isServer) {
	Meteor.methods({
		insertHighscore: function (object) {
			Highscores.insert(object, function (e,t) {
				console.log(e,t);
			});
		}
	});
}