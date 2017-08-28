var TAG = "UIHE",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    app = require("core"),
    config = require("config"),
    utilities = require("utilities"),
    logger = require("logger"),
    analyticsHandler = require("analyticsHandler"),
    moment = require("alloy/moment");

if (OS_IOS) {
 	var TiTouchId = require("com.mscripts.mscriptstouchid");
}

var TouchIDHelper = {


	deviceCanAuthenticate : function() {
		var result = false;
		Ti.API.info(JSON.stringify(TiTouchId));
		if (OS_IOS) {
		 	var canAuthenticate = TiTouchId.deviceCanAuthenticate();
		 	Ti.API.info("Can Authenticate Value is   " + JSON.stringify(canAuthenticate) )

		 	if (canAuthenticate.canAuthenticate === true) {
		 		result = true;
		 	}

		}

		return result;
	},


	authenticateOnlyPasscode : function(successCallback, failureCallback) {
		var result = false;

		
		TiTouchId.authenticateOnlyPasscode({
			reason : "Touch ID authentication failed.",
			reason :  "Please use touch ID to log in.",
 			callback : function(tIDResp) {

 				if( ! tIDResp.error) {
 					Ti.API.info("no error in TID.  resp = " + JSON.stringify(tIDResp));
	 				setTimeout( function(){

						successCallback();
						return;

 						//touchIDAuth(tIDResp, itemObj);
 					},0);
 				} else {
 					Ti.API.info("YES ERROR in TID.  resp = " + JSON.stringify(tIDResp));
 					failureCallback();
 				}
			} 				
 		});
	},
	
	authenticate : function(successCallback, failureCallback) {
		var result = false;

		
		TiTouchId.authenticate({
			reason : "Touch ID authentication failed.",
			reason :  "Please use touch ID to log in.",
 			callback : function(tIDResp) {

 				if( ! tIDResp.error) {
 					Ti.API.info("no error in TID.  resp = " + JSON.stringify(tIDResp));
	 				setTimeout( function(){

						successCallback();
						return;

 						//touchIDAuth(tIDResp, itemObj);
 					},0);
 				} else {
 					Ti.API.info("YES ERROR in TID.  resp = " + JSON.stringify(tIDResp));
 					failureCallback();
 				}
			} 				
 		});
	}
};

module.exports = TouchIDHelper;
