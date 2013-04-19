/* ***** BEGIN LICENSE BLOCK *****
 * Version: MIT/X11 License
 *
 * Copyright (c) 2012 Siddhartha Dugar
 *
 * Permission is hereby granted, free of charge, to any person obtaining copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * This code was originally written for the addon NOverflow
 *
 * Contributor:
 *   Siddhartha Dugar <dugar.siddhartha@gmail.com> (Creator)
 *
 * ***** END LICENSE BLOCK ***** */

var Cc = Components.classes, Ci = Components.interfaces, Cu = Components.utils;
Cu.import("resource://gre/modules/Services.jsm");

var appInfo = Cc["@mozilla.org/xre/app-info;1"]
		.getService(Components.interfaces.nsIXULAppInfo);
var versionChecker = Cc["@mozilla.org/xpcom/version-comparator;1"]
		.getService(Components.interfaces.nsIVersionComparator);

var PREF_ROOT = "extensions.NOverflow.";
var PREF_DEFAULTS = {
	tabMinWidth : 55,
	hideBlankFavicon : true,
	hideCloseBtn : false,
	slimmerPinnedTabs : false,
	reduceButtonWidth : true,
	dimPendingTabs : true,
	shrinkAustralisTabs : false,
	loggingEnabled : false
};

function include(src) {
	var o = {};
	Cu.import("resource://gre/modules/Services.jsm", o);
	var uri = o.Services.io.newURI(src, null, o.Services.io.newURI(
			__SCRIPT_URI_SPEC__, null, null));
	o.Services.scriptloader.loadSubScript(uri.spec, this);
}

include("scripts/utils.js");
include("scripts/pref.js");
include("scripts/helpers.js");

/* Change defaults if running on Australis */
if (Services.prefs.getCharPref("app.update.channel").indexOf("ux") != -1
		|| versionChecker.compare(appInfo.version, "24.0") >= 0) {
	Services.prefs.setBoolPref("services.sync.prefs.sync."
			+ "extensions.NOverflow.shrinkAustralisTabs", false);
	Services.prefs
			.setBoolPref("extensions.NOverflow.shrinkAustralisTabs", true);
}

initDefaultPrefs(PREF_ROOT, PREF_DEFAULTS, true);

/**
 * Adjust tab position to fit with the adjusted Firefox button.
 */
function fixTabPositioning() {
	if (Services.prefs.getBoolPref("browser.tabs.onTop")) {
		Services.prefs.setBoolPref("browser.tabs.onTop", false);
		Services.prefs.setBoolPref("browser.tabs.onTop", true);
		printToLog("Fixed tab positioning.");
	}
}

function clearOldPrefs() {
	Services.prefs.clearUserPref("services.sync.prefs.sync."
			+ "extensions.NOverflow.removeTitleBarGap");
	Services.prefs.clearUserPref("extensions.NOverflow.removeTitleBarGap");
	Services.prefs.clearUserPref("services.sync.prefs.sync."
			+ "extensions.NOverflow.animateTabOpenClose");
	Services.prefs.clearUserPref("extensions.NOverflow.animateTabOpenClose");
}

function startup(data, reason) {
	initAddonNameAsync(data);
	printToLog("startup(tabMinWidth=" + prefValue("tabMinWidth")
			+ ", hideBlankFavicon=" + prefValue("hideBlankFavicon")
			+ ", hideCloseBtn=" + prefValue("hideCloseBtn")
			+ ", slimmerPinnedTabs=" + prefValue("slimmerPinnedTabs")
			+ ", reduceButtonWidth=" + prefValue("reduceButtonWidth")
			+ ", dimPendingTabs=" + prefValue("dimPendingTabs")
			+ ", shrinkAustralisTabs=" + prefValue("shrinkAustralisTabs") + ")");

	loadSheet("styles/stylesheet.css");
	unload(function() {
		unloadSheet("styles/stylesheet.css");
	});

	loadObsPrefWCallback("tabMinWidth", "tabbrowser-tabs", "tabMinWidth", null,
			null, function() {
				var prefVal = prefValue("tabMinWidth");
				if (prefVal < 47)
					return "compact";
				if (prefVal < 62)
					return "normal";
				if (prefVal < 100)
					return "wide";
				return "default";
			});

	loadObsPrefWCallback("hideBlankFavicon", "tabbrowser-tabs");
	loadObsPrefWCallback("hideCloseBtn", "tabbrowser-tabs");
	loadObsPrefWCallback("slimmerPinnedTabs", "tabbrowser-tabs");
	loadObsPrefWCallback("reduceButtonWidth", "appmenu-button",
			"reduceButtonWidth", fixTabPositioning, fixTabPositioning);
	loadObsPrefWCallback("dimPendingTabs", "tabbrowser-tabs");
	loadObsPrefWCallback("shrinkAustralisTabs", "main-window");

	clearOldPrefs();
}

function shutdown(data, reason) {
	if (reason != APP_SHUTDOWN)
		unload();
}

function install() {
}
function uninstall() {
}
