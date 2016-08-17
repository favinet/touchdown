/**
 * Created by master on 2016-08-08.
 */
/**
 * Created by master on 2016-02-19.
 */
var express = require('express');
var mongoose = require('mongoose');
var app = express();
function crud(options) {

    //{"objname":"advertise",
    // "searchname":"name"}
    var objname = options.objname;
    var searchname = (options["searchname"] == undefined)? "name" : options.searchname;

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
        var where = {};
        where[searchname] = {'$regex':search};
        ModelObj.count(where ,function(err, count){
            tcnt = count;
            console.log("tcnt : " + tcnt);
            console.log("page : " + page);
            ModelObj.find(where)
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
        var where = {};
        where[searchname] = {'$regex':search};
        ModelObj.count(where ,function(err, count){
            tcnt = count;
            console.log("tcnt : " + tcnt);
            console.log("page : " + page);
            ModelObj.find(where)
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
        if(req.params[1] == "")
        {
            next(); //내부호출있어 넘긴다.
        }
        else
        {
            console.log('URL : ' + req.url);
            var suf = (req.url.indexOf(popup) >= 0)? popup : "";
            var id = req.params[1];

            console.log('Retrieving1 : ' + id);
            ModelObj.findOne({_id:id}, function(err, doc) {
                console.log(doc);
                console.log("objname : "+ objname );

                doc.objname = objname;
                doc.uobjid = req.cookies._id;
                doc.uobjnm = req.cookies.uid;
                if(err){
                    res.render('common/error',{'error':'An error has occurred','url':'/'+objname+'/insert'+suf});
                }else{
                    res.render(objname+'/update'+suf, doc);
                }
            });
        }
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
/*
    routes = router.stack;
    var rout = routes[0];
    for(var i in rout)
        console.log(i + ":" + rout[i]);
*/
    return router;
};

function remove(router, path) {

    var routes = router.stack;
    for (var i = routes.length - 1; i >= 0; i--) {
        var rpath = routes[i].route.path.toString();
        ///console.log("routes[i].path : " + routes[i].route.path);
        //console.log("routes[i].regexp : " + routes[i].regexp);
        if (rpath === path.toString()) {
            console.log("routes[i].regexp equals : " + routes[i].regexp);
            routes.splice(i, 1);
        }
    }

}


module.exports.defaultRouter = crud;
module.exports.clearPath = remove;

