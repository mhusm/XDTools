var app = require("express")(),
    http = require("http").Server(app),
    io = require("socket.io")(http),
    url = "http://w3schools.com",
    shortid = require("shortid");

var StaticRoutes = require("./routes/routes");

app.use(StaticRoutes);

app.get("/", function(request, response) {
    response.sendFile(__dirname + "/index.html");
});

io.on("connection", function (socket) {
    console.log("New connection");
    socket.emit("load", url);
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
});

http.listen(8083, function () {
    console.log("Listening on port 8083");
});