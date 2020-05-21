// ===========================================================================================
// ===========================================================================================
//
//      Gifty
//      Made by AJ Rahim
//
// ===========================================================================================
// ===========================================================================================


var express = require('express');
var jade = require('pug');
var bodyParser = require('body-parser');
var request = require('request');
var admin = require("firebase-admin");

var serviceAccount = require("./gifty.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gifty-63c8e.firebaseio.com"
});


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

app.get('/business/:path', function (req, res){ 
    
    admin.firestore().collection("businesses").where('path', '==', req.params.path).get().then(snapshot => {
        if(snapshot.docs.length == 0){
            console.log("empty");
            res.render('setup', {});
        }else{
            console.log("not empty");
            res.render('business', {id : snapshot.docs[0].id, data : snapshot.docs[0].data()});
        }

    }).catch(err => {
        console.log("empty");
        res.render('setup', {});
    });

});

app.post('/create/card', function(req, res){


    request('https://sandbox-api.marqeta.com/v3/users', { json: true, body: {}, headers: { "Authorization" : "Basic OGZlNTIyNjctNGZlZi00OGE3LWJkMGQtODMwMDJlZDgxODA1OmZjZDg1Zjk0LTFlOTItNDgxYS05YTJmLWExYWJjNzgwMzI1NQ=="} }, function(UserError, UserRequest, UserResponse) {
        if(UserError){
            res.send({error : true});
        }else{
            var FundingData = { "postal_code": req.body.zip, "user_token": UserResponse.data[0].token, "is_default_account": true, "exp_date": req.body.expiration, "account_number": req.body.number, "cvv_number": req.body.cvv };
            request.post('https://sandbox-api.marqeta.com/v3/fundingsources/paymentcard', { json: true, body: FundingData, headers: { "Authorization" : "Basic OGZlNTIyNjctNGZlZi00OGE3LWJkMGQtODMwMDJlZDgxODA1OmZjZDg1Zjk0LTFlOTItNDgxYS05YTJmLWExYWJjNzgwMzI1NQ=="} }, function(FundingError, FundingRequest, FundingReponse) {
                if(FundingError){
                    res.send({error : true});
                }else{
                    var CardData = { "user_token": UserResponse.data[0].token, "card_product_token": "1ec77617-b736-476f-a79b-38b8aa82308d" };
                    request.post('https://sandbox-api.marqeta.com/v3/cards', { json: true, body: CardData, headers: { "Authorization" : "Basic OGZlNTIyNjctNGZlZi00OGE3LWJkMGQtODMwMDJlZDgxODA1OmZjZDg1Zjk0LTFlOTItNDgxYS05YTJmLWExYWJjNzgwMzI1NQ=="} }, function(CardError, CardRequest, CardReponse) {
                        if(CardError){
                            res.send({error : true});
                        }else{
                            var OrderData = { "user_token": UserResponse.data[0].token, "amount": req.body.amount, "currency_code": "USD", "funding_source_token": FundingReponse.token };
                            request.post('https://sandbox-api.marqeta.com/v3/gpaorders', { json: true, body: OrderData, headers: { "Authorization" : "Basic OGZlNTIyNjctNGZlZi00OGE3LWJkMGQtODMwMDJlZDgxODA1OmZjZDg1Zjk0LTFlOTItNDgxYS05YTJmLWExYWJjNzgwMzI1NQ=="} }, function(OrderError, OrderRequest, OrderReponse) {
                                if(OrderError){
                                    res.send({error : true});
                                }else{
                                    
                                    var data = { card: CardReponse.token, sender: req.body.sender, business : req.body.business, recepient_name : req.body.recepient_name, recepient_email : req.body.recepient_email, amount : req.body.amount };
                                    console.log(data);
                                    admin.firestore().collection('cards').add(data).then(ref => {
                                        res.send({error : false})
                                    });

                                }
                            });
                        }
                    });
                }
            });
        }
    });


});

app.get('/card/:teset', function (req, res){ 

    request('https://sandbox-api.marqeta.com/v3/cards/f5916fb3-953d-4d83-9d29-64ef99f618e6/showpan?show_cvv_number=true', { json: true, headers: { "Authorization" : "Basic OGZlNTIyNjctNGZlZi00OGE3LWJkMGQtODMwMDJlZDgxODA1OmZjZDg1Zjk0LTFlOTItNDgxYS05YTJmLWExYWJjNzgwMzI1NQ=="} }, function(Error, Request, Response) {
        if(Error){
            res.send({error : true});
        }else{
            res.render('card', Response);
        }
    });
});

// ========= SOCKET LISTEN ====================================================================

var port = process.env.PORT || 6050;
var server = app.listen(port, function () {
    var host = server.address().address
    var port = server.address().port
});
