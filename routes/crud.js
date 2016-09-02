/**
 * Created by master on 2016-08-08.
 */
/**
 * Created by master on 2016-02-19.
 */
var express = require('express');
var mongoose = require('mongoose');

function crud(options) {

    //{"objname":"advertise",
    // "searchname":"name"}
    var objname = options.objname;
    var searchname = (options["searchname"] == undefined)? ["name"] :
        (Array.isArray(options["searchname"]))? options.searchname :
            [options.searchname];
    //  배열을 강제한다.
    var initurl = '/'+objname+'/list/0/1/';
    var cmd = process.cwd();
    var ModelObj = require(cmd + "/models/"+ objname);
    var popup = "_popup";
    var router = express.Router();

    /* GET home page. */
    router.get(/^(?!api)\/(insert|insert_popup)/, function(req, res, next) {
        var data = {};
        data.uobjid =  req.cookies._id;
        data.uobjnm =  req.cookies.uid;
        data.objname = objname;
        var suf = (req.url.indexOf(popup) >= 0)? popup : "";
        res.render(objname+'/insert' + suf, data);
    });

    //router.get(/\/list_popup\/(.*)\/(.*)\/(.*)|\/list\/(.*)\/(.*)\/(.*)/, function(req, res, next) {
    router.get(/^(?!api)\/(list_popup|list)\/(.*)/, function(req, res, next) {

        var rt = req.params[1];
        var params = rt.split("/");

        console.log(params);

        if(params.length < 2)
            next();

        var pos = params[0];
        params.shift();
        var cur = params[0];
        params.shift();

        var search = params;

        if(cur == undefined)
            cur = 1;
        if(pos == undefined || pos == 0)
            pos = 0;
        //if(search == undefined)
        //    search = "";
        console.log("cur:"+cur);
        console.log("pos:"+pos);
        console.log("search:"+search.length);
        var cursize = 10;
        var possize = 5;
        pos = parseInt(pos);
        cur = parseInt(cur);
        var page = pos * possize + cur;
        var tcnt = 0;
        var where = {};

        for(var i = 0 ; i < search.length ; i++)
        {
            if(search[i] != "")
                where[searchname[i]] = {'$regex':search[i]};
        }

        ModelObj.count(where ,function(err, count){
            tcnt = count;
            console.log("tcnt : " + tcnt);
            console.log("page : " + page);
            ModelObj.find(where)
                .limit(cursize)
                .skip(cursize*(page-1))
                .sort({_id: -1})
                .exec(function(err,docs){
                    //console.log(docs);
                    if(err){
                        res.render('common/error',{'error':'An error has occurred','url':initurl});
                    }else {
                        var suf = (req.url.indexOf(popup) >= 0)? popup : "";
                        res.render(objname+'/list' + suf, {'objname':objname,'cur':cur,'pos':pos, 'cursize':cursize, 'possize':possize,  'tcnt': tcnt, 'data': docs, 'search': search});
                    }
                });
        });
    });

    router.post(/^(?!api)\/list_popup\/(.*)\/(.*)|\/list\/(.*)\/(.*)/, function(req, res, next) {

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

    router.get(/^(?!api)\/(select|select_popup)\/(.*)/, function(req, res, next) {
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

    router.post(/^(?!api)\/(insert|insert_popup)/, function(req, res, next) {
        /*var code = req.body.code;
         var name = req.body.name;
         var frcode = req.body.frcode;*/
        //res.send(req.body);
        var suf = (req.url.indexOf(popup) >= 0)? popup : "";
        //console.log(req.body);
        var json = req.body;
        //Array일경우 단순재조합 로직
        for(var k in json) {
            if(Array.isArray(json[k]))
            {
                var keys = k.split(".");
                if(keys.length == 1)
                    break;
                json[keys[0]] = [];
                for(var j = 0 ; j < json[k].length ; j++)
                {
                    var obj = {};
                    obj[keys[1]] = json[k][j];
                    json[keys[0]].push(obj);
                }
                delete json[k];
            }
            else if(k.indexOf(".") > 0)
            {
                var keys = k.split(".");
                json[keys[0]] = [];
                var obj = {};
                obj[keys[1]] = json[k];
                json[keys[0]].push(obj);
                delete json[k];
            }
        }

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

    router.post(/^(?!api)\/(update|update_popup)/, function(req, res, next) {
        //res.render('station/insert', { title: 'Express' , name:'uiandwe'});
        var suf = (req.url.indexOf(popup) >= 0)? popup : "";
        var json = req.body;
//        var updateObj = new ModelObj(json);
//        var updata = updateObj.toObject();
//        delete updata._id;
        //Array일경우 단순재조합 로직
        for(var k in json) {
            if(Array.isArray(json[k]))
            {
                var keys = k.split(".");
                if(keys.length == 1)
                    break;
                json[keys[0]] = [];
                for(var j = 0 ; j < json[k].length ; j++)
                {
                    var obj = {};
                    obj[keys[1]] = json[k][j];
                    json[keys[0]].push(obj);
                }
                delete json[k];
            }
            else if(k.indexOf(".") > 0)
            {
                var keys = k.split(".");
                json[keys[0]] = [];
                var obj = {};
                obj[keys[1]] = json[k];
                json[keys[0]].push(obj);
                delete json[k];
            }
        }
        var id = json._id;
        delete json._id;
        //ModelObj.update({_id:json._id}, updata, {upsert:true}, function (err) {
        ModelObj.update({_id:id}, json, {upsert:true}, function (err) {
            if(err){
                console.log(err);
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

function remove(router, path, method) {

    if(typeof method == "undefined")
        method = "get";

    //console.log("method : " + method);
    var routes = router.stack;
    for (var i = routes.length - 1; i >= 0; i--) {
        var rpath = routes[i].route.path.toString();
        var mobj = routes[i].route.methods;

        if(typeof mobj[method] == "undefined")
            continue;
        else
        {
            if(mobj[method] == true)
            {
                //console.log("rpath : " + rpath);
                //console.log("rmethod : " + rmethod);
                //console.log("routes[i].path : " + routes[i].route.path);
                //console.log("routes[i].regexp : " + routes[i].regexp);

                if (rpath === path.toString()) {
                    console.log("routes[i].regexp equals : " + routes[i].regexp);
                    routes.splice(i, 1);
                }
            }
        }
    }
}


module.exports.defaultRouter = crud;
module.exports.clearPath = remove;

