//Process the command and call the appropriate function
function processCommand(command, deviceID) {
    else if (command.name === "object") {
        //TODO
    }
}

function ObserveCommand(name, deviceID, code) {
    Command.call(this, name, deviceID);
    this.code = code;
    this.toString = function () {
        return JSON.stringify({"name": this.name, "deviceID": this.deviceID, "parentDomain": this.parentDomain, "code": this.code});
    };
}