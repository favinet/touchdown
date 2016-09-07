/**
 * Created by master on 2016-08-02.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CardSchema = new Schema({
    excard: {type:String, index:true}, //sha256.hex 보안적용된 카드번호  //shade key
    vcard: String, //카드사 가상카드번호
    useyn: {type:Boolean, default:true},
    regdate: {type:Date, default:Date.now},
    cobjid: {type:Schema.Types.ObjectId, index: true}, //uobj 매핑
    cobjnm: String,
    company: String, //카드사코드 "현대" "삼성"
    point: {type:Number, default:0},
    arexyn: {type:Boolean, default:false}, //공항철도가능여부,
    uobjnm: String,
    uobjid: Schema.Types.ObjectId
},{
    versionKey: false // You should be aware of the outcome after set to false __V
});

module.exports = mongoose.model('Card', CardSchema);
