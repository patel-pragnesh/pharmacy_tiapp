/**
 * The main app singleton used throughout the app.  This singleton
 * can manage your navigation flow, special events that happen throughout
 * the app lifecycle, etc.
 *
 * It's important to understand that this should mainly be a simple app singleton
 * for managing global things throughout your app.  i.e. If you want to sanitize
 * some html, you shouldn't put a function to handle that here.
 *
 * @class core
 * @singleton
 */

var App = {

	/**
	 * flag that tells whether there are any updates to be applied
	 */
	canReload : false,

	/**
	 * Device information, some come from the Ti API calls and can be referenced
	 * from here so multiple bridge calls aren't necessary, others generated here
	 * for ease of calculations and such.
	 *
	 * @type {Object}
	 * @param {String} version The version of the OS
	 * @param {Number} versionMajor The major version of the OS
	 * @param {Number} versionMinor The minor version of the OS
	 * @param {Number} width The width of the device screen
	 * @param {Number} height The height of the device screen
	 * @param {Number} dpi The DPI of the device screen
	 * @param {String} orientation The device orientation, either "landscape" or "portrait"
	 * @param {String} statusBarOrientation A Ti.UI orientation value
	 */
	device : {
		platform : OS_IOS ? "ios" : "android",
		version : Ti.Platform.version,
		versionMajor : parseInt(Ti.Platform.version.split(".")[0], 10),
		versionMinor : parseInt(Ti.Platform.version.split(".")[1], 10),
		width : null,
		height : null,
		dpi : Ti.Platform.displayCaps.dpi,
		logicalDensityFactor : OS_ANDROID ? Ti.Platform.displayCaps.logicalDensityFactor : Ti.Platform.displayCaps.dpi / 160,
		orientation : Ti.Gesture.orientation == Ti.UI.LANDSCAPE_LEFT || Ti.Gesture.orientation == Ti.UI.LANDSCAPE_RIGHT ? "landscape" : "portrait"
	},

	/**
	 * The navigator object which handles all navigation
	 * @type {Object}
	 */
	navigator : {},

	/**
	 * The drawer used in app
	 * @type {Object|Boolean}
	 */
	drawer : false,

	/**
	 * The navigationWindow used in the app (iOS only)
	 * @type {Object|Boolean}
	 */
	navigationWindow : false,

	/**
	 * The rootWindow used in the app (A view on Android)
	 * @type {Object|Boolean}
	 */
	rootWindow : false,

	/**
	 * Sets up the app singleton and all it's child dependencies.
	 * **NOTE: This should only be fired only once.**
	 */
	init : function(_params) {

		// Get device dimensions
		App.getDeviceDimensions();

		if (_.has(_params, "drawer")) {
			App.drawer = _params.drawer;
		}

		if (_.has(_params, "rootWindow")) {
			App.rootWindow = _params.rootWindow;
		}

		if (_.has(_params, "navigationWindow")) {
			App.navigationWindow = _params.navigationWindow;
		}

		// Global system Events
		Ti.Network.addEventListener("change", App.networkChange);
		Ti.App.addEventListener("pause", App.exit);
		Ti.App.addEventListener("close", App.exit);
		Ti.App.addEventListener("resumed", App.resume);
		Ti.Gesture.addEventListener("orientationchange", App.orientationChange);

		if (_.has(_params, "type")) {
			App.setNavigator(_params.type);
		}
	},

	/**
	 * Unset the app singleton and all it's child dependencies.
	 * **NOTE: This should only be fired only once after init.**
	 */
	terminate : function() {

		// Global system Events
		Ti.Network.removeEventListener("change", App.networkChange);
		Ti.App.removeEventListener("pause", App.exit);
		Ti.App.removeEventListener("close", App.exit);
		Ti.App.removeEventListener("resumed", App.resume);
		Ti.Gesture.removeEventListener("orientationchange", App.orientationChange);

		App.navigator = {};
		App.drawer = false;
		App.navigationWindow = false;
		App.rootWindow = false;
	},

	/**
	 * initiate the navigator object
	 * @param {String} _type type of navigator
	 */
	setNavigator : function(_type) {
		// Require in the navigation module
		App.navigator = require(String(_type).concat("/navigation"))({
			navigationWindow : App.navigationWindow,
			rootWindow : App.rootWindow,
			drawer : App.drawer,
			device : App.device
		});
	},

	/**
	 * handles the async update
	 */
	update : function() {
		App.canReload = true;
		require("config").updateResources(App.promptAndReloadConfig);
	},

	promptAndReloadConfig : function() {
		require("dialog").show({
			title : Alloy.Globals.strings.titleUpdates,
			message : Alloy.CFG.forceReloadAfterUpdate ? Alloy.Globals.strings.msgAppUpdatedForceReload : Alloy.Globals.strings.msgAppUpdatedReload,
			buttonNames : Alloy.CFG.forceReloadAfterUpdate ? [Alloy.Globals.strings.strOK] : [Alloy.Globals.strings.btnYes, Alloy.Globals.strings.btnNo],
			cancelIndex : Alloy.CFG.forceReloadAfterUpdate ? -1 : 1,
			success : App.reloadConfig
		});
	},

	reloadConfig : function() {
		if (App.canReload) {
			App.canReload = false;
			require("config").load(App.navigator.resetNavigator);
		}
	},

	/**
	 * Global network event handler
	 * @param {Object} _event Standard Ti callback
	 */
	networkChange : function(_event) {

	},

	/**
	 * Exit event observer
	 * @param {Object} _event Standard Ti callback
	 */
	exit : function(_event) {

	},

	/**
	 * Resume event observer
	 * @param {Object} _event Standard Ti callback
	 */
	resume : function(_event) {

	},

	/**
	 * Handle the orientation change event callback
	 * @param {Object} _event Standard Ti Callback
	 */
	orientationChange : function(_event) {

		// Ignore face-up, face-down and unknown orientation
		if (_event.orientation === Titanium.UI.FACE_UP || _event.orientation === Titanium.UI.FACE_DOWN || _event.orientation === Titanium.UI.UNKNOWN) {
			return;
		}

		App.device.orientation = _event.source.isLandscape() ? "landscape" : "portrait";

		// Get device dimensions
		App.getDeviceDimensions();

		/**
		 * Fires an event for orientation change handling throughout the app
		 * @event orientationChange
		 */
		Ti.App.fireEvent("orientationChange", {
			orientation : App.device.orientation
		});
	},

	/**
	 * Determines the device dimensions
	 * @return {Object} Returns the new values of the new {@link core.device.width} & {@link core.device.height} settings
	 */
	getDeviceDimensions : function() {

		// Set device height and width based on orientation
		switch(App.device.orientation) {
		case "portrait":
			App.device.width = Ti.Platform.displayCaps.platformWidth > Ti.Platform.displayCaps.platformHeight ? Ti.Platform.displayCaps.platformHeight : Ti.Platform.displayCaps.platformWidth;
			App.device.height = Ti.Platform.displayCaps.platformWidth > Ti.Platform.displayCaps.platformHeight ? Ti.Platform.displayCaps.platformWidth : Ti.Platform.displayCaps.platformHeight;
			break;
		case "landscape":
			App.device.width = Ti.Platform.displayCaps.platformWidth > Ti.Platform.displayCaps.platformHeight ? Ti.Platform.displayCaps.platformWidth : Ti.Platform.displayCaps.platformHeight;
			App.device.height = Ti.Platform.displayCaps.platformWidth > Ti.Platform.displayCaps.platformHeight ? Ti.Platform.displayCaps.platformHeight : Ti.Platform.displayCaps.platformWidth;
			break;
		}

		// Convert dimensions from DP to PX for Android
		if (OS_ANDROID) {
			App.device.width /= App.device.logicalDensityFactor;
			App.device.height /= App.device.logicalDensityFactor;
		}

		return {
			width : App.device.width,
			height : App.device.height
		};
	}
};

module.exports = App;
