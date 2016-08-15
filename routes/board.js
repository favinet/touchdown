/**
 * Created by master on 2016-02-26.
 */
/**
 * Created by master on 2016-01-22.
 */
var path = require('path');
var objname = path.basename(__filename, '.js');
var initurl = '/'+objname+'/list/0/1/';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');


var cmd = process.cwd();
var ModelObj = require(cmd + "/models/"+ objname);
var ObjectId = mongoose.Types.ObjectId;

/* GET home page. */
router.get('/insert', function(req, res, next) {
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
router.get('/select/:code', function(req, res, next) {
    var code = req.params.code;
    console.log('Retrieving1 : ' + code);
    ModelObj.find({'_id': code}, function(err, docs) {
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
    for (var key in json) {
        if (json[key] == "")
            delete json[key];
    }

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
    //res.render('/api/list', { cat:'I' , page:1, cnt:20});
    //find saved :
    console.log(req.body);
    var json = req.body;

    var cat =  (json.cat)? json.cat : "N"; //공지사항
    var page = (json.page)? parseInt(json.page) : 1;
    var cnt = (json.cnt)? parseInt(json.cnt) : 10;
    /*
    var tcnt = 0;
    ModelObj.count({cat:cat},
        function(err, count){
            tcnt = count;
            console.log("tcnt : " + tcnt);
        });
    */
    ModelObj.find({cat:cat})
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
});


router.get('/api/top/:cat', function(req, res, next) {
    var cat = req.params.cat;

    ModelObj.findOne({cat:cat.toUpperCase()})
        .sort({_id:-1})
        .exec(function (err,board) {
            if(err){
                var result = {"result":-1,"error":err.toString()};
                res.send(result);
            }else{
                if(board)
                {
                    res.send(board);
                }
                else
                {
                    var result = {"result":-1,"error":"Not Exist"};
                    res.send(result);
                }
            }
        });
});


router.post('/api/insert', function(req, res, next) {
    /*var cat = req.body.cat;
     var kind = req.body.kind;
     var title = req.body.title;
     var email = req.body.email;
     var content = req.body.content;
     var uobj = req.body.uobj;
     */
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
            var result = {"result":1};
            res.send(result);
        }
    });
});

module.exports = router;
