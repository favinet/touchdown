/**
 * Created by master on 2016-08-18.
 */
'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var dateFormat = require('dateformat');

var InquireSchema = new Schema({
    title: String,
    content: String,
    wobjid: Schema.Types.ObjectId,
    wobjnm: String,
    email: String,
    regdate: {type:Date, default:Date.now, index:true, get:formatFunction},//shade key
    answeryn: {type:String, default:"N"},
    ansdate: Date,
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

module.exports = mongoose.model('Inquire', InquireSchema);