var events = {},
    savedSequences = JSON.parse(localStorage.getItem("saved-sequences")) || [],
    sequenceNames = JSON.parse(localStorage.getItem("sequence-names")) || [],
    breakpoints = [],
    breakpointIndex = 0;

$(document).ready(function () {

    if (sequenceNames.length > 0) {
        $("#no-sequences").addClass("hidden");
    }

    //List all device configurations along with a button to remove them
    for (var i = 0, j = sequenceNames.length; i < j; ++i) {
        $("#settings-sequences").append(
            "<li class='config-row'>" +
            sequenceNames[i] +
            "<button type='button' data-seq-name='" + sequenceNames[i] + "' class='btn btn-primary btn-sm right seq-remove'>" +
            "<span class='glyphicon glyphicon-remove' aria-hidden='true'></span>" +
            "</button><hr /></li>"
        );
    }
    //Remove a device configuration
    $(document).on("click", ".seq-remove", function () {
        var index = sequenceNames.indexOf($(this).data("seq-name"));
        sequenceNames.splice(index, 1);
        var index2 = savedSequences.map(function (e) { return e.name; }).indexOf($(this).data("seq-name"));
        savedSequences.splice(index2, 1);
        localStorage.setItem("sequence-names", JSON.stringify(sequenceNames));
        localStorage.setItem("saved-sequences", JSON.stringify(savedSequences));
        $(this).parent("li").remove();
        $("#timeline").find("select option[value='" + $(this).data("seq-name") + "']").remove();
        if (sequenceNames.length === 0) {
            $("#no-sequences").removeClass("hidden");
        }
    });

    window.addEventListener("message", function (ev) {
        var command = JSON.parse(ev.data);
        if (command.name === "sendEventSequence") {
            events[command.deviceId] = [];
            events[command.deviceId].push({"name": "unnamed sequence", "sequence": adjustTiming(command.eventSequence)});
            visualizeEventSequence(command.deviceId);
        }
        else if (command.name === "breakpointReached") {
            $("#continue-button").removeClass("disabled").css({
                "border": "3px solid rgb(145, 215, 105)"
            });
            $("#" + command.breakpoint.id).css("opacity", 1);
        }
    }, false);

    $("#breakpoint-container").click(function (ev) {
        var top = ev.offsetY - 7.5;
        breakpoints.push({"time": top * 10, "id": "bp-" + breakpointIndex});
        $("<div class='breakpoint' id='bp-" + breakpointIndex + "' data-value='" + top * 10 + "' draggable='true'></div>").appendTo($("#breakpoint-container")).css("top", top + "px").on("dragstart", dragBreakpoint);
        breakpointIndex++;
    });

    $("#continue-button").click(function () {
        var command = new Command("continue", 0);
        for (var i = 0, j = activeDevices.length; i < j; ++i) {
            command.send($("#device-" + activeDevices[i].id + " iframe")[0], activeDevices[i].url);
        }
        $("#continue-button").addClass("disabled").css({
            "border": "1px solid #ccc"
        });
        $(".breakpoint").css("opacity", 0.5);
        socket.emit("continue");
    });

    //start/stop recording
    $(document).on("click", ".record", function () {
        var recording = $(this).data("recording"),
            deviceId = $(this).data("devid"),
            index = getDeviceIndex(deviceId);
        if (recording) {
            $(this).data("recording", false);
            $(this).find(".glyphicon").removeClass("glyphicon-stop").addClass("glyphicon-record");
            var command = new Command("stopRecording", deviceId);
            command.send($("#device-" + deviceId + " iframe")[0], activeDevices[index].url);
            $("#timeline-" + deviceId + " .play").removeClass("disabled");
        }
        else {
            $(this).data("recording", true);
            $(this).find(".glyphicon").removeClass("glyphicon-record").addClass("glyphicon-stop");
            var command = new Command("startRecording", deviceId);
            command.send($("#device-" + deviceId + " iframe")[0], activeDevices[index].url);
        }
    });

    //Replay recorded sequence
    $(document).on("click", ".play", function () {
        var deviceId = $(this).data("devid"),
            index = getDeviceIndex($(this).data("devid"));
        var eventSequences = [];
        for (var k = 0; k < events[deviceId].length; ++k) {
            var curPos = $("#timeline-" + index + " .content[data-seqid='" + k + "']  .label-primary").offset().top - $("#timeline-" + index + " .content[data-seqid='" + k + "']").parent().offset().top;
            eventSequences.push({"startTime": curPos * 10, "sequence": events[index].sequence[k]});
        }
        var command = new ReplayCommand("startReplaying", deviceId, eventSequences, breakpoints);
        command.send($("#device-" + deviceId + " iframe")[0], activeDevices[index].url);
    });

    //Display the selected event sequence for a device
    $(document).on("change", "#timeline select", function () {
        var deviceId = $(this).data("devid"),
            sequenceName = $(this).val();
        if (sequenceName === "none") {
            $("#timeline-" + deviceId + " .content").remove();
            events[deviceId] = [];
        }
        else {
            if (!events[deviceId]) {
                events[deviceId] = [];
            }
            var index = savedSequences.map(function (e) { return e.name; }).indexOf(sequenceName);
            events[deviceId].push({"name": sequenceName, "sequence": savedSequences[index].sequence.slice(0)});
            visualizeEventSequence(deviceId);
        }
        $(this).blur();
    });

    $(document).on("focus", "#timeline select", function () {
        this.selectedIndex = -1;
    });

    $("#break-button").on("dragstart", dragBreak);

    $("#continue-button").on("dragover", allowDrop).on("drop", dropBreakpoint);

    $(document).on("dragover", ".event-container", allowDrop).on("drop", ".event-container", dropTimeline);

    $(document).on("dragover", ".break", allowDrop).on("drop", ".break", dropBreak);

    $(document).on("dragstart", ".content", dragTimeline);

    $("#play-button").click(function () {
        var i, j, k,
            eventSequences = [];
        for (i = 0, j = activeDevices.length; i < j; ++i) {
            if (events[activeDevices[i].id] && events[activeDevices[i].id].length > 0) {
                for (k = 0; k < events[activeDevices[i].id].length; ++k) {
                    var timeline = $("#timeline-" + activeDevices[i].id),
                        curPos = timeline.find(".content[data-seqid='" + k + "'] .label-primary").offset().top - timeline.find(".content[data-seqid='" + k + "']").parent().offset().top;
                    eventSequences.push({"startTime": curPos * 10, "sequence": events[activeDevices[i].id][k].sequence});
                }
                var command = new ReplayCommand("startReplaying", activeDevices[i].id, eventSequences, breakpoints);
                command.send($("#device-" + activeDevices[i].id + " iframe")[0], activeDevices[i].url);
            }
        }
        for (i = 0, j = remoteDevices.length; i < j; ++i) {
            for (k = 0; k < events[remoteDevices[i]].length; ++k) {
                var timeline = $("#timeline-" + remoteDevices[i]),
                    curPos = timeline.find(".content[data-seqid='" + k + "']  .label-primary").offset().top - timeline.find(".content[data-seqid='" + k + "']").parent().offset().top;
                eventSequences.push({"startTime": curPos * 10, "sequence": events[remoteDevices[i]][k].sequence});
            }
            if (events[remoteDevices[i]] && events[remoteDevices[i]].length > 0) {
                socket.emit("replayRemote", remoteDevices[i], JSON.stringify(eventSequences), parseInt($("#timeline-" + remoteDevices[i] + " .content").css("top")) * 10, JSON.stringify(breakpoints));
            }
        }
    });

    $(document).on("mousedown", ".content", function (ev) {
        if ((ev.offsetY > $(this).outerHeight() - 10 || ev.offsetY < 10 || ev.offsetX < 10 || ev.offsetX > $(this).outerWidth() - 10) && ev.target.nodeName === "SECTION") {
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
        var deviceId = $(this).data("devid"),
            position = ev.pageY;
        cutTimeline(deviceId, position);
    });

    $(document).on("click", ".seq-remove-button", function () {
        var deviceId = $(this).parent()[0].dataset.devid,
            seqId = parseInt($(this).parent()[0].dataset.seqid);
        events[deviceId].splice(seqId, 1);
        visualizeEventSequence(deviceId);
    });
    $(document).on("blur", ".seq-name", function () {
        var deviceId = this.dataset.devid,
            seqId = parseInt(this.dataset.seqid),
            name = $(this).val();
        savedSequences.push({"name": name, "sequence": events[deviceId][seqId].sequence.slice(0)});
        events[deviceId][seqId].name = name;
        $("#settings-sequences").append(
            "<li class='config-row'>" +
            name +
            "<button type='button' data-seq-name='" + name + "' class='btn btn-primary btn-sm right seq-remove'>" +
            "<span class='glyphicon glyphicon-remove' aria-hidden='true'></span>" +
            "</button><hr /></li>"
        );
        $("#no-sequences").addClass("hidden");
        localStorage.setItem("saved-sequences", JSON.stringify(savedSequences));
        $("#timeline").find("select").append("<option value='" + name + "'>" + name + "</option>");
        sequenceNames.push(name);
        localStorage.setItem("sequence-names", JSON.stringify(sequenceNames));
        $("*").popover("hide");
        visualizeEventSequence(deviceId);
    });
    $(document).on("keypress", ".seq-name", function (ev) {
        if (ev.which === 13) {
            $(this).blur();
        }
    });
});

function adjustTiming(eventSequence) {
    var initialTime = eventSequence[0].time;
    for (var i = 0, j = eventSequence.length; i < j; ++i) {
        eventSequence[i].time = eventSequence[i].time - initialTime;
    }
    return eventSequence;
}

function cutTimeline(deviceId, time) {
    var sequence1 = [],
        sequence2 = [],
        i  = 0, j, k,
        top = $("#timeline-" + deviceId + " .content[data-seqid='" + i + "'] .label-primary").offset().top;
    while (i < events[deviceId].length && top < time) {
        ++i;
    }
    --i;
    time = (time - top) * 10;
    for (k = 0, j = events[deviceId][i].sequence.length; k < j; ++k) {
        if (events[deviceId][i].sequence[k].time - events[deviceId][0].sequence[0].time <= time) {
            sequence1.push(JSON.parse(JSON.stringify(events[deviceId][i].sequence[k])));
        }
        else {
            sequence2.push(JSON.parse(JSON.stringify(events[deviceId][i].sequence[k])));
        }
    }
    events[deviceId].splice(i, 1);
    events[deviceId].splice(i, 0, {"name": "unnamed sequence", "sequence": adjustTiming(sequence2)});
    events[deviceId].splice(i, 0, {"name": "unnamed sequence", "sequence": sequence1});
    visualizeEventSequence(deviceId);
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
        var deviceId = ev.target.dataset.devid,
            sequenceId = parseInt(ev.target.dataset.seqid);
        for (var i = parseInt(ev.target.dataset.eventIndex) + 1; i < events[deviceId][sequenceId].sequence.length; ++i) {
            events[deviceId][sequenceId].sequence[i].time += 1000;
        }
        visualizeEventSequence(deviceId);
    }
}

function dragBreak(ev) {
    ev.originalEvent.dataTransfer.setData("break", true);
}

function visualizeEventSequence(deviceId) {
    $("#timeline-" + deviceId + " .content").remove();
    var evs = events[deviceId];
    for (var z = 0; z < evs.length; ++z) {
        var curEvents = evs[z].sequence,
            groups = groupEvents(curEvents),
            lastTime = groups[0][groups[0].length - 1].event.time,
            prevTime = groups[0][0].event.time,
            html = "<section class='content' data-seqid='" + z + "' data-devid='" + deviceId + "'>" +
                        evs[z].name +
                        "<button class='btn btn-default btn-sm seq-remove-button'>" +
                            "<span class='glyphicon glyphicon-remove'></span>" +
                        "</button>" +
                        "<button class='btn btn-default btn-sm seq-save-button'>" +
                            "<span class='glyphicon glyphicon-floppy-disk'></span>" +
                        "</button>";
        for (var i = 0, j = groups.length; i < j; ++i) {
            var pause = Math.max(0, groups[i][0].event.time - lastTime),
                height = Math.max(0, groups[i][0].event.time - prevTime - 200) / 10,
                types = [];
            if (height >= 14) {
                html = html + "<div data-devid='" + deviceId + "' data-seqid='" + z + "' data-event-index='" + groups[Math.max(i - 1, 0)][groups[Math.max(i - 1, 0)].length - 1].index + "' style='height:" + height + "px; line-height:" + height + "px' class='break'><hr class='cut-line' data-devid='" + deviceId + "' />" + pause + " ms</div>";
            }
            else {
                html = html + "<div data-devid='" + deviceId + "' data-event-index='" + groups[Math.max(i - 1, 0)][groups[Math.max(i - 1, 0)].length - 1].index + "' style='height:" + height + "px; line-height:" + height + "px' class='break'><hr class='cut-line' data-devid='" + deviceId + "' /></div>";
            }
            html = html + "<span class='label label-primary'>";
            lastTime = groups[i][groups[i].length - 1].event.time;
            prevTime = groups[i][0].event.time;
            for (var k = 0, l = groups[i].length; k < l; ++k) {
                types.push(groups[i][k].event.type);
            }
            html += types.join(", ") + "</span>";
        }
        html = html + "</section>";
        $(html).appendTo("#timeline-" + deviceId + " .event-container");
        $("#timeline-" + deviceId + " .content[data-seqid='" + z + "'] .seq-save-button").popover({
            placement: 'left',
            container: 'body',
            html: true,
            content: "<input type='text' class='seq-name form-control' placeholder='Enter name...' data-devid='" + deviceId + "' data-seqid='" + z + "' autofocus />"
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

function Command(name, deviceId) {
    this.name = name;
    this.deviceId = deviceId;
    this.parentDomain = "http://" + window.location.host;
    this.toString = function () {
        return JSON.stringify({"name": this.name, "deviceId": this.deviceId, "parentDomain": this.parentDomain});
    };
    this.send = function (targetIframe, url) {
        targetIframe.contentWindow.postMessage(this.toString(), url);
    };
}

function ReplayCommand(name, deviceId, sequence, breakpoints) {
    Command.call(this, name, deviceId);
    this.eventSequence = sequence;
    this.breakpoints = breakpoints;
    this.toString = function () {
        return JSON.stringify({"name": this.name, "deviceId": this.deviceId, "parentDomain": this.parentDomain, "eventSequence": this.eventSequence, "breakpoints": this.breakpoints});
    };
}

function dragTimeline(ev) {
    ev.originalEvent.dataTransfer.setData("yOffset", parseInt(window.getComputedStyle(ev.originalEvent.target, null).getPropertyValue("top", 10)) - ev.originalEvent.clientY);
    ev.originalEvent.dataTransfer.setData("devid", ev.currentTarget.dataset.devid);
    ev.originalEvent.dataTransfer.setData("seqid", ev.currentTarget.dataset.seqid);
}

function dropTimeline(ev) {
    ev.preventDefault();
    if (!ev.originalEvent.dataTransfer.getData("break")) {
        var deviceId = ev.originalEvent.dataTransfer.getData("devid"),
            sequenceId = parseInt(ev.originalEvent.dataTransfer.getData("seqid")),
            y = Math.max(0, ev.originalEvent.clientY + parseInt(ev.originalEvent.dataTransfer.getData("yOffset")));
        if (ev.currentTarget.dataset.devid !== deviceId) {
            if (!events[ev.currentTarget.dataset.devid]) {
                events[ev.currentTarget.dataset.devid] = [];
            }
            var newIndex = events[ev.currentTarget.dataset.devid].length;
            events[ev.currentTarget.dataset.devid].push(events[deviceId][sequenceId]);
            events[deviceId].splice(sequenceId, 1);
            visualizeEventSequence(deviceId);
            visualizeEventSequence(ev.currentTarget.dataset.devid);
            $("#timeline-" + ev.currentTarget.dataset.devid + " .content[data-seqid='" + newIndex + "']").css("top", y + "px");
        }
        else {
            $("#timeline-" + deviceId + " .content[data-seqid='" + sequenceId + "']").css("top", y + "px");
        }
    }
}