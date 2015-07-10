/*
    This file manages everything related to commands:
        - It contains all commands that can be created.
        - It receives all commands from remote and local devices and calls the appropriate function.
*/

$(document).ready(function () {

    socket.on("command", function (command, deviceID) {
        command = JSON.parse(command);
        processCommand(command, deviceID);
    });

    window.addEventListener("message", function (ev) {
        //Checking if ev.data is JSON is needed because YouTube API sends some strange messages that cannot be parsed
        //TODO: find another solution?
        if (isJson(ev.data)) {
            var command = JSON.parse(ev.data),
                url = new URL(ev.origin),
                deviceID = url.hostname.substring(0, url.hostname.length - 11);
            processCommand(command, deviceID);
        }
    }, false);

});

//Process the command and call the appropriate function
function processCommand(command, deviceID) {
    if (command.name === "log") {
        appendLogToHistory(command.msg, deviceID);
    }
    else if (command.name === "info") {
        appendInfoToHistory(command.msg, deviceID);
    }
    else if (command.name === "warn") {
        appendWarnToHistory(command.msg, deviceID);
    }
    else if (command.name === "error") {
        appendErrorToHistory(command.msg, deviceID);
    }
    else if (command.name === "exception") {
        appendExceptionToHistory(command.msg, deviceID);
    }
    else if (command.name ==="return") {
        appendReturnValueToHistory(command.msg, deviceID);
    }
    else if (command.name === "loaded") {
        addCSSProperties(deviceID);
        $("#device-" + deviceID + " .url").val(command.url);
        var index = getDeviceIndex(deviceID);
        activeDevices[index].setUrl(command.url);
    }
    else if (command.name === "sendEventSequence") {
        if (!events[command.deviceID]) {
            events[command.deviceID] = [];
        }
        events[command.deviceID].push({"name": "unnamed sequence", "sequence": adjustTiming(command.eventSequence), "position": -1});
        visualizeEventSequences(command.deviceID);
    }
    else if (command.name === "breakpointReached") {
        pause(command);
    }
    else {
        console.error("Unknown command");
    }
}

function Command(name, deviceID) {
    this.name = name;
    this.deviceID = deviceID;
    this.parentDomain = "http://" + window.location.host;
    this.toString = function () {
        return JSON.stringify({"name": this.name, "deviceID": this.deviceID, "parentDomain": this.parentDomain});
    };
    this.send = function (targetIframe, url) {
        targetIframe.contentWindow.postMessage(this.toString(), url);
    };
}

function ReplayCommand(name, deviceID, sequence, breakpoints) {
    Command.call(this, name, deviceID);
    this.eventSequence = sequence;
    this.breakpoints = breakpoints;
    this.toString = function () {
        return JSON.stringify({"name": this.name, "deviceID": this.deviceID, "parentDomain": this.parentDomain, "eventSequence": this.eventSequence, "breakpoints": this.breakpoints});
    };
}

function CSSCommand(name, deviceID, identifier, property, value) {
    Command.call(this, name, deviceID);
    this.identifier = identifier;
    this.property = property;
    this.value = value;
    this.toString = function ()  {
        return JSON.stringify({"name": this.name, "deviceID": this.deviceID, "parentDomain": this.parentDomain, "identifier": this.identifier, "property": this.property, "value": this.value});
    }
}

function JSCommand(name, deviceID, code) {
    Command.call(this, name, deviceID);
    this.code = code;
    this.toString = function () {
        return JSON.stringify({"name": this.name, "deviceID": this.deviceID, "parentDomain": this.parentDomain, "code": this.code});
    }
}

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}