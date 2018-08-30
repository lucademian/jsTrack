var helpText = new modal({
    name: "Directions",
    id: "help-modal",
    text: [
        "Welcome to JSTrack, an open source online version of <a href='https://physlets.org/tracker/'>Tracker</a>",
        "JSTrack makes it easy to create a new project. Simply drag your video file onto the box when the page opens. If you want to open an existing ." + CUSTOM_EXTENSION + " file, just drag that on instead of a video.",
        "<b>Tracking:</b> Once you have opened or created your project, the steps to begin tracking are very short. In the top of the sidebar to the right, you will see some buttons. The first button, which is three dots connected by diagonal lines, is what you click to create a new data track.",
        "After you click that and create your first track, you simply hold the <code>shift</code> button and click on the video using the new point tool.",
        "When you've finished your tracking, you can move the indicator arrows under the timeline to change the starting and ending frames of the movement",
        "<b>Scales:</b> You can add a scale at any time, before or after tracking, by clicking the button directly after the track button, which is three dots in a straight line.",
        "After creating this scale, you will be directed to click for the starting and ending points of the scale, and then enter the value. The default is 1m. To convert units within the scale value, use the <code>></code> key, like this: <code>4.3 in > m</code>.",
        "You can create as many tracks as you need, but only one scale.",
        "Seeking around a video is done by using the frame arrows to the right of the timeline, dragging the black line along the timeline, or by clicking a point while holding the CTRL or CMD keys, which will also select said point.",
        "Undo/Redo is done by clicking the buttons with arrows in the toolbox at the top of the sidebar, or with <code>CTRL/CMD + z</code> for undo or <code>CTRL/CMD + y</code> for redo"
    ],
    buttons: {
        "close": {
            label: "Close"
        }
    }
});

var newProject = new modal({
    name: "New Project",
    id: "new-project-modal",
    fields: {
        "name": {
            "label": "Name",
            "type": "text",
            "required": true
        },
        "framerate": {
            "label": "Framerate",
            "type": "number",
            "required": true,
            "initVal": "30"
        },
        "frameskip": {
            "label": "# of frames to move",
            "type": "number",
            "required": true,
            "initVal": 1
        },
        "axesColor": {
            "label": "Axes Color",
            "type": "color",
            "defaultValue": "#ff69b4",
            "required": true
        },
        "pointsBackward": {
            "label": "Points Before Current Time",
            "type": "number",
            "defaultValue": "7",
            "required": true
        },
        "pointsForward": {
            "label": "Points Ahead of Current Time",
            "type": "number",
            "defaultValue": "0",
            "required": true
        }
    },
    buttons: {
        "submit": {
            "label": "Create"
        }
    }
});

var saveProject = new modal({
    name: "Save Project",
    id: "save-project-modal",
    fields: {
        "filename": {
            "label": "Filename",
            "type": "text",
            "required": true
        }
    },
    buttons: {
        "cancel": {
            "label": "Cancel"
        },
        "saveFile": {
            "label": "Save as File",
            "image": "icons/save_file_white.svg"
        },
        "saveDrive": {
            "label": "Save to Drive",
            "image": "icons/drive_white.svg"
        }
    }
});

var editProject = new modal({
    name: "Edit Project",
    id: "edit-project-modal",
    fields: {
        "name": {
            "label": "Name",
            "type": "text",
            "required": true
        },
        "frameskip": {
            "label": "# of frames to move",
            "type": "number",
            "required": true,
            "initVal": 1
        },
        "axesColor": {
            "label": "Axes Color",
            "type": "color",
            "defaultValue": "#ff69b4",
            "required": true
        },
        "pointsBackward": {
            "label": "Points Before Current Time",
            "type": "number",
            "defaultValue": "7",
            "required": true
        },
        "pointsForward": {
            "label": "Points Ahead of Current Time",
            "type": "number",
            "defaultValue": "0",
            "required": true
        }
    },
    buttons: {
        "cancel": {
            "label": "Cancel"
        },
        "submit": {
            "label": "Save"
        }
    }
});

var exportData = new modal({
    name: "Export Data",
    id: "export-modal",
    fields: {
        "filename": {
            "label": "Filename",
            "type": "text",
            "required": true
        }
    },
    buttons: {
        "cancel": {
            "label": "Cancel"
        },
        "submit": {
            "label": "Export"
        }
    }
});

var newScale = new modal({
    name: "New Scale",
    id: "new-scale",
    fields: {
        "color": {
            "label": "Color",
            "type": "color",
            "required": true
        }
    },
    buttons: {
        "cancel": {
            "label": "Cancel"
        },
        "submit": {
            "label": "Create"
        }
    }
});

var editScale = new modal({
    name: "Edit Scale",
    id: "edit-scale",
    fields: {
        "color": {
            "label": "Color",
            "type": "color",
            "required": true
        }
    },
    buttons: {
        "cancel": {
            "label": "Cancel"
        },
        "submit": {
            "label": "Save"
        }
    }
});

var newTrack = new modal({
    name: "New Track",
    id: "new-track",
    fields: {
        "name": {
            "label": "Name",
            "type": "text",
            "required": true
        },
        "color": {
            "label": "Color",
            "type": "color",
            "required": true
        }
    },
    buttons: {
        "cancel": {
            "label": "Cancel"
        },
        "submit": {
            "label": "Create"
        }
    }
});

var editTrack = new modal({
    name: "Edit Track",
    id: "edit-track",
    fields: {
        "name": {
            "label": "Name",
            "type": "text",
            "required": true
        },
        "color": {
            "label": "Color",
            "type": "color",
            "required": true
        },
        "uid": {
            "type": "hidden"
        }
    },
    buttons: {
        "cancel": {
            "label": "Cancel"
        },
        "submit": {
            "label": "Save"
        }
    }
});