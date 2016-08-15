/**
 * Created by master on 2016-01-22.
 */
var objname = 'station',
    initurl = '/'+objname+'/list/0/1/';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');


var path = process.cwd();
var Station = require(path + "/models/"+ objname);


/* GET home page. */
router.get('/insert', function(req, res, next) {
    res.render(objname+'/insert', {});
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
    Station.count({'STATION_NM':{'$regex':search}},function(err, count){
        tcnt = count;
        console.log("tcnt : " + tcnt);
        console.log("page : " + page);
        Station.find({'STATION_NM':{'$regex':search}})
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
    Station.find({'STATION_CD': code}, function(err, docs) {
        console.log(docs);
        if(err){
            res.render('common/error',{'error':'An error has occurred','url':'/'+objname+'/insert'});
        }else{
            /*if(docs[0].lat == undefined)
                docs[0].lat = 0;
            if(docs[0].lon == undefined)
                docs[0].lon = 0;
            if(docs[0].gx == undefined)
                docs[0].gx = 0;
            if(docs[0].gy == undefined)
                docs[0].gy = 0;*/
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
    var json = req.body;
    var station = new Station(json);
    station.save(function (err) {
        if(err){
            res.render('common/error',{'error':'An error has occurred','url':initurl});
        }else{
            res.redirect('/srv/'+objname+'/list/0/1/');
        }
    });
});
router.post('/update', function(req, res, next) {
    //res.render('station/insert', { title: 'Express' , name:'uiandwe'});
    var json = req.body;
    var station = new Station(json);
    var updata = station.toObject();
    delete updata._id;

    Station.update({_id:json._id}, updata, {upsert:true}, function (err) {
        if(err){
            res.render('common/error',{'error':'An error has occurred','url':initurl});
        }else{
            res.redirect('/srv/'+objname+'/list/0/1/');
        }
    });
});

router.get('/delete/:id', function(req, res, next) {
    var id = req.params.id;

    Station.remove({_id:id}, function (err) {
        if(err){
            res.render('common/error',{'error':'An error has occurred','url':initurl});
        }else{
            res.redirect('/srv/'+objname+'/list/0/1/');
        }
    });
});

router.get('/api', function(req, res, next) {
    Station.find({},function(err,docs){
        console.log("docs.length : " + docs.length);
        if(err){
            res.send([]);
        }else {
            res.send(docs);
        }
    });
});

module.exports = router;
