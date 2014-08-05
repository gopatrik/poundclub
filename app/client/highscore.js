
Highscores = new Meteor.Collection('highscores');


if (Meteor.isClient) {
	Meteor.startup(function () {
	
	





		Session.set("finalScore", 1000);


		Template.toplist.finalScore = function () {
			return Session.get("finalScore");
		};
		
		Template.toplist.events = {
		    'submit form.yo': function (e) {
		    	e.preventDefault();
			    var yoName = $("#yoText").val();

			    console.log(yoName)


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