if(Meteor.isServer){
	Meteor.methods({
		enterEmail:function (email) {
		  Emails.insert({mail:email});
		}
	});
}