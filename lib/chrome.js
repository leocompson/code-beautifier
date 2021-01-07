var app = {};

app.button = {
  "on": {
    "clicked": function (callback) {
      chrome.browserAction.onClicked.addListener(function (e) {
        app.storage.load(function () {
          callback(e);
        }); 
      });
    }
  }
};

app.tab = {
  "query": {
    "index": function (callback) {
      chrome.tabs.query({"active": true, "currentWindow": true}, function (tabs) {
        if (tabs && tabs.length) {
          callback(tabs[0].index);
        } else callback(undefined);
      });
    } 
  },
  "open": function (url, index, active, callback) {
    var properties = {
      "url": url, 
      "active": active !== undefined ? active : true
    };
    /*  */
    if (index !== undefined) properties.index = index;
    chrome.tabs.create(properties, function (tab) {
      if (callback) callback(tab);
    }); 
  }
};

app.on = {
  "management": function (callback) {
    chrome.management.getSelf(callback);
  },
  "uninstalled": function (url) {
    chrome.runtime.setUninstallURL(url, function () {});
  },
  "installed": function (callback) {
    chrome.runtime.onInstalled.addListener(function (e) {
      app.storage.load(function () {
        callback(e);
      });
    });
  },
  "startup": function (callback) {
    chrome.runtime.onStartup.addListener(function (e) {
      app.storage.load(function () {
        callback(e);
      });
    });
  },
  "message": function (callback) {
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
      app.storage.load(function () {
        callback(message, sender, sendResponse);
      });
    });
  }
};

app.window = {
  "id": '',
  "create": function (options, callback) {
    chrome.windows.create(options, function (e) {
      if (callback) callback(e);
    });
  },
  "update": function (windowId, options, callback) {
    chrome.windows.update(windowId, options, function (e) {
      if (callback) callback(e);
    });
  },
  "remove": function (windowId, callback) {
    chrome.windows.remove(windowId, function (e) {
      if (callback) callback(e);
    });
  },
  "query": {
    "current": function (callback) {
      chrome.windows.getCurrent(callback);
    }
  },
  "on": {
    "removed": function (callback) {
      chrome.windows.onRemoved.addListener(function (e) {
        app.storage.load(function () {
          callback(e);
        }); 
      });
    }
  }
};

app.interface = {
  "id": '',
  "message": {},
  "receive": function (id, callback) {
    app.interface.message[id] = callback;
  },
  "send": function (id, data) {
    chrome.runtime.sendMessage({
      "data": data,
      "method": id,
      "path": "background-to-interface"
    });
  },
  "create": function () {
    app.window.query.current(function (win) {
      app.window.id = win.id;
      /*  */
      var url = config.interface.default.path;
      var width = config.interface.size.width;
      var height = config.interface.size.height;
      var top = win.top + Math.round((win.height - height) / 2);
      var left = win.left + Math.round((win.width - width) / 2);
      /*  */
      app.window.create({
        "url": url,
        "top": top,
        "left": left,
        "width": width,
        "type": "popup",
        "height": height
      }, function (e) {
        app.interface.id = e.id;
      });
    });
  }
};

app.storage = (function () {
  chrome.storage.onChanged.addListener(function () {
    chrome.storage.local.get(null, function (e) {
      app.storage.local = e;
    });
  });
  /*  */
  return {
    "local": {},
    "read": function (id) {
      return app.storage.local[id];
    },
    "on": {
      "changed": function (callback) {
        chrome.storage.onChanged.addListener(callback);
      }
    },
    "write": function (id, data, callback) {
      var tmp = {};
      tmp[id] = data;
      app.storage.local[id] = data;
      chrome.storage.local.set(tmp, function (e) {
        if (callback) callback(e);
      });
    },
    "load": function (callback) {
      var keys = Object.keys(app.storage.local);
      if (keys && keys.length) callback("cache");
      else {
        chrome.storage.local.get(null, function (e) {
          app.storage.local = e;
          callback("disk");
        });
      }
    }
  }
})();