/**
 * Created by master on 2016-01-26.
 */
var express = require('express');
var router = express.Router();

router.get('/login',function(req,res,next){
    res.render('common/login',{});
});



module.exports = router;