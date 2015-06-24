"use strict";

var activeDevices = [],
    url = new URL(window.location.href),
    socket = io(":" + (url.port || 80) + "/local");

$(document).ready(function () {

    $("body").tooltip({
        selector: "button",
        container: "body",
        placement: "bottom",
        trigger: "hover focus"
    });

    $("#qrCodeModal").find(".modal-body").qrcode({
        "size": 200,
        "text": "http://" + window.location.host + "/remote.html"
    });

    socket.on("remoteDeviceConnected", function (id) {
        var device = new RemoteDevice(id, $("#url").val(), 0, 0, 0, true);
        activeDevices.push(device);
        device.create();
        $("#sessions").find(".auto-connect input").each(function () {
            if ($(this).is(":checked")) {
                connectDevice(id, this.dataset.deviceId);
            }
        });
    });

    socket.on("remoteDeviceDisconnected", function (id) {
        var index = getDeviceIndex(id);
        activeDevices[index].destroy();
        activeDevices.splice(index, 1);
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

    $("#container").resizable({
        handles: 'e',
        resize: function (event, ui) {
            var currentWidth = ui.size.width;
            $(this).width(currentWidth);
            $("#timeline").width($("body").width() - currentWidth - 25);
        }
    });

    $("#console-container").resizable({
        handles: 'n',
        resize: function (event, ui) {
            var currentHeight = ui.size.height;
            $(this).height(currentHeight);
            $("#devices").height($("#container").height() - currentHeight - 10);
        }
    }).bind("resize", function () {
        $(this).css("top", "auto");
    });

});

function allowDrop(ev) {
    ev.preventDefault();
}