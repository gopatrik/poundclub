
if (Meteor.isClient) {
	Meteor.startup(function () {
	
		



		Session.set("finalScore", 1000);


		Template.toplist.finalScore = function () {
			return Session.get("finalScore");
		};
	});
}



if (Meteor.isServer) {
}