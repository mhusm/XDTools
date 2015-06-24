/*
    This file manages everything related to commands:
        - It contains all commands that can be created.
        - It receives all commands from remote and local devices and calls the appropriate function.
*/

$(document).ready(function () {

    socket.on("command", function (command, deviceId) {
        command = JSON.parse(command);
        if (command.name === "log") {
            appendLogToHistory(command.msg, deviceId);
        }
        else if (command.name === "info") {
            appendInfoToHistory(command.msg, deviceId)
        }
        else if (command.name === "warn") {
            appendWarnToHistory(command.msg, deviceId);
        }
        else if (command.name === "error") {
            appendErrorToHistory(command.msg, deviceId);
        }
        else if (command.name === "loaded") {
            addCSSProperties(deviceId);
            $("#device-" + deviceId + " .url").val(command.url);
            //var index = getDeviceIndex(deviceId);
            //activeDevices[index].url = command.url;
        }
        else if (command.name === "breakpointReached") {
            pause(command);
        }
        else {
            console.error("Unknown command");
        }
    });

    window.addEventListener("message", function (ev) {
        var command = JSON.parse(ev.data),
            url = new URL(ev.origin),
            deviceId = url.hostname.substring(0, url.hostname.length - 11);
        if (command.name === "log") {
            appendLogToHistory(command.msg, deviceId);
        }
        else if (command.name === "info") {
            appendInfoToHistory(command.msg, deviceId);
        }
        else if (command.name === "warn") {
            appendWarnToHistory(command.msg, deviceId);
        }
        else if (command.name === "error") {
            appendErrorToHistory(command.msg, deviceId);
        }
        else if (command.name === "loaded") {
            addCSSProperties(deviceId);
            $("#device-" + deviceId + " .url").val(command.url);
            var index = getDeviceIndex(deviceId);
            activeDevices[index].url = command.url;
        }
        else if (command.name === "sendEventSequence") {
            if (!events[command.deviceId]) {
                events[command.deviceId] = [];
            }
            events[command.deviceId].push({"name": "unnamed sequence", "sequence": adjustTiming(command.eventSequence), "position": -1});
            visualizeEventSequences(command.deviceId);
        }
        else if (command.name === "breakpointReached") {
            pause(command);
        }
        else {
            console.error("Unknown command");
        }
    }, false);

});

function Command(name, deviceId) {
    this.name = name;
    this.deviceId = deviceId;
    this.parentDomain = "http://" + window.location.host;
    this.toString = function () {
        return JSON.stringify({"name": this.name, "deviceId": this.deviceId, "parentDomain": this.parentDomain});
    };
    this.send = function (targetIframe, url) {
        targetIframe.contentWindow.postMessage(this.toString(), url);
    };
}

function ReplayCommand(name, deviceId, sequence, breakpoints) {
    Command.call(this, name, deviceId);
    this.eventSequence = sequence;
    this.breakpoints = breakpoints;
    this.toString = function () {
        return JSON.stringify({"name": this.name, "deviceId": this.deviceId, "parentDomain": this.parentDomain, "eventSequence": this.eventSequence, "breakpoints": this.breakpoints});
    };
}

function CSSCommand(name, deviceId, identifier, property, value) {
    Command.call(this, name, deviceId);
    this.identifier = identifier;
    this.property = property;
    this.value = value;
    this.toString = function ()  {
        return JSON.stringify({"name": this.name, "deviceId": this.deviceId, "parentDomain": this.parentDomain, "identifier": this.identifier, "property": this.property, "value": this.value});
    }
}

function JSCommand(name, deviceId, code) {
    Command.call(this, name, deviceId);
    this.code = code;
    this.toString = function () {
        return JSON.stringify({"name": this.name, "deviceId": this.deviceId, "parentDomain": this.parentDomain, "code": this.code});
    }
}