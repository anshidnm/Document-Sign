const toHome = ()=>{
    window.location.href = "/sign/"
}
var signedPages = []
const page_data = JSON.parse(document.getElementById('page_data').textContent);
const sign = JSON.parse(document.getElementById('sign').textContent);
const is_signed = JSON.parse(document.getElementById('is_signed').textContent);
const doc_id = JSON.parse(document.getElementById('doc_id').textContent);

function fetchFileAsBlob(url) {
return fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.blob();
    });
}

$(document).ready(function(){
    var url = $("#file_url").val()
    fetchFileAsBlob(url)
    .then(blob => {
        convertPDFtoHTML(blob)
    })
    .catch(error => {
        console.error("Error fetching file as blob:", error);
    });
})

function showSign(){
    
    if(is_signed){
        for (const key in page_data) {
            var style= `position: absolute; left:${page_data[key].left}%; top: ${page_data[key].top}%`
            $(`#sign_page_${key}`).show()
            $(`#sign_page_${key}`).attr("style", style)
            $(`#sign_page_${key}`).html(`<b>${sign}</b>`)
            document.getElementById(`sign_page_${key}`).className = ""
        }
    }else{
        for (const key in page_data) {
            var style= `opacity: 85%; position: absolute; left:${page_data[key].left}%; top: ${page_data[key].top}%; cursor:pointer;`
            $(`#sign_page_${key}`).attr("style", style)
            $(`#sign_page_${key}`).show()
        }
    }
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
                            <div data-page="${i}" id="sign_page_${i}" class="signs bg-warning text-dark border border-2 border-dark p-2" style="display:none;">
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
                showSign()
            });
        });
    };
    reader.readAsArrayBuffer(file);
}

$(document).on("keyup", "#sign_text", function(){
    if($(this).val().trim()){
    signedPages = [...new Set(signedPages)]
    for(var i=0; i<signedPages.length; i++){
        $(`#sign_page_${signedPages[i]}`).html(`<b>${$(this).val()}</b>`)
    }
}
})

var headers = {
    "X-CSRFToken": $("input[name=csrfmiddlewaretoken]").val()
}
$(document).on("click", ".signs", function(){
    if($("#sign_text").val().trim()){
        $(this).html(`<b>${$("#sign_text").val()}</b>`)
        $(this).removeClass("bg-warning")
        $(this).removeClass("border")
        $(this).removeClass("border-2")
        $(this).css({"opacity": "100%"})
        signedPages.push($(this).attr("data-page"))
    }else{
        alertify.error("Please enter the signature")
    }
})

$(document).on("click", "#save_sign", function(){
    signedPages = [...new Set(signedPages)]
    if(!$("#sign_text").val().trim()){
        alertify.error("Please enter a signature")
        return false
    }

    if(signedPages.length != Object.keys(page_data).length){
        alertify.error("Please put signature in all given area")
        return false
    }
    data = {
        sign:$("#sign_text").val(),
    }
    $.ajax({
        headers:headers,
        data:data,
        method:"POST",
        url:`/sign/view/${doc_id}/`,
        success: function(response){
            if(response.status){
                alertify.success("Successfully submitted")
                setTimeout(()=>{
                    window.location.href = "/sign/"
                },1500)
            }else{
                alertify.error("Something went wrong")
            }
        }
    })
})
