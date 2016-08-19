/**
 * Created by master on 2016-08-12.
 */
//var path = process.cwd();
var path = require('path');
var moudleName = path.basename(__filename, '.js');

var ch = "1,1,1,1";
console.log(Array.isArray(ch));
console.log(ch[0]);
console.log(ch.replace(/,/gi,"/"));


var search = ["1","한글","adfjkoasdfz"];

var route = (Array.isArray(search))? search.toString().replace(/,/gi,"/") : search;
route = encodeURIComponent(route).replace(/%2F/gi,"/");

console.log(route);

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