/**
 * Created by master on 2016-02-26.
 */
/**
 * Created by master on 2016-01-22.
 */
var path = require('path');
var objname = path.basename(__filename, '.js');

var CRUD = require('../routes/crud');
var options = {};
options["objname"] = objname;
options["searchname"] = ["title"];
var router = CRUD.defaultRouter(options);

var cmd = process.cwd();
var ModelObj = require(cmd + "/models/"+ objname);


router.post('/api/list', function(req, res, next) {
    //res.render('/api/list', { cat:'I' , page:1, cnt:20});
    //find saved :
    console.log(req.body);
    var json = req.body;
    var wobjid = json.wobjid;
    var page = (json.page)? parseInt(json.page) : 1;
    var cnt = (json.cnt)? parseInt(json.cnt) : 10;
    /*
    var tcnt = 0;
    ModelObj.count({cat:cat},
        function(err, count){
            tcnt = count;
            console.log("tcnt : " + tcnt);
        });
    */
    ModelObj.find({wobjid: wobjid})
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
});


router.post('/api/insert', function(req, res, next) {
    /*var title = req.body.title;
     var email = req.body.email;
     var content = req.body.content;
     var wobjid = req.body.wobjid;
     var wobjnm = req.body.wobjnm;
     var attaches = req.body.attaches.path; //crud.js 참조
     */
    //res.send(req.body);
    console.log(req.body);
    var json = req.body;
    var saveObj = new ModelObj(json);
    saveObj.save(function (err) {
        if(err){
            console.log(err);
            var result = {"result":-1,"error":err.toString()};
            res.send(result);
        }else{
            var result = {"result":1};
            res.send(result);
        }
    });
});

module.exports = router;
