
module.exports = {
    init : function(req, res){
        res.render('home', {});
    },

    business: function(req, res, admin){
        admin.firestore().collection("businesses").where('path', '==', req.params.path).get().then(snapshot => {
            if(snapshot.docs.length == 0){
                res.redirect('/');
            }else{
                res.render('business', {id : snapshot.docs[0].id, data : snapshot.docs[0].data(), reignite : { amount : req.body.reigniteamount, name : req.body.reigniterecepient, email : req.body.reigniteemail} });
            }
        }).catch(err => {
            res.redirect('/');
        });
    },

    card : function(req, res, admin, request){
        admin.firestore().collection("cards").where('id', '==', req.params.id).get().then(snapshot => {
            if(snapshot.docs.length == 0){
                res.redirect('/');
            }else{
                request('https://sandbox-api.marqeta.com/v3/cards/' + snapshot.docs[0].data().card + '/showpan?show_cvv_number=true', { json: true, headers: { "Authorization" : "Basic OGZlNTIyNjctNGZlZi00OGE3LWJkMGQtODMwMDJlZDgxODA1OmZjZDg1Zjk0LTFlOTItNDgxYS05YTJmLWExYWJjNzgwMzI1NQ=="} }, function(Error, Request, Response) {
                    if(Error){
                        res.redirect('/');
                    }else{
                        admin.firestore().collection("businesses").doc(snapshot.docs[0].data().business).get().then(BusinessSnapshot => {
                            res.render('card', { amount : snapshot.docs[0].data().amount, card : Response, business : BusinessSnapshot.data()});
                        });
                    }
                });
            }
        }).catch(err => {
            res.redirect('/');
        });
    },

    create: function(req, res, admin, crypto, sgMail, request){

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
                                        

                                        admin.firestore().collection("businesses").doc(req.body.business).get().then(BusinessSnapshot => {
                                            
                                            var data = { card: CardReponse.token, sender: req.body.sender, business : req.body.business, recepient_name : req.body.recepient_name, recepient_email : req.body.recepient_email, amount : req.body.amount, id : crypto.randomBytes(64).toString('hex') + "-" + crypto.randomBytes(64).toString('hex') + "-" + crypto.randomBytes(64).toString('hex') };

                                            admin.firestore().collection('cards').add(data).then(ref => {
        
                                                var emailHTML = '<html><body style="background: #f9f9f9;"><link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500&family=Open+Sans:wght@400;600&family=Pacifico&display=swap" rel="stylesheet"><div class="top" style="width: 100%;height: 400px;background: #FFD8BF;"> <div class="t" style="display: table;width: 100%;height: 100%;"> <div class="tc" style="display: table-cell;width: 100%;height: 100%;vertical-align: middle;"> <h1 style=" position: relative; top: 50px; text-align: center;margin-top: 0px;font-family: &quot;Pacifico&quot;;font-size: 100px;color: #345AE3;">Hello!</h1> </div> </div> </div> <div class="wrapper" style="width: 100%; padding-bottom: 30px; "> <div class="card rotate" style="position: relative;width: 410px;height: 250px;background: linear-gradient(135deg, #C56CD6 0%,#3425AF 100%);margin: 0px auto;margin-top: -125px;margin-bottom: 50px;border-radius: 20px;font-family: &quot;Barlow&quot;;box-shadow: 0px 0px 20px rgba(0,0,0,.25);animation: rotation .6s;animation-iteration-count: once;"> <div class="card-label noshadow" style="font-family: &quot;Barlow&quot;;letter-spacing: 3px;color: #fff;text-shadow: 1px 1px 2px rgba(0,0,0,.5);position: absolute;display: inline-block;top: 30px;left: 10%;font-size: 14px;">Gift Card</div> <div class="card-amount" style="font-family: &quot;Barlow&quot;;letter-spacing: 3px;color: #fff;text-shadow: 1px 1px 2px rgba(0,0,0,.5);position: absolute;display: inline-block;top: 20px;right: 25px;font-size: 34px;text-align: right;">$' + data.amount + '</div> <div class="card-number" style="font-family: &quot;Barlow&quot;;letter-spacing: 4px;color: #fff;text-shadow: 1px 1px 2px rgba(0,0,0,.5);position: absolute;display: inline-block;top: 100px;left: 10%;font-size: 24px;">**** **** **** ****</div> <div class="card-name" style="font-family: &quot;Barlow&quot;;letter-spacing: 3px;color: #fff;text-shadow: 1px 1px 2px rgba(0,0,0,.5);position: absolute;display: inline-block;top: 135px;left: 10%;font-size: 20px;">Lucky Customer</div> <div class="card-exp-label noshadow" style="font-family: &quot;Barlow&quot;;letter-spacing: 3px;color: #fff;text-shadow: 1px 1px 2px rgba(0,0,0,.5);position: absolute;display: inline-block;left: 10%;top: 200px;font-size: 15px;">Exp</div> <div class="card-cvv-label noshadow" style="font-family: &quot;Barlow&quot;;letter-spacing: 3px;color: #fff;text-shadow: 1px 1px 2px rgba(0,0,0,.5);position: absolute;display: inline-block;left: calc(10% + 130px);top: 200px;font-size: 15px;">CVV</div> <div class="card-exp" style="font-family: &quot;Barlow&quot;;letter-spacing: 3px;color: #fff;text-shadow: 1px 1px 2px rgba(0,0,0,.5);position: absolute;display: inline-block;left: calc(10% + 50px);top: 199px;font-size: 17px;">**/**</div> <div class="card-cvv" style="font-family: &quot;Barlow&quot;;letter-spacing: 3px;color: #fff;text-shadow: 1px 1px 2px rgba(0,0,0,.5);position: absolute;display: inline-block;left: calc(10% + 180px);top: 199px;font-size: 17px;">***</div> <img class="card-chip" src="https://hellogifty.herokuapp.com/inc/images/chip.png" style="font-family: &quot;Barlow&quot;;letter-spacing: 3px;color: #fff;text-shadow: 1px 1px 2px rgba(0,0,0,.5);right: 25px;top: 160px;width: 60px;position: absolute;"> </div> <a href="https://hellogifty.herokuapp.com/card/' + data.id +'" class="view" style="position: relative;margin: 0px auto;top: 0px;display: block;background: #345AE3;width: 100%;height: 50px;border-radius: 4px;text-align: center;text-decoration: none;cursor: pointer;transition: .3s;max-width: 400px;margin-bottom: 50px;"> <span style="position: relative;top: 14px;color: #fff; font-family: &quot;Open Sans&quot;;">View Card</span> </a> <div class="description" style="width: 400px;margin: 0px auto;font-size: 20px;line-height: 30px;color: #555;margin-bottom: 70px;text-align: center;"> <span class="name">' + data.sender + '</span> sent you a <span class="amount">$' + data.amount + '</span> gift card to <span class="business">' + BusinessSnapshot.data().name + '</span> a local business. You can use this gift card anytime on the web by visiting their website at <a href="' + BusinessSnapshot.data().website + '" class="website" style="color: #345AE3;text-decoration: none;">' + BusinessSnapshot.data().website + '</a> </div> <div class="powered" style="width: 80%;margin: 0px auto;text-align: center;margin-top: 30px;"> <div class="poweredby" style="font-size: 12px;color: rgb(0,0,0, 0.5);margin-bottom: 10px;">Powered by</div><img src="https://hellogifty.herokuapp.com/inc/images/logo-minimal.png" style="width: 80px;"> </div> </div> </body> </html>';

                                                const msg = {
                                                    to: data.recepient_email,
                                                    from: 'aj@ajr.co',
                                                    subject: data.sender + ' just sent you a $' + data.amount + ' Gift Card to ' + BusinessSnapshot.data().name,
                                                    html: emailHTML,
                                                };
        
                                                sgMail.send(msg);
                                                res.send({error : false});

                                            });
    
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

}
