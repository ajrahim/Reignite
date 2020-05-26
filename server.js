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
sgMail.setApiKey("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");




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

app.get('/', function (req, res){ 
    res.render('home', {});
});

// app.get('/business/:path', function (req, res){ 
    
//     admin.firestore().collection("businesses").where('path', '==', req.params.path).get().then(snapshot => {
//         if(snapshot.docs.length == 0){
//             res.redirect('/');
//         }else{
//             res.render('business', {id : snapshot.docs[0].id, data : snapshot.docs[0].data()});
//         }
//     }).catch(err => {
//         res.redirect('/');
//     });

// });


app.all('/business/:path', function (req, res){ 
    console.log({ amount : req.body.amount, name : req.body.recepient, email : req.body.email});
    admin.firestore().collection("businesses").where('path', '==', req.params.path).get().then(snapshot => {
        if(snapshot.docs.length == 0){
            res.redirect('/');
        }else{
            res.render('business', {id : snapshot.docs[0].id, data : snapshot.docs[0].data(), reignite : { amount : req.body.reigniteamount, name : req.body.reigniterecepient, email : req.body.reigniteemail} });
        }
    }).catch(err => {
        res.redirect('/');
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
                                    
                                    var data = { card: CardReponse.token, sender: req.body.sender, business : req.body.business, recepient_name : req.body.recepient_name, recepient_email : req.body.recepient_email, amount : req.body.amount, id : crypto.randomBytes(64).toString('hex') + "-" + crypto.randomBytes(64).toString('hex') + "-" + crypto.randomBytes(64).toString('hex') };

                                    admin.firestore().collection('cards').add(data).then(ref => {

                                        const msg = {
                                            to: 'aj@ajr.co',
                                            from: 'aj@ajr.co',
                                            subject: 'Someone just sent you a $20 Gift Card to XYZ',
                                            html: "This is a sample message to test the email : <a href='http://localhost:6050/card/" + data.id+ "'>View Card</a>",
                                        };

                                        sgMail.send(msg);
                                        res.send({error : false});

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

app.get('/card/:id', function (req, res){ 

    admin.firestore().collection("cards").where('id', '==', req.params.id).get().then(snapshot => {
        if(snapshot.docs.length == 0){
            res.redirect('/');
        }else{
            request('https://sandbox-api.marqeta.com/v3/cards/' + snapshot.docs[0].data().card + '/showpan?show_cvv_number=true', { json: true, headers: { "Authorization" : "Basic OGZlNTIyNjctNGZlZi00OGE3LWJkMGQtODMwMDJlZDgxODA1OmZjZDg1Zjk0LTFlOTItNDgxYS05YTJmLWExYWJjNzgwMzI1NQ=="} }, function(Error, Request, Response) {
                if(Error){
                    res.redirect('/');
                }else{
                    admin.firestore().collection("businesses").get(snapshot.docs[0].data().business).then(BusinessSnapshot => {
                        res.render('card', { amount : snapshot.docs[0].data().amount, card : Response, business : BusinessSnapshot.docs[0].data()});
                    });
                }
            });
        }
    }).catch(err => {
        res.redirect('/');
    });

});


// ========= SOCKET LISTEN ====================================================================

var port = process.env.PORT || 6050;
var server = app.listen(port, function () {
    var host = server.address().address
    var port = server.address().port
});
