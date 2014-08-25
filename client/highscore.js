if (Meteor.isClient) {
	Meteor.startup(function () {
		Session.set("score", 0);
		Session.set("submitted", false);

	});

	Template.toplist.finalScore = function () {
		return Session.get("score");
	};

	function sendYosToPeople(score){
		//get all db entries for artists
	

		var high = Highscores.find({start: Session.get("startArtist").id, goal: Session.get("goalArtist").id, score:{$gt: score}});
		
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
	};

	function sendASlackbot(){
		$.ajax({
	    	type: "POST",
		    url: 'https://pondle.slack.com/services/hooks/slackbot?token=zr0StqlBbppzPFFhQDlYUaXy&channel=%23general',
		    data: 'New highscore!',
		    success: function (response) {
		    	//do nothing
   			}
		});
	};

	Template.toplist.events({
		'submit form.yo': function (e) {
			e.preventDefault();
		    var score = Session.get("score");
			var yoName = $("#yoText").val();

			sendASlackbot();

			Highscores.insert({
				score: score,
				name: yoName,
				start: Session.get("startArtist").id,
				goal: Session.get("goalArtist").id
			});

			sendYosToPeople(score);

			Session.set("submitted", true);
		}
	});

	Template.toplist.events( {
	    'click .newGame': function (e) {
			e.preventDefault();
			Session.set("splash", true);
			Session.set("score", 0);
			Router.go('home');

	    }
	});

	Template.toplist.submitted = function () {
		return Session.get("submitted");
	};

	Template.highscoreList.highscore = function () {
		return Highscores.find({start: Session.get("startArtist").id, goal: Session.get("goalArtist").id}, {sort: {score: 1}})
	}

	Template.shareButtons.rendered = function(){
  		(function(d, s, id) {
  			var js, fjs = d.getElementsByTagName(s)[0];
  			if (d.getElementById(id)) return;
  			js = d.createElement(s); js.id = id;
  			js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.0";
  			fjs.parentNode.insertBefore(js, fjs);
			}(document, 'script', 'facebook-jssdk'));			

			!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');
	};

	Template.toplist.shareUrl = function () {
		return "http://www.theartisthunt.com";
	};

	Template.toplist.shareText = function () {
		return "Check out The Artist Hunt!";
	};
	
	Template.index.events = {
	    'click .startOver': function (e) {
			e.preventDefault();
			Session.set("splash", true);
			Session.set("score", 0);
			Router.go('home');

	    }
	};


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