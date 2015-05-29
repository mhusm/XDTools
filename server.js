var app = require("express")(),
    http = require("http").Server(app),
    io = require("socket.io")(http),
    url = "http://w3schools.com",
    shortid = require("shortid"),
    remoteDevices = [],
    url = "";

var StaticRoutes = require("./routes/routes");

app.use(StaticRoutes);

app.get("/remote.html", function(request, response) {
    response.sendFile(__dirname + "/remote.html");
});

app.get("/*", function(request, response) {
    response.sendFile(__dirname + "/index.html");
});

var remote = io.of("/remote");
var local = io.of("/local");

//A local device connected to the server
local.on("connection", function (socket) {
    console.log("New connection");
    socket.emit("load", url);
    for (var i = 0; i < remoteDevices.length; ++i) {
        socket.emit("remoteDeviceConnected", remoteDevices[i].id);
    }
    socket.on("refresh", function () {
        console.log("Refresh all devices");
        remote.emit("refresh");
    });
    socket.on("load", function (newUrl) {
        console.log("Load URL '" + newUrl + "' on all devices");
        url = newUrl;
        remote.emit("load", url);
    });
    socket.on("requestID", function () {
        var newID = shortid.generate();
        socket.emit("receiveID", newID.toLowerCase());
    });
    socket.on("replayRemote", function (deviceID, sequence, delay, breakpoints) {
        console.log("Replay sequence on remote device");
        var index = remoteDevices.map(function(e) { return e.id; }).indexOf(deviceID);
        remoteDevices[index].socket.emit("replay", sequence, delay, deviceID, breakpoints);
    });
    socket.on("continue", function () {
        remote.emit("continue");
    });
});

//A remote device connected to the server
remote.on("connection", function (socket) {
    console.log("Remote device connected");
    var newID = shortid.generate();
    socket.emit("load", url);
    remoteDevices.push({"id": newID, "socket": socket});
    local.emit("remoteDeviceConnected", newID);
    socket.on("close", function () {
        console.log("Remote device disconnected");
        local.emit("remoteDeviceDisconnected", newID);
        var index = remoteDevices.map(function(e) { return e.id; }).indexOf(newID);
        remoteDevices.splice(index, 1);
    });
    socket.on("end", function () {
        console.log("Remote device disconnected");
        local.emit("remoteDeviceDisconnected", newID);
        var index = remoteDevices.map(function(e) { return e.id; }).indexOf(newID);
        remoteDevices.splice(index, 1);
    });
    socket.on("disconnect", function () {
        console.log("Remote device disconnected");
        local.emit("remoteDeviceDisconnected", newID);
        var index = remoteDevices.map(function(e) { return e.id; }).indexOf(newID);
        remoteDevices.splice(index, 1);
    });
});

http.listen(80, function () {
    console.log("Listening on port 80");
});