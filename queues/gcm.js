/**
 * Created by master on 2016-09-01.
 */
var gcm = require('node-gcm');
var async = require('async');
var _ = require("underscore");
var cmd = process.cwd();
var ModelObj = require(cmd + "/models/user");

//natually gcm formatted
function GCM(message, sendQueueCallback){
    this.message = message;
    this.serverKey = "AIzaSyDnViEe69ZlInHBz2HoJAeTZl8xtQBtpBI";
    this.start = function(){
        //1. {tags:[]} tag preprocess
        //2. {title:"" body:"", registrationTokens:[]}
        if(this.message.tags)
        {

            async.waterfall([
                function(wcallback) {

                    var wherein = _.map(this.message.tags, function(obj){
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
                                var msg = {delay : 0,  message : {title:"TOUCHDOWN",body:"TOUCHDOWN", registrationTokens:tokens}}
                                sendQueueCallback(msg);
                                pcallback(null, arr.length);
                            },
                            function(pcallback) {
                                var arr = _.where(rows,{delay:5});
                                var tokens = _.map(arr, function(obj){
                                    return obj["token"];
                                });
                                var msg = {delay : 5,  message : {title:"TOUCHDOWN",body:"TOUCHDOWN", registrationTokens:tokens}}
                                sendQueueCallback(msg);
                                pcallback(null, arr.length);
                            },
                            function(pcallback) {
                                var arr = _.where(rows,{delay:10});
                                var tokens = _.map(arr, function(obj){
                                    return obj["token"];
                                });
                                var msg = {delay : 10,  message : {title:"TOUCHDOWN",body:"TOUCHDOWN", registrationTokens:tokens}}
                                sendQueueCallback(msg);
                                pcallback(null, arr.length);
                            },
                            function(pcallback) {
                                var arr = _.where(rows,{delay:20});
                                var tokens = _.map(arr, function(obj){
                                    return obj["token"];
                                });
                                var msg = {delay : 20,  message : {title:"TOUCHDOWN",body:"TOUCHDOWN", registrationTokens:tokens}}
                                sendQueueCallback(msg);
                                pcallback(null, arr.length);
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
                    console.log(err);
                }
            });

            // wherein = ["uobj0","uobj1" ...];
            //json.delay
            //json.message = {title:"" body:"", registrationTokens:[]}
            //sendQueueCallback(json)
        }
        else if(this.message.title)
        {
            var message = new gcm.Message({
                collapseKey: 'demo',
                priority: 'high',
                contentAvailable: true,
                delayWhileIdle: true,
                timeToLive: 3,
                dryRun: true,
                notification: {
                    title: this.message.title,
                    icon: "ic_launcher",
                    body: this.message.body
                }
            });
            var sender = new gcm.Sender(this.serverKey);
            sender.send(message, { registrationTokens: this.message.registrationTokens }, function (err, response) {
                if(err)
                    console.error(err);
                else
                    console.log(response);
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