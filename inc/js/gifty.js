var Gifty=Gifty||(function () {

    //Accessible only here
    var privateArray=[];

    //Cannot be called from outside this function
    var privateFunction=function(){
    }

    //Return only what must be publicly accessible, in this
    //case only the show() method
    return {
        show: function(input){
            privateFunction();
            alert(input);
        }
    }
})();
