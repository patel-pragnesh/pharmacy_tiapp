function didClickMyself(){
	$.app.navigator.open({
		ctrl : "signup",
		titleid : "titleCreateAccount",
		stack : true
	});
}
function didClickChild(){
	$.app.navigator.open({
		ctrl : "registerChildInfo",
		stack : true
	});
}
