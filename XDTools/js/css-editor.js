/*
 * XDTools -- A set of tools for cross-device development
 * Copyright (C) 2015 Maria Husmann. All rights reserved.
 *
 * XDTools is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * XDTools is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with XDTools. If not, see <http://www.gnu.org/licenses/>.
 *
 * See the README and LICENSE files for further information.
 *
 */


/*
    This file is responsible for everything related to the CSS editor:
        - Adding/removing CSS properties
        - Sending CSS Update commands to devices
        - Autocompleting CSS properties
*/
var cssRules = [];

$(document).ready(function () {

    var cssProperties = getAvailableCSSProperties();

    //Remove a CSS rule
    $(document).on("click", ".remove-css", function () {
        var $cssProperty = $($(this).closest(".css-property")[0]),
            cssIndex = cssRules.map(function (e) { return e.index; }).indexOf($cssProperty.data("index"));
        if (cssIndex !== -1) {
            cssRules[cssIndex].destroy();
            cssRules.splice(cssIndex, 1);
        }
        $($cssProperty[0].nextSibling).remove();
        $cssProperty.remove();
    });

    //Initialize CSS propery autocomplete
    addKeyUpEvent(cssProperties, cssProperties, "");

    //Only make selectors/properties/values editable when the user clicks on them
    $(document).on("click", ".identifier, .property, .value", function () {
        $(this).attr("contenteditable", "true").focus();
    });
    $(document).on("blur", ".identifier, .property, .value", function () {
        $(this).attr("contenteditable", "false");
    });

    //Trigger blur event when the user hits the enter key
    $(document).on("keypress", ".identifier, .property, .value", function (ev) {
        if (ev.which === 13) {
            ev.preventDefault();
            $(this).blur();
        }
    });

    $(document).on("blur", ".identifier", function () {
        if ($(this).hasClass("empty")) {
            //If an empty selector is set, add a new empty rule for the next selector to be added and add empty property and value for this rule
            if ($(this).text()) {
                //TODO: could be solved better, path to layer is different for each device
                var deviceID = Object.keys(activeDevices)[0],
                    selectedLayer = $("#layer").find("option:selected").text(),
                    layerIndex = activeDevices[deviceID].hasLayer(selectedLayer),
                    name = layerIndex ? activeDevices[deviceID].getLayer(selectedLayer) : "document.body",
                    $cssProperty = $(this).closest(".css-property");
                $(this).removeClass("empty").attr("data-layer", name);
                $(".remove-css").removeClass("hidden");
                $cssProperty.find(".layer-label").removeClass("hidden").text(name);
                $(HTML.CSSRule()).prependTo("#css-console .properties");
                $(HTML.CSSProperty()).appendTo($cssProperty.find(".content")).find(".property").click();
            }
        }
        else {
            //If a selector is modified, add the rules for the old selector
            var identifier = $(this).text(),
                index = $($(this).closest(".css-property")[0]).data("index"),
                cssIndex = cssRules.map(function (e) { return e.index; }).indexOf(index);
            cssRules[cssIndex].modifySelector(identifier);
        }
    });

    //If the user changes the property field, remove the CSS rule with that property
    $(document).on("focus", ".property", function () {
        if (!$(this).hasClass("empty")) {
            var prevValue = $(this).text(),
                cssIndex = cssRules.map(function (e) { return e.index; }).indexOf($($(this).closest(".css-property")[0]).data("index")),
                $lineWrapper = $($(this).closest(".line-wrapper")[0]);
            cssRules[cssIndex].removeAttribute(prevValue, $lineWrapper.find(".value").text());
        }
    });

    //Enable/disable CSS rule when the checkbox is enabled/disabled
    $(document).on("click", "#css-console .line-wrapper input[type=checkbox]", function () {
        var $cssProperty = $($(this).closest(".css-property")[0]),
            $lineWrapper = $($(this).closest(".line-wrapper")[0]),
            $property = $lineWrapper.find(".property"),
            $value = $lineWrapper.find(".value"),
            cssIndex = cssRules.map(function (e) { return e.index; }).indexOf($cssProperty.data("index"));
        if ($(this).is(":checked") && !$property.hasClass("empty") && !$value.hasClass("empty")) {
            cssRules[cssIndex].addAttribute($property.text(), $value.text());
        }
        else if (!$property.hasClass("empty") && !$property.hasClass("empty")){
            cssRules[cssIndex].removeAttribute($property.text(), $value.text());
        }
    });

    $(document).on("blur", ".property", function () {
        var $lineWrapper = $($(this).closest(".line-wrapper")[0]),
            $value = $lineWrapper.find(".value"),
            cssIndex = cssRules.map(function (e) { return e.index; }).indexOf($($(this).closest(".css-property")[0]).data("index")),
            remainder = $lineWrapper.find(".remainder").text();
        $lineWrapper.find(".remainder").text("");
        $(this).text($(this).text() + remainder);
        if ($(this).hasClass("empty")) {
            //If an empty property is set, focus the value field corresponding to the property
            if ($(this).text()) {
                $(this).removeClass("empty");
                $value.attr("contenteditable", "true").focus();
            }
        }
        else {
            //If a property field is modified, add the new CSS rule
            var property = $(this).text(),
                value = $value.text();
            cssRules[cssIndex].addAttribute(property, value);
        }
    });

    $(document).on("blur", ".value", function () {
        var $cssProperty = $($(this).closest(".css-property")[0]),
            $lineWrapper = $($(this).closest(".line-wrapper")[0]),
            property = $lineWrapper.find(".property").text(),
            identifier = $cssProperty.find(".identifier").text(),
            layer = $cssProperty.find(".identifier").data("layer"),
            value = $lineWrapper.find(".value").text(),
            cssIndex = cssRules.map(function (e) { return e.index; }).indexOf($cssProperty.data("index"));
        if ($(this).hasClass("empty")) {
            //If an empty value field is set, add the CSS rule and add a new property-value line
            if ($(this).text()) {
                $(this).removeClass("empty");
                $(HTML.CSSProperty()).appendTo($cssProperty.find(".content"));
                if (cssIndex >= 0) {
                    cssRules[cssIndex].addAttribute(property, value);
                }
                else {
                    var rule = new CSSRule(identifier, property, value, layer);
                    cssRules.push(rule);
                    $(this).closest(".css-property").attr("data-index", rule.index);
                }
            }
        }
        else {
            //If a value field is modified, add the new CSS rule
            cssRules[cssIndex].modifyAttribute(property, value);
        }
    });

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

//Adds all CSS properties from the editor to a specific device
function addCSSProperties(deviceID) {
    for (var i = 0; i < cssRules.length; ++i) {
        cssRules[i].apply(deviceID);
    }
}

//Removes all CSS properties from a device if it is deactivated
function removeCSSProperties(deviceID) {
    var command = new CSSCommand("inactive", deviceID, "", "", "", "");
    activeDevices[deviceID].sendCommand(command);
}

//Reactivates all CSS properties that are in the editor when a device is reactivated
function reactivateCSSProperties(deviceID) {
    var command = new CSSCommand("active", deviceID, "", "", "", "");
    activeDevices[deviceID].sendCommand(command);
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

var ruleIndex = 0;

function CSSRule(selector, property, value, layer) {
    this.selector = selector;
    this.attributes = [{"property": property, "value": value}];
    this.index = ruleIndex;
    ruleIndex++;
    this.layer = layer;
    var that = this;
    $.each(activeDevices, function (key, device) {
        var command = new CSSCommand("updateCSS", device.id, that.selector, property, value, that.layer);
        device.sendCommand(command);
    });
    this.modifyAttribute = function (property, value) {
        var index = this.attributes.map(function (e) { return e.property; }).indexOf(property);
        $.each(activeDevices, function (key, device) {
            var command = new CSSCommand("restore", device.id, that.selector, property, that.attributes[index].value, that.layer);
            device.sendCommand(command);
        });
        this.attributes[index].value = value;
        $.each(activeDevices, function (key, device) {
            var command = new CSSCommand("updateCSS", device, that.selector, property, value, that.layer);
            device.sendCommand(command);
        });
    };

    this.addAttribute = function (property, value) {
        this.attributes.push({"property": property, "value": value});
        $.each(activeDevices, function (key, device) {
            var command = new CSSCommand("updateCSS", device.id, that.selector, property, value, that.layer);
            device.sendCommand(command);
        });
    };

    this.removeAttribute = function (property, value) {
        var index = -1;
        for (var i = 0; i < this.attributes.length; ++i) {
            if (this.attributes[i].property === property && this.attributes[i].value === value) {
                index = i;
            }
        }
        if (index !== -1) {
            this.attributes.splice(index, 1);
            $.each(activeDevices, function (key, device) {
                var command = new CSSCommand("restore", device.id, that.selector, property, value, that.layer);
                device.sendCommand(command);
            });
        }
    };

    this.modifySelector = function (selector) {
        for (var i = 0; i < this.attributes.length; ++i) {
            $.each(activeDevices, function (key, device) {
                var command = new CSSCommand("restore", device.id, that.selector, that.attributes[i].property, that.attributes[i].value, that.layer);
                device.sendCommand(command);
            });
        }
        this.selector = selector;
        for (var i = 0; i < this.attributes.length; ++i) {
            $.each(activeDevices, function (key, device) {
                var command = new CSSCommand("updateCSS", device.id, that.selector, that.attributes[i].property, that.attributes[i].value, that.layer);
                device.sendCommand(command);
            });
        }
    };

    this.destroy = function () {
        for (var i = 0; i < this.attributes.length; ++i) {
            $.each(activeDevices, function (key, device) {
                var command = new CSSCommand("restore", device.id, that.selector, that.attributes[i].property, that.attributes[i].value, that.layer);
                device.sendCommand(command);
            });
        }
    };

    this.apply = function (deviceID) {
        for (var i = 0, j = this.attributes.length; i < j; ++i) {
            var command = new CSSCommand("updateCSS", activeDevices[deviceID].id, this.selector, this.attributes[i].property, this.attributes[i].value, this.layer);
            activeDevices[deviceID].sendCommand(command);
        }
    };

    this.restore = function (deviceID) {
        for (var i = 0, j = this.attributes.length; i < j; ++i) {
            var command = new CSSCommand("restore", activeDevices[deviceID].id, this.selector, this.attributes[i].property, this.attributes[i].value, this.layer);
            activeDevices[deviceID].sendCommand(command);
        }
    };
}
