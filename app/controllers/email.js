var args = arguments[0] || {},
    app = require("core"),
    authenticator = require("authenticator");


function init() {
	$.emailTxt.setValue(args.email || $.strings.strNotAvailable);
	var len = $.emailTxt.getValue().length;
	$.emailTxt.setSelection(0, len);
}

function didClickDone() {
	var email = $.emailTxt.getValue();
	if (!email) {
		$.uihelper.showDialog({
			message : Alloy.Globals.strings.registerValEmail
		});
		return;
	}
	if (!$.utilities.validateEmail(email)) {
		$.uihelper.showDialog({
			message : Alloy.Globals.strings.registerValEmailInvalid
		});
		return;
	}
	/**
	 * to do - call API patient/Update
	 */
	$.http.request({
		method : "patient_update",
		params : {
			feature_code : "THXXX",
			data : [{
				patient : {
					email : $.emailTxt.getValue()
				}
			}]
		},
		success : didUpdateEmail
	});
}

function didUpdateEmail() {
	authenticator.updatePreferences({"email_address":$.emailTxt.getValue()}, {
		success : handleClose
	});
}

function handleClose(){
	$.uihelper.showDialog({
		message : $.strings.msgAccountEmailVerification,
		buttonNames : [$.strings.dialogBtnOK],
		success : function() {
			app.navigator.close();
		}
	});
}

exports.init = init;
