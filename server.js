// ===========================================================================================
// ===========================================================================================
//
//      Gift Card
//      Made by AJ Rahim
//
// ===========================================================================================
// ===========================================================================================


var express = require('express');
var jade = require('pug');
var bodyParser = require('body-parser');
var request = require('request');
var admin = require("firebase-admin");

// var serviceAccount = require("./localreport.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://localreport-ed109.firebaseio.com"
// });

// var https = require("https");

var app = express();

// ========= SETUP EXPRESS ===================================================================


app.locals.moment = require('moment');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/inc', express.static('inc'));
app.set('view options', { pretty: true });
app.set('view engine', 'jade');


app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});



// ========= PRIMARY ROUTES ====================================================================

app.get('/', function (req, res){ 
    res.render('home', {});
});

app.get('/setup', function (req, res){ 
    res.render('setup', {});
});


// ========= SOCKET LISTEN ====================================================================

var port = process.env.PORT || 6050;
var server = app.listen(port, function () {
    var host = server.address().address
    var port = server.address().port
});
