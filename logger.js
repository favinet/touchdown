/**
 * Created by master on 2016-08-12.
 */
var logger = require("winston");
/*
var rotate = require('winston-daily-rotate-file');
var fs = require('fs');
var dir = './logs';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

logger.add( rotate, {
    level: 'debug',
    json: true,
    filename: dir + '/log-',
    datePattern: 'yyyy-MM-dd.log'
});
*/

require('winston-mongodb').MongoDB;
logger.add(logger.transports.MongoDB, {db:"mongodb://nzon:dpswhs*23@db.touch-down.co.kr:50000/touchdown_log"});
/*
logger.on('logging', function (transport, level, msg, meta) {
    // [msg] and [meta] have now been logged at [level] to [transport]
    if(level > 3)
    {

    }
});

logger.on('error', function (err) {
    // handle an error
});
*/
//logger.info('CHILL WINSTON!', { seriously: true });

//logger.remove(logger.transports.Console);
//logger.add(logger.transports.Console, {level: 'debug', colorize: true});

//add mongodb required

module.exports=logger;