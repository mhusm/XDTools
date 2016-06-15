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

function getConnectionURL() {
    //TODO: adjust implementation of this function to connect devices to each other:
    //      Adjust IP to the IP where the application is running
    //      Adjust URL if you are running another application (possibly from another framework)
//    return "http://129.132.114.114:8082/combined.html?connect=" + XDmvc.deviceId;
    return window.location.href.replace(window.location.hostname, "129.132.114.114");
}

function getConnectionParam() {
    //TODO: adjust implementation of this function to connect devices to each other:
    // Return a parameter that is required to connect to this devices
    return XDmvc.deviceId;
}

function connectWithParam(param) {
    //TODO: adjust implementation of this function to connect devices to each other:
    //   Establish a connection to a device. Device information is given in param. It is up to you to define it.
    if (XDmvc.XDd2d && XDmvc.XDd2d.serverReady) {
        XDmvc.connectTo(param);
        XDmvc.addRole("visitor");
        XDmvc.removeRole("owner");
    } else {
        XDmvc.on("XDserverReady", function(){
            XDmvc.connectTo(param);
            XDmvc.addRole("visitor");
            XDmvc.removeRole("owner");
        });
    }
}


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
    touchEvents: [
        "touchstart",
        "touchend",
        "touchmove",
        "touchcancel"
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
        this.scrollTop = ev.scrollTop;
        this.scrollLeft = ev.scrollLeft;
        this.dispatch = function (target) {
            target.dispatchEvent(this.event);
            if (this.event.type === "scroll") {
                target.scrollTop = this.scrollTop;
                target.scrollLeft = this.scrollLeft;
            }
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
        this.backspace = ev.backspace;
        this.caretPosition = ev.caretPosition;
        this.dispatch = function (target) {
            target.dispatchEvent(this.event);
            if (this.backspace && this.caretPosition && this.event.type === "keyup") {
                var text = target.value;
                target.value = text.substring(0, this.caretPosition) + text.substring(this.caretPosition + 1);
            }
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
    TouchEvent: function (ev) {
        XDTest.Event.call(this, ev);
        this.event = document.createEvent("TouchEvent");
        this.event.initTouchEvent(ev.type, ev.bubbles, ev.cancelable, null, ev.screenX, ev.screenY, ev.clientX, ev.clientY, ev.ctrlKey, ev.altKey, ev.shiftKey, ev.metaKey, ev.changedTouches, ev.touches, ev.targetTouches);
    },
    //Send a message to the parent page of the iframe
    sendMessage: function (ev, message, parentDomain) {
        ev.source.postMessage(message, parentDomain);
    },
    //Logs an event if the user is currently capturing events
    logEvent: function (ev, type, caretPosition, scrollTop, scrollLeft) {
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
                var backspace = ev.keyCode === 8;
                XDTest.events.push({"eventType": type, "time": ev.timeStamp,
                    "hierarchy": XDTest.determineHierarchy(ev.path), "type": ev.type, "bubbles": ev.bubbles,
                    "cancelable": ev.cancelable, "keyCode": ev.keyCode, "which": ev.which, "location": ev.location,
                    "modifiers": XDTest.getModifiers(ev), "repeat": ev.repeat, "detail": ev.detail, "backspace": backspace, "caretPosition": caretPosition
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
            else if (type === "TouchEvent") {
                XDTest.events.push({"eventType": type, "time": ev.timeStamp,
                    "hierarchy": XDTest.determineHierarchy(ev.path), "type": ev.type, "bubbles": ev.bubbles,
                    "cancelable": ev.cancelable, "detail": ev.detail, "touches": XDTest.processTouchList(ev.touches),
                    "targetTouches": XDTest.processTouchList(ev.targetTouches),
                    "changedTouches": XDTest.processTouchList(ev.changedTouches), "ctrlKey": ev.ctrlKey,
                    "altKey": ev.altKey, "shiftKey": ev.shiftKey, "metaKey": ev.metaKey
                });
                /*XDTest.events.push({"eventType": type, "time": ev.timeStamp,
                    "hierarchy": XDTest.determineHierarchy(ev.path), "type": ev.type, "bubbles": ev.bubbles,
                    "cancelable": ev.cancelable, "scrollTop": scrollTop, "scrollLeft": scrollLeft, "view": ev.view,
                    "detail": ev.detail, "touches": ev.touches, "targetTouches": ev.targetTouches,
                    "changedTouches": ev.changedTouches, "ctrlKey": ev.ctrlKey, "altKey": ev.altKey,
                    "shiftKey": ev.shiftKey, "metaKey": ev.metaKey
                });*/
            }
            else {
                XDTest.events.push({"eventType": type, "time": ev.timeStamp,
                    "hierarchy": XDTest.determineHierarchy(ev.path), "type": ev.type, "bubbles": ev.bubbles,
                    "cancelable": ev.cancelable, "scrollTop": scrollTop, "scrollLeft": scrollLeft
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
                //result.push(new XDTest.OverflowEvent(eventLog[i]));
            }
            else if (eventLog[i].eventType === "TouchEvent") {
                result.push(new XDTest.TouchEvent(eventLog[i]));
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
                var caretPosition = XDTest.getCaretPosition(ev.path);
                XDTest.logEvent(ev, "KeyboardEvent", caretPosition);
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
                var scrollTop = XDTest.getScrollTop(ev.path),
                    scrollLeft = XDTest.getScrollLeft(ev.path);
                XDTest.logEvent(ev, "Event", null, scrollTop, scrollLeft);
            }, true);
        }
        for (i = 0, j = XDTest.touchEvents.length; i < j; ++i) {
            document.addEventListener(XDTest.touchEvents[i], function (ev) {
                //TODO: temporarily disabled
                //XDTest.logEvent(ev, "TouchEvent");
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
    originalDebug: console.debug,
    originalDir: console.dir,
    originalCount: console.count,
    originalAssert: console.assert,
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
    addAllRules: function (cssRules, stylesheets) {
        this.removeAllRules(cssRules, stylesheets);
        for (var i = 0, j = cssRules.length; i < j; ++i) {
            var properties = cssRules[i].props,
                style = cssRules[i].identifier + " {",
                layer = cssRules[i].layer,
                index = stylesheets.map(function (e) { return e.layer; }).indexOf(layer);
            if (index === -1) {
                return;
            }
            for (var k = 0, l = properties.length; k < l; ++k) {
                style = style + properties[k].property + ": " + properties[k].value + " !important;";
            }
            style = style + "}";
            stylesheets[index].stylesheet.insertRule(style, 0);
        }
    },
    removeAllRules: function (cssRules, stylesheets) {
        for (var i = 0, j = stylesheets.length; i < j; ++i) {
            for (var k = 0, l = stylesheets[i].stylesheet.cssRules.length; k < l; ++k) {
                stylesheets[i].stylesheet.deleteRule(0);
            }
        }
    },
    startErrorCapturing: function () {
        var consoleCount = [];
        //Overwrite all console logging functions and send messages to the parent frame before calling the actual function
        console.log = function (args) {
            var command = {
                "name": "log",
                "msg": JSON.stringify(JSON.decycle(args, true))
            };
            window.parent.postMessage(JSON.stringify(command), "*");
            XDTest.originalLog.call(console, args);
        };
        console.debug = function (args) {
            var command = {
                "name": "log",
                "msg": JSON.stringify(JSON.decycle(args, true))
            };
            window.parent.postMessage(JSON.stringify(command), "*");
            XDTest.originalDebug.call(console, args);
        };
        console.info = function (args) {
            var command = {
                "name": "info",
                "msg": JSON.stringify(JSON.decycle(args, true))
            };
            window.parent.postMessage(JSON.stringify(command), "*");
            XDTest.originalInfo.call(console, args);
        };
        console.warn = function (args) {
            var command = {
                "name": "warn",
                "msg": JSON.stringify(JSON.decycle(args, true))
            };
            window.parent.postMessage(JSON.stringify(command), "*");
            XDTest.originalWarn.call(console, args);
        };
        console.error = function (args) {
            var command = {
                "name": "error",
                "msg": JSON.stringify(JSON.decycle(args, true))
            };
            window.parent.postMessage(JSON.stringify(command), "*");
            XDTest.originalError.call(console, args);
        };
        console.count = function (args) {
            var index = consoleCount.map(function (e) { return e.label; }).indexOf(args);
            if (index !== -1) {
                consoleCount[index].counter++;
            }
            else {
                consoleCount.push({"label": args, "counter": 1});
                index = consoleCount.length - 1;
            }
            var command = {
                "name": "log",
                "msg": JSON.stringify(consoleCount[index].label + ": " + consoleCount[index].counter)
            };
            window.parent.postMessage(JSON.stringify(command), "*");
            XDTest.originalCount.call(console, args);
        };
        console.dir = function (args) {
            var command = {
                "name": "log",
                "msg": JSON.stringify(JSON.decycle(args, true))
            };
            window.parent.postMessage(JSON.stringify(command), "*");
            XDTest.originalDir.call(console, args);
        };
        console.assert = function (args1, args2) {
            var command = {
                "name": "error",
                "msg": JSON.stringify("Assertion failed: " + args2)
            };
            window.parent.postMessage(JSON.stringify(command), "*");
            XDTest.originalAssert.call(console, args1, args2);
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
    },
    determineLayers: function () {
        var curElement = null,
            shadowRoots = [],
            toProcess = [{"path": ["document.body"], "element": document.body}];
        while (toProcess.length > 0) {
            var cur = toProcess.pop();
            curElement = cur.element;
            if (curElement && curElement.is && curElement.is.toLowerCase() === curElement.nodeName.toLowerCase()) {
                var path = cur.path.slice(0);
                if (this.isCustomPolymerElement(curElement.localName)) {
                    shadowRoots.push({
                        "name": curElement.localName,
                        "id": curElement.id,
                        "path": path,
                        "type": "default"
                    });
                }
                for (var i = 0; i < curElement.children.length; ++i) {
                    var path = cur.path.slice(0);
                    path.push("children[" + i + "]");
                    toProcess.push({"path": path, "element": curElement.children[i]});
                }
            }
            else if (curElement.children.length > 0) {
                for (var i = 0; i < curElement.children.length; ++i) {
                    var path = cur.path.slice(0);
                    path.push("children[" + i + "]");
                    toProcess.push({"path": path, "element": curElement.children[i]});
                }
            }
            else if (curElement.shadowRoot) {
                var path = cur.path.slice(0);
                if (this.isCustomPolymerElement(curElement.localName)) {
                    shadowRoots.push({
                        "name": curElement.localName,
                        "id": curElement.id,
                        "path": path,
                        "type": "shadow"
                    });
                }
                path = cur.path.slice(0);
                path.push("shadowRoot");
                toProcess.push({"path": path, "element": curElement.shadowRoot});
            }
        }
        return shadowRoots;
    },
    updateStylesheets: function (stylesheets, layers) {
        for (var i = 0, j = layers.length; i < j; ++i) {
            var name = layers[i].path.join(".");
            if (layers[0].type === "shadow") {
                name = name + ".shadowRoot";
            }
            if (stylesheets.map(function (e) { return e.layer; }).indexOf(name) === -1) {
                var style = document.createElement("style"),
                    code = "";
                style.appendChild(document.createTextNode(""));
                var element = eval(name);
                element.appendChild(style);
                stylesheets.push({"layer": name, "stylesheet": style.sheet});
            }
        }
        if (stylesheets.map(function (e) { return e.layer; }).indexOf("document.body") === -1) {
            var style = document.createElement("style");
            style.appendChild(document.createTextNode(""));
            document.head.appendChild(style);
            stylesheets.push({"layer": "document.body", "stylesheet": style.sheet});
        }
    },
    isCustomPolymerElement: function (name) {
        //TODO: improve: only consider elements that actually exist
        return name.indexOf("paper-") !== 0 && name.indexOf("iron-") !== 0 && name.indexOf("google-") !== 0 && name.indexOf("gold-") !== 0 && name.indexOf("neon-") !== 0 && name.indexOf("platinum-") !== 0 && name !=="marked-element";
    },
    getCaretPosition: function (path) {
        for (var i = 0; i < path.length; ++i) {
            if (path[i].selectionStart || path[i].selectionStart === 0) {
                return path[i].selectionStart;
            }
        }
        return -1;
    },
    getScrollTop: function (path) {
        if (!path[0].nodeName || path[0].nodeName === "#document") {
            return document.body.scrollTop;
        }
        return path[0].scrollTop;
    },
    getScrollLeft: function (path) {
        if (!path[0].nodeName || path[0].nodeName === "#document") {
            return document.body.scrollLeft;
        }
        return path[0].scrollLeft;
    },
    processTouchList: function (touchList) {
        var processedList = [];
        for (var i = 0; i < touchList.length; ++i) {
            processedList.push({
               "clientX": touchList[i].clientX,
               "clientY": touchList[i].clientY,
               "force": touchList[i].force,
               "identifier": touchList[i].identifier,
               "pageX": touchList[i].pageX,
               "pageY": touchList[i].pageY,
               "radiusX": touchList[i].radiusX,
               "radiusY": touchList[i].radiusY,
               "screenX": touchList[i].screenX,
               "screenY": touchList[i].screenY,
               "webkitForce": touchList[i].webkitForce,
               "webkitRadiusX": touchList[i].webkitRadiusX,
               "webkitRadiusY": touchList[i].webkitRadiusY,
               "webkitRotationAngle": touchList[i].webkitRotationAngle
            });
        }
        return processedList;
    },
    debuggedFunctions: {}
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
        active = true,
        stylesheets = [];

    var command = {
            "name": "loaded",
            "url": window.location.href
        };
    window.parent.postMessage(JSON.stringify(command), "*");

    var layers = XDTest.determineLayers(),
        command = {
            "name": "layers",
            "layers": layers
        };
    window.parent.postMessage(JSON.stringify(command), "*");
    XDTest.updateStylesheets(stylesheets, layers);
    setInterval(function()
    {
        var newLayers = XDTest.determineLayers();
        if (newLayers.length !== layers.length) {
            layers = newLayers;
            command = {
                "name": "layers",
                "layers": layers
            };
            window.parent.postMessage(JSON.stringify(command), "*");
            XDTest.updateStylesheets(stylesheets, layers);
            if (active) {
                XDTest.addAllRules(cssRules, stylesheets);
            }
        }
    }, 500);

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
        if (isJson(ev.data)) {
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
                        "layer": command.layer,
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
                    XDTest.addAllRules(cssRules, stylesheets);
                }
            }
            else if (command.name === "restore") {
                //Remove a CSS rule from the document
                var index = XDTest.getIndex(cssRules, command.identifier, command.layer),
                    propertyIndex = XDTest.getPropertyIndex(cssRules, index, command.property);
                cssRules[index].props.splice(propertyIndex, 1);
                if (active) {
                    XDTest.addAllRules(cssRules, stylesheets);
                }
            }
            else if (command.name === "active") {
                //The device was activated, apply CSS rules
                active = true;
                XDTest.addAllRules(cssRules, stylesheets);
            }
            else if (command.name === "inactive") {
                //The device was deactivated, remove all CSS rules
                active = false;
                XDTest.removeAllRules(cssRules, stylesheets);
            }
            else if (command.name === "executeJS") {
                //Execute a JS command and send the return value to the parent frame
                var returnVal;
                if (command.layer !== "document.body") {
                    var index = command.code.indexOf("(");
                    if (index !== -1) {
                        var functionName = command.code.substring(0, index);
                        if (eval(command.layer + "." + functionName)) {
                            returnVal = eval(command.layer + "." + command.code);
                        }
                        else {
                            returnVal = eval(command.code);
                        }
                    }
                    else {
                        if (eval(command.layer + "." + command.code)) {
                            returnVal = eval(command.layer + "." + command.code);
                        }
                        else {
                            returnVal = eval(command.code);
                        }
                    }
                }
                else {
                    returnVal = eval(command.code);
                }
                if (command.code.indexOf("console.") !== 0) {
                    if (returnVal !== undefined) {
                        var command = {
                            "name": "return",
                            "msg": JSON.stringify(JSON.decycle(returnVal, true))
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
            }
            else if (command.name === "requestConnectionURL") {
                var url = getConnectionURL(),
                    command = {
                        "name": "receiveConnectionURL",
                        "url": url,
                        "deviceID": command.deviceID,
                        "mainDeviceID": command.mainDeviceID
                    };
                window.parent.postMessage(JSON.stringify(command), "*");
            }
            else if (command.name === "requestConnectionParam") {
                var param = getConnectionParam(),
                    command = {
                        "name": "receiveConnectionParam",
                        "param": param,
                        "deviceID": command.deviceID,
                        "mainDeviceID": command.mainDeviceID
                    };
                window.parent.postMessage(JSON.stringify(command), "*");
            }
            else if (command.name === "connectWithParam") {
                connectWithParam(command.param);
            }
            else if (command.name === "debug") {
                if (!XDTest.debuggedFunctions[command.functionName]) {
                    var originalFunction = eval(command.functionName);
                    var newFunction = function () {
                        var newEl = document.createElement("div");
                        newEl.style.width = "100%";
                        newEl.style.height = "100%";
                        newEl.style.backgroundColor = "rgba(50, 200, 50, 0.5)";
                        newEl.style.zIndex = "20";
                        newEl.style.position = "absolute";
                        newEl.style.left = 0;
                        newEl.style.top = 0;
                        document.body.appendChild(newEl);
                        var returnVal = originalFunction.apply(this, arguments);
                        document.body.removeChild(newEl);
                        return returnVal;
                    };
                    XDTest.debuggedFunctions[command.functionName] = originalFunction;
                    eval(command.functionName + " = " + newFunction);
                }
                var newCommand = {
                    "name": "debuggingPrepared",
                    "functionName": command.functionName
                };
                window.parent.postMessage(JSON.stringify(newCommand), "*");
            }
            else if (command.name === "undebug") {
                eval(command.functionName + " = " + XDTest.debuggedFunctions[command.functionName]);
            }
        }
    }, false);
}

/*
    The following code is copied from:
    https://github.com/Eccenux/JSON-js
 */

if (typeof JSON.decycle !== 'function') {
    (function(){

        /**
         * Allows stringifing DOM elements.
         *
         * This is done in hope to identify the node when dumping.
         *
         * @param {Element} node DOM Node (works best for DOM Elements).
         * @returns {String}
         */
        function stringifyNode(node) {
            var text = "";
            switch (node.nodeType) {
                case node.ELEMENT_NODE:
                    text = node.nodeName.toLowerCase();
                    if (node.id.length) {
                        text += '#' + node.id;
                    }
                    else {
                        if (node.className.length) {
                            text += '.' + node.className.replace(/ /, '.');
                        }
                        if ('textContent' in node) {
                            text += '{textContent:'
                            + (node.textContent.length < 20 ? node.textContent : node.textContent.substr(0, 20) + '...')
                            + '}'
                            ;
                        }
                    }
                    break;
                // info on values: http://www.w3.org/TR/DOM-Level-2-Core/core.html#ID-1841493061
                default:
                    text = node.nodeName;
                    if (node.nodeValue !== null) {
                        text += '{value:'
                        + (node.nodeValue.length < 20 ? node.nodeValue : node.nodeValue.substr(0, 20) + '...')
                        + '}'
                        ;
                    }
                    break;
            }
            return text;
        }

        JSON.decycle = function decycle(object, stringifyNodes) {
            'use strict';

// Make a deep copy of an object or array, assuring that there is at most
// one instance of each object or array in the resulting structure. The
// duplicate references (which might be forming cycles) are replaced with
// an object of the form
//      {$ref: PATH}
// where the PATH is a JSONPath string that locates the first occurance.
// So,
//      var a = [];
//      a[0] = a;
//      return JSON.stringify(JSON.decycle(a));
// produces the string '[{"$ref":"$"}]'.

// NOTE! If your object contains DOM Nodes you might want to use `stringifyNodes` option
// This will dump e.g. `div` with id="some-id" to string: `div#some-id`.
// You will avoid some problems, but you won't to be able to fully retro-cycle.
// To dump almost any variable use: `alert(JSON.stringify(JSON.decycle(variable, true)));`

// JSONPath is used to locate the unique object. $ indicates the top level of
// the object or array. [NUMBER] or [STRING] indicates a child member or
// property.

            var objects = [],   // Keep a reference to each unique object or array
                stringifyNodes = typeof(stringifyNodes) === 'undefined' ? false : stringifyNodes,
                paths = [];     // Keep the path to each unique object or array

            return (function derez(value, path) {

// The derez recurses through the object, producing the deep copy.

                var i,          // The loop counter
                    name,       // Property name
                    nu;         // The new object or array

// if we have a DOM Element/Node convert it to textual info.

                if (stringifyNodes && typeof value === 'object' && value !== null && 'nodeType' in value) {
                    return stringifyNode(value);
                }

// typeof null === 'object', so go on if this value is really an object but not
// one of the weird builtin objects.

                if (typeof value === 'object' && value !== null &&
                    !(value instanceof Boolean) &&
                    !(value instanceof Date)    &&
                    !(value instanceof Number)  &&
                    !(value instanceof RegExp)  &&
                    !(value instanceof String)) {

// If the value is an object or array, look to see if we have already
// encountered it. If so, return a $ref/path object. This is a hard way,
// linear search that will get slower as the number of unique objects grows.

                    for (i = 0; i < objects.length; i += 1) {
                        if (objects[i] === value) {
                            return {$ref: paths[i]};
                        }
                    }

// Otherwise, accumulate the unique value and its path.

                    objects.push(value);
                    paths.push(path);

// If it is an array, replicate the array.

                    if (Object.prototype.toString.apply(value) === '[object Array]') {
                        nu = [];
                        for (i = 0; i < value.length; i += 1) {
                            nu[i] = derez(value[i], path + '[' + i + ']');
                        }
                    } else {

// If it is an object, replicate the object.

                        nu = {};
                        for (name in value) {
                            if (Object.prototype.hasOwnProperty.call(value, name)) {
                                nu[name] = derez(value[name],
                                    path + '[' + JSON.stringify(name) + ']');
                            }
                        }
                    }
                    return nu;
                }
                return value;
            }(object, '$'));
        };
    })();
}


if (typeof JSON.retrocycle !== 'function') {
    JSON.retrocycle = function retrocycle($) {
        'use strict';

// Restore an object that was reduced by decycle. Members whose values are
// objects of the form
//      {$ref: PATH}
// are replaced with references to the value found by the PATH. This will
// restore cycles. The object will be mutated.

// The eval function is used to locate the values described by a PATH. The
// root object is kept in a $ variable. A regular expression is used to
// assure that the PATH is extremely well formed. The regexp contains nested
// * quantifiers. That has been known to have extremely bad performance
// problems on some browsers for very long strings. A PATH is expected to be
// reasonably short. A PATH is allowed to belong to a very restricted subset of
// Goessner's JSONPath.

// So,
//      var s = '[{"$ref":"$"}]';
//      return JSON.retrocycle(JSON.parse(s));
// produces an array containing a single element which is the array itself.

        var px =
            /^\$(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;

        (function rez(value) {

// The rez function walks recursively through the object looking for $ref
// properties. When it finds one that has a value that is a path, then it
// replaces the $ref object with a reference to the value that is found by
// the path.

            var i, item, name, path;

            if (value && typeof value === 'object') {
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    for (i = 0; i < value.length; i += 1) {
                        item = value[i];
                        if (item && typeof item === 'object') {
                            path = item.$ref;
                            if (typeof path === 'string' && px.test(path)) {
                                value[i] = eval(path);
                            } else {
                                rez(item);
                            }
                        }
                    }
                } else {
                    for (name in value) {
                        if (typeof value[name] === 'object') {
                            item = value[name];
                            if (item) {
                                path = item.$ref;
                                if (typeof path === 'string' && px.test(path)) {
                                    value[name] = eval(path);
                                } else {
                                    rez(item);
                                }
                            }
                        }
                    }
                }
            }
        }($));
        return $;
    };
}

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}