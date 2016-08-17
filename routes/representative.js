/**
 * Created by master on 2016-08-09.
 */
var path = require('path');
var objname = path.basename(__filename, '.js');

var CRUD = require('../routes/crud');
var options = {};
options["objname"] = objname;
var router = CRUD.defaultRouter(options);

module.exports = router;
