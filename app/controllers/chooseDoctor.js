var args = arguments[0] || {},
    app = require("core");

function init() {
	Alloy.Collections.doctors.trigger("reset");
}

function transformDoctor(model) {
	var transform = model.toJSON();
	return transform;
}

function didItemClick(e) {
	var itemId = OS_MOBILEWEB ? e.row.rowId : e.itemId;
	app.navigator.open({
		stack : true,
		titleid : "titleChooseTime",
		ctrl : "chooseTime",
		ctrlArguments : {
			itemId : itemId
		}
	});
}

function terminate() {
	$.destroy();
}

exports.init = init;
exports.terminate = terminate;
