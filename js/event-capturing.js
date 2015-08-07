var events = {},
    breakpoints = [],
    breakpointIndex = 0;

$(document).ready(function () {

    $("#breakpoint-container").click(function (ev) {
        var top = ev.offsetY - 7.5;
        breakpoints.push({"time": top * 10, "id": "bp-" + breakpointIndex});
        $(HTML.Breakpoint(breakpointIndex, top)).appendTo($("#breakpoint-container")).css("top", top + "px").on("dragstart", dragBreakpoint);
        breakpointIndex++;
    });

    $("#continue-button").click(function () {
        var command = new Command("continue", 0);
        for (var i = 0, j = activeDevices.length; i < j; ++i) {
            activeDevices[i].sendCommand(command);
        }
        $(this).addClass("disabled").css({
            "border": "1px solid #ccc"
        });
        $(".breakpoint").css("opacity", 0.5);
    }).on("dragover", allowDrop).on("drop", dropBreakpoint);

    //start/stop recording
    $(document).on("click", ".record", function () {
        var recording = $(this).data("recording"),
            deviceID = $(this).closest(".device-timeline").data("device-id"),
            index = getDeviceIndex(deviceID),
            command = new Command("startRecording", deviceID);
        if (recording) {
            $(this).data("recording", false).find(".glyphicon").removeClass("glyphicon-stop").addClass("glyphicon-record");
            command.name = "stopRecording";
        }
        else {
            $(this).data("recording", true).find(".glyphicon").removeClass("glyphicon-record").addClass("glyphicon-stop");
        }
        activeDevices[index].sendCommand(command);
    });

    //Display the selected event sequence for a device
    $(document).on("change", "#timeline select", function () {
        var deviceID = $(this).closest(".device-timeline").data("device-id"),
            sequenceName = $(this).val();
        if (sequenceName === "none") {
            $("#timeline-" + deviceID + " .content").remove();
            events[deviceID] = [];
        }
        else {
            if (!events[deviceID]) {
                events[deviceID] = [];
            }
            var index = savedSequences.map(function (e) { return e.name; }).indexOf(sequenceName);
            events[deviceID].push({"name": sequenceName, "sequence": savedSequences[index].sequence.slice(0), "position": -1});
            visualizeEventSequences(deviceID);
            $(this).val("none");
        }
        $(this).blur();
    });

    $(document).on("focus", "#timeline select", function () {
        this.selectedIndex = -1;
    });

    $("#break-button").on("dragstart", dragBreak);

    $(document).on("dragover", ".event-container", allowDrop).on("drop", ".event-container", dropTimeline);

    $(document).on("dragover", ".break", allowDrop).on("drop", ".break", dropBreak);

    $(document).on("dragstart", ".content", dragTimeline);

    $("#play-button").click(function () {
        var i, j, k, eventSequences = [],
            offset0s = $("#timeline-container").find(".time").offset().top;
        for (i = 0, j = activeDevices.length; i < j; ++i) {
            if (events[activeDevices[i].id] && events[activeDevices[i].id].length > 0) {
                eventSequences = [];
                for (k = 0; k < events[activeDevices[i].id].length; ++k) {
                    var $timeline = $("#timeline-" + activeDevices[i].id),
                        curPos = $timeline.find(".content[data-sequence-id='" + k + "'] .label-primary").offset().top - offset0s;
                    eventSequences.push({"startTime": curPos * 10, "sequence": events[activeDevices[i].id][k].sequence});
                }
                var command = new ReplayCommand("startReplaying", activeDevices[i].id, eventSequences, breakpoints);
                activeDevices[i].sendCommand(command);
            }
        }
    });

    //Replay recorded sequence
    $(document).on("click", ".play", function () {
        var deviceID = $(this).closest(".device-timeline").data("device-id"),
            index = getDeviceIndex(deviceID),
            offset0s = $("#timeline-container").find(".time").offset().top;
        var eventSequences = [];
        for (var k = 0; k < events[deviceID].length; ++k) {
            var curPos = $("#timeline-" + deviceID + " .content[data-sequence-id='" + k + "']  .label-primary").offset().top - offset0s;
            eventSequences.push({"startTime": curPos * 10, "sequence": events[deviceID][k].sequence});
        }
        var command = new ReplayCommand("startReplaying", deviceID, eventSequences, breakpoints);
        activeDevices[index].sendCommand(command);
    });

    $(document).on("mousedown", ".content", function (ev) {
        if ((ev.offsetY > $(this).outerHeight() - 10 || ev.offsetY < 10 || ev.offsetX < 10 || ev.offsetX > $(this).outerWidth() - 10 || (ev.offsetY < 39 && ev.offsetX < $(this).outerWidth() - 80)) && ev.target.nodeName === "SECTION") {
            $(".content").attr('draggable', 'true');
        }
    });

    $(document).on("mouseover", ".break", function (ev) {
        if (ev.target.classList[0] === "break") {
            $(this).find(".cut-line").css("display", "block");
        }
    });
    $(document).on("mouseout", ".break", function () {
        $(this).find(".cut-line").css("display", "none");
    });
    $(document).on("mousemove", ".break", function (ev) {
        $(this).find(".cut-line").css("top", ev.originalEvent.offsetY + "px");
    });
    $(document).on("click", ".break", function (ev) {
        var deviceID = $(this).closest(".device-timeline").data("device-id"),
            position = ev.pageY;
        cutTimeline(deviceID, position);
    });

    $(document).on("click", ".seq-remove-button", function () {
        var deviceID = $(this).closest(".device-timeline").data("device-id"),
            sequenceId = parseInt($(this).parent()[0].dataset.sequenceId);
        events[deviceID].splice(sequenceId, 1);
        visualizeEventSequences(deviceID);
    });
    $(document).on("blur", ".seq-name", function () {
        var deviceID = $(this).data("device-id"),
            sequenceId = parseInt(this.dataset.sequenceId),
            name = $(this).val();
        savedSequences.push({"name": name, "sequence": events[deviceID][sequenceId].sequence.slice(0)});
        events[deviceID][sequenceId].name = name;
        $("#settings-sequences").append(HTML.SequenceRow(name));
        $("#no-sequences").addClass("hidden");
        localStorage.setItem("saved-sequences", JSON.stringify(savedSequences));
        $("#timeline").find("select").append("<option value='" + name + "'>" + name + "</option>");
        sequenceNames.push(name);
        localStorage.setItem("sequence-names", JSON.stringify(sequenceNames));
        $("*").popover("hide");
        visualizeEventSequences(deviceID);
    });
    $(document).on("keypress", ".seq-name", function (ev) {
        if (ev.which === 13) {
            $(this).blur();
        }
    });
});

