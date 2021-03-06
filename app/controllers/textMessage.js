var args = $.args,
    authenticator = require("authenticator"),
    flow = "",
	phone = args.phone,
	otp = args.otp;

function init() {

	var text = String.format(Alloy.Globals.strings.textMessageOtpLbl, args.otp);
	var attributedString = Ti.UI.createAttributedString({
		text : text,
		attributes : [{
			type : Ti.UI.ATTRIBUTE_FONT,
			value : {
				fontSize : "18dp"
			},
			range : [0, text.length]
		}, {
			type : Ti.UI.ATTRIBUTE_FONT,
			value : {
				fontFamily : "Bold",
				fontSize : "20dp"
			},
			range : [54, 1]
		}]
	});

	$.uihelper.getImage("child_add", $.txtSuccessImg);
	$.uihelper.getImage("fail", $.txtFailImg);

	if (args.txtCode === true) {
		if ($.args.txtMsgLbl)
			$.txtMsgLbl.attributedString = attributedString;
	}
}

function backButtonHandler() {
	flow = 'noReply';
	getPatient(goToHome);
}

function goToHome() {
	$.app.navigator.open({
		titleid : "titleHomePage",
		ctrl : "home",
		stack : false
	});
}

function skipClicked() {
	/**
	 * if you skip the verification, set the flag (is_mobile_verified) to 0.
	 */
	var currentPatient = Alloy.Collections.patients.findWhere({
		selected : true
	});
	currentPatient.set("is_mobile_verified", "0");

	goToHome();
}

function didNotReceiveClicked() {
	flow = 'noReply';
	getPatient(onFailure);
}

function onFailure() {
	$.app.navigator.open({
		titleid : "titleTextHelp",
		ctrl : "textMessage",
		stack : true,
		ctrlArguments : {
			"phone" : phone,
			"otp" : otp,
			"txtCode" : false,
			"txtMsgTitle" : false,
			"txtMsgLbl" : false,
			"signUpLbl" : false,
			"signUpTitle" : false,
			"txtHelpTitle" : true,
			"txtHelpLbl" : true,
			"replyTextMsgBtn" : false,
			"sendMeTextAgainSignUpBtn" : false,
			"sendMeTextAgainTextHelpBtn" : true,
			"skipNoTextMsgAttr" : true,
			"didNotReceiveTextAttr" : false,
			"stillReceiveTextAttr" : true,
			"checkPhoneAttr" : true,
			"txtNotReceiveTitle" : false,
			"txtNotReceiveLbl" : false,
			"txtNotReceiveBtn" : false,
			"skipTxtNotReceiveAttr" : false,
			"txtSuccessImg" : false,
			"txtFailImg" : true
		},
	});
}

function replyTextMessage() {
	flow = 'relpied';
	getPatient(didFailPatient);
}

function getPatient(passthrough) {
	$.http.request({
		method : "patient_get",
		success : didGetPatient,
		failure : passthrough
	});
}

function didReplied() {
	var currentPatient = Alloy.Collections.patients.findWhere({
		selected : true
	});
	authenticator.updateFamilyAccounts({
		success : function didUpdateFamilyAccounts() {
			if (args.remindersSettings || args.account) {
				if (currentPatient.get("mobile_number") !== "null" && currentPatient.get("is_mobile_verified") === "0") {
					$.app.navigator.close(2);
				} else {
					$.app.navigator.close(3);
				}
			} else {
				$.app.navigator.open({
					titleid : "titleHomePage",
					ctrl : "home",
					stack : false
				});
			}
		}
	});
}

function didFailPatient() {
	$.app.navigator.open({
		titleid : "titleTextMsgSignUp",
		ctrl : "textMessage",
		stack : true,
		ctrlArguments : {
			"phone" : phone,
			"otp" : otp,
			"txtCode" : true,
			"txtMsgTitle" : false,
			"txtMsgLbl" : false,
			"signUpLbl" : true,
			"signUpTitle" : true,
			"txtHelpTitle" : false,
			"txtHelpLbl" : false,
			"replyTextMsgBtn" : true,
			"sendMeTextAgainSignUpBtn" : true,
			"sendMeTextAgainTextHelpBtn" : false,
			"skipSignUpAttr" : true,
			"skipNoTextMsgAttr" : false,
			"didNotReceiveTextAttr" : false,
			"stillReceiveTextAttr" : false,
			"checkPhoneAttr" : false,
			"txtNotReceiveTitle" : false,
			"txtNotReceiveLbl" : false,
			"txtNotReceiveBtn" : false,
			"skipTxtNotReceiveAttr" : false,
			"txtSuccessImg" : false,
			"txtFailImg" : true
		},
	});
}

function didGetPatient(result) {
	var verified = result.data.patients.is_mobile_verified;
	if (parseInt(verified)) {
		$.uihelper.showDialog({
			message : flow === 'noReply' ? Alloy.Globals.strings.textMessageNoReplyMobileVerified : Alloy.Globals.strings.textMessageMobileVerified,
			success : didReplied
		});
	} else {
		if(flow !== 'noReply') {
			$.app.navigator.open({
				titleid : "titleTextMsgSignUp",
				ctrl : "textMessage",
				stack : true,
				ctrlArguments : {
					"phone" : phone,
					"otp" : otp,
					"txtCode" : true,
					"txtMsgTitle" : false,
					"txtMsgLbl" : false,
					"signUpLbl" : true,
					"signUpTitle" : true,
					"txtHelpTitle" : false,
					"txtHelpLbl" : false,
					"replyTextMsgBtn" : true,
					"sendMeTextAgainSignUpBtn" : true,
					"sendMeTextAgainTextHelpBtn" : false,
					"skipSignUpAttr" : true,
					"skipNoTextMsgAttr" : false,
					"didNotReceiveTextAttr" : false,
					"stillReceiveTextAttr" : false,
					"checkPhoneAttr" : false,
					"txtNotReceiveTitle" : false,
					"txtNotReceiveLbl" : false,
					"txtNotReceiveBtn" : false,
					"skipTxtNotReceiveAttr" : false,
					"txtSuccessImg" : false,
					"txtFailImg" : true
				},
			});
		} else {
			onFailure();
		}
	}
}

