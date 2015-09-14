var args = arguments[0] || {};
function init() {
	$.uihelper.getImage("text_benefits", $.textBenefitsImage);
}

function didClickTextSignup() {
	$.app.navigator.open({
		titleid : "titleChangePhone",
		ctrl : "phone",
		ctrlArguments : {
			username : args.username
		},
		stack : true
	});
}

function didClickSkipTextSignup() {
	var isFamilyMemberAddPrescFlow = $.utilities.getProperty("familyMemberAddPrescFlow", true, "bool", true);
	if (args.isFamilyMemberFlow) {
		$.app.navigator.open({
			titleid : "titleFamilyAccounts",
			ctrl : "familyMemberAddSuccess",
			ctrlArguments : {
				familyRelationship : args.familyRelationship
			},
			stack : false
		});
	} else if (isFamilyMemberAddPrescFlow) {
		$.app.navigator.open({
			titleid : "titleFamilyCare",
			ctrl : "familyCare",
			stack : false
		});
	} 
	else if (args.isAccountFlow){
		$.app.navigator.close();
	}
	else {
		$.app.navigator.open({
			titleid : "titleHome",
			ctrl : "home",
			stack : false
		});
	}
}
exports.init = init;
