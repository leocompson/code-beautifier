var config = {};

config.welcome = {
  set lastupdate (val) {app.storage.write("lastupdate", val)},
  get lastupdate () {return app.storage.read("lastupdate") !== undefined ? app.storage.read("lastupdate") : 0}
};

config.interface = {
  set size (val) {app.storage.write("size", val)},
  get size () {return app.storage.read("size") !== undefined ? app.storage.read("size") : config.interface.default.size},
  "default": {
    "path": chrome.runtime.getURL("data/interface/index.html"),
    "size": {
      "width": 1080, 
      "height": 700
    }
  }
};