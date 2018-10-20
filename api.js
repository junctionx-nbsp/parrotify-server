var config = require('./config'),
	request = require('request'),
	randomstring = require("randomstring");

class api {
	constructor() {
		console.debug("Constructed api");
		this.correlationId = null;
	}

	register() {
		console.log("Registering hooks for the Nokia API");

		if (this.correlationId !== null) {
			console.warn("Tried to subscribe more times than supposed to.");
			return;
		}

		this.correlationId = randomstring.generate();
		console.debug("Generated correlationId: " + this.correlationId);

		this.call("/callnotification/v1/subscriptions/callDirection", {
			callDirectionSubscription: {
				callbackReference: {
					notifyURL: config.ngrok_url
				},
				filter: {
					address: [
						config.sip_number
					],
					criteria: [
						"CalledNumber"
					],
					addressDirection: "Called"
				},
				clientCorrelator: this.correlationId
			}
		}, "POST");
	}

	unregister(cb) {
		console.log("Unregistering hooks for the Nokia API");

		this.call("/callnotification/v1/subscriptions/callDirection/subs?Id=" + encodeURIComponent(this.correlationId) + "&addr=" + encodeURIComponent(config.sip_number), null, "DELETE", cb);
	}

	call(url, body, method, cb, tryCount) {
		if (!tryCount) tryCount = 1;
		console.debug("Calling " + url + " with method: " + method);
		const reqParams = {
			headers: {
			  'Content-Type': 'application/json',
			  "authorization": config.api_key
			},
			uri: 'https://mn.developer.nokia.com/tasseeAPI' + url,
			method: method
		};

		if (method === "POST") {
			reqParams.body = JSON.stringify(body);
		}

		request(reqParams, function (error, response, responseBody) {
			console.log('Server responded with:', response.statusCode);

			if (error) {
				console.error('Api call failed', url, error);
			}

			if (response.statusCode === 504 && tryCount < 3) {
				console.log("Received proxy error. Re-trying... Count: " + tryCount);

				this.call(url, body, method, cb, tryCount ++);
			} else {
				if (cb) {
					cb(responseBody, error);
				}
			}
		});
	}
}

if (!global.hasOwnProperty('NOKIA_API')) {
  global.NOKIA_API = new api();
}

module.exports = global.NOKIA_API;