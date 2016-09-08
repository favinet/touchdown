/**
 * Created by master on 2016-08-12.
 */
var crypto = require("crypto");
var cardno = "abc";
var path = require("path");

var async = require("async");

var mongoose = require('mongoose');
var _ = require("underscore");

var cmd = process.cwd();
var ModelObj = require(cmd + "/models/bincode");

mongoose.connect('mongodb://nzon:dpswhs*23@db.touch-down.co.kr:50000/touchdown');

var db = mongoose.connection;
db.on('error', function callback (err){
    if(err)
    {
        console.log(err);
    }
});
db.once('open', function callback () {
    console.log("connection successful...");
});


var data = {};
//data._id = row._id;
data.binnumber = "123456";
data.cardcode = "123456";
data.company = "123456";
data.cardname = "123456";
data.cardkind = "123456";
data.regdate = "123456";

ModelObj.create(data, function (err, data) {
    console.log(data);
})


return;

/*
ModelObj.find({},function(err,rows) {

    console.log(rows.length);

    for(var i = 0 ; i < rows.length ; i++)
    {
        var row = rows[i];
        var data = {};
        //data._id = row._id;
        data.binnumber = row.binnumber.replace("*","");
        data.cardcode = row.cardcode.replace("*","");
        data.company = row.company;
        data.cardname = row.cardname;
        data.cardkind = row.cardkind;
        data.regdate = row.regdate;

        //console.log("row.bincode : " + row);
        //console.log("row.bincode : " + row[1]);

        //row.bincode= row.bincode.replace("'","");
        //row.cardcode= row.cardcode.replace("'","");
        var saveObj = new ModelObj(data);
        saveObj.save(function (err) {
            if(err){
                console.log(err);
            }
        });
        //if(i == 5)
        //break;

        ModelObj.remove({_id:row._id}, function (err) {
            if(err){
                console.log(err);
            }
        });

    }
});
*/


/*
var wherein = ["56caf3d0e209989322016aac","56d535129e349a8b728635ef"];

ModelObj.find({_id:{ $in: wherein }},{token:1,delay:1},function(err,rows){
    if(err)
    {
        console.log(err);
    }
    else
    {
        console.log(rows);
    }
});
*/








/*
var test = _.map([{one: 1, two: 2},{one: 3, two: 4}], function(el){ return new mongoose.mongo.ObjectId(el["two"]); });

console.log(test);


return;

var json = {cnt:3, cards:[
    {id:"00000", val:"AAAAAA"},
    {id:"12345", val:"BBBBBB"},
    {id:"12345", val:"BBBBBB"}]}


async.each(json.cards, function(card, callback) {


    async.series([
            function(subcallback) {
                // do some stuff ...
                console.log("step1");

                if(card.id == "00000")
                    subcallback(null, 'one');
                else
                    subcallback({error:"id error"});
            },
            function(subcallback) {
                console.log("step2");
                // do some more stuff ...
                if(card.val == "BBBBBB")
                    subcallback(null, 'two');
                else
                    subcallback({error:"val error"});
            }
        ],
        function(err, results) {
            // results is now equal to ['one', 'two']
            if(err)
            {
                console.log(err);
                callback(err);
            }
            else
            {
                console.log(results);
                callback();
            }

        });





}, function(err) {

    if( err ) {
        console.log('A file failed to process');
    } else {
        console.log('All files have been processed successfully');
    }

});
*/


//var cardno = "123"
//var hash = crypto.createHash('sha256').update(cardno).digest('base64');
/*
var hash = crypto.createHash('sha256').update(cardno).digest('hex'); //kisa saple 동일값
console.log(hash);
*/


/*
var mongoose = require('mongoose');

mongoose.connect('mongodb://root:dpswhs*23@211.39.147.196:50000/test_s?authSource=admin');

var db = mongoose.connection;
db.on('error', function callback (err){
    if(err)
    {
        console.log('connection error... ' + err.descsription);
    }
});
db.once('open', function callback () {
    console.log('connection success !!! ');
});


setTimeout(function(){

    db.collection('test1').findOne({},function(err,doc){
        if(err)
        {
            console.log("err raised !!! " + err);
        }
        else
        {
            console.log("data : " + doc);
        }



    db.collection('test1').insert([{_id:500001,seq:505001,regdate:new Date()}],function(err,doc){

            if(err)
            {
                console.log("err raised !!! " + err);
            }
            else
            {
                console.log("data : " + doc);
            }
    });

},5000)

 */



/*
console.log(__dirname);
console.log(__filename);

var objname = path.basename(__filename, '.js');
*/
/*
var cwebp = require('cwebp');

valuePath = "/upload/2016/08/27/57c159365b9339d92efefa45.PNG";
outputPath = "/home/nzon/www_httpd/html/upload/2016/08/27/57c159365b9339d92efefa45.PNG";
webpPath = "/home/nzon/www_httpd/html/upload/2016/08/27/57c159365b9339d92efefa45.webp";

console.log("파일 path =>" + valuePath);
var CWebp = cwebp.CWebp;
var encoder = new CWebp(outputPath);
encoder.write(webpPath, function (err) {
    console.log('converted ' + err);
    if (err) {
        var error = {file: __filename, code: -1001, description: err.toString()};
        console.log(err.toString());
    }
    else {
        console.log("converted !!!!");
    }
});
*/
//var path = process.cwd();
/*var path = require('path');
var moudleName = path.basename(__filename, '.js');

var ch = "1,1,1,1";
console.log(Array.isArray(ch));
console.log(ch[0]);
console.log(ch.replace(/,/gi,"/"));


var search = ["1","한글","adfjkoasdfz"];

var route = (Array.isArray(search))? search.toString().replace(/,/gi,"/") : search;
route = encodeURIComponent(route).replace(/%2F/gi,"/");

console.log(route);
*/
//console.log(path);
/*
var a = /\/(insert|insert_popup)/;
var b = /\/(insert|insert_popup)/;

if(a.match(b))
    console.log("equals");
else
    console.log("not equals");
*/
/*
console.log(moudleName);
console.log(this.filename);
console.log(module.filename);
console.log(__filename);*/