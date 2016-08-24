var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var user = require('./routes/user');
var station = require('./routes/station');
var admin = require('./routes/admin');
var advertise = require('./routes/advertise');
var uselog = require('./routes/uselog');
var board = require('./routes/board');
var version = require('./routes/version');
var upfile = require('./routes/upfile');
var apinfo = require('./routes/apinfo');
var apinfoApp = require('./routes/apinfoapp');
var advertiser = require('./routes/advertiser');
var representative = require('./routes/representative');
var lbslog = require('./routes/lbslog');
var inquire = require('./routes/inquire');
var sender  = require('./routes/sender');

var engine = require('ejs-locals');
var useragent = require('express-useragent');
var multer  = require('multer');



var app = express();
var upload = multer({dest: '/opt/touchdown/html/upload',
                  storage: multer.memoryStorage({})});

var mongoose = require('mongoose');

 mongoose.connect('mongodb://58.180.56.34:27017/touchdown');

 var db = mongoose.connection;
 db.on('error', console.error.bind(console, 'connection error:'));
 db.once('open', function callback () {
 console.log('connection successful...');
 });


// view engine setup
app.engine('ejs',engine);
app.set('views', path.join(__dirname, 'views'));
console.log(path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.set('view engine', 'ejs');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(useragent.express());

// simple cookie check
app.get('/*',function(req, res, next) {
    if (req.url.indexOf('/admin/login') < 0 && req.url.indexOf('/api') < 0) {
        if (req.cookies.uid) {
            next();
        } else {
            res.redirect('/srv/admin/login');
        }
    }
    else
        next();
});

app.use('/srv/', routes);
app.use('/srv/user', user);
app.use('/srv/station', station);
app.use('/srv/admin', admin);
app.use('/srv/advertise', advertise);
app.use('/srv/uselog', uselog);
app.use('/srv/board', board);
app.use('/srv/version', version);
app.use('/srv/apinfo', apinfo);
app.use('/srv/apinfoApp', apinfoApp);
app.use('/srv/upfile', upload.single('Filedata'), upfile);
app.use('/srv/advertiser', advertiser);
app.use('/srv/representative', representative);
app.use('/srv/lbslog', lbslog);
app.use('/srv/inquire', inquire);
app.use('/srv/sender', sender);
//app.use(upload.single('upfile'));



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
