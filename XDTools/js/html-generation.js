var HTML = {
    CSSRule: function () {
        return "<div class='css-property'>" +
            "<span class='identifier empty' data-placeholder='enter identifier...'></span> {" +
            "<span class='glyphicon glyphicon-remove remove-css hidden'></span>" +
            "<span class='layer-label hidden'></span><br />" +
            "<span class='content'></span>" +
            "}<br /></div><br />";
    },
    CSSProperty: function () {
        return "<span class='line-wrapper'>" +
            "<input type='checkbox' name='property4' value='property4' checked>" +
            "<span class='property empty' data-placeholder='enter property...'></span><span class='remainder'></span>" +
            ": <span class='value empty' data-placeholder='enter value...'></span>;</span><br />";
    },
    ConfigurationRow: function (sessionName) {
        return "<li class='config-row'>" +
            sessionName +
            "<button type='button' data-config-name='" + sessionName + "' class='btn btn-primary btn-sm right config-remove'>" +
            "<span class='glyphicon glyphicon-remove' aria-hidden='true'></span>" +
            "</button><hr /></li>";
    },
    DeviceRow: function (deviceName) {
        return "<li class='device-row'>" +
        deviceName +
        "<button type='button' data-device-name='" + deviceName + "' class='btn btn-primary btn-sm right device-remove'>" +
        "<span class='glyphicon glyphicon-remove' aria-hidden='true'></span>" +
        "</button><hr /></li>";
    },
    SequenceRow: function (name) {
        return "<li class='config-row'>" +
        name +
        "<button type='button' data-seq-name='" + name + "' class='btn btn-primary btn-sm right seq-remove'>" +
        "<span class='glyphicon glyphicon-remove' aria-hidden='true'></span></button><hr /></li>";
    },
    ConnectedDeviceRow: function (deviceID) {
        return "<li data-device-id='" + deviceID + "'><span class='session-device'>" + deviceID + "</span></li>";
    },
    Session: function (deviceID) {
        return "<div class='session' data-device-id='" + deviceID + "'>" +
        "<button type='button' class='btn btn-sm btn-default reset'>Reset Session</button>" +
        "<button type='button' class='btn btn-sm btn-default session-refresh'><span class='glyphicon glyphicon-refresh'></span></button>" +
        "<span class='auto-connect'><input data-device-id='" + deviceID + "' type='checkbox' /> Auto-Connect</span>" +
        "<br /><span class='title'>Connected devices:</span><br />" +
        "<ul><li><span class='main-device'>" + deviceID + "</span></li></ul></div>"
    },
    AutoCompleteTitle: function (name) {
        return "<li class='ui-autocomplete-group bold blue ui-state-disabled'>" + name + "</li><hr />";
    },
    LocalDevice: function (device) {
        return "<section draggable='false' data-device-id='" + device.id + "' class='device-container'>" +
        "<div class='overlay hidden'></div>" +
        "<div class='device-top-container'><h4>" + device.name + "</h4>" +
        "<button type='button' class='btn btn-primary remove'>" +
        "<span class='glyphicon glyphicon-remove' aria-hidden='true'></span>" +
        "</button>" +
        "<button type='button' class='btn btn-primary settings-button' title='Show/hide settings panel'>" +
        "<span class='glyphicon glyphicon-cog' aria-hidden='true'></span>" +
        "</button>" +
        "<span class='device-id'><b>Device ID: </b>" + device.id + "</span>" +
        "<span class='device-resolution'><b>Resolution: </b>" + Math.round(device.width) + " x " + Math.round(device.height) + "</span>" +
        "<hr /></div>" +
        "<section class='settings-panel'>" +
        "<input type='url' class='form-control url' value='" + device.url + "' />" +
        "<div class='settings-container'>" +
            "<input draggable='false' class='range' type='range' value='" + device.scaling + "' min='0.1' max='2' step='0.1' /><span class='scale-factor'>" + device.scaling + "</span>" +
            "<button type='button' class='btn btn-primary rotate' title='Switch orientation'>" +
            "<img class='rotate-img' src='../img/rotate.png' alt='rotate' />" +
            "</button>" +
            "<button type='button' class='btn btn-primary scale' title='Set scaling factor to 1'>" +
            "<span class='glyphicon glyphicon-fullscreen' aria-hidden='true'></span>" +
            "</button>" +
            "<button type='button' class='btn btn-primary refresh' title='Refresh device'>" +
            "<span class='glyphicon glyphicon-refresh' aria-hidden='true'></span>" +
            "</button>" +
            "<div class='dropdown'>" +
            "<button type='button' class='btn btn-primary inspect dropdown-toggle' title='Inspect HTML of device' data-toggle='dropdown' id='dropdown-" + device.id + "' aria-haspopup='true' aria-expanded='true'>" +
            "Inspect HTML " + "<span class='caret'></span>" +
            "</button>" +
            "<ul class='dropdown-menu' aria-labelledby='dropdown-" + device.id + "'>" +
            "<li><a href='#'>body</a></li>" +
            "</ul>" +
            "</div>" +
            "<button type='button' class='btn btn-primary inspect-js hidden' title='Inspect JS files'>" +
            "Inspect JS files" +
            "</button>" +
            "<span class='left'>Layer: <input type='number' class='layer' value='1' /></span>" +
        "</div>" +
        "<div class='main'>" +
        "Connect to device: <select class='form-control main-devices' name='main-devices' data-device-id='" + device.id + "'>" +
        "<option value='' selected></option>" +
        "</select>" +
        "</div><br />" +
        "</section>" + "<div class='resizable'>" +
        "<iframe src='" + device.url + "'></iframe>" +
        "</div></section>";
    },
    RemoteDevice: function (device) {
        return "<section draggable='false' data-device-id='" + device.id + "' class='device-container remote'>" +
        "<div class='overlay hidden'></div>" +
        "<div class='device-top-container'><h4>Remote device</h4>" +
        "<button type='button' class='btn btn-primary settings-button' title='Show/hide settings panel'>" +
        "<span class='glyphicon glyphicon-cog' aria-hidden='true'></span>" +
        "</button>" +
        "<span class='device-id'><b>Device ID: </b>" + device.id + "</span>" +
        "<hr /></div>" +
        "<section class='settings-panel'>" +
        "<input type='url' class='form-control url' value='" + $("#url").val() + "' />" +
        "<button type='button' class='btn btn-primary refresh' title='Refresh device'>" +
        "<span class='glyphicon glyphicon-refresh' aria-hidden='true'></span>" +
        "</button>" +
        "<span class='left'>Layer: <input type='number' class='layer' value='1' /></span>" +
        "<br />" +
        "<div class='main'>" +
        "Connect to device: <select class='form-control main-devices' name='main-devices' data-device-id='" + device.id + "'>" +
        "<option value='' selected></option>" +
        "</select>" +
        "</div>" +
        "</section>" +
        "</section>"
    },
    Timeline: function (id, name, sequenceNames) {
        var timeline = "<section class='device-timeline' id='timeline-" + id + "' data-device-id='" + id + "'>" +
            "<h4>" + name + "</h4>";
        timeline = timeline + "<button type='button' class='btn btn-primary btn-sm record' data-recording='false' title='Start/stop recording'>" +
        "<span class='glyphicon glyphicon-record'></span>" +
        "</button>";
        timeline = timeline + "<button type='button' class='btn btn-primary btn-sm play disabled' title='Replay recorded sequence'>" +
        "<span class='glyphicon glyphicon-play'></span>" +
        "</button>" +
        "<select name='timeline-" + id + "' class='form-control'>" +
        "<option value='none' class='hidden' selected='selected'></option>";
        for (var i = 0, j = sequenceNames.length; i < j; ++i) {
            timeline = timeline + "<option value='" + sequenceNames[i] + "'>" + sequenceNames[i] + "</option>";
        }
        timeline = timeline + "</select>" +
        "<hr /><section class='event-container'></section>" +
        "</section>";
        return timeline;
    },
    SelectOptionDevice: function (id) {
        return "<option data-device-id='" + id + "' value='" + id + "'>" + id + "</option>"
    },
    Breakpoint: function (breakpointIndex, top) {
        return "<div class='breakpoint' id='bp-" + breakpointIndex + "' data-value='" + top * 10 + "' draggable='true'></div>";
    },
    DebugFunction: function (selectedLayer, functionName) {
        return "<div class='function' data-layer='" + selectedLayer + "'>" + "" +
            "<span class='name'>" + functionName + "</span>" +
            "<span class='glyphicon glyphicon-remove remove-function'></span>" +
            "<button type='button' class='btn btn-sm btn-default inspect-function'>Inspect</button>" +
            "<hr /></div>";
    },
    SequenceButtons: function () {
        return "<button class='btn btn-default btn-sm seq-remove-button'>" +
        "<span class='glyphicon glyphicon-remove'></span>" +
        "</button>" +
        "<button class='btn btn-default btn-sm seq-save-button'>" +
        "<span class='glyphicon glyphicon-floppy-disk'></span>" +
        "</button>";
    },
    Break: function (deviceID, eventIndex, sequenceIndex, height, text) {
        return "<div data-device-id='" + deviceID + "' data-sequence-id='" + sequenceIndex + "' data-event-index='" + eventIndex + "' style='height:" + height + "px; line-height:" + height + "px' class='break'><hr class='cut-line' data-device-id='" + deviceID + "' />" + text + "</div>";
    },
    SequenceInput: function (deviceID, z) {
        return "<input type='text' class='seq-name form-control' placeholder='Enter name...' data-device-id='" + deviceID + "' data-sequence-id='" + z + "' autofocus />";
    }
};