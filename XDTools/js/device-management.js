/*
    This file covers everything related to creating/removing devices and saving custom devices.
*/

var mainDevices = [];

$(document).ready(function () {

    var devices = getDevices();

    setupDeviceAutocomplete(customDevices.concat(devices));

    //Remove an emulated device
    $(document).on("click", ".remove", function () {
        var deviceID = $(this).closest(".device-container").data("device-id");
       deleteDevice(deviceID);
    });

    //Add a new emulated device
    $("#add-device").click(function () {
        var deviceName = $("#device-name").val(),
            width = $("#width").val(),
            height = $("#height").val(),
            devicePixelRatio = $("#device-pixel-ratio").val();
        clearDeviceInputFields();
        addDevice(deviceName, width, height, devicePixelRatio);
        $("#deviceModal").modal("hide");
    });

    //Save a custom device and add it as a new emulated device
    $("#save-device").click(function () {
        var deviceName = $("#device-name").val(),
            width = $("#width").val(),
            height = $("#height").val(),
            devicePixelRatio = $("#device-pixel-ratio").val(),
            type = $("#type").val(),
            maxValue = Math.max.apply(this, $.map(devices.concat(customDevices), function(o){ return o.value; }));
        customDevices.push({value: maxValue + 1, "label": deviceName, "width": width, "height": height, "devicePixelRatio": devicePixelRatio, "type": type});
        localStorage.setItem("custom-devices", JSON.stringify(customDevices));
        setupDeviceAutocomplete(customDevices.concat(devices));
        clearDeviceInputFields();
        addDevice(deviceName, width, height, devicePixelRatio);
        $("#deviceModal").modal("hide");
        $("#settings-devices").append(HTML.DeviceRow(deviceName));
        $("#no-devices").addClass("hidden");
    });
});

function clearDeviceInputFields() {
    $("#device-name").val("");
    $("#width").val("");
    $("#height").val("");
    $("#device-pixel-ratio").val("");
}

function setupDeviceAutocomplete(devices) {
    $("#predefined-device").autocomplete({
        source: devices,
        select: function(ev, ui) {
            $(this).val("");
            addDevice(ui.item.label, ui.item.width, ui.item.height, ui.item.devicePixelRatio);
            $("#deviceModal").modal("hide");
            ev.preventDefault();
        },
        create: function () {
            $(this).data('uiAutocomplete')._renderMenu = customRenderMenu;
            $(this).data('uiAutocomplete')._renderItem = customRenderItem;
        }
    });
}

//Custom function for rendering devices in the autocomplete list
function customRenderItem(ul, item) {
    return $( "<li>" )
        .attr( "data-value", item.value )
        .append("<span class='bold'>" + item.label + "</span>, " + Math.floor(item.width/item.devicePixelRatio) + " x " + Math.floor(item.height/item.devicePixelRatio))
        .appendTo( ul );
}

//Custom function for rendering the autocomplete list, groups devices into categories phone/tablet/desktop
function customRenderMenu(ul, items) {
    var self = this,
        first = true;
    $.each(items, function (index, item) {
        if (item.type === "phone") {
            if (first) {
                ul.append(HTML.AutoCompleteTitle("Mobile phones"));
                first = false;
            }
            self._renderItemData(ul, item);
        }
    });
    first = true;
    $.each(items, function (index, item) {
        if (item.type === "tablet") {
            if (first) {
                ul.append(HTML.AutoCompleteTitle("Tablets"));
                first = false;
            }
            self._renderItemData(ul, item);
        }
    });
    first = true;
    $.each(items, function (index, item) {
        if (item.type === "desktop") {
            if (first) {
                ul.append(HTML.AutoCompleteTitle("Desktop Devices"));
                first = false;
            }
            self._renderItemData(ul, item);
        }
    });
    first = true;
    $.each(items, function (index, item) {
        if (item.type === "wearable") {
            if (first) {
                ul.append(HTML.AutoCompleteTitle("Wearables"));
                first = false;
            }
            self._renderItemData(ul, item);
        }
    });
}

//Add a new device and adjust its default scaling based on resolution
function addDevice(deviceName, width, height, devicePixelRatio) {
    socket.emit("requestID");
    socket.once("receiveID", function (id) {
        var defaultScaling = 0.5;
        width = width / devicePixelRatio;
        height = height / devicePixelRatio;
        if (width < 500 || height < 500) {
            defaultScaling = 1;
        }
        if (width > 1440 || height > 1440) {
            defaultScaling = 0.4;
        }
        if (width > 1920 || height > 1920) {
            defaultScaling = 0.2;
        }
        var url = new URL($("#url").val()),
            device = new LocalDevice(deviceName, id, width, height, devicePixelRatio, url.href, url.hostname, defaultScaling, 1, 0, 0);
        activeDevices[device.id] = device;
        device.create();
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
}

//Add the HTML for displaying the emulated device
function appendDevice(device) {
    $("#devices").append(HTML.LocalDevice(device));
    var $device = $(".device-container[data-device-id='" + device.id + "']"),
        $deviceSelect = $device.find(".main-devices");
    for (var i = 0, j = mainDevices.length; i < j; ++i) {
        if (mainDevices[i] !== device.id) {
            $deviceSelect.append(HTML.SelectOptionDevice(mainDevices[i]));
        }
    }
    $device.css({
        "top": device.top + "px",
        "left": device.left + "px"
    });
    $device.find(".resizable").css({
        "margin-right": -device.width * (1 - device.scaling) + "px",
        "margin-bottom": -device.height * (1 - device.scaling) + "px",
        "transform": "scale(" + device.scaling + ")",
        "width": device.width,
        "height": device.height
    });
    $device.find("h4").css("max-width", "calc(" + (device.width * device.scaling) + "px - 100px)");
}

//Add the HTML for the displaying of the remote device
function appendRemoteDevice(device) {
    $("#devices").append(HTML.RemoteDevice(device));
    var $device = $(".device-container[data-device-id='" + device.id + "']"),
        $deviceSelect = $device.find(".main-devices");
    for (var i = 0, j = mainDevices.length; i < j; ++i) {
        if (mainDevices[i] !== device.id) {
            $deviceSelect.append(HTML.SelectOptionDevice(mainDevices[i]));
        }
    }
}

//Add the HTML for the timeline of a device
function addDeviceTimeline(id, name) {
    $("#timeline").find(".timeline-content").append(HTML.Timeline(id, name, sequenceNames));
    var color = getNextColor(id),
        $device = $(".device-container[data-device-id='" + id + "']"),
        $timeline = $("#timeline-" + id);
    $("<span class='js-device active' data-device-id='" + id + "'>" + name + "</span>").appendTo($("#device-overview"))
        .css("background-color", "hsla(" + color + ", 60%, 50%, 0.7)");
    $device.css("border-color", "hsla(" + color + ", 60%, 50%, 1)");
    $device.css("color", "hsla(" + color + ", 30%, 30%, 1)");
    $device.find("hr").css("border-color", "hsla(" + color + ", 60%, 50%, 1)");
    $device.find("input").css("border-color", "hsla(" + color + ", 60%, 50%, 1)");
    $device.find("select").css("border-color", "hsla(" + color + ", 60%, 50%, 1)");
    $device.find("button").css("border-color", "hsla(" + color + ", 60%, 40%, 1)");
    $device.find("button").css("background-color", "hsla(" + color + ", 60%, 40%, 1)");
    $device.find("button").css("background-image", "linear-gradient(to bottom, hsla(" + color + ", 60%, 50%, 1) 0, hsla(" + color + ", 60%, 40%, 1) 100%)");
    $timeline.css("color", "hsla(" + color + ", 30%, 30%, 1)");
    $timeline.find("button").css({
        "border-color": "hsla(" + color + ", 60%, 40%, 1)",
        "background-color": "hsla(" + color + ", 60%, 40%, 1)",
        "background-image": "linear-gradient(to bottom, hsla(" + color + ", 60%, 50%, 1) 0, hsla(" + color + ", 60%, 40%, 1) 100%)"
    });
}

function deleteDevice(deviceID) {
    activeDevices[deviceID].destroy();
    delete activeDevices[deviceID];
}

//Returns a list of predefined devices
function getDevices() {
    return [
        {value: 1, "label": "Amazon Kindle Fire HDX 7\"", "width": 1920, "height": 1200, "devicePixelRatio": 2, type: "tablet"},
        {value: 2, "label": "Amazon Kindle Fire HDX 8.9\"", "width": 2560 , "height": 1600, "devicePixelRatio": 2, type: "tablet"},
        {value: 3, "label": "Apple iPad 1/2/Mini", "width": 1024, "height": 768, "devicePixelRatio": 1, type: "tablet"},
        {value: 4, "label": "Apple iPad 3/4", "width": 2048, "height": 1536, "devicePixelRatio": 2, type: "tablet"},
        {value: 5, "label": "Apple iPhone 3GS", "width": 320, "height": 480, "devicePixelRatio": 1, type: "phone"},
        {value: 6, "label": "Apple iPhone 4/4S", "width": 640, "height": 960, "devicePixelRatio": 2, type: "phone"},
        {value: 7, "label": "Apple iPhone 5/5S/5C", "width": 640, "height": 1136, "devicePixelRatio": 2, type: "phone"},
        {value: 8, "label": "Apple iPhone 6", "width": 750, "height": 1334, "devicePixelRatio": 2, type: "phone"},
        {value: 9, "label": "Apple iPhone 6 Plus", "width": 1080, "height": 1920, "devicePixelRatio": 3, type: "phone"},
        {value: 10, "label": "BlackBerry PlayBook", "width": 1024, "height": 600, "devicePixelRatio": 1, type: "tablet"},
        {value: 11, "label": "BlackBerry Z10", "width": 768, "height": 1280, "devicePixelRatio": 2, type: "phone"},
        {value: 12, "label": "BlackBerry Z30", "width": 720, "height": 1280, "devicePixelRatio": 2, type: "phone"},
        {value: 13, "label": "Generic notebook", "width": 1280, "height": 800, "devicePixelRatio": 1, type: "desktop"},
        {value: 14, "label": "Google Nexus 10", "width": 2560, "height": 1600, "devicePixelRatio": 2, type: "tablet"},
        {value: 15, "label": "Google Nexus 4", "width": 768, "height": 1280, "devicePixelRatio": 2, type: "phone"},
        {value: 16, "label": "Google Nexus 5", "width": 1080, "height": 1920, "devicePixelRatio": 3, type: "phone"},
        {value: 17, "label": "Google Nexus 6", "width": 2560, "height": 1440, "devicePixelRatio": 3, type: "phone"},
        {value: 18, "label": "Google Nexus 7 (2012)", "width": 1280, "height": 800, "devicePixelRatio": 1.325, type: "tablet"},
        {value: 19, "label": "Google Nexus 7 (2013)", "width": 1920, "height": 1200, "devicePixelRatio": 2, type: "tablet"},
        {value: 20, "label": "Google Nexus S", "width": 480, "height": 800, "devicePixelRatio": 1.5, type: "phone"},
        {value: 21, "label": "HTC Evo/Touch HD/Desire HD/Desire", "width": 480, "height": 800, "devicePixelRatio": 1.5, type: "phone"},
        {value: 22, "label": "HTC One X/EVO LTE", "width": 720, "height": 1280, "devicePixelRatio": 2, type: "phone"},
        {value: 23, "label": "HTC Sensation/EVO 3D", "width": 540, "height": 960, "devicePixelRatio": 1.5, type: "phone"},
        {value: 24, "label": "HTC One M9/M8", "width": 1920, "height": 1080, "devicePixelRatio": 3, type: "phone"},
        {value: 25, "label": "LG Optimus 2X/3D/Black", "width": 480, "height": 800, "devicePixelRatio": 1.5, type: "phone"},
        {value: 26, "label": "LG Optimus G", "width": 768, "height": 1280, "devicePixelRatio": 2, type: "phone"},
        {value: 27, "label": "LG G3", "width": 2560, "height": 1440, "devicePixelRatio": 3, type: "phone"},
        {value: 28, "label": "LG Optimus LTE/4X HD", "width": 768, "height": 1280, "devicePixelRatio": 1.7, type: "phone"},
        {value: 29, "label": "LG Optimus One", "width": 320, "height": 480, "devicePixelRatio": 1.5, type: "phone"},
        {value: 30, "label": "Motorola Defy/Droid/Droid X/Milestone", "width": 480, "height": 854, "devicePixelRatio": 1.5, type: "phone"},
        {value: 31, "label": "Motorola Droid 3/Droid 4/Droid Razr/Atrix 4G/Atrix 2", "width": 540, "height": 960, "devicePixelRatio": 1, type: "phone"},
        {value: 32, "label": "Motorola Droid Razr HD", "width": 720, "height": 1280, "devicePixelRatio": 1, type: "phone"},
        {value: 33, "label": "Motorola Xoom/Xyboard", "width": 1280, "height": 800, "devicePixelRatio": 1, type: "tablet"},
        {value: 34, "label": "Nokia C5/C6/C7/N97/N8/X7", "width": 360, "height": 640, "devicePixelRatio": 1, type: "phone"},
        {value: 35, "label": "Nokia Lumia 7x0/8xx/900/N800/N810/N900", "width": 480, "height": 800, "devicePixelRatio": 1.5, type: "phone"},
        {value: 36, "label": "Notebook with HiDPI screen", "width": 1440, "height": 900, "devicePixelRatio": 2, type: "desktop"},
        {value: 37, "label": "Samsung Galaxy Note", "width": 800, "height": 1280, "devicePixelRatio": 2, type: "phone"},
        {value: 38, "label": "Samsung Galaxy Note 3", "width": 1080, "height": 1920, "devicePixelRatio": 3, type: "phone"},
        {value: 39, "label": "Samsung Galaxy Note 2", "width": 720, "height": 1280, "devicePixelRatio": 2, type: "phone"},
        {value: 40, "label": "Samsung Galaxy Note 4", "width": 1440, "height": 2560, "devicePixelRatio": 3, type: "phone"},
        {value: 41, "label": "Samsung Galaxy Note Edge", "width": 1600, "height": 2560, "devicePixelRatio": 3, type: "phone"},
        {value: 42, "label": "Samsung Galaxy S3/Nexus", "width": 720, "height": 1280, "devicePixelRatio": 2, type: "phone"},
        {value: 43, "label": "Samsung Galaxy S/S2/W", "width": 480, "height": 800, "devicePixelRatio": 1.5, type: "phone"},
        {value: 44, "label": "Samsung Galaxy S4/S5", "width": 1080, "height": 1920, "devicePixelRatio": 3, type: "phone"},
        {value: 45, "label": "Samsung Galaxy S6/S6 Edge", "width": 2560, "height": 1440, "devicePixelRatio": 3, type: "phone"},
        {value: 46, "label": "Samsung Galaxy Tab", "width": 1024, "height": 600, "devicePixelRatio": 1, type: "tablet"},
        {value: 47, "label": "Samsung Galaxy Tab 7.7/8.9/10.1", "width": 1280, "height": 800, "devicePixelRatio": 1, type: "tablet"},
        {value: 48, "label": "Sony Xperia S/Ion", "width": 720, "height": 1280, "devicePixelRatio": 2, type: "phone"},
        {value: 49, "label": "Sony Xperia Sola/U", "width": 480, "height": 854, "devicePixelRatio": 1, type: "phone"},
        {value: 50, "label": "Sony Xperia Z/Z1", "width": 1080, "height": 1920, "devicePixelRatio": 3, type: "phone"},
        {value: 51, "label": "Sony Xperia Z3", "width": 1080, "height": 1920, "devicePixelRatio": 3, type: "phone"},
        {value: 52, "label": "Amazon Kindle Fire", "width": 1024, "height": 600, "devicePixelRatio": 1, type: "tablet"},
        {value: 53, "label": "LG G Watch", "width": 280, "height": 280, "devicePixelRatio": 1, type: "wearable"},
        {value: 54, "label": "LG G Watch R", "width": 320, "height": 320, "devicePixelRatio": 1, type: "wearable"},
        {value: 55, "label": "Apple Watch (38mm)", "width": 272, "height": 340, "devicePixelRatio": 1, type: "wearable"},
        {value: 56, "label": "Apple Watch (42mm)", "width": 312, "height": 390, "devicePixelRatio": 1, type: "wearable"},
        {value: 57, "label": "Motorola Moto 360", "width": 320, "height": 290, "devicePixelRatio": 1, type: "wearable"},
        {value: 58, "label": "Samsung Gear S", "width": 360, "height": 480, "devicePixelRatio": 1, type: "wearable"},
        {value: 59, "label": "Full HD Display (1080p)", "width": 1920, "height": 1080, "devicePixelRatio": 1, type: "desktop"},
        {value: 60, "label": "HD Display (720p)", "width": 1280, "height": 720, "devicePixelRatio": 1, type: "desktop"},
        {value: 61, "label": "4K Display (UHDTV)", "width": 3840, "height": 2160, "devicePixelRatio": 1, type: "desktop"}
    ];
}