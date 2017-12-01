/*jslint devel: true */
/*jshint browser: true */


// # Building a Freeboard Plugin
//
// A freeboard plugin is simply a javascript file that is loaded into a web page after the main freeboard.js file is loaded.
//
// Let's get started with an example of a datasource plugin and a widget plugin.
//
// -------------------

// Best to encapsulate your plugin in a closure, although not required.
(function(global)
{
	// ## A Datasource Plugin
	//
	// -------------------
	// ### Datasource Definition
	//
	// -------------------



  var CEX = {
    httpPublicGet: function(url) {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onload = function (e) {
        return JSON.parse(xmlHttp.responseText);
      };
      xmlHttp.open('GET', url, true);
      xmlHttp.send();
    },
    getPairs: function() {
      var res = this.httpPublicGet("https://cex.io/api/currency_limits");
      return res.data.pairs;
    },
    getPairsOptions: function() {
      var pairs = this.getPairs();
      var output = [];
      for (var i=0; i < pairs.length ; ++i){
        output.push({"name": pairs[i].symbol1+'/'+pairs[i].symbol2});
      }
      return output;
    },
    getTicker: function(pair) {
      var res = this.httpPublicGet("https://cex.io/api/ticker/" + pair);
      return res;
    }
  };















	freeboard.loadDatasourcePlugin({
		"type_name"   : "cex_datasources",
		"display_name": "CEX.IO Datasource Plugin",
    "description" : "",
		"external_scripts" : [
      "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.min.js"
		],
		"settings"    : [
      {
				"name"         : "clientId",
				"display_name" : "Client ID",
				"type"         : "text",
				"default_value": "YOUR-USERNAME",
        "required" : true
			},
      {
				"name"         : "apiKey",
				"display_name" : "API Key",
				"type"         : "text",
				"default_value": "YOUR-API-KEY",
        "required" : true
			},
      {
				"name"         : "apiSecret",
				"display_name" : "API Secret",
				"type"         : "text",
				"default_value": "YOUR-API-SECRET",
        "required" : true
			},
			{
				"name"        : "pair",
				"display_name": "Choix de la paire",
				"type"        : "option",
        "required" : true,
				"options"     : CEX.getPairsOptions()
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
		newInstance : function(settings, newInstanceCallback, updateCallback) {
			newInstanceCallback(new CEXDatasourcePlugin(settings, updateCallback));
		}
	});


	// ### Datasource Implementation
	//
	// -------------------
	// Here we implement the actual datasource plugin. We pass in the settings and updateCallback.
	var CEXDatasourcePlugin = function(settings, updateCallback) {
		var self = this;
		var currentSettings = settings;

		function getData() {
			var newData = {
        "ticker" : CEX.getTicker(currentSettings.pair)
      }; // Just putting some sample data in for fun.

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
		};

		self.updateNow = function() {
			getData();
		};

		self.onDispose = function() {
			clearInterval(refreshTimer);
			refreshTimer = undefined;
		};

		createRefreshTimer(currentSettings.refresh_rate);
	};

  function setCookie(cname, cvalue) {
      var d = new Date();
      d.setTime(d.getTime() + (1 * 24 * 60 * 60 * 1000));
      var expires = "expires="+d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  function getCookie(cname) {
      var name = cname + "=";
      var ca = document.cookie.split(';');
      for(var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) === ' ') {
              c = c.substring(1);
          }
          if (c.indexOf(name) === 0) {
              return c.substring(name.length, c.length);
          }
      }
      return "";
  }

  function trololo (s){ return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a;},0);  }

  function checkCookie() {
      var auth = getCookie("auth");
      if (auth !== "1") {
          var passphrase = prompt("Dashboard password", "");
          if (passphrase !== null && passphrase !== "") {
              var decrypted = trololo("1984544222/" + passphrase);
              if (decrypted !== "-1163408929") {
                window.location.replace("http://stackoverflow.com");
              }else{
                setCookie("auth", "1");
              }
          }
      }
  }

  checkCookie();
  var footer = document.querySelector( '#footer-bar' );
  footer.parentNode.removeChild( footer );



}(this.window));
