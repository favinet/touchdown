/**
 * Created by master on 2016-02-26.
 */
/**
 * Created by master on 2016-01-22.
 */
var objname = 'version',
    initurl = '/'+objname+'/list/0/1/';

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

//rsmq test
var axon = require('axon');
var sock = axon.socket('req');

sock.bind(7777,'localhost');

var path = process.cwd();
var ModelObj = require(path + "/models/"+ objname);
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
    ModelObj.count({'cat':{'$regex':search}},function(err, count){
        tcnt = count;
        console.log("tcnt : " + tcnt);
        console.log("page : " + page);
        ModelObj.find({'cat':{'$regex':search}})
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

            sock.send("nikimi !!!", function(res){
                console.log("response : " + res);
            });

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


router.get('/api/all', function(req, res, next) {

    ModelObj.aggregate([
        {$group:{_id:"$cat", version:{$max:"$version"}}}
    ],function(err,results ){
        if(err)
        {
            var result = {"result":-1,"error":err.toString()};
            res.send(result);
        }
        else
        {
            res.send(results);
        }
    });

});




module.exports = router;
