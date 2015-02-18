var args = arguments[0] || {};

(function() {

	var options = _.pick(args, ["width", "height", "top", "bottom", "left", "right"]);
	if (!_.isEmpty(options)) {
		applyProperties(options);
	}

	options = _.pick(args, ["layout", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		$.containerView.applyProperties(options);
	}

	updateArrow(args.direction || "bottom", args.arrowDict || {});

	if (_.has(args, "text")) {
		setText(args.text);
	}

})();

function updateArrow(_direction, _dict) {
	var dict = {
		text : args.iconText || _dict.iconText || "%",
		font : _dict.font || args.iconFont || {
			fontSize : 12
		},
		color : _dict.color || "#000"
	};
	_.extend(dict, _.pick(args, ["borderColor", "borderWidth", "borderRadius"]));
	$.arrowLbl.applyProperties(dict);
	$.arrowLbl[_direction] = 0;
	$.containerView[_direction] = $.arrowLbl.font.fontSize - 8;
}

function applyProperties(_dict) {
	$.widget.applyProperties(_dict);
}

function animate(_dict, _callback) {
	var animation = Ti.UI.createAnimation(_dict);
	animation.addEventListener("complete", function onComplete() {
		animation.removeEventListener("complete", onComplete);
		if (_callback) {
			_callback();
		}
	});
	$.widget.animate(animation);
}

function show(_callback) {
	if (!$.widget.visible) {
		$.widget.applyProperties({
			visible : true,
			zIndex : args.zIndex || 1
		});
		var animation = Ti.UI.createAnimation({
			opacity : 1,
			duration : 300
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
			$.widget.opacity = 1;
			if (_callback) {
				_callback();
			}
		});
		$.widget.animate(animation);
	}
}

function hide(_callback) {
	if ($.widget.visible) {
		var animation = Ti.UI.createAnimation({
			opacity : 0,
			duration : 300
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
			$.widget.applyProperties({
				opacity : 0,
				visible : false,
				zIndex : 0
			});
			if (_callback) {
				_callback();
			}
		});
		$.widget.animate(animation);
	}
}

function getVisible() {
	return $.widget.visible;
}

function removeAllChildren() {
	var children = $.containerView.children;
	for (var i in children) {
		$.containerView.remove(children[i]);
	}
}

function setPadding(_height) {
	$.containerView.add(Ti.UI.createLabel({
		height : _height,
		touchEnabled : false
	}));
}

function setText(_text, _styles) {
	removeAllChildren();
	var dict = _styles || args.labelDict || {};
	_.extend(dict, {
		font : _.clone(args.font) || {
			fontSize : 12
		},
		text : _text,
		touchEnabled : false
	});
	var lbl = Ti.UI.createLabel(dict);
	if (dict.paddingTop) {
		setPadding(dict.paddingTop);
	}
	$.containerView.add(lbl);
	if (dict.paddingBottom) {
		setPadding(dict.paddingBottom);
	}
}

function setContentView(_view, _styles) {
	removeAllChildren();
	var dict = _styles || args.labelDict || {};
	if (dict.paddingTop) {
		setPadding(dict.paddingTop);
	}
	$.containerView.add(_view);
	if (dict.paddingBottom) {
		setPadding(dict.paddingBottom);
	}
}

exports.show = show;
exports.hide = hide;
exports.animate = animate;
exports.setText = setText;
exports.setContentView = setContentView;
exports.getVisible = getVisible;
exports.applyProperties = applyProperties;
