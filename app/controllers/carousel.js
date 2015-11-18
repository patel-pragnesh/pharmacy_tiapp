var args = arguments[0] || {},
    navigationHandler = require("navigationHandler"),
    currentId = "appImg",
    statusObj = {},
    viewsCount = 4;

function init() {
	//logo - align all labels to be in sync with logo
	var fromTop = $.logoImg.top + $.appLbl.top + $.uihelper.getImage("logo", $.logoImg).height;
	_.each(["prescLbl", "refillLbl", "remindersLbl", "familyCareLbl"], function(val) {
		$[val].top = fromTop;
	});
	//footer view
	var fromBottom = $.uihelper.getHeightFromChildren($.footerView, true);
	$.scrollableView.bottom = fromBottom;
	$.pagingControl.getView().bottom = fromBottom + $.createStyle({
		classes : ["margin-bottom"]
	}).bottom;
	//get images list ready
	setImages($.appImg, "app", 81);
	setImages($.prescImg, "prescriptions", 130);
	setImages($.refillImg, "refill", 195);
	setImages($.remindersImg, "reminders", 69);
	setImages($.familyCareImg, "family_care", 100);
	//load first set of images
	$[currentId].addEventListener("load", didLoad);
	$[currentId].images = statusObj[currentId].images;
	//first launch flag
	$.utilities.setProperty(Alloy.CFG.first_launch_app, false, "bool", false);
}

function setImages(imgView, fld, count) {
	var imgPrefix = "/images/series/" + fld + "/layer_",
	    imgSuffix = ".png",
	    images = [];
	for (var i = 1; i <= count; i++) {
		images.push(imgPrefix + i + imgSuffix);
	}
	//image set ready
	statusObj[imgView.id] = {
		status : 0,
		images : images
	};
}

function didLoad(e) {
	$[currentId].removeEventListener("load", didLoad);
	$[currentId].start();
	statusObj[currentId].status = 1;
}

function didScrollend(e) {
	var currentPage = e.currentPage;
	$.pagingControl.setCurrentPage(currentPage);
	startOrStopAnimation(currentPage);
}

function didChangePager(e) {
	//scroll end will be triggered as result of this
	$.scrollableView.scrollToView(e.currentPage);
}

function startOrStopAnimation(currentPage) {
	var status = statusObj[currentId].status;
	if (status === 1) {
		//if already started
		$[currentId].pause();
		$[currentId].image = _.last(statusObj[currentId].images);
		statusObj[currentId].status = 2;
	} else if (status === 0) {
		//if not started yet
		$[currentId].removeEventListener("load", didLoad);
		$[currentId].images = null;
	}
	currentId = _.last($.scrollableView.getViews()[currentPage].getChildren()).id;
	status = statusObj[currentId].status;
	if (status === 0) {
		//not loaded yet
		$[currentId].addEventListener("load", didLoad);
		$[currentId].images = statusObj[currentId].images;
	}
	if (currentPage === viewsCount) {
		//update title to start if this is last
		$.submitBtn.title = $.strings.carouselBtnStart;
	} else if ($.submitBtn.title === $.strings.carouselBtnStart) {
		//update title back to next
		$.submitBtn.title = $.strings.carouselBtnNext;
	}
}

function didClickNext(e) {
	var currentPage = $.scrollableView.currentPage;
	if (currentPage < viewsCount) {
		currentPage++;
		//scroll end will be triggered as result of this
		$.scrollableView.scrollToView(currentPage);
	} else {
		$.app.navigator.open({
			ctrl : "register"
		});
	}
}

function didClickSkip(e) {
	navigationHandler.navigate(Alloy.Collections.menuItems.findWhere({
		landing_page : true
	}).toJSON());
}

exports.init = init;
