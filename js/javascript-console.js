$(document).ready(function () {

    var history = [],
        historyPosition = 0;

    $("#filter").keyup(function () {
        var filterVal = $(this).val();
        filterByName(filterVal.toLowerCase());
    });

    $("#javascript-console").find(".category").click(function () {
        $("#javascript-console").find(".category").removeClass("marked");
        $(this).addClass("marked");
        if ($(this).text() === "All") {
            filterAll();
        }
        else if ($(this).text() === "Errors") {
            filterErrors();
        }
        else if ($(this).text() === "Warnings") {
            filterWarnings();
        }
        else if ($(this).text() === "Info") {
            filterInfo();
        }
        else if ($(this).text() === "Logs") {
            filterLogs();
        }
    });

    $(document).on("click", ".collapse-stack", function () {
        var $history = $("#history");
        $(this.nextSibling).slideToggle();
        $(this).toggleClass("glyphicon-collapse-down");
        $(this).toggleClass("glyphicon-collapse-up");
        $history.scrollTop($history[0].scrollHeight);
    });

    $(document).on("click", ".js-device", function () {
        var deviceID = this.dataset.deviceId,
            $history = $("#history");
        if ($(this).hasClass("active")) {
            $(this).css("background-color", "rgba(220, 220, 220, 0.5)");
            $(".history-line[data-device-id='" + deviceID + "']").each(function () {
                $(this).addClass("hidden");
            });
            removeCSSProperties(deviceID);
            $history.scrollTop($history[0].scrollHeight);
            undebugDevice(deviceID);
        }
        else {
            var index = colors.map(function (e) { return e.id; }).indexOf(this.dataset.deviceId);
            $(this).css("background-color", "hsla(" + colors[index].color + ", 60%, 50%, 0.3)");
            $(".history-line[data-device-id='" + deviceID + "']").each(function () {
                $(this).removeClass("hidden");
            });
            reactivateCSSProperties(deviceID);
            $history.scrollTop($history[0].scrollHeight);
            debugDevice(deviceID);
        }
        $(this).toggleClass("active");
    });

    $("#toggle-js-console").click(function () {
        $(this).find("span").toggleClass("glyphicon-triangle-bottom").toggleClass("glyphicon-triangle-top");
    });

    $("#code-input").keyup(function (ev) {
        if (ev.which === 13) {
            $("#history").append("<div class='history-line'><span class='hist-line'>></span> <span class='content'>" + $(this).val() + "</span></div>");
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

    $(document).on("click", ".debug-js-error", function () {
        var func = $(this).closest(".history-line").find(".error-function").text();
        debugJSError(func);
        $(".popover").popover("hide");
    });

});

function debugJSError(total) {
    var layer = "",
        name = "";
    if (total.indexOf(".") !== -1) {
        name = total.substring(total.lastIndexOf(".") + 1);
        var tempLayer = total.substring(0, total.indexOf("."));
        for (var i = 0; i < layers.length; ++i) {
            if (layers[i].name.indexOf(tempLayer) === 0) {
                layer = layers[i].path.join(".");
            }
        }
    }
    else {
        name = total;
        layer = "";
    }
    appendDebugFunction(name, layer);
    debugAllDevices(name, layer);
}

function filterByName(filter) {
    $("#javascript-console").find(".content").each(function () {
        var text = $(this).text();
        if (text.toLowerCase().indexOf(filter) === -1) {
            $(this).closest(".history-line").addClass("filteredOutByName");
        }
        else {
            $(this).closest(".history-line").removeClass("filteredOutByName");
        }
    });
}

function filterAll() {
    $("#javascript-console").find(".history-line").removeClass("filteredOut");
}

function filterErrors() {
    $jsConsole = $("#javascript-console");
    $jsConsole.find(".history-line").removeClass("filteredOut");
    $jsConsole.find(".history-line").each(function () {
        if ($(this).find(".error-line").length === 0) {
            $(this).closest(".history-line").addClass("filteredOut");
        }
    });
}

function filterWarnings() {
    $jsConsole = $("#javascript-console");
    $jsConsole.find(".history-line").removeClass("filteredOut");
    $jsConsole.find(".history-line").each(function () {
        if ($(this).find(".warn-line").length === 0) {
            $(this).closest(".history-line").addClass("filteredOut");
        }
    });
}

function filterInfo() {
    $jsConsole = $("#javascript-console");
    $jsConsole.find(".history-line").removeClass("filteredOut");
    $jsConsole.find(".history-line").each(function () {
        if ($(this).find(".info-line").length === 0) {
            $(this).closest(".history-line").addClass("filteredOut");
        }
    });
}

function filterLogs() {
    $jsConsole = $("#javascript-console");
    $jsConsole.find(".history-line").removeClass("filteredOut");
    $jsConsole.find(".history-line").each(function () {
        if ($(this).find(".log-line").length === 0) {
            $(this).closest(".history-line").addClass("filteredOut");
        }
    });
}

function appendLogToHistory(msg, deviceID) {
    if ($(".js-device[data-device-id='" + deviceID + "']").hasClass("active")) {
        var index = colors.map(function (e) {
            return e.id;
        }).indexOf(deviceID);
        var $history = $("#history");
        var message = "<div class='history-line' data-device-id='" + deviceID + "'><span class='log-line'>< </span>";
        message = message + "<span class='content'>" + process(msg) + "</span>";
        message = message + "</div>";
        $(message).appendTo($history)
            .css("color", "hsla(" + colors[index].color + ", 70%, 50%, 1)");
        $history.scrollTop($history[0].scrollHeight);
    }
}

function appendInfoToHistory(msg, deviceID) {
    if ($(".js-device[data-device-id='" + deviceID + "']").hasClass("active")) {
        var index = colors.map(function (e) {
            return e.id;
        }).indexOf(deviceID);
        var $history = $("#history");
        var message = "<div class='history-line' data-device-id='" + deviceID + "'><span class='info-line'><span class='glyphicon glyphicon-info-sign'></span> </span>";
        message = message + "<span class='content'>" + process(msg) + "</span>";
        message = message + "</div>";
        $(message).appendTo($history)
            .css("color", "hsla(" + colors[index].color + ", 70%, 50%, 1)");
        $history.scrollTop($history[0].scrollHeight);
    }
}

function appendWarnToHistory(msg, deviceID) {
    if ($(".js-device[data-device-id='" + deviceID + "']").hasClass("active")) {
        var index = colors.map(function (e) {
            return e.id;
        }).indexOf(deviceID);
        var $history = $("#history");
        var message = "<div class='history-line' data-device-id='" + deviceID + "'><span class='warn-line'><span class='glyphicon glyphicon-warning-sign'></span> </span>";
        message = message + "<span class='content'>" + process(msg) + "</span></div>";
        $(message).appendTo($history)
            .css("color", "hsla(" + colors[index].color + ", 70%, 50%, 1)");
        $history.scrollTop($history[0].scrollHeight);
    }
}

function appendErrorToHistory(msg, deviceID) {
    if ($(".js-device[data-device-id='" + deviceID + "']").hasClass("active")) {
        var index = colors.map(function (e) {
            return e.id;
        }).indexOf(deviceID);
        var $history = $("#history");
        var message = "<div class='history-line' data-device-id='" + deviceID + "'><span class='error-line'><span class='glyphicon glyphicon-remove-sign'></span> </span>";
        message = message + "<span class='content'>" + process(msg) + "</span>";
        message = message + "</div>";
        $(message).appendTo($history)
            .css("color", "hsla(" + colors[index].color + ", 70%, 50%, 1)");
        $history.scrollTop($history[0].scrollHeight);
    }
}

function appendExceptionToHistory(msg, deviceID) {
    if ($(".js-device[data-device-id='" + deviceID + "']").hasClass("active")) {
        var index = colors.map(function (e) {
            return e.id;
        }).indexOf(deviceID);
        var $history = $("#history");
        var splittedError = msg.split(" at ");
        var message = "<div class='history-line' data-device-id='" + deviceID + "'><span class='error-line'><span class='glyphicon glyphicon-remove-sign'></span></span>";
        if (splittedError.length > 1) {
            var func = getFunction(splittedError[1]);
            splittedError[1] = splittedError[1].replace(func, "<span class='error-function'>" + func + "</span>");
            message = message + "<span class='content'>" + splittedError[0] + "</span><span class='glyphicon glyphicon-collapse-down collapse-stack'></span><span class='stack'>";
            for (var i = 1, j = splittedError.length; i < j; ++i) {
                message = message + "<div class='stack-line'>at " + splittedError[i] + "</div>";
            }
            message = message + "</span></div>";
        }
        else {
            message = message + "<span class='content'>" + splittedError[0] + "</span>";
            message = message + "</div>";
        }
        $(message).appendTo($history)
            .css("color", "hsla(" + colors[index].color + ", 70%, 50%, 1)")
            .find(".error-function")
            .popover({
                placement: 'bottom',
                container: '.history-line[data-device-id="' + deviceID + '"]',
                trigger: 'click',
                html: true,
                content: "<button type='button' class='btn btn-default btn-sm debug-js-error'>Debug</button>"
            });
        $history.scrollTop($history[0].scrollHeight);
    }
}

function appendReturnValueToHistory(msg, deviceID) {
    if ($(".js-device[data-device-id='" + deviceID + "']").hasClass("active")) {
        var index = colors.map(function (e) {
            return e.id;
        }).indexOf(deviceID);
        var $history = $("#history");
        var message = "<div class='history-line' data-device-id='" + deviceID + "'><span class='log-line'><- </span>";
        message = message + "<span class='content'>" + process(msg) + "</span></div>";
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

function getFunction(error) {
    error = error.substring(0, error.indexOf(" "));
    return error;
}

//TODO: finish this
function generateObjectHTML(obj) {
    if (obj === null) {
        return "null";
    }
    else if (obj === "" || obj === 0) {
        return obj;
    }
    else if (!obj) {
        return "undefined";
    }
    else if (typeof obj === "object" || obj instanceof Object) {
        if (Object.prototype.toString.call(obj) === '[object Array]') {
            return "[]";
            var newobj = "[";
            var elements = [];
            for (var i = 0; i < obj.length; ++i) {
                elements.push(generateObjectHTML(obj[i]));
            }
            newobj = newobj + elements.join("; ") + "]";
            return newobj;
        }
        else {
            var keys = Object.keys(obj);
            var newobject = "Object ";
            for (var i = 0; i < keys.length; ++i) {
                newobject = newobject + "<br />" + keys[i] + ": ";
                newobject = newobject + generateObjectHTML(obj[keys[i]]);
            }
            return newobject;
        }
    }
    else {
        return obj;
    }
}