var args = arguments[0] || {},
    navigationHandler = require("navigationHandler"),
    ctrlShortCode = require("ctrlShortCode"),
    moduleShortCode = require("moduleShortCode"),
    isBannerEnabled = parseInt(Alloy.Models.appload.get("features").is_banners_enabled) || 0,
    isFeedbackEnabled = parseInt(Alloy.Models.appload.get("features").is_feedback_enabled) || 0,
    icons = Alloy.CFG.icons,
    banners,
    spanTimeId;

function init() {
	var items = Alloy.Models.template.get("data");
	_.each(items, function(item) {
		if (_.has(item, "platform") && _.indexOf(item.platform, Alloy.CFG.platform) == -1) {
			return;
		}
		$.contentView.add(create(item));
	});
	/**
	 * when banner feature is enabled and
	 * the current template supports banners
	 * load banners, if nothing in cache call
	 * get banners
	 */
	if (isBannerEnabled && $.bannerView && !loadBanners(Alloy.Collections.banners.toJSON())) {
		$.http.request({
			method : "appload_get_banners",
			params : {
				data : [{
					banners : {
						platform : Alloy.CFG.platform_code,
					}
				}]
			},
			showLoader : false,
			errorDialogEnabled : false,
			success : didSuccess
		});
	}
	/**
	 * check for feedbacks
	 */
	if (isFeedbackEnabled && false) {
		if (true) {
			showRateDialog();
		} else {
			$.uihelper.showDialog({
				title : $.strings.homeDialogTitleFeedback,
				message : $.strings.homeMsgFeedback,
				buttonNames : [$.strings.homeDialogBtnGreat, $.strings.homeDialogBtnImprove, $.strings.dialogBtnCancel],
				success : didGetFeedback
			});
		}
	}
}

function didGetFeedback(index) {
	switch(index) {
	case 0:
		//great
		break;
	case 1:
		//improve
		break;
	case 2:
		//cancel
		break;
	}
}

function showRateDialog() {
	$.uihelper.showDialog({
		title : $.strings.homeDialogTitleRate,
		message : String.format($.strings.homeMsgRate, $.strings["strStore" + Alloy.CFG.platform_code]),
		buttonNames : [$.strings.homeDialogBtnRate, $.strings.homeDialogBtnRemind, $.strings.homeDialogBtnCancel],
		success : didRateApp
	});
}

function didRateApp(index) {
	switch(index) {
	case 0:
		//rate now
		break;
	case 1:
		//remind later
		break;
	case 2:
		//cancel
		break;
	}
}

function didSuccess(result, passthrough) {
	result = _.sortBy(result.data.banners.banner, "priority");
	Alloy.Collections.banners.reset(result);
	loadBanners(result);
}

function loadBanners(items) {
	if (_.isArray(items) && items.length) {
		banners = items;
		$.bannerScrollableView = Ti.UI.createScrollableView();
		_.each(banners, function(banner) {
			$.bannerScrollableView.addView(Alloy.createController("templates/banner", banner).getView());
		});
		/**
		 * only when more than one banner placed
		 * paging control should be enabled
		 */
		var len = banners.length,
		    pagingControlEnabled = len > 1,
		    views = [$.bannerScrollableView];
		if (pagingControlEnabled) {
			$.bannerScrollableView.addEventListener("scrollend", didScrollend);
			$.pagingControl = Alloy.createWidget("ti.pagingcontrol", _.extend($.createStyle({
				classes : ["pagingcontrol"]
			}), {
				currentPage : 0,
				length : len
			}));
			$.pagingControl.on("change", didChangePager);
			views.push($.pagingControl.getView());
		}
		if ($.asyncView) {
			$.asyncView.hide(views);
		} else {
			_.each(views, function(view) {
				$.bannerView.add(view);
			});
		}
		if (pagingControlEnabled) {
			startSpanTime(banners[0].spanTime);
		}
		return true;
	}
	return false;
}

function startSpanTime(seconds) {
	if (spanTimeId) {
		clearTimeout(spanTimeId);
	}
	spanTimeId = setTimeout(didSpanTimeout, seconds * 1000);
}

function didSpanTimeout() {
	var nextPage = $.bannerScrollableView.currentPage + 1;
	if (banners.length === nextPage) {
		nextPage = 0;
	}
	$.bannerScrollableView.scrollToView(nextPage);
	$.pagingControl.setCurrentPage(nextPage);
	startSpanTime(banners[nextPage].spanTime);
}

function didScrollend(e) {
	var currentPage = e.currentPage;
	$.pagingControl.setCurrentPage(currentPage);
	startSpanTime(banners[currentPage].spanTime);
}

