var args = $.args,
    TAG = "BANN";

(function() {
	$.descriptionLbl.text = args.description;
	$.bannerImg.setImage(args.image_url);
	$.bannerImg.accessibilityLabel = args.description;
})();

function didClick(e) {
	if (args.action_url) {
		Ti.Platform.openURL(args.action_url);
	}
}

function didError(e) {
	require("logger").error(TAG, "unable to load image from url", args.image_url);
}

function didLoad(e) {
	$.descriptionLbl.visible = false;
}
