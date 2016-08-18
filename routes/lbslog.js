/**
 * Created by master on 2016-08-08.
 */
/**
 * Created by master on 2016-02-19.
 */
var path = require('path');
var objname = path.basename(__filename, '.js');

var CRUD = require('../routes/crud');
var options = {};
options["objname"] = objname;
options["searchname"] = "email";
var router = CRUD.defaultRouter(options);

module.exports = router;