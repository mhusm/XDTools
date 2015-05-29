var events = {},
    savedSequences = {},
    sequenceNames = [],
    breakpoints = [],
    breakpointIndex = 0;

$(document).ready(function () {

    window.addEventListener("message", function (ev) {
        var command = JSON.parse(ev.data);
        if (command.name === "sendEventSequence") {
            events[command.deviceId] = command.eventSequence;
            $("#timeline-" + command.deviceId + " .content").html("");
            visualizeEventSequence(command.deviceId);
        }
        else if (command.name === "breakpointReached") {
            $("#continue-button").removeClass("disabled");
            $("#continue-button").css({
                "border": "3px solid rgb(145, 215, 105)"
            });
            $("#" + command.breakpoint.id).css("opacity", 1);
        }
    }, false);

    $("#breakpoint-container").click(function (ev) {
        var top = ev.offsetY - 7.5;
        breakpoints.push({"time": top * 10, "id": "bp-" + breakpointIndex});
        $("<div class='breakpoint' id='bp-" + breakpointIndex + "' data-value='" + top * 10 + "' draggable='true' ondragstart='dragBreakpoint(event)'></div>").appendTo($("#breakpoint-container")).css("top", top + "px");
        breakpointIndex++;
    });

    $("#continue-button").click(function (ev) {
        var command = {
            "name": "continue",
            "parentDomain": "http://" + window.location.host
        };
        for (var i = 0, j = activeDevices.length; i < j; ++i) {
            $("#device-" + activeDevices[i].id + " iframe")[0].contentWindow.postMessage(JSON.stringify(command), activeDevices[i].url);
        }
        $("#continue-button").addClass("disabled");
        $("#continue-button").css({
            "border": "1px solid #ccc"
        });
        $(".breakpoint").css("opacity", 0.5);
        socket.emit("continue");
    });

    //start/stop recording
    $(document).on("click", ".record", function (ev) {
        var recording = $(this).data("recording");
        if (recording) {
            $(this).data("recording", false);
            $(this).find(".glyphicon").removeClass("glyphicon-stop").addClass("glyphicon-record");
            var deviceId = $(this).data("devid"),
                index = activeDevices.map(function(e) { return e.id; }).indexOf(deviceId),
                command ={
                    "name": "stopRecording",
                    "deviceId": deviceId,
                    "parentDomain": "http://" + window.location.host
                };
            $("#device-" + deviceId + " iframe")[0].contentWindow.postMessage(JSON.stringify(command), activeDevices[index].url);
            $("#device-" + deviceId + " .play").removeClass("disabled");
            $("#device-" + deviceId + " .save").removeClass("disabled");
        }
        else {
            $(this).data("recording", true);
            $(this).find(".glyphicon").removeClass("glyphicon-record").addClass("glyphicon-stop");
            var deviceId = $(this).data("devid"),
                index = activeDevices.map(function(e) { return e.id; }).indexOf(deviceId),
                command = {
                    "name": "startRecording",
                    "deviceId": deviceId,
                    "parentDomain": "http://" + window.location.host
                }
            $("#device-" + deviceId + " iframe")[0].contentWindow.postMessage(JSON.stringify(command), activeDevices[index].url);
        }
    });

    //Replay recorded sequence
    $(document).on("click", ".play", function (ev) {
        var deviceId = $(this).data("devid"),
            index = activeDevices.map(function(e) { return e.id; }).indexOf(deviceId),
            command = {
                "name": "startReplaying",
                "eventSequence": events[deviceId],
                "delay": activeDevices[index].timelinePosition * 10,
                "breakpoints": breakpoints,
                "parentDomain": "http://" + window.location.host
            }
        $("#device-" + deviceId + " iframe")[0].contentWindow.postMessage(JSON.stringify(command), activeDevices[index].url);
    });

    //Save the recorded sequence with the specified name
    $(document).on("blur", ".recording-name", function (ev) {
        var deviceId = $(this).data("devid"),
            name = $(this).val();
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
        var deviceId = $(this).data("devid"),
            sequenceName = $(this).val();
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
        for (var i = 0, j = activeDevices.length; i < j; ++i) {
            if (events[activeDevices[i].id] && events[activeDevices[i].id].length > 0) {
                var command = {
                    "name": "startReplaying",
                    "eventSequence": events[activeDevices[i].id],
                    "delay": activeDevices[i].timelinePosition * 10,
                    "breakpoints": breakpoints,
                    "parentDomain": "http://" + window.location.host
                }
                $("#device-" + activeDevices[i].id + " iframe")[0].contentWindow.postMessage(JSON.stringify(command), activeDevices[i].url);
            }
        }
        for (var i = 0, j = remoteDevices.length; i < j; ++i) {
            if (events[remoteDevices[i]] && events[remoteDevices[i].length > 0]) {
                socket.emit("replayRemote", remoteDevices[i], JSON.stringify(events[remoteDevices[i]]), parseInt($("#timeline-" + remoteDevices[i] + " .content").css("top")) * 10, JSON.stringify(breakpoints));
            }
        }
    });
});

