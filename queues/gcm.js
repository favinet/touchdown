/**
 * Created by master on 2016-09-01.
 */
var gcm = require('node-gcm');
var async = require('async');
var _ = require("underscore");
var winston = require("winston");
var cmd = process.cwd();
var ModelObj = require(cmd + "/models/user");

//natually gcm formatted
function GCM(){
    //this.message = message;
    this.serverKey = "AIzaSyDnViEe69ZlInHBz2HoJAeTZl8xtQBtpBI";
    this.start = function(message, sendQueueCallback){
        console.log(message);
        var json = JSON.parse(message);
        //1. {tags:[]} tag preprocess
        //2. {title:"" body:"", registrationTokens:[]}
        if(json.tags)
        {
            async.waterfall([
                function(wcallback) {

                    var wherein = _.map(json.tags, function(obj){
                        return obj["cobjid"];
                    });
                    ModelObj.find({_id:{ $in: wherein },token:{ $exists:true}},{_id:0,token:1,delay:1},function(err,rows){
                        if(err)
                        {
                            wcallback(err);
                        }
                        else
                        {
                            wcallback(null,rows);
                        }
                    });

                },
                function(rows, wcallback) {

                    async.parallel([
                            function(pcallback) {
                                var arr = _.where(rows,{delay:0});
                                var tokens = _.map(arr, function(obj){
                                    return obj["token"];
                                });
                                if(tokens.length > 0)
                                {
                                    var msg = {delay : 0,  message : {title:"TOUCHDOWN",body:"TOUCHDOWN", registrationTokens:tokens}}
                                    sendQueueCallback(msg);
                                    pcallback(null, arr.length);
                                }
                            },
                            function(pcallback) {
                                var arr = _.where(rows,{delay:5});
                                var tokens = _.map(arr, function(obj){
                                    return obj["token"];
                                });
                                if(tokens.length > 0)
                                {
                                    var msg = {delay : 5,  message : {title:"TOUCHDOWN",body:"TOUCHDOWN", registrationTokens:tokens}}
                                    sendQueueCallback(msg);
                                    pcallback(null, arr.length);
                                }
                            },
                            function(pcallback) {
                                var arr = _.where(rows,{delay:10});
                                var tokens = _.map(arr, function(obj){
                                    return obj["token"];
                                });
                                if(tokens.length > 0)
                                {
                                    var msg = {delay : 10,  message : {title:"TOUCHDOWN",body:"TOUCHDOWN", registrationTokens:tokens}}
                                    sendQueueCallback(msg);
                                    pcallback(null, arr.length);
                                }
                            },
                            function(pcallback) {
                                var arr = _.where(rows,{delay:20});
                                var tokens = _.map(arr, function(obj){
                                    return obj["token"];
                                });
                                if(tokens.length > 0)
                                {
                                    var msg = {delay : 20,  message : {title:"TOUCHDOWN",body:"TOUCHDOWN", registrationTokens:tokens}}
                                    sendQueueCallback(msg);
                                    pcallback(null, arr.length);
                                }
                            }
                        ],
                        function(err, results) {
                            // the results array will equal ['one','two'] even though
                            // the second function had a shorter timeout.
                            if(err)
                                wcallback(err);
                            else{
                                var sum = _.reduce(results, function(memo, num){ return memo + num; }, 0);
                                wcallback(null,sum);
                            }

                        });
                }
            ], function (err, result) {
                // result now equals 'done'
                if(err)
                {
                    var error = {file: __filename, code: -1001, description:err.toString()};
                    winston.log("error",JSON.stringify(error));
                }
                else
                {
                    var info = {file: __filename, code: 0, description:"gcm arranged count : " + result};
                    winston.log("info",JSON.stringify(info));
                }
            });

            // wherein = ["uobj0","uobj1" ...];
            //json.delay
            //json.message = {title:"" body:"", registrationTokens:[]}
            //sendQueueCallback(json)
        }
        else if(json.title)
        {
            var message = new gcm.Message({
                collapseKey: 'demo',
                priority: 'high',
                contentAvailable: true,
                delayWhileIdle: true,
                timeToLive: 3,
                dryRun: false,
                notification: {
                    title: json.title,
                    icon: "ic_launcher",
                    body: json.body
                }
            });
            var sender = new gcm.Sender(this.serverKey);
            sender.send(message, { registrationTokens: json.registrationTokens }, function (err, response) {
                if(err)
                {
                    var error = {file: __filename, code: -1001, description:err.toString()};
                    winston.log("error",JSON.stringify(error));
                }
                else
                {
                    var info = {file: __filename, code: 0, description:response};
                    winston.log("info",JSON.stringify(info));
                }

            });
        }

    }
    /*
    var message = new gcm.Message({
        collapseKey: 'demo',
        priority: 'high',
        contentAvailable: true,
        delayWhileIdle: true,
        timeToLive: 3,
        restrictedPackageName: "somePackageName",
        dryRun: true,
        data: {
            key1: 'message1',
            key2: 'message2'
        },
        notification: {
            title: "Hello, World",
            icon: "ic_launcher",
            body: "This is a notification that will be displayed ASAP."
        }
    });
    */
    //var sender = new gcm.Sender('insert Google Server API Key here');
    /*sender.send(message, { registrationTokens: registrationTokens }, function (err, response) {
        if(err) console.error(err);
        else    console.log(response);
    });*/

    //3형태의 포맷으로 프로세싱되게끔 처리한다.

    //1. {tags:[]} tag preprocess
    //2. {delay : 10,  msg : {title:"" body:"", registrationTokens:[]}}

};


exports.RunObject = GCM;