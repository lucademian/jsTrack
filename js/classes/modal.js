class modal
{
    constructor(schema, create=true)
    {
        this.name = schema.name;
        this.id = schema.id;
        this.fields = schema.fields;
        this.buttons = schema.buttons;
        this.callbacks = {};
        this.created = false;
        this.defaultColors = ["#FFFF00", "#FFFF33", "#F2EA02", "#E6FB04", "#FF0000", "#FD1C03", "#FF3300", "#FF6600", "#00FF00", "#00FF33", "#00FF66", "#33FF00", "#00FFFF", "#099FFF", "#0062FF", "#0033FF", "#FF00FF", "#FF00CC", "#FF0099", "#CC00FF", "#9D00FF", "#CC00FF", "#6E0DD0", "#9900FF"];

        if(create)
        {
            this.create();
        }
    }
    on(event, callback)
    {
        let events = event.split(",");

        for(var i = 0; i < events.length; i++)
        {
            let tempEvent = events[i].trim();
            if(this.callbacks[tempEvent] === undefined)
                this.callbacks[tempEvent] = [];
            
            this.callbacks[tempEvent].push(callback);

            if(tempEvent == "create" && this.created)
            {
                callback.call(this, this.export());
            }
        }
        return this;
    }
    show()
    {
        document.getElementById("modal-container").classList.add("active");
        document.getElementById(this.id).classList.add("active");
        return this;
    }
    hide()
    {
        document.getElementById("modal-container").classList.remove("active");
        document.getElementById(this.id).classList.remove("active");
        return this;
    }
    create(show=false)
    {
        let titleElement = document.createElement("div");
        titleElement.classList.add("modal-title");
        titleElement.innerText = this.name;

        this.element = document.createElement("div");
        this.element.classList.add("modal");
        this.element.id = this.id;
        this.element.appendChild(titleElement);

        for(var field in this.fields)
        {
            let formItem = document.createElement("div");
            formItem.classList.add("form-item");
            formItem.setAttribute("data-key", field);
            let formInputId = this.id + "_input-" + field;
            let formItemInput = document.createElement("input");
            if(this.fields[field].type == "color")
            {
                formItemInput.type = "text";
                formItemInput.classList.add("colorpicker");
                this.fields[field].picker = new CP(formItemInput);
                this.fields[field].picker.on("change", function(color) {
                    this.target.value = '#' + color;
                    this.target.style.background = "#" + color;
                });
            }
            else
                formItemInput.type = this.fields[field].type;
            formItemInput.name = formInputId;
            formItemInput.id = formInputId;
            formItemInput.setAttribute("data-key", field);
            this.fields[field].id = formInputId;
            this.fields[field].element = formItem;
            
            if(this.fields[field].initVal === undefined)
            {
                if(this.fields[field].type == "color")
                {
                    this.fields[field].initVal = this.defaultColors[Math.floor(Math.random()*this.defaultColors.length)];
                }
                else
                {
                    this.fields[field].initVal = "";
                }
            }
            formItemInput.value = this.fields[field].initVal;
            if(this.fields[field].type == "color")
            {
                formItemInput.style.background = this.fields[field].initVal;
                this.fields[field].picker.set(this.fields[field].initVal);
            }
            
            if(this.fields[field].type !== "hidden")
            {
                let formItemLabel = document.createElement("label");
                formItemLabel.innerText = this.fields[field].label + ":";
                formItemLabel.for = formInputId;
                formItem.appendChild(formItemLabel);
            }

            formItem.appendChild(formItemInput);
            this.element.appendChild(formItem);
        }

        var buttonContainer = document.createElement("div");
        buttonContainer.classList.add("form-buttons");

        for(var button in this.buttons)
        {
            let buttonItem = document.createElement("button");
            buttonItem.type = "button";
            buttonItem.id = this.id + "_button-" + button;
            buttonItem.innerText = this.buttons[button].label;
            let modal = this;
            let buttonTemp = button;
            buttonItem.addEventListener("click", function(){
                modal.trigger(buttonTemp);
            });
            buttonContainer.appendChild(buttonItem);
        }
        this.element.appendChild(buttonContainer);

        document.getElementById("modal-container").appendChild(this.element);

        this.created = true;
        this.trigger("create");

        if(show)
            this.show();
        
        return this;
    }
    trigger(event)
    {
        if(this.callbacks[event] !== undefined)
        {
            for(var i=0; i < this.callbacks[event].length; i++)
            {
                this.callbacks[event][i].call(this, this.export());
            }
        }
    }
    export()
    {
        var exportData = {};
        for(var field in this.fields)
        {
            if(document.getElementById(this.fields[field].id).value.length > 0)
            {
                exportData[field] = document.getElementById(this.fields[field].id).value;
            }
            else
            {
                return false;
            }
        }
        return exportData;
    }
    clear()
    {
        for(var field in this.fields)
        {
            if(this.fields[field].initVal === undefined)
                this.fields[field].initVal = "";
            
            document.getElementById(this.fields[field].id).value = this.fields[field].initVal;
        }
        return this;
    }
    push(value)
    {
        for(var field in value)
        {
            if(this.fields[field] !== undefined)
            {
                document.getElementById(this.fields[field].id).value = value[field];
                if(this.fields[field].type == "color")
                {
                    this.fields[field].picker.set(value[field]);
                    document.getElementById(this.fields[field].id).style.background = value[field];
                }
            }
        }
        return this;
    }
}