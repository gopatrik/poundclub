
if (Meteor.isClient) {
	Meteor.startup(function () {
	
		



		Session.set("finalScore", 1000);


		Template.toplist.finalScore = function () {
			return Session.get("finalScore");
		};

		Template.toplist.events = {
		    'click button[name=submitYo]': function () {
			    var yoName = document.getElementById("yoText").value;


			    $.ajax({
			    	type: "POST",
				    url: 'http://api.justyo.co/yo/',
				    data: 'api_token=fce99102-c646-b2f4-b1bc-ae21530fd23c&username=' + yoName,
				    success: function (response) {

				       alert('yo?');
		   			}, error: function (response) {
		   				
		   				console.log(response);
		   				alert('sfk,fm')
		   			}
				});

		    }
		};

	});
}



if (Meteor.isServer) {
}