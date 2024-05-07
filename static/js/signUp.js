var error = $("#error").val()

if(error.trim()){
    alertify.error(error)
    error = ""
}
const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

$(document).on("click", "#submit_but", function(){
    var email = $("#email").val()
    var name = $("#name").val()
    var pw1 = $("#pw1").val()
    var pw2 = $("#pw2").val()
    if(!email.trim()){
        alertify.error("Email is required")
        return false
    }
    if(!validateEmail(email)){
        alertify.error("Please enter a valid email")
        return false
    }
    if(!name.trim()){
        alertify.error("Name is required")
        return false
    }
    if(!pw1.trim()){
        alertify.error("Password is required")
        return false
    }
    if(pw1.length < 8){
        alertify.error("Password minimum 8 characters required")
        return false
    }
    if(pw1 != pw2){
        alertify.error("Passwords are not match")
        return false
    }
    $("#signup_form").submit()
})
