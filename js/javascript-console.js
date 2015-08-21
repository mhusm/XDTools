var jsConsole = new JavaScriptConsole();

$(document).ready(function () {

    jsConsole.initialize();

    $("#filter").keyup(function () {
        jsConsole.filterByName($(this).val().toLowerCase());
    });

    $("#javascript-console").find(".category").click(function () {
        $("#javascript-console").find(".category").removeClass("marked");
        $(this).addClass("marked");
        jsConsole.filterByClass($(this).data("class"));
    });

    $(document).on("click", ".collapse-stack", function () {
        $(this.nextSibling).slideToggle();
        $(this).toggleClass("glyphicon-collapse-down").toggleClass("glyphicon-collapse-up");
        jsConsole.scrollToBottom();
    });

    $("#toggle-js-console").click(function () {
        $(this).find("span").toggleClass("glyphicon-triangle-bottom").toggleClass("glyphicon-triangle-top");
    });

    $("#code-input").keyup(function (ev) {
        if (ev.which === 13) {
            jsConsole.appendCommand($(this).val());
            $(this).val("");
        }
        else if (ev.which === 38) {
            $(this).val(jsConsole.getPreviousHistoryElement());
        }
        else if (ev.which === 40) {
            $(this).val(jsConsole.getNextHistoryElement());
        }
    });

});

function JavaScriptConsole() {
    this.history = [];
    this.historyPosition = 0;

    this.initialize = function () {
        this.$jsConsole = $("#javascript-console");
        this.$history = $("#history");
    };

    this.scrollToBottom = function () {
        this.$history.scrollTop(this.$history[0].scrollHeight);
    };

    this.filterByName = function (name) {
        this.$jsConsole.find(".content").each(function () {
            var text = $(this).text().toLowerCase();
            if (text.indexOf(name) === -1) {
                $(this).closest(".history-line").addClass("filteredOutByName");
            }
            else {
                $(this).closest(".history-line").removeClass("filteredOutByName");
            }
        });
        this.scrollToBottom();
    };

    this.filterByClass = function (className) {
        this.$jsConsole.find(".history-line").removeClass("filteredOut");
        this.$jsConsole.find(".history-line").each(function () {
            if ($(this).find(className).length === 0) {
                $(this).addClass("filteredOut");
            }
        });
        this.scrollToBottom();
    };

    this.getPreviousHistoryElement = function () {
        if (this.historyPosition > 0) {
            this.historyPosition--;
            return this.history[this.historyPosition];
        }
        return this.history[0];
    };

    this.getNextHistoryElement = function () {
        if (this.historyPosition < this.history.length - 1) {
            this.historyPosition++;
            return this.history[this.historyPosition];
        }
        this.historyPosition = this.history.length;
        return "";
    };

    this.appendCommand = function (command) {
        this.$history.append("<div class='history-line'><span class='hist-line'>></span> <span class='content'>" + command + "</span></div>");
        this.history.push(command);
        this.historyPosition = this.history.length;
        if (command === "console.clear()") {
            this.$history.text("");
        }
        else {
            $(".js-device.active").each(function () {
                var index = getDeviceIndex(this.dataset.deviceId),
                    command2 = new JSCommand("executeJS", activeDevices[index].id, command);
                activeDevices[index].sendCommand(command2);
            });
        }
    };

    this.appendMessage = function (msg, deviceID, type) {
        if ($(".js-device[data-device-id='" + deviceID + "']").hasClass("active")) {
            var index = colors.map(function (e) { return e.id; }).indexOf(deviceID),
                message = "<div class='history-line' data-device-id='" + deviceID + "'>" + this.getMarker(type);
            message = message + "<span class='content'>" + process(msg) + "</span></div>";
            $(message).appendTo(this.$history).css("color", "hsla(" + colors[index].color + ", 60%, 50%, 1)");
            this.scrollToBottom();
        }
    };

    this.getMarker = function (type) {
        if (type === "info") {
            return "<span class='info-line'><span class='glyphicon glyphicon-info-sign'></span> </span>";
        }
        else if (type === "error") {
            return "<span class='error-line'><span class='glyphicon glyphicon-remove-sign'></span> </span>";
        }
        else if (type === "warn") {
            return "<span class='warn-line'><span class='glyphicon glyphicon-warning-sign'></span> </span>";
        }
        else if (type === "log") {
            return "<span class='log-line'>< </span>";
        }
        else if (type === "return") {
            return "<span class='log-line'><- </span>";
        }
    };

    this.appendException = function (msg, deviceID) {
        if ($(".js-device[data-device-id='" + deviceID + "']").hasClass("active")) {
            var index = colors.map(function (e) { return e.id;}).indexOf(deviceID),
                splittedError = msg.split(" at "),
                message = "<div class='history-line' data-device-id='" + deviceID + "'><span class='error-line'><span class='glyphicon glyphicon-remove-sign'></span> </span>";
            if (splittedError.length > 1) {
                var func = splittedError[1].substring(0, splittedError[1].indexOf(" "));
                splittedError[1] = splittedError[1].replace(func, "<span class='error-function'>" + func + "</span>");
                message = message + "<span class='content'>" + splittedError[0] + "</span><span class='glyphicon glyphicon-collapse-down collapse-stack'></span><span class='stack'>";
                for (var i = 1, j = splittedError.length; i < j; ++i) {
                    message = message + "<div class='stack-line'>at " + splittedError[i] + "</div>";
                }
                message = message + "</span></div>";
            }
            else {
                message = message + "<span class='content'>" + splittedError[0] + "</span></div>";
            }
            $(message).appendTo(this.$history).css("color", "hsla(" + colors[index].color + ", 70%, 50%, 1)")
                .find(".error-function").popover({
                    placement: 'bottom',
                    container: '.history-line[data-device-id="' + deviceID + '"]',
                    trigger: 'click',
                    html: true,
                    content: "<button type='button' class='btn btn-default btn-sm debug-js-error'>Debug</button>"
                });
            this.scrollToBottom();
        }
    };
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
            var newobj = "[",
                elements = [];
            for (var i = 0; i < obj.length; ++i) {
                elements.push(generateObjectHTML(obj[i]));
            }
            newobj = newobj + elements.join("; ") + "]";
            return newobj;
        }
        else {
            var keys = Object.keys(obj),
                newobject = "Object ";
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