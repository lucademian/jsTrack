document.getElementById("new-track-button").addEventListener("click", function(){
    newTrack.show();
});
document.getElementById("new-scale-button").addEventListener("click", function(){
    newScale.show();
});

document.getElementById("track-list").querySelector("ul").querySelectorAll("li").forEach(function(element){
    element.addEventListener("click", function(){
        let uid = this.getAttribute("data-uid");
        master.switchTrack(uid);
    });
    element.addEventListener("dblclick", function(){
        let uid = this.getAttribute("data-uid");
        if(master.trackList[uid] !== undefined)
        {
            editTrack.push({
                "name": master.trackList[uid].name,
                "color": master.trackList[uid].color,
                "unit": master.trackList[uid].unit.toString(),
                "uid": uid
            }).show();
        }
    });
});

var scaleMove = dragula([document.getElementById("scale-list").querySelector("ul")], {
    copy: true,
    removeOnSpill: true,
    moves: function(el, source, handle, sibling){
        if(handle.classList.contains("dragpart") || handle.closest(".dragpart") !== null)
        {
            return true;
        }
        else
        {
            return false;
        }
        //return !source.classList.contains("scale-display");
    },
    accepts: function(el, target, source, sibling){
        if(source.classList.contains("scale-display"))
        {
            return false;
        }
        else
        {
            return true;
        }
    }
});
var scaleDisplayMove = dragula([], {
    removeOnSpill: true
});

document.getElementById("track-list").querySelector("ul").querySelectorAll("li").forEach(function(el){
    scaleMove.containers.push(el.querySelector(".scale-display"));
    scaleDisplayMove.containers.push(el.querySelector(".scale-display"));
});

scaleMove.on("drop", function(el, target, source, sibling){
    target.querySelectorAll("li").forEach(function(el){
        el.remove();
    });
    target.appendChild(el);
    
    target.style.borderStyle = "solid";
});
scaleDisplayMove.on("remove", function(el, container, source){
    source.style.borderStyle = "dashed";
});