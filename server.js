var app = require("express")(),
    http = require("http").Server(app),
    io = require("socket.io")(http),
    url = "http://w3schools.com",
    shortid = require("shortid"),
    request = require("request"),
    activeDevices = [],
    url = "";

var StaticRoutes = require("./routes/routes");

app.use(StaticRoutes);

app.get("/", function(request, response) {
    response.sendFile(__dirname + "/index.html");
});

/*
app.get("/proxy/*", function(req, res) {
    url = req.url.substring(7);
    request(url, function(error, response, body) {
        res.send(body);
    });
});

app.get("/*", function (req, res) {
    var file = req.url.substring(1);
    console.log("get " + url + "/" + file);
    request(url + "/" +  file, function(error, response, body) {
        res.send(body);
    });
});
*/

io.on("connection", function (socket) {
    console.log("New connection");
    socket.emit("load", url);
    for (var i = 0; i < activeDevices.length; ++i) {
        socket.emit("remoteDeviceConnected", activeDevices[i]);
    }
    socket.on("refresh", function () {
        console.log("Refresh all devices");
        io.emit("refresh");
    });
    socket.on("load", function (newUrl) {
        console.log("Load URL '" + newUrl + "' on all devices");
        url = newUrl;
        io.emit("load", url);
    });
    socket.on("requestID", function () {
        var newID = shortid.generate();
        socket.emit("receiveID", newID.toLowerCase());
    });
    socket.on("remoteDeviceConnected", function () {
        console.log("Remote device connected");
        var newID = shortid.generate();
        activeDevices.push({"id": newID, "socket": socket});
        io.emit("remoteDeviceConnected", newID);
        socket.on("close", function () {
            console.log("Remote device disconnected");
            io.emit("remoteDeviceDisconnected", newID);
            var index = activeDevices.map(function(e) { return e.id; }).indexOf(newID);
            activeDevices.splice(index, 1);
        });
        socket.on("end", function () {
            console.log("Remote device disconnected");
            io.emit("remoteDeviceDisconnected", newID);
            var index = activeDevices.map(function(e) { return e.id; }).indexOf(newID);
            activeDevices.splice(index, 1);
        });
        socket.on("disconnect", function () {
            console.log("Remote device disconnected");
            io.emit("remoteDeviceDisconnected", newID);
            var index = activeDevices.map(function(e) { return e.id; }).indexOf(newID);
            activeDevices.splice(index, 1);
        });
    });
    socket.on("replayRemote", function (deviceID, sequence) {
        console.log("Replay sequence on remote device");
        var index = activeDevices.map(function(e) { return e.id; }).indexOf(deviceID);
        activeDevices[index].socket.emit("replay", sequence);
    });
});

http.listen(8083, function () {
    console.log("Listening on port 8083");
});