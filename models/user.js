/**
 * Created by master on 2016-01-22.
 */
'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    validator = require('validator'),
    SALT_WORK_FACTOR = 10;

var dateFormat = require('dateformat');

var UserSchema = new Schema({
    uid: String,
    passwd: String,
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
    uuid: String,
    telecom: Number,
    os: Number,
    token: String,
    regdate: {type:Date, default:Date.now, get:formatFunction},
    uobjnm: String,
    uobjid: Schema.Types.ObjectId,
    sns: String,
    nick: String
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

UserSchema.pre('update', function(next){
    console.log('before update');
    var model = this;

    /*if(!user.isModified('passwd'))
     {
     console.log('passwd not modified');
     return next();
     }*/
    if(model._update.$set.passwd === undefined)
        return next();

    console.log("model._update.$set.passwd " + model._update.$set.passwd);
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        if(err) return next(err);

        bcrypt.hash(model._update.$set.passwd, salt, function(err, hash){
            if(err) return next(err);
            model._update.$set.passwd = hash;
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

function formatFunction(val)
{
    return dateFormat(val, "yyyy-mm-dd HH:MM:ss");
}

module.exports = mongoose.model('User', UserSchema);
