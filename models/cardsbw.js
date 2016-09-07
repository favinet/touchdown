/**
 * Created by master on 2016-08-03.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CardSbwSchema = new Schema({
    cobjid: Schema.Types.ObjectId,
    excard: {type:String, index:true}, //sha256.hex  //shade key
    regdate: {type:Number, default:new Date().getTime()}, //동일한 값이 들어가야 한다.
    trycnt: {type:Number, default:1, index:true}
},{
    versionKey: false // You should be aware of the outcome after set to false __V
});

module.exports = mongoose.model('CardSbw', CardSbwSchema);