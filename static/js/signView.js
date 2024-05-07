const toHome = ()=>{
    window.location.href = "/sign/"
}
const sign_data = JSON.parse(document.getElementById('sign_data').textContent);
const is_signed = JSON.parse(document.getElementById('is_signed').textContent);
const doc_id = JSON.parse(document.getElementById('doc_id').textContent);
const file_url = JSON.parse(document.getElementById('file_url').textContent);

var signedNumbers = {}


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
    fetchFileAsBlob(file_url)
    .then(blob => {
        convertPDFtoHTML(blob)
    })
    .catch(error => {
        console.error("Error fetching file as blob:", error);
    });
})


function showSign(){
    
    if(is_signed){
        for (const page_num in sign_data) {
            for(const sign_num in sign_data[page_num]){
                const sign = sign_data[page_num][sign_num]
                var signArea = `
                    <div 
                        id="sign_page_${page_num}_${sign_num}" class="text-center p-2 sign_area"
                        style= "${sign.style}"
                    >
                    ${sign.sign}
                    </div>`
                $(`#con_${page_num}`).append(signArea)
            }
        }
    }else{
        for (const page_num in sign_data) {
            for(const sign_num in sign_data[page_num]){
                const sign = sign_data[page_num][sign_num]
                var signArea = `
                    <div 
                        id="sign_page_${page_num}_${sign_num}" data-page=${page_num} data-sign=${sign_num} class="text-center bg-warning text-dark border border-2 border-dark p-2 signs"
                        style= "${sign.style}"
                    >
                    <b>#${sign_num} Sign Here</b>
                    </div>`
                $(`#con_${page_num}`).append(signArea)
                signedNumbers[`${page_num}_${sign_num}`] = false
            }
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
                            <img style="border: 2px solid black;display:block; height: auto;" src="${canvas.toDataURL('image/png')}">
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

var headers = {
    "X-CSRFToken": $("input[name=csrfmiddlewaretoken]").val()
}

$(document).on("click", ".signs", function(){
    var color = $("#signature_colour").val()
    if($("#sign_text").val().trim()){
        var sign = `<b style="color:${color};">${$("#sign_text").val()}</b>`
        var page_num = $(this).data("page")
        var sign_num = $(this).data("sign")
        sign_data[page_num][sign_num] = {
            "style": $(this).attr("style"),
            "sign": sign
        }
        signedNumbers[`${page_num}_${sign_num}`] = true
        $(this).html(sign)
        $(this).removeClass("bg-warning")
        $(this).removeClass("border")
        $(this).removeClass("border-2")
        $(this).css({"opacity": "100%"})
        
    }else{
        alertify.error("Please enter the signature")
    }
})

$(document).on("click", "#save_sign", function(){
    for(key in signedNumbers){
        if(!signedNumbers[key]){
            alertify.error("Please sign all sign areas.")
            return false
        }
    }
    $.ajax({
        headers:headers,
        data:{
            "sign_data": JSON.stringify(sign_data),
        },
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
