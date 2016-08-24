var express = require('express');
var router = express.Router();
var gcm = require('node-gcm');


var sendPush = function (req, res, isGet)
{

	var token;
	var msg;
	var serverKey = "AIzaSyDnViEe69ZlInHBz2HoJAeTZl8xtQBtpBI";



	var data = req.body.data;
	console.log('data===>' + data);

	token  = data.token;
	console.log('token===>' + token);

	msg  = data.msg;
	console.log('msg===>' + msg);

	//appid = jsonPrams.appid;
	//console.log('appid===>' + appid);

	//serverKey = jsonPrams.serverKey;
	//console.log('serverKey===>' + serverKey);

	//token = jsonPrams.token;
	//console.log('token===>' + token);

	if(isGet)
	{
		token = req.params.token;
		msg = req.params.msg;
	}
	else
	{
		console.log('msg===>' + msg);
	}

	var message = new gcm.Message({
		collapseKey: 'demo',
		priority: 'high',
		contentAvailable: true,
		delayWhileIdle: true,
		timeToLive: 3,

		data: data,
		notification: data
	});
	/*

	 */
	var sender = new gcm.Sender(serverKey);
	//var registrationIds = [token];     // 여기에 pushid 문자열을 넣는다.
	var arrayToken = [token];

//	var registrationTokens = ['fAYF-y48_nU:APA91bH12M-is9TSqWDB8CgauBIFgNNkFq0W08oxYBle_yKyvR-TU2eyiJoEMibI1zjANdNGmhDtD2EqyMNpO4rGzCoUwPJdkE0bcLaSO9kukUSvbvs5jrkqK7qNPsgXiiBM5uPEazou','eugCvcUOq9E:APA91bELDtWS6ObJzyxr9ICx2wWW6idWNtLaK5Ez8brZJCGK1hyNhGtSA6x-8DO2fSpJD_kx6Q_pleHpQdJLFL_5gJjGMphf2EoErdpichAJcpj8sz7vNun_H4yM1Y4yn1SWu8fprmJG'];

	var registrationTokens = [];

	for(var i = 0; i < arrayToken.length; i++)
	{
		console.log('===>' + arrayToken[i]);
		registrationTokens.push(arrayToken[i]); 
	}


	sender.send(message, { registrationTokens : registrationTokens }, function (err, response) {
		res.send(response);
		//console.log('token result===>' + response.suss);
		//res.redirect('/token/list/0/1/');

	});


}

/* GET push sender. */
router.get('/', function(req, res) {
  res.send('respond with a resource => ');
});

router.get('/:token/:msg', function (req, res) {
	sendPush(req, res, true)
});

router.post('/', function (req, res) {
    //res.send('token : ' + req.body.token + ' data : ' + req.body.data + ' message : ' + req.body.data.message);

//	var json = req.body;
	//res.send('token : ' + json.token.length);
	sendPush(req, res, false);
	console.log("push result ===>" + req);
});


module.exports = router;
