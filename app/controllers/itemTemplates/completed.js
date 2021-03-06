var args = $.args,
    uihelper = require("uihelper"),
    logger = require("logger");

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	var title = args.title || (args.data ? args.data[args.titleProperty] : "");
	if (args.titleClasses) {
		$.resetClass($.titleLbl, args.titleClasses, {
			text : title
		});
	} else {
		$.titleLbl.text = title;
	}

	if (args.customIconCheckoutComplete) {
		$.addClass($.subtitleIconLbl, ["custom-fg-color", args.customIconCheckoutComplete]);
	} else if (args.customIconPartialFill) {
		$.addClass($.subtitleIconLbl, ["yield-fg-info-color", args.customIconPartialFill]);
	} else if (args.customIconYield) {
		$.addClass($.subtitleIconLbl, ["yield-fg-info-color", args.customIconYield]);
	} else if (args.customIconRejected) {
		$.addClass($.subtitleIconLbl, ["tentative-fg-color", args.customIconRejected]);
	} else {
		if (args.customIconNegative) {
			$.addClass($.subtitleIconLbl, ["negative-fg-info-color", args.customIconNegative]);
		} else {
			$.addClass($.subtitleIconLbl, ["positive-fg-color", "icon-thin-filled-success"]);
		}
	}
	var subtitle = args.subtitle || (args.data ? args.data[args.subtitleProperty] : "");

	if (args.subtitleClasses) {
		$.resetClass($.subtitleLbl, args.subtitleClasses, {
			text : subtitle,
		});
	} else {
		$.subtitleLbl.text = subtitle;
	}

	if (args.subtitleColor) {
		$.addClass($.detailLbl, [args.subtitleColor]);
	}

	var detail = args.detailTitle || (args.data ? args.data[args.detailProperty] : "");

	if (args.detailClasses) {
		$.resetClass($.detailLbl, args.detailClasses, {
			text : detail,
		});
	} else {
		$.detailLbl.text = detail;
	}

	if (args.detailColor) {
		$.addClass($.detailLbl, [args.detailColor]);
	}

	if (args.showChild) {
		if (args.showChild == true) {
			$.childLbl.show();
		} else {
			$.childLbl.height = 0;
		}
	} else {
		$.childLbl.height = 0;
	}

	if (args.showDeliveryOption) {
		if (args.showDeliveryOption == true) {
			$.deliveryView.show();
			$.deliveryLbl.text = args.optionDict.text || "";
		} else {
			$.deliveryView.height = 0;
		}
	} else {
		$.deliveryView.height = 0;
	}

	uihelper.wrapViews($.masterView);
	_.each(["titleLbl", "subtitleLbl", "detailLbl"], function(val) {
		uihelper.wrapText($[val]);
	});
	if (args.tooltip) {
		$.row.className = "completedTooltip";
		var tooltipType = args.tooltipType || "inactive";
		$.tooltip = Alloy.createWidget("ti.tooltip", "widget", $.createStyle({
			classes : ["show", "right", "width-50", "direction-left", tooltipType + "-bg-color", tooltipType + "-border"],
			arrowDict : $.createStyle({
				classes : [tooltipType + "-fg-color", "i5", "icon-filled-arrow-left"]
			}),
		}));
		$.tooltipLbl = Alloy.createWidget("ti.styledlabel", "widget", $.createStyle({
			classes : ["margin-top", "margin-bottom", "margin-left", "margin-right", "h6", "txt-center", "light-fg-color"],
			secondaryfont : $.createStyle({
				classes : ["h5"]
			}).font,
			secondarycolor : $.createStyle({
				classes : ["light-fg-color"]
			}).font,
			text : args.tooltip
		}));
		$.tooltip.setContentView($.tooltipLbl.getView());
		$.contentView.add($.tooltip.getView());
	} else {
		$.row.className = "completed";
	}
	if (args.changeTimeLbl && Alloy.CFG.is_update_promise_time_enabled) {
		$.changeTimeLbl.text = args.changeTimeLbl;
	}
})();

function getParams() {
	return args;
}

function didClickPhone(e) {
	logger.debug("\n\n\n\n\n completed passing control to parent\n\n\n");
	var source = e.source;
	$.trigger("clickphone", {
		source : $,
		title : "",
		data : args
	});
}

function didClickPromiseTime(e) {
	var source = e.source;
	$.trigger("clickpromisetime", {
		source : $,
		title : "",
		data : args
	});
}

function didClickDeliver(e) {
	var source = e.source;
	$.trigger("clickdeliver", {
		source : $,
		title : "",
		data : args
	});
}

exports.getParams = getParams; 
