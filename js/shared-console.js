$(document).ready(function (ev) {

    var history = [],
        historyPostion = 0;

    $(document).on("click", ".js-device", function () {
        $(this).toggleClass("active");
    });

    $("#toggle-js-console").click(function () {
        $(this).find("span").toggleClass("glyphicon-triangle-bottom").toggleClass("glyphicon-triangle-top");
    });

    $("#code-input").keyup(function (ev) {
        if (ev.which === 13) {
            $("#history").append("<span class='history-line'>></span> " + $(this).val() + "<br />");
            history.push($(this).val());
            historyPosition = history.length;
            sendJavascriptCommand($(this).val());
            $(this).val("");
        }
        else if (ev.which === 38) {
            historyPosition--;
            if (historyPosition >= 0) {
                $(this).val(history[historyPosition]);
            }
            else {
                historyPosition = 0;
                $(this).val(history[0]);
            }
        }
        else if (ev.which === 40) {
            historyPosition++;
            if (historyPosition < history.length) {
                $(this).val(history[historyPosition]);
            }
            else {
                historyPosition = history.length;
                $(this).val("");
            }
        }
        else {
            historyPosition = history.length;
        }
    });

});

function sendJavascriptCommand(code) {
    $(".js-device.active").each(function () {
        if (remoteDevices.indexOf(this.dataset.devid) !== -1) {
            socket.emit("executeJS", this.dataset.devid, code);
        }
        else {
            var i = getDeviceIndex(this.dataset.devid);
            var command = new JSCommand("executeJS", activeDevices[i].id, code);
            command.send($("#device-" + activeDevices[i].id + " iframe")[0], activeDevices[i].url);
        }
    });
}

function CSSCommand(name, deviceId, target, property, value) {
    Command.call(this, name, deviceId);
    this.target = target;
    this.property = property;
    this.value = value;
    this.toString = function ()  {
        return JSON.stringify({"name": this.name, "deviceId": this.deviceId, "parentDomain": this.parentDomain, "target": this.target, "propery": this.property, "value": this.value});
    }
}

function JSCommand(name, deviceId, code) {
    Command.call(this, name, deviceId);
    this.code = code;
    this.toString = function () {
        return JSON.stringify({"name": this.name, "deviceId": this.deviceId, "parentDomain": this.parentDomain, "code": this.code});
    }
}