function pause(command) {
    $("#continue-button").removeClass("disabled").css({
        "border": "3px solid rgb(145, 215, 105)"
    });
    $("#" + command.breakpoint.id).css("opacity", 1);
}

function adjustTiming(eventSequence) {
    var initialTime = eventSequence[0].time;
    for (var i = 0, j = eventSequence.length; i < j; ++i) {
        eventSequence[i].time = eventSequence[i].time - initialTime;
    }
    return eventSequence;
}

function cutTimeline(deviceID, time) {
    var sequence1 = [],
        sequence2 = [],
        i  = 0, j, k,
        $timeline = $("#timeline-" + deviceID),
        top = $timeline.find(".content[data-sequence-id='" + i + "'] .label-primary").offset().top;
    while (i < events[deviceID].length && top < time) {
        ++i;
        if (i < events[deviceID].length) {
            top = $timeline.find(".content[data-sequence-id='" + i + "'] .label-primary").offset().top;
        }
    }
    --i;
    top = $timeline.find(".content[data-sequence-id='" + i + "'] .label-primary").offset().top;
    time = (time - top) * 10;
    for (k = 0, j = events[deviceID][i].sequence.length; k < j; ++k) {
        if (events[deviceID][i].sequence[k].time - events[deviceID][0].sequence[0].time <= time) {
            sequence1.push(JSON.parse(JSON.stringify(events[deviceID][i].sequence[k])));
        }
        else {
            sequence2.push(JSON.parse(JSON.stringify(events[deviceID][i].sequence[k])));
        }
    }
    var oldPos = events[deviceID][i].position;
    events[deviceID].splice(i, 1);
    events[deviceID].splice(i, 0, {"name": "unnamed sequence", "sequence": adjustTiming(sequence2), "position": -1});
    events[deviceID].splice(i, 0, {"name": "unnamed sequence", "sequence": sequence1, "position": oldPos});
    visualizeEventSequences(deviceID);
}

function dragBreakpoint(ev) {
    $("#continue-button").css("border", "3px solid #a94442")
        .removeClass("disabled").find("span").removeClass("glyphicon-play").addClass("glyphicon-trash");
    ev.originalEvent.dataTransfer.setData("target", ev.target.id);
}

function dropBreakpoint(ev) {
    var targetID = ev.originalEvent.dataTransfer.getData("target"),
        index = breakpoints.map(function (e) { return e.id }).indexOf(targetID);
    breakpoints.splice(index, 1);
    $("#" + targetID).remove();
    $("#continue-button").addClass("disabled").css("border", "1px solid #ccc")
        .find("span").removeClass("glyphicon-trash").addClass("glyphicon-play");
    $(".content").attr('draggable', 'false');
}

function dropBreak(ev) {
    var br = ev.originalEvent.dataTransfer.getData("break");
    if (br) {
        var deviceID = $(ev.target).closest(".device-timeline").data("device-id"),
            sequenceId = parseInt(ev.target.dataset.sequenceId);
        for (var i = parseInt(ev.target.dataset.eventIndex) + 1; i < events[deviceID][sequenceId].sequence.length; ++i) {
            events[deviceID][sequenceId].sequence[i].time += 1000;
        }
        visualizeEventSequences(deviceID);
    }
}

function dragBreak(ev) {
    ev.originalEvent.dataTransfer.setData("break", true);
}

