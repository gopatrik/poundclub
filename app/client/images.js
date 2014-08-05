if (Meteor.isClient) {
	Meteor.startup(function () {
	  	
	
		var service = "https://datamarket.accesscontrol.windows.net/v2/OAuth2-13";
		var clientId = "PoundClub";
		var secret = "x4JR/C4ccicqAN8nz4pQOAC1Qz1QgsGvntpF8e6fBBw="
		var token = null;
		var tokenEnc = null;
		var request = null;
		var response = null;
		var scope = "http://music.xboxlive.com";
		var grantType = "client_credentials";
		var postData = "client_id=" + clientId + "&client_secret=" + secret + "&scope=" + scope + "&grant_type=" + grantType;

		var exampleArtist = "24540000-0200-11DB-89CA-0019B92A3933"


}



