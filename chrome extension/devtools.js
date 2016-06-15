/*
 * XDTools -- A set of tools for cross-device development
 * Copyright (C) 2015 Maria Husmann. All rights reserved.
 *
 * XDTools is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * XDTools is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with XDTools. If not, see <http://www.gnu.org/licenses/>.
 *
 * See the README and LICENSE files for further information.
 *
 */
var socket = io.connect("http://127.0.0.1/devtools");
var removeHash = function(url) {
    // Find first slash after http://
    var end = url.indexOf("#");
    // remove everything after
    url = end > -1 ?  url.substring(0, end) : url;
    return url;
};


socket.on("inspect", function (deviceURL, layer) {
    var func = function (result) {
        var docs = getDocuments(result);
        var exists = existsDocument(result, deviceURL);
    };
    chrome.devtools.inspectedWindow.getResources(func);
    inspectHTML(deviceURL, layer);
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

function inspectHTML(url, layer) {
    var options = {
        frameURL: removeHash(url),
        useContentScriptContext: false
    };
    chrome.devtools.inspectedWindow.eval(
        "inspect(" + layer + ")",
        options
    );
}

function getDocuments(resources) {
    var docs = [];
    for (var i = 0; i < resources.length; ++i) {
        if (resources[i].type === "document") {
            docs.push(resources[i]);
        }
    }
    return docs;
}

function existsDocument(resources, url) {
    for (var i = 0; i < resources.length; ++i) {
        if (resources[i].url === url) {
            return true;
        }
    }
    return false;
}

function inspectFunction(url, functionName) {
    var options = {
        frameURL: removeHash(url),
        useContentScriptContext: false
    };
    chrome.devtools.inspectedWindow.eval(
        "inspect(" + functionName + ")",
        options
    );
}

function debugFunction(url, functionName) {
    var options = {
        frameURL: removeHash(url),
        useContentScriptContext: false
    };
    chrome.devtools.inspectedWindow.eval(
        "debug(" + functionName + ")",
        options
    );
}

function undebugFunction(url, functionName) {
    var options = {
        frameURL: removeHash(url),
        useContentScriptContext: false
    };
    chrome.devtools.inspectedWindow.eval(
        "undebug(" + functionName + ")",
        options
    );
}