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
        deleteDevice(id);
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

    $("#enable-dns").click(function () {
        if ($(this).is(":checked")) {
            rewriteURL = rewriteURLwithDNS;
        }
        else {
            rewriteURL = rewriteURLWithoutDNS;
        }
    });

    var oldWidth = "";
    $("#enable-record-replay").click(function () {
        var $container = $("#container");
        if ($(this).is(":checked")) {
            $container.css("border-right", "5px solid #337ab7");
            $container.css("width", oldWidth);
            $("#timeline").css("display", "block");
        }
        else {
            $("#timeline").css("display", "none");
            oldWidth = $container.css("width");
            $container.css("width", "100%");
            $container.css("border-right", "none");
        }
    });

    $("#enable-js-console").click(function () {
        $("#javascript-console").toggleClass("hidden");
        adjustLayout();
    });

    $("#enable-function-debugging").click(function () {
        $("#debug-list").toggleClass("hidden");
        adjustLayout();
    });

    $("#enable-css-editor").click(function () {
        $("#css-console").toggleClass("hidden");
        adjustLayout();
    });

});

function allowDrop(ev) {
    ev.preventDefault();
}

function adjustLayout() {
    if ($("#css-console").hasClass("hidden") && $("#javascript-console").hasClass("hidden") && $("#debug-list").hasClass("hidden")) {
        alert("all  hidden");
    }
}