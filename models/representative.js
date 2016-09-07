/**
 * Created by master on 2016-08-09.
 */
'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var dateFormat = require('dateformat');

var RepresentativeSchema = new Schema({
    name: String,
    regno: String,//shade key
    regdate: {type:Date, default:Date.now, get:formatFunction},
    uobjnm: String,
    uobjid: Schema.Types.ObjectId

},{
    versionKey: false // You should be aware of the outcome after set to false __V
});

function formatFunction(val)
{
    return dateFormat(val, "yyyy-mm-dd HH:MM:ss");
}

module.exports = mongoose.model('Representative', RepresentativeSchema);