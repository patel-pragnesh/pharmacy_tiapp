var args = arguments[0] || {},
    app = require("core"),
    moment = require("alloy/moment");

function init() {
	Alloy.Collections.gettingRefilled.reset([{
		name : "Tramadol HCL, 20mg tab qual",
		readyAt : "1415774742"
	}]);
	Alloy.Collections.prescriptions.reset([{
		name : "Advil 1, 100mg tablet",
		rx : "RX#493030003",
		dueDate : "1414737560"
	}, {
		name : "Adderall 2, 100mg tablet",
		rx : "RX#493030003",
		dueDate : "1414823960"
	}, {
		name : "Advil 3, 100mg tablet",
		rx : "RX#493030003",
		dueDate : "1415687960"
	}, {
		name : "Adderall 4, 100mg tablet",
		rx : "RX#493030003",
		dueDate : "1415860760"
	}, {
		name : "Adderall 5, 100mg tablet",
		rx : "RX#493030003",
		dueDate : "1416561726"
	}]);
}

function filterReadyForRefill(collection) {
	return collection.reject(function(model) {
		return (moment.unix(model.get("dueDate")).diff(moment(), "days") + 1) > 7;
	});
}

function filterOtherPrescription(collection) {
	return collection.reject(function(model) {
		return (moment.unix(model.get("dueDate")).diff(moment(), "days") + 1) <= 7;
	});
}

function transformGettingRefilled(model) {
	var transform = model.toJSON();
	var availableDate = moment.unix(transform.readyAt);
	transform.progress = Math.floor(100 / (availableDate.diff(moment(), "days") + 1)) + "%";
	transform.info = Alloy.Globals.Strings.msgOrderPlacedReadyBy.concat(" " + availableDate.format("dddd hA"));
	return transform;
}

function transformPrescription(model) {
	var transform = model.toJSON();
	var dueDate = moment.unix(transform.dueDate);
	var fromToday = dueDate.diff(moment(), "days") + 1;
	if (fromToday <= 7) {
		if (fromToday >= 0) {
			transform.due = Alloy.Globals.Strings.msgDueFoRefillIn.concat(" " + fromToday + " " + Alloy.Globals.Strings.strDays);
			transform.color = "#F79538";
		} else {
			transform.due = Alloy.Globals.Strings.msgOverdueBy.concat(" " + Math.abs(fromToday) + " " + Alloy.Globals.Strings.strDays);
			transform.color = "#ae331f";
		}
	} else {
		transform.due = Alloy.Globals.Strings.msgDueFoRefillOn.concat(" " + dueDate.format("MM/DD/YY"));
		transform.color = "#8b8b8b";
	}
	return transform;
}

function didItemClick(e) {

}

function didToggle(e) {
	$.toggleMenu.toggle();
}

function didClickMenu(e) {
	var action = e.data.action;
	if (action === "search") {
		$.listView.top === 0 ? showSearch() : hideSearch();
	}
}

function showSearch() {
	var top = 60;
	var listAnim = Ti.UI.createAnimation({
		top : top,
		duration : 150
	});
	listAnim.addEventListener("complete", function onComplete() {
		listAnim.removeEventListener("complete", onComplete);
		$.listView.top = top;
		$.searchbar.animate({
			opacity : 1,
			duration : 150
		}, function(searchbar) {
			searchbar.opacity = 1;
		});
	});
	$.listView.animate(listAnim);
}

function hideSearch() {
	var top = 0;
	$.searchbar.animate({
		opacity : 0,
		duration : 150
	}, function(searchbar) {
		searchbar.opacity = 0;
		var listAnim = Ti.UI.createAnimation({
			top : top,
			duration : 150
		});
		listAnim.addEventListener("complete", function onComplete() {
			listAnim.removeEventListener("complete", onComplete);
			$.listView.top = top;
		});
		$.listView.animate(listAnim);
	});
}

function terminate() {
	$.destroy();
}

function didAndroidBack() {
	return $.toggleMenu.hide();
}

exports.init = init;
exports.terminate = terminate;
exports.androidback = didAndroidBack;
