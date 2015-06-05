"use strict";

var activeDevices = [],
    url = new URL(window.location.href),
    socket = io(":" + (url.port || 80) + "/local"),
    remoteDevices = [];

$(document).ready(function () {

    var height = $(window).height();

    $("body").tooltip({
        selector: "button",
        container: "body",
        placement: "bottom",
        trigger: "hover focus"
    }).css("height", height);

    $("#qrCodeModal").find(".modal-body").qrcode({
        "size": 200,
        "text": "http://" + window.location.host + "/remote.html"
    });

    socket.on("remoteDeviceConnected", function (id) {
        remoteDevices.push(id);
        addDeviceTimeline(id, id);
    });

    socket.on("remoteDeviceDisconnected", function (id) {
        remoteDevices.splice(remoteDevices.indexOf(id), 1);
        $("#timeline-" + id).remove();
    });

    //Make elements non-draggable after dragging
    $("html").on("dragend", function () {
        $(".device-container iframe").css("pointer-events", "auto");
        $(".device-container").attr("draggable", "false");
        $("#continue-button").addClass("disabled").css({
            "border": "1px solid #ccc"
        }).find("span").removeClass("glyphicon-trash").addClass("glyphicon-play");
        $(".content").attr('draggable', 'false');
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

function allowDrop(ev) {
    ev.preventDefault();
}