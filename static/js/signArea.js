const toHome = ()=>{
    window.location.href = "/sign/"
}
var totalPage=0
var currentPage = 0
var top_per = 1
var left_per = 2
var addedPages = []
var page_data = {}
var recievers = []

function resetAll(){
    currentPage = 0
    top_per = 1
    left_per = 2
    addedPages = []
    recievers = []
    page_data = {}
    $("#sliders").hide()
    $("#pagenum").val("")
    $("#remove_sign").hide()
    $("#area_added").hide()
}

function convertPDFtoHTML(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const arrayBuffer = event.target.result;
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.worker.min.js';
        pdfjsLib.getDocument(arrayBuffer).promise.then(function(pdf) {
            let htmlContent = '';
            const numPages = pdf.numPages;
            totalPage = numPages
            const promises = [];
            
            for (let i = numPages; i >= 1; i--) {
                const pagePromise = pdf.getPage(i).then(function(page) {
                    const scale = 1.5;
                    const viewport = page.getViewport({scale: scale});
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
                    const renderTask = page.render(renderContext);
                    return renderTask.promise.then(function() {
                        htmlContent += `<div><b>Page ${i} of ${numPages}</b></div>`
                        htmlContent += `<div style="page-break-before: always;width: fit-content;">`;
                        htmlContent += `<div style="position: relative; width: fit-content;">
                            <img style="border: 2px solid black;display:block; height: auto;" src="${canvas.toDataURL('image/png')}">
                            <div id="sign_page_${i}"" class="bg-warning text-dark border border-2 border-dark p-2" style="display:none;">
                            <b>Sign Here</b>
                            </div>
                            </div>`
                        htmlContent += `</div>`;
                    });
                });
                promises.push(pagePromise);
            }
            Promise.all(promises).then(function() {
                document.getElementById('htmlOutput').innerHTML = htmlContent;
                $("#page-form").show()
                resetAll()
            });
        });
    };
    reader.readAsArrayBuffer(file);
}

function moveSign(){
    var style= `opacity: 85%; position: absolute; left:${left_per}%; top: ${top_per}%`
    $(`#sign_page_${currentPage}`).attr("style", style)
    page_data[currentPage] = {top:top_per, left: left_per}
}

function checkSignedArea(){
    $("#added_pages").html("")
    for(var i=0; i<addedPages.length; i++){
        $("#added_pages").append(
            `<div class="bg-primary pl-2 pr-2 pt-1 pb-1 text-light ml-1"><b>${addedPages[i]}</b></div>`
        )
    }
}

$(document).on("click", "#add_sign", function(){
    var pageNum = $("#pagenum").val()
    if(!pageNum.trim() || pageNum==0){
        alertify.error("A valid page number is required")
        $("#sliders").hide()
        return false
    }else if(pageNum>totalPage){
        alertify.error(`This document has only ${totalPage} pages`)
        $("#sliders").hide()
        return false
    }else{
        $("#sliders").show()
        currentPage = pageNum
        addedPages.push(currentPage)
        addedPages = [...new Set(addedPages)]
        top_per = 1
        left_per = 2
        $("#verticalRange").val(top_per)
        $("#horizontalRange").val(left_per)
        moveSign()
        $("#remove_sign").show()
        checkSignedArea()
        $("#area_added").show()
    }
})

$(document).on("click", "#remove_sign", function(){
    $(this).hide()
    $("#pagenum").val("")
    $("#sliders").hide()
    $(`#sign_page_${currentPage}`).hide()
    addedPages.splice(addedPages.indexOf(currentPage), 1)
    if(addedPages.length == 0){
        $("#area_added").hide()
    }
    checkSignedArea()
    delete page_data[currentPage]
})
$(document).on("change", ".slider", function(){
    var element = $(this)
    if(element.attr("id")==="verticalRange"){
        top_per = element.val()
    }else{
        left_per = element.val()
    }
    moveSign()
})

function checkRecievers(){
    $("#recievers").html("")
    for(var i=0; i<recievers.length; i++){
        $("#recievers").append(
            `<label class="mt-2">${recievers[i]}</label>
            <a style="cursor:pointer;" data-email="${recievers[i]}" class="ml-2 remove_email text-danger">Remove</a>
            <br>`
        )
    }
}

const validateEmail = (email) => {
return String(email)
    .toLowerCase()
    .match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

$(document).on("click", "#add_reciever", function(){
    var email = $("#email").val()
    if(!validateEmail(email)){
        alertify.error("Please enter a valid email")
        return false
    }
    if (!email.trim()){
        alertify.error("Email is required")
        return false
    }
    if (recievers.indexOf(email)=== -1){
        recievers.push(email)
        checkRecievers()
    }else{
        alertify.error("Reciever already added")
    }
})

$(document).on("click", ".remove_email", function(){
    var email = $(this).data("email")
    recievers.splice(recievers.indexOf(email), 1)
    checkRecievers()
})

var headers = {
    "X-CSRFToken": $("input[name=csrfmiddlewaretoken]").val()
}
$(document).on("click", "#send_doc", function(){
    if(!$("#doc_name").val().trim()){
        alertify.error("Document name is required")
        return false
    }
    if(!recievers.length){
        alertify.error("Add atleast 1 reciever")
        return false
    }
    var fileInput = document.getElementById('select_file');
    formData = new FormData()
    formData.append('file', fileInput.files[0])
    formData.append('doc_name', $("#doc_name").val())
    formData.append('recievers', JSON.stringify(recievers))
    formData.append('page_data', JSON.stringify(page_data))
    $.ajax({
        headers:headers,
        data:formData,
        method:"POST",
        url:"/sign/area/",
        processData: false, 
        contentType: false,
        success: function(response) {
            $("#close_but").click()
            if(response.status){
                alertify.success("Successfully submitted")
                setTimeout(()=>{
                    window.location.href = "/sign/"
                },1500)
            }else{
                alertify.error("Something went wrong")
            }
        },
        error: function(xhr, status, error) {
            alertify.error(error)
        }
    })
})
