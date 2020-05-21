var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ajrahim/ckaasapjh1c3g1ilgqzoyj4ps'
});

var business = {
    init : function(){
        new Cleave('.payment-currency', { creditCard: true, });
        new Cleave('.payment-expiration', { date: true, datePattern: ['m', 'y'] });
        business.amount.set(15);
    },

    amount : {
        set : function(amount){
            $(".recepient-amount").val(amount);
            $(".recepient-amount-list-item").removeClass("selected");
            $("#amount-"  + amount).addClass("selected");
            $(".input-wrapper-amount").hide();
        },

        custom : function(){
            $(".recepient-amount").val(0);
            $(".recepient-amount-list-item").removeClass("selected");
            $("#amount-other").addClass("selected");
            $(".input-wrapper-amount").show();
        }
    },

    card : {
        show : function(){
            $(".card-number").html(card.number);
            $(".card-exp").html(card.expiration);
            $(".card-cvv").html(card.cvv);
        },
        hide : function(){
            $(".card-number").html(card.number.replace(new RegExp("[0-9]", "g"), "X"));
            $(".card-exp").html(card.expiration.replace(new RegExp("[0-9]", "g"), "X"));
            $(".card-cvv").html(card.cvv.replace(new RegExp("[0-9]", "g"), "X"));
        },
        toggle : function(){
            ($("input[type='checkbox']").is(":checked")) ? business.card.show() : business.card.hide();
        }
    }

}
