var args = arguments[0] || {},
    TAG = "DRWC",
    app = require("core"),
    analytics = require("analytics"),
    ctrlShortCode = require("ctrlShortCode"),
    logger = require("logger"),
    rightNavItem,
    controller;

function init() {

	var strings = Alloy.Globals.strings;

	$.window.title = args.title || strings[args.titleid || ""] || "";

	/**
	 *  let the new controller know where it is coming from
	 *  through the origin parameter
	 */
	var ctrlArguments = args.ctrlArguments || {};
	ctrlArguments.origin = (app.navigator.controllers[app.navigator.controllers.length - 1] || {}).ctrlPath;
	controller = Alloy.createController(args.ctrl, ctrlArguments);

	_.each(controller.getTopLevelViews(), function(child) {
		if (child.__iamalloy) {
			child = child.getView();
		}
		if (!child) {
			return;
		}
		switch(child.role) {
		case "ignore":
			//just ignore
			break;
		case "rightNavButton":
			rightNavItem = child;
			break;
		default:
			$.window.add(child);
		}
	});

	_.extend(controller, {
		app : app,
		strings : strings,
		logger : logger,
		http : require("requestwrapper"),
		httpClient : require("http"),
		utilities : require("utilities"),
		uihelper : require("uihelper"),
		analytics : analytics,
		crashreporter : require("crashreporter"),
		window : $.window,
		setTitle : setTitle,
		showNavBar : showNavBar,
		hideNavBar : hideNavBar,
		setRightNavButton : setRightNavButton
	});

	logger.debug(TAG, "init", $.ctrlShortCode);

	controller.init && controller.init();

	controller.setParentView && controller.setParentView($.window);
}

function didOpen(e) {

	$.actionBar = $.window.getActivity().actionBar;

	if (rightNavItem) {
		setRightNavButton(rightNavItem);
	}

	if (args.navBarHidden) {
		hideNavBar();
	}

	focus();
}

function focus(e) {
	logger.debug(TAG, "focus", $.ctrlShortCode);
	controller.focus && controller.focus();
}

function blur(e) {
	logger.debug(TAG, "blur", $.ctrlShortCode);
	controller.blur && controller.blur();
}

function terminate(e) {
	logger.debug(TAG, "terminate", $.ctrlShortCode);
	controller.terminate && controller.terminate();
}

function didClickLeftNavView(e) {
	logger.debug(TAG, "backButtonHandler", $.ctrlShortCode);
	if (!controller.backButtonHandler || !controller.backButtonHandler()) {
		app.navigator.close(1, e && e.source == $.window);
	}
}

function setTitle(title) {
	$.window.title = title;
	$.actionBar.setTitleAttributes(_.extend({
		title : title
	}, Alloy.TSS.Window.titleAttributes));
}

function showNavBar() {
	$.actionBar.show();
}

function hideNavBar() {
	$.actionBar.hide();
}

function setRightNavButton(view) {
	var activity = $.window.getActivity();
	activity.onCreateOptionsMenu = function(e) {
		var menu = e.menu;
		menu.clear();
		if (view) {
			view.addEventListener("click", handleEvent);
			$.menuItem = menu.add({
				actionView : view,
				visible : false,
				showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS
			});
			setTimeout(function() {
				$.menuItem.setVisible(true);
			}, 150);
		}
	};
	activity.invalidateOptionsMenu();
}

function handleEvent(e) {
	analytics.handleEvent($.ctrlShortCode, e);
}

_.extend($, {
	init : init,
	blur : blur,
	focus : focus,
	ctrlPath : args.ctrl,
	ctrlShortCode : ctrlShortCode[args.ctrl]
});
