var args = $.args,
    TAG = "DRWC",
    app = require("core"),
    ctrlShortCode = require("ctrlShortCode"),
    analyticsHandler = require("analyticsHandler"),
    logger = require("logger"),
    controller;

function init() {

	var strings = Alloy.Globals.strings;

	setTitle(args.title || strings[args.titleid || ""] || "");

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
			setRightNavButton(child);
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
		analyticsHandler : analyticsHandler,
		// crashreporter : require("crashreporter"),
		contentView : $.window,
		window : $.window,
		setTitle : setTitle,
		showNavBar : showNavBar,
		hideNavBar : hideNavBar,
		setRightNavButton : setRightNavButton,
		ctrlShortCode : $.ctrlShortCode
	});

	logger.debug(TAG, "init", $.ctrlShortCode);

	controller.init && controller.init();

	controller.setParentView && controller.setParentView($.window);

	if (Ti.App.accessibilityEnabled)
		Ti.App.addEventListener("keyboardframechanged", scrollOnKeyboardEvent);
}

function scrollOnKeyboardEvent(e) {
	var scroller = controller.getTopLevelViews()[0];
	if (scroller.rect && scroller.rect.height) {		
		scroller.height = parseInt(scroller.rect.height) + "dp";
		scroller.scrollToBottom && scroller.scrollToBottom();
	};
}

function requestTitleControlFocus() {
	controller.uihelper.requestViewFocus($.window.titleControl);
}

function focus(e) {
	logger.debug(TAG, "focus", $.ctrlShortCode);
	requestTitleControlFocus();
	controller.focus && controller.focus();
}

function blur(e) {
	logger.debug(TAG, "blur", $.ctrlShortCode);
	controller.blur && controller.blur();
}

function terminate(e) {
	logger.debug(TAG, "terminate", $.ctrlShortCode);
	controller.terminate && controller.terminate();
	if (Ti.App.accessibilityEnabled)
		Ti.App.removeEventListener("keyboardframechanged", scrollOnKeyboardEvent);
}

function didClickLeftNavView(e) {
	if (!controller.backButtonHandler || !controller.backButtonHandler()) {
		app.navigator.close();
	}
}

function setTitle(title) {
	if(title == "Home" && (Alloy.CFG.homescreen_template_banner_below === "homescreenTemplateBannerBelow")) {
		$.titleControl.text = "";
	} else{
		$.titleControl.text = title;
	}
}

function showNavBar(animated) {
	$.window.showNavBar({
		animated : _.isUndefined(animated) ? true : false
	});
}

function hideNavBar(animated) {
	$.window.hideNavBar({
		animated : _.isUndefined(animated) ? true : false
	});
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
	analyticsHandler.handleEvent($.ctrlShortCode, e);
}

_.extend($, {
	init : init,
	blur : blur,
	focus : focus,
	ctrlPath : args.ctrl,
	requestTitleControlFocus : requestTitleControlFocus,
	ctrlShortCode : ctrlShortCode[args.ctrl]
});
