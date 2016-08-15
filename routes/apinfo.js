/**
 * Created by master on 2016-02-19.
 */
var objname = 'apinfo';
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');


var path = process.cwd();
var ApInfoObj = require(path + "/models/"+ objname);
var Station = require(path + "/models/"+ "station");
var ObjectId = mongoose.Types.ObjectId;



router.post('/insert', function(req, res, next) {

    console.log("@@@body===>" + req.body.ssid);
    console.log("@@@body===>" + req.body.mac);
    console.log("@@@body===>" + req.body.fcode);

    var json = req.body;
    var saveObj = new ApInfoObj(json);
    saveObj.save(function (err) {
        if(err){
            var result = {"result":-1,"error":err.toString()};
            res.send(result);
        }else{
            var result = {"result":1};
            res.send(result);
        }
    });
});

router.get('/list', function(req, res, next) {
    ApInfoObj.find({},function(err,docs){
        console.log("docs.length : " + docs.length);
        if(err){
            res.send([]);
        }else {
            res.send(docs);
        }
    });
});

router.post('/exist', function(req, res, next) {


    var json = req.body;
    var mac = json.mac;
    console.log('json==============>' + mac);

    ApInfoObj.find({'mac':{'$in' : mac}}, function (err, docs) {
        console.log(docs);
        if(err){
            res.send(err);
        }else {
            res.send(docs);
        }
    });



});

router.get('/list/:line', function(req, res, next) {

    var line = req.params.line;
    var lineData = [];
    var sData = [];

    //호선 정보로 group by
    ApInfoObj.aggregate([
        {"$group" : {_id:"$line", count:{$sum:1}}},
        {$sort:{"_id":1}}
    ]).exec(function(err, docs){
        console.log("ApInfoObj docs : " + docs);
        if(err){
            res.render('common/error',{'error':'An error has occurred','url':initurl});
        }else {
            lineData = docs;
        }
    });

    //역 정보로 group by
    ApInfoObj.aggregate([
        {"$match" : {line : line}},
        {"$group" : {_id:"$place", count:{$sum:1}}},
        {$sort:{"_id":1}}
    ]).exec(function(err, docs){
        console.log("ApInfoObj Name docs : " + docs);
        if(err){
            res.render('common/error',{'error':'An error has occurred','url':initurl});
        }else {
            sData = docs;
        }
    });


    ApInfoObj.find({'line': line})
        .exec(function(err,docs){
            console.log(docs);
            if(err){
                res.render('common/error',{'error':'An error has occurred','url':initurl});
            }else {
                res.render(objname+'/list', {'objname':objname, 'lineData' : lineData, 'data' : docs, 'sData' : sData});
            }
        });

});

router.get('/list/:line/:subway', function(req, res, next) {

    var line = req.params.line;
    var subway = req.params.subway;
    console.log('line==>' + line);
    console.log('subway==>' + subway);
    var lineData = [];
    var sData = [];

    //호선 정보로 group by
    ApInfoObj.aggregate([
        {"$group" : {_id:"$line", count:{$sum:1}}},
        {$sort:{"_id":1}}
    ]).exec(function(err, docs){
        console.log("ApInfoObj docs : " + docs);
        if(err){
            res.render('common/error',{'error':'An error has occurred','url':initurl});
        }else {
            lineData = docs;
        }
    });

    //역 정보로 group by
    ApInfoObj.aggregate([
        {"$match" : {line : line}},
        {"$group" : {_id:"$place", count:{$sum:1}}},
        {$sort:{"_id":1}}
    ]).exec(function(err, docs){
        console.log("ApInfoObj Name docs : " + docs);
        if(err){
            res.render('common/error',{'error':'An error has occurred','url':initurl});
        }else {
            sData = docs;
        }
    });


    ApInfoObj.find({'line': line, 'place' : subway})
        .exec(function(err,docs){
            console.log('==============>' + docs.length);
            if(err){
                res.render('common/error',{'error':'An error has occurred','url':initurl});
            }else {
                res.render(objname+'/list', {'objname':objname, 'lineData' : lineData, 'data' : docs, 'sData' : sData});
            }
        });

});


var mapJson;

router.post('/map', function(req, res, next) {
    var json = req.body;
    console.log('json==============>' + json.lat);
    mapJson =json;
    res.render(objname+'/map', {'objname':objname, 'mapData' : json, 'mac' : ""});
});

router.get('/select/:mac', function(req, res, next) {
    var mac = req.params.mac;
    console.log('Retrieving1 : ' + mac);
    ApInfoObj.find({'mac': mac}, function(err, docs) {
        console.log(docs);
        if(err){
            res.send([]);
        }else {
            res.send(docs);
        }
    });
    //res.render('station/input', { title: 'Express' , name:'uiandwe'});
});

router.get('/delete/:mac', function(req, res, next) {
    var mac = req.params.mac;

    ApInfoObj.remove({mac:mac}, function (err, docs) {
        console.log(docs);
        if(err){
            res.send([]);
        }else {
            res.send(docs);
        }
    });
});

router.get('/delete/map/:mac', function(req, res, next) {
    var mac = req.params.mac;


    ApInfoObj.remove({mac:mac}, function (err, docs) {
        console.log(docs);
        if(err){
            res.render('common/error',{'error':'An error has occurred','url':initurl});
        }else {
            res.render(objname+'/map', {'objname':objname, 'mapData' : mapJson, 'mac' : mac});
        }
    });
});

router.post('/delete', function(req, res, next) {

    var json = req.body;
    var data = json.data;
    var mac = data.dmac;

    var obj = JSON.parse(data);
    console.log('json==============>' + json);
    console.log('data==============>' + data);
    console.log('mac==============>' + mac);
    console.log('obj==============>' + obj.dmac);


    ApInfoObj.remove({'mac':{'$in' : obj.dmac}}, function (err, docs) {
        console.log(docs);
        if(err){
            res.render('common/error',{'error':'An error has occurred','url':initurl});
        }else {
            res.redirect('/srv/'+objname+'/list/'+obj.linenum);
        }
    });

});



module.exports = router;