$(document).ready(function () {

    var $url = $("#url");

    socket.on("load", function (url) {
        $url.val(url);
        loadURLOnAllDevices(url);
    });

    //Refresh all devices
    $("#refresh-button").click(function () {
        socket.emit("refresh");
        refreshAllDevices();
    });

    //reload URL on all device when the user hits enter or the input field loses focus
    $url.blur(function () {
        socket.emit("load", $url.val());
        loadURLOnAllDevices($url.val());
    }).keyup(function (ev) {
        if (ev.which === 13) {
            $("#url").blur();
        }
    });

    $("#devices").on("dragover", allowDrop).on("drop", dropDevice);

    $(document).on("dragstart", ".device-container", dragDevice);

    //show/hide device settings
    $(document).on("click", ".settings-button", function () {
        $("#device-" + this.dataset.deviceId + " .settings-panel").slideToggle();
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
});

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
        var d = {"name": deviceIndex, "A":[{"address":u.hostname}], "ttl":300, "domain": "xdtest.com","time": Date.now()};
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
        index = activeDevices.map(function (e) { return e.id; }).indexOf(id);
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