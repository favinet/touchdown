/**
 * Created by master on 2016-01-22.
 */
'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var dateFormat = require('dateformat');

var BoardSchema = new Schema({
    cat: {type:String, default:"N", match:/^[A-Z]$/},
    kind: {type:String, default:"00", match:/^[0-9]{2}$/},
    title: String,
    content: String,
    regdate: {type:Date, default:Date.now, index:true, get:formatFunction},  //shade key
    showyn: {type:Boolean, default:false},
    attaches: [{path:String}],
    uobjnm: String,
    uobjid: Schema.Types.ObjectId
},{
    versionKey: false // You should be aware of the outcome after set to false __V
});

function formatFunction(val)
{
    return dateFormat(val, "yyyy-mm-dd HH:MM:ss");
}

module.exports = mongoose.model('Board', BoardSchema);