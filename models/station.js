/**
 * Created by master on 2016-01-22.
 */
'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SatationSchema = new Schema({
    STATION_CD: String,//shade key
    STATION_NM: String,
    LINE_NUM: String,
    FR_CODE: String,
    lat: {type:Number, default:0},
    lon: {type:Number, default:0},
    gx: {type:Number, default:0},
    gy: {type:Number, default:0}
},{
    versionKey: false // You should be aware of the outcome after set to false __V
});

module.exports = mongoose.model('Station', SatationSchema);