function didChangePager(e) {
	//scroll end will be triggered as result of this
	$.bannerScrollableView.scrollToView(e.currentPage);
}

function create(dict) {
	var element;
	if (dict.module) {
		element = require(dict.module)[dict.apiName](dict.properties || {});
	} else {
		element = $.UI.create(dict.apiName, {
			apiName : dict.apiName,
			classes : dict.classes || []
		});
	}
	if (dict.apiName === "ImageView") {
		$.uihelper.getImage(dict.image, element);
	}
	if (_.has(dict, "properties")) {
		var properties = dict.properties;
		if (_.has(properties, "icon")) {
			properties.text = icons[properties.icon];
		} else if (_.has(properties, "textid")) {
			properties.text = $.strings[properties.textid];
		} else if (_.has(properties, "titleid")) {
			properties.title = $.strings[properties.titleid];
		}
		element.applyProperties(_.omit(properties, ["textid", "titleid", "icon"]));
	}
	if (_.has(dict, "children")) {
		_.each(dict.children, function(child) {
			var items = child.items,
			    addChild = child.addChild || "add",
			    asArray = child.asArray,
			    cElemnts = [];
			_.each(items, function(childItem) {
				if (_.has(childItem, "platform") && _.indexOf(childItem.platform, Alloy.CFG.platform) == -1) {
					return;
				}
				if (asArray) {
					cElemnts.push(create(childItem));
				} else {
					element[addChild](create(childItem));
				}
			});
			if (asArray) {
				element[addChild](cElemnts);
			}
		});
	}
	if (_.has(dict, "navigation")) {
		element.navigation = dict.navigation;
		element.addEventListener("click", didClickItem);
	}
	if (_.has(dict, "actions")) {
		_.each(dict.actions, function(action) {
			element.addEventListener(action.event, getListener(action.event));
		});
		element.actions = dict.actions;
	}
	if (_.has(dict, "id")) {
		$[dict.id] = element;
		/**
		 * if the tempalte supports banner
		 * and banner feature is enabled,
		 * then apply size bannerView
		 */
		if (dict.id == "bannerView" && isBannerEnabled) {
			$.bannerView.applyProperties({
				width : Alloy.CFG.banner_width,
				height : Alloy.CFG.banner_height
			});
			/**
			 * when no banner in cache,
			 * then show a async view
			 */
			if (!Alloy.Collections.banners.length) {
				$.asyncView = Alloy.createWidget("ti.asyncview", "widget");
				$.bannerView.add($.asyncView.getView());
			}
		}
	}
	return element;
}

function getListener(event) {
	switch(event) {
	case "postlayout":
		return didPostlayout;
	}
}

function didClickItem(e) {
	var navigation = e.source.navigation || {},
	    menuItem = Alloy.Collections.menuItems.findWhere(navigation);
	/**
	 * toJSON itself gives a copy of object
	 * so the source object will not be modified
	 * can be used for next event
	 * _.clone(navigation) will give a copy of navigation
	 * to prevent the source object being modified by
	 * navigationHandler
	 */
	navigation = menuItem ? menuItem.toJSON() : _.clone(navigation);
	navigationHandler.navigate(navigation);
	$.analyticsHandler.featureEvent(moduleShortCode[$.ctrlShortCode] + "-" + $.ctrlShortCode + "-" + (ctrlShortCode[navigation.ctrl] || navigation.action || navigation.url));
}

function didClickRightNav(e) {
	$.app.navigator.open({
		titleid : "titleLogin",
		ctrl : "login"
	});
}

function didPostlayout(e) {
	var source = e.source,
	    binders = (_.findWhere(source.actions, {
		event : "postlayout"
	}) || {}).binders || [];
	source.removeEventListener("postlayout", didPostlayout);
	_.each(binders, function(binder) {
		var properties = _.pick(source, binder.properties);
		if (_.has(properties, "width")) {
			properties.width = source.rect.width;
		}
		if (_.has(properties, "height")) {
			properties.height = source.rect.height;
		}
		$[binder.id].applyProperties(properties);
	});
}

function didClickSubmit(e) {
	var feedback = $.feedbackTxta.getValue();
	if (!feedback) {
		$.uihelper.showDialog({
			message : $.strings.homePopupValFeedback
		});
		return;
	}
}

function didClickCancel(e) {
	$.feedbackDialog.hide();
}

function hideAllPopups() {
	if ($.feedbackDialog) {
		return $.feedbackDialog.getVisible();
	}
	return false;
}

function terminate() {
	if (spanTimeId) {
		clearTimeout(spanTimeId);
	}
}

_.extend($, {
	init : init,
	terminate : terminate,
	backButtonHandler : hideAllPopups
});
