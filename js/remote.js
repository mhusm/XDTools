var capturing = false,
    events = [],
    mouseEvents = [
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
    keyboardEvents = [
        "keydown",  //all major browsers
        "keypress", //all major browsers
        "keyup"     //all major browsers
    ],
    uiEvents = [
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
    mutationEvents = [
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
    genericEvents = [
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
    ];

startRecording();

window.onload = function () {

    var eventIndex = 0,
        lastBreak = {"id": "", "time": 0},
        nextBreak = {"id": "", "time": Math.pow(2, 31)},
        breakpoints = [];

    window.addEventListener("message", function (ev) {
        var command = JSON.parse(ev.data);
        if (command.name === "startRecording") {
            events = [];
            capturing = true;
        }
        else if (command.name === "stopRecording") {
            capturing = false;
            var message = {
                "name": "sendEventSequence",
                "eventSequence": events,
                "deviceId": command.deviceId
            };
            ev.source.postMessage(JSON.stringify(message), command.parentDomain);
        }
        else if (command.name === "startReplaying") {
            var eventSequence = generateEvents(command.eventSequence, command.delay);
            eventIndex = 0;
            events = eventSequence;
            breakpoints = command.breakpoints;
            nextBreak = breakpoints.shift() || {"id": "", "time": Math.pow(2, 31)};
            eventIndex = replayEvents(eventSequence, command.delay, eventIndex, lastBreak.time, nextBreak.time);
            if (eventIndex > 0) {
                var message = {
                    "name": "breakpointReached",
                    "breakpoint": nextBreak
                };
                setTimeout(sendMessage, nextBreak.time - lastBreak.time, ev, JSON.stringify(message), command.parentDomain);
            }
        }
        else if (command.name === "continue") {
            if (eventIndex != -1) {
                lastBreak = nextBreak;
                nextBreak = breakpoints.shift() || {"id": "", "time": Math.pow(2, 31)};
                eventIndex = replayEvents(events, command.delay, eventIndex, lastBreak.time, nextBreak.time);
                if (eventIndex > 0) {
                    var message = {
                        "name": "breakpointReached",
                        "breakpoint": nextBreak
                    };
                    setTimeout(sendMessage, nextBreak.time - lastBreak.time, ev, JSON.stringify(message), command.parentDomain);
                }
            }
        }
    }, false);
};

function sendMessage(ev, message, parentDomain) {
    ev.source.postMessage(message, parentDomain);
}

function logEvent(ev, type) {
    if (capturing) {
        if (type === "MouseEvent") {
            events.push({"eventType": type, "time": ev.timeStamp,
                "hierarchy": determineHierarchy(ev.path), "type": ev.type, "bubbles": ev.bubbles,
                "cancelable": ev.cancelable, "detail": ev.detail, "screenX": ev.screenX, "screenY": ev.screenY,
                "clientX": ev.clientX, "clientY": ev.clientY, "ctrlKey": ev.ctrlKey, "altKey": ev.altKey,
                "shiftKey": ev.shiftKey, "metaKey": ev.metaKey, "button": ev.button, "relatedTarget": ev.relatedTarget
            });
        }
        else if (type === "KeyboardEvent") {
            events.push({"eventType": type, "time": ev.timeStamp,
                "hierarchy": determineHierarchy(ev.path), "type": ev.type, "bubbles": ev.bubbles,
                "cancelable": ev.cancelable, "keyCode": ev.keyCode, "which": ev.which, "location": ev.location,
                "modifiers": getModifiers(ev), "repeat": ev.repeat, "detail": ev.detail
            });
        }
        else if (type === "UIEvent") {
            events.push({"eventType": type, "time": ev.timeStamp,
                "hierarchy": determineHierarchy(ev.path), "type": ev.type, "bubbles": ev.bubbles,
                "cancelable": ev.cancelable, "detail": ev.detail
            });
        }
        else if (type === "MutationEvent") {
            events.push({"eventType": type, "time": ev.timeStamp,
                "hierarchy": determineHierarchy(ev.path), "type": ev.type, "bubbles": ev.bubbles,
                "cancelable": ev.cancelable, "relatedNode": ev.relatedNode, "prevValue": ev.prevValue,
                "newValue": ev.newValue, "attrName": ev.attrName, "attrChange": ev.attrChange
            });
        }
        else if (type === "WheelEvent") {
            events.push({"eventType": type, "time": ev.timeStamp,
                "hierarchy": determineHierarchy(ev.path), "type": ev.type, "bubbles": ev.bubbles,
                "cancelable": ev.cancelable, "detail": ev.detail, "screenX": ev.screenX, "screenY": ev.screenY,
                "clientX": ev.clientX, "clientY": ev.clientY, "button": ev.button, "relatedTarget": ev.relatedTarget,
                "deltaX": deltaX, "deltaY": ev.deltaY, "deltaZ": ev.deltaZ, "deltaMode": ev.deltaMode
            });
        }
        else if (type === "OverflowEvent") {
            events.push({"eventType": type, "time": ev.timeStamp,
                "hierarchy": determineHierarchy(ev.path), "orient": ev.orient,
                "horizontalOverflow": ev.horizontalOverflow, "verticalOverflow": ev.verticalOverflow});
        }
        else {
            events.push({"eventType": type, "time": ev.timeStamp,
                "hierarchy": determineHierarchy(ev.path), "type": ev.type, "bubbles": ev.bubbles,
                "cancelable": ev.cancelable
            });
        }
    }
}

function generateEvents(eventSequence, delay) {
    var result = [],
        initialTime = eventSequence[0].time,
        pause = 0;
    for (var i = 0, j = eventSequence.length; i < j; ++i) {
        eventSequence[i].time = eventSequence[i].time - initialTime + delay + pause;
        if (eventSequence[i].eventType === "MouseEvent") {
            result.push(new CustomMouseEvent(eventSequence[i]));
        }
        else if (eventSequence[i].eventType === "KeyboardEvent") {
            result.push(new CustomKeyboardEvent(eventSequence[i]));
        }
        else if (eventSequence[i].eventType === "UIEvent") {
            result.push(new CustomUIEvent(eventSequence[i]));
        }
        else if (eventSequence[i].eventType === "MutationEvent") {
            result.push(new CustomMutationEvent(eventSequence[i]));
        }
        else if (eventSequence[i].eventType === "WheelEvent") {
            result.push(new CustomWheelEvent(eventSequence[i]));
        }
        else if (eventSequence[i].eventType === "OverflowEvent") {
            result.push(new CustomOverflowEvent(eventSequence[i]));
        }
        else if (eventSequence[i].eventType === "BreakEvent") {
            pause = pause + 1000;
        }
        else {
            result.push(new CustomEvent2(eventSequence[i]));
        }
    }
    return result;
}

function getModifiers(ev) {
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
}

function determineHierarchy(path) {
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
}

function determineTarget(hierarchy) {
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
}

function startRecording() {
    for (var i = 0, j = mouseEvents.length; i < j; ++i) {
        document.addEventListener(mouseEvents[i], function (ev) {
            logEvent(ev, "MouseEvent");
        }, true);
    }
    for (var i = 0, j = keyboardEvents.length; i < j; ++i) {
        document.addEventListener(keyboardEvents[i], function (ev) {
            logEvent(ev, "KeyboardEvent");
        }, true);
    }
    for (var i = 0, j = uiEvents.length; i < j; ++i) {
        document.addEventListener(uiEvents[i], function (ev) {
            logEvent(ev, "UIEvent");
        }, true);
    }
    for (var i = 0, j = mutationEvents.length; i < j; ++i) {
        document.addEventListener(mutationEvents[i], function (ev) {
            logEvent(ev, "MutationEvent");
        }, true);
    }
    for (var i = 0, j = genericEvents.length; i < j; ++i) {
        document.addEventListener(genericEvents[i], function (ev) {
            logEvent(ev, "Event");
        }, true);
    }
    document.addEventListener("mousewheel", function (ev) {
        logEvent(ev, "WheelEvent");
    }, true);
    document.addEventListener("overflowchanged", function (ev) {
        logEvent(ev, "OverflowEvent");
    }, true);
}

function replayEvents(curEvents, delay, eventIndex, lastBreak, nextBreak) {
    var i = eventIndex,
        j = curEvents.length;
    for (i, j; i < j && curEvents[i].time < nextBreak; ++i) {
        setTimeout(dispatchEvent, curEvents[i].time - lastBreak, curEvents[i]);
    }
    if (i < j) {
        return i;
    }
    else {
        return -1;
    }
}

function dispatchEvent(event) {
    var target = determineTarget(event.hierarchy);
    event.dispatch(target);
}

function CustomEvent2(ev) {
    this.type = ev.eventType;
    this.time = ev.time;
    this.hierarchy = ev.hierarchy;
    this.event = document.createEvent("Event");
    this.event.initEvent(ev.type, ev.bubbles, ev.cancelable);
    this.dispatch = function (target) {
        target.dispatchEvent(this.event);
    }
}

function CustomMouseEvent(ev) {
    CustomEvent2.call(this, ev);
    this.event = document.createEvent("MouseEvent");
    this.event.initMouseEvent(ev.type, ev.bubbles, ev.cancelable, window, ev.detail, ev.screenX, ev.screenY,
        ev.clientX, ev.clientY, ev.ctrlKey, ev.altKey, ev.shiftKey, ev.metaKey, ev.button, ev.relatedTarget);
}

function CustomKeyboardEvent(ev, modifiers) {
    CustomEvent2.call(this, ev);
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
}

function CustomUIEvent(ev) {
    CustomEvent2.call(this, ev);
    this.event = document.createEvent("UIEvent");
    this.event.initUIEvent(ev.type, ev.bubbles, ev.cancelable, window, ev.detail);
}

function CustomWheelEvent(ev, modifiers) {
    CustomEvent2.call(this, ev);
    this.event = document.createEvent("WheelEvent");
    this.event.initEvent(ev.type, ev.bubbles, ev.cancelable, window, ev.detail, ev.screenX, ev.screenY,
        ev.clientX, ev.clientY, ev.button, ev.relatedTarget, modifiers, ev.deltaX, ev.deltaY, ev.deltaZ, ev.deltaMode);
}

function CustomMutationEvent(ev) {
    CustomEvent2.call(this, ev);
    this.event = document.createEvent("MutationEvent");
    this.event.initMutationEvent(ev.type, ev.bubbles, ev.cancelable, ev.relatedNode, ev.prevValue, ev.newValue,
        ev.attrName, ev.attrChange);
}

function CustomOverflowEvent(ev) {
    CustomEvent2.call(this, ev);
    this.event = document.createEvent("OverflowEvent");
    this.event.initOverflowEvent(ev.orient, ev.horizontalOverflow, ev.verticalOverflow);
}

