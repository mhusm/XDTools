/*
    This file covers everything related to interacting with devices:
        - Rotating
        - Scaling
        - Layer
        - Loading URLs
        - Refreshing
 */

$(document).ready(function () {

    //Refresh all devices
    socket.on("refresh", function (){
        refreshAllDevices();
    });
    //Load URL on all devices
    socket.on("load", function (url) {
        loadURLOnAllDevices(url);
    });

    //Refresh all devices
    $("#refresh-button").click(function (ev) {
        socket.emit("refresh");
    });

    //reload URL on all device when the user hits enter or the input field loses focus
    $("#url").blur(function (ev) {
        socket.emit("load", $("#url").val());
    });
    $("#url").keyup(function (ev) {
        if (ev.which === 13) {
            $("#url").blur();
        }
    });

    //update URL of non-master devices
    $("#single-device-mode input").blur(function () {
        $("#single-device-mode iframe").attr("src", $("#single-device-mode input").val());
    });
    $("#single-device-mode input").keyup(function (ev) {
        if (ev.which === 13) {
            $("#single-device-mode input").blur();
        }
    });

    //show/hide device settings
    $(document).on("click", ".settings-button", function (ev) {
        var deviceIndex = $(this).data("devid");
        $("#device-" + deviceIndex + " .settings-panel").slideToggle();
    });

    //Make the device draggable when clicked on the border
    $(document).on("mousedown", ".device-container", function (ev) {
        if ((ev.offsetY > $(this).outerHeight() - 10 || ev.offsetY < 10 || ev.offsetX < 10 || ev.offsetX > $(this).outerWidth() - 10 || (ev.offsetY < 60 && ev.offsetX < $(this).outerWidth() - 95)) && (ev.target.nodeName === "DIV" || ev.target.nodeName === "H4")) {
            $(".device-container").attr('draggable', 'true');
        }
    });

    //Update the z-index of the device
    $(document).on("change", ".layer", function () {
        var deviceIndex = $(this).data("devid");
        $("#device-" + deviceIndex).css("z-index", $(this).val());
    });

    //Switch the orientation from landscape to portrait and vice versa
    $(document).on("click", ".rotate", function () {
        var deviceIndex = $(this).data("devid"),
            iframe = "#device-" + deviceIndex + " iframe",
            oldWidth = $(iframe).css("width"),
            oldRightMargin = $(iframe).css("margin-right");
        $(iframe).css({
            "width": $(iframe).css("height"),
            "margin-right": $(iframe).css("margin-bottom"),
            "height": oldWidth,
            "margin-bottom": oldRightMargin
        });
    });

    //Set the device scaling to 1
    $(document).on("click", ".scale", function () {
        var deviceIndex = $(this).data("devid");
        $("#deviceinput" + deviceIndex).val(1);
        $("#device-" + deviceIndex + " iframe").css({
            "margin-right": "0px",
            "margin-bottom": "0px",
            "transform": "scale(" + 1 + ")"
        });
    });

    //Update the URL of a specific device
    $(document).on("blur", ".url", function () {
        loadURL($(this).data("devid"), $(this).val());
    });
    $(document).on("keyup", ".url", function (ev) {
        if (ev.which === 13) {
            $(this).blur();
        }
    });

    //Scale up/down the device
    $(document).on("change", ".range", function () {
        var deviceIndex = $(this).data("devid"),
            newVal = $(this).val(),
            iframe = "#device-" + deviceIndex + " iframe";
        if (newVal > 0 & newVal <= 2) {
            $(iframe).css({
                "margin-right": -parseInt($(iframe).css("width")) * (1 - newVal) + "px",
                "margin-bottom": -parseInt($(iframe).css("height")) * (1 - newVal) + "px",
                "transform": "scale(" + newVal + ")"
            });
            $("#device-" + deviceIndex + " .scale-factor").text(newVal);
        }
    });
});

function refreshAllDevices() {
    if (master) {
        for (var i = 0, j = activeDevices.length; i < j; ++i) {
            $("#device-" + activeDevices[i] + " iframe").attr("src", $("#device-" + activeDevices[i] + " iframe").attr("src"));
        }
    }
    else {
        $("#single-device-mode iframe").attr("src", $("#single-device-mode iframe").attr("src"));
    }
}

function loadURLOnAllDevices(url) {
    if (master) {
        for (var i = 0, j = activeDevices.length; i < j; ++i) {
            var tempUrl = rewriteURL(url, activeDevices[i]);
            $("#device-" + activeDevices[i] + " iframe").attr("src", tempUrl);
            $("#device-" + activeDevices[i] + " .url").val(url);
        }
    }
    else {
        $("#single-device-mode iframe").attr("src", url);
        $("#single-device-mode input").val(url);
    }
}

function loadURL(deviceIndex, url) {
    url = rewriteURL(url, deviceIndex);
    $("#device-" + deviceIndex + " iframe").attr("src", url);
}

//Rewrite URL for emulated devices so no data is shared between devices
function rewriteURL(url, deviceIndex) {
    var u = new URL(url);
    if (!u.hostname.match(/[a-z]/i) && master) {
        var ipRegex = "^(?:https?:\/\/)?(?:www\.)?([^\/|:]+)",
            d = {"name": deviceIndex, "A":[{"address":u.hostname}], "ttl":300, "domain": "bla.com","time": Date.now()};
        $.ajax({
            type: "PUT",
            url: "http://localhost:8080/" + deviceIndex,
            contentType: "application/json",
            id: deviceIndex,
            data: JSON.stringify(d),
            async: false,
            complete: function () {
                //TODO: temporarily disabled for debugging
                //u.hostname = deviceIndex + ".bla.com";
            }
        });
    }
    return u.href;
}