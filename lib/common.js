var core = {
  "start": function () {
    core.load();
  },
  "install": function () {
    core.load();
  },
  "load": function () {
    app.interface.id = '';
    /*  */
    app.contextmenu.create({
      "id": "tab", 
      "type": "radio", 
      "contexts": ["action"],
      "title": "Open in tab",  
      "checked": config.interface.context === "tab"
    }, app.error);
    /*  */
    app.contextmenu.create({
      "id": "win", 
      "type": "radio", 
      "contexts": ["action"],
      "title": "Open in win",  
      "checked": config.interface.context === "win"
    }, app.error);
  },
  "action": {
    "storage": function (changes, namespace) {
      /*  */
    },
    "contextmenu": function (e) {
      app.interface.close(config.interface.context);
      config.interface.context = e.menuItemId;
    },
    "removed": function (e) {
      if (e === app.interface.id) {
        app.interface.id = '';
      }
    },
    "button": function () {
      const context = config.interface.context;
      const url = app.interface.path + '?' + context;
      /*  */
      if (app.interface.id) {
        if (context === "tab") {
          app.tab.get(app.interface.id, function (tab) {
            if (tab) {
              app.tab.update(app.interface.id, {"active": true});
            } else {
              app.interface.id = '';
              app.tab.open(url);
            }
          });
        }
        /*  */
        if (context === "win") {
          app.window.get(app.interface.id, function (win) {
            if (win) {
              app.window.update(app.interface.id, {"focused": true});
            } else {
              app.interface.id = '';
              app.interface.create();
            }
          });
        }
      } else {
        if (context === "tab") app.tab.open(url);
        if (context === "win") app.interface.create(url);
      }
    }
  }
};

app.button.on.clicked(core.action.button);
app.window.on.removed(core.action.removed);
app.contextmenu.on.clicked(core.action.contextmenu);

app.on.startup(core.start);
app.on.installed(core.install);
app.on.storage(core.action.storage);
