var socket = io.connect("http://127.0.0.1/devtools");

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
        frameURL: url,
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
        frameURL: url,
        useContentScriptContext: false
    };
    chrome.devtools.inspectedWindow.eval(
        "inspect(" + functionName + ")",
        options
    );
}

function debugFunction(url, functionName) {
    var options = {
        frameURL: url,
        useContentScriptContext: false
    };
    chrome.devtools.inspectedWindow.eval(
        "debug(" + functionName + ")",
        options
    );
}

function undebugFunction(url, functionName) {
    var options = {
        frameURL: url,
        useContentScriptContext: false
    };
    chrome.devtools.inspectedWindow.eval(
        "undebug(" + functionName + ")",
        options
    );
}