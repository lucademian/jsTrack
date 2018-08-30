interact("#sidebar").resizable({
    edges: { left: true },
    restrictEdges: {
        outer: 'parent',
        endOnly: true,
    },

    // minimum size
    restrictSize: {
        min: { width: 400},
        max: {width: window.innerWidth - 300}
    },

    inertia: true,
})
.on('resizemove', function (event) {
    var target = event.target;

    // update the element's style
    target.style.width  = event.rect.width + 'px';
    document.getElementById("sidebar-visibility").style.right = event.rect.width + 'px';
})
.on('resizeend', drawGraphics);

var panelMove = dragula([document.getElementById("sidebar")], {
    direction: "vertical",
    moves: function(el, source, handle, sibling){
        if(!handle.classList.contains("handle-bar"))
        {
            return false;
        }
        else
        {
            handle.style.cursor = "grabbing";
            return true;
        }
    }
});

var scroll = 0;
var interval = false;
panelMove.on("drag", function(el){
    el.querySelector(".handle-bar").style.cursor = "grabbing";
    interval = window.setInterval(function(){
        let position = document.querySelector(".gu-mirror").getBoundingClientRect();

        if(panelMove.dragging)
        {
            if(position.top < 100)
            {
                scroll = -1;
            }
            else if(position.top > window.innerHeight - 100)
            {
                scroll = 1;
            }
            else
            {
                scroll = 0;
            }
        }
        else
        {
            scroll = 0;
        }
        document.getElementById("sidebar").scrollTop += scroll * 20;
    }, 100);
})
.on("dragend", function(el){
    el.querySelector(".handle-bar").style.cursor = "grab";
    if(interval !== false)
    {
        clearInterval(interval);
        interval = false;
    }
});

var resizeTimer;
window.addEventListener("resize", function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawGraphics, 250);
    document.getElementById("sidebar-visibility").style.right = sidebar.offsetWidth + 'px';
});

window.addEventListener("beforeunload", function (e) {
    if(master.saved)
        return null;
    else
    {
        var confirmationMessage = "You have made unsaved changes. If you leave without saving these changes will be lost.";

        (e || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    }
});