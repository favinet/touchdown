/**
 * Created by master on 2016-08-08.
 */
/**
 * Created by master on 2016-02-19.
 */
var express = require('express');
var mongoose = require('mongoose');

function crud(objname) {

    var initurl = '/'+objname+'/list/0/1/';
    var cmd = process.cwd();
    var ModelObj = require(cmd + "/models/"+ objname);
    var popup = "_popup";
    var router = express.Router();

    /* GET home page. */
    router.get(/\/(insert|insert_popup)/, function(req, res, next) {
        var data = {};
        data.uobjid =  req.cookies._id;
        data.uobjnm =  req.cookies.uid;
        data.objname = objname;
        var suf = (req.url.indexOf(popup) >= 0)? popup : "";
        res.render(objname+'/insert' + suf, data);
    });

    router.get(/\/list_popup\/(.*)\/(.*)\/(.*)|\/list\/(.*)\/(.*)\/(.*)/, function(req, res, next) {

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
        ModelObj.count({'name':{'$regex':search}},function(err, count){
            tcnt = count;
            console.log("tcnt : " + tcnt);
            console.log("page : " + page);
            ModelObj.find({'name':{'$regex':search}})
                .limit(cursize)
                .skip(cursize*(page-1))
                .exec(function(err,docs){
                    console.log(docs);
                    if(err){
                        res.render('common/error',{'error':'An error has occurred','url':initurl});
                    }else {
                        var suf = (req.url.indexOf(popup) >= 0)? popup : "";
                        res.render(objname+'/list' + suf, {'objname':objname,'cur':cur,'pos':pos, 'cursize':cursize, 'possize':possize,  'tcnt': tcnt, 'data': docs, 'search': search});
                    }
                });
        });
    });

    router.post(/\/list_popup\/(.*)\/(.*)|\/list\/(.*)\/(.*)/, function(req, res, next) {

        var pos = req.params[0];
        var cur = req.params[1];
        var search = req.params[2];
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
        ModelObj.count({'name':{'$regex':search}},function(err, count){
            tcnt = count;
            console.log("tcnt : " + tcnt);
            console.log("page : " + page);
            ModelObj.find({'name':{'$regex':search}})
                .limit(cursize)
                .skip(cursize*(page-1))
                .exec(function(err,docs){
                    console.log(docs);
                    if(err){
                        res.render('common/error',{'error':'An error has occurred','url':initurl});
                    }else {
                        var suf = (req.url.indexOf(popup) >= 0)? popup : "";
                        res.render(objname+'/list' + suf, {'objname':objname,'cur':cur,'pos':pos, 'cursize':cursize, 'possize':possize,  'tcnt': tcnt, 'data': docs, 'search': search});
                    }
                });
        });
    });

    router.get(/\/(select|select_popup)\/(.*)/, function(req, res, next) {
        var suf = (req.url.indexOf(popup) >= 0)? popup : "";
        var id = req.params[1];
        console.log('Retrieving1 : ' + id);
        ModelObj.findOne({_id:id}, function(err, doc) {
            console.log(doc);
            doc.objname = objname;
            doc.uobjid = req.cookies._id;
            doc.uobjnm = req.cookies.uid;
            if(err){
                res.render('common/error',{'error':'An error has occurred','url':'/'+objname+'/insert'+suf});
            }else{
                res.render(objname+'/update'+suf, doc);
            }
        });
        //res.render('station/input', { title: 'Express' , name:'uiandwe'});
    });

    router.post(/\/(insert|insert_popup)/, function(req, res, next) {
        /*var code = req.body.code;
         var name = req.body.name;
         var frcode = req.body.frcode;*/
        //res.send(req.body);
        var suf = (req.url.indexOf(popup) >= 0)? popup : "";
        console.log(req.body);
        var json = req.body;
        var saveObj = new ModelObj(json);
        saveObj.save(function (err) {
            if(err){
                console.log(err);
                res.render('common/error',{'error':'An error has occurred','url':initurl});
            }else{
                res.redirect('/srv/'+objname+'/list'+suf+'/0/1/');
            }
        });
    });

    router.post(/\/(update|update_popup)/, function(req, res, next) {
        //res.render('station/insert', { title: 'Express' , name:'uiandwe'});
        var suf = (req.url.indexOf(popup) >= 0)? popup : "";
        var json = req.body;
        var updateObj = new ModelObj(json);
        var updata = updateObj.toObject();
        delete updata._id;

        ModelObj.update({_id:json._id}, updata, {upsert:true}, function (err) {
            if(err){
                res.render('common/error',{'error':'An error has occurred','url':initurl});
            }else{
                res.redirect('/srv/'+objname+'/list'+suf+'/0/1/');
            }
        });
    });

    router.get(/\/(delete|delete_popup)\/(.*)/, function(req, res, next) {
        var suf = (req.url.indexOf(popup) >= 0)? popup : "";
        var id = req.params[1];
        ModelObj.remove({_id:id}, function (err) {
            if(err){
                res.render('common/error',{'error':'An error has occurred','url':initurl});
            }else{
                res.redirect('/srv/'+objname+'/list'+suf+'/0/1/');
            }
        });
    });

    return router;
};

function remove(path) {

    for (var i = express.routes.get.length - 1; i >= 0; i--) {
        if (express.routes.get[i].path === "/" + path) {
            express.routes.get.splice(i, 1);
        }
    }

}


module.exports.defaultRouter = crud;
module.exports.clearPath = remove;