function dragBreakpoint(ev) {
    $("#continue-button span").removeClass("glyphicon-play").addClass("glyphicon-trash");
    $("#continue-button").css({
       "border": "3px solid #a94442"
    });
    $("#continue-button").removeClass("disabled");
    ev.dataTransfer.setData("target", ev.target.id);
}

function dropBreakpoint(ev) {
    var targetID = ev.dataTransfer.getData("target"),
        index = breakpoints.map(function (e) { return e.id }).indexOf(targetID);
    breakpoints.splice(index, 1);
    $("#" + targetID).remove();
    $("#continue-button").addClass("disabled");
    $("#continue-button").css({
        "border": "1px solid #ccc"
    });
    $("#continue-button span").removeClass("glyphicon-trash").addClass("glyphicon-play");
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
        events[ev.target.dataset.devid].splice(parseInt(ev.target.dataset.eventIndex) + 1, 0, {"eventType": "BreakEvent"});
    }
}

function dragBreak(ev) {
    ev.dataTransfer.setData("break", true);
}

function visualizeEventSequence(deviceId) {
    $("#timeline-" + deviceId + " .content").css("border", "2px dotted #337ab7");
    var curEvents = events[deviceId],
        groups = groupEvents(curEvents),
        lastTime = groups[0][groups[0].length - 1].event.time,
        delay = 0,
        prevTime = groups[0][0].event.time;
    for (var i = 0, j = groups.length; i < j; ++i) {
        if (groups[i][0].event.type === "BreakEvent") {
            delay = delay + 1000;
        }
        else {
            var pause = Math.max(0, groups[i][0].event.time - lastTime) + delay,
                height = Math.max(0, groups[i][0].event.time - prevTime - 200) / 10 + delay / 10,
                html = "<span class='label label-primary'>",
                types = [],
                divHtml = "";
            lastTime = groups[i][groups[i].length - 1].event.time;
            prevTime = groups[i][0].event.time;
            for (var k = 0, l = groups[i].length; k < l; ++k) {
                types.push(groups[i][k].event.type);
            }
            html += types.join(", ") + "</span>";
            if (height >= 14) {
                divHtml = "<div data-devid='" + deviceId + "' data-event-index='" + groups[Math.max(i - 1, 0)][groups[Math.max(i - 1, 0)].length - 1].index + "' ondragover='allowDrop(event)' ondrop='dropBreak(event)' style='height:" + height + "px; line-height:" + height + "px' class='break'>" + pause + " ms</div>";
            }
            else {
                divHtml = "<div data-devid='" + deviceId + "' data-event-index='" + groups[Math.max(i - 1, 0)][groups[Math.max(i - 1, 0)].length - 1].index + "' ondragover='allowDrop(event)' ondrop='dropBreak(event)' style='height:" + height + "px; line-height:" + height + "px' class='break'></div>";
            }
            $(divHtml).appendTo("#timeline-" + deviceId + " .content");
            $(html).appendTo("#timeline-" + deviceId + " .content");
            delay = 0;
        }
    }
}

//Group events that are less than 200ms apart
function groupEvents(curEvents) {
    var groups = [],
        curEvent = curEvents[0],
        curGroup = [{"event": curEvent, "index": 0}];
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
