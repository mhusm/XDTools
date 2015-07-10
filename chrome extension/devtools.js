// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// The function below is executed in the context of the inspected page.
var page_getProperties = function() {
  var data = window.jQuery && $0 ? jQuery.data($0) : {};
  // Make a shallow copy with a null prototype, so that sidebar does not
  // expose prototype.
  var props = Object.getOwnPropertyNames(data);
  var copy = { __proto__: null };
  for (var i = 0; i < props.length; ++i)
    copy[props[i]] = data[props[i]];
  return copy;
}

var socket = io.connect("http://127.0.0.1/devtools");
socket.on("inspect", function (deviceURL) {
    inspectBody(deviceURL);
    chrome.runtime.restart();
});

socket.on("debug", function (deviceURL, functionName) {
    debugFunction(deviceURL, functionName);
});

socket.on("undebug", function (deviceURL, functionName) {
    undebugFunction(deviceURL, functionName);
});

socket.on("inspectFunction", function (deviceURL, functionName) {
    inspectFunction(deviceURL, functionName);
});

chrome.devtools.panels.elements.createSidebarPane(
    "jQuery Properties",
    function(sidebar) {
  function updateElementProperties() {
    sidebar.setExpression("(" + page_getProperties.toString() + ")()");
  }
  updateElementProperties();
  chrome.devtools.panels.elements.onSelectionChanged.addListener(
      updateElementProperties);
});

function inspectBody(url) {
    var options = {
        frameURL: url,
        useContentScriptContext: false
    }
    chrome.devtools.inspectedWindow.eval(
        "inspect(document.body)",
        options
    );
}

function inspectFunction(url, functionName) {
    var options = {
        frameURL: url,
        useContentScriptContext: false
    }
    chrome.devtools.inspectedWindow.eval(
        "inspect(" + functionName + ")",
        options
    );
}

function debugFunction(url, functionName) {
    var options = {
        frameURL: url,
        useContentScriptContext: false
    }
    chrome.devtools.inspectedWindow.eval(
        "debug(" + functionName + ")",
        options
    );
}

function undebugFunction(url, functionName) {
    var options = {
        frameURL: url,
        useContentScriptContext: false
    }
    chrome.devtools.inspectedWindow.eval(
        "undebug(" + functionName + ")",
        options
    );
}