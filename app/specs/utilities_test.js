var utilities = require("utilities");
var alloy = require("alloy");

describe("Utility Test Suite", function() {
	it("Get the Utilities - Boolean Type (Test Case 1)", function() {
		utilities.setProperty("boolUtility", false, "bool", false);
		if (utilities.getProperty("boolUtility", false, "bool", false).should.be.equal(false))
			;
	});
	it("Get the Utilities - Boolean Type (Test Case 2)", function() {
		utilities.setProperty("boolUtility", true, "bool", false);
		if (utilities.getProperty("boolUtility", true, "bool", false).should.be.equal(true))
			;
	});
	it("Get the Utilities - String Type (Test Case 3)", function() {
		utilities.setProperty("stringUtility", "stringValue", "string", false);
		if (utilities.getProperty("stringUtility", "stringValue", "string", false).should.be.equal("stringValue"))
			;
	});
	it("Get the Utilities - Object Type (Test Case 4)", function() {
		utilities.setProperty("objectUtility", {
			name : "mscripts"
		}, "object");
		if (utilities.getProperty("objectUtility", {
				name : "mscripts"
			}, "object").should.have.property('name', 'mscripts'))
			;
	});
	it("Get the Utilities - Integer Type (Test Case 5)", function() {
		utilities.setProperty("integerUtility", 100, "int");
		if (utilities.getProperty("integerUtility", 100, "int").should.be.equal(100))
			;
	});

	it("Remove the Utility property (Test Case 6)", function() {(utilities.removeProperty("integerUtility"));
		if (utilities.getProperty("integerUtility", 100, "int").should.be.empty)
			;
	});

	it("File manipulations (Test Case 7)", function() {
		utilities.getFileName("/images/logo_pl.png").should.be.equal("logo_pl.png");
	});
	it("File manipulations (Test Case 8)", function() {
		utilities.getFileName("/images/helpful_medication_pl.png").should.be.equal("helpful_medication_pl.png");
	});
	it("File manipulations (Test Case 9)", function() {
		utilities.getFileName("/images/logo_white_pl.png").should.be.equal("logo_white_pl.png");
	});
	it("File manipulations (Test Case 10)", function() {
		utilities.getFileName("/images/map_pin_pl.png").should.be.equal("map_pin_pl.png");
	});
	it("File manipulations (Test Case 11)", function() {
		utilities.getFileName("/images/store_locator_pl.png").should.be.equal("store_locator_pl.png");
	});
	it("File manipulations (Test Case 12)", function() {
		utilities.getFileName("/images/toggle_btn_off_pl.png").should.be.equal("toggle_btn_off_pl.png");
	});
	it("File manipulations (Test Case 13)", function() {
		utilities.getFileName("/images/toggle_btn_on_pl.png").should.be.equal("toggle_btn_on_pl.png");
	});
	it("Format Number (Test Case 14)", function() {
		utilities.formatNumber("1000").should.be.equal("1,000");
	});
	it("Format Number (Test Case 15)", function() {
		utilities.formatNumber("10000").should.be.equal("10,000");
	});
	it("Format Number (Test Case 16)", function() {
		utilities.formatNumber("100000").should.be.equal("100,000");
	});
	it("Format Number (Test Case 17)", function() {
		utilities.formatNumber("1000000").should.be.equal("1,000,000");
	});
	it("Format Number (Test Case 18)", function() {
		utilities.formatNumber("10000000").should.be.equal("10,000,000");
	});
	it("Format Mobile Number (Test Case 19)", function() {
		utilities.formatMobileNumber("6172837737").should.be.equal("(617) 283-7737");
	});
	it("Format Words - Capitalize first character of each word (Test Case 20)", function() {
		utilities.ucword("mscripts india").should.be.equal("Mscripts India");
	});
	it("Format Words - Capitalize only the first character of a string (Test Case 21)", function() {
		utilities.ucfirst("mscripts india").should.be.equal("Mscripts india");
	});
	it("Format Words - Lower case only the first character of s string (Test Case 22)", function() {
		utilities.lcfirst("Mscripts India", false).should.be.equal("mscripts India");
	});
	it("Format Words - Lower case first character of each word (Test Case 23)", function() {
		utilities.lcfirst("Mscripts India").should.be.equal("mscripts india");
	});
	it("Format Words - Escape the character in the string (Test Case 24)", function() {
		utilities.escapeString("mscriptsindia").should.be.equal("\"mscriptsindia\"");
	});

	it("Format Words - Clean Strings (Test Case 25)", function() {
		utilities.cleanString("To break lines<br>in a text,<br>use the br element.").should.equal("To break lines\nin a text,\nuse the br element.");
	});
	it("Get random numbers (Test Case 26)", function() {
		utilities.getRandomString("10").should.be.ok;
	});
	it("Clone an object (Test Case 27)", function() {
		utilities.clone({
			name : "mscripts"
		}).should.have.property({
			"name" : "mscripts"
		});
	});
	it("Validate Names Success (Test Case 28)", function() {
		utilities.validateName("mscripts'India'- ").should.be.ok;
	});
	it("Validate User Names Success (Test Case 29)", function() {
		utilities.validateUserName("mscriptsIndia").should.be.ok;
	});
	it("Validate Names Failure (Test Case 30)", function() {
		utilities.validateName("mscripts'India'-$").should.be.ok;
	});
	it("Validate User Names Failure (Test Case 31)", function() {
		utilities.validateUserName("'mscriptsIndia'").should.be.ok;
	});
	it("Validate Email Success (Test Case 32)", function() {
		utilities.validateEmail("mscriptsIndia@mscripts.com").should.be.ok;
	});
	it("Validate Email Failure (Test Case 33)", function() {
		utilities.validateEmail("mscriptsIndia@mscripts").should.be.ok;
	});
	it("Validate Password Success (Test Case 34)", function() {
		utilities.validatePassword("mscripts123").should.be.ok;
	});
	it("Validate password Failure (Test Case 35)", function() {
		utilities.validatePassword("mscripts").should.be.ok;
	});
	it("Validate mobile number Success (Test Case 36)", function() {
		utilities.validateMobileNumber("(617) 283-7737").should.be.ok;
	});
	it("Validate mobile number Failure (Test Case 37)", function() {
		utilities.validateMobileNumber("6172837737").should.be.ok;
	});
	it("Mobile number Success (Test Case 38)", function() {
		utilities.isMobileNumber("6172837737").should.be.ok;
	});
	it("Mobile number Failure (Test Case 39)", function() {
		utilities.isMobileNumber("617283773789686").should.be.ok;
	});
});
