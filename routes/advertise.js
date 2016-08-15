/**
 * Created by master on 2016-02-19.
 */
var path = require('path');
var objname = path.basename(__filename, '.js');
var initurl = '/'+objname+'/list/0/1/';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Random = require("random-js");

var cmd = process.cwd();
var ModelObj = require(cmd + "/models/"+ objname);
var ObjectId = mongoose.Types.ObjectId;

var ModelUselog = require(cmd + "/models/uselog");
/* GET home page. */
router.get('/insert', function(req, res, next) {

    var r = new Random();
    var excode = r.string(10);
    req.cookies.excode = excode;
    res.render(objname+'/insert', req.cookies);
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
    ModelObj.count({'title':{'$regex':search}},function(err, count){
        tcnt = count;
        console.log("tcnt : " + tcnt);
        console.log("page : " + page);
        ModelObj.find({'title':{'$regex':search}})
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
    ModelObj.count({'title':{'$regex':search}},function(err, count){
        tcnt = count;
        console.log("tcnt : " + tcnt);
        console.log("page : " + page);
        ModelObj.find({'title':{'$regex':search}})
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

router.get('/select/:id', function(req, res, next) {
    var id = req.params.id;
    console.log('Retrieving1 : ' + id);
    ModelObj.find({'_id':id}, function(err, docs) {
        console.log(docs);
        if(err){
            res.render('common/error',{'error':'An error has occurred','url':'/'+objname+'/insert'});
        }else{
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


router.post('/api/list', function(req, res, next) {
    //res.render('/api/list', { showyn:'true' ,plat:'ANDROID', page:1, cnt:20, uid:});
    //find saved :
    console.log(req.body);
    var json = req.body;

    var showyn =  (json.showyn)? json.showyn : true;
    var plat =  (json.plat)? json.plat : "ANDROID";
    var page = (json.page)? parseInt(json.page) : 1;
    var cnt = (json.cnt)? parseInt(json.cnt) : 10;
    var _id = (json._id)? json._id : "";

    ModelUselog.find({uobj:_id},function(err,results){
        if(err)
        {
            var result = {"result":-1,"error":err.toString()};
            res.send(result);
        }
        else
        {
            var wheres = results.map(function(u){return u.aobj;});

            ModelObj.find({showyn:showyn,plat:plat,_id:{$nin:wheres}})
                .$where('this.advcnt > this.usecnt')
                .limit(cnt)
                .skip(cnt*(page-1))
                .exec(function(err,docs){
                    console.log(docs);
                    if(err){
                        var result = {"result":-1,"error":err.toString()};
                        res.send(result);
                    }else {
                        res.send(docs);
                    }
                });
        }
    });
    /*
    var tcnt = 0;
    ModelObj.count({showyn:showyn,plat:plat},
        function(err, count){
            tcnt = count;
            console.log("tcnt : " + tcnt);
        });
    */

});

router.post('/api/select/:code', function(req, res, next) {
    var code = req.params.code;
    /*
    var showyn =  (json.showyn)? json.showyn : "Y";
    var plat =  (json.plat)? json.plat : "ANDROID";
    var page = (json.page)? parseInt(json.page) : 1;
    var cnt = (json.cnt)? parseInt(json.cnt) : 10;
    */
    ModelObj.findOne({_id:new ObjectId(code)},
        function(err, adv){
            if(err){
                var result = {"result":-1,"error":err.toString()};
                res.send(result);
            }else {
                res.send(adv);
            }
        });
});

router.get('/api/usable/:code', function(req, res, next) {
    var _id = req.params.code;
    var plat =  "ANDROID"; //req.useragent.os.toUpperCase(); (json.plat)? json.plat : "ANDROID";
    console.log(plat);
    // count advertise exclude using
     console.log('_id : ' + _id);
     ModelUselog.find({uobj:_id},function(err,results){
         if(err)
         {
             var result = {"result":-1,"error":err.toString()};
             res.send(result);
         }
         else
         {
             var wheres = results.map(function(u){return u.aobj;});
             ModelObj.count({showyn:true,plat:plat,_id:{$nin:wheres}})
                 .$where('this.advcnt > this.usecnt')
                 .exec(function(err,count){
                     if(err)
                     {
                         var result = {"result":-1,"error":err.toString()};
                         res.send(result);
                     }
                     else
                     {
                         var result = {"result":count};
                         res.send(result);
                     }
                 });
         }
     });
});

module.exports = router;