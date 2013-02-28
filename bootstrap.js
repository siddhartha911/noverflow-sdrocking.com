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

var PREF_ROOT = "extensions.NOverflow.";
var PREF_DEFAULTS = {
	tabMinWidth : 55,
	hideBlankFavicon : true,
	hideCloseBtn : false,
	removeTitleBarGap : true,
	slimmerPinnedTabs : false,
	animateTabOpenClose : false,
	reduceButtonWidth : true,
	dimPendingTabs : true,
	shrinkAustralisTabs: false,
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

initDefaultPrefs(PREF_ROOT, PREF_DEFAULTS, true);

var minWidth, tabClipWidth_o, tabsAnimate_o;

/**
 * Reads value of the pref tabMinWidth; snaps to the nearest in {40, 55, 70}
 */
function readMinWidthPref() {
	prefVal = prefValue("tabMinWidth");
	minWidth = (prefVal < 47) ? "Compact" : (prefVal < 62) ? "Default" : (prefVal < 100) ? "Wide" : "";
}

/**
 * Unload and reload stylesheet only if the snapped value changes
 */
function reloadMinWidthSheet() {
	var prevMinWidth = minWidth;
	readMinWidthPref();
	if (prevMinWidth != minWidth) {
		if (minWidth != "")
			loadSheet("styles/minWidth" + minWidth + ".css");
		if (prevMinWidth != "")
			unloadSheet("styles/minWidth" + prevMinWidth + ".css");
	}
}

function updatePrefs() {
	tabClipWidth_o = Services.prefs.getIntPref("browser.tabs.tabClipWidth");
	Services.prefs.setIntPref("browser.tabs.tabClipWidth", 100);
	printToLog("browser.tabs.tabClipWidth is changed to 100");

	tabsAnimate_o = Services.prefs.getBoolPref("browser.tabs.animate");
	Services.prefs.setBoolPref("browser.tabs.animate",
			prefValue("animateTabOpenClose"));
	printToLog("browser.tabs.animate is changed to "
			+ prefValue("animateTabOpenClose"));

	prefObserve([ "animateTabOpenClose" ], function() {
		Services.prefs.setBoolPref("browser.tabs.animate",
				prefValue("animateTabOpenClose"));
		printToLog("browser.tabs.animate is changed to "
				+ prefValue("animateTabOpenClose"));
	});
}

function resetPrefs() {
	Services.prefs.setIntPref("browser.tabs.tabClipWidth", tabClipWidth_o);
	Services.prefs.setBoolPref("browser.tabs.animate", tabsAnimate_o);
}

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

function startup(data, reason) {
	initAddonNameAsync(data);
	printToLog("startup(tabMinWidth=" + prefValue("tabMinWidth")
			+ ", hideBlankFavicon=" + prefValue("hideBlankFavicon")
			+ ", hideCloseBtn=" + prefValue("hideCloseBtn")
			+ ", slimmerPinnedTabs=" + prefValue("slimmerPinnedTabs")
			+ ", removeTitleBarGap=" + prefValue("removeTitleBarGap")
			+ ", animateTabOpenClose=" + prefValue("animateTabOpenClose")
			+ ", reduceButtonWidth=" + prefValue("reduceButtonWidth")
			+ ", dimPendingTabs=" + prefValue("dimPendingTabs")
			+ ", shrinkAustralisTabs=" + prefValue("shrinkAustralisTabs") + ")");

	reloadMinWidthSheet();
	prefObserve([ "tabMinWidth" ], reloadMinWidthSheet);

	loadAndObserve("hideBlankFavicon", "styles/hideBlankFavicon.css");
	loadAndObserve("hideCloseBtn", "styles/hideCloseBtn.css");
	loadAndObserve("removeTitleBarGap", "styles/removeTitleBarGap.css");
	loadAndObserve("slimmerPinnedTabs", "styles/slimmerPinnedTabs.css");
	loadAndObserve("reduceButtonWidth", "styles/reduceButtonWidth.css",
			fixTabPositioning);
	fixTabPositioning();
	loadAndObserve("dimPendingTabs", "styles/dimPendingTabs.css");
	loadAndObserve("shrinkAustralisTabs", "styles/australisStyling.css");

	updatePrefs();
}

function shutdown(data, reason) {
	resetPrefs();

	if (reason == APP_SHUTDOWN)
		return;

	unloadSheet("styles/minWidth" + minWidth + ".css");
	unload();
	fixTabPositioning();
}

function install() {
}
function uninstall() {
}
