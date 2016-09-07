'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BincodeSchema = new Schema({
    binnumber : String,  //카드인식넘버
    cardcode : String,   //카드코드
    company : String,    //카드사
    cardname: String,  //카드이름
    cardkind: String,  //카드종류
    regdate: String    //카드적용일
},{
    versionKey: false // You should be aware of the outcome after set to false __V
});

module.exports = mongoose.model('Bincode', BincodeSchema);