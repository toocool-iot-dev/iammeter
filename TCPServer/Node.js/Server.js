var net = require("net");

var server = net.createServer(function(socket) {
    socket.on('data', function(data) {
        console.log(data.toString());
    })
})

server.listen(8000, function() {
    console.log("ISL-DeviceBit Hub Server bound on:8000");
})