function visualizeEventSequences(deviceID) {
    var $timeline = $("#timeline-" + deviceID),
        evs = events[deviceID];
    $timeline.find(".content").remove();
    $timeline.find(".play").removeClass("disabled");
    for (var z = 0; z < evs.length; ++z) {
        var curEvents = evs[z].sequence,
            groups = groupEvents(curEvents),
            lastTime = groups[0][groups[0].length - 1].event.time,
            prevTime = groups[0][0].event.time,
            html = "<section class='content' data-sequence-id='" + z + "' data-device-id='" + deviceID + "'>" +
                evs[z].name + HTML.SequenceButtons();
        for (var i = 0, j = groups.length; i < j; ++i) {
            var pause = Math.max(0, groups[i][0].event.time - lastTime),
                height = Math.max(0, groups[i][0].event.time - prevTime - 200) / 10,
                types = [];
            if (height >= 14) {
                html = html + HTML.Break(deviceID, groups[Math.max(i - 1, 0)][groups[Math.max(i - 1, 0)].length - 1].index, z, height, pause + " ms");
            }
            else {
                html = html + HTML.Break(deviceID, groups[Math.max(i - 1, 0)][groups[Math.max(i - 1, 0)].length - 1].index, z, height, "");
            }
            html = html + "<span class='label label-primary'>";
            lastTime = groups[i][groups[i].length - 1].event.time;
            prevTime = groups[i][0].event.time;
            for (var k = 0, l = groups[i].length; k < l; ++k) {
                types.push(groups[i][k].event.type);
            }
            var joined = types[0], count = 1;
            for (var k = 1; k < types.length; ++k) {
                if (types[k] === types[k - 1]) {
                    count++;
                }
                else {
                    joined = count > 1 ? joined + " x " + count + ", " + types[k] : joined + ", " + types[k];
                    count = 1;
                }
            }
            joined = count > 1 ? joined + " x " + count : joined;
            html += joined + "</span>";
        }
        html = html + "</section>";
        $(html).appendTo("#timeline-" + deviceID + " .event-container");
        var pos = 0, margin = 0;
        if (z > 0) {
            pos =  $timeline.find(".content[data-sequence-id='" + (z - 1) + "']").height() + evs[z - 1].position;
            margin = -$timeline.find(".content[data-sequence-id='" + (z - 1) + "']").height();
        }
        if (evs[z].position === -1) {
            evs[z].position = pos;
        }
        evs[z].position = Math.max(evs[z].position, pos);
        $timeline.find(".content[data-sequence-id='" + z + "']").css({
            "top": evs[z].position + "px",
            "margin-top": margin + "px"
        });
        $timeline.find(".content[data-sequence-id='" + z + "'] .seq-save-button").popover({
            placement: 'left',
            container: 'body',
            html: true,
            content: HTML.SequenceInput(deviceID, z)
        });
    }
}

//Group events that are less than 200ms apart
function groupEvents(curEvents) {
    var groups = [],
        curEvent = curEvents[0],
        curGroup = [{"event": curEvent, "index": 0}];
    for (var i = 1, j = curEvents.length; i < j; ++i) {
        if (curEvents[i].time - curEvent.time <= 200) {
            curGroup.push({"event": curEvents[i], "index": i});
        }
        else {
            groups.push(curGroup);
            curEvent = curEvents[i];
            curGroup = [{"event": curEvent, "index": i}];
        }
    }
    if (curGroup.length > 0) {
        groups.push(curGroup);
    }
    return groups;
}

function dragTimeline(ev) {
    ev.originalEvent.dataTransfer.setData("yOffset", parseInt(window.getComputedStyle(ev.originalEvent.target, null).getPropertyValue("top", 10)) - ev.originalEvent.clientY);
    ev.originalEvent.dataTransfer.setData("device-id", $(ev.currentTarget).closest(".device-timeline").data("device-id"));
    ev.originalEvent.dataTransfer.setData("sequence-id", ev.currentTarget.dataset.sequenceId);
}

function dropTimeline(ev) {
    ev.preventDefault();
    if (!ev.originalEvent.dataTransfer.getData("break")) {
        var deviceID = ev.originalEvent.dataTransfer.getData("device-id"),
            sequenceId = parseInt(ev.originalEvent.dataTransfer.getData("sequence-id")),
            y = Math.max(0, ev.originalEvent.clientY + parseInt(ev.originalEvent.dataTransfer.getData("yOffset"))),
            otherDeviceID = $(ev.currentTarget).closest(".device-timeline").data("device-id");
        events[deviceID][sequenceId].position = y;
        if (otherDeviceID !== deviceID) {
            if (!events[otherDeviceID]) {
                events[otherDeviceID] = [];
            }
            var newIndex = events[otherDeviceID].length;
            events[otherDeviceID].push(events[deviceID][sequenceId]);
            events[deviceID].splice(sequenceId, 1);
            visualizeEventSequences(deviceID);
            visualizeEventSequences(otherDeviceID);
            $("#timeline-" + otherDeviceID + " .content[data-sequence-id='" + newIndex + "']").css("top", y + "px");
        }
        else {
            $("#timeline-" + deviceID + " .content[data-sequence-id='" + sequenceId + "']").css("top", y + "px");
        }
    }
}