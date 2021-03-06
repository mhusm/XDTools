/*
 * XDTools -- A set of tools for cross-device development
 * Copyright (C) 2015 Maria Husmann. All rights reserved.
 *
 * XDTools is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * XDTools is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with XDTools. If not, see <http://www.gnu.org/licenses/>.
 *
 * See the README and LICENSE files for further information.
 *
 */

"use strict";

var activeDevices = {},
    url = new URL(window.location.href),
    socket = io(":" + (url.port || 80) + "/local");

$(document).ready(function () {

    $(window).bind('beforeunload', function(ev) {
        return 'If you reload this page, all current emulated devices will be lost. Are you sure you want to reload?';
    });

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
        activeDevices[device.id] = device;
        device.create();
        device.disconnect();
        var foundAutoConnect = false;
        $("#sessions").find(".auto-connect input").each(function () {
            if ($(this).is(":checked")) {
                foundAutoConnect = true;
                //device.$device.find(".main input").click();
                device.$device.find("select").val($(this).closest(".session").find(".main-device").text());
                connectDevice(id, this.dataset.deviceId);
            }
        });
        if (!foundAutoConnect) {
            $(".session input[data-device-id='" + device.id + "']").click();
        }
    });

    socket.on("remoteDeviceDisconnected", function (id) {
        if (activeDevices[id]) {
            deleteDevice(id);
        }
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

    $("#timeline").resizable({
        handles: 'w',
        resize: function (event, ui) {
            var currentWidth = ui.size.width;
            $(this).width(currentWidth);
            $("#container").width($("body").width() - currentWidth - 25);
            $(this).css("left", 0);
        },
        minWidth: 114,
        maxWidth: window.innerWidth * 0.75
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