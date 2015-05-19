var origAddEventListener,
    origRemoveEventListener,
    capturing = false,
    events = {},
    savedSequences = {},
    sequenceNames = [],
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

$(document).ready(function () {
    //start/stop recording
    $(document).on("click", ".record", function (ev) {
        var recording = $(this).data("recording");
        if (recording) {
            $(this).data("recording", false);
            $(this).find(".glyphicon").removeClass("glyphicon-stop");
            $(this).find(".glyphicon").addClass("glyphicon-record");
            var deviceId = $(this).data("devid");
            stopRecording(deviceId);
            $("#device-" + deviceId + " .play").removeClass("disabled");
            $("#device-" + deviceId + " .save").removeClass("disabled");
        }
        else {
            $(this).data("recording", true);
            $(this).find(".glyphicon").removeClass("glyphicon-record");
            $(this).find(".glyphicon").addClass("glyphicon-stop");
            var deviceId = $(this).data("devid");
            startRecording(deviceId);
        }
    });

    //Replay recorded sequence
    $(document).on("click", ".play", function (ev) {
        $(this).addClass("disabled");
        var deviceId = $(this).data("devid");
        replayEvents(events[deviceId], deviceId);
    });

    //Save the recorded sequence with the specified name
    $(document).on("blur", ".recording-name", function (ev) {
        var deviceId = $(this).data("devid");
        var name = $(this).val();
        saveEventSequence(deviceId, name);
        $(".popover").popover("hide");
    });
    $(document).on("keyup", ".recording-name", function (ev) {
        if (ev.which === 13) {
            $(this).blur();
        }
    });

    //Display the selected event sequence for a device
    $(document).on("change", "#timeline select", function (ev) {
        var deviceId = $(this).data("devid");
        var sequenceName = $(this).val();
        $("#timeline-" + deviceId + " .content").html("");
        if (sequenceName === "none") {
            $("#timeline-" + deviceId + " .content").css("border", 0);
        }
        else {
            $("#timeline-" + deviceId + " .content").css("border", "2px dotted #337ab7");
            visualizeEventSequence(deviceId, sequenceName);
        }
    });

    $("#play-button").click(function (ev) {
        for (var i = 0; i < activeDevices.length; ++i) {
            var sequence = $("#timeline-" + activeDevices[i] + " select").val();
            if (sequence !== "none") {
                replayEvents(savedSequences[sequence], activeDevices[i]);
            }
        }
    });
});

function logEvent(ev) {
    events[ev.data.deviceId].push({
        "time": ev.originalEvent.timeStamp,
        "type": ev.data.eventType,
        "hierarchy": determineHierarchy(ev.originalEvent.path),
        "details": ev.originalEvent
    });
}

function determineHierarchy(path) {
    var curElement = path.shift();
    var hierarchy = [];
    while (curElement.nodeName !== "BODY") {
        var index = 0;
        var cur = curElement;
        while (cur) {
            index++;
            cur  = cur.previousElementSibling;
        }
        hierarchy.push(index - 1);
        curElement = path.shift();
    }
    return hierarchy;
}

