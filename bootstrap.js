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

const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import("resource://gre/modules/Services.jsm");

let sss = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
let ios = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);

var minWidth, tabClipWidth_o, tabsAnimate_o;

/* Function adapted from the extension "Restartless Restart" by Eric Vold */
(function(global) global.include = function include(src) {
  var o = {};
  Cu.import("resource://gre/modules/Services.jsm", o);
  var uri = o.Services.io.newURI(src, null, o.Services.io.newURI(__SCRIPT_URI_SPEC__, null, null));
  o.Services.scriptloader.loadSubScript(uri.spec, global);
})(this);

include("scripts/utils.js");
include("scripts/pref.js");
include("scripts/helpers.js");

/* Reads value of the pref tabMinWidth to minWidth; snaps to the nearest value in {36, 54, 72} */
function readMinWidthPref() {
  let prefVal = pref("tabMinWidth");
  minWidth = (prefVal < 45) ? 36 : (prefVal < 64) ? 54 : 72;
}

/* Unload and reload stylesheet only if the snapped value changes */
function reloadMinWidthSheet() {
  let prevMinWidth = minWidth;
  readMinWidthPref();
  if(prevMinWidth != minWidth) {
    loadSheet("styles/minWidth" + minWidth + ".css");
    unloadSheet("styles/minWidth" + prevMinWidth + ".css");
  }
}

function updatePrefs() {
  tabClipWidth_o = Services.prefs.getIntPref("browser.tabs.tabClipWidth");
  Services.prefs.setIntPref("browser.tabs.tabClipWidth", 100);
  printToLog("browser.tabs.tabClipWidth is changed to 100");

  tabsAnimate_o = Services.prefs.getBoolPref("browser.tabs.animate");
  Services.prefs.setBoolPref("browser.tabs.animate", pref("animateTabOpenClose"));
  printToLog("browser.tabs.animate is changed to " + pref("animateTabOpenClose"));

  pref.observe(["animateTabOpenClose"], function() {
    Services.prefs.setBoolPref("browser.tabs.animate", pref("animateTabOpenClose"));
    printToLog("browser.tabs.animate is changed to " + pref("animateTabOpenClose"));
  });
}

function resetPrefs() {
  Services.prefs.setIntPref("browser.tabs.tabClipWidth", tabClipWidth_o);
  Services.prefs.setBoolPref("browser.tabs.animate", tabsAnimate_o);
}

function startup(data, reason) {
  initAddonNameAsync(data);
  printToLog("startup(tabMinWidth=" + pref("tabMinWidth") + ", hideBlankFavicon=" 
    + pref("hideBlankFavicon") + ", hideCloseBtn=" + pref("hideCloseBtn") + ", slimmerPinnedTabs=" 
    + pref("slimmerPinnedTabs") + ", removeTitleBarGap=" + pref("removeTitleBarGap") 
    + ", animateTabOpenClose=" + pref("animateTabOpenClose") + ")");

  reloadMinWidthSheet();
  pref.observe(["tabMinWidth"], 
    reloadMinWidthSheet
  );

  loadAndObserve("hideBlankFavicon", "styles/hideBlankFavicon.css");
  loadAndObserve("hideCloseBtn", "styles/hideCloseBtn.css");
  loadAndObserve("removeTitleBarGap", "styles/removeTitleBarGap.css");
  loadAndObserve("slimmerPinnedTabs", "styles/slimmerPinnedTabs.css");

  updatePrefs();
}

function shutdown(data, reason) {
  resetPrefs();

  if(reason == APP_SHUTDOWN)  return;

  unloadSheet("styles/minWidth" + minWidth + ".css");
  unload();
}

function install() {}
function uninstall() {}
