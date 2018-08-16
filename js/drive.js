/**!
 * Google Drive File Picker Example
 * By Daniel Lo Nigro (http://dan.cx/)
 */
(function() {
	/**
	 * Initialise a Google Driver file picker
	 */
	var FilePicker = window.FilePicker = function(options) {
		// Config
		this.apiKey = options.apiKey;
		this.clientId = options.clientId;
		
		// Elements
        this.buttonEl = options.buttonEl;
        this.logoutEl = options.logoutEl;
		
		// Events
		this.onSelect = options.onSelect;
        this.buttonEl.addEventListener('click', this.open.bind(this));
        this.logoutEl.addEventListener('click', function(){
            if(!this.classList.contains('disabled'))
            {
                gapi.auth.signOut();
                this.classList.add('disabled');
            }
        }.bind(this.logoutEl));
	
		// Disable the button until the API loads, as it won't work properly until then.
		this.buttonEl.disabled = true;

		// Load the drive API
		gapi.client.setApiKey(this.apiKey);
		gapi.client.load('drive', 'v2', this._driveApiLoaded.bind(this));
		google.load('picker', '1', { callback: this._pickerApiLoaded.bind(this) });
	}

	FilePicker.prototype = {
		/**
		 * Open the file picker.
		 */
		open: function() {		
			// Check if the user has already authenticated
			var token = gapi.auth.getToken();
			if (token && !this.logoutEl.classList.contains("disabled")) {
                this._showPicker();
                this.logoutEl.classList.remove("disabled");
			} else {
				// The user has not yet authenticated with Google
				// We need to do the authentication before displaying the Drive picker.
				this._doAuth(false, function() {
                    this._showPicker();
                    this.logoutEl.classList.remove("disabled");
                }.bind(this));
			}
		},
		
		/**
		 * Show the file picker once authentication has been done.
		 * @private
		 */
		_showPicker: function() {
            var accessToken = gapi.auth.getToken().access_token;
            var view = new google.picker.DocsView(google.picker.ViewId.DOCS);
            view.setMimeTypes("video/mp4,application/x-zip");
            view.setQuery("-title:*.zip");
            view.setMode(google.picker.DocsViewMode.LIST);
			this.picker = new google.picker.PickerBuilder().
				addView(view).
				setAppId(this.clientId).
				setOAuthToken(accessToken).
                setCallback(this._pickerCallback.bind(this)).
				build().
                setVisible(true);
		},
		
		/**
		 * Called when a file has been selected in the Google Drive file picker.
		 * @private
		 */
		_pickerCallback: function(data) {
			if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
				var file = data[google.picker.Response.DOCUMENTS][0],
					id = file[google.picker.Document.ID],
					request = gapi.client.drive.files.get({
						fileId: id
					});
					
				request.execute(this._fileGetCallback.bind(this));
			}
		},
		/**
		 * Called when file details have been retrieved from Google Drive.
		 * @private
		 */
		_fileGetCallback: function(file) {
			if (this.onSelect) {
				this.onSelect(file);
			}
		},
		
		/**
		 * Called when the Google Drive file picker API has finished loading.
		 * @private
		 */
		_pickerApiLoaded: function() {
			this.buttonEl.disabled = false;
		},
		
		/**
		 * Called when the Google Drive API has finished loading.
		 * @private
		 */
		_driveApiLoaded: function() {
			this._doAuth(true);
		},
		
		/**
		 * Authenticate with Google Drive via the Google JavaScript API.
		 * @private
		 */
		_doAuth: function(immediate, callback) {	
            if(this.logoutEl.classList.contains("disabled"))
            {
                gapi.auth.authorize({
                    client_id: this.clientId + '.apps.googleusercontent.com',
                    scope: 'https://www.googleapis.com/auth/drive',
                    authuser: -1,
                    immediate: immediate
                }, callback);
            }
            else
            {
                gapi.auth.authorize({
                    client_id: this.clientId + '.apps.googleusercontent.com',
                    scope: 'https://www.googleapis.com/auth/drive',
                    immediate: immediate
                }, callback);
            }
		}
	};
}());

function importDrive(file)
{
    var accessToken = gapi.auth.getToken().access_token;
    switch(file.mimeType)
    {
        case "application/x-zip":
        case "video/mp4":
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://www.googleapis.com/drive/v3/files/' + file.id + '?alt=media', true);
            xhr.setRequestHeader('Authorization','Bearer ' + accessToken);

            xhr.responseType = 'blob';
            showLoader();
            xhr.onload = function(e) {
                if (this.status == 200) {
                    var blob = this.response;
                    let type = "";
                    if(file.mimeType == "video/mp4")
                        type = "video/mp4";
                    var tempFile = new File([blob], file.title, {"type": type});
                    handleFile(tempFile);
                }
            };
            xhr.send();
            break;
    }
}

function initPicker() {
    var picker = new FilePicker({
        apiKey: 'AIzaSyBNvbE95WObsTDKxj8Eo7x2jfCmP99oxNA',
        clientId: '44440188363-5vnafandpsrppr9189u7sc8q755oar9d',
        buttonEl: document.getElementById('pick'),
        logoutEl: document.getElementById('logout-button'),
        onSelect: importDrive
    });	
}