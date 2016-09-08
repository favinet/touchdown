/**
 * Created by master on 2016-01-22.
 */
var path = require('path');
var objname = path.basename(__filename, '.js');

var CRUD = require('../routes/crud');
var options = {};
options["objname"] = objname;
options["searchname"] = ["cobjnm"];
var router = CRUD.defaultRouter(options);

var cmd = process.cwd();
var ModelObj = require(cmd + "/models/"+ objname);
var SbwModelObj = require(cmd + "/models/"+ objname + "sbw"); //
var SbwLogModelObj = require(cmd + "/models/"+ objname + "sbwlog"); //

var BincodeModelObj = require(cmd + "/models/bincode"); //


var async = require("async");
var crypto = require("crypto");
var Random = require("random-js");
var winston = require("winston");

var popup = "_popup";
var initurl = '/'+objname+'/list/0/1/';

CRUD.clearPath(router, /^(?!api)\/(insert|insert_popup)/ , "post");

router.post(/^(?!api)\/(insert|insert_popup)/, function(req, res, next) {

    var suf = (req.url.indexOf(popup) >= 0)? popup : "";
    //console.log(req.body);
    var json = req.body;
    async.waterfall([
        async.apply(hashCardFunction,json),
        bincodeFunction,
        cardSaveFunction,
        cardSbwSaveFunction
    ], function (err, result) {
        // result now equals 'done'
        if(err)
        {
            if(err.code == 0)
            {
                winston.log("info",JSON.stringify(err));
                res.redirect('/srv/'+objname+'/list'+suf+'/0/1/');
            }
            else
            {
                winston.log("error",JSON.stringify(err));
                res.render('common/error',{'error':'An error has occurred','url':initurl});
            }
        }
        else
        {
            res.redirect('/srv/'+objname+'/list'+suf+'/0/1/');
        }
    });
});

function hashCardFunction(json, callback)
{

    var hash = crypto.createHash('sha256').update(json.card).digest('hex');
    json.excard = hash;
    var r = new Random();
    var excode = r.string(10);
    var bincode = json.card.substr(0,6);
    json.vcard = bincode + excode;
    delete json["card"];

    ModelObj.findOne({cobiid:json.cobjid, excard:json.excard},function(err,card){
        if(err)
        {
            var error = {file: __filename, code: -1001, description: err.toString()};
            callback(error);
        }
        else
        {
            if(card)
            {
                var info = {file: __filename, code: 0, description: "card already exist"};
                callback(info);
            }
            else
            {
                callback(null, json);
            }
        }
    });
}
function bincodeFunction (json, callback)
{

    BincodeModelObj.findOne({binnumber:json.vcard.substr(0,6)},function(err,data){

        if(err)
        {
            var error = {file: __filename, code: -1001, description: err.toString()};
            callback(error);
        }
        else
        {
            if(data)
            {
                json.company = data.company;
                callback(null, json);
            }
            else
            {
                var error = {file: __filename, code: -1009, description: "find data is empty"};
                callback(error);
            }
        }

    });
}
function cardSaveFunction (json, callback)
{
    //card insert
    var saveObj = new ModelObj(json);
    saveObj.save(function (err) {
        if(err){
            var error = {file: __filename, code: -1001, description: err.toString()};
            callback(error);
        }else{
            callback(null, json);
        }
    });
}
function cardSbwSaveFunction (json, callback)
{
    //cardsbw insert
    var data ={};
    data.cobjid = json.cobjid;
    data.excard = json.excard;
    var saveObj = new SbwModelObj(data);

    saveObj.save(function (err) {
        if(err){
            var error = {file: __filename, code: -1001, description: err.toString()};
            callback(error);
        }else{
            callback(null, json);
        }
    });
}




//arex 만의 처리일수 있기 때문에 card컬렉션에 위치하는 해야 하는지는 ..

router.get('/api/list', function(req, res, next) {


    async.waterfall([
        function(callback) {

            var where = {trycnt:{$lt:3}};

            //for test
            if(req.query.excard)
                where["excard"] = req.query.excard;

            console.log(JSON.stringify(where));

            SbwModelObj.find(where)
                .limit(1000)
                .sort({ regdate: -1 })
                .exec(function(err,rows){
                    if(err)
                    {
                        var error = {file: __filename, code: -1001, description: err.toString()};
                        callback(error);
                    }
                    else
                    {
                        callback(null,rows);
                    }
                });
        },
        function(rows, callback) {
            // data preprocess
            var regdate = new Date().getTime();
            var upwhere = [];
            var rmwhere = [];
            var json = {};
            json.cnt = rows.length;
            json.error = 0;
            json.cards = [];
            for(var i = 0 ; i < rows.length ; i++)
            {
                var row = rows[i];
                json.cards.push({cobjid:row.cobjid, excard:row.excard, regdate:regdate});
                if(row.trycnt == 3)
                    rmwhere.push(row._id);
                else
                    upwhere.push(row._id);
            }
            callback(null, upwhere, rmwhere, json, regdate);
        },
        function(upwhere, rmwhere, json, regdate, callback) {

            //동일카드 ... 가 입력되는 경우는?
            SbwModelObj.update({_id:{ $in : upwhere }}, {$inc:{trycnt:1}, regdate:regdate}, function (err) {
                if(err)
                {
                    var error = {file: __filename, code: -1001, description: err.toString()};
                    callback(error);
                }
                else
                    callback(null, rmwhere, json);
            });

        },
        function(rmwhere, json, callback) {

            SbwModelObj.remove({_id:{ $in : rmwhere }}, function (err) {
                if(err)
                {
                    var error = {file: __filename, code: -1001, description: err.toString()};
                    callback(error);
                }
                else
                    callback(null, json);
            });

        }
    ], function (err, result) {
        // result now equals 'done'
        if(err)
        {
            winston.log("error",JSON.stringify(err));
            var json = {};
            json.cnt = 0;
            json.error = -500;
            json.cards = [];
            res.send(json);
        }
        else
        {
            res.send(result);
        }
    });
});


router.post('/api/list', function(req, res, next) {

    var data =  req.body; //some probem ... {'json':''}
    var json = JSON.parse(Object.keys(data)[0]);



    if(json.cnt) //check protocol
    {
        var cardcnt = json.cards.length;
        var checksum = 0;
        console.log("json.cards.length : " + json.cards.length);
        // assuming openFiles is an array of file names
        async.each(json.cards, function(card, ecallback) {

            console.log(card);

            async.series([
                    function(callback) {
                        // do some stuff ...
                        //cardreg 삭제
                        //excard + regdate 삭제
                        SbwModelObj.remove({excard:card.excard,regdate:card.regdate}, function (err) {
                            if(err)
                            {
                                var error = {file: __filename, code: -1001, description: err.toString()};
                                callback(error);
                            }
                            else
                                callback(null, true);
                        });
                    },
                    function(callback) {
                        //card 업데이트
                        //cobjid + excard arex 업데이트
                        ModelObj.update({cobjid:card.cobjid, excard:card.excard},{arexyn:true}, function (err) {
                            if(err)
                            {
                                var error = {file: __filename, code: -1001, description: err.toString()};
                                callback(error);
                            }
                            else
                                callback(null, true);
                        });
                    },
                    function(callback) {
                        //cardreglog 저장
                        var reglog = new SbwLogModelObj(card);
                        reglog.save(function (err) {
                            if(err){
                                var error = {file: __filename, code: -1001, description: err.toString()};
                                callback(error);
                            }else{
                                callback(null, true);
                            }
                        });
                    }
                ],
                // optional callback
                function(err, results) {
                    // results is now equal to ['one', 'two']
                    console.log("results" + results);
                    if(err)
                    {
                        //winston.log("error",JSON.stringify(err));
                        ecallback(err);
                    }
                    else
                    {
                        ecallback();
                    }
                });

            // when err each loop stop
            //callback(); callback(err)
        }, function(err) {

            if( err ) {
                winston.log("error",JSON.stringify(err));
                var json = {error:-500};
                res.send(json);
            } else {
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

router.post('/api/insert', function(req, res, next) {

    var json = req.body;

    async.waterfall([
        async.apply(hashCardFunction,json),
        bincodeFunction,
        cardSaveFunction,
        cardSbwSaveFunction
    ], function (err, result) {
        // result now equals 'done'
        if(err)
        {
            if(err.code == 0)
            {
                winston.log("info",JSON.stringify(err));
                var json = {error:-1011};
                res.send(json);
            }
            else
            {
                winston.log("error",JSON.stringify(err));
                var json = {error:-500};
                res.send(json);
            }
        }
        else
        {
            var json = {error:0};
            res.send(json);
        }
    });

});


module.exports = router;
