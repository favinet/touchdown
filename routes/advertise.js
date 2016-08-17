/**
 * Created by master on 2016-02-19.
 */
var path = require('path');
var objname = path.basename(__filename, '.js');
console.log('objname====>' +objname);

var CRUD = require('../routes/crud');
var options = {};
options["objname"] = objname;
options["searchname"] = "title";
var router = CRUD.defaultRouter(options);

var Random = require("random-js");
var cmd = process.cwd();
var ModelObj = require(cmd + "/models/"+ objname);
var ModelUselog = require(cmd + "/models/uselog");

CRUD.clearPath(router, /\/(insert|insert_popup)/);

router.get(/\/(insert|insert_popup)/, function(req, res, next) {

    var r = new Random();
    var excode = r.string(10);
    req.cookies.excode = excode;
    var data = {};
    data.excode = req.cookies.excode;
    data.uobjnm = req.cookies.uid;
    data.uobjid = req.cookies._id;
    data.objname = objname;
    res.render(objname+'/insert', data);

});


router.post('/api/list', function(req, res, next) {
    //res.render('/api/list', { showyn:'true' ,plat:'ANDROID', page:1, cnt:20, uid:});
    //find saved :
    console.log(req.body);
    var json = req.body;

    var showyn =  (json.showyn)? json.showyn : true;
    var plat =  (json.target4)? json.target4 : "ANDROID";
    var page = (json.page)? parseInt(json.page) : 1;
    var cnt = (json.cnt)? parseInt(json.cnt) : 10;
    var _id = (json._id)? json._id : "";

    ModelUselog.find({uobj:_id},function(err,results){
        if(err)
        {
            var result = {"result":-1,"error":err.toString()};
            res.send(result);
        }
        else
        {
            var wheres = results.map(function(u){return u.aobj;});

            ModelObj.find({showyn:showyn,target4:plat,_id:{$nin:wheres}}).sort({'regdate' : -1})
                .$where('this.advcnt > this.usecnt')
                .limit(cnt)
                .skip(cnt*(page-1))
                .exec(function(err,docs){
                    console.log(docs);
                    if(err){
                        var result = {"result":-1,"error":err.toString()};
                        res.send(result);
                    }else {
                        res.send(docs);
                    }
                });
        }
    });
    /*
    var tcnt = 0;
    ModelObj.count({showyn:showyn,plat:plat},
        function(err, count){
            tcnt = count;
            console.log("tcnt : " + tcnt);
        });
    */

});

router.post('/api/select/:code', function(req, res, next) {
    var code = req.params.code;
    /*
    var showyn =  (json.showyn)? json.showyn : "Y";
    var plat =  (json.plat)? json.plat : "ANDROID";
    var page = (json.page)? parseInt(json.page) : 1;
    var cnt = (json.cnt)? parseInt(json.cnt) : 10;
    */
    ModelObj.findOne({_id:new ObjectId(code)},
        function(err, adv){
            if(err){
                var result = {"result":-1,"error":err.toString()};
                res.send(result);
            }else {
                res.send(adv);
            }
        });
});

router.get('/api/usable/:code', function(req, res, next) {
    var _id = req.params.code;
    var plat =  "ANDROID"; //req.useragent.os.toUpperCase(); (json.plat)? json.plat : "ANDROID";
    console.log(plat);
    // count advertise exclude using
     console.log('_id : ' + _id);
     ModelUselog.find({uobj:_id},function(err,results){
         if(err)
         {
             var result = {"result":-1,"error":err.toString()};
             res.send(result);
         }
         else
         {
             var wheres = results.map(function(u){return u.aobj;});
             ModelObj.count({showyn:true,plat:plat,_id:{$nin:wheres}})
                 .$where('this.advcnt > this.usecnt')
                 .exec(function(err,count){
                     if(err)
                     {
                         var result = {"result":-1,"error":err.toString()};
                         res.send(result);
                     }
                     else
                     {
                         var result = {"result":count};
                         res.send(result);
                     }
                 });
         }
     });
});

module.exports = router;