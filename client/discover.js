if(Meteor.isClient){
	Template.discover.rendered = function () {
		Meteor.functions.setController(Meteor.controllers.gameController);
	};
}