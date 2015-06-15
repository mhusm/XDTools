/*
    This file is responsible for everything related to the CSS editor:
        - Adding/removing CSS properties
        - Sending CSS Update commands to devices
        - Autocompleting CSS properties
*/

$(document).ready(function () {

    var cssProperties = getAvailableCSSProperties();

    $(document).on("focus", ".identifier.empty, .property.empty, .value.empty", function () {
        $(this).text("");
    });

    $(document).on("focus", ".property", function () {
        if (!$(this).hasClass("empty")) {
            var prevValue = $(this).text();
            $(this).one("blur", {"prevValue": prevValue}, function (ev) {
                var $cssProperty = $($(this).closest(".css-property")[0]),
                    $lineWrapper = $($(this).closest(".line-wrapper")[0]),
                    identifier = $cssProperty.find(".identifier").text(),
                    value = $lineWrapper.find(".value").text();
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
                        var property = $(props[i]).find(".property").text(),
                            value = $(props[i]).find(".value").text();
                        if (property) {
                            addCSSProperty("restore", ev.data.prevValue, property, value);
                        }
                    }
                }
            });
        }
    });

    $(document).on("click", "#css-console .line-wrapper input[type=checkbox]", function () {
        var $cssProperty = $($(this).closest(".css-property")[0]),
            $lineWrapper = $($(this).closest(".line-wrapper")[0]),
            $property = $lineWrapper.find(".property"),
            $value = $lineWrapper.find(".value"),
            property = $property.text(),
            identifier = $cssProperty.find(".identifier").text(),
            value = $value.text();
        if ($(this).is(":checked") && !$property.hasClass("empty") && !$value.hasClass("empty")) {
            addCSSProperty("updateCSS", identifier, property, value);
        }
        else if (!$property.hasClass("empty") && !$property.hasClass("empty")){
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
                    "<span class='property empty'>enter property...</span><span class='remainder'></span>" +
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
            var identifier = $(this).text(),
                props = $(this.parentNode).find(".content .line-wrapper");
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
    $(document).on("keypress", ".identifier.empty", function (ev) {
        if (ev.which === 13) {
            ev.preventDefault();
            $(this).blur();
        }
    });

    $(document).on("blur", ".property", function () {
        var $cssProperty = $($(this).closest(".css-property")[0]),
            $lineWrapper = $($(this).closest(".line-wrapper")[0]),
            property = $lineWrapper.find(".property").text(),
            suggestion = $lineWrapper.find(".suggestion").text(),
            identifier = $cssProperty.find(".identifier").text(),
            $value = $lineWrapper.find(".value");
        if ($(this).hasClass("empty")) {
            if ($(this).text()) {
                $(this).removeClass("empty");
                $value.attr("contenteditable", "true").focus();
            }
            else {
                $(this).text("enter property...");
            }
        }
        else {
            $lineWrapper.find(".suggestion").text("");
            $(this).text(property + suggestion);
            var value = $value.text();
            addCSSProperty("updateCSS", identifier, property + suggestion, value);
        }
    });
    $(document).on("keypress", ".property", function (ev) {
        if (ev.which === 13) {
            ev.preventDefault();
            $(this).blur();
        }
    });

    addKeyUpEvent(cssProperties, cssProperties, "");

    $(document).on("blur", ".value", function () {
        var $cssProperty = $($(this).closest(".css-property")[0]),
            $lineWrapper = $($(this).closest(".line-wrapper")[0]),
            property = $lineWrapper.find(".property").text(),
            identifier = $cssProperty.find(".identifier").text(),
            value = $lineWrapper.find(".value").text();
        if ($(this).hasClass("empty")) {
            if ($(this).text()) {
                $(this).removeClass("empty");
                $("<span class='line-wrapper'>" +
                    "<input type='checkbox' name='property4' value='property4' checked>" +
                    "<span class='property empty'>enter property...</span><span class='remainder'></span>" +
                    ": <span class='value empty'>enter value...</span>;</span><br />"
                ).appendTo($cssProperty.find(".content"));
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
    $(document).on("keypress", ".value", function (ev) {
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
        var $cssProperty = $($(this).closest(".css-property")[0]),
            $lineWrapper = $($(this).closest(".line-wrapper")[0]),
            property = $lineWrapper.find(".property").text(),
            identifier = $cssProperty.find(".identifier").text(),
            $value = $lineWrapper.find(".value"),
            value = $value.text();
        if (!$(this).hasClass("emtpy")) {
            addCSSProperty(identifier, property, value);
        }
        $(this).attr("contenteditable", "false");
        $value.attr("contenteditable", "true").focus();
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

});

//Assigns a keypress event to the property field of a CSS property and passes the current filtered propery list as event data
function addKeyUpEvent(oldSuggestions, cssProperties, oldKeyword) {
    $(document).one("keypress", ".property", {"suggestions": JSON.stringify(oldSuggestions), "keyword": oldKeyword}, function (ev) {
        var curVal = $(this).text(),
            newSuggestions = cssProperties;
        if (curVal) {
            var props = JSON.parse(ev.data.suggestions);
            if (curVal.indexOf(ev.data.keyword) != 0) {
                newSuggestions = filter(curVal, props);
            }
            else {
                newSuggestions = filter(curVal, cssProperties);
            }
            if (newSuggestions.length > 0) {
                var remainder = newSuggestions[0].substring(curVal.length + 1);
                $(this.nextSibling).text(remainder);
            }
            else {
                $(this.nextSibling).text("");
            }
        }
        addKeyUpEvent(newSuggestions, cssProperties, curVal);
    });
}

//Returns all CSS properties that are currently in the editor
function getCSSProperties() {
    var properties = [];
    $(".css-property").each(function () {
        var identifier = $(this).find(".identifier").text();
        if (!$(this).find(".identifier").hasClass("empty") && identifier) {
            var props = $(this).find(".content .line-wrapper");
            for (var i = 0; i < props.length; ++i) {
                if (!$(props[i]).find(".property").hasClass("empty") && !$(props[i]).find(".value").hasClass("empty") && $(props[i]).find("input[type=checkbox]").is(":checked")) {
                    var property = $(props[i]).find(".property").text(),
                        value = $(props[i]).find(".value").text();
                    if (property && value) {
                        properties.push({"identifier": identifier, "property": property, "value": value});
                    }
                }
            }
        }
    });
    return properties;
}

//Adds all CSS properties from the editor to a specific device
function addCSSProperties(deviceId) {
    if ($(".js-device[data-device-id='" + deviceId + "']").hasClass("active")) {
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
}

//Removes all CSS properties from a device if it is deactivated
function removeCSSProperties(deviceId) {
    if (remoteDevices.indexOf(deviceId) !== -1) {
        var command = new CSSCommand("resetCSS", deviceId, "", "", "");
        socket.emit("command", command.toString(), deviceId);
    }
    else {
        var command = new CSSCommand("resetCSS", deviceId, "", "", ""),
            index = getDeviceIndex(deviceId);
        command.send($("#device-" + deviceId + " iframe")[0], activeDevices[index].url);
    }
}

//Reactivates all CSS properties that are in the editor when a device is reactivated
function reactivateCSSProperties(deviceId) {
    if (remoteDevices.indexOf(deviceId) !== -1) {
        var command = new CSSCommand("reactivateCSS", deviceId, "", "", "");
        socket.emit("command", command.toString(), deviceId);
    }
    else {
        var command = new CSSCommand("reactivateCSS", deviceId, "", "", ""),
            index = getDeviceIndex(deviceId);
        command.send($("#device-" + deviceId + " iframe")[0], activeDevices[index].url);
    }
}

//Adds a CSS property to all devices that are active
function addCSSProperty(name, identifier, property, value) {
    if (property && property in document.body.style && identifier && (value || name === "restore")) {
        $(".js-device.active").each(function () {
            if (remoteDevices.indexOf(this.dataset.deviceId) !== -1) {
                var command = new CSSCommand(name, this.dataset.deviceId, identifier, property, value);
                socket.emit("command", command.toString(), this.dataset.deviceId);
            }
            else {
                var i = getDeviceIndex(this.dataset.deviceId),
                    command = new CSSCommand(name, activeDevices[i].id, identifier, property, value);
                command.send($("#device-" + activeDevices[i].id + " iframe")[0], activeDevices[i].url);
            }
        });
    }
}

//Returns all CSS properties that begin with the prefix
function filter(prefix, cssProperties) {
    var filteredWords = cssProperties.filter(function (item, index, array) {
        return array[index].indexOf(prefix) === 0;
    });
    return filteredWords;
}

//This function returns all CSS properties that are available in the browser
function getAvailableCSSProperties() {
    var properties = [];
    for (var item in document.body.style) {
        item = item.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        if (item.substring(0, 6) === "webkit") {
            item = "-" + item;
        }
        properties.push(item);
    }
    return properties;
}
