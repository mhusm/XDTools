var XDTest = {
    capturing: false,
    events: [],
    mouseEvents: [
        "click",          //all major browsers
        "contextmenu",    //all major browsers
        "dblclick",       //all major browsers
        "drag",           //Safari, Chrome
        "dragend",        //Safari, Chrome
        "dragenter",      //Safari, Chrome
        "dragleave",      //Safari, Chrome
        "dragover",       //Safari, Chrome
        "dragstart",      //Safari, Chrome
        "drop",           //Safari, Chrome
        "mousedown",     //all major browsers
        //TODO: temporarily disabled for debugging
        //"mousemove",   //all major browsers           deactivated because it causes too many events
        //"mouseout",      //all major browsers
        //"mouseover",     //all major browsers
        "mouseup"        //all major browsers
        /* The following events are not supported by Chrome
         "mousewheel",       //Opera
         "mouseenter",       //IE
         "mouseleave"        //IE
         */
    ],
    keyboardEvents: [
        "keydown",  //all major browsers
        "keypress", //all major browsers
        "keyup"     //all major browsers
    ],
    uiEvents: [
        "DOMActivate",      //Firefox, Safari, Chrome
        "DOMFocusIn",       //Opera, Safari, Chrome
        "DOMFocusOut"       //Opera, Safari, Chrome
        /* The following events are not supported by Chrome
         "abort",            //IE
         "activate",         //IE
         "beforeactivate",   //IE
         "beforedeactivate", //IE
         "deactivate",       //IE
         "resize",           //IE
         "scroll",           //IE
         "select",           //IE
         "overflow",         //Firefox
         "underflow"         //Firefox
         */
    ],
    mutationEvents: [
        "DOMCharacterDataModified",    //all major browsers
        "DOMNodeInserted",             //all major browsers
        "DOMNodeInsertedIntoDocument", //Opera, Safari, Chrome
        "DOMNodeRemoved",              //all major browsers
        "DOMNodeRemovedFromDocument",  //Opera, Safari, Chrome
        "DOMSubtreeModified"          //IE, Firefox, Safari, Chrome
        /* The following events are not supported by Chrome
         "DOMAttrModified"              //IE, Firefox, Opera
         */
    ],
    /* FocusEvent is only supported by IE
     focusEvents = [
     "blur",               //IE
     "focus",              //IE
     "focusin",            //IE
     "focusout"            //IE
     ],
     */
    /* DragEvent is only supported by IE, Firefox
     dragEvents = [
     "drag",             //IE, Firefox
     "dragend",          //IE, Firefox
     "dragenter",        //IE, Firefox
     "dragleave",        //IE, Firefox
     "dragover",         //IE, Firefox
     "dragstart",        //IE, Firefox
     "drop",             //IE, Firefox
     "dragexit",         //Firefox
     "draggesture",       //Firefox
     "copy",             //IE
     "cut"               //IE
     ];
     */
    genericEvents: [
        "beforeCopy",                  //IE, Safari, Chrome
        "beforeCut",                   //IE, Safari, Chrome
        "beforepaste",                 //IE, Safari, Chrome
        "beforeunload",                //IE, Firefox, Safari, Chrome
        "blur",                        //Firefox, Opera, Safari, Chrome
        "change",                      //all major browsers
        "copy",                        //Firefox, Safari, Chrome
        "cut",                         //Firefox, Safari, Chrome
        "focus",                       //Firefox, Opera, Safari, Chrome
        "hashchange",                  //all major browsers
        "input",                       //all major browsers
        "load",                        //all major browsers
        "message",                     //all major browsers
        "paste",                       //Firefox, Safari, Chrome
        "RadioStateChange",            //Firefox, Safari, Chrome
        "reset",                       //all major browsers
        "resize",                      //Firefox, Opera, Safari, Chrome
        "scroll",                      //Firefox, Opera, Safari, Chrome
        "search",                      //Safari, Chrome
        "select",                      //Firefox, Opera, Safari, Chrome
        "selectstart",                 //IE, Safari, Chrome
        "submit",                      //all major browsers
        "unload"                       //all major browsers
        /* The following events are not supported by Chrome
         "start",                       //IE, Firefox
         "stop",                        //IE
         "CheckboxStateChange"          //Firefox only
         */
    ],
    Event: function (ev) {
        this.type = ev.eventType;
        this.time = ev.time;
        this.hierarchy = ev.hierarchy;
        this.event = document.createEvent("Event");
        this.event.initEvent(ev.type, ev.bubbles, ev.cancelable);
        this.dispatch = function (target) {
            target.dispatchEvent(this.event);
        }
    },
    MouseEvent: function (ev) {
        XDTest.Event.call(this, ev);
        this.event = document.createEvent("MouseEvent");
        this.event.initMouseEvent(ev.type, ev.bubbles, ev.cancelable, window, ev.detail, ev.screenX, ev.screenY,
            ev.clientX, ev.clientY, ev.ctrlKey, ev.altKey, ev.shiftKey, ev.metaKey, ev.button, ev.relatedTarget);
    },
    KeyboardEvent: function (ev, modifiers) {
        XDTest.Event.call(this, ev);
        this.event = document.createEvent("KeyboardEvent");
        this.event.initKeyboardEvent(ev.type, ev.bubbles, ev.cancelable, window, ev.keyCode, ev.location,
            modifiers, ev.repeat, '');
        this.which = ev.which;
        this.dispatch = function (target) {
            target.dispatchEvent(this.event);
            if (this.event.type === "keypress") {
                var textEvent = document.createEvent("TextEvent"),
                    char = String.fromCharCode(this.which);
                textEvent.initTextEvent("textInput", this.event.bubbles, this.event.cancelable, window, char,
                    this.event.detail, "en-US");
                target.dispatchEvent(textEvent);
            }
        }
    },
    UIEvent: function (ev) {
        XDTest.Event.call(this, ev);
        this.event = document.createEvent("UIEvent");
        this.event.initUIEvent(ev.type, ev.bubbles, ev.cancelable, window, ev.detail);
    },
    WheelEvent: function (ev, modifiers) {
        XDTest.Event.call(this, ev);
        this.event = document.createEvent("WheelEvent");
        this.event.initEvent(ev.type, ev.bubbles, ev.cancelable, window, ev.detail, ev.screenX, ev.screenY,
            ev.clientX, ev.clientY, ev.button, ev.relatedTarget, modifiers, ev.deltaX, ev.deltaY, ev.deltaZ, ev.deltaMode);
    },
    MutationEvent: function (ev) {
        XDTest.Event.call(this, ev);
        this.event = document.createEvent("MutationEvent");
        this.event.initMutationEvent(ev.type, ev.bubbles, ev.cancelable, ev.relatedNode, ev.prevValue, ev.newValue,
            ev.attrName, ev.attrChange);
    },
    OverflowEvent: function (ev) {
        XDTest.Event.call(this, ev);
        this.event = document.createEvent("OverflowEvent");
        this.event.initOverflowEvent(ev.orient, ev.horizontalOverflow, ev.verticalOverflow);
    },
    sendMessage: function (ev, message, parentDomain) {
        ev.source.postMessage(message, parentDomain);
    },
    logEvent: function (ev, type) {
        if (XDTest.capturing) {
            if (type === "MouseEvent") {
                XDTest.events.push({"eventType": type, "time": ev.timeStamp,
                    "hierarchy": XDTest.determineHierarchy(ev.path), "type": ev.type, "bubbles": ev.bubbles,
                    "cancelable": ev.cancelable, "detail": ev.detail, "screenX": ev.screenX, "screenY": ev.screenY,
                    "clientX": ev.clientX, "clientY": ev.clientY, "ctrlKey": ev.ctrlKey, "altKey": ev.altKey,
                    "shiftKey": ev.shiftKey, "metaKey": ev.metaKey, "button": ev.button, "relatedTarget": ev.relatedTarget
                });
            }
            else if (type === "KeyboardEvent") {
                XDTest.events.push({"eventType": type, "time": ev.timeStamp,
                    "hierarchy": XDTest.determineHierarchy(ev.path), "type": ev.type, "bubbles": ev.bubbles,
                    "cancelable": ev.cancelable, "keyCode": ev.keyCode, "which": ev.which, "location": ev.location,
                    "modifiers": XDTest.getModifiers(ev), "repeat": ev.repeat, "detail": ev.detail
                });
            }
            else if (type === "UIEvent") {
                XDTest.events.push({"eventType": type, "time": ev.timeStamp,
                    "hierarchy": XDTest.determineHierarchy(ev.path), "type": ev.type, "bubbles": ev.bubbles,
                    "cancelable": ev.cancelable, "detail": ev.detail
                });
            }
            else if (type === "MutationEvent") {
                XDTest.events.push({"eventType": type, "time": ev.timeStamp,
                    "hierarchy": XDTest.determineHierarchy(ev.path), "type": ev.type, "bubbles": ev.bubbles,
                    "cancelable": ev.cancelable, "relatedNode": ev.relatedNode, "prevValue": ev.prevValue,
                    "newValue": ev.newValue, "attrName": ev.attrName, "attrChange": ev.attrChange
                });
            }
            else if (type === "WheelEvent") {
                XDTest.events.push({"eventType": type, "time": ev.timeStamp,
                    "hierarchy": XDTest.determineHierarchy(ev.path), "type": ev.type, "bubbles": ev.bubbles,
                    "cancelable": ev.cancelable, "detail": ev.detail, "screenX": ev.screenX, "screenY": ev.screenY,
                    "clientX": ev.clientX, "clientY": ev.clientY, "button": ev.button, "relatedTarget": ev.relatedTarget,
                    "deltaX": ev.deltaX, "deltaY": ev.deltaY, "deltaZ": ev.deltaZ, "deltaMode": ev.deltaMode
                });
            }
            else if (type === "OverflowEvent") {
                XDTest.events.push({"eventType": type, "time": ev.timeStamp,
                    "hierarchy": XDTest.determineHierarchy(ev.path), "orient": ev.orient,
                    "horizontalOverflow": ev.horizontalOverflow, "verticalOverflow": ev.verticalOverflow});
            }
            else {
                XDTest.events.push({"eventType": type, "time": ev.timeStamp,
                    "hierarchy": XDTest.determineHierarchy(ev.path), "type": ev.type, "bubbles": ev.bubbles,
                    "cancelable": ev.cancelable
                });
            }
        }
    },
    generateEvents: function (eventSequence, delay) {
        var result = [],
            initialTime = eventSequence[0].time;
        for (var i = 0, j = eventSequence.length; i < j; ++i) {
            eventSequence[i].time = eventSequence[i].time - initialTime + delay;
            if (eventSequence[i].eventType === "MouseEvent") {
                result.push(new XDTest.MouseEvent(eventSequence[i]));
            }
            else if (eventSequence[i].eventType === "KeyboardEvent") {
                result.push(new XDTest.KeyboardEvent(eventSequence[i], eventSequence[i].modifiers));
            }
            else if (eventSequence[i].eventType === "UIEvent") {
                result.push(new XDTest.UIEvent(eventSequence[i]));
            }
            else if (eventSequence[i].eventType === "MutationEvent") {
                result.push(new XDTest.MutationEvent(eventSequence[i]));
            }
            else if (eventSequence[i].eventType === "WheelEvent") {
                result.push(new XDTest.WheelEvent(eventSequence[i], eventSequence[i].modifiers));
            }
            else if (eventSequence[i].eventType === "OverflowEvent") {
                result.push(new XDTest.OverflowEvent(eventSequence[i]));
            }
            else {
                result.push(new XDTest.Event(eventSequence[i]));
            }
        }
        return result;
    },
    getModifiers: function (ev) {
        var modifiers = [];
        if (ev.originalEvent.altKey) {
            modifiers.push("Alt");
        }
        if (ev.originalEvent.ctrlKey) {
            modifiers.push("Control");
        }
        if (ev.originalEvent.metaKey) {
            modifiers.push("Meta");
        }
        if (ev.originalEvent.shiftKey) {
            modifiers.push("Shift");
        }
        return modifiers.join(" ");
    },
    determineHierarchy: function (path) {
        var curElement = path.shift(),
            hierarchy = [];
        while (curElement.nodeName !== "BODY") {
            var index = 0,
                cur = curElement;
            while (cur) {
                index++;
                cur  = cur.previousElementSibling;
            }
            hierarchy.push(index - 1);
            curElement = path.shift();
        }
        return hierarchy;
    },
    determineTarget: function (hierarchy) {
        var curElement = document.body,
            curIndex = hierarchy.length - 1;
        while (curIndex >= 0) {
            if (curElement.children[hierarchy[curIndex]]) {
                curElement = curElement.children[hierarchy[curIndex]];
            }
            else {
                curElement = curElement.shadowRoot;
            }
            curIndex--;
        }
        return curElement;
    },
    startRecording: function () {
        var i, j;
        for (i = 0, j = XDTest.mouseEvents.length; i < j; ++i) {
            document.addEventListener(XDTest.mouseEvents[i], function (ev) {
                XDTest.logEvent(ev, "MouseEvent");
            }, true);
        }
        for (i = 0, j = XDTest.keyboardEvents.length; i < j; ++i) {
            document.addEventListener(XDTest.keyboardEvents[i], function (ev) {
                XDTest.logEvent(ev, "KeyboardEvent");
            }, true);
        }
        for (i = 0, j = XDTest.uiEvents.length; i < j; ++i) {
            document.addEventListener(XDTest.uiEvents[i], function (ev) {
                XDTest.logEvent(ev, "UIEvent");
            }, true);
        }
        for (i = 0, j = XDTest.mutationEvents.length; i < j; ++i) {
            document.addEventListener(XDTest.mutationEvents[i], function (ev) {
                XDTest.logEvent(ev, "MutationEvent");
            }, true);
        }
        for (i = 0, j = XDTest.genericEvents.length; i < j; ++i) {
            document.addEventListener(XDTest.genericEvents[i], function (ev) {
                XDTest.logEvent(ev, "Event");
            }, true);
        }
        document.addEventListener("mousewheel", function (ev) {
            XDTest.logEvent(ev, "WheelEvent");
        }, true);
        document.addEventListener("overflowchanged", function (ev) {
            XDTest.logEvent(ev, "OverflowEvent");
        }, true);
    },
    replayEvents: function (curEvents, delay, eventIndex, lastBreak, nextBreak) {
        var i = eventIndex,
            j = curEvents.length;
        for (i, j; i < j && curEvents[i].time < nextBreak; ++i) {
            setTimeout(XDTest.dispatchEvent, curEvents[i].time - lastBreak, curEvents[i]);
        }
        if (i < j) {
            return i;
        }
        else {
            return -1;
        }
    },
    dispatchEvent: function (event) {
        var target = XDTest.determineTarget(event.hierarchy);
        event.dispatch(target);
    },
    originalLog: console.log,
    originalInfo: console.info,
    originalWarn: console.warn,
    originalError: console.error,
    getIndex: function (properties, identifier) {
        for (var i = 0, j = properties.length; i < j; ++i) {
            if (properties[i].identifier === identifier) {
                return i;
            }
        }
        return -1;
    },
    getPropertyIndex: function (properties, index, property) {
        for (var i = 0, j = properties[index].props.length; i < j; ++i) {
            if (properties[index].props[i].property === property) {
                return i;
            }
        }
        return -1;
    }
};

XDTest.startRecording();

window.onload = function () {

    var eventIndex = 0,
        lastBreak = {"id": "", "time": 0},
        nextBreak = {"id": "", "time": Math.pow(2, 31)},
        breakpoints = [],
        cssProperties = [];

    var command = {
        "name": "loaded",
        "url": window.location.href
    };
    window.parent.postMessage(JSON.stringify(command), "*");

    console.log = function (args) {
        var command = {
            "name": "log",
            "msg": args
        };
        window.parent.postMessage(JSON.stringify(command), "*");
        XDTest.originalLog.call(console, args);
    };

    console.info = function (args) {
        var command = {
            "name": "info",
            "msg": args
        };
        window.parent.postMessage(JSON.stringify(command), "*");
        XDTest.originalInfo.call(console, args);
    };

    console.warn = function (args) {
        var command = {
            "name": "warn",
            "msg": args
        };
        window.parent.postMessage(JSON.stringify(command), "*");
        XDTest.originalWarn.call(console, args);
    };

    console.error = function (args) {
        var command = {
            "name": "error",
            "msg": args
        };
        window.parent.postMessage(JSON.stringify(command), "*");
        XDTest.originalError.call(console, args);
    };
    window.onerror = function(error) {
        var command = {
            "name": "error",
            "msg": error
        };
        window.parent.postMessage(JSON.stringify(command), "*");
    };

    window.addEventListener("message", function (ev) {
        var command = JSON.parse(ev.data);
        if (command.name === "startRecording") {
            XDTest.events = [];
            XDTest.capturing = true;
        }
        else if (command.name === "stopRecording") {
            XDTest.capturing = false;
            var message = {
                "name": "sendEventSequence",
                "eventSequence": XDTest.events,
                "deviceId": command.deviceId
            };
            ev.source.postMessage(JSON.stringify(message), command.parentDomain);
        }
        else if (command.name === "startReplaying") {
            var eventSequence = [];
            for (var i = 0; i < command.eventSequence.length; ++i) {
                eventSequence = eventSequence.concat(XDTest.generateEvents(command.eventSequence[i].sequence, command.eventSequence[i].startTime));
            }
            eventIndex = 0;
            XDTest.events = eventSequence;
            breakpoints = command.breakpoints;
            nextBreak = breakpoints.shift() || {"id": "", "time": Math.pow(2, 31)};
            eventIndex = XDTest.replayEvents(eventSequence, command.delay, eventIndex, lastBreak.time, nextBreak.time);
            if (eventIndex > 0) {
                var message = {
                    "name": "breakpointReached",
                    "breakpoint": nextBreak
                };
                setTimeout(XDTest.sendMessage, nextBreak.time - lastBreak.time, ev, JSON.stringify(message), command.parentDomain);
            }
        }
        else if (command.name === "continue") {
            if (eventIndex != -1) {
                lastBreak = nextBreak;
                nextBreak = breakpoints.shift() || {"id": "", "time": Math.pow(2, 31)};
                eventIndex = XDTest.replayEvents(XDTest.events, command.delay, eventIndex, lastBreak.time, nextBreak.time);
                if (eventIndex > 0) {
                    var message = {
                        "name": "breakpointReached",
                        "breakpoint": nextBreak
                    };
                    setTimeout(XDTest.sendMessage, nextBreak.time - lastBreak.time, ev, JSON.stringify(message), command.parentDomain);
                }
            }
        }
        else if (command.name === "updateCSS") {
            var index = XDTest.getIndex(cssProperties, command.identifier),
                elems = document.querySelectorAll(command.identifier);
            if (index === -1) {
                cssProperties.push({
                    "identifier": command.identifier,
                    "props": [{"property": command.property, "value": command.value}]
                });
                index = 0;
            }
            else {
                var propertyIndex = XDTest.getPropertyIndex(cssProperties, index, command.property);
                if (propertyIndex === -1) {
                    cssProperties[index].props.push({
                        "property": command.property,
                        "value": command.value
                    });
                }
                else {
                    cssProperties[index].props[propertyIndex].value = command.value;
                }
            }
            var properties = cssProperties[index].props,
                style = "";
            for (var i = 0, j = properties.length; i < j; ++i) {
                style = style + properties[i].property + ": " + properties[i].value + ";";
            }
            for (var i = 0, j = elems.length; i < j; ++i) {
                elems[i].setAttribute("style", style);
            }
        }
        else if (command.name === "restore") {
            var index = XDTest.getIndex(cssProperties, command.identifier),
                elems = document.querySelectorAll(command.identifier),
                propertyIndex = XDTest.getPropertyIndex(cssProperties, index, command.property);
            cssProperties[index].props.splice(propertyIndex, 1);
            var properties = cssProperties[index].props,
                style = "";
            for (var i = 0, j = properties.length; i < j; ++i) {
                style = style + properties[i].property + ": " + properties[i].value + ";";
            }
            for (var i = 0, j = elems.length; i < j; ++i) {
                elems[i].setAttribute("style", style);
            }
        }
        else if (command.name === "resetCSS") {
            for (var i = 0, j = cssProperties.length; i < j; ++i) {
                var elements = document.querySelectorAll(cssProperties[i].identifier);
                for (var k = 0, l = elements.length; k < l; ++k) {
                    elements[k].setAttribute("style", "");
                }
            }
        }
        else if (command.name === "reactivateCSS") {
            for (var i = 0, j = cssProperties.length; i < j; ++i) {
                var elements = document.querySelectorAll(cssProperties[i].identifier);
                var properties = cssProperties[i].props,
                    style = "";
                for (var k = 0, l = properties.length; k < l; ++k) {
                    style = style + properties[k].property + ": " + properties[k].value + ";";
                }
                for (var k = 0, l = elements.length; k < l; ++k) {
                    elements[k].setAttribute("style", style);
                }
            }
        }
        else if (command.name === "executeJS") {
            eval(command.code);
        }
    }, false);
};