function sendTextSignUpMessage() {
	$.http.request({
		method : "mobile_resend",
		params : {
			filter : []
		},
		success : didSendAgainFromTextSignUp,
		failure : didFail
	});
}

function didSendAgainFromTextSignUp() {
	$.app.navigator.open({
		ctrl : "textMessage",
		stack : true,
		ctrlArguments : {
			"phone" : phone,
			"otp" : otp,
			"txtCode" : true,
			"txtMsgTitle" : true,
			"txtMsgLbl" : true,
			"signUpLbl" : false,
			"signUpTitle" : false,
			"txtHelpTitle" : false,
			"txtHelpLbl" : false,
			"replyTextMsgBtn" : true,
			"sendMeTextAgainSignUpBtn" : false,
			"sendMeTextAgainTextHelpBtn" : false,
			"skipSignUpAttr" : false,
			"skipNoTextMsgAttr" : false,
			"didNotReceiveTextAttr" : true,
			"stillReceiveTextAttr" : false,
			"checkPhoneAttr" : false,
			"txtNotReceiveTitle" : false,
			"txtNotReceiveLbl" : false,
			"txtNotReceiveBtn" : false,
			"skipTxtNotReceiveAttr" : false,
			"txtSuccessImg" : true,
			"txtFailImg" : false
		}
	});
}

function sendTextTextHelpMessage() {
	$.http.request({
		method : "mobile_resend",
		params : {
			filter : []
		},
		success : didSendAgainFromTextHelp,
		failure : didFail
	});

}

function didFail() {
}

function didSendAgainFromTextHelp() {
	$.app.navigator.open({
		ctrl : "textMessage",
		stack : true,
		ctrlArguments : {
			"phone" : phone,
			"otp" : otp,
			"txtCode" : true,
			"txtMsgTitle" : true,
			"txtMsgLbl" : true,
			"signUpLbl" : false,
			"signUpTitle" : false,
			"txtHelpTitle" : false,
			"txtHelpLbl" : false,
			"replyTextMsgBtn" : true,
			"sendMeTextAgainSignUpBtn" : false,
			"sendMeTextAgainTextHelpBtn" : false,
			"skipSignUpAttr" : false,
			"skipNoTextMsgAttr" : false,
			"didNotReceiveTextAttr" : true,
			"stillReceiveTextAttr" : false,
			"checkPhoneAttr" : false,
			"txtNotReceiveTitle" : false,
			"txtNotReceiveLbl" : false,
			"txtNotReceiveBtn" : false,
			"skipTxtNotReceiveAttr" : false,
			"txtSuccessImg" : true,
			"txtFailImg" : false
		}
	});
}

function checkPhoneNumberClicked() {
	authenticator.updateFamilyAccounts({
		success : function didUpdateFamilyAccounts() {
			$.app.navigator.open({
				titleid : "titleChangePhone",
				ctrl : "phone",
				stack : true
			});
		}
	});
}

function stillNotReceivingText() {
	$.app.navigator.open({
		titleid : "titleTextHelp",
		ctrl : "textMessage",
		stack : true,
		ctrlArguments : {
			"phone" : phone,
			"otp" : otp,
			"txtCode" : true,
			"txtMsgTitle" : false,
			"txtMsgLbl" : false,
			"signUpLbl" : false,
			"signUpTitle" : false,
			"txtHelpTitle" : false,
			"txtHelpLbl" : false,
			"replyTextMsgBtn" : false,
			"sendMeTextAgainSignUpBtn" : false,
			"sendMeTextAgainTextHelpBtn" : false,
			"skipSignUpAttr" : false,
			"skipNoTextMsgAttr" : false,
			"didNotReceiveTextAttr" : false,
			"stillReceiveTextAttr" : false,
			"checkPhoneAttr" : false,
			"txtNotReceiveTitle" : true,
			"txtNotReceiveLbl" : true,
			"txtNotReceiveBtn" : true,
			"skipTxtNotReceiveAttr" : true,
			"txtSuccessImg" : false,
			"txtFailImg" : true
		}
	});
}

function didNotReceiveText() {
	$.http.request({
		method : "mobile_resend",
		params : {
			filter : []
		},
		success : function() {
			$.app.navigator.open({
				ctrl : "textMessage",
				stack : true,
				ctrlArguments : {
					"otp" : otp,
					"phone" : phone,
					"txtCode" : true,
					"txtMsgTitle" : true,
					"txtMsgLbl" : true,
					"signUpLbl" : false,
					"signUpTitle" : false,
					"txtHelpTitle" : false,
					"txtHelpLbl" : false,
					"replyTextMsgBtn" : true,
					"sendMeTextAgainSignUpBtn" : false,
					"sendMeTextAgainTextHelpBtn" : false,
					"skipSignUpAttr" : false,
					"skipNoTextMsgAttr" : false,
					"didNotReceiveTextAttr" : true,
					"stillReceiveTextAttr" : false,
					"checkPhoneAttr" : false,
					"txtNotReceiveTitle" : false,
					"txtNotReceiveLbl" : false,
					"txtNotReceiveBtn" : false,
					"skipTxtNotReceiveAttr" : false,
					"txtSuccessImg" : true,
					"txtFailImg" : false

				}
			});
		}
	});

}

exports.init = init;
exports.backButtonHandler = backButtonHandler;
