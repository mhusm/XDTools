var lastMouseUp = {},
    events = {},
    savedSequences = {},
    sequenceNames = [],
    originalAddEventListener,
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
        var index = activeDevices.map(function(e) { return e.id; }).indexOf(deviceId);
        replayEvents(events[deviceId], deviceId, activeDevices[index].timelinePosition * 10);
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

    socket.on("replay", function (sequence) {
        replayRemoteSequence(JSON.parse(sequence));
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
            events[deviceId] = savedSequences[sequenceName].slice(0);
            visualizeEventSequence(deviceId);
        }
    });

    $("#play-button").click(function (ev) {
        //determine delays
        for (var i = 0; i < activeDevices.length; ++i) {
            if (sequence !== "none") {
                replayEvents(events[activeDevices[i].id], activeDevices[i].id, activeDevices[i].timelinePosition * 10);
            }
        }
        for (var i = 0; i < remoteDevices.length; ++i) {
            var sequence = $("#timeline-" + remoteDevices[i] + " select").val();
            if (sequence !== "none") {
                socket.emit("replayRemote", remoteDevices[i], JSON.stringify(savedSequences[sequence]));
            }
        }
    });
});

function logEvent(ev) {
    if (ev.data.eventType === "MouseEvent") {
        events[ev.data.deviceId].push(new CustomMouseEvent(ev));
    }
    else if (ev.data.eventType === "KeyboardEvent") {
        events[ev.data.deviceId].push(new CustomKeyboardEvent(ev, getModifiers(ev)));
    }
    else if (ev.data.eventType === "UIEvent") {
        events[ev.data.deviceId].push(new CustomUIEvent(ev));
    }
    else if (ev.data.eventType === "MutationEvent") {
        events[ev.data.deviceId].push(new CustomMutationEvent(ev));
    }
    else if (ev.data.eventType === "WheelEvent") {
        events[ev.data.deviceId].push(new CustomWheelEvent(ev, getModifiers(ev)));
    }
    else if (ev.data.eventType === "OverflowEvent") {
        events[ev.data.deviceId].push(new CustomOverflowEvent(ev));
    }
    else {
        events[ev.data.deviceId].push(new CustomEvent(ev));
    }
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

function dropBreak(ev) {
    var br = ev.dataTransfer.getData("break");
    if (br) {
        $(ev.target).css("height", parseInt($(ev.target).css("height")) + 100 + "px");
        $(ev.target).css("line-height", parseInt($(ev.target).css("line-height")) + 100 + "px");
        if ($(ev.target).text() === "") {
            $(ev.target).text(parseInt($(ev.target).css("height")) * 10 + " ms");
        }
        else {
            $(ev.target).text(parseInt($(ev.target).text()) + 1000 + " ms");
        }
        events[ev.target.dataset.devid].splice(parseInt(ev.target.dataset.eventIndex) + 1, 0, {"type": "BreakEvent"});
    }
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

function determineTarget(iframeDoc, hierarchy) {
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

function dragBreak(ev) {
    ev.dataTransfer.setData("break", true);
}

function visualizeEventSequence(deviceId) {
    $("#timeline-" + deviceId + " .content").css("border", "2px dotted #337ab7");
    var curEvents = events[deviceId];
    var groups = groupEvents(curEvents);
    var lastTime = groups[0][groups[0].length - 1].time;
    var delay = 0;
    var prevTime = groups[0][0].time;
    for (var i = 0, j = groups.length; i < j; ++i) {
        if (groups[i][0].event.type === "BreakEvent") {
            delay = delay + 1000;
        }
        else {
            var pause = Math.max(0, groups[i][0].event.time - lastTime) + delay;
            var height = Math.max(0, groups[i][0].event.time - prevTime - 200) / 10 + delay / 10;
            lastTime = groups[i][groups[i].length - 1].event.time;
            prevTime = groups[i][0].event.time;
            var html = "<span class='label label-primary'>";
            var types = [];
            for (var k = 0; k < groups[i].length; ++k) {
                types.push(groups[i][k].event.event.type);
            }
            html = html + types.join(", ");
            html = html + "</span>";
            var divHtml = "";
            if (height >= 14) {
                divHtml = "<div data-devid='" + deviceId + "' data-event-index='" + groups[Math.max(i - 1, 0)][groups[Math.max(i - 1, 0)].length - 1].index + "' ondragover='allowDrop(event)' ondrop='dropBreak(event)' style='height:" + height + "px; line-height:" + height + "px' class='break'>" + pause + " ms</div>";
            }
            else {
                divHtml = "<div data-devid='" + deviceId + "' data-event-index='" + groups[Math.max(i - 1, 0)][groups[Math.max(i - 1, 0)].length - 1].index + "' ondragover='allowDrop(event)' ondrop='dropBreak(event)' style='height:" + height + "px; line-height:" + height + "px' class='break'></div>";
            }
            $(divHtml).appendTo("#timeline-" + deviceId + " .content")
            $(html)
                .appendTo("#timeline-" + deviceId + " .content")
            delay = 0;
        }
    }
}

//Group events that are less than 200ms apart
function groupEvents(curEvents) {
    var groups = [];
    var curEvent = curEvents[0];
    var curGroup = [{"event": curEvent, "index": 0}];
    for (var i = 1, j = curEvents.length; i < j; ++i) {
        if (curEvents[i].type === "BreakEvent") {
            if (curGroup.length > 0) {
                groups.push(curGroup);
            }
            curGroup = [];
            groups.push([{"event": curEvents[i], "index": i}]);
            curEvent = curEvents[i + 1];
        }
        else {
            if (curEvents[i].time - curEvent.time <= 200) {
                curGroup.push({"event": curEvents[i], "index": i});
            }
            else {
                groups.push(curGroup);
                curEvent = curEvents[i];
                curGroup = [{"event": curEvent, "index": i}];
            }
        }
    }
    if (curGroup.length > 0) {
        groups.push(curGroup);
    }
    return groups;
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
    $("#timeline-" + deviceId + " .content").html("");
    visualizeEventSequence(deviceId);
}

function replayEvents(curEvents, deviceId, delay) {
    var iframeDoc = $("#device-" + deviceId + " iframe")[0].contentWindow.document;
    setTimeout(dispatchEvent, delay, curEvents[0], iframeDoc);
    var additionalDelay = 0;
    for (var i = 1, j = curEvents.length; i < j; ++i) {
        if (curEvents[i].type === "BreakEvent") {
            additionalDelay = additionalDelay + 1000;
        }
        else {
            setTimeout(dispatchEvent, curEvents[i].time - curEvents[0].time + delay + additionalDelay, curEvents[i], iframeDoc);
        }
    }
    setTimeout(function () {
        $("#device-" + deviceId + " .play").removeClass("disabled");
    }, curEvents[curEvents.length - 1].time - curEvents[0].time + delay);
}

function replayRemoteSequence(curEvents) {
    var iframeDoc = $("#single-device-mode iframe")[0].contentWindow.document;
    dispatchEvent(curEvents[0], iframeDoc);
    for (var i = 1, j = curEvents.length; i < j; ++i) {
        setTimeout(dispatchEvent, curEvents[i].time - curEvents[0].time, curEvents[i], iframeDoc);
    }
    setTimeout(function () {
        $("#device-" + deviceId + " .play").removeClass("disabled");
    }, curEvents[curEvents.length - 1].time - curEvents[0].time);
}

function dispatchEvent(event, iframeDoc) {
    var target = determineTarget(iframeDoc, event.hierarchy);
    event.dispatch(target);
}

function CustomEvent(ev) {
    this.type = ev.data.eventType;
    this.time = ev.originalEvent.timeStamp;
    this.hierarchy = determineHierarchy(ev.originalEvent.path);
    this.event = document.createEvent("Event");
    this.event.initEvent(ev.type, ev.bubbles, ev.cancelable);
    this.dispatch = function (target) {
        target.dispatchEvent(this.event);
    }
}

function CustomMouseEvent(ev) {
    CustomEvent.call(this, ev);
    this.event = document.createEvent("MouseEvent");
    this.event.initMouseEvent(ev.type, ev.bubbles, ev.cancelable, window, ev.detail, ev.screenX, ev.screenY,
        ev.clientX, ev.clientY, ev.ctrlKey, ev.altKey, ev.shiftKey, ev.metaKey, ev.button, ev.relatedTarget);
}

function CustomKeyboardEvent(ev, modifiers) {
    CustomEvent.call(this, ev);
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
    CustomEvent.call(this, ev);
    this.event = document.createEvent("UIEvent");
    this.event.initUIEvent(ev.type, ev.bubbles, ev.cancelable, window, ev.detail);
}

function CustomWheelEvent(ev, modifiers) {
    CustomEvent.call(this, ev);
    this.event = document.createEvent("WheelEvent");
    this.event.initEvent(ev.type, ev.bubbles, ev.cancelable, window, ev.detail, ev.screenX, ev.screenY,
        ev.clientX, ev.clientY, ev.button, ev.relatedTarget, modifiers, ev.deltaX, ev.deltaY, ev.deltaZ, ev.deltaMode);
}

function CustomMutationEvent(ev) {
    CustomEvent.call(this, ev);
    this.event = document.createEvent("MutationEvent");
    this.event.initMutationEvent(ev.type, ev.bubbles, ev.cancelable, ev.relatedNode, ev.prevValue, ev.newValue,
        ev.attrName, ev.attrChange);
}

function CustomOverflowEvent(ev) {
    CustomEvent.call(this, ev);
    this.event = document.createEvent("OverflowEvent");
    this.event.initOverflowEvent(ev.orient, ev.horizontalOverflow, ev.verticalOverflow);
}

