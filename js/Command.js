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