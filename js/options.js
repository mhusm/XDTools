var savedSequences = JSON.parse(localStorage.getItem("saved-sequences")) || [],
    sequenceNames = JSON.parse(localStorage.getItem("sequence-names")) || [],
    customDevices = JSON.parse(localStorage.getItem("custom-devices")) || [];

$(document).ready(function () {

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

    if (sequenceNames.length > 0) {
        $("#no-sequences").addClass("hidden");
    }

    //List all device configurations along with a button to remove them
    for (var i = 0, j = sequenceNames.length; i < j; ++i) {
        $("#settings-sequences").append(
            "<li class='config-row'>" +
            sequenceNames[i] +
            "<button type='button' data-seq-name='" + sequenceNames[i] + "' class='btn btn-primary btn-sm right seq-remove'>" +
            "<span class='glyphicon glyphicon-remove' aria-hidden='true'></span>" +
            "</button><hr /></li>"
        );
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
        $("#settings-devices").append(
            "<li class='device-row'>" +
            customDevices[i].label +
            "<button type='button' data-device-name='" + customDevices[i].label + "' class='btn btn-primary btn-sm right device-remove'>" +
            "<span class='glyphicon glyphicon-remove' aria-hidden='true'></span>" +
            "</button><hr /></li>"
        );
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