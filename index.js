var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var engine = require('./engine');
var fs = require('fs');
var rmdirSync = require('rmdir-sync');;
var touch = require('touch');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
 
app.post('/start', function (req, res) {
	engine.start();
	res.send('OK');
});

app.get('/clear', function(req, res) {
	rmdirSync('public/download');
	fs.mkdirSync('public/download');
	touch('public/download/.gitkeep');
	res.send("OK! :)");
});
 
var server = app.listen(process.env.PORT || 3000, function(){
  console.log('server is running at %s', server.address().port);
});