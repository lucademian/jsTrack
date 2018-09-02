/**!
 * Based on Google Drive File Picker Example
 * By Daniel Lo Nigro (http://dan.cx/)
 */
(function() {
	/**
	 * Initialise a Google Driver file picker
	 */
	var DriveUpload = window.DriveUpload = function(options) {
		// Config
		this.apiKey = options.apiKey;
		this.clientId = options.clientId;
		
		// Elements
		this.buttonEl = options.buttonEl;
        this.logoutEl = options.logoutEl;
		
        // Events
        this._getFile = options.getFile;
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
	}

	DriveUpload.prototype = {
		/**
		 * Open the file picker.
		 */
		open: function() {		
			// Check if the user has already authenticated
			var token = gapi.auth.getToken();
			if (token && !this.logoutEl.classList.contains("disabled")) {
				this._upload();
                this.logoutEl.classList.remove("disabled");
			} else {
				// The user has not yet authenticated with Google
				// We need to do the authentication before displaying the Drive picker.
				this._doAuth(false, function() {
                    this._upload();
                    this.logoutEl.classList.remove("disabled");
                }.bind(this));
			}
		},
		
		/**
		 * Show the file picker once authentication has been done.
		 * @private
		 */
		_upload: function() {
            var file = this._getFile(function(file, name, callback){
                var metadata = {
                    'name': name
                    // 'contentHints': {
                    //     'thumbnail': ,
                    //     'mimeType': 'image/png'
                    // }
                };
                var request = gapi.client.request({
                    path: '/upload/drive/v3/files',
                    method: 'POST',
                    params: {
                        'uploadType': 'resumable'
                    },
                    headers: {
                        'X-Upload-Content-Type': 'application/x-zip',
                        'X-Upload-Content-Length': file.byteLength,
                        'Content-Type': 'application/json; charset=UTF-8',
                        'Content-Length': JSON.stringify(metadata).utf8Length()
                    },
                    body: metadata
                }).then(function(response){
                    var resumableURI = response.headers.location;
                    var uploadFileRequest = new XMLHttpRequest();
                    uploadFileRequest.open('PUT', resumableURI, true);
                    uploadFileRequest.setRequestHeader('Authorization', 'Bearer ' + gapi.auth.getToken().access_token);
                    uploadFileRequest.setRequestHeader('Content-Type', 'application/x-zip');
                    uploadFileRequest.setRequestHeader('X-Upload-Content-Type', 'application/x-zip');
                    uploadFileRequest.onreadystatechange = function(){
                        if(uploadFileRequest.readyState === XMLHttpRequest.DONE)
                            callback(true);
                        else
                            callback(false);
                    };
                    uploadFileRequest.send(file);
                });
            });
		},
		
		/**
		 * Called when the Google Drive API has finished loading.
		 * @private
		 */
		_driveApiLoaded: function() {
            this.buttonEl.disabled = false;
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
                    immediate: immediate,
                    authuser: -1
                }, callback);
            }
            else
            {
                gapi.auth.authorize({
                    client_id: this.clientId + '.apps.googleusercontent.com',
                    scope: 'https://www.googleapis.com/auth/drive',
                    immediate: immediate,
                }, callback);
            }
		}
	};
}());