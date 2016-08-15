/**
 * Created by master on 2016-01-22.
 */
'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var dateFormat = require('dateformat');

var AdvertiseSchema = new Schema({
    title: String,
    content: String,
    advertisernm : String,
    advertiserid : Schema.Types.ObjectId,
    representativenm : String,
    representativeid : Schema.Types.ObjectId,
    cat: String,
    typ: String,
    url: String,
    showyn: {type:Boolean, default:false},
    stdate: {type:Date, default:Date.now, get:formatFunction},
    eddate: {type:Date, default:Date.now, get:formatFunction},
    img1: String,
    img2: String,
    img3: String,
    saving: {type:Number, default:0},
    clkcnt: {type:Number, default:0},
    advcnt: {type:Number, default:0},
    usecnt: {type:Number, default:0},
    budget: {type:Number, default:0},
    adprice: {type:Number, default:0},
    ctprice: {type:Number, default:0},
    target1: String,
    target2: String,
    target3: String,
    target4: String,
    plat: String,
    excode: String,
    regdate: {type:Date, default:Date.now, get:formatFunction},
    uobjnm: String,
    uobjid: Schema.Types.ObjectId,
    tag: String
},{
    versionKey: false // You should be aware of the outcome after set to false __V
});

function formatFunction(val)
{
    return dateFormat(val, "yyyy-mm-dd HH:MM:ss");
}

module.exports = mongoose.model('Advertise', AdvertiseSchema);