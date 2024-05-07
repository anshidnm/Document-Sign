const toHome = ()=>{
    window.location.href = "/sign/"
}
var totalPage=0
var signData = {}
var recievers = []
var selectedArea = false

function resetAll(){
    recievers = []
    $("#instruction").show()
    $("#settings").hide()

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
            
            for (let i = 1; i <= numPages; i++) {
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
                        htmlContent += `<div id="con_${i}" class="page_container" data-page="${i}" style="position: relative; width: fit-content;">
                            <img style="border: 2px solid black; display:block; height: auto;" src="${canvas.toDataURL('image/png')}" class="sign_click">
                            </div>`
                        htmlContent += `</div>`;
                    });
                });
                promises.push(pagePromise);
            }
            Promise.all(promises).then(function() {
                document.getElementById('htmlOutput').innerHTML = htmlContent;
                resetAll()
            });
        });
    };
    reader.readAsArrayBuffer(file);
}

function addSign(page, signNum){
    $(`#sign_page_${page}_${signNum}`).draggable({ containment: "parent" })
    $(`#sign_page_${page}_${signNum}`).resizable({containment: `#con_${page}`})
}


$(document).on("change", "#fontSize", function(){
    var fontSize = $(this).val()
    var [page, sign] = selectedArea.split(":")
    $(`#sign_page_${page}_${sign}`).css("font-size", `${fontSize}px`)
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
    formData.append('sign_data', JSON.stringify(signData))
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


$(document).on("click", ".page_container", function(e){
    var isClickable = e.target.className == "sign_click"
    if(!selectedArea && isClickable){
        $("#settings").hide()
        var newSign = 1
        var offsetX = e.offsetX
        var offsetY = e.offsetY

        const page = $(this).data("page")
        var pageData = signData[page]
        if(!pageData){
            pageData = {}
        }else{
            newSign = Object.keys(pageData).length + 1
        }
        var signArea = `
        <div 
            id="sign_page_${page}_${newSign}" data-page="${page}" data-sign="${newSign}" class="text-center bg-warning text-dark border border-2 border-dark p-2 sign_area"
            style= "cursor: pointer; opacity: 85%; position: absolute; left:${offsetX}px; top: ${offsetY}px; height: 50px; width: 160px; font-size:18px;"
        >
        <b>#${newSign} Sign Here</b>
        </div>`
        $(this).append(signArea)    
        addSign(page, newSign)
        pageData[newSign] = {style: $(`#sign_page_${page}_${newSign}`).attr("style")}
        signData[page] = pageData
    }else if(selectedArea && isClickable){
        $("#settings").hide()
        selectedArea = 0
        $(".sign_area").removeClass("bg-primary")
        $(".sign_area").addClass("bg-warning")
    }
    showSendArea()
})

function showSendArea(){
    if(Object.keys(signData).length){
        $("#send_area").show()
    }else{
        $("#send_area").hide()
    }
}

function fetchLatestSignData(element){
    var data = element.attr("style")
    return data
}

$(document).on("mouseup", ".sign_area", function(){
    const data = fetchLatestSignData($(this))
    var page = $(this).data("page")
    var sign = $(this).data("sign")
    signData[page][sign].style = data
})

$(document).on("click mousedown", ".sign_area", function(){
    var page = $(this).data("page")
    var sign = $(this).data("sign")
    $(".sign_area").removeClass("bg-primary")
    $(".sign_area").addClass("bg-warning")
    selectedArea = `${page}:${sign}`
    $("#settings").show()
    $("#selection").text(`You have selected sign number ${sign} in page ${page}`)
    $(this).removeClass("bg-warning")
    $(this).addClass("bg-primary")
    const data = fetchLatestSignData($(this))
    signData[page][sign].style = data
})


$(document).on("click", "#remove_but", function(){
    var [page, sign] = selectedArea.split(":")
    delete signData[page][sign]
    if(!Object.keys(signData[page]).length){
        delete signData[page]
    }
    $(`#sign_page_${page}_${sign}`).remove()
    $("#settings").hide()
    showSendArea()
})