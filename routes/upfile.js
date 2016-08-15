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
                    var outputDir = "/opt/touchdown/html/upload/" + c1;
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


router.get('/api/delete', function(req, res, next) {
    var path = req.query.path;
    if(typeof(path) == "undefined")
        res.jsonp({err:-1,"error":"query empty"});
    // /upload/2016/03/03/56d7d0d4a62f77db129ba147.JPG
    var deletePath = "/opt/touchdown/html" + path;

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