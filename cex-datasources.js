// # Building a Freeboard Plugin
//
// A freeboard plugin is simply a javascript file that is loaded into a web page after the main freeboard.js file is loaded.
//
// Let's get started with an example of a datasource plugin and a widget plugin.
//
// -------------------

// Best to encapsulate your plugin in a closure, although not required.
(function()
{
	// ## A Datasource Plugin
	//
	// -------------------
	// ### Datasource Definition
	//
	// -------------------

  this.httpGet = function(url)
  {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open( "GET", url, false ); // false for synchronous request
      xmlHttp.send( null );
      return xmlHttp.responseText;
  }

  this.getPairs = function() {
    var res = this.httpGet("https://cex.io/api/currency_limits");
    console.log(res)
  }

  this.getPairs();
  
	freeboard.loadDatasourcePlugin({
		"type_name"   : "cex_datasources",
		"display_name": "CEX.IO Datasource Plugin",
    "description" : "",
		"external_scripts" : [
			"https://cdnjs.cloudflare.com/ajax/libs/jsSHA/2.3.1/sha256.js"
		],
		"settings"    : [
			{
				"name"         : "first_name",
				"display_name" : "First Name",
				"type"         : "text",
				"default_value": "John",
				"description"  : "This is pretty self explanatory...",
        "required" : true
			},
			{
				"name"        : "last_name",
				"display_name": "Last Name",
				// **type "calculated"** : This is a special text input box that may contain javascript formulas and references to datasources in the freeboard.
				"type"        : "calculated"
			},
			{
				"name"        : "is_human",
				"display_name": "I am human",
				// **type "boolean"** : Will display a checkbox indicating a true/false setting.
				"type"        : "boolean"
			},
			{
				"name"        : "age",
				"display_name": "Your age",
				// **type "option"** : Will display a dropdown box with a list of choices.
				"type"        : "option",
				// **options** (required) : An array of options to be populated in the dropdown.
				"options"     : [
					{
						// **name** (required) : The text to be displayed in the dropdown.
						"name" : "0-50",
						// **value** : The value of the option. If not specified, the name parameter will be used.
						"value": "young"
					},
					{
						"name" : "51-100",
						"value": "old"
					}
				]
			},
			{
				"name"        : "other",
				"display_name": "Other attributes",
				// **type "array"** : Will allow a user to enter in rows of data.
				"type"        : "array",
				// **settings** (required) : An array of columns of the text to be entered by the user.
				"settings"    : [
					{
						"name"        : "name",
						"display_name": "Name",
						"type"        : "text"
					},
					{
						"name"        : "value",
						"display_name": "Value",
						"type"        : "text"
					}
				]
			},
			{
				"name"         : "refresh_rate",
				"display_name" : "Taux de rafraîchissement ",
				"type"         : "text",
				"description"  : "In milliseconds",
				"default_value": 50000
			}
		],
		// **newInstance(settings, newInstanceCallback, updateCallback)** (required) : A function that will be called when a new instance of this plugin is requested.
		// * **settings** : A javascript object with the initial settings set by the user. The names of the properties in the object will correspond to the setting names defined above.
		// * **newInstanceCallback** : A callback function that you'll call when the new instance of the plugin is ready. This function expects a single argument, which is the new instance of your plugin object.
		// * **updateCallback** : A callback function that you'll call if and when your datasource has an update for freeboard to recalculate. This function expects a single parameter which is a javascript object with the new, updated data. You should hold on to this reference and call it when needed.
		newInstance   : function(settings, newInstanceCallback, updateCallback) {
			newInstanceCallback(new CEXDatasourcePlugin(settings, updateCallback));
		}
	});


	// ### Datasource Implementation
	//
	// -------------------
	// Here we implement the actual datasource plugin. We pass in the settings and updateCallback.
	var CEXDatasourcePlugin = function(settings, updateCallback)
	{
		var self = this;
		var currentSettings = settings;

		function getData() {
			var newData = { hello : "world! it's " + new Date().toLocaleTimeString() }; // Just putting some sample data in for fun.

			/* Get my data from somewhere and populate newData with it... Probably a JSON API or something. */
			/* ... */

			updateCallback(newData);
		}


		var refreshTimer;

		function createRefreshTimer(interval) {
			if(refreshTimer) {
				clearInterval(refreshTimer);
			}

			refreshTimer = setInterval(function() {
				getData();
			}, interval);
		}

		self.onSettingsChanged = function(newSettings) {
			currentSettings = newSettings;
		}

		self.updateNow = function()
			getData();
		}

		self.onDispose = function() {
			clearInterval(refreshTimer);
			refreshTimer = undefined;
		}

		createRefreshTimer(currentSettings.refresh_rate);
	}
}());
