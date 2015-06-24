$(document).ready(function () {

    var history = [],
        historyPosition = 0;

    $(document).on("click", ".js-device", function () {
        var deviceId = this.dataset.deviceId,
            $history = $("#history");
        if ($(this).hasClass("active")) {
            $(this).css("background-color", "rgba(220, 220, 220, 0.5)");
            $(".line[data-device-id='" + deviceId + "']").each(function () {
                $(this.nextSibling.nextSibling.nextSibling).addClass("hidden");
                $(this.nextSibling.nextSibling).addClass("hidden");
                $(this.nextSibling).addClass("hidden");
                $(this).addClass("hidden");
            });
            removeCSSProperties(deviceId);
            $history.scrollTop($history[0].scrollHeight);
        }
        else {
            var index = colors.map(function (e) { return e.id; }).indexOf(this.dataset.deviceId);
            $(this).css("background-color", "hsla(" + colors[index].color + ", 60%, 50%, 0.3)");
            $(".line[data-device-id='" + deviceId + "']").each(function () {
                $(this.nextSibling.nextSibling.nextSibling).removeClass("hidden");
                $(this.nextSibling.nextSibling).removeClass("hidden");
                $(this.nextSibling).removeClass("hidden");
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

function appendLogToHistory(msg, deviceId) {
    if ($(".js-device[data-device-id='" + deviceId + "']").hasClass("active")) {
        var index = colors.map(function (e) {
            return e.id;
        }).indexOf(deviceId);
        var $history = $("#history");
        $("<span class='log-line line' data-device-id='" + deviceId + "'>< </span>").appendTo($history);
        $("<span>" + msg + "</span>").appendTo($history)
            .css("color", "hsla(" + colors[index].color + ", 70%, 50%, 1)");
        $("<br />").appendTo($history);
        $history.scrollTop($history[0].scrollHeight);
    }
}

function appendInfoToHistory(msg, deviceId) {
    if ($(".js-device[data-device-id='" + deviceId + "']").hasClass("active")) {
        var index = colors.map(function (e) {
            return e.id;
        }).indexOf(deviceId);
        var $history = $("#history");
        $("<span class='info-line line' data-device-id='" + deviceId + "'><span class='glyphicon glyphicon-info-sign'></span> </span>").appendTo($history);
        $("<span>" + msg + "</span>").appendTo($history)
            .css("color", "hsla(" + colors[index].color + ", 70%, 50%, 1)");
        $("<br />").appendTo($history);
        $history.scrollTop($history[0].scrollHeight);
    }
}

function appendWarnToHistory(msg, deviceId) {
    if ($(".js-device[data-device-id='" + deviceId + "']").hasClass("active")) {
        var index = colors.map(function (e) {
            return e.id;
        }).indexOf(deviceId);
        var $history = $("#history");
        $("<span class='warn-line line' data-device-id='" + deviceId + "'><span class='glyphicon glyphicon-warning-sign'></span> </span>").appendTo($history);
        $("<span>" + msg + "</span>").appendTo($history)
            .css("color", "hsla(" + colors[index].color + ", 70%, 50%, 1)");
        $("<br />").appendTo($history);
        $history.scrollTop($history[0].scrollHeight);
    }
}

function appendErrorToHistory(msg, deviceId) {
    if ($(".js-device[data-device-id='" + deviceId + "']").hasClass("active")) {
        var index = colors.map(function (e) {
            return e.id;
        }).indexOf(deviceId);
        var $history = $("#history");
        $("<span class='error-line line' data-device-id='" + deviceId + "'><span class='glyphicon glyphicon-remove-sign'></span> </span>").appendTo($history);
        $("<span>" + msg + "</span>").appendTo($history)
            .css("color", "hsla(" + colors[index].color + ", 70%, 50%, 1)");
        $("<br />").appendTo($history);
        $history.scrollTop($history[0].scrollHeight);
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