function determineTarget(deviceId, hierarchy) {
    var iframeDoc = $("#device-" + deviceId + " iframe")[0].contentWindow.document;
    var curElement = iframeDoc.body;
    var curIndex = hierarchy.length - 1;
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

function visualizeEventSequence(deviceId, sequenceName) {
    var curEvents = savedSequences[sequenceName];
    for (var i = 0, j = curEvents.length; i < j; ++i) {
        if (curEvents[i].type === "MouseEvent") {
            $("#timeline-" + deviceId + " .content").append("<span class='label label-success'>" + curEvents[i].details.type + "</span><br/>");
        }
        else if (curEvents[i].type === "KeyboardEvent") {
            $("#timeline-" + deviceId + " .content").append("<span class='label label-info'>" + curEvents[i].details.type + "</span><br/>");
        }
        else if (curEvents[i].type === "UIEvent") {
            $("#timeline-" + deviceId + " .content").append("<span class='label label-primary'>" + curEvents[i].details.type + "</span><br/>");
        }
        else if (curEvents[i].type === "MutationEvent") {
            $("#timeline-" + deviceId + " .content").append("<span class='label label-warning'>" + curEvents[i].details.type + "</span><br/>");
        }
        else {
            $("#timeline-" + deviceId + " .content").append("<span class='label label-default'>" + curEvents[i].details.type + "</span><br/>");
        }
    }
}

function saveEventSequence(deviceId,  name) {
    $("#timeline select").append("<option value='" + name + "'>" + name + "</option>");
    sequenceNames.push(name);
    savedSequences[name] = events[deviceId].slice(0);
}

function startRecording(deviceId) {
    events[deviceId] = [];
    var iframeDoc = $("#device-" + deviceId + " iframe")[0].contentWindow.document;
    $(iframeDoc).bind(mouseEvents.join(" "), {eventType: "MouseEvent", deviceId: deviceId}, logEvent);
    $(iframeDoc).bind(keyboardEvents.join(" "), {eventType: "KeyboardEvent", deviceId: deviceId}, logEvent);
    $(iframeDoc).bind(uiEvents.join(" "), {eventType: "UIEvent", deviceId: deviceId}, logEvent);
    //$(iframeDoc).bind(mutationEvents.join(" "), {eventType: "MutationEvent", deviceId: deviceId}, logEvent);
    $(iframeDoc).bind("mousewheel", {eventType: "WheelEvent", deviceId: deviceId}, logEvent);
    $(iframeDoc).bind("overflowchanged", {eventType: "OverflowEvent", deviceId: deviceId}, logEvent);
    $(iframeDoc).bind(genericEvents.join(" "), {eventType: "Event", deviceId: deviceId}, logEvent);
}

function stopRecording(deviceId) {
    var iframeDoc = $("#device-" + deviceId + " iframe")[0].contentWindow.document;
    $(iframeDoc).unbind(mouseEvents.join(" "), logEvent);
    $(iframeDoc).unbind(keyboardEvents.join(" "), logEvent);
    $(iframeDoc).unbind(uiEvents.join(" "), logEvent);
    //$(iframeDoc).unbind(mutationEvents.join(" "), logEvent);
    $(iframeDoc).unbind("mousewheel", logEvent);
    $(iframeDoc).unbind("overflowchanged", logEvent);
    $(iframeDoc).unbind(genericEvents.join(" "), logEvent);
}

function replayEvents(curEvents, deviceId) {
    dispatchEvent(curEvents[0], deviceId);
    for (var i = 1, j = curEvents.length; i < j; ++i) {
        setTimeout(dispatchEvent, curEvents[i].time - curEvents[0].time, curEvents[i], deviceId);
    }
    setTimeout(function () {
        $("#device-" + deviceId + " .play").removeClass("disabled");
    }, curEvents[curEvents.length - 1].time - curEvents[0].time);
}

function dispatchEvent(event, deviceId) {
    if (event.type === "MouseEvent") {
        dispatchMouseEvent(event.details, determineTarget(deviceId, event.hierarchy));
    }
    else if (event.type === "KeyboardEvent") {
        dispatchKeyboardEvent(event.details, determineTarget(deviceId, event.hierarchy));
    }
    else if (event.type === "UIEvent") {
        dispatchUIEvent(event.details, determineTarget(deviceId, event.hierarchy));
    }
    else if (event.type === "MutationEvent") {
        dispatchMutationEvent(event.details, determineTarget(deviceId, event.hierarchy));
    }
    else if (event.type === "WheelEvent") {
        dispatchWheelEvent(event.details, determineTarget(deviceId, event.hierarchy));
    }
    else if (event.type === "OverflowEvent") {
        dispatchOverflowEvent(event.details, determineTarget(deviceId, event.hierarchy));
    }
    else {
        dispatchGenericEvent(event.details, determineTarget(deviceId, event.hierarchy));
    }
}

function dispatchMouseEvent(event, target) {
    var mouseEvent = document.createEvent("MouseEvent");
    mouseEvent.initMouseEvent(event.type, event.bubbles, event.cancelable, window, event.detail,
        event.screenX, event.screenY, event.clientX, event.clientY,
        event.ctrlKey, event.altKey, event.shiftKey, event.metaKey,
        event.button, event.relatedTarget);
    target.dispatchEvent(mouseEvent);
}

function dispatchKeyboardEvent(event, target) {
    var modifiers = [];
    if (event.altKey) {
        modifiers.push("Alt");
    }
    if (event.ctrlKey) {
        modifiers.push("Control");
    }
    if (event.metaKey) {
        modifiers.push("Meta");
    }
    if (event.shiftKey) {
        modifiers.push("Shift");
    }
    var keyboardEvent = document.createEvent("KeyboardEvent");
    keyboardEvent.initKeyboardEvent(event.type, event.bubbles, event.cancelable, window,
        event.keyCode, event.Location, modifiers.join(' '), event.repeat, '');
    event.target.dispatchEvent(keyboardEvent);
    if (event.type === "keypress") {
        dispatchTextEvent(event, target);
    }
}

//TextEvents are supported by IE, Safari, Chrome
function dispatchTextEvent(event, target) {
    var textEvent = document.createEvent("TextEvent");
    var char = String.fromCharCode(event.which);
    textEvent.initTextEvent("textInput", event.bubbles, event.cancelable, window, char, event.detail, "en-US");
    target.dispatchEvent(textEvent);
}

function dispatchUIEvent(event, target) {
    var uiEvent = document.createEvent("UIEvent");
    uiEvent.initUIEvent(event.type, event.bubbles, event.cancelable, window, event.detail);
    target.dispatchEvent(uiEvent);
}

function dispatchMutationEvent(event, target) {
    var mutationEvent = document.createEvent("MutationEvent");
    mutationEvent.initMutationEvent(event.type, event.bubbles, event.cancelable, event.relatedNode, event.prevValue, event.newValue, event.attrName, event.attrChange);
    target.dispatchEvent(mutationEvent);
}

function dispatchWheelEvent(event, target) {
    var modifiers = [];
    if (event.altKey) {
        modifiers.push("Alt");
    }
    if (event.ctrlKey) {
        modifiers.push("Control");
    }
    if (event.metaKey) {
        modifiers.push("Meta");
    }
    if (event.shiftKey) {
        modifiers.push("Shift");
    }
    var wheelEvent = document.createEvent("WheelEvent");
    wheelEvent.initEvent(event.type, event.bubbles, event.cancelable, window,
        event.detail, event.screenX, event.screenY, event.clientX, event.clientY,
        event.button, event.relatedTarget, modifiers, event.deltaX, event.deltaY,
        event.deltaZ, event.deltaMode
    );
    target.dispatchEvent(wheelEvent);
}

function dispatchOverflowEvent(event, target) {
    var overflowEvent = document.createEvent("OverflowEvent");
    overflowEvent.initOverflowEvent(event.orient, event.horizontalOverflow, event.verticalOverflow);
    target.dispatchEvent(overflowEvent);
}

function dispatchGenericEvent(event, target) {
    var ev = document.createEvent("event");
    ev.initEvent(event.type, event.bubbles, event.cancelable);
    target.dispatchEvent(ev);
}