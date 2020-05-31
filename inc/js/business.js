var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ajrahim/ckaer8khj1pfm1ipglpttpcew'
});

var business = {
    init : function(){
        new Cleave('.payment-number', { creditCard: true, });
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
            $(".recepient-amount").val("");
            $(".recepient-amount-list-item").removeClass("selected");
            $("#amount-other").addClass("selected");
            $(".input-wrapper-amount").show();
        }
    },

    purchase : function(){
        $.post( "/create/card", {
            business : business_id, 
            recepient_name : $(".recepient-name").val(),
            recepient_email : $(".recepient-email").val(),
            sender : $(".payment-name").val(), 
            expiration : $(".payment-expiration").val(),
            cvv : $(".payment-cvv").val(),
            number : $(".payment-number").val(), 
            zip : $(".payment-zip").val(),
            amount: parseInt($(".recepient-amount").val())
        }, function( data ) {
            if(data.error){
                swal("Oh no!", "We had a bit of trouble with the information provided. Please double check and try again.", "error");
            }else{
                swal("Sent!", "We successfully sent an email to " + $(".recepient-name").val() + "!", "success");

                $(".recepient-name").val("");
                $(".recepient-email").val("");
                $(".payment-name").val("");
                $(".payment-email").val("");
                $(".payment-expiration").val("");
                $(".payment-cvv").val("");
                $(".payment-number").val("");
                $(".payment-zip").val("");
                $(".recepient-amount").val("");
            }
        });
        
    },
    
    confirm : function(){
        if($(".recepient-amount").val() !== "" && $(".recepient-amount").val() !== " " && $(".recepient-name").val() !== "" && $(".recepient-name").val() !== " " && $(".recepient-email").val() !== "" && $(".recepient-email").val() !== " "){
            $(".order").removeClass("invalid");
            $(".order span").html("Continue")
            $(".order").attr("onclick", "business.continue();");
            $(".order b").show();
        }else{
            $(".order").addClass("invalid");
            $(".order span").html("Complete Form")
            $(".order").attr("onclick", "");
            $(".order b").hide();
        }
    },

    continue : function(){

        $(".recepient").hide();
        $(".payment").show();
        $(".order span").html("Send $" + $(".recepient-amount").val() + " Gift Card");
        $(".order").attr("onclick", "business.purchase();");
        $(".order b").removeClass(".fa-arrow-right");
        $(".order b").addClass(".fa-paper-plane");

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
    },

    geocode : function(location){
        $.get("https://api.mapbox.com/geocoding/v5/mapbox.places/" + location + ".json?access_token=pk.eyJ1IjoiYWpyYWhpbSIsImEiOiJja2FhcmszaTcwbnZoMnNyeTN4Mnpmc3E4In0.b7_QRUbfBsy5nLP3tgtE1A", function(data){
            var el = document.createElement('div');
            el.className = 'marker';
            new mapboxgl.Marker(el).setLngLat(data.features[0].center).addTo(map);
            map.flyTo({ center: data.features[0].center, zoom: 15 });
        });
    }

}
