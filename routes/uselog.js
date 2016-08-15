/**
 * Created by master on 2016-02-19.
 */
var objname = 'uselog',
    initurl = '/'+objname+'/list/0/1/';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var moment = require('moment');
/*
mongoose.connect('mongodb://58.180.56.34:27017/touchdown');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log('connection successful...');
});
*/
var path = process.cwd();
var ModelObj = require(path + "/models/"+ objname);
var ObjectId = mongoose.Types.ObjectId;

var MobelUser = require(path + "/models/user");
var MobelAdvertise = require(path + "/models/advertise");

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
    ModelObj.count({},function(err, count){
        tcnt = count;
        console.log("tcnt : " + tcnt);
        console.log("page : " + page);
        ModelObj.find({})
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
    ModelObj.find({'_id': new ObjectId(code)}, function(err, docs) {
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

    ModelObj.findOne({uobj:json.uobj})
        .sort({ regdate: -1 })
        .exec(function(err,log){
            if(err)
            {
                console.log(err);
                res.render('common/error',{'error':err.toString(),'url':initurl});
            }
            else
            {
                var nsaved = (log)? log.saved + parseInt(json.saving) : parseInt(json.saving);
                json.saved = nsaved;
                var saveObj = new ModelObj(json);
                saveObj.save(function (err) {
                    if(err){
                        console.log(err);
                        console.log(err);
                        res.render('common/error',{'error':err.toString(),'url':initurl});
                    }else{
                        res.redirect('/srv/'+objname+'/list/0/1/');
                    }
                });
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

router.post('/api/transaction', function(req, res, next) {
    //res.render('/api/transactions', { uobj: 'Express' , aobj:'uiandwe', saving:'100'});
    //find saved :
    console.log(req.body);
    var json = req.body;

    ModelObj.findOne({uobj:json.uobj, aobj:json.aobj, saving:{$gt:0} },function (err,log){
        if(err)
        {
            var result = {"result":-1,"error":err.toString()};
            res.send(result);
        }
        else
        {
            if(log)
            {
                var result = {"result":-1,"error":"you're already participated"};
                res.send(result);
            }
            else
            {
                ModelObj.findOne({uobj:json.uobj})
                    .sort({ regdate: -1 })
                    .exec(function(err,log){
                        if(err)
                        {
                            var result = {"result":-1,"error":err.toString()};
                            res.send(result);
                        }
                        else
                        {
                            var nsaved = (log)? log.saved + parseInt(json.saving) : parseInt(json.saving);
                            json.saved = nsaved;
                            var saveObj = new ModelObj(json);
                            saveObj.save(function (err) {
                                if(err){
                                    console.log(err);
                                    var result = {"result":-1,"error":err.toString()};
                                    res.send(result);
                                }else{
                                    var data = (nsaved >= 0)? {saving:nsaved} : {used:nsaved};
                                    MobelUser.update({_id:json.uobj},{$set : data}, { upsert:false }, function (err) {
                                        if(err){
                                            var result = {"result":-1,"error":err.toString()};
                                            res.send(result);
                                        }else{
                                            var result = {"result":1};
                                            res.send(result);
                                        }
                                    });
                                }
                            });
                        }
                    });
            }
        }
    });
});


router.post('/api/saving/list', function(req, res, next) {
    //res.render('/api/transactions', { uobj: '56ab46bd7160d9955ae0c5c9' , sdate:'2016-10-26', edate:'2016-10-30', page:1, cnt:20});
    //find saved :
    console.log(req.body);
    var json = req.body;

    var sdate = moment(json.sdate,"YYYY-MM-DD").toDate();; //.format('YYYY-MM-DD HH:mm:ss'); //GMT
    var edate = moment(json.edate,"YYYY-MM-DD").add(1,"days").toDate(); //.format('YYYY-MM-DD HH:mm:ss'); //GMT

    var c1 = moment(json.sdate,"YYYY-MM-DD").add(-9,'hours').format('YYYY-MM-DD HH:mm:ss');//Z기준
    var c2 = moment(json.edate,"YYYY-MM-DD").add(15,"hours").format('YYYY-MM-DD HH:mm:ss');//Z기준

    console.log("sdate:"+ c1);
    console.log("edate:"+ c2);

    var page = (json.page)? parseInt(json.page) : 1;
    var cnt = (json.cnt)? parseInt(json.cnt) : 10;

    /*var tcnt = 0;
    ModelObj.count({uobj:new ObjectId(json.uobj),
            aobj:{$gt:new ObjectId('56c6da2384a6d54c2f7255c7')},
            regdate:{$gte:sdate,$lt:edate}},
        function(err, count){
            tcnt = count;
            console.log("tcnt : " + tcnt);
        });
    */
    ModelObj.aggregate([
        {$match:{uobj:new ObjectId(json.uobj),
            aobj:{$gt:new ObjectId('56c6da2384a6d54c2f7255c7')},
            regdate:{$gte:sdate,$lt:edate}}},
        {$lookup:{from:"advertises",localField:"aobj",foreignField:"_id",as:"adv"}},
        {$sort:{regdate:-1}},
        {$skip:(page-1) * cnt},
        {$limit:cnt}
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

router.post('/api/using/list', function(req, res, next) {
    //res.render('/api/transactions', { uobj: '56ab46bd7160d9955ae0c5c9' , sdate:'2016-10-26', edate:'2016-10-30', page:1, cnt:20});
    //find saved :
    console.log(req.body);
    var json = req.body;

    var sdate = moment(json.sdate,"YYYY-MM-DD").toDate();; //.format('YYYY-MM-DD HH:mm:ss'); //GMT
    var edate = moment(json.edate,"YYYY-MM-DD").add(1,"days").toDate(); //.format('YYYY-MM-DD HH:mm:ss'); //GMT

    var c1 = moment(json.sdate,"YYYY-MM-DD").add(-9,'hours').format('YYYY-MM-DD HH:mm:ss');//Z기준
    var c2 = moment(json.edate,"YYYY-MM-DD").add(15,"hours").format('YYYY-MM-DD HH:mm:ss');//Z기준

    console.log("sdate:"+ c1);
    console.log("edate:"+ c2);

    var page = (json.page)? parseInt(json.page) : 1;
    var cnt = (json.cnt)? parseInt(json.cnt) : 10;

    /*var tcnt = 0;
    ModelObj.count({uobj:new ObjectId(json.uobj),
            aobj:new ObjectId('56c6da2384a6d54c2f7255c7'),
            regdate:{$gte:sdate,$lt:edate}},
        function(err, count){
            tcnt = count;
            console.log("tcnt : " + tcnt);
        });
    */
    ModelObj.aggregate([
        {$match:{uobj:new ObjectId(json.uobj),
            aobj:new ObjectId('56c6da2384a6d54c2f7255c7'),
            regdate:{$gte:sdate,$lt:edate}}},
        {$lookup:{from:"advertises",localField:"aobj",foreignField:"_id",as:"adv"}},
        {$sort:{regdate:-1}},
        {$skip:(page-1) * cnt},
        {$limit:cnt}
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