

var uid;

var app = {
    
    domain : "https://hellogifty.herokuapp.com/",

    document : {
        id : null,
        image : null,
        name : null,
        path : null,
        website : null,
        color : null,
        website : null
    },

    business : {
        init : function(){

            db.collection("businesses").where("owner", "==", uid).get().then(function(results) {

                if(results.docs.length == 0){
                    $(".document").html("EMPTY");
                    db.collection("businesses").add({
                        owner: uid,
                        logo: "",
                        name : "",
                        path : "",
                        website : "",
                        color : "",
                        website : ""
                    }).then(function(docRef) {
                        $(".document").html("Here : " + docRef.id);
                        console.log("Document written with ID: ", docRef.id);
                    }).catch(function(error) {
                        console.error("Error adding document: ", error);
                    });
                }else{
                    results.forEach(function(doc) {
                        $(".document").html("Here : " + doc.id);
                        app.document.id = doc.id;
                        app.document.logo = doc.data().logo;
                        app.document.name = doc.data().name;
                        app.document.website = doc.data().website;
                        app.document.path = doc.data().path;
                        app.document.color = doc.data().color;
                        app.document.website = doc.data().website;
                        app.display();
                    });
                }

            }).catch(function(error) {
                console.log("Error getting documents: ", error);
            });
        },

        path : function(append = ""){
            var business = $(".business").val();
            var business_simple = business.replace(/([,.€])+/g, '');
            $(".path").val(business_simple.replace(/\s+/g, '-').toLowerCase() + append);
            app.business.validate();
        },

        website : function(){
            app.document.website = $('.website').val();
            app.business.update({website : app.document.website});
        },

        validate : function(){
            var pathsimple = $(".path").val().replace(/([,.€])+/g, '');
            $(".path").val(pathsimple.replace(/\s+/g, '-').toLowerCase());

            
            app.business.availability($('.path').val(), function(available){
                if(available){
                    app.document.path = $('.path').val();
                    app.document.name = $('.business').val();
                    app.document.website = $('.website').val();
                    app.business.update({name : app.document.name, website : app.document.website, path: app.document.path});
                }else{
                    app.business.path("-" + S4() + "-" + S4());
                }
            });
        },

        availability : function(path, callback){

            db.collection("businesses").where("owner", "==", uid).get().then(function(results) {

                if(results.docs.length == 0){
                    callback(true);
                }else{
                    callback(false);
                }

            }).catch(function(error) {
                callback(false);
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
        $('.business').val(app.document.name);
        $('.path').val(app.document.path);
        $('.website').val(app.document.website);
        $(".image").html("<img src='" + app.document.logo + "' />");
        $(".color-hex").html(app.document.color);
        pickr.setColor(app.document.color, false);
        $(".link").val(app.domain + app.document.path);
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

let fileUpload = document.getElementById("logo");


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
        // No user is signed in.
    }
});

function generate(){
    var business = $(".business").val();
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
    $(".image").html("<img src='" + app.document.logo + "' />");
}


const pickr = Pickr.create({
    el: '.color',
    theme: 'nano',
    swatches: [
        'rgba(244, 67, 54, 1)',
        'rgba(233, 30, 99, 1)',
        'rgba(156, 39, 176, 1)',
        'rgba(103, 58, 183, 1)',
        'rgba(63, 81, 181, 1)',
        'rgba(33, 150, 243, 1)',
        'rgba(3, 169, 244, 1)',
        'rgba(0, 188, 212, 1)',
        'rgba(0, 150, 136, 1)',
        'rgba(76, 175, 80, 1)',
        'rgba(139, 195, 74, 1)',
        'rgba(205, 220, 57, 1)',
        'rgba(255, 235, 59, 1)',
        'rgba(255, 193, 7, 1)'
    ],
    components: {
        preview: true,
        hue: true,
        interaction: {
            input: true
        }
    }
}).on('changestop', (color, instance) => {
    app.document.color = color._color.toHEXA().toString();
    app.business.update({color : app.document.color});
});