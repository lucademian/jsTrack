function hideLaunchModal()
{
    document.getElementById("modal-container").classList.remove("active");
    document.getElementById("modal-container").classList.remove("launch");
    document.getElementById("launch").classList.remove("active");
    document.getElementById("help-fab").remove();
    document.getElementById("github-fab").remove();
    
    keyboardJS.resume();
}

var dropArea = document.getElementById("file-drop-area");

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function(eventName) {
    dropArea.addEventListener(eventName, function preventDefaults (e) {
        e.preventDefault()
        e.stopPropagation()
    }, false);
    document.body.addEventListener(eventName, function preventDefaults (e) {
        e.preventDefault()
        e.stopPropagation()
    }, false);
});



['dragenter', 'dragover'].forEach(function(eventName) {
    dropArea.addEventListener(eventName, function(e){
        dropArea.classList.add('highlight');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, function(){
        dropArea.classList.remove('highlight');
    }, false);
});

dropArea.addEventListener('drop', function(e){
    showLoader();
    console.log(e);
    let dt = e.dataTransfer
    let files = dt.files

    handleFiles(files);
}, false);

document.getElementById("file-input").addEventListener("change", function(e){
    handleFiles(this.files);
    showLoader();
});