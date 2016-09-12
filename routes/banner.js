/**
 * Created by master on 2016-09-12.
 */
var path = require('path');
var objname = path.basename(__filename, '.js');

var CRUD = require('../routes/crud');
var options = {};
options["objname"] = objname;
options["searchname"] = ["loc","title"];
var router = CRUD.defaultRouter(options);

module.exports = router;