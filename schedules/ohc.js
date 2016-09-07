/**
 * Created by master on 2016-08-25.
 */
var OHCMID = "touchdown";
var CRON_PATTERN = "00 * * * * *";
var request = require('request');
var async = require('async');
var cmd = process.cwd();
var ModelObj = require(cmd + "/models/advertise");
var RepObj = require(cmd + "/models/representative");

var tick = function()
{
    async.waterfall([
        function(callback) {

            RepObj.findOne({name:"OHC"}, function(err, rep){
                if(err)
                {
                    var error = {file: __filename, code: -1001, description: err.toString()};
                    callback(err);
                }
                else
                {
                    if(rep)
                    {
                        callback(null,rep);
                    }
                    else
                    {
                        var error = {file: __filename, code: -1008, description: "rep code is not found"};
                        callback(error);
                    }
                }
            });

        },
        function(rep, callback) {

            var uri = "http://w6.ohpoint.co.kr/charge/banner/offerList.do?mId=" + OHCMID;
            request(uri, function (err, response, body) {
                if (!error && response.statusCode == 200) {

                        var json = JSON.parse(body);
                        callback(null,json,rep);
                }
                else
                {
                    if(err)
                    {
                        var error = {file: __filename, code: -1001, description: err.toString()};
                        callback(error);
                    }
                    else
                    {
                        var error = {file: __filename, code: -1002, description: "http error " + response.statusCode};
                        callback(error);
                    }
                }
            });


        },
        function(json, rep, callback) {

            try{

                var cnt = json.adcount;
                var list = json.list;

                console.log("cnt : " + cnt);
                console.log("list : " + list.length);
                console.log("representativeid : " + rep._id);
                console.log("representativenm : " + rep.name);

                async.each(list, function(ohcad, callback) {

                    // Perform operation on file here.
                    ModelObj.findOne({excode:ohcad.eId},
                        function(err, adv){
                            if(err){
                                var error = {file: __filename, code: -1001, description: err.toString()};
                                callback(error);
                            }else {
                                if(adv == null)
                                {
                                    //console.log(ohcad);

                                    ohcad.excode = ohcad.eId;
                                    delete ohcad.eId;
                                    ohcad.typ = ohcad.ads_type;
                                    delete ohcad.ads_type;
                                    if(ohcad.ads_package)
                                    {
                                        ohcad.pkg = ohcad.ads_package;
                                        delete ohcad.ads_package;
                                    }
                                    if(ohcad.explain)
                                    {
                                        ohcad.content = ohcad.explain;
                                        delete ohcad.explain;
                                    }
                                    if(ohcad.participation)
                                    {
                                        ohcad.join = ohcad.participation;
                                        delete ohcad.participation;
                                    }
                                    if(ohcad.start_age)
                                    {
                                        ohcad.stage = parseInt(ohcad.start_age);
                                        delete ohcad.start_age;
                                    }
                                    if(ohcad.end_age)
                                    {
                                        ohcad.edage = parseInt(ohcad.end_age);
                                        delete ohcad.end_age;
                                    }
                                    if(ohcad.limit_sex)
                                    {
                                        ohcad.sex = parseInt(ohcad.limit_sex);
                                        delete ohcad.limit_sex;
                                    }
                                    if(ohcad.operator)
                                    {
                                        ohcad.tcom = (ohcad.operator == "A")? "T,K,U" : ohcad.operator;
                                        delete ohcad.operator;
                                    }
                                    if(ohcad.img)
                                    {
                                        ohcad.eximg = ohcad.img;
                                        delete ohcad.img;
                                    }
                                    if(ohcad.os_type)
                                    {
                                        ohcad.os = ohcad.os_type.toUpperCase();
                                        delete ohcad.os_type;
                                    }
                                    if(ohcad.price)
                                    {
                                        ohcad.adprice = parseInt(ohcad.price);
                                        delete ohcad.price;
                                    }
                                    if(ohcad.advr_link_url)
                                    {
                                        ohcad.url = ohcad.advr_link_url;
                                        delete ohcad.advr_link_url;
                                    }

                                    ohcad.representativeid = rep._id;
                                    ohcad.representativenm = rep.name;

                                    if(ohcad.eximg)
                                    {
                                        var uri = "http://cms.touch-down.co.kr/srv/upfile/api/download";
                                        request({ method: 'POST'
                                            , uri: uri
                                            , formData : {url:ohcad.eximg}
                                        }, function (err, response, body) {
                                            if (err) {
                                                var error = {file: __filename, code: -1001, description: err.toString()};
                                                callback(error);
                                            }
                                            else
                                            {
                                                if(response.statusCode == 200)
                                                {
                                                    var json = JSON.parse(body);
                                                    if(json.path)
                                                    {
                                                        ohcad.img1 = json.path;
                                                    }
                                                }
                                            }

                                            var saveObj = new ModelObj(ohcad);
                                            saveObj.save(function (err) {
                                                if(err){
                                                    callback(err);
                                                }
                                            });

                                        });
                                    }

                                }
                            }
                        });

                }, function(err) {
                    // if any of the file processing produced an error, err would equal that error
                    if( err ) {
                        console.log(err);
                    } else {
                        //console.log('All files have been processed successfully');
                    }
                });

            }catch(err){
                callback(err);
            }

        }
    ], function (err, result) {
        if(err)
        {
            console.log(err);
        }
    });

}

exports.CRON_PATTERN = CRON_PATTERN;
exports.tick = tick;
