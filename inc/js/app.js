

var uid;

var app = {
    
    domain : "https://hellogifty.herokuapp.com/",

    document : {
        id : null,
        image : null,
        name : null,
        path : null,
        website : null,
        location : null
    },

    business : {

        init : function(){

            db.collection("businesses").where("owner", "==", uid).get().then(function(results) {

                if(results.docs.length == 0){
                    db.collection("businesses").add({
                        owner: uid,
                        logo: "",
                        name : "",
                        path : "",
                        website : "",
                        location : ""
                    }).then(function(docRef) {
                        setTimeout(function(){app.business.slide(1)}, 100);
                    }).catch(function(error) {
                    });
                }else{
                    results.forEach(function(doc) {
                        app.document.id = doc.id;
                        app.document.logo = doc.data().logo;
                        app.document.name = doc.data().name;
                        app.document.website = doc.data().website;
                        app.document.path = doc.data().path;
                        app.document.location = doc.data().location;
                        app.display();
                        setTimeout(function(){app.business.slide(1)}, 100);
                    });
                }

            }).catch(function(error) {
                console.log("Error getting documents: ", error);
            });
        },

        confirm : function(){
            if(app.document.name !== "" && app.document.name !== " " && app.document.path !== "" && app.document.path !== " " && app.document.website !== "" && app.document.website !== " " && app.document.location !== "" && app.document.location !== " ") {
                $(".continue span").html("Continue");
                $(".continue").removeClass("invalid");
            }else{
                $(".continue span").html("Complete Setup");
                $(".continue").addClass("invalid");
            }
        },

        continue : function(){
            if(app.document.name !== "" && app.document.name !== " " && app.document.path !== "" && app.document.path !== " " && app.document.website !== "" && app.document.website !== " " && app.document.location !== "" && app.document.location !== " ") {
                app.business.slide(2);
                $(".reignite-base").css("opacity", "1");
                $(".reignite-base").hide();
                $(".reignite-base").fadeIn();
            }
        },

        slide : function(index){
            $(".home-slider").css("left", "-" + (index * 100) + "%")
        },

        path : function(append = ""){
            var business = $(".setup-business").val();
            var business_simple = business.replace(/([,.€])+/g, '');
            $(".path").val(business_simple.replace(/\s+/g, '-').toLowerCase() + append);
            app.business.validate();
        },

        website : function(){
            app.document.website = $(".setup-website").val();
            app.business.update({website : app.document.website});
        },
        websitetext : function(){
            app.document.website = $(".setup-website").val();
            app.business.confirm();
        },

        location : function(){
            app.document.location = $(".setup-location").val();
            app.business.update({location : app.document.location});
        },

        validate : function(){
            var pathsimple = $(".path").val().replace(/([,.€])+/g, '');
            $(".path").val(pathsimple.replace(/\s+/g, '-').toLowerCase());

            
            app.business.availability($('.path').val(), function(available){
                if(available){
                    app.document.path = $('.path').val();
                    app.document.name = $(".setup-business").val();
                    app.document.website = $(".setup-website").val();
                    app.document.location = $(".setup-location").val();
                    app.business.update({name : app.document.name, website : app.document.website, path: app.document.path});
                }else{
                    app.business.path("-" + S4());
                }
            });
        },

        availability : function(path, callback){

            db.collection("businesses").where("path", "==", path).get().then(function(results) {

                if(results.docs.length == 0){
                    callback(true);
                }else{
                    callback(false);
                }

            }).catch(function(error) {
                callback(true);
            });

        },

        update : function(data){
            var docre = db.collection("businesses").doc(app.document.id);
            docre.update(data).then(function() {
                app.display();
                console.log("Document successfully updated!");
            }).catch(function(error) {
                console.error("Error updating document: ", error);
            });
        }
    },

    display : function(){
        $(".setup-business").val(app.document.name);
        $('.path').val(app.domain + "business/" + app.document.path);
        $(".setup-website").val(app.document.website);
        $(".setup-location").val(app.document.location);
        $(".setup-logo-image").html("<img src='" + app.document.logo + "' />");
        $(".link").val(app.domain + "business/" + app.document.path);
        $(".business-path").html(app.document.path);
        $(".order").attr("href", app.domain + "business/" + app.document.path);
        app.business.confirm();
    },

    copy : function(){
        $(".link").select();
        document.execCommand("copy");
        alert("Copied URL");
    }

};

function GoogleLogin(){
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(function(result) {

        var token = result.credential.accessToken;
        var user = result.user;
        var uid = user.uid;
        getdocument();


    }).catch(function(error) {
        console.log(error);

        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;

    });
}


function AppleLogin(){
    var provider = new firebase.auth.OAuthProvider('apple.com');
    firebase.auth().signInWithPopup(provider).then(function(result) {
        var token = result.credential.accessToken;
        var user = result.user;
        var uid = user.uid;
        getdocument();
    })
    .catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
    });
}

let fileUpload = document.getElementById("setup-logo");


fileUpload.addEventListener('change', function(evt) {
    var id = ID();
    let storageRef = firebase.storage().ref(id);
    let firstFile = evt.target.files[0] // upload the first file only
    let uploadTask = storageRef.put(firstFile)
    setTimeout(function(){
        app.document.logo = "https://firebasestorage.googleapis.com/v0/b/gifty-63c8e.appspot.com/o/" + id + "_500x500?alt=media";
        app.business.update({ logo : "https://firebasestorage.googleapis.com/v0/b/gifty-63c8e.appspot.com/o/" + id + "_500x500?alt=media" })
    }, 5000);
})

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        uid = user.uid;
        app.business.init();
    } else {
    }
});

function generate(){
    var business = $(".setup-business").val();
    var business_simple = business.replace(/([,.€])+/g, '');
    $(".path").val(business_simple.replace(/\s+/g, '-').toLowerCase());
    validate();
}

function validate(){
    var pathsimple = $(".path").val().replace(/([,.€])+/g, '');
    $(".path").val(pathsimple.replace(/\s+/g, '-').toLowerCase());
}

function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}

function ID(){
    return (S4() + S4() + "-" + S4() + S4() + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
}


function display(result){
    $(".setup-logo-image").html("<img src='" + app.document.logo + "' />");
}
