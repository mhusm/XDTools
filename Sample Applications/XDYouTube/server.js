var XDmvcServer = require('xd-mvc/xdmvcserver.js');
var xdmvc = new XDmvcServer();

var connect = require('connect'),
    http = require('http'),
	serveStatic = require('serve-static');
var app = connect().use(serveStatic(__dirname + '/public'));
var server = http.createServer(app);

xdmvc.start(9002, 3000, 9003);
server.listen(8083);

