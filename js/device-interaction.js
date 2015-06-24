$(document).ready(function () {

    var $url = $("#url");

    socket.on("load", function (url) {
        $url.val(url);
        loadURLOnAllDevices(url);
    });

    //Refresh all devices
    $("#refresh-button").click(function () {
        refreshAllDevices();
    });

    //Remove all devices
    $("#clear-button").click(function () {
        for (var i = 0; i < activeDevices.length; ++i) {
            activeDevices[i].destroy();
        }
        activeDevices = [];
    });

    //Load URL on all device when the user hits enter or the input field loses focus
    $url.blur(function () {
        socket.emit("load", $url.val());
        loadURLOnAllDevices($url.val());
    }).keyup(function (ev) {
        if (ev.which === 13) {
            $url.blur();
        }
    });

    $("#devices").on("dragover", allowDrop).on("drop", dropDevice);

    $(document).on("dragstart", ".device-container", dragDevice);

    //show/hide device settings
    $(document).on("click", ".settings-button", function () {
        $("#device-" + this.dataset.deviceId + " .settings-panel").slideToggle();
    });

    $(document).on("click", ".toggle-main", function () {
        var parent = $(this).closest(".device-container");
        parent.find(".main-devices").toggleClass("hidden");
        var deviceId = parent.data("device-id");
        if ($(this).is(":checked")) {
            makeMainDevice(deviceId);
        }
        else {
            removeMainDevice(deviceId);
        }
    });

    $(document).on("mouseover", ".session-device", function () {
        var deviceId = $(this).text();
        $("#device-" + deviceId).find(".overlay").removeClass("hidden");
    });

    $(document).on("mouseout", ".session-device", function () {
        var deviceId = $(this).text();
        $("#device-" + deviceId).find(".overlay").addClass("hidden");
    });

    $(document).on("change", ".main-devices", function () {
        var deviceId = $(this).closest(".device-container").data("device-id"),
            mainDeviceId = $(this).val();
        connectDevice(deviceId, mainDeviceId);
    });

    //Make the device draggable when clicked on the border
    $(document).on("mousedown", ".device-container", function (ev) {
        if ((ev.offsetY > $(this).outerHeight() - 10 || ev.offsetY < 10 || ev.offsetX < 10 || ev.offsetX > $(this).outerWidth() - 10 || (ev.offsetY < 60 && ev.offsetX < $(this).outerWidth() - 95)) && (ev.target.nodeName === "SECTION" || ev.target.nodeName === "H4")) {
            $(".device-container").attr('draggable', 'true');
        }
    });

    //Update the z-index of the device
    $(document).on("change", ".layer", function () {
        var index = getDeviceIndex(this.dataset.deviceId);
        activeDevices[index].setLayer($(this).val());
    });

    //Switch the orientation from landscape to portrait and vice versa
    $(document).on("click", ".rotate", function () {
        var index = getDeviceIndex(this.dataset.deviceId);
        activeDevices[index].switchOrientation();
    });

    //Set the device scaling to 1
    $(document).on("click", ".scale", function () {
        var index = getDeviceIndex(this.dataset.deviceId);
        activeDevices[index].setScaling(1);
    });

    //Update the URL of a specific device
    $(document).on("blur", ".url", function () {
        var index = getDeviceIndex(this.dataset.deviceId);
        activeDevices[index].loadURL($(this).val());
    });
    $(document).on("keyup", ".url", function (ev) {
        if (ev.which === 13) {
            $(this).blur();
        }
    });

    //Scale up/down the device
    $(document).on("change", ".range", function () {
        var index = getDeviceIndex(this.dataset.deviceId);
        activeDevices[index].setScaling($(this).val());
    });

    $(document).on("click", ".refresh", function () {
        var index = getDeviceIndex(this.dataset.deviceId);
        activeDevices[index].reloadURL();
    });

    $(document).on("click", ".session-refresh", function () {
        var parent = $(this).closest(".session");
        parent.find(".session-device").each(function () {
            var deviceId = $(this).text(),
                index = getDeviceIndex(deviceId);
            activeDevices[index].reloadURL();
        });
    });

    $(document).on("click", ".auto-connect input", function () {
        if ($(this).is(":checked")) {
            $(".auto-connect input").not("[data-device-id='" + this.dataset.deviceId + "']").each(function () {
                if ($(this).is(":checked")) {
                    $(this).click();
                }
            });
        }
    });
});

function connectDevice(deviceId, mainDeviceId) {
    var deviceIndex = getDeviceIndex(deviceId),
        mainDeviceIndex = getDeviceIndex(mainDeviceId);
    if (activeDevices[mainDeviceIndex].isRemote) {
        //Connect to remote device
        var url = $("#device-" + mainDeviceId + " .url").val();
        activeDevices[deviceIndex].connect(url);
    }
    else {
        //Connect to local device
        var url = activeDevices[mainDeviceIndex].url.replace(activeDevices[mainDeviceIndex].host, activeDevices[mainDeviceIndex].originalHost);
        activeDevices[deviceIndex].connect(url);
    }
    $("#sessions").find("li[data-device-id='" + deviceId + "']").remove();
    $(".session[data-device-id='" + mainDeviceId + "'] ul").append("<li data-device-id='" + deviceId + "'><span class='session-device'>" + deviceId + "</span></li>");
}

function makeMainDevice(deviceId) {
    mainDevices.push(deviceId);
    $(".main-devices").append(
        "<option data-device-id='" + deviceId + "' value='" + deviceId + "'>" + deviceId + "</option>"
    );
    $("<div class='session' data-device-id='" + deviceId + "'>" +
        "<button type='button' class='btn btn-sm btn-default session-refresh'><span class='glyphicon glyphicon-refresh'></span></button>" +
        "<span class='auto-connect'><input data-device-id='" + deviceId + "' type='checkbox' /> Auto-Connect</span>" +
        "<span class='title'>Main device: </span><span class='session-device'>" + deviceId + "</span>" +
        "<br /><span class='title'>Connected devices:</span><br />" +
        "<ul></ul></div>"
    ).appendTo("#sessions");
}

function removeMainDevice(deviceId) {
    mainDevices.splice(mainDevices.indexOf(deviceId), 1);
    $(".main-devices option[data-device-id='" + deviceId + "']").remove();
    $(".session[data-device-id='" + deviceId + "']").find("ul").find(".session-device").each(function () {
       var deviceId = $(this).text(),
           index = getDeviceIndex(deviceId);
        activeDevices[index].disconnect();
    });
    $(".session[data-device-id='" + deviceId + "']").remove();
}

function refreshAllDevices() {
    for (var i = 0, j = activeDevices.length; i < j; ++i) {
        activeDevices[i].reloadURL();
    }
}

function loadURLOnAllDevices(url) {
    for (var i = 0, j = activeDevices.length; i < j; ++i) {
        activeDevices[i].loadURL(url);
    }
}

//Rewrite URL for emulated devices so no data is shared between devices
function rewriteURL(url, deviceIndex) {
    var u = new URL(url);
    if (!u.hostname.match(/[a-z]/i)) {
        var d = {"name": deviceIndex, "A":[{"address":u.hostname}], "ttl":3000, "domain": "xdtest.com","time": Date.now()};
        $.ajax({
            type: "PUT",
            url: "http://localhost:8080/" + deviceIndex,
            contentType: "application/json",
            id: deviceIndex,
            data: JSON.stringify(d),
            async: false,
            complete: function () {
                u.hostname = deviceIndex + ".xdtest.com";
            }
        });
    }
    return u.href;
}

function dropDevice(ev) {
    ev.preventDefault();
    //update position of the element
    var id = ev.originalEvent.dataTransfer.getData("id"),
        index = getDeviceIndex(id);
    $("#device-" + id).css({
        "left": ev.originalEvent.clientX + parseInt(ev.originalEvent.dataTransfer.getData("xOffset")) + "px",
        "top": ev.originalEvent.clientY + parseInt(ev.originalEvent.dataTransfer.getData("yOffset")) + "px"
    });
    activeDevices[index].left = ev.originalEvent.clientX + parseInt(ev.originalEvent.dataTransfer.getData("xOffset"));
    activeDevices[index].top = ev.originalEvent.clientY + parseInt(ev.originalEvent.dataTransfer.getData("yOffset"));
}

function dragDevice(ev) {
    $(".device-container iframe").css("pointer-events", "none");
    ev.originalEvent.dataTransfer.setData("id", ev.originalEvent.target.id.substring(7));
    ev.originalEvent.dataTransfer.setData("xOffset", parseInt(window.getComputedStyle(ev.originalEvent.target, null).getPropertyValue("left", 10)) - ev.originalEvent.clientX);
    ev.originalEvent.dataTransfer.setData("yOffset", parseInt(window.getComputedStyle(ev.originalEvent.target, null).getPropertyValue("top", 10)) - ev.originalEvent.clientY);
}