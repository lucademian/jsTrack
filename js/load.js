function loadVideo(file, callback=null)
{
    master.videoFile = file;
    master.timeline.video.src = URL.createObjectURL(file);
    if(callback !== null)
    {
        master.timeline.video.addEventListener("playing", callback);
    }
}

function loadProject(file, callback=null)
{
    let fileUrl = URL.createObjectURL(file);
    JSZipUtils.getBinaryContent(fileUrl, function(err, data) {
        if(err) {
            throw err; // or handle err
        }
    
        JSZip.loadAsync(data).then(function (data) {
            if(data.files["video.mp4"] !== undefined){
                data.file("video.mp4").async("blob").then(function(videoBlob){
                    loadVideo(videoBlob, function(){
                        if(data.files["meta.json"] !== undefined)
                        {
                            data.file("meta.json").async("text").then(function(projectJson){
                                master.load(JSON.parse(projectJson));
                                hideLoader();
                                master.saved = true;
                                master.trigger("created");
                                if(callback !== null)
                                    callback();
                            });
                        }
                    });
                });
            }
        });
    });
}