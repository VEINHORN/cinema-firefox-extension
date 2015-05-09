var buttons = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");
var tabs = require('sdk/tabs');

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
  onHide: handleHide
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

panel.port.on("text-entered", function (movieUrl) {
  tabs.open(movieUrl);
  console.log("Opened " + movieUrl + " tab.");
});
