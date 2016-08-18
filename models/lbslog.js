/**
 * Created by master on 2016-08-18.
 */
'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var dateFormat = require('dateformat');

var LbslogSchema = new Schema({
    uobjid: Schema.Types.ObjectId,
    uobjnm: String,
    email: String,
    purpose: String,
    regdate: {type:Date, default:Date.now, index:true, get:formatFunction}
},{
    versionKey: false // You should be aware of the outcome after set to false __V
});

function formatFunction(val)
{
    return dateFormat(val, "yyyy-mm-dd hh:MM:ss");
}

module.exports = mongoose.model('Lbslog', LbslogSchema);