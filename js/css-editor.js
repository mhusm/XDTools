/*
    This file is responsible for everything related to the CSS editor:
        - Adding/removing CSS properties
        - Sending CSS Update commands to devices
        - Autocompleting CSS properties
*/
var cssRules = [];

$(document).ready(function () {

    var cssProperties = getAvailableCSSProperties();

    $(document).on("click", ".remove-css", function () {
        var $cssProperty = $($(this).closest(".css-property")[0]),
            cssIndex = cssRules.map(function (e) { return e.index; }).indexOf($cssProperty.data("index"));
        if (cssIndex !== -1) {
            cssRules[cssIndex].destroy();
            cssRules.splice(cssIndex, 1);
        }
        $cssProperty.remove();
    });

    //If the user changes the property field, remove the CSS rule with that property
    $(document).on("focus", ".property", function () {
        if (!$(this).hasClass("empty")) {
            var prevValue = $(this).text();
            var cssIndex = cssRules.map(function (e) { return e.index; }).indexOf($($(this).closest(".css-property")[0]).data("index")),
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

    $(document).on("blur", ".identifier", function () {
        if ($(this).hasClass("empty")) {
            //If an empty selector is set, add a new empty identifier for the next selector to be added
            if ($(this).text()) {
                var selectedLayer = $("#layer option:selected").val();
                $(this).removeClass("empty").attr("data-layer", selectedLayer);
                $(".remove-css").removeClass("hidden");
                $("<div class='css-property'>" +
                    "<span class='identifier empty' data-placeholder='enter identifier...'></span> {<span class='glyphicon glyphicon-remove remove-css hidden'></span><br />" +
                    "<span class='content'></span>" +
                "}<br /></div><br />").prependTo("#css-console .properties");
                $("<span class='line-wrapper'>" +
                    "<input type='checkbox' name='property4' value='property4' checked>" +
                    "<span class='property empty' data-placeholder='enter property...'></span><span class='remainder'></span>" +
                    ": <span class='value empty' data-placeholder='enter value...'></span>;</span><br />"
                ).appendTo($(this).parent().find(".content")).find(".property:last").attr("contenteditable", true).focus();
            }
        }
        else {
            //If a selector is modified, add the rules for the old selector
            var identifier = $(this).text(),
                index = $($(this).closest(".css-property")[0]).data("index"),
                cssIndex = cssRules.map(function (e) { return e.index; }).indexOf($($(this).closest(".css-property")[0]).data("index"));
            cssRules[cssIndex].modifySelector(identifier);
        }
    });

    $(document).on("blur", ".property", function () {
        var $lineWrapper = $($(this).closest(".line-wrapper")[0]),
            $value = $lineWrapper.find(".value"),
            cssIndex = cssRules.map(function (e) { return e.index; }).indexOf($($(this).closest(".css-property")[0]).data("index"));
        if ($(this).hasClass("empty")) {
            //If an empty property is set, focus the value field corresponding to the property
            if ($(this).text()) {
                $(this).removeClass("empty");
                $value.attr("contenteditable", "true").focus();
            }
        }
        else {
            //If a property field is modified, add the new CSS rule
            var property = $lineWrapper.find(".property").text() + $lineWrapper.find(".suggestion").text();
            $lineWrapper.find(".suggestion").text("");
            $(this).text(property);
            var value = $value.text();
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
                $("<span class='line-wrapper'>" +
                    "<input type='checkbox' name='property4' value='property4' checked>" +
                    "<span class='property empty' data-placeholder='enter property...'></span><span class='remainder'></span>" +
                    ": <span class='value empty' data-placeholder='enter-value'></span>;</span><br />"
                ).appendTo($cssProperty.find(".content"));
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

    $(document).on("click", ".identifier, .property, .value", function () {
        $(this).attr("contenteditable", "true").focus();
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

//Adds all CSS properties from the editor to a specific device
function addCSSProperties(deviceID) {
    for (var i = 0; i < cssRules.length; ++i) {
        cssRules[i].apply(deviceID);
    }
}

//Removes all CSS properties from a device if it is deactivated
function removeCSSProperties(deviceID) {
    var index = getDeviceIndex(deviceID),
        command = new CSSCommand("inactive", deviceID, "", "", "", "");
    activeDevices[index].sendCommand(command);
}

//Reactivates all CSS properties that are in the editor when a device is reactivated
function reactivateCSSProperties(deviceID) {
    var command = new CSSCommand("active", deviceID, "", "", "", ""),
        index = getDeviceIndex(deviceID);
    activeDevices[index].sendCommand(command);
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
    for (var i = 0, j = activeDevices.length; i < j; ++i) {
        var command = new CSSCommand("updateCSS", activeDevices[i].id, this.selector, property, value, this.layer);
        activeDevices[i].sendCommand(command);
    }

    this.modifyAttribute = function (property, value) {
        var index = this.attributes.map(function (e) { return e.property; }).indexOf(property);
        for (var i = 0, j = activeDevices.length; i < j; ++i) {
            var command = new CSSCommand("restore", activeDevices[i].id, this.selector, property, this.attributes[index].value, this.layer);
            activeDevices[i].sendCommand(command);
        }
        this.attributes[index].value = value;
        for (var i = 0, j = activeDevices.length; i < j; ++i) {
            var command = new CSSCommand("updateCSS", activeDevices[i].id, this.selector, property, value, this.layer);
            activeDevices[i].sendCommand(command);
        }
    };

    this.addAttribute = function (property, value) {
        this.attributes.push({"property": property, "value": value});
        for (var i = 0, j = activeDevices.length; i < j; ++i) {
            var command = new CSSCommand("updateCSS", activeDevices[i].id, this.selector, property, value, this.layer);
            activeDevices[i].sendCommand(command);
        }
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
            for (var i = 0, j = activeDevices.length; i < j; ++i) {
                var command = new CSSCommand("restore", activeDevices[i].id, this.selector, property, value, this.layer);
                activeDevices[i].sendCommand(command);
            }
        }
    };

    this.modifySelector = function (selector) {
        for (var i = 0; i < this.attributes.length; ++i) {
            for (var j = 0, k = activeDevices.length; j < k; ++j) {
                var command = new CSSCommand("restore", activeDevices[j].id, this.selector, this.attributes[i].property, this.attributes[i].value, this.layer);
                activeDevices[j].sendCommand(command);
            }
        }
        this.selector = selector;
        for (var i = 0; i < this.attributes.length; ++i) {
            for (var j = 0, k = activeDevices.length; j < k; ++j) {
                var command = new CSSCommand("updateCSS", activeDevices[j].id, this.selector, this.attributes[i].property, this.attributes[i].value, this.layer);
                activeDevices[j].sendCommand(command);
            }
        }
    };

    this.destroy = function () {
        for (var i = 0; i < this.attributes.length; ++i) {
            for (var j = 0, k = activeDevices.length; j < k; ++j) {
                var command = new CSSCommand("restore", activeDevices[j].id, this.selector, this.attributes[i].property, this.attributes[i].value, this.layer);
                activeDevices[j].sendCommand(command);
            }
        }
    };

    this.apply = function (deviceID) {
        var index = getDeviceIndex(deviceID);
        for (var i = 0, j = this.attributes.length; i < j; ++i) {
            var command = new CSSCommand("updateCSS", activeDevices[index].id, this.selector, this.attributes[i].property, this.attributes[i].value, this.layer);
            activeDevices[index].sendCommand(command);
        }
    };

    this.restore = function (deviceID) {
        for (var i = 0, j = this.attributes.length; i < j; ++i) {
            var index = getDeviceIndex(deviceID),
                command = new CSSCommand("restore", activeDevices[index].id, this.selector, this.attributes[i].property, this.attributes[i].value, this.layer);
            activeDevices[index].sendCommand(command);
        }
    };
}
