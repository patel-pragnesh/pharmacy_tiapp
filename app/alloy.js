(function() {

	/**
	 *  common js modules
	 *  to prevent empty objects being returned
	 *  this is recommended
	 */
	require("alloy/moment-timezone");
	/**
	 * https://github.com/moment/moment-timezone/issues/138
	 * moment-timezone yet to support determining
	 * current time zone of device
	 * till then jstz is good alternative
	 */
	require("alloy/jstz");
	require("com.scule");
	require("utilities");
	require("encryptionUtil");
	require("com.scule.tiencrypted");
	require("core");
	require("resources");
	require("config");
	require("localization");
	require("uihelper");
	require("logger");
	require("http");
	require("requestwrapper");
	require("authenticator");
	require("apm");
	require("analytics");
	require("barcode");
	require("notificationHandler");

	//variables
	Alloy.Globals.Map = require("ti.map");
	Alloy.Globals.spinnerImages = [];
	Alloy.Globals.isLoggedIn = false;
	Alloy.Globals.isSwipeInProgress = false;
	Alloy.Globals.isVirtualDevice = Ti.Platform.model === "Simulator" || Ti.Platform.model.indexOf("sdk") !== -1;
	Alloy.Globals.filterAttribute = OS_IOS ? "filterableText" : "title";

	//load spinner images
	for (var i = 1; i <= 161; i++) {
		Alloy.Globals.spinnerImages.push("/images/activityindicator/layer_" + i + ".png");
	}

	/**
	 * Alloy.createModel / Alloy.createCollection can be used only when we need to get / set data in persistent storage (sqlite)
	 * Backbone is directly accessed for temporary storage & to utilize the backbone events
	 */
	//collections
	Alloy.Collections.menuItems = new Backbone.Collection();
	Alloy.Collections.banners = new Backbone.Collection();
	Alloy.Collections.stores = new Backbone.Collection();
	Alloy.Collections.prescriptions = new Backbone.Collection();
	Alloy.Collections.doctors = new Backbone.Collection();
	Alloy.Collections.termsAndConditions = new Backbone.Collection();

	//models
	Alloy.Models.appload = new Backbone.Model();
	Alloy.Models.template = new Backbone.Model();
	Alloy.Models.patient = new Backbone.Model();
	Alloy.Models.states = new Backbone.Model();
	Alloy.Models.storeOriginal = new Backbone.Model();
	Alloy.Models.sortOrderPreferences = new Backbone.Model();
	Alloy.Models.pickupModes = new Backbone.Model();
	Alloy.Models.language = new Backbone.Model();
	Alloy.Models.timeZone = new Backbone.Model();

	//events
	Alloy.Models.patient.on("change:session_id", function didChange() {
		//whether it has a valid session id
		Alloy.Globals.isLoggedIn = _.isString(Alloy.Models.patient.get("session_id"));
	});

})();
