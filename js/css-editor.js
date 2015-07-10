/*
    This file is responsible for everything related to the CSS editor:
        - Adding/removing CSS properties
        - Sending CSS Update commands to devices
        - Autocompleting CSS properties
*/

$(document).ready(function () {

    var cssProperties = getAvailableCSSProperties();

    $(document).on("click", ".remove-css", function () {
        var $cssProperty = $($(this).closest(".css-property")[0]),
        identifier = $cssProperty.find(".identifier").text(),
        props = $cssProperty.find(".content .line-wrapper");
        for (var i = 0; i < props.length; ++i) {
            if (!$(props[i]).find(".property").hasClass("empty") && !$(props[i]).find(".value").hasClass("empty")) {
                var property = $(props[i]).find(".property").text(),
                    value = $(props[i]).find(".value").text();
                if (property) {
                    addCSSProperty("restore", identifier, property, value);
                }
            }
        }
        $(this).closest(".css-property").remove();
    });

    //If the user changes the property field, remove the CSS rule with that property
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

    //If the selector changes, remove all old CSS rules for that selector
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

    //Enable/disable CSS rule when the checkbox is enabled/disabled
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
            //If an empty selector is set, add a new empty identifier for the next selector to be added
            if ($(this).text()) {
                $(this).removeClass("empty");
                $(".remove-css").removeClass("hidden");
                $("<div class='css-property'>" +
                "<span class='identifier empty' data-placeholder='enter identifier...'></span> {<span class='glyphicon glyphicon-remove remove-css hidden'></span><br />" +
                "<span class='content'></span>" +
                "}<br /></div><br />").prependTo("#css-console .properties");
                $("<span class='line-wrapper'>" +
                    "<input type='checkbox' name='property4' value='property4' checked>" +
                    "<span class='property empty' data-placeholder='enter property...'></span><span class='remainder'></span>" +
                    ": <span class='value empty' data-placeholder='enter value...'></span>;</span><br />"
                )
                    .appendTo($(this).parent().find(".content"))
                    .find(".property:last").attr("contenteditable", true).focus();
            }
        }
        else {
            //If a selector is modified, add the rules for the old selector
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
            //If an empty property is set, focus the value field corresponding to the property
            if ($(this).text()) {
                $(this).removeClass("empty");
                $value.attr("contenteditable", "true").focus();
            }
        }
        else {
            //If a property field is modified, add the new CSS rule
            $lineWrapper.find(".suggestion").text("");
            $(this).text(property + suggestion);
            var value = $value.text();
            addCSSProperty("updateCSS", identifier, property + suggestion, value);
        }
    });

    $(document).on("blur", ".value", function () {
        var $cssProperty = $($(this).closest(".css-property")[0]),
            $lineWrapper = $($(this).closest(".line-wrapper")[0]),
            property = $lineWrapper.find(".property").text(),
            identifier = $cssProperty.find(".identifier").text(),
            value = $lineWrapper.find(".value").text();
        if ($(this).hasClass("empty")) {
            //If an empty value field is set, add the CSS rule and add a new property-value line
            if ($(this).text()) {
                $(this).removeClass("empty");
                $("<span class='line-wrapper'>" +
                    "<input type='checkbox' name='property4' value='property4' checked>" +
                    "<span class='property empty' data-placeholder='enter property...'></span><span class='remainder'></span>" +
                    ": <span class='value empty' data-placeholder='enter-value'></span>;</span><br />"
                ).appendTo($cssProperty.find(".content"));
                addCSSProperty("updateCSS", identifier, property, value);
            }
        }
        else {
            //If a value field is modified, add the new CSS rule
            addCSSProperty("updateCSS", identifier, property, value);
        }
    });

    $(document).on("click", ".identifier, .property, .value", function () {
        $(this).attr("contenteditable", "true");
        $(this).focus();
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

    addKeyUpEvent(cssProperties, cssProperties, "");

});

//Assigns a keyup event to the property field of a CSS property and passes the current filtered propery list as event data
function addKeyUpEvent(oldSuggestions, cssProperties, oldKeyword) {
    $(document).one("keyup", ".property", {"suggestions": JSON.stringify(oldSuggestions), "keyword": oldKeyword}, function (ev) {
        var curVal = $(this).text(),
            newSuggestions = cssProperties;
        if (curVal) {
            var props = JSON.parse(ev.data.suggestions);
            if (curVal.indexOf(ev.data.keyword) !== -1) {
                newSuggestions = filter(curVal, props);
            }
            else {
                newSuggestions = filter(curVal, cssProperties);
            }
            if (newSuggestions.length > 0) {
                var remainder = newSuggestions[0].substring(curVal.length);
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
function addCSSProperties(deviceID) {
    var properties = getCSSProperties(),
        index = getDeviceIndex(deviceID);
    for (var i = 0, j = properties.length; i < j; ++i) {
        var command = new CSSCommand("updateCSS", deviceID, properties[i].identifier, properties[i].property, properties[i].value);
        activeDevices[index].sendCommand(command);
    }
}

//Removes all CSS properties from a device if it is deactivated
function removeCSSProperties(deviceID) {
    var index = getDeviceIndex(deviceID),
        command = new CSSCommand("inactive", deviceID, "", "", "");
    activeDevices[index].sendCommand(command);
}

//Reactivates all CSS properties that are in the editor when a device is reactivated
function reactivateCSSProperties(deviceID) {
    var command = new CSSCommand("active", deviceID, "", "", ""),
        index = getDeviceIndex(deviceID);
    activeDevices[index].sendCommand(command);
}

//Adds a CSS property to all devices that are active
function addCSSProperty(name, identifier, property, value) {
    if (property && property in document.body.style && identifier && (value || name === "restore")) {
        $(".js-device").each(function () {
            var index = getDeviceIndex(this.dataset.deviceId),
                command = new CSSCommand(name, activeDevices[index].id, identifier, property, value);
            activeDevices[index].sendCommand(command);
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
