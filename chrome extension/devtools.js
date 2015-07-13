var socket = io.connect("http://127.0.0.1/devtools");
socket.on("inspect", function (deviceURL) {
    inspectBody(deviceURL);
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