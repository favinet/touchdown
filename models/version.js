/**
 * Created by master on 2016-02-26.
 */
'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var dateFormat = require('dateformat');

var VersionSchema = new Schema({

    cat: {type:String, default:"ANDROID", index:true}, //shade key
    version: {type:Number, default:1},
    uobj: Schema.Types.ObjectId,
    regdate: {type:Date, default:Date.now, get:formatFunction},

},{
    versionKey: false // You should be aware of the outcome after set to false __V
});

function formatFunction(val)
{
    return dateFormat(val, "yyyy-mm-dd HH:MM:ss");
}

module.exports = mongoose.model('Version', VersionSchema);