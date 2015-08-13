var args = arguments[0] || {},
    authenticator = require("authenticator");

function init() {
	$.uihelper.getImage("logo", $.logoImg);
	/**
	 * if auto login is enabled
	 * then auto populate the username and password
	 * behaviour can be controlled from theme flags
	 */
	if (authenticator.getAutoLoginEnabled()) {
		var data = authenticator.getData();
		$.usernameTxt.setValue(data.username);
		$.passwordTxt.setValue(data.password);
		$.autoLoginSwt.setValue(true);
	}

	/**
	 * after successful registration,
	 * auto populate username and password
	 */
	/**
	 * todo - show tooltip as per the requirement
	 */
	if (args.username && args.password) {
		$.usernameTxt.setValue(args.username);
		$.passwordTxt.setValue(args.password);
		$.autoLoginSwt.setValue(false);
	}
}

function didChangeToggle(e) {
	$.passwordTxt.setPasswordMask(!e.value);
}

function didChangeAutoLogin(e) {
	if (Alloy.CFG.auto_login_dialog_enabled && e.value) {
		$.uihelper.showDialog({
			message : $.strings.msgAutoLogin
		});
	}
}

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	if (nextItem && $[nextItem]) {
		$[nextItem].focus();
	}
}

function didClickLogin(e) {
	var username = $.usernameTxt.getValue(),
	    password = $.passwordTxt.getValue();
	if (!username) {
		$.uihelper.showDialog({
			message : $.strings.loginValUsername
		});
		return;
	}
	if (!password) {
		$.uihelper.showDialog({
			message : $.strings.loginValPassword
		});
		return;
	}
	if ($.utilities.isPhoneNumber(username)) {
		//yet to handle
	} else {
		authenticator.setAutoLoginEnabled($.autoLoginSwt.getValue());
		authenticator.init({
			username : username,
			password : password,
			success : didAuthenticate
		});
	}
}

function didAuthenticate() {
	/**
	 * First time login flow takes the uesr to HIPAA screen
	 */
	/**
	 * todo - remove this hardcoding. It was purely for testing
	 */
	/*args.showHIPAA=true;*/
	if (args.showHIPAA) {
		$.app.navigator.open({
			ctrl : "HIPAA",
			titleid : "titleHIPAAauthorization",
			stack : true,
			ctrlArguments : {
				familyAccounts : args.familyAccounts ? true : false
			}
		});
	} else {
		$.app.navigator.open(args.navigation || Alloy.Collections.menuItems.findWhere({
			landing_page : true
		}).toJSON());
	}
}

function didClickPassword(e) {

}

function didClickSignup(e) {
	$.app.navigator.open({
		ctrl : "register",
		stack : true
	});
}

exports.init = init;
