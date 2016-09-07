/**
 * Created by master on 2016-08-03.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CardSbwLogSchema = new Schema({
    cobjid: Schema.Types.ObjectId,
    excard: {type:String, index:true}, //sha256.hex  //shade key
    regdate: {type:Number, default:new Date().getTime()},
    resultcode: {type:Number, default:1, index:true} //success only
},{
    versionKey: false // You should be aware of the outcome after set to false __V
});

module.exports = mongoose.model('CardSbwLog', CardSbwLogSchema);