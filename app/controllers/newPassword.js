var args = $.args,
    app = require("core"),
    uihelper = require("uihelper"),
    http = require("requestwrapper"),
    utilities = require("utilities");

function init() {
	$.userLbl.text = String.format(Alloy.Globals.strings.strHi, args.name || "");
	var iDict = {};
	iDict.accessibilityLabel = Alloy.Globals.strings.lblShowPassword;
	$.toggleSwt.applyProperties(iDict);
}

function didClickDone(e) {
	var password = $.passwordTxt.getValue();
	if (!password) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.valPasswordRequired
		});
		return;
	}
	if (!utilities.validatePassword(password)) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.msgPasswordTips
		});
		return;
	}
	http.request({
		method : "patients_new_password",
		data : {
			data : [{
				patient : {
					user_name : "",
					email_address : "",
					password : password
				}
			}]
		},
		success : didAuthenticate
	});
}

function didAuthenticate(result) {
	uihelper.showDialog({
		title : Alloy.Globals.strings.titleSuccess,
		message : result.message,
		success : function() {
			app.navigator.closeToRoot();
		}
	});
}

function didToggle(e) {
	$.passwordTxt.setPasswordMask(!e.value);
}

function handleScroll(e) {
	$.scrollView.canCancelEvents = e.value;
}

exports.init = init;

