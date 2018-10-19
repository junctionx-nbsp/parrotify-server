var bodyParser = require('body-parser')
var express = require('express');
var app = express();

// parse application/json
app.use(bodyParser.json())

var consts = require('./constants')



app.post('/', function (req, res) {
	// TODO Interact with Nokia TAS
	/*

	res.send(consts.continueA)

	*/
});