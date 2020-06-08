// ===========================================================================================
// ===========================================================================================
//
//      Gifty
//      Made by AJ Rahim
//
// ===========================================================================================
// ===========================================================================================


const express = require('express');
const jade = require('pug');
const bodyParser = require('body-parser');
const request = require('request');
const admin = require("firebase-admin");
const cors = require('cors');
const crypto = require('crypto');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey("sendgridkey");




var serviceAccount = require("./gifty.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gifty-63c8e.firebaseio.com"
});


var app = express();


// ========= SETUP EXPRESS ===================================================================

app.locals.moment = require('moment');
app.use(cors());
app.options('*', cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/inc', express.static('inc'));
app.set('view options', { pretty: true });
app.set('view engine', 'jade');


// ========= PRIMARY ROUTES ====================================================================

app.get('/', function (req, res){ require('./routes/app').init(req, res); });
app.get('/card/:id', function (req, res){ require('./routes/app').card(req, res, admin, request); });
app.all('/business/:path', function (req, res){ require('./routes/app').business(req, res, admin,); });
app.post('/create/card', function(req, res){ require('./routes/app').create(req, res, admin, crypto, sgMail, request); });


// ========= SOCKET LISTEN ====================================================================

var port = process.env.PORT || 6050;
var server = app.listen(port, function () {
    var host = server.address().address
    var port = server.address().port
});
