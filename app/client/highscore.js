if (Meteor.isClient) {
	Meteor.startup(function () {
		Session.set("score", 0);
	});
	
	Template.toplist.finalScore = function () {
		return Session.get("score");
	};

	Template.toplist.events = {
	    'submit form.yo': function (e) {
		    var score = Session.get("score");
			var yoName = $("#yoText").val();

			Highscores.insert({
				score: score,
				name: yoName,
				start: window.startArtistId,
				goal: window.goalArtistId
			});

			console.log(score, yoName, window.startArtistId, window.goalArtistId);

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

	Template.highscoreList.highscore = function () {

		return Highscores.find({start: window.startArtistId, goal: window.goalArtistId});
	}
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