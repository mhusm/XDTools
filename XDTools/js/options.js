var savedSequences = JSON.parse(localStorage.getItem("saved-sequences")) || [],
    sequenceNames = JSON.parse(localStorage.getItem("sequence-names")) || [],
    customDevices = JSON.parse(localStorage.getItem("custom-devices")) || [],
    options = JSON.parse(localStorage.getItem("options")) || {
            "dnsServer": true,
            "recordReplay": true,
            "jsConsole": true,
            "functionDebugging": true,
            "cssEditor": true
        },
    useUrlForConnecting = false;

$(document).ready(function () {

    var savedSessions = JSON.parse(localStorage.getItem("session-names")) || [],
        $noConfigurations = $("#no-configurations"),
        $configurationSettings = $("#configuration-settings");

    $("#session-name").autocomplete({
        source: savedSessions
    });

    if (savedSessions.length > 0) {
        $noConfigurations.addClass("hidden");
    }
    //List all device configurations along with a button to remove them
    for (var i = 0, j = savedSessions.length; i < j; ++i) {
        $configurationSettings.append(HTML.ConfigurationRow(savedSessions[i]));
    }
    //Remove a device configuration
    $(document).on("click", ".config-remove", function () {
        var index = savedSessions.indexOf($(this).data("config-name"));
        savedSessions.splice(index, 1);
        localStorage.setItem("session-names", JSON.stringify(savedSessions));
        localStorage.removeItem("stored-session-" + $(this).data("config-name"));
        $(this).parent("li").remove();
        if (savedSessions.length === 0) {
            $noConfigurations.removeClass("hidden");
        }
    });

    //Save a new configuration
    $("#save-button").click(function () {
        var sessionName = $("#session-name").val(),
            elementsToStore = [],
            i, j;
        $.each(activeDevices, function (key, device) {
            if (!device.isRemote) {
                elementsToStore.push(device.getDevice());
            }
        });
        localStorage.setItem("stored-session-" + sessionName, JSON.stringify(elementsToStore));
        if (savedSessions.indexOf(sessionName) === -1) {
            savedSessions.push(sessionName);
            localStorage.setItem("session-names", JSON.stringify(savedSessions));
        }
        $configurationSettings.append(HTML.ConfigurationRow(sessionName));
        $noConfigurations.addClass("hidden");
        $("#session-name").val("");
    });

    //Load an existing configuration
    $("#load-button").click(function () {
        var sessionName = $("#session-name").val(),
            devices = JSON.parse(localStorage.getItem("stored-session-" + sessionName)),
            i, j;
        $("#devices").empty();
        activeDevices = {};
        loadDevice(devices, 0);
        $("#session-name").val("");
    });

    $("#session-name").keypress(function (ev) {
       if (ev.which === 13) {
           if (savedSessions.indexOf($(this).val()) !== -1) {
               $("#load-button").click();
           }
           else {
               $("#save-button").click();
           }
       }
    });

    $("#enable-dns").click(function () {
        options.dnsServer = $(this).is(":checked");
        if ($(this).is(":checked")) {
            rewriteURL = rewriteURLWithDNS;
        }
        else {
            rewriteURL = rewriteURLWithoutDNS;
        }
        saveOptions();
    });

    var oldWidth = "";
    $("#enable-record-replay").click(function () {
        var $container = $("#container");
        if ($(this).is(":checked")) {
            $container.css("border-right", "1px solid #337ab7");
            $container.css("width", oldWidth);
            $("#timeline").css("display", "block");
            $("#play-button").removeClass("hidden");
            options.recordReplay = true;
        }
        else {
            $("#timeline").css("display", "none");
            $("#play-button").addClass("hidden");
            oldWidth = $container.css("width");
            $container.css("width", "100%");
            $container.css("border-right", "none");
            options.recordReplay = false;
        }
        saveOptions();
    });

    $("#enable-js-console").click(function () {
        options.jsConsole = $(this).is(":checked");
        $("#javascript-console").toggleClass("hidden");
        saveOptions();
    });

    $("#enable-function-debugging").click(function () {
        options.functionDebugging = $(this).is(":checked");
        $("#debug-list").toggleClass("hidden");
        saveOptions();
    });

    $("#enable-css-editor").click(function () {
        options.cssEditor = $(this).is(":checked");
        $("#css-console").toggleClass("hidden");
        saveOptions();
    });

    if (!options.dnsServer) {
        $("#enable-dns").click();
    }
    if (!options.recordReplay) {
        $("#enable-record-replay").click();
    }
    if (!options.jsConsole) {
        $("#enable-js-console").click();
    }
    if (!options.functionDebugging) {
        $("#enable-function-debugging").click();
    }
    if (!options.cssEditor) {
        $("#enable-css-editor").click();
    }

    if (sequenceNames.length > 0) {
        $("#no-sequences").addClass("hidden");
    }

    //List all device configurations along with a button to remove them
    for (var i = 0, j = sequenceNames.length; i < j; ++i) {
        $("#settings-sequences").append(HTML.SequenceRow(sequenceNames[i]));
    }
    //Remove a device configuration
    $(document).on("click", ".seq-remove", function () {
        var index = sequenceNames.indexOf($(this).data("seq-name"));
        sequenceNames.splice(index, 1);
        var index2 = savedSequences.map(function (e) { return e.name; }).indexOf($(this).data("seq-name"));
        savedSequences.splice(index2, 1);
        localStorage.setItem("sequence-names", JSON.stringify(sequenceNames));
        localStorage.setItem("saved-sequences", JSON.stringify(savedSequences));
        $(this).parent("li").remove();
        $("#timeline").find("select option[value='" + $(this).data("seq-name") + "']").remove();
        if (sequenceNames.length === 0) {
            $("#no-sequences").removeClass("hidden");
        }
    });

    if (customDevices.length > 0) {
        $("#no-devices").addClass("hidden");
    }
    //List all custom devices along with a button to remove them
    for (var i = 0, j = customDevices.length; i < j; ++i) {
        $("#settings-devices").append(HTML.DeviceRow(customDevices[i].label));
    }
    //Remove a custom device
    $(document).on("click", ".device-remove", function () {
        var index = customDevices.map(function(e) { return e.label; }).indexOf($(this).data("device-name"));
        customDevices.splice(index, 1);
        localStorage.setItem("custom-devices", JSON.stringify(customDevices));
        $(this).parent("li").remove();
        if (customDevices.length === 0) {
            $("#no-devices").removeClass("hidden");
        }
    });

});

function saveOptions() {
    localStorage.setItem("options", JSON.stringify(options));
}

function loadDevice(devices, i) {
    socket.emit("requestID", i);
    socket.once("receiveID", function(id, index) {
        var $url = $("#url"),
            url = new URL($url.val()),
            device = new LocalDevice(devices[index].name, id, devices[index].width, devices[index].height, devices[index].devicePixelRatio, $url.val(), url.hostname, devices[index].scaling, devices[index].scaling, devices[index].top, devices[index].left);
        activeDevices[device.id] = device;
        device.create();
        var foundAutoConnect = false;
        $("#sessions").find(".auto-connect input").each(function () {
            if ($(this).is(":checked")) {
                foundAutoConnect = true;
                device.$device.find(".main input").click();
                device.$device.find("select").val(id);
                console.log("connect device load");
                connectDevice(id, this.dataset.deviceId);
            }
        });
        if (!foundAutoConnect) {
            $(".session input[data-device-id='" + device.id + "']").click();
        }
        if (index + 1 < devices.length) {
            loadDevice(devices, index + 1);
        }
    });
}