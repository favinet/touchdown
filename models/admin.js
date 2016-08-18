/**
 * Created by master on 2016-08-15.
 */
/**
 * Created by master on 2016-08-15.
 */
'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    validator = require('validator'),
    SALT_WORK_FACTOR = 10;

var dateFormat = require('dateformat');

var AdminSchema = new Schema({
    uid: String,
    passwd: String,
    companycode: {type:Number},
    company: String,
    worker: String,
    tel: String,
    phone : String,
    email: {type:String,
        trim: true,
        unique: true,
        required: 'Email address is required',
        validate:[validator.isEmail,'invalid email']},
    fax : String,
    level: {type:Number, default:1},
    useyn: {type:Boolean, default:false},
    regdate: {type:Date, default:Date.now, get:formatFunction},
    errdate: {type:Date, default:Date.now, get:formatFunction},
    failcnt: {type:Number, default:0, min:0, max:5},
    uobjnm: String,
    uobjid: Schema.Types.ObjectId
},{
    versionKey: false // You should be aware of the outcome after set to false __V
});


AdminSchema.pre('save', function(next){
    console.log('before save');
    var user = this;
    if(!user.isModified('passwd'))
    {
        console.log('passwd not modified');
        return next();
    }

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        if(err) return next(err);

        bcrypt.hash(user.passwd, salt, function(err, hash){
            if(err) return next(err);
            user.passwd = hash;
            next();
        });
    });

});

AdminSchema.pre('update', function(next){
    console.log('before update');
    var model = this;

    /*if(!user.isModified('passwd'))
    {
        console.log('passwd not modified');
        return next();
    }*/

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

AdminSchema.methods.comparePassword = function(candidatePassword, cb)
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

module.exports = mongoose.model('Admin', AdminSchema);
