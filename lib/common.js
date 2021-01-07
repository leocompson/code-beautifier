var core = {
  "init": function () {
    /* storage loaded */
  }
};

app.on.startup(core.init);
app.on.installed(core.init);

app.window.on.removed(function (e) {
  if (e === app.interface.id) {
    app.interface.id = '';
  }
});

app.button.on.clicked(function () {
  if (app.interface.id) {
    app.window.update(app.interface.id, {
      "focused": true
    });
  } else {
    app.interface.create();
  }
});