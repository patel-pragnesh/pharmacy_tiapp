function init(){
	$.childInfoAttr.text=String.format($.strings.registerChildInfoAttr,Alloy.CFG.client_name);
	$.uihelper.getImage("info", $.infoImg);
}
function didClickAccountExists(){
	$.app.navigator.open({
		titleid:"titleFamilyCare",
		ctrl : "childAccountTips",
		stack : true
	});
}
function didCreateMgrAccount(){
	$.app.navigator.open({
		titleid:"titleCreateAccount",
		ctrl : "mgrAccountCreation",
		stack : true
	});
}
exports.init=init;