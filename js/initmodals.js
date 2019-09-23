/**
 * jsTrack: web-based Tracker (https://physlets.org/tracker/). Get position data from objects in a video.
 * Copyright (C) 2018 Luca Demian
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * 
 * Contact:
 * 
 * Luca Demian
 * jstrack.luca@gmail.com
 * 
 */

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
        "videospeed": {
            "label": "Speed of video",
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