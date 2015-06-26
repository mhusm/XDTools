var app = require("express")(),
    http = require("http").Server(app),
    io = require("socket.io")(http),
    url = "http://w3schools.com",
    shortid = require("shortid"),
    remoteDevices = [];

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
    socket.on("refresh", function (deviceID) {
        if (deviceID) {
            console.log("Refresh device " + deviceID);
            var index = remoteDevices.map(function(e) { return e.id; }).indexOf(deviceID);
            remoteDevices[index].socket.emit("refresh");
        }
        else {
            console.log("Refresh all devices");
            remote.emit("refresh");
        }
    });
    socket.on("load", function (newUrl, deviceID) {
        if (deviceID) {
            console.log("Load URL '" + newUrl + "' on device " + deviceID);
            var index = remoteDevices.map(function(e) { return e.id; }).indexOf(deviceID);
            remoteDevices[index].socket.emit("load", newUrl);
        }
        else {
            console.log("Load URL '" + newUrl + "' on all devices");
            url = newUrl;
            //remote.emit("load", url);
        }
    });
    socket.on("requestID", function (index, oldId) {
        var newID = shortid.generate();
        if (oldId) {
            socket.emit("receiveID", newID.toLowerCase(), index, oldId);
        }
        else {
            socket.emit("receiveID", newID.toLowerCase(), index);
        }
    });
    socket.on("command", function (command, deviceID) {
        if (deviceID) {
            var index = remoteDevices.map(function(e) { return e.id; }).indexOf(deviceID);
            remoteDevices[index].socket.emit("command", command);
        }
        else {
            remote.emit("command", command)
        }
    });
});

//A remote device connected to the server
remote.on("connection", function (socket) {
    console.log("Remote device connected");
    var newID = shortid.generate();
    socket.emit("load", url);
    remoteDevices.push({"id": newID, "socket": socket});
    local.emit("remoteDeviceConnected", newID);
    socket.on("command", function (command) {
        local.emit("command", command, newID);
    });
    socket.on("close", function () {
        console.log("Remote device disconnected");
        local.emit("remoteDeviceDisconnected", newID);
        var index = getDeviceIndex(newID);
        remoteDevices.splice(index, 1);
    });
    socket.on("end", function () {
        console.log("Remote device disconnected");
        local.emit("remoteDeviceDisconnected", newID);
        var index = getDeviceIndex(newID);
        remoteDevices.splice(index, 1);
    });
    socket.on("disconnect", function () {
        console.log("Remote device disconnected");
        local.emit("remoteDeviceDisconnected", newID);
        var index = getDeviceIndex(newID);
        remoteDevices.splice(index, 1);
    });
});

http.listen(80, function () {
    console.log("Listening on port 80");
});

function getDeviceIndex(deviceId) {
    return remoteDevices.map(function(e) { return e.id; }).indexOf(deviceId);
}