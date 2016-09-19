/**
 * Created by master on 2016-09-12.
 */
var path = require('path');
var objname = path.basename(__filename, '.js');

var CRUD = require('../routes/crud');
var options = {};
options["objname"] = objname;
options["searchname"] = ["loc","atitle"];
var router = CRUD.defaultRouter(options);

var cmd = process.cwd();
var ModelObj = require(cmd + "/models/"+ objname);

router.get('/api/list', function(req, res, next) {

    ModelObj.find({showyn:true},{aobjid:1,typ:1,saving:1,url:1,loc:1,attaches:1,regdate:1},function(err,docs){
        if(err)
        {
            var result = {"result":-1,"error":err.toString()};
            res.send(result);
        }
        else
        {
            res.send(docs);
        }
    });

});

module.exports = router;