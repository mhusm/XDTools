"use strict";

var activeDevices = [],
    socket = io("/local"),
    remoteDevices = [];

$(document).ready(function () {

    $("body").tooltip({
        selector: "button",
        container: "body",
        placement: "bottom",
        trigger: "hover focus"
    });

    $("#qrCodeModal .modal-body").qrcode({
        "size": 200,
        "text": "http://" + window.location.host + "/remote.html"
    });

    var height = $(window).height(),
        i,
        j;

    socket.on("remoteDeviceConnected", function (id) {
        remoteDevices.push(id);
        addDeviceTimeline(id, id);
    });

    socket.on("remoteDeviceDisconnected", function (id) {
        remoteDevices.splice(remoteDevices.indexOf(id), 1);
        $("#timeline-" + id).remove();
    });

    //set the body height to the window height, so elements can be dragged everywhere
    $("body").css("height", height);

    //Make elements non-draggable after dragging
    $("html").on("dragend", function (ev) {
        $(".device-container iframe").css("pointer-events", "auto");
        $(".device-container").attr("draggable", "false");
        $("#continue-button").addClass("disabled");
        $("#continue-button span").removeClass("glyphicon-trash").addClass("glyphicon-play");
        $("#continue-button").css({
            "border": "1px solid #ccc"
        });
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
    var id = ev.dataTransfer.getData("id"),
        index = activeDevices.map(function (e) { return e.id; }).indexOf(id);
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
        var deviceId = ev.dataTransfer.getData("devid"),
            y = Math.max(0, ev.clientY + parseInt(ev.dataTransfer.getData("yOffset"))),
            index = activeDevices.map(function (e) { return e.id; }).indexOf(deviceId);
        $("#timeline-" + deviceId + " .content").css("top", y + "px");
        activeDevices[index].timelinePosition = y;
    }
}