if (Meteor.isClient) {
	Meteor.startup(function () {
		Session.set("score", 0);
	});

	Template.toplist.finalScore = function () {
		return Session.get("score");
	};

	function sendYosToPeople(score){
		//get all db entries for artists
	

		var high = Highscores.find({start: window.startArtistId, goal: window.goalArtistId, score:{$gt: score}});
		
		//loop through those for and act on those with lower score
		var count = 0;
		high.forEach(function (userGame) {
			console.log(userGame.name);
			//Send yos to all users below score
			sendAYo(userGame.name);
 			count += 1;
		});
	};

	function sendAYo(yoName){
		$.ajax({
		    	type: "POST",
			    url: 'http://api.justyo.co/yo/',
			    data: 'api_token=797471a2-1e3f-0e8e-ee3d-342bf3b86f43&username=' + yoName,
			    success: function (response) {
			    	//do nothing
	   			}
			});
	}

	Template.toplist.events = {
	    'submit form.yo': function (e) {
			e.preventDefault();


		    var score = Session.get("score");
			var yoName = $("#yoText").val();

			Highscores.insert({
				score: score,
				name: yoName,
				start: window.startArtistId,
				goal: window.goalArtistId
			});
			sendAYo(yoName);

			sendYosToPeople(score);
		    
	    }
	};

	Template.highscoreList.events = {
	    'click .newGame': function (e) {
			e.preventDefault();
			
			Router.go('home');

	    }
	};

	Template.highscoreList.highscore = function () {
		return Highscores.find({start: window.startArtistId, goal: window.goalArtistId}, {sort: {score: 1}})
	}

	Template.highscoreList.rendered = function(){
  		(function(d, s, id) {
  			var js, fjs = d.getElementsByTagName(s)[0];
  			if (d.getElementById(id)) return;
  			js = d.createElement(s); js.id = id;
  			js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.0";
  			fjs.parentNode.insertBefore(js, fjs);
			}(document, 'script', 'facebook-jssdk'));
	};

!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');

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