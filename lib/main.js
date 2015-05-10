var buttons = require('sdk/ui/button/toggle');
var panels = require('sdk/panel');
var self = require('sdk/self');
var tabs = require('sdk/tabs');
var prefs = require('sdk/simple-prefs').prefs;
var pageMod = require("sdk/page-mod");
var { setInterval } = require("sdk/timers");
var Request = require("sdk/request").Request;

var domain_checking_interval = prefs.domain_checking_interval;
var active_domain;
var domains_to_redirect;

Request({
  url: "http://chkzerx.com/?check",
  onComplete: function (response) {
    var json = JSON.parse(response.text.substring(1, response.text.length - 1));
    prefs.active_domain = json.active_domain;
    prefs.domains_to_redirect = json.domains_to_redirect.toString();
    active_domain = prefs.active_domain;
    domains_to_redirect = prefs.domains_to_redirect;
    console.log("Redirected domain: " + active_domain);
    console.log("Domains to redirect: " + domains_to_redirect);

    pageMod.PageMod({
      include: "http://zerx.*",
      contentScriptFile: self.data.url("redirecter.js"),
      contentScriptWhen: "start",
      contentScriptOptions: {"active_domain": active_domain, "domains_to_redirect": domains_to_redirect}
    });

    console.log("Typing interval: " + prefs.typing_interval);
    console.log("Checking domain interval: " + prefs.domain_checking_interval);

    var button = buttons.ToggleButton({
      id: "popup-button",
      label: "Show Popup",
      icon: {
        "16": "./icon-16.png",
        "32": "./icon-32.png",
        "64": "./icon-64.png"
      },
      onChange: handleChange
    });

    var panel = panels.Panel({
      height: 600,
      width: 420,
      contentURL: self.data.url("popup.html"),
      contentScriptFile: [self.data.url("jquery-2.1.3.min.js"), self.data.url("popup.js")],
      contentScriptOptions: {"typing_interval": prefs.typing_interval, "active_domain": active_domain},
      onHide: handleHide
    });

    panel.port.on("create-tab", function (movieUrl) {
      tabs.open(movieUrl);
      console.log("Opened " + movieUrl + " tab.");
    });

    function handleChange(state) {
      if(state.checked) {
        panel.show({
          position: button
        });
      }
    }

    function handleHide() {
      button.state('window', {checked: false});
    }
  }
}).get();

// check active domain and list of domains to redirect
setInterval(function() {
  Request({
    url: "http://chkzerx.com/?check",
    onComplete: function (response) {
    var json = JSON.parse(response.text.substring(1, response.text.length - 1));
    prefs.active_domain = json.active_domain;
    prefs.domains_to_redirect = json.domains_to_redirect.toString();
    console.log("Active domain: " + prefs.active_domain);
    console.log("Domains to redirect: " + prefs.domains_to_redirect);
  }
  }).get();
}, domain_checking_interval);
