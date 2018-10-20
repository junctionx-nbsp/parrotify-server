var bodyParser = require('body-parser'),
	express = require('express'),
	app = express(),
	port = 80,
	consts = require('./constants'),
	api = require("./api");
app.use(bodyParser.json());

app.post('/', function (req, res) {
	const body = req.body;

	if (body.hasOwnProperty("callEventNotification")) {
		console.log("Received a call notification");
		const notif = body.callEventNotification,
			type = notif.notificationType;

		if (type === "CallDirection") {
			res.json({
				action: {
					actionToPreform: "Continue",
					displayAddress: notif.calledParticipant
				}
			});
		}
	}
	else {
		console.log(body);
	}
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

api.register();
process.stdin.resume();

function exitHandler(options, exitCode) {
	console.log("Received SIGTERM. Code is: " + exitCode);
	api.unregister(function() {
    	if (options.exit) process.exit();
	});
}

process.on('exit', exitHandler.bind(null,{cleanup:true}));
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));