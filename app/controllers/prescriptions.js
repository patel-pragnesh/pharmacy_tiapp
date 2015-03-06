var args = arguments[0] || {},
    app = require("core"),
    utilities = require("utilities"),
    http = require("requestwrapper"),
    uihelper = require("uihelper"),
    moment = require("alloy/moment"),
    dialog = require("dialog"),
    RX_NUMBER_PREFIX = Alloy.CFG.RX_NUMBER_PREFIX,
    PRESCRIPTION_TOOLTIP_REMINDER_AT = Alloy.CFG.PRESCRIPTION_TOOLTIP_REMINDER_AT,
    PRESCRIPTION_CRITICAL_REMINDER_AT = Alloy.CFG.PRESCRIPTION_CRITICAL_REMINDER_AT,
    apiCodes = Alloy.CFG.apiCodes,
    icons = Alloy.CFG.icons,
    strings = Alloy.Globals.strings,
    sections = {},
    rows = [],
    currentDate = moment(),
    overDueInfoStyle = $.createStyle({
	classes : ["right", "list-item-critical-info-lbl", "text-right"]
}),
    overDueDetailStyle = $.createStyle({
	classes : ["right", "list-item-critical-detail-lbl", "text-right"]
}),
    tooltipStyle = $.createStyle({
	classes : ["padding-top", "padding-bottom", "padding-right", "show", "arrow-left", "tooltip"],
	width : 150
}),
    criticalTooltipStyle = $.createStyle({
	classes : ["padding-top", "padding-bottom", "padding-right", "show", "arrow-left", "critical-tooltip"],
	width : 150
}),
    tooltipLblStyle = $.createStyle({
	classes : ["tooltip-lbl"]
});

function init() {
	http.request({
		method : "PRESCRIPTIONS_LIST",
		success : didGetPresecriptionList
	});
}

function didGetPresecriptionList(_result, _passthrough) {
	_result.data.prescriptions = _.sortBy(_result.data.prescriptions, function(obj) {
		return -parseInt(obj.is_overdue);
	});
	_.map(_result.data.prescriptions, function(prescription) {
		var row = getRow(prescription);
		if (!sections[prescription.property]) {
			sections[prescription.property] = uihelper.createTableViewSection($, strings["section".concat(utilities.ucfirst(prescription.property, false))]);
		}
		sections[prescription.property].add(row);
		rows.push(row);
	});
	var tempSections = ["gettingRefilled", "readyForPickup", "readyForRefill", "otherPrescriptions"];
	for (var section in tempSections) {
		tempSections[section] = sections[tempSections[section]];
	}
	$.tableView.setData(tempSections);
	Alloy.Collections.prescriptions.reset(_result.data.prescriptions);
}

function getRow(_prescription) {
	var status = _prescription.refill_status,
	    refillDate = moment(_prescription.anticipated_refill_date, apiCodes.DATE_FORMAT);
	_prescription.is_overdue = parseInt(_prescription.is_overdue);
	_prescription.refill_in_days = Math.abs(currentDate.diff(refillDate, "days"));
	_prescription.rx_number_formated = RX_NUMBER_PREFIX.concat(_prescription.rx_number);
	switch(status) {
	case apiCodes.PRESCRIPTION_GETTING_REFILLED:
		var refillRequestDate = moment(_prescription.latest_refill_requested_date, apiCodes.DATE_FORMAT),
		    promisedDate = moment(_prescription.latest_refill_promised_date, apiCodes.DATE_FORMAT),
		    timeSpent = currentDate.diff(refillRequestDate, "seconds"),
		    timeTake = promisedDate.diff(refillRequestDate, "seconds");
		_prescription.progress = Math.floor((timeSpent / timeTake) * 100) + "%";
		_prescription.info = String.format(strings.msgOrderPlacedReadyBy, refillDate.format("dddd"));
		_prescription.property = "gettingRefilled";
		break;
	case apiCodes.PRESCRIPTION_READY_FOR_PICKUP:
		_prescription.days_after_promised_date = currentDate.diff(moment(_prescription.latest_refill_promised_date, apiCodes.DATE_FORMAT), "days");
		_prescription.days_remaining_for_pickup = _prescription.restockperiod - _prescription.days_after_promised_date;
		if (_prescription.days_remaining_for_pickup <= PRESCRIPTION_TOOLTIP_REMINDER_AT) {
			tooltipLblStyle.html = String.format(strings.msgPickup, _prescription.days_remaining_for_pickup);
			_prescription.tooltip_style = _prescription.days_remaining_for_pickup <= PRESCRIPTION_CRITICAL_REMINDER_AT ? criticalTooltipStyle : tooltipStyle;
			_prescription.tooltip_lbl_style = tooltipLblStyle;
		}
		_prescription.info = strings.msgYourOrderIsReady;
		_prescription.property = "readyForPickup";
		break;
	case apiCodes.PRESCRIPTION_READY_FOR_REFILL:
		if (_prescription.is_overdue) {
			_prescription.info_style = overDueInfoStyle;
			_prescription.detail_style = overDueDetailStyle;
		}
		_prescription.info = _prescription.is_overdue ? strings.msgOverdueBy : strings.msgDueFoRefillIn;
		_prescription.detail = _prescription.refill_in_days + " " + (_prescription.refill_in_days == 1 ? strings.strDay : strings.strDays);
		_prescription.property = "readyForRefill";
		break;
	case apiCodes.PRESCRIPTION_OTHERS:
		_prescription.info = strings.msgDueFoRefillOn;
		_prescription.detail = refillDate.format(Alloy.CFG.DATE_FORMAT);
		_prescription.property = "otherPrescriptions";
		break;
	}
	return Alloy.createController("itemTemplates/".concat(_prescription.property), _prescription).getView();
}

function didChangeSearch(e) {

}

function didItemClick(e) {

}

function didClickOptionView(e) {
	$.optionsMenu.toggle();
}

function didClickOptionMenu(e) {

}

function didClickSortPicker(e) {

}

function didClickUnhideBtn(e) {
	$.unhidePicker.hide();
}

function didClickCloseBtn(e) {
	$.unhidePicker.hide();
}

function didClickSelectNone(e) {
	$.unhidePicker.setSelection({}, false);
}

function didClickSelectAll(e) {
	$.unhidePicker.setSelection({}, true);
}

function didAndroidBack() {
	return $.optionsMenu.hide();
}

exports.init = init;
exports.androidback = didAndroidBack;
