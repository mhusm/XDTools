$(document).ready(function () {

    var history = [],
        historyPosition = 0;

    $(document).on("click", ".collapse-stack", function () {
        var $history = $("#history");
        $(this.nextSibling).slideToggle();
        $(this).toggleClass("glyphicon-collapse-down");
        $(this).toggleClass("glyphicon-collapse-up");
        $history.scrollTop($history[0].scrollHeight);
    });

    $(document).on("click", ".js-device", function () {
        var deviceId = this.dataset.deviceId,
            $history = $("#history");
        if ($(this).hasClass("active")) {
            $(this).css("background-color", "rgba(220, 220, 220, 0.5)");
            $(".history-line[data-device-id='" + deviceId + "']").each(function () {
                $(this).addClass("hidden");
            });
            removeCSSProperties(deviceId);
            $history.scrollTop($history[0].scrollHeight);
        }
        else {
            var index = colors.map(function (e) { return e.id; }).indexOf(this.dataset.deviceId);
            $(this).css("background-color", "hsla(" + colors[index].color + ", 60%, 50%, 0.3)");
            $(".history-line[data-device-id='" + deviceId + "']").each(function () {
                $(this).removeClass("hidden");
            });
            reactivateCSSProperties(deviceId);
            $history.scrollTop($history[0].scrollHeight);
        }
        $(this).toggleClass("active");
    });

    $("#toggle-js-console").click(function () {
        $(this).find("span").toggleClass("glyphicon-triangle-bottom").toggleClass("glyphicon-triangle-top");
    });

    $("#code-input").keyup(function (ev) {
        if (ev.which === 13) {
            $("#history").append("<span class='hist-line'>></span> " + $(this).val() + "<br />");
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

function appendLogToHistory(msg, deviceId) {
    if ($(".js-device[data-device-id='" + deviceId + "']").hasClass("active")) {
        var index = colors.map(function (e) {
            return e.id;
        }).indexOf(deviceId);
        var $history = $("#history");
        var message = "<div class='history-line' data-device-id='" + deviceId + "'><span class='log-line'>< </span>";
        message = message + "<span>" + process(msg) + "</span>";
        message = message + "</div>";
        $(message).appendTo($history)
            .css("color", "hsla(" + colors[index].color + ", 70%, 50%, 1)");
        $history.scrollTop($history[0].scrollHeight);
    }
}

function appendInfoToHistory(msg, deviceId) {
    if ($(".js-device[data-device-id='" + deviceId + "']").hasClass("active")) {
        var index = colors.map(function (e) {
            return e.id;
        }).indexOf(deviceId);
        var $history = $("#history");
        var message = "<div class='history-line' data-device-id='" + deviceId + "'><span class='info-line'><span class='glyphicon glyphicon-info-sign'></span> </span>";
        message = message + "<span>" + process(msg) + "</span>";
        message = message + "</div>";
        $(message).appendTo($history)
            .css("color", "hsla(" + colors[index].color + ", 70%, 50%, 1)");
        $history.scrollTop($history[0].scrollHeight);
    }
}

function appendWarnToHistory(msg, deviceId) {
    if ($(".js-device[data-device-id='" + deviceId + "']").hasClass("active")) {
        var index = colors.map(function (e) {
            return e.id;
        }).indexOf(deviceId);
        var $history = $("#history");
        var message = "<div class='history-line' data-device-id='" + deviceId + "'><span class='warn-line'><span class='glyphicon glyphicon-warning-sign'></span> </span>";
        message = message + "<span>" + process(msg) + "</span></div>";
        $(message).appendTo($history)
            .css("color", "hsla(" + colors[index].color + ", 70%, 50%, 1)");
        $history.scrollTop($history[0].scrollHeight);
    }
}

function appendErrorToHistory(msg, deviceId) {
    if ($(".js-device[data-device-id='" + deviceId + "']").hasClass("active")) {
        var index = colors.map(function (e) {
            return e.id;
        }).indexOf(deviceId);
        var $history = $("#history");
        var message = "<div class='history-line' data-device-id='" + deviceId + "'><span class='error-line'><span class='glyphicon glyphicon-remove-sign'></span> </span>";
        message = message + "<span>" + process(msg) + "</span>";
        message = message + "</div>"
        $(message).appendTo($history)
            .css("color", "hsla(" + colors[index].color + ", 70%, 50%, 1)");
        $history.scrollTop($history[0].scrollHeight);
    }
}

function appendExceptionToHistory(msg, deviceId) {
    if ($(".js-device[data-device-id='" + deviceId + "']").hasClass("active")) {
        var index = colors.map(function (e) {
            return e.id;
        }).indexOf(deviceId);
        var $history = $("#history");
        var splittedError = msg.split(" at ");
        var message = "<div class='history-line' data-device-id='" + deviceId + "'><span class='error-line'><span class='glyphicon glyphicon-remove-sign'></span> </span>";
        if (splittedError.length > 1) {
            message = "<span>" + message + splittedError[0] + "<span class='glyphicon glyphicon-collapse-down collapse-stack'></span><span class='stack'>";
            for (var i = 1, j = splittedError.length; i < j; ++i) {
                message = message + "<div class='stack-line'>at " + splittedError[i] + "</div>";
            }
            message = message + "</span></span></div>";
        }
        else {
            message = "<span>" + message + splittedError[0] + "</span>";
            message = message + "</span></span></div>";
        }
        $(message).appendTo($history)
            .css("color", "hsla(" + colors[index].color + ", 70%, 50%, 1)");
        $history.scrollTop($history[0].scrollHeight);
    }
}

function appendReturnValueToHistory(msg, deviceId) {
    if ($(".js-device[data-device-id='" + deviceId + "']").hasClass("active")) {
        var index = colors.map(function (e) {
            return e.id;
        }).indexOf(deviceId);
        var $history = $("#history");
        var message = "<div class='history-line' data-device-id='" + deviceId + "'><span class='log-line'><- </span>";
        message = message + "<span>" + process(msg) + "</span></div>";
        $(message).appendTo($history)
            .css("color", "hsla(" + colors[index].color + ", 70%, 50%, 1)");
        $history.scrollTop($history[0].scrollHeight);
    }
}

//If the console output is a string and we do not parse it, it will be displayed with quotes
//If the console output is an object, it can only be logged if it is not parsed
function process(msg) {
    var parsed = JSON.parse(msg);
    if (typeof parsed === "string" || parsed instanceof String) {
        return parsed;
    }
    else {
        return msg;
    }
}

function sendJavascriptCommand(code) {
    if (code === "console.clear()") {
        $("#history").text("");
    }
    else {
        $(".js-device.active").each(function () {
            var index = getDeviceIndex(this.dataset.deviceId),
                command = new JSCommand("executeJS", activeDevices[index].id, code);
            activeDevices[index].sendCommand(command);
        });
    }
}