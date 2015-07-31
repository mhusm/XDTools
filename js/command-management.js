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
    if (command.name === "log" || command.name === "info" || command.name === "warn" || command.name === "error" || command.name ==="return") {
        jsConsole.appendMessage(command.msg, deviceID, command.name);
    }
    else if (command.name === "exception") {
        jsConsole.appendException(command.msg, deviceID);
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
    else if (command.name === "layers") {
        updateLayers(command.layers);
        var index = getDeviceIndex(deviceID);
        activeDevices[index].setLayers(command.layers);
    }
    else if (command.name === "receiveConnectionURL") {
        console.log("receiveConnectionURL");
        var deviceIndex = getDeviceIndex(command.deviceID);
        activeDevices[deviceIndex].connect(command.url);
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
}

function ReplayCommand(name, deviceID, sequence, breakpoints) {
    Command.call(this, name, deviceID);
    this.eventSequence = sequence;
    this.breakpoints = breakpoints;
    this.toString = function () {
        return JSON.stringify({"name": this.name, "deviceID": this.deviceID, "parentDomain": this.parentDomain, "eventSequence": this.eventSequence, "breakpoints": this.breakpoints});
    };
}

function CSSCommand(name, deviceID, identifier, property, value, layer) {
    Command.call(this, name, deviceID);
    this.identifier = identifier;
    this.property = property;
    this.value = value;
    this.layer = layer;
    this.toString = function ()  {
        return JSON.stringify({"name": this.name, "deviceID": this.deviceID, "parentDomain": this.parentDomain, "identifier": this.identifier, "property": this.property, "value": this.value, "layer": this.layer});
    }
}

function JSCommand(name, deviceID, code) {
    var selectedLayer = $("#layer option:selected").val(),
        index = getDeviceIndex(deviceID);
    this.layer = "";
    if (activeDevices[index].hasLayer(selectedLayer)) {
        this.layer = selectedLayer;
    }
    Command.call(this, name, deviceID);
    this.code = code;
    this.toString = function () {
        return JSON.stringify({"name": this.name, "deviceID": this.deviceID, "parentDomain": this.parentDomain, "code": this.code, "layer": this.layer});
    }
}

//Check if a string is valid JSON
function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}