var args = $.args;

function didClickMyself(){
	/*
	$.app.navigator.open({
		ctrl : "signup",
		titleid : "titleCreateAccount",
		stack : true
	});
	*/
	$.app.navigator.open({
		ctrl : "searchExistingPatient",
		titleid : "searchExistingPatientWelcome",
		stack : true
	});
}
function didClickChild(){
	$.app.navigator.open({
		ctrl : "registerChildInfo",
		stack : true
	});
}
function didClickAddAnotherAdult(){
	$.app.navigator.open({
		ctrl : "registerAdultInfo",
		titleid : "titleManageAdult",
		stack : true
	});
}

function didClickAccountExists(){
	$.app.navigator.open({
		titleid : "titleLogin",
		ctrl : "login"
	});
}

function terminate() {
	Alloy.Globals.carouselFlow = false;
}

exports.terminate = terminate;