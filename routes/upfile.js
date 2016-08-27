/**
 * Created by master on 2016-03-02.
 */
var path = require('path');
var objname = path.basename(__filename, '.js');
var initurl = '/'+objname+'/list/0/1/';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');


var cmd = process.cwd();
var ModelObj = require(cmd + "/models/"+ objname);
var ObjectId = mongoose.Types.ObjectId;

var moment = require('moment');
var fs = require('fs');
var mkdirp = require('mkdirp');

var cwebp = require('cwebp');

var request = require('request');
var async = require('async');

router.post('/api/save', function(req, res, next) {
    //find saved :
    //console.log(req.body);
    //console.log(req.file);

    var upFile = req.file;
    if (upFile) {
        // 변수 선언
        var name = upFile.originalname;
        console.log("파일 네임 =>" + name);

        var path = upFile.path;

        var type = upFile.mimetype;
        var buffer = upFile.buffer;
        // 이미지 파일 확인
        if (type.indexOf('octet-stream') != -1) {
            var ext = "PNG";
            var params = name.split(".");

            if(params.length >= 2)
                ext = params[params.length-1].toUpperCase();

            var saveObj = new ModelObj({ext:ext});
            saveObj.save(function(err, item){
                if(err)
                {
                    res.send({err:-1,"error":err.toString()});
                }
                else
                {
                    var c1 = moment(item.regdate).format('YYYY/MM/DD');
                    var outputDir = "/home/nzon/www_httpd/html/upload/" + c1;
                    var outputPath = outputDir + "/" + item._id + "." + item.ext;
					var webpPath =  outputDir + "/" + item._id + ".webp";

                    var valuePath = "/upload/" + c1 + "/"  + item._id + "." + item.ext;
                    
					mkdirp(outputDir, function (err) {
                        if(err)
                        {
                            res.jsonp({err:-1,"error":err.toString()});
                        }
                        else
                        {
                            var stream = fs.createWriteStream(outputPath);
                            stream.write(buffer);
                            stream.on('error', function(err) {
                                res.send({err:-1,"error":err.toString()});
                            });
                            stream.on('finish', function() {

                                console.log("파일 path =>" + valuePath);
								var CWebp = cwebp.CWebp;
								var encoder = new CWebp(outputPath);
								encoder.write(webpPath, function(err) {
									console.log('converted ' + err);
								});

                                res.jsonp({path:valuePath});
                            });
                            stream.end();
                        }
                    });
                }
            });
        } else {
            console.log("octet-stream not found");
            // 이미지 파일이 아닌 경우 : 파일 이름 제거
            fs.unlink(path, function(err) {
                res.jsonp({err:-1,"error":err.toString()});
            });
        }
    } else {
        res.send({err:-1,"error":"upload file is nothing"});
    }
});


