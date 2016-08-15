/**
 * Created by master on 2016-03-02.
 */
'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var dateFormat = require('dateformat');

var UpfileSchema = new Schema({
    ext: {type:String, default:"PNG"},
    regdate: {type:Date, default:Date.now, get:formatFunction},
},{
    versionKey: false // You should be aware of the outcome after set to false __V
});

function formatFunction(val)
{
    return dateFormat(val, "yyyy-mm-dd HH:MM:ss");
}

module.exports = mongoose.model('Upfile', UpfileSchema);