var Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    baseDicts,
    logger = require("logger"),
    moment = require("alloy/moment"),
    TiCustomFontModule = require("com.mscripts.customfont"),
    DateTimeModule = require("com.mscripts.datetime");

var Configuration = {

	init : function(config) {

		if (!ENV_PROD) {
			logger.debug("\n\n\nnot prod, but still continue\n\n\n");

			// return [];
		}
logger.debug("\n\n\nit's prod env yo\n\n\n");
		/**
		 * initialization
		 */
		var resources = require("resources"),
		    data = [];
		_.each(["theme", "template", "menu", "language", "fonts", "images"], function(val, key) {
			if (_.has(config, val)) {
				var obj = config[val];
				_.extend(obj, {
					type : val,
					selected : true
				});
				if (val == "language") {
					obj.code = obj.lang_code;
				}
				delete obj.id;
				delete obj.lang_code;
				data.push(obj);
			}
		});

		/**
		 *  mightRequireReload - will be true when there is a change in selected flag
		 *  When mightRequireReload is true and objectsToUpdate.length == 0 then it is considered as a revert on server side
		 *  Configuration.load() should be called at this moment
		 */
		var mightRequireReload = resources.setData(data),
		    objectsToUpdate = resources.checkForUpdates();

		if (objectsToUpdate.length === 0 && mightRequireReload) {
			Configuration.load();
		}

		/***
		 * no. of objects to be updated
		 */
		return objectsToUpdate;
	},

	load : function(callback) {

		/**
		 * load into memory
		 */
		var queryObj = {
			selected : true,
			data : {
				$exists : true
			}
		},
		    utilities = require("utilities"),
		    resources = require("resources"),
		    collection = resources.collection;

		queryObj.type = "theme";
		var theme = collection.find(queryObj)[0];

		queryObj.type = "template";
		template = collection.find(queryObj)[0];

		queryObj.type = "menu";
		var menu = collection.find(queryObj)[0];

		queryObj.type = "font";
		var fonts = collection.find(queryObj);

		queryObj.type = "image";
		var images = collection.find(queryObj);

		//menu
		Alloy.Collections.menuItems.reset(utilities.clone(menu.data));

		//template
		Alloy.Models.template.set(utilities.clone(template));

		//language
		require("localization").init();

		//fonts
		Alloy.Fonts = {};
		if (!_.has(Alloy, "RegFonts")) {
			Alloy.RegFonts = [];
		}
		/**
		 * TiCustomFontModule.registerFont
		 *  and
		 * TiCustomFontModule.unregisterFont
		 */
		var lastUpdate = moment().unix();
		_.each(fonts, function(font) {
			var fontExists = _.findWhere(Alloy.RegFonts, {
				postscript : font.postscript
			}) || {};
			if (_.isEmpty(fontExists)) {
				TiCustomFontModule.registerFont(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.dataDirectory + "/" + font.data), font.postscript);
				Alloy.RegFonts.push(_.extend(utilities.clone(font), {
					lastUpdate : lastUpdate
				}));
			} else {
				if (fontExists.data != font.data) {
					if (OS_IOS) {
						//ios will not allow to update a font, has to be unregistered and registered back
						TiCustomFontModule.unregisterFont(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.dataDirectory + "/" + fontExists.data), fontExists.postscript);
					}
					//on android, registered font can be just replaced with new value
					TiCustomFontModule.registerFont(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.dataDirectory + "/" + font.data), font.postscript);
				}
				fontExists.lastUpdate = lastUpdate;
			}
			Alloy.Fonts[font.code] = font.postscript;
		});
		//remove unwanted fonts from memory
		Alloy.RegFonts = _.reject(Alloy.RegFonts, function(font) {
			var flag = lastUpdate !== font.lastUpdate;
			if (flag) {
				TiCustomFontModule.unregisterFont(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.dataDirectory + "/" + font.data), font.postscript);
			}
			return flag;
		});

		//images
		Alloy.Images = {};
		_.each(images, function(image) {
			Alloy.Images[image.name] = _.extend(_.clone(image.properties), {
				image : Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, resources.dataDirectory + "/" + image.data).nativePath
			});
		});

		//theme
		/**
		 *  load date format from device
		 *  can be update form theme too
		 */
		var dateFormat = OS_IOS ? DateTimeModule.dateFormat.split("/") : DateTimeModule.getDateFormat().split("/");
		//match date format with momentjs
		_.each(dateFormat, function(val, key) {
			if (val.indexOf("d") != -1) {
				/**
				 * moment requires capitalized (D)
				 * not lower case (d)
				 */
				val = val.toUpperCase();
			} else if (val.indexOf("y") != -1) {
				/**
				 * let years always be in full format (YYYY)
				 * keeping it in 2 digits brings issues
				 * when it is less than computer year (1970)
				 * i.e December 12, 1912 turns to December 12, 2012
				 */
				val = "YYYY";
			}
			dateFormat[key] = val;
		});
		Alloy.CFG.date_format = dateFormat.join("/");
		Alloy.CFG.time_format = Ti.Platform.is24HourTimeFormat() ? "HH:mm" : "hh:mm a";
		Alloy.CFG.date_time_format = Alloy.CFG.date_format + " " + Alloy.CFG.time_format;
		//extend configuration
		_.extend(Alloy.CFG, utilities.clone(theme.data.config.global));
		if (_.isObject(theme.data.config[Alloy.CFG.platform])) {
			_.extend(Alloy.CFG, utilities.clone(theme.data.config[Alloy.CFG.platform]));
		}
		//get date objects
		_.each(["default_date", "dob_default_date"], function(val) {
			Alloy.CFG[val] = new Date(Alloy.CFG[val]);
		});
		//banner size
		var app = require("core");
		/**
		 * banner will always fill the
		 * device in width wise
		 * and height will keep
		 * aspect ratio
		 * Note:
		 * -----
		 * 1. Using Math.floor banner_height might
		 * bring white spaces at the corners of image.
		 * 2. for default banner width and
		 * height will be in px, not dp.
		 */
		Alloy.CFG.banner_default_width /= app.device.logicalDensityFactor;
		Alloy.CFG.banner_default_height /= app.device.logicalDensityFactor;
		_.extend(Alloy.CFG, {
			banner_width : app.device.width,
			banner_height : (Alloy.CFG.banner_default_height / Alloy.CFG.banner_default_width) * app.device.width
		});
		//rx formatter
		_.each(Alloy.CFG.rx_formatters, function(formatter) {
			formatter.exp = new RegExp(formatter.pattern, formatter.modifiters);
			delete formatter.pattern;
			delete formatter.modifiters;
		});
		//rx validator
		Alloy.CFG.rx_validator = new RegExp(Alloy.CFG.rx_validator);
		//rx schedule 2 drug
		Alloy.CFG.rx_schedule_2_validator = new RegExp(Alloy.CFG.rx_schedule_2_validator);
		//convert seconds to milliseconds
		_.each(["http_timeout", "location_timeout"], function(prop) {
			Alloy.CFG[prop] = Alloy.CFG[prop] * 1000;
		});
		//icons notation to character
		_.each(Alloy.CFG.iconNotations, function(val, key) {
			if (val > 0xFFFF) {
				val -= 0x10000;
				Alloy.CFG.icons[key] = String.fromCharCode(0xD800 + (val >> 10), 0xDC00 + (val & 0x3FF));
			} else {
				Alloy.CFG.icons[key] = String.fromCharCode(val);
			}
		});
		//load TSS values from theme
		Alloy.TSS = {
			Theme : {
				version : theme.version
			}
		};
		var tss = utilities.clone(theme.data.tss),
		    constants = {
			"auto" : Ti.UI.SIZE,
			"fill" : Ti.UI.FILL
		};
		for (var ts in tss) {
			if (_.has(tss[ts], "width")) {
				tss[ts].width = constants[tss[ts].width] || tss[ts].width;
			}
			if (_.has(tss[ts], "height")) {
				tss[ts].height = constants[tss[ts].height] || tss[ts].height;
			}
			if (_.has(tss[ts], "font")) {
				tss[ts].font.fontFamily = Alloy.Fonts[tss[ts].font.fontFamily];
			}
			if (_.has(tss[ts], "buttonFont")) {
				tss[ts].buttonFont.fontFamily = Alloy.Fonts[tss[ts].buttonFont.fontFamily];
			}
			if (_.has(tss[ts], "iconFont")) {
				tss[ts].iconFont.fontFamily = Alloy.Fonts[tss[ts].iconFont.fontFamily];
			}
			if (_.has(tss[ts], "secondaryfont")) {
				tss[ts].secondaryfont.fontFamily = Alloy.Fonts[tss[ts].secondaryfont.fontFamily];
			}
			/**
			 * remove any '#' or '.' character in first place and repalce '-' with '_'
			 * and transform classifiers
			 * Example
			 * input: ".some-classname[platform=ios formFactor=handheld]"
			 * output: "some_classname_platform_ios_formFacoor_handheld"
			 * Note: Will support only one platform and one formFactor query, muliple combination should not be used
			 */
			var identifier = ts.replace(/^#/g, "").replace(/^\./, "").replace(/-+/g, "_").replace(/\[.*$/g, ""),
			    matches = ts.match(/\[.*$/g);
			if (matches && matches.length) {
				var classifiers = (matches[0] || "").replace(/\[|\]/g, "").split(" ");
				for (var i in classifiers) {
					identifier += "_" + classifiers[i].split("=").join("_");
				}
			}
			Alloy.TSS[identifier] = tss[ts];
		}
		//update font family for titleAttributes
		var keySuffix = "_platform_" + Alloy.CFG.platform;
		_.each(["Window", "drawer"], function(value) {
			var key = value.concat(keySuffix);
			Alloy.TSS[key].titleAttributes.font.fontFamily = Alloy.Fonts[Alloy.TSS[key].titleAttributes.font.fontFamily];
		});

		/**
		 * rewrite cached index.js
		 * if not cached, cache it
		 * on first time
		 */
		if (!baseDicts) {
			baseDicts = require("alloy/styles/index");
			/**
			 * Inject styles from index
			 * to all style sheets
			 */
			_.each(require("styleSheets"), function(styleSheet) {
				var styleSheetData = require(styleSheet);
				Array.prototype.splice.apply(styleSheetData, [0, 0].concat(baseDicts));
			});
		} else if (baseDicts[0].style.version != Alloy.TSS.Theme.version) {
			/**
			 * all style sheets will get
			 * updated as we update the base
			 * objects which is referenced in
			 * all style sheets
			 */
			for (var i in baseDicts) {
				var dict = baseDicts[i] || {},
				    key = (dict.key || "").replace(/-/g, "_");
				if (!_.has(Alloy.TSS, key)) {
					key += "_platform_" + Alloy.CFG.platform;
				}
				if (dict.queries && dict.queries.formFactor) {
					key += "_formFactor_" + (dict.queries.formFactor.toLowerCase().replace("is", ""));
				}
				if (_.has(Alloy.TSS, key)) {
					var style = dict.style;
					for (var prop in style) {
						if (_.has(Alloy.TSS[key], prop)) {
							style[prop] = Alloy.TSS[key][prop];
						}
					}
				}
			}
		}

		/**
		 * delete unused resources
		 */
		if (Alloy.CFG.delete_unused_resources) {
			resources.deleteUnusedResources();
		}

		if (callback) {
			callback();
		}
	},

	updateResources : function(callback) {
		require("resources").update(callback);
	}
};

module.exports = Configuration;
