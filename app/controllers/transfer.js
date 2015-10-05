var args = arguments[0] || {},
authenticator = require("authenticator");
function init() {
	$.titleLbl.text = String.format(Alloy.Globals.strings.transferLblTitle, $.strings.strClientName);
	if ($.patientSwitcher) {
		$.patientSwitcher.set({
			title : $.strings.transferSwitcher,
			where : {
				is_partial : false
			}
		});
	}
}

function setParentView(view) {
	if ($.patientSwitcher) {
		$.patientSwitcher.setParentView(view);
	}
}

function terminate() {
	//terminate patient switcher
	if ($.patientSwitcher) {
		$.patientSwitcher.terminate();
	}
}
function didChangePatient(e) {
	/**
	 * No actions here since it is just a static page. 
	 * Only thing to be passed is the right session_id and
	 * that is taken care by the patient switcher by itself.
	 */
}

function didClickPhoto(e) {
	$.uihelper.getPhoto(didGetPhoto, $.window);
}

function didGetPhoto(blob) {
	/**
	 * keeping this blob in memory around the process
	 * is not a good idea, let's keep it in a file until
	 * we need this back
	 *
	 * image path is used throughout this module
	 * should not be changed
	 */
	$.utilities.writeFile(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "transfer.jpg"), blob, false);
	blob = null;
	if (Alloy.Globals.isLoggedIn) {
		$.app.navigator.open({
			titleid : "titleTransferStore",
			ctrl : "stores",
			ctrlArguments : {
				navigation : {
					titleid : "titleTransferOptions",
					ctrl : "transferOptions",
					ctrlArguments : {
						store : {}
					},
					stack : true
				},
				selectable : true
			},
			stack : true
		});
	} else {
		$.app.navigator.open({
			titleid : "titleTransferUserDetails",
			ctrl : "transferUserDetails",
			stack : true
		});
	}
}

function didClickType(e) {
	$.app.navigator.open({
		titleid : "titleTransferType",
		ctrl : "transferType",
		stack : true
	});
}

exports.init = init;
exports.terminate = terminate;
exports.setParentView = setParentView; 