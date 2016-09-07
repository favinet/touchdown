/**
 * Created by master on 2016-01-22.
 */
'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var dateFormat = require('dateformat');

var UselogSchema = new Schema({
    uobj: Schema.Types.ObjectId,//shade key
    aobj: Schema.Types.ObjectId,
    saving: {type:Number, default:0},
    saved: {type:Number, default:0},
    regdate: {type:Date, default:Date.now, index:true, get:formatFunction}
},{
    versionKey: false // You should be aware of the outcome after set to false __V
});

function formatFunction(val)
{
    return dateFormat(val, "yyyy-mm-dd hh:MM:ss");
}

module.exports = mongoose.model('Uselog', UselogSchema);