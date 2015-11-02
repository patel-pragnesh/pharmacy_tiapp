var args = arguments[0] || {},
    TAG = "DRVC",
    app = require("core"),
    analytics = require("analytics"),
    ctrlShortCode = require("ctrlShortCode"),
    logger = require("logger"),
    controller;

function init() {

	var strings = Alloy.Globals.strings;

	$.window = app.navigator.rootWindow;

	setTitle(args.title || strings[args.titleid || ""] || "");

	if (args.navBarHidden) {
		hideNavBar();
	} else if (app.navigator.rootNavBarHidden) {
		showNavBar();
	}

	/**
	 *  let the new controller know where it is coming from
	 *  through the origin parameter
	 */
	var hasRightNavButton = false,
	    ctrlArguments = args.ctrlArguments || {};
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
			hasRightNavButton = true;
			setRightNavButton(child);
			break;
		case "contentView":
			$.contentView = child;
			break;
		default:
			if (!$.contentView) {
				$.contentView = $.UI.create("View", {
					id : "contentView"
				});
			}
			$.contentView.add(child);
		}
	});

	$.contentView.addEventListener("click", handleEvent);
	$.contentView.addEventListener("change", handleEvent);

	$.addTopLevelView($.contentView);

	if (!hasRightNavButton) {
		setRightNavButton();
	}

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

	controller.setParentView && controller.setParentView($.contentView);
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

function setTitle(title) {
	$.window.title = title;
}

function showNavBar(animated) {
	$.window.showNavBar({
		animated : _.isUndefined(animated) ? true : false
	});
	app.navigator.rootNavBarHidden = false;
}

function hideNavBar(animated) {
	$.window.hideNavBar({
		animated : _.isUndefined(animated) ? true : false
	});
	app.navigator.rootNavBarHidden = true;
}

function setRightNavButton(view) {
	if (view) {
		view.addEventListener("click", handleEvent);
	} else {
		view = Ti.UI.createView();
	}
	$.window.setRightNavButton(view);
}

function handleEvent(e) {
	analytics.handleEvent($.ctrlShortCode, e);
}

_.extend($, {
	init : init,
	blur : blur,
	focus : focus,
	terminate : terminate,
	ctrlPath : args.ctrl,
	ctrlShortCode : ctrlShortCode[args.ctrl]
});
