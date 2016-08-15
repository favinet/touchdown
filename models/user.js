/**
 * Created by master on 2016-01-22.
 */
'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    validator = require('validator'),
    SALT_WORK_FACTOR = 10;



var UserSchema = new Schema({
    uid: String,
    passwd: String,
    email: {type:String,
        trim: true,
        unique: true,
        required: 'Email address is required',
        validate:[validator.isEmail,'invalid email']},
    company: String,
    card: String,
    area: String,
    year: {type:Number, min:1910, max:2016},
    sex: {type:String, default:'M'},
    saving: {type:Number, default:0},
    used: {type:Number, default:0},
    startst: String,
    endst: String,
    pushyn: {type:Boolean, default:true},
    adyn: {type:Boolean, default:true},
    byeyn: {type:Boolean, default:false},
    byedate: Date,
    hidate: {type:Date, default:Date.now},
    advid: String,
    devid: String,
    telecom: String,
    os: String,
    level: {type:Number, default:0}
},{
    versionKey: false // You should be aware of the outcome after set to false __V
});

UserSchema.pre('save', function(next){
    console.log('before save');
    var user = this;
    if(!user.isModified('passwd'))
        return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        if(err) return next(err);

        bcrypt.hash(user.passwd, salt, function(err, hash){
            if(err) return next(err);
            user.passwd = hash;
            next();
        });
    });

});


UserSchema.methods.comparePassword = function(candidatePassword, cb)
{
    bcrypt.compare(candidatePassword, this.passwd, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);
