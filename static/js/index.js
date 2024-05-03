const toSignArea = ()=>{
    window.location.href = "/sign/area/"
}
$(document).on("change", "#doc_type", function(){
    var doc_type = $(this).val()
    if(doc_type=="to"){
        $("#dynamic").text("To")
    }else{
        $("#dynamic").text("From")
    }
    $.ajax({
        method:"GET",
        url:`/sign/?doc_type=${doc_type}`,
        success: function(res){
            $("#table_body").html(res.template)
        }

    })
})
