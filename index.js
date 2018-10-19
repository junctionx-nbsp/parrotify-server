var bodyParser = require('body-parser'),
	express = require('express'),
	app = express(),
	port = 80,
	consts = require('./constants'),
	request = require('request');
app.use(bodyParser.json());

app.post('/', function (req, res) {
	var body = req.body;

	console.log(body);

	var notif = body.callEventNotification;

	request({
		headers: {
		  'Content-Type': 'application/json',
	/*
		},
		uri: 'https://mn.developer.nokia.com/callback/continueCalled',
		body: {
		    "callEventNotification": {
		        "notificationType": "CallDirection",
		        "eventDescription": {
		            "callEvent": "CalledNumber"
		        },
		        "callingParticipant": notif.callingParticipant,
		        "calledParticipant": notif.calledParticipant,
		        "callSessionIdentifier": notif.callSessionIdentifier,
		        "timestamp": notif.timestamp
		    }
		},
		method: 'POST'
	});
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))