/**
 * Created by master on 2016-01-22.
 */
var path = require('path');
var objname = path.basename(__filename, '.js');

var CRUD = require('../routes/crud');
var options = {};
options["objname"] = objname;
options["searchname"] = ["uid"];
var router = CRUD.defaultRouter(options);

var cmd = process.cwd();
var LogModelObj = require(cmd + "/models/"+ objname);
var async = require("async");
var winston = require("winston");

//RedisSMQ = require("rsmq");
//rsmq = new RedisSMQ( {host: "app.touch-down.co.kr", port: 6379, ns: "rsmq"} );
//var moduleName = "gcm";

router.post('/api/list', function(req, res, next) {

    var data =  req.body; //some probem ... {'json':''}
    var json = JSON.parse(Object.keys(data)[0]);

    if(json.cnt) //check protocol
    {

        async.waterfall([
            function(callback) {

                LogModelObj.collection.insert(json.tags, function (err, docs) {
                    if (err)
                    {
                        var error = {file: __filename, code: -1001, description: err.toString()};
                        callback(error);
                    }
                    else
                    {
                        callback(null, docs);
                    }
                });
            },
            function(docs, callback) {

                console.log(docs);

                callback(null,docs);
                //send docs to gcm server using rsmq
                /*rsmq.sendMessage({qname:moduleName, message:docs}, function (err, resp) {
                    if(err)
                    {
                        var error = {file: __filename, code: -1001, description: err.toString()};
                        callback(error);
                    }
                    else
                    {
                        if (resp)
                        {
                            //console.log("Message sent. ID:", resp);
                            callback(null,resp);
                        }
                        else
                        {
                            var error = {file: __filename, code: -1010, description: "response is empty (rsmq)" };
                            callback(error);
                        }
                    }
                });*/
            }
        ], function (err, result) {
            // result now equals 'done'
            if(err)
            {
                winston.log("error",JSON.stringify(err));
                var json = {error:-500};
                res.send(json);
            }
            else
            {
                var info = {file: __filename, code: 0, description: result };
                winston.log("info",JSON.stringify(info));
                var json = {error:0};
                res.send(json);
            }
        });
    }
    else
    {
        var json = {error:-400};
        res.send(json);
    }

});


module.exports = router;
