/**
 * Created by master on 2016-08-12.
 */
//var path = process.cwd();
var path = require('path');
var moudleName = path.basename(__filename, '.js');

//console.log(path);


console.log(moudleName);

console.log(this.filename);



console.log(module.filename);



console.log(__filename);