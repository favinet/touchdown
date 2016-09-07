/**
 * Created by master on 2016-08-29.
 */
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var card = require('../routes/card');
var tag = require('../routes/taglog');

var useragent = require('express-useragent');
var winston = require("../logger");

var app = express();
var mongoose = require('mongoose');

//mongoose.connect('mongodb://58.180.56.34:27017/touchdown');
mongoose.connect('mongodb://nzon:dpswhs*23@db.touch-down.co.kr:50000/touchdown');

var db = mongoose.connection;
db.on('error', function callback (err){
    if(err)
    {
        winston.log('error','connection error... %s',err.descsription);
    }
});
db.once('open', function callback () {
    winston.log('info','connection successful...');
});

// view engine setup
// no view engine only api

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(useragent.express());

app.use('/arex/card', card);
app.use('/arex/tag', tag);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
