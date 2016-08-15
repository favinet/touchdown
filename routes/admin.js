/**
 * Created by master on 2016-01-22.
 */
var path = require('path');
var objname = path.basename(__filename, '.js');
var initurl = '/'+objname+'/list/0/1/';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
/*
 mongoose.connect('mongodb://58.180.56.34:27017/touchdown');

 var db = mongoose.connection;
 db.on('error', console.error.bind(console, 'connection error:'));
 db.once('open', function callback () {
 console.log('connection successful...');
 });
 */

var cmd = process.cwd();
var ModelObj = require(cmd + "/models/"+ objname);
var ObjectId = mongoose.Types.ObjectId;

/* GET home page. */
router.get('/insert', function(req, res, next) {
    res.render(objname+'/insert', {'objname':objname});
});

router.get(/\/list\/(.*)\/(.*)\/(.*)/, function(req, res, next) {

    var pos = req.params[0];
    var cur = req.params[1];
    var search = req.params[2];
    if(cur == undefined)
        cur = 1;
    if(pos == undefined || pos == 0)
        pos = 0;
    if(search == undefined)
        search = "";
    console.log("cur:"+cur);
    console.log("pos:"+pos);
    console.log("search:"+search);
    var cursize = 10;
    var possize = 5;
    pos = parseInt(pos);
    cur = parseInt(cur);
    var page = pos * possize + cur;

    var tcnt = 0;
    ModelObj.count({'uid':{'$regex':search}},function(err, count){
        tcnt = count;
        console.log("tcnt : " + tcnt);
        console.log("page : " + page);
        ModelObj.find({'uid':{'$regex':search}})
            .limit(cursize)
            .skip(cursize*(page-1))
            .exec(function(err,docs){
                console.log(docs);
                if(err){
                    res.render('common/error',{'error':'An error has occurred','url':initurl});
                }else {
                    res.render(objname+'/list', {'objname':objname,'cur':cur,'pos':pos, 'cursize':cursize, 'possize':possize,  'tcnt': tcnt, 'data': docs, 'search': search});
                }
            });
    });

});

router.post(/\/list\/(.*)\/(.*)/, function(req, res, next) {

    var pos = req.params[0];
    var cur = req.params[1];

    if(cur == undefined)
        cur = 1;
    if(pos == undefined || pos == 0)
        pos = 0;

    var json = req.body;
    var search = (json.search == undefined)? "*" : json.search;

    console.log("cur:"+cur);
    console.log("pos:"+pos);
    console.log("search:"+search);
    var cursize = 10;
    var possize = 5;
    pos = parseInt(pos);
    cur = parseInt(cur);
    var page = pos * possize + cur;

    var tcnt = 0;
    ModelObj.count({'uid':{'$regex':search}},function(err, count){
        tcnt = count;
        console.log("tcnt : " + tcnt);
        console.log("page : " + page);
        ModelObj.find({'uid':{'$regex':search}})
            .limit(cursize)
            .skip(cursize*(page-1))
            .exec(function(err,docs){
                console.log(docs);
                if(err){
                    res.render('common/error',{'error':'An error has occurred','url':initurl});
                }else {
                    res.render(objname+'/list', {'objname':objname,'cur':cur,'pos':pos, 'cursize':cursize, 'possize':possize,  'tcnt': tcnt, 'data': docs, 'search': search});
                }
            });
    });

});

router.get('/select/:code', function(req, res, next) {
    var code = req.params.code;
    console.log('Retrieving1 : ' + code);
    ModelObj.find({'uid': code}, function(err, docs) {
        console.log(docs);
        if(err){
            res.render('common/error',{'error':'An error has occurred','url':'/'+objname+'/insert'});
        }else{
            docs[0]["objname"] = objname;
            res.render(objname+'/update', docs[0]);
        }
    });
    //res.render('station/input', { title: 'Express' , name:'uiandwe'});
});
router.post('/insert', function(req, res, next) {
    /*var code = req.body.code;
     var name = req.body.name;
     var frcode = req.body.frcode;*/
    //res.send(req.body);
    console.log(req.body);
    var json = req.body;
    var saveObj = new ModelObj(json);
    saveObj.save(function (err) {
        if(err){
            console.log(err);
            res.render('common/error',{'error':'An error has occurred','url':initurl});
        }else{
            res.redirect('/srv/'+objname+'/list/0/1/');
        }
    });
});

router.post('/update', function(req, res, next) {
    //res.render('station/insert', { title: 'Express' , name:'uiandwe'});
    var json = req.body;
    var updateObj = new ModelObj(json);
    var updata = updateObj.toObject();
    delete updata._id;

    ModelObj.update({_id:json._id}, updata, {upsert:true}, function (err) {
        if(err){
            res.render('common/error',{'error':'An error has occurred','url':initurl});
        }else{
            res.redirect('/srv/'+objname+'/list/0/1/');
        }
    });
});

router.get('/delete/:id', function(req, res, next) {
    var id = req.params.id;

    ModelObj.remove({_id:id}, function (err) {
        if(err){
            res.render('common/error',{'error':'An error has occurred','url':initurl});
        }else{
            res.redirect('/srv/'+objname+'/list/0/1/');
        }
    });
});

router.get('/login', function(req, res, next) {
    console.log(req.useragent.os);
    if(req.useragent.isMobile)
        console.log("This is Mobile !!!");
    else
        console.log("This is Not Mobile !!!");

    res.render('common/login',{});
});

router.post('/login', function(req, res, next) {
    var json = req.body;

    ModelObj.findOne({uid:json.uid},function(err,user){

        user.comparePassword(json.passwd, function(err, isMatch){
            if(err)
            {
                res.render('common/error',{'error':'An error has occurred','url':'/user/login'});
            }
            else
            {
                if(isMatch)
                {
                    res.cookie('uid',user.uid,{ expires: new Date(Date.now() + 900000), httpOnly: true });
                    res.cookie('level',user.level,{ expires: new Date(Date.now() + 900000), httpOnly: true });
                    res.cookie('_id',user._id,{ expires: new Date(Date.now() + 900000), httpOnly: true });
                    res.redirect('/srv/'+objname+'/list/0/1/');
                }
                else
                {
                    res.render('common/error',{'error':'Password Miss Match','url':'/user/login'});
                }

            }
        });

    });
});

router.get('/logout', function(req, res, next) {
    res.clearCookie('uid');
    res.clearCookie('level');
    res.clearCookie('_id');
    res.redirect('/srv/'+objname+'/login');
});

router.get('/api/exist/:uid', function(req, res, next) {
    var uid = req.params.uid;

    ModelObj.findOne({uid:uid}, function (err,user) {
        if(err){
            var result = {"result":-1,"error":err.toString()};
            res.send(result);
        }else{
            if(user)
            {
                var result = {"result":1};
                res.send(result);
            }
            else
            {
                var result = {"result":-1,"error":"Not Exist"};
                res.send(result);
            }
        }
    });
});


router.post('/api/find/uid', function(req, res, next) {
    var json = req.body;

    ModelObj.findOne({email:json.email},function(err,user){

        if(user)
        {
            var result = {"result":1,"msg":"send complete user id to written email","error":""};
            res.send(result);
        }
        else
        {
            var result = {"result":-1,"msg":"this email is not registered","error":""};
            res.send(result);
        }
    });
});

router.post('/api/find/passwd', function(req, res, next) {
    var json = req.body;

    ModelObj.findOne({uid:json.uid},function(err,user){

        if(user)
        {
            var result = {"result":1,"msg":"completed to send email to your registered email for authorization account","error":""};
            res.send(result);
        }
        else
        {
            var result = {"result":-1,"msg":"this uid is not registered","error":""};
            res.send(result);
        }
    });
});

router.post('/api/login', function(req, res, next) {
    var json = req.body;

    ModelObj.findOne({uid:json.uid},function(err,user){

        if(user)
        {
            user.comparePassword(json.passwd, function(err, isMatch){
                if(err)
                {
                    var result = {"result":-1,"error":err.toString()};
                    res.send(result);
                }
                else
                {
                    if(isMatch)
                    {
                        var result = {"result":1,"user":user};
                        res.send(result);
                    }
                    else
                    {
                        var result = {"result":-1,"error":"passwd not matched"};
                        res.send(result);
                    }

                }
            });
        }
        else
        {
            if(err)
            {
                var result = {"result":-1,"error":err.toString()};
                res.send(result);
            }
            else
            {
                var result = {"result":-1,"error":"id not found"};
                res.send(result);
            }
        }
    });
});

router.post('/api/insert', function(req, res, next) {
    /*var code = req.body.code;
     var name = req.body.name;
     var frcode = req.body.frcode;*/
    //res.send(req.body);
    console.log(req.body);
    var json = req.body;
    var saveObj = new ModelObj(json);
    saveObj.save(function (err) {
        if(err){
            console.log(err);
            var result = {"result":-1,"error":err.toString()};
            res.send(result);
        }else{
            ModelObj.findOne({uid:json.uid},function(err1,user){
                var result = {"result":1};
                if(err1)
                    result["result"] = -1;
                else
                    result["user"] = user;
                res.send(result);
            });
        }
    });
});

router.post('/api/update', function(req, res, next) {
    //res.render('station/insert', { title: 'Express' , name:'uiandwe'});
    var json = req.body;
    var _id = json._id;
    delete json._id;
    //var updateObj = new ModelObj(json);
    //var updata = updateObj.toObject();
    //delete updata._id;

    ModelObj.update({_id:_id},{$set : json}, { upsert:false }, function (err) {
        if(err){
            var result = {"result":-1,"error":err.toString()};
            res.send(result);
        }else{
            var result = {"result":1};
            res.send(result);
        }
    });
});

router.post('/api/update/passwd', function(req, res, next) {
    //res.render('station/insert', { title: 'Express' , name:'uiandwe'});
    var json = req.body;
    var uid = json.uid;

    ModelObj.findOne({uid:uid}, function (err,user)
    {
        if(err)
        {
            var result = {"result":-1,"error":err.toString()};
            res.send(result);
        }
        else
        {
            if(user)
            {
                user.comparePassword(json.opasswd, function(err, isMatch){
                    if(err)
                    {
                        var result = {"result":-1,"error":err.toString()};
                        res.send(result);
                    }
                    else
                    {
                        if(isMatch)
                        {
                            user.passwd = json.npasswd;
                            user.save(function(err){
                                if(err)
                                {
                                    var result = {"result":-1,"error":err.toString()};
                                    res.send(result);
                                }
                                else
                                {
                                    var result = {"result":1};
                                    res.send(result);
                                }
                            });
                        }
                        else
                        {
                            var result = {"result":-1,"error":"비밀번호가 일치하지 않습니다."};
                            res.send(result);
                        }
                    }
                });
            }
            else
            {
                var result = {"result":-1,"error":"사용자가 없습니다."};
                res.send(result);
            }
        }
    });
});


router.post('/api/bye', function(req, res, next) {
    //res.render('/api/bye', { _id: '' , uid:''});
    var json = req.body;
    if(json._id && json.uid)
    {
        var bye = {byeyn:true, byedate:new Date()};
        ModelObj.update({_id:json._id, uid:json.uid}, {$set:bye}, {upsert:false}, function (err) {
            if(err){
                var result = {"result":-1,"error":err.toString()};
                res.send(result);
            }else{
                var result = {"result":1};
                res.send(result);
            }
        });
    }
    else
    {
        var result = {"result":-1,"error":"inform is required"};
        res.send(result);
    }
});


module.exports = router;
