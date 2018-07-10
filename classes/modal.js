class modal
{
    constructor(schema, create=false)
    {
        this.name = schema.name;
        this.id = schema.id;
        this.fields = schema.fields;
        this.buttons = schema.buttons;
        this.callbacks = {};
        this.created = false;

        if(create)
        {
            this.create();
        }
    }
    on(event, callback)
    {
        if(this.callbacks[event] === undefined)
            this.callbacks[event] = [];
        
        this.callbacks[event].push(callback);

        if(event == "create" && this.created)
        {
            callback();
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
            let formItemLabel = document.createElement("label");
            formItemLabel.innerText = this.fields[field].label + ":";
            formItemLabel.for = this.id + "_input-" + field;
            let formItemInput = document.createElement("input");
            formItemInput.type = this.fields[field].type;
            formItemInput.name = formItemLabel.for;
            formItemInput.id = formItemLabel.for;
            formItemInput.setAttribute("data-key", field);
            this.fields[field].id = formItemLabel.for;
            this.fields[field].element = formItem;
            
            if(this.fields[field].initVal === undefined)
                this.fields[field].initVal = "";
            
            formItem.appendChild(formItemLabel);
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
}