const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

var net = require("net");
var moment = require("moment");

var server = net.createServer(function(socket) {
    socket.on('data', function(data) {
        var current_datetime = moment();
        var device_raw_data = JSON.parse(data);
        //console.log(device_raw_data.mac);
        //const ma = data.ma
        MongoClient.connect(url, function(err, db){
            console.log("Mongo Database connected.");
            if (err) throw err;
            var device_data = db.db("metering_hub_0");
            device_data.collection("devices").findOne({
                apiInfo: {
                    mac_address: device_raw_data.mac
                }
            }).then(function(result){
                var exportedEnergy = (parseFloat(device_raw_data.Datas[0][4]) + parseFloat(device_raw_data.Datas[1][4] + parseFloat(device_raw_data.Datas[2][4])))/3;
                var importedEnergy = (parseFloat(device_raw_data.Datas[0][3]) + parseFloat(device_raw_data.Datas[1][3]) + parseFloat(device_raw_data.Datas[2][3]))/3;                
                device_data.collection("devicedatas").insertOne({
                    data_type: "ExportedEnergy",
                    datetime: current_datetime.toDate(),
                    value: exportedEnergy,
                    unit: "W/m^2",
                    deviceId: result._id
                });
                device_data.collection("devicedatas").insertOne({
                    data_type: "ImportedEnergy",
                    datetime: current_datetime.toDate(),
                    value: importedEnergy,
                    unit: "W/m^2",
                    deviceId: result._id
                });
                db.close();
            });            
        })
    })
})

server.listen(8000, function() {
    console.log("ISL-DeviceBit Hub Server bound on:8000");
});