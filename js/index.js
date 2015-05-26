"use strict";

var activeDevices = [],
    master = false,
    socket = io(),
    remoteDevices = [];

$(document).ready(function () {

    $("body").tooltip({
        selector: "button",
        container: "body",
        placement: "bottom",
        trigger: "hover focus"
    });

    var height = $(window).height(),
        i,
        j;

    //Test if the DNS server is reachable. If not, the site is accessed from a device other than the main device and should only emulate itself.
    $.ajax({
        type: "GET",
        url: "http://localhost:8080/",
        contentType: "application/json",
        complete: function (response) {
            //TODO: uncomment if statement to use multiple devices
            //if (response.status === 200) {
                $("#single-device-mode iframe").attr("src", "");
                master = true;
                $("#single-device-mode").addClass("hidden");
                $("#emulation-mode").removeClass("hidden");
            /*}
            else {
                $("#single-device-mode").removeClass("hidden");
                $("#emulation-mode").addClass("hidden");
                //request device id, let server store it
                socket.emit("remoteDeviceConnected");
            }*/
        }
    });

    socket.on("remoteDeviceConnected", function (id) {
        if (master) {
            remoteDevices.push(id);
            addDeviceTimeline(id, id);
        }
    });

    socket.on("remoteDeviceDisconnected", function (id) {
        if (master) {
            remoteDevices.splice(remoteDevices.indexOf(id), 1);
            $("#timeline-" + id).remove();
        }
    });

    //set the body height to the window height, so elements can be dragged everywhere
    $("body").css("height", height);

    //Make elements non-draggable after dragging
    $("html").on("dragend", function (ev) {
        $(".device-container iframe").css("pointer-events", "auto");
        $(".device-container").attr("draggable", "false");
    });

    $("#devices").resizable({
        handles: 'e',
        resize: function (event, ui) {
            var currentWidth = ui.size.width;
            $(this).width(currentWidth);
            $("#timeline").width($("body").width() - currentWidth - 25);
        }
    });

});

function drag(ev) {
    $(".device-container iframe").css("pointer-events", "none");
    ev.dataTransfer.setData("id", ev.target.id.substring(7));
    ev.dataTransfer.setData("xOffset", parseInt(window.getComputedStyle(ev.target, null).getPropertyValue("left", 10)) - ev.clientX);
    ev.dataTransfer.setData("yOffset", parseInt(window.getComputedStyle(ev.target, null).getPropertyValue("top", 10)) - ev.clientY);
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drop(ev) {
    ev.preventDefault();
    //update position of the element
    var id = ev.dataTransfer.getData("id");
    var index = activeDevices.map(function (e) { return e.id; }).indexOf(id);
    $("#device-" + id).css({
        "left": ev.clientX + parseInt(ev.dataTransfer.getData("xOffset")) + "px",
        "top": ev.clientY + parseInt(ev.dataTransfer.getData("yOffset")) + "px"
    });
    activeDevices[index].left = ev.clientX + parseInt(ev.dataTransfer.getData("xOffset"));
    activeDevices[index].top = ev.clientY + parseInt(ev.dataTransfer.getData("yOffset"));
}

function dragTimeline(ev) {
    ev.dataTransfer.setData("yOffset", parseInt(window.getComputedStyle(ev.target, null).getPropertyValue("top", 10)) - ev.clientY)
    ev.dataTransfer.setData("devid", ev.currentTarget.dataset.devid);
}

function dropTimeline(ev) {
    ev.preventDefault();
    if (!ev.dataTransfer.getData("break")) {
        var deviceId = ev.dataTransfer.getData("devid");
        var y = Math.max(0, ev.clientY + parseInt(ev.dataTransfer.getData("yOffset")));
        $("#timeline-" + deviceId + " .content").css("top", y + "px");
        var index = activeDevices.map(function (e) { return e.id; }).indexOf(deviceId);
        activeDevices[index].timelinePosition = y;
    }
}