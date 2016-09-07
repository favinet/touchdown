/**
 * Created by master on 2016-08-03.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TagLogSchema = new Schema({
    cobjid: Schema.Types.ObjectId,
    station: String,//shade key
    inout: Number,
    tagdate: Number
},{
    versionKey: false // You should be aware of the outcome after set to false __V
});

module.exports = mongoose.model('TagLog', TagLogSchema);