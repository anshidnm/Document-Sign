var error = $("#error").val()
if(error.trim()){
    alertify.error(error)
    error = ""
}
$(document).on("click", "#submit_but", function(){
    var email = $("#email").val()
    var pw1 = $("#pw1").val()
    if(!email.trim()){
        alertify.error("Email is required")
        return false
    }
    if(!pw1.trim()){
        alertify.error("Password is required")
        return false
    }
    $("#login_form").submit()
})
