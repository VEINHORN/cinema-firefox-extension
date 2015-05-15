var check_domain_url = "http://chkzerx.com/?check";
const { Cc, Ci, Cr } = require("chrome");

var buttons = require('sdk/ui/button/toggle');
var panels = require('sdk/panel');
var self = require('sdk/self');
var tabs = require('sdk/tabs');
var prefs = require('sdk/simple-prefs').prefs;
var pageMod = require("sdk/page-mod");
var { setInterval } = require("sdk/timers");
var Request = require("sdk/request").Request;
var events = require("sdk/system/events");
var utils = require("sdk/window/utils");

Request({
  url: check_domain_url,
  onComplete: function (response) {
    var json = JSON.parse(response.text.substring(1, response.text.length - 1));
    prefs.active_domain = json.active_domain;
    prefs.domains_to_redirect = json.domains_to_redirect.toString();

    //prefs.domains_to_redirect = "microsoft.com,  twitter.com, vk.com";

    console.log("Redirected domain: " + prefs.active_domain);
    console.log("Domains to redirect: " + prefs.domains_to_redirect);

    events.on("http-on-modify-request", requests_listener);
  }
}).get();

exports.onUnload = function(reason) {
  events.off("http-on-modify-request", requests_listener);
};

console.log("Typing interval: " + prefs.typing_interval);

setInterval(function() {
  Request({
    url: check_domain_url,
    onComplete: function (response) {
    var json = JSON.parse(response.text.substring(1, response.text.length - 1));
    prefs.active_domain = json.active_domain;
    prefs.domains_to_redirect = json.domains_to_redirect.toString();
    //prefs.domains_to_redirect = "github.com, test.com";
    console.log("Active domain: " + prefs.active_domain);
    console.log("Domains to redirect: " + prefs.domains_to_redirect);
  }
  }).get();
}, prefs.domain_checking_interval);


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
  width: 420,
  height: 100,
  contentURL: self.data.url("popup.html"),
  contentScriptFile: [ self.data.url("jquery-2.1.3.min.js"), self.data.url("popup.js") ],
  contentScriptOptions: { "typing_interval": prefs.typing_interval },
  onHide: handleHide
});

panel.port.on("create-tab", function (movie_url) {
  tabs.open(change_domain(movie_url, prefs.active_domain));
  console.log("Opened " + movie_url + " tab.");
});

panel.port.on("resize-popup-height", function(height) {
  panel.height = height;
  console.log("Popup height resized.");
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

function requests_listener(event) {
  var channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
  var url = event.subject.URI.spec;
  if(is_to_redirect(url)) {
    // abort current request
    channel.cancel(Cr.NS_BINDING_ABORTED);

    // get the current gbrowser (since the user may have several windows
    // and tabs) and load the fixed URI
    var gBrowser = utils.getMostRecentBrowserWindow().gBrowser;
    var domWin = channel.notificationCallbacks.getInterface(Ci.nsIDOMWindow);
    var browser = gBrowser.getBrowserForDocument(domWin.top.document);
    console.log("Redirected from '" + url + "' to '" + change_redirect_domain(url, prefs.active_domain) + "'");
    browser.loadURI(change_redirect_domain(url, prefs.active_domain));
  }
}

function is_to_redirect(url) {
  var redirect_flag = false;
  prefs.domains_to_redirect.split(/,\s*/).forEach(function(element, index, array) {
    if(get_domain(url).indexOf(element) > -1) redirect_flag = true;
  });
  return redirect_flag;
}

function change_redirect_domain(url, active_domain) {
  var domain;
  if(url.indexOf("https://") > -1) domain = url.replace("https://", "");
  else if(url.indexOf("http://") > -1) domain = url.replace("http://", "");
  return url.replace(domain.replace(/[/].*/, ""), active_domain).replace("https://", "http://");
}

function get_domain(url) {
  var domain;
  if(url.indexOf("https://") > -1) domain = url.replace("https://", "");
  else if(url.indexOf("http://") > -1) domain = url.replace("http://", "");
  return domain.replace(/[/].*/, "");
}

function change_domain(movie_url, active_domain) {
  var domain = movie_url.replace("http://", "").replace(/[/].*/, "");
  return movie_url.replace(domain, active_domain);
}