router.post('/api/download', function(req, res, next) {
    //find saved :
    console.log(req.body);
    //console.log(req.file);
    async.waterfall([
        function (callback) {
            if (req.body.url) {
                callback(null, req.body.url);
            } else {
                var error = {file: __filename, code: -1007, description: "get,post parameter is undefined"};
                callback(error);
            }
        },
        function (url, callback) {
            // arg1 now equals 'one' and arg2 now equals 'two'
            request(
                { method: 'GET'
                    , uri: url
                    , gzip: true
                    , encoding: null // body content binary buffer option
                }
                , function (err, response, body) {
                    // body is the decompressed response body
                    //console.log('server encoded the data as: ' + (response.headers['content-encoding'] || 'identity'))
                    //console.log('the decoded data is: ' + body.length)
                    if(err)
                    {
                        var error = {file: __filename, code: -1001, description: err.toString()};
                        callback(error);
                    }
                    else
                    {
                        if (response.statusCode == 200) {
                            var content = response.headers['content-type'];
                            if (content.indexOf("image") >= 0) {
                                var ext = "PNG";
                                var params = url.split(".");
                                if (params.length >= 2)
                                    ext = params[params.length - 1].toUpperCase();

                                callback(null, ext, body);

                            } else {
                                var error = {file: __filename, code: -1003, description: "content is not proper type"};
                                callback(error);
                            }
                        } else {
                            var error = {
                                file: __filename,
                                code: -1002,
                                description: "http error " + response.statusCode
                            };
                            callback(error);
                        }
                    }
                }
            );

            /*request.get(url)
                .on('error', function (err) {
                    var error = {file: __filename, code: -1001, description: error.toString()};
                    callback(error);
                })
                .on('data', function(data) {
                    // decompressed data as it is received
                    //console.log('decoded chunk: ' + data.length)
                })
                .on('response', function (response, body) {

                    response.on('data', function (data) {
                        console.log('received ' + data.length + ' bytes of compressed data');

                        if (response.statusCode == 200) {
                            var content = response.headers['content-type'];
                            if (content.indexOf("image") >= 0) {
                                var ext = "PNG";
                                var params = url.split(".");
                                if (params.length >= 2)
                                    ext = params[params.length - 1].toUpperCase();

                                callback(null, ext, data);

                            } else {
                                var error = {file: __filename, code: -1003, description: "content is not proper type"};
                                callback(error);
                            }
                        } else {
                            var error = {
                                file: __filename,
                                code: -1002,
                                description: "http error " + response.statusCode
                            };
                            callback(error);
                        }
                    })
                });*/


        },
        function (ext, data, callback) {

            var saveObj = new ModelObj({ext: ext});
            saveObj.save(function (err, item) {
                if (err) {
                    var error = {file: __filename, code: -1001, description: err.toString()};
                    callback(error);
                }
                else {
                    callback(null, item, data);
                }
            });

        },
        function (item, data, callback) {

            var c1 = moment(item.regdate).format('YYYY/MM/DD');
            var outputDir = "/home/nzon/www_httpd/html/upload/" + c1;
            var outputPath = outputDir + "/" + item._id + "." + item.ext;
            var webpPath = outputDir + "/" + item._id + ".webp";
            var valuePath = "/upload/" + c1 + "/" + item._id + "." + item.ext;

            mkdirp(outputDir, function (err) {
                if (err) {
                    var error = {file: __filename, code: -1001, description: err.toString()};
                    callback(error);
                }
                else {
                    var stream = fs.createWriteStream(outputPath);
                    stream.write(data);
                    stream.on('error', function (err) {
                        var error = {file: __filename, code: -1001, description: err.toString()};
                        callback(error);
                    });
                    stream.on('finish', function () {
                        callback(null, outputPath, webpPath, valuePath);
                    });
                    stream.end();
                }
            });
        },
        function (outputPath, webpPath, valuePath, callback) {

            //console.log("파일 path =>" + valuePath);
            var CWebp = cwebp.CWebp;
            var encoder = new CWebp(outputPath);
            encoder.write(webpPath, function (err) {
                console.log('converted ' + err);
                if (err) {
                    var error = {file: __filename, code: -1001, description: err.toString()};
                    callback(error);
                }
                else {
                    callback(null, {path: valuePath});
                }
            });
            //res.jsonp({path:valuePath});
        }
    ], function (err, result) {
        if (err) {
            res.jsonp(err);
        }
        else {
            res.jsonp(result);
        }
        // result now equals 'done'
    });

});

router.get('/api/delete', function(req, res, next) {
    var path = req.query.path;
    if(typeof(path) == "undefined")
        res.jsonp({err:-1,"error":"query empty"});
    // /upload/2016/03/03/56d7d0d4a62f77db129ba147.JPG
    var deletePath = "/home/nzon/www_httpd/html" + path; //전역변수화.

    fs.unlink(deletePath, function(err) {
        if(err)
        {
            res.jsonp({err:-1,"error":err.toString()});
        }
        else
        {
            var infos = path.split("/");
            var finfos = infos[infos.length-1].split(".");
            var objid = finfos[0];
            ModelObj.remove({_id:objid}, function (err) {
                if(err){
                    res.jsonp({err:-1,"error":err.toString()});
                }else{
                    res.jsonp({err:0});
                }
            });
        }
    });
});

module.exports = router;