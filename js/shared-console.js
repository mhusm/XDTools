$(document).ready(function (ev) {

    var history = [],
        historyPosition = 0;

    $(document).on("focus", ".identifier.empty, .property.empty, .value.empty", function () {
        $(this).text("");
    });

    $(document).on("focus", ".property", function () {
       if (!$(this).hasClass("empty")) {
           var prevValue = $(this).text();
           $(this).one("blur", {"prevValue": prevValue}, function (ev) {
               var identifier = $(this).parent().parent().parent().find(".identifier").text();
               var value = $(this.nextSibling.nextSibling).text();
               addCSSProperty("restore", identifier, ev.data.prevValue, value);
           });
       }
    });

    $(document).on("focus", ".identifier", function () {
        if (!$(this).hasClass("empty")) {
            var prevValue = $(this).text();
            $(this).one("blur", {"prevValue": prevValue}, function (ev) {
                var props = $(this.parentNode).find(".content .line-wrapper");
                for (var i = 0; i < props.length; ++i) {
                    if (!$(props[i]).find(".property").hasClass("empty") && !$(props[i]).find(".value").hasClass("empty")) {
                        var property = $(props[i]).find(".property").text();
                        var value = $(props[i]).find(".value").text();
                        if (property) {
                            addCSSProperty("restore", ev.data.prevValue, property, value);
                        }
                    }
                }
            });
        }
    });

    $(document).on("click", "#css-console .line-wrapper input[type=checkbox]", function () {
        var property = $(this.nextSibling).text();
        var identifier = $(this).parent().parent().parent().find(".identifier").text();
        var value = $(this.nextSibling.nextSibling.nextSibling).text();
        if ($(this).is(":checked") && !$(this.nextSibling).hasClass("empty") && !$(this.nextSibling.nextSibling.nextSibling).hasClass("empty")) {
            addCSSProperty("updateCSS", identifier, property, value);
        }
        else if (!$(this.nextSibling).hasClass("empty") && !$(this.nextSibling.nextSibling.nextSibling).hasClass("empty")){
            addCSSProperty("restore", identifier, property, value);
        }
    });

    $(document).on("blur", ".identifier", function () {
        if ($(this).hasClass("empty")) {
            if ($(this).text()) {
                $(this).removeClass("empty");
                $("<div class='css-property'>" +
                "<span class='identifier empty'>enter identifier...</span> {<br />" +
                "<span class='content'></span>" +
                "}<br /></div><br />").prependTo("#css-console .properties");
                $("<span class='line-wrapper'>" +
                    "<input type='checkbox' name='property4' value='property4' checked>" +
                    "<span class='property empty'>enter property...</span>" +
                    ": <span class='value empty'>enter value...</span>;</span><br />"
                )
                    .appendTo($(this).parent().find(".content"))
                    .find(".property:last").attr("contenteditable", true).focus();
            }
            else {
                $(this).text("enter identifier...");
            }
        }
        else {
            var identifier = $(this).text();
            var props = $(this.parentNode).find(".content .line-wrapper");
            for (var i = 0; i < props.length; ++i) {
                if (!$(props[i]).find(".property").hasClass("empty") && !$(props[i]).find(".value").hasClass("empty")) {
                    var property = $(props[i]).find(".property").text();
                    var value = $(props[i]).find(".value").text();
                    if (property && value) {
                        addCSSProperty("updateCSS", identifier, property, value);
                    }
                }
            }
        }
    });
    $(document).on("keypress", ".identifier.empty", function () {
        if (ev.which === 13) {
            ev.preventDefault();
            $(this).blur();
        }
    });

    $(document).on("blur", ".property", function () {
        if ($(this).hasClass("empty")) {
            if ($(this).text()) {
                $(this).removeClass("empty");
                $(this.nextSibling.nextSibling).attr("contenteditable", "true").focus();
            }
            else {
                $(this).text("enter property...");
            }
        }
        else {
            var property = $(this).text();
            var value = $(this.nextSibling.nextSibling).text();
            var identifier = $(this).parent().parent().parent().find(".identifier").text();
            addCSSProperty("updateCSS", identifier, property, value);
        }
    });
    $(document).on("keypress", ".property", function (ev) {
        if (ev.which === 13) {
            ev.preventDefault();
            $(this).blur();
        }
    });

    $(document).on("blur", ".value", function () {
        var value = $(this).text();
        var property = $(this.previousSibling.previousSibling).text();
        var identifier = $(this).parent().parent().parent().find(".identifier").text();
        if ($(this).hasClass("empty")) {
            if ($(this).text()) {
                $(this).removeClass("empty");
                $("<span class='line-wrapper'>" +
                    "<input type='checkbox' name='property4' value='property4' checked>" +
                    "<span class='property empty'>enter property...</span>" +
                    ": <span class='value empty'>enter value...</span>;</span><br />"
                ).appendTo($(this).parent().parent());
                addCSSProperty("updateCSS", identifier, property, value);
            }
            else {
                $(this).text("enter value...");
            }
        }
        else {
            addCSSProperty("updateCSS", identifier, property, value);
        }
    });
    $(document).on("keypress", ".value", function () {
        if (ev.which === 13) {
            ev.preventDefault();
            $(this).blur();
        }
    });

    $(document).on("click", ".identifier, .property, .value", function () {
        $(this).attr("contenteditable", "true");
        $(this).focus();
    });

    $(document).on("blur", ".property", function () {
        if (!$(this).hasClass("emtpy")) {
            var property = $(this).text();
            var value = $(this.nextSibling.nextSibling).text();
            var identifier = $(this).parent().parent().parent().find(".identifier").text();
            addCSSProperty(identifier, property, value);
        }
        $(this).attr("contenteditable", "false");
        $(this.nextSibling.nextSibling).attr("contenteditable", "true").focus();
    });

    $(document).on("blur", ".identifier, .value", function () {
        $(this).attr("contenteditable", "false");
    });
    $(document).on("keypress", ".identifier, .property, .value", function (ev) {
        if (ev.which === 13) {
            ev.preventDefault();
            $(this).blur();
        }
    });

    socket.on("command", function (command, deviceId) {
        command = JSON.parse(command);
        if ($(".js-device[data-devid='" + deviceId + "']").hasClass("active")) {
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
            }
            else {
                console.error("Unknown command");
            }
        }
    });

    window.addEventListener("message", function (ev) {
        var command = JSON.parse(ev.data);
        var url = new URL(ev.origin);
        var deviceId = url.hostname.substring(0, url.hostname.length - 11);
        if ($(".js-device[data-devid='" + deviceId + "']").hasClass("active")) {
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
            }
        }
    }, false);

    $(document).on("click", ".js-device", function () {
        var deviceId = this.dataset.devid;
        if ($(this).hasClass("active")) {
            $(this).css("background-color", "rgba(220, 220, 220, 0.5)");
            $(".line[data-devid='" + deviceId + "']").each(function () {
                $(this.nextSibling.nextSibling).addClass("hidden");
                $(this.nextSibling).addClass("hidden");
                $(this).addClass("hidden");
            });
            removeCSSProperties(deviceId);
        }
        else {
            var index = colors.map(function (e) { return e.id; }).indexOf(this.dataset.devid);
            $(this).css("background-color", "hsla(" + colors[index].color + ", 60%, 50%, 0.3)");
            $(".line[data-devid='" + deviceId + "']").each(function () {
                $(this.nextSibling.nextSibling).removeClass("hidden");
                $(this.nextSibling).removeClass("hidden");
                $(this).removeClass("hidden");
            });
            addCSSProperties(deviceId);
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

function getCSSProperties() {
    var properties = [];
    $(".css-property").each(function () {
        var identifier = $(this).find(".identifier").text();
        if (!$(this).find(".identifier").hasClass("empty") && identifier) {
            var props = $(this).find(".content .line-wrapper");
            for (var i = 0; i < props.length; ++i) {
                if (!$(props[i]).find(".property").hasClass("empty") && !$(props[i]).find(".value").hasClass("empty") && $(props[i]).find("input[type=checkbox]").is(":checked")) {
                    var property = $(props[i]).find(".property").text();
                    var value = $(props[i]).find(".value").text();
                    if (property && value) {
                        properties.push({"identifier": identifier, "property": property, "value": value});
                    }
                }
            }
        }
    });
    return properties;
}

function addCSSProperties(deviceId) {
    var properties = getCSSProperties();
    if (remoteDevices.indexOf(deviceId) !== -1) {
        for (var i = 0, j = properties.length; i < j; ++i) {
            var command = new CSSCommand("updateCSS", deviceId, properties[i].identifier, properties[i].property, properties[i].value);
            socket.emit("command", command.toString(), deviceId);
        }
    }
    else {
        for (var i = 0, j = properties.length; i < j; ++i) {
            var command = new CSSCommand("updateCSS", deviceId, properties[i].identifier, properties[i].property, properties[i].value),
                index = getDeviceIndex(deviceId);
            command.send($("#device-" + deviceId + " iframe")[0], activeDevices[index].url);
        }
    }
}

function removeCSSProperties(deviceId) {
    var properties = getCSSProperties();
    if (remoteDevices.indexOf(deviceId) !== -1) {
        for (var i = 0, j = properties.length; i < j; ++i) {
            var command = new CSSCommand("restore", deviceId, properties[i].identifier, properties[i].property, "");
            socket.emit("command", command.toString(), deviceId);
        }
    }
    else {
        for (var i = 0, j = properties.length; i < j; ++i) {
            var command = new CSSCommand("restore", deviceId, properties[i].identifier, properties[i].property, ""),
                index = getDeviceIndex(deviceId);
            command.send($("#device-" + deviceId + " iframe")[0], activeDevices[index].url);
        }
    }
}

function addCSSProperty(name, identifier, property, value) {
    if (property in document.body.style) {
        $(".js-device.active").each(function () {
            if (remoteDevices.indexOf(this.dataset.devid) !== -1) {
                var command = new CSSCommand(name, this.dataset.devid, identifier, property, value);
                socket.emit("command", command.toString(), this.dataset.devid);
            }
            else {
                var i = getDeviceIndex(this.dataset.devid);
                var command = new CSSCommand(name, activeDevices[i].id, identifier, property, value);
                command.send($("#device-" + activeDevices[i].id + " iframe")[0], activeDevices[i].url);
            }
        });
    }
}

function appendLogToHistory(msg, deviceId) {
    var index = colors.map(function(e) { return e.id; }).indexOf(deviceId);
    var $history = $("#history");
    $("<span class='log-line line' data-devid='" + deviceId + "'>< </span>").appendTo($history);
    $("<span>" + msg + "</span>").appendTo($history)
        .css("color", "hsla(" + colors[index].color + ", 70%, 50%, 1)");
    $("<br />").appendTo($history);
    $history.scrollTop($history[0].scrollHeight);
}

function appendInfoToHistory(msg, deviceId) {
    var index = colors.map(function(e) { return e.id; }).indexOf(deviceId);
    var $history = $("#history");
    $("<span class='info-line line' data-devid='" + deviceId + "'><span class='glyphicon glyphicon-info-sign'></span> </span>").appendTo($history);
    $("<span>" + msg + "</span>").appendTo($history)
        .css("color", "hsla(" + colors[index].color + ", 70%, 50%, 1)");
    $("<br />").appendTo($history);
    $history.scrollTop($history[0].scrollHeight);
}

function appendWarnToHistory(msg, deviceId) {
    var index = colors.map(function(e) { return e.id; }).indexOf(deviceId);
    var $history = $("#history");
    $("<span class='warn-line line' data-devid='" + deviceId + "'><span class='glyphicon glyphicon-warning-sign'></span> </span>").appendTo($history);
    $("<span>" + msg + "</span>").appendTo($history)
        .css("color", "hsla(" + colors[index].color + ", 70%, 50%, 1)");
    $("<br />").appendTo($history);
    $history.scrollTop($history[0].scrollHeight);
}

function appendErrorToHistory(msg, deviceId) {
    var index = colors.map(function(e) { return e.id; }).indexOf(deviceId);
    var $history = $("#history");
    $("<span class='error-line line' data-devid='" + deviceId + "'><span class='glyphicon glyphicon-remove-sign'></span> </span>").appendTo($history);
    $("<span>" + msg + "</span>").appendTo($history)
        .css("color", "hsla(" + colors[index].color + ", 70%, 50%, 1)");
    $("<br />").appendTo($history);
    $history.scrollTop($history[0].scrollHeight);
}

function sendJavascriptCommand(code) {
    if (code === "console.clear()") {
        $("#history").text("");
    }
    else {
        $(".js-device.active").each(function () {
            if (remoteDevices.indexOf(this.dataset.devid) !== -1) {
                var command = new JSCommand("executeJS", this.dataset.devid, code);
                socket.emit("command", command.toString(), this.dataset.devid);
            }
            else {
                var i = getDeviceIndex(this.dataset.devid);
                var command = new JSCommand("executeJS", activeDevices[i].id, code);
                command.send($("#device-" + activeDevices[i].id + " iframe")[0], activeDevices[i].url);
            }
        });
    }
}