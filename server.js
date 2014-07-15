var express     = require('express');
var bodyParser  = require('body-parser');
var sql         = require('./lib/sql.js');

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'


var app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({limit: '50mb'}));

var router = express.Router();

// middleware to use for all requests
app.use(function(req, res, next) {
    // do logging
    console.log('Service at ' + req.path + ' called from ' + req.ip);
    next();
});

app.use(function(err,req,res,next)
{
    res.send(err);
});

app.listen(server_port, server_ip_address, function() {
  console.log('Listening on ' + server_ip_address + ":" + server_port);
});
