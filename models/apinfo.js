/**
 * Created by master on 2016-01-22.
 */
'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ApInfoSchema = new Schema({
    line : String,  //호선 정보
    place : String, //역 이름
    fcode : String, //역 코드
    ssid: String,
    mac: String,
    lon: String,
    lat: String,
    rssi : String,  //wifi 신호 강도
    regdate: {type:Date, default:Date.now}
},{
    versionKey: false // You should be aware of the outcome after set to false __V
});

module.exports = mongoose.model('ApInfo', ApInfoSchema);