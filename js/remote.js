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
        //TODO: The following events are temporarily disabled because of bugs
        //"DOMCharacterDataModified",    //all major browsers
        //"DOMNodeInserted",             //all major browsers
        //"DOMNodeInsertedIntoDocument", //Opera, Safari, Chrome
        //"DOMNodeRemoved",              //all major browsers
        //"DOMNodeRemovedFromDocument",  //Opera, Safari, Chrome
        //"DOMSubtreeModified"          //IE, Firefox, Safari, Chrome
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
        //"load",                        //all major browsers
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
        this.event.initMutationEvent(ev.type, ev.bubbles, ev.cancelable, null, ev.prevValue, ev.newValue,
            ev.attrName, ev.attrChange);
    },
    OverflowEvent: function (ev) {
        XDTest.Event.call(this, ev);
        this.event = document.createEvent("OverflowEvent");
        this.event.initOverflowEvent(ev.orient, ev.horizontalOverflow, ev.verticalOverflow);
    },
    //Send a message to the parent page of the iframe
    sendMessage: function (ev, message, parentDomain) {
        ev.source.postMessage(message, parentDomain);
    },
    //Logs an event if the user is currently capturing events
    logEvent: function (ev, type) {
        if (XDTest.capturing) {
            if (type === "MouseEvent") {
                XDTest.events.push({"eventType": type, "time": ev.timeStamp,
                    "hierarchy": XDTest.determineHierarchy(ev.path), "type": ev.type, "bubbles": ev.bubbles,
                    "cancelable": ev.cancelable, "detail": ev.detail, "screenX": ev.screenX, "screenY": ev.screenY,
                    "clientX": ev.clientX, "clientY": ev.clientY, "ctrlKey": ev.ctrlKey, "altKey": ev.altKey,
                    "shiftKey": ev.shiftKey, "metaKey": ev.metaKey, "button": ev.button, "relatedTarget": null
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
                    "cancelable": ev.cancelable, "relatedNode": null, "prevValue": ev.prevValue,
                    "newValue": ev.newValue, "attrName": ev.attrName, "attrChange": ev.attrChange
                });
            }
            else if (type === "WheelEvent") {
                XDTest.events.push({"eventType": type, "time": ev.timeStamp,
                    "hierarchy": XDTest.determineHierarchy(ev.path), "type": ev.type, "bubbles": ev.bubbles,
                    "cancelable": ev.cancelable, "detail": ev.detail, "screenX": ev.screenX, "screenY": ev.screenY,
                    "clientX": ev.clientX, "clientY": ev.clientY, "button": ev.button, "relatedTarget": null,
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
    //Generates actual events from an event log
    generateEvents: function (eventLog, delay) {
        var result = [],
            initialTime = eventLog[0].time;
        for (var i = 0, j = eventLog.length; i < j; ++i) {
            eventLog[i].time = eventLog[i].time - initialTime + delay;
            if (eventLog[i].eventType === "MouseEvent") {
                result.push(new XDTest.MouseEvent(eventLog[i]));
            }
            else if (eventLog[i].eventType === "KeyboardEvent") {
                result.push(new XDTest.KeyboardEvent(eventLog[i], eventLog[i].modifiers));
            }
            else if (eventLog[i].eventType === "UIEvent") {
                result.push(new XDTest.UIEvent(eventLog[i]));
            }
            else if (eventLog[i].eventType === "MutationEvent") {
                result.push(new XDTest.MutationEvent(eventLog[i]));
            }
            else if (eventLog[i].eventType === "WheelEvent") {
                result.push(new XDTest.WheelEvent(eventLog[i], eventLog[i].modifiers));
            }
            else if (eventLog[i].eventType === "OverflowEvent") {
                result.push(new XDTest.OverflowEvent(eventLog[i]));
            }
            else {
                result.push(new XDTest.Event(eventLog[i]));
            }
        }
        return result;
    },
    //Returns the modifiers of an event in string form
    getModifiers: function (ev) {
        var modifiers = [];
        if (ev.altKey) {
            modifiers.push("Alt");
        }
        if (ev.ctrlKey) {
            modifiers.push("Control");
        }
        if (ev.metaKey) {
            modifiers.push("Meta");
        }
        if (ev.shiftKey) {
            modifiers.push("Shift");
        }
        return modifiers.join(" ");
    },
    /*
        Deprecated, but not yet deleted in case there are bugs with the new function

    determineHierarchy: function (path) {
        if (path.length === 0) {
            return [];
        }
        var curElement = path.shift(),
            hierarchy = [];
        while (curElement.nodeName !== "BODY" && curElement.nodeName !== "HTML" && curElement.nodeName !== "#document") {
            var index = 0,
                cur = curElement;
            while (cur) {
                index++;
                cur  = cur.previousElementSibling;
            }
            if (curElement.parentElement || curElement.parentNode) {
                hierarchy.push(index - 1);
            }
            else {
                hierarchy.push(-1);
            }
            curElement = path.shift();
        }
        return hierarchy;
    },
    */
    //Determines the hierarchy that an event must traverse to reach the target of the event
    determineHierarchy: function (path) {
        if (path.length === 0) {
            return [];
        }
        var curElement = path.shift(),
            hierarchy = [];
        //Calculate hierarchy until top of the document is reached
        while (curElement.nodeName !== "BODY" && curElement.nodeName !== "HTML" && curElement.nodeName !== "#document") {
            //If the current element does not have a parent node, it must be a shadowRoot element
            if (!curElement.parentElement && !curElement.parentNode) {
                hierarchy.push(-1);
            }
            //If the current element has an id, it can simply be reached via id
            else if (curElement.id) {
                hierarchy.push(curElement.id);
            }
            //Otherwise the current element can be reached by taking the x-th child of the parent node
            else {
                //Calculate child index of the current element
                var index = 0,
                    cur = curElement;
                while (cur) {
                    index++;
                    cur = cur.previousElementSibling;
                }
                hierarchy.push(index - 1);
            }
            curElement = path.shift();
        }
        var realHierarchy = [],
            idFound = false;
        //If an element has an id, the rest of the hierarchy must not be traversed,
        //but this must be done for each shadowRoot element
        for (var i = 0; i < hierarchy.length; ++i) {
            // if we already encountered an id deeper in the hierarchy and the current element is not a shadowRoot,
            // we do not need the current step of the hierarchy
            if (hierarchy[i] === -1 || !idFound) {
                realHierarchy.push(hierarchy[i]);
                if (typeof hierarchy[i] === "string" || hierarchy[i] instanceof String) {
                    idFound = true;
                }
                if (hierarchy[i] === -1) {
                    //inside a shadowRoot element, we need to look for an id again
                    idFound = false;
                }
            }
        }
        return realHierarchy;
    },
    /*
       Deprecated, but not yet deleted in case there are bugs with the new function

    determineTarget: function (hierarchy) {
        var curElement = document.body,
            curIndex = hierarchy.length - 1;
        while (curIndex >= 0) {
            if (hierarchy[curIndex] === -1) {
                curElement = curElement.shadowRoot;
            }
            else {
                curElement = curElement.children[hierarchy[curIndex]];
            }
            curIndex--;
        }
        return curElement;
    },
    */
    //Determines the actual target element based on the hierarchy
    determineTarget: function (hierarchy) {
        var curElement = document.body,
            curIndex = hierarchy.length - 1;
        if (hierarchy) {
            while (curIndex >= 0 && curElement) {
                if (typeof hierarchy[curIndex] === "string" || hierarchy[curIndex] instanceof String) {
                    if (curElement.getElementById) {
                        curElement = curElement.getElementById(hierarchy[curIndex]);
                    }
                    else {
                        curElement = document.getElementById(hierarchy[curIndex]);
                    }
                }
                else if (hierarchy[curIndex] === -1) {
                    curElement = curElement.shadowRoot;
                }
                else {
                    curElement = curElement.children[hierarchy[curIndex]];
                }
                curIndex--;
            }
        }
        return curElement;
    },
    //Adds event listeners for all events that we want to capture
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
    //Replays a sequence of events
    replayEvents: function (curEvents, delay, eventIndex, lastBreak, nextBreak) {
        var i = eventIndex,
            j = curEvents.length;
        //Execute all events (until the next breakpoint)
        for (i, j; i < j && curEvents[i].time < nextBreak; ++i) {
            setTimeout(XDTest.dispatchEvent, curEvents[i].time - lastBreak, curEvents[i]);
        }
        if (i < j) {
            //Not all events have been executed yet --> we reached a breakpoint
            return i;
        }
        else {
            //All events have been executed
            return -1;
        }
    },
    dispatchEvent: function (event) {
        var target = XDTest.determineTarget(event.hierarchy);
        if (target) {
            event.dispatch(target);
        }
    },
    //Store the original console functions
    originalLog: console.log,
    originalInfo: console.info,
    originalWarn: console.warn,
    originalError: console.error,
    //Get the index of a CSS selector in the list of css rules
    getIndex: function (cssRules, selector) {
        for (var i = 0, j = cssRules.length; i < j; ++i) {
            if (cssRules[i].identifier === selector) {
                return i;
            }
        }
        return -1;
    },
    //Get the index of a property within a specific CSS selector
    getPropertyIndex: function (cssRules, selectorIndex, property) {
        for (var i = 0, j = cssRules[selectorIndex].props.length; i < j; ++i) {
            if (cssRules[selectorIndex].props[i].property === property) {
                return i;
            }
        }
        return -1;
    },
    //add all rules from a given set of css rules to the stylesheet that is attached to the document
    addAllRules: function (cssRules, stylesheet) {
        for (var i = 0, j = stylesheet.cssRules.length; i < j; ++i) {
            stylesheet.removeRule(0);
        }
        for (var i = 0, j = cssRules.length; i < j; ++i) {
            var properties = cssRules[i].props,
                style = cssRules[i].identifier + " {";

            for (var k = 0, l = properties.length; k < l; ++k) {
                style = style + properties[k].property + ": " + properties[k].value + " !important;";
            }
            style = style + "}";
            stylesheet.insertRule(style, 0);
        }
    },
    startErrorCapturing: function () {
        //Overwrite all console logging functions and send messages to the parent frame before calling the actual function
        console.log = function (args) {
            var command = {
                "name": "log",
                "msg": JSON.stringify(args)
            };
            window.parent.postMessage(JSON.stringify(command), "*");
            XDTest.originalLog.call(console, args);
        };
        console.info = function (args) {
            var command = {
                "name": "info",
                "msg": JSON.stringify(args)
            };
            window.parent.postMessage(JSON.stringify(command), "*");
            XDTest.originalInfo.call(console, args);
        };
        console.warn = function (args) {
            var command = {
                "name": "warn",
                "msg": JSON.stringify(args)
            };
            window.parent.postMessage(JSON.stringify(command), "*");
            XDTest.originalWarn.call(console, args);
        };
        console.error = function (args) {
            var command = {
                "name": "error",
                "msg": JSON.stringify(args)
            };
            window.parent.postMessage(JSON.stringify(command), "*");
            XDTest.originalError.call(console, args);
        };

        //If a JS error occurs, forward it to the parent domain along with the stack trace
        window.onerror = function (message, filename, lineno, colno, error) {
            var command;
            if (error && error.stack) {
                command = {
                    "name": "exception",
                    "msg": error.stack
                };
            }
            else {
                command = {
                    "name": "exception",
                    "msg": message
                };
            }
            window.parent.postMessage(JSON.stringify(command), "*");
        };
    }
};

XDTest.startRecording();
XDTest.startErrorCapturing();

window.addEventListener("load", initialize, false);

function initialize() {

    var eventIndex = 0,
        lastBreak = {"id": "", "time": 0},
        nextBreak = {"id": "", "time": Math.pow(2, 31)},
        breakpoints = [],
        cssRules = [],
        style = document.createElement("style"),
        active = true;

    //Append a new stylesheet to the document
    style.appendChild(document.createTextNode(""));
    document.head.appendChild(style);
    var stylesheet = style.sheet,
        command = {
            "name": "loaded",
            "url": window.location.href
        };
    window.parent.postMessage(JSON.stringify(command), "*");

    //Periodically check if the URL of the iframe has changed and send changes to the parent frame
    var location = window.location.href;
    setInterval(function()
    {
        if(location != window.location.href)
        {
            location = window.location.href;
            var command = {
                "name": "loaded",
                "url": window.location.href
            };
            window.parent.postMessage(JSON.stringify(command), "*");
        }
    }, 200);

    //Process all received messages
    window.addEventListener("message", function (ev) {
        var command = JSON.parse(ev.data);
        if (command.name === "startRecording") {
            //Reset previously recorded events before starting recording
            XDTest.events = [];
            XDTest.capturing = true;
        }
        else if (command.name === "stopRecording") {
            XDTest.capturing = false;
            //After stopping recording, send the recorded events to the parent frame
            var message = {
                "name": "sendEventSequence",
                "eventSequence": XDTest.events,
                "deviceID": command.deviceID
            };
            window.parent.postMessage(JSON.stringify(message), "*");
        }
        else if (command.name === "startReplaying") {
            //Replay the received event sequence
            var eventSequence = [];
            for (var i = 0; i < command.eventSequence.length; ++i) {
                eventSequence = eventSequence.concat(XDTest.generateEvents(command.eventSequence[i].sequence, command.eventSequence[i].startTime));
            }
            eventIndex = 0;
            XDTest.events = eventSequence;
            breakpoints = command.breakpoints;
            nextBreak = breakpoints.shift() || {"id": "", "time": Math.pow(2, 31)};
            //Execute events until the next breakpoint
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
                //Continue execution until the next breakpoint is reached
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
            var index = XDTest.getIndex(cssRules, command.identifier);
            //Add a new CSS rule to the document
            if (index === -1) {
                cssRules.push({
                    "identifier": command.identifier,
                    "props": [{"property": command.property, "value": command.value}]
                });
            }
            else {
                var propertyIndex = XDTest.getPropertyIndex(cssRules, index, command.property);
                if (propertyIndex === -1) {
                    cssRules[index].props.push({
                        "property": command.property,
                        "value": command.value
                    });
                }
                else {
                    cssRules[index].props[propertyIndex].value = command.value;
                }
            }
            if (active) {
                XDTest.addAllRules(cssRules, stylesheet);
            }
        }
        else if (command.name === "restore") {
            //Remove a CSS rule from the document
            var index = XDTest.getIndex(cssRules, command.identifier),
                propertyIndex = XDTest.getPropertyIndex(cssRules, index, command.property);
            cssRules[index].props.splice(propertyIndex, 1);
            if (active) {
                XDTest.addAllRules(cssRules, stylesheet);
            }
        }
        else if (command.name === "active") {
            //The device was activated, apply CSS rules
            active = true;
            XDTest.addAllRules(cssRules, stylesheet);
        }
        else if (command.name === "inactive") {
            //The device was deactivated, remove all CSS rules
            active = false;
            for (var i = 0, j = stylesheet.cssRules.length; i < j; ++i) {
                stylesheet.removeRule(0);
            }
        }
        else if (command.name === "executeJS") {
            //Execute a JS command and send the return value to the parent frame
            //TODO: Handle circular structures in return values
            var returnVal = eval(command.code);
            if (returnVal !== undefined) {
                var command = {
                    "name": "return",
                    "msg": JSON.stringify(returnVal)
                };
                window.parent.postMessage(JSON.stringify(command), "*");
            }
            else {
                var command = {
                    "name": "return",
                    "msg": JSON.stringify("undefined")
                };
                window.parent.postMessage(JSON.stringify(command), "*");
            }
        }
    }, false);
}