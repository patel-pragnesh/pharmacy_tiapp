var args = $.args,
    uihelper = require("uihelper");

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	/**
	 *  keep different class names for different layouts
	 */
	$.row.className = "masterDetail" + (args.masterWidth || "") + (args.detailWidth || "") + "Btn";
	if (args.masterWidth) {
		$.resetClass($.masterView, ["left", "width-" + args.masterWidth, "auto-height", "vgroup"]);
	}
	if (args.detailWidth) {
		$.resetClass($.detailView, ["right", "width-" + args.detailWidth, "auto-height", "vgroup"]);
	}
	var title = args.title || (args.data ? args.data[args.titleProperty] : "");
	if (args.titleClasses) {
		$.resetClass($.titleLbl, args.titleClasses, {
			text : title
		});
	} else {
		$.titleLbl.text = title;
	}
	var subtitle = args.subtitle || (args.data ? args.data[args.subtitleProperty] : "");
	if (args.subtitleClasses) {
		$.resetClass($.subtitleLbl, args.subtitleClasses, {
			text : subtitle
		});
	} else {
		$.subtitleLbl.text = subtitle;
	}

	if (args.tertiaryTitle) {
		var tertiaryTitle = args.tertiaryTitle || (args.data ? args.data[args.ttProperty] : "");
		$.tertiaryTitleLbl.show();
		if (args.ttClasses) {
			$.resetClass($.tertiaryTitleLbl, args.ttClasses, {
				text : tertiaryTitle
			});
		} else {
			$.tertiaryTitleLbl.text = tertiaryTitle;
		}
	} else {
		$.tertiaryTitleLbl.height = 0;
	}

	if (args.detailClasses) {
		$.resetClass($.detailTitleLbl, args.detailClasses);
		$.resetClass($.detailSubtitleLbl, args.detailClasses);
		$.resetClass($.detailTertiaryLbl, args.detailClasses);
	}

	if (args.detailTertiaryTitle) {
		var detailTertiaryClassPrefix = args.detailTertiaryType ? args.detailTertiaryType + "-" : "";

		$.addClass($.detailTertiaryLbl, [detailTertiaryClassPrefix + "fg-color"], {
			text : args.detailTertiaryTitle || (args.data ? args.data[args.detailTertiaryTitleProperty] : "")
		});
	}

	var detailClassPrefix = args.detailType ? args.detailType + "-" : "";
	$.addClass($.detailTitleLbl, [detailClassPrefix + "fg-color"], {
		text : args.detailTitle || (args.data ? args.data[args.detailTitleProperty] : "")
	});
	$.addClass($.detailSubtitleLbl, [detailClassPrefix + "fg-color"], {
		text : args.detailSubtitle || (args.data ? args.data[args.detailSubtitleProperty] : "")
	});
	_.each(["titleLbl", "subtitleLbl", "detailTitleLbl", "detailSubtitleLbl"], function(val) {
		uihelper.wrapText($[val]);
	});
})();

function getParams() {
	return args;
}

function didClickPhone(e) {
	var source = e.source;
	$.trigger("clickPhone", {
		source : $,
		titile : "",
		data : args
	});
}

exports.getParams = getParams;
