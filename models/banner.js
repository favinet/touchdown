/**
 * Created by master on 2016-09-12.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var dateFormat = require('dateformat');

var BannerSchema = new Schema({
    loc: {type:String, default:"T", match:/^[A-Z]$/},
    aobjid: Schema.Types.ObjectId,
    atitle: String,
    aimg1: String,
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

module.exports = mongoose.model('Banner', BannerSchema);