var Reignite=Reignite||(function () {

    var BaseURL = "https://hellogifty.herokuapp.com";

    var GenerateHTML = function(url){
        var reignite_html = `
            <div class="reignite-base">
                <div class="reignite-menu">
                    <form action="` + BaseURL + `/business/` + url + `" method="post" id="Reignite">
                        <div class="reignite-menu-top"><span class="reignite-menu-top-title">Send a Gift Card</span><span class="reignite-menu-top-subtitle">Help support a local business.</span></div>
                        <div class="reignite-menu-amounts">
                            <div id="reignite-amount-15" onclick="Reignite.Set(15);" class="reignite-amount-list-item"><span>$15</span></div>
                            <div id="reignite-amount-20" onclick="Reignite.Set(20);" class="reignite-amount-list-item"><span>$20</span></div>
                            <div id="reignite-amount-50" onclick="Reignite.Set(50);" class="reignite-amount-list-item reignite-selected"><span>$50</span></div>
                            <div id="reignite-amount-100" onclick="Reignite.Set(100);" class="reignite-amount-list-item"><span>$100</span></div>
                            <div id="reignite-amount-other" onclick="Reignite.Custom();" class="reignite-amount-list-item"><span>Other</span></div>
                        </div>
                        <div class="reignite-input-wrapper reignite-input-wrapper-amount" style="display: none;">
                            <div class="reignite-input-label">Gift Card Amount</div>
                            <div class="reignite-input-icon">$</div>
                            <input type="text" placeholder="0" name="reigniteamount" class="reignite-input-amount">
                        </div>
                        <div class="reignite-input-wrapper">
                            <div class="reignite-input-label">Recepient Name</div>
                            <input type="text" placeholder="Ex. John Smith" name="reigniterecepient">
                        </div>
                        <div class="reignite-input-wrapper">
                            <div class="reignite-input-label">Recepient Email</div>
                            <input type="text" placeholder="Ex. recepient@example.com" name="reigniteemail">
                        </div>
                        <input type="submit" value="Send"><a href="" class="reignite-menu-powered">Powered by Reignite</a>
                    </form>
                </div>
                <div onclick="Reignite.Toggle();" class="reignite-selector"></div>
                <img src="` + BaseURL + `/inc/images/ext.card.png" class="reignite-base-card">
            </div>
        `;

        return reignite_html;
    }

    return {
        Toggle: function(input){
            document.querySelector(".reignite-menu").classList.toggle("reignite-menu-visible");
        },

        Set : function(reigniteamx){
            $(".reignite-input-amount").val(reigniteamx);
            $(".reignite-amount-list-item").removeClass("reignite-selected");
            $("#reignite-amount-"  + reigniteamx).addClass("reignite-selected");
            $(".reignite-input-wrapper-amount").hide();
        },

        Custom : function(){
            $(".reignite-input-amount").val("");
            $(".reignite-amount-list-item").removeClass("reignite-selected");
            $("#reignite-amount-other").addClass("reignite-selected");
            $(".reignite-input-wrapper-amount").show();
        },

        init : function(options){
            document.body.innerHTML += GenerateHTML(options.business)
            Reignite.Set(15);
        }

    }
})();
