const toSignArea = ()=>{
    window.location.href = "/sign/area/"
}
$(document).on("change", "#doc_type", function(){
    var doc_type = $(this).val()
    if(doc_type=="to"){
        $("#dynamic").text("From")
    }else{
        $("#dynamic").text("To")
    }
    $.ajax({
        method:"GET",
        url:`/sign/?doc_type=${doc_type}`,
        success: function(res){
            $("#table_body").html(res.template)
        }

    })
})

$(document).on("click", "#logout", function(){
    $("#logout_form").submit()
})