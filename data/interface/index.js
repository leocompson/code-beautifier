var config  = {
  "container": {},
  "addon": {
    "homepage": function () {
      return chrome.runtime.getManifest().homepage_url;
    }
  },
  "codemirror": {
    "editor": {
      "input": null,
      "output": null,
    },
    "options": {
      "indentUnit": 2,
      "dragDrop": true,
      "tabMode": "indent",
      "lineNumbers": true,
      "lineWrapping": true,
      "matchBrackets": true,
      "mode": "text/javascript"
    }
  },
  "beautifier": {
    "language": '',
    "options": {
      "eol": "\\n",
      "e4x": false,
      "indent_size": 2,
      "indent_level": 0,
      "indent_char": " ",
      "eval_code": false,
      "comma_first": false,
      "editorconfig": false,
      "jslint_happy": false,
      "wrap_line_length": 0,
      "templating": ["auto"],
      "space_in_paren": false,
      "brace_style": "collapse",
      "end_with_newline": false,
      "indent_with_tabs": false,
      "unescape_strings": false,
      "preserve_newlines": true,
      "indent_empty_lines": false,
      "max_preserve_newlines": 10,
      "space_in_empty_paren": false,
      "break_chained_methods": false,
      "keep_array_indentation": false,
      "space_before_conditional": true,
      "unindent_chained_methods": false,
      "space_after_anon_function": true,
      "space_after_named_function": false,
      "operator_position": "before-newline"
    }
  },
  "resize": {
    "timeout": null,
    "method": function () {
      if (config.port.name === "win") {
        if (config.resize.timeout) window.clearTimeout(config.resize.timeout);
        config.resize.timeout = window.setTimeout(async function () {
          const current = await chrome.windows.getCurrent();
          /*  */
          config.storage.write("interface.size", {
            "top": current.top,
            "left": current.left,
            "width": current.width,
            "height": current.height
          });
        }, 1000);
      }
    }
  },
  "port": {
    "name": '',
    "connect": function () {
      config.port.name = "webapp";
      const context = document.documentElement.getAttribute("context");
      /*  */
      if (chrome.runtime) {
        if (chrome.runtime.connect) {
          if (context !== config.port.name) {
            if (document.location.search === "?tab") config.port.name = "tab";
            if (document.location.search === "?win") config.port.name = "win";
            /*  */
            chrome.runtime.connect({
              "name": config.port.name
            });
          }
        }
      }
      /*  */
      document.documentElement.setAttribute("context", config.port.name);
    }
  },
  "storage": {
    "local": {},
    "read": function (id) {
      return config.storage.local[id];
    },
    "load": function (callback) {
      chrome.storage.local.get(null, function (e) {
        config.storage.local = e;
        callback();
      });
    },
    "write": function (id, data) {
      if (id) {
        if (data !== '' && data !== null && data !== undefined) {
          let tmp = {};
          tmp[id] = data;
          config.storage.local[id] = data;
          chrome.storage.local.set(tmp, function () {});
        } else {
          delete config.storage.local[id];
          chrome.storage.local.remove(id, function () {});
        }
      }
    }
  },
  "load": function () {
    const clear = document.getElementById("clear");
    const theme = document.getElementById("theme");
    const select = document.getElementById("select");
    const fileio = document.getElementById("fileio");
    const reload = document.getElementById("reload");
    const support = document.getElementById("support");
    const language = document.getElementById("language");
    const donation = document.getElementById("donation");
    const download = document.getElementById("download");
    const clipboard = document.getElementById("clipboard");
    const file = document.querySelector("input[type='file']");
    const beautifybutton = document.getElementById("beautifybutton");
    /*  */
    fileio.addEventListener("click", function () {file.click()}, false);
    download.addEventListener("click", config.app.download.result, false);
    reload.addEventListener("click", function () {document.location.reload()}, false);
    /*  */
    support.addEventListener("click", function () {
      const url = config.addon.homepage();
      chrome.tabs.create({"url": url, "active": true});
    }, false);
    /*  */
    donation.addEventListener("click", function () {
      const url = config.addon.homepage() + "?reason=support";
      chrome.tabs.create({"url": url, "active": true});
    }, false);
    /*  */
    clear.addEventListener("click", function () {
      config.storage.write("reset", false);
      config.codemirror.editor.input.setValue('');
      config.codemirror.editor.output.setValue('');
    }, false);
    /*  */
    select.addEventListener("click", function () {
      if (config.codemirror.editor.output) {
        config.codemirror.editor.output.execCommand("selectAll");
      }
    }, false);
    /*  */
    language.addEventListener("change", function (e) {
      config.beautifier.language = e.target.value;
      config.storage.write("language", config.beautifier.language);
      /*  */
      config.app.update.editor();
    }, false);
    /*  */
    theme.addEventListener("click", function () {
      let attribute = document.documentElement.getAttribute("theme");
      attribute = attribute === "dark" ? "light" : "dark";
      /*  */
      config.codemirror.editor.input.setOption("theme", attribute === "dark" ? "material-darker" : "default");
      config.codemirror.editor.output.setOption("theme", attribute === "dark" ? "material-darker" : "default");
      document.documentElement.setAttribute("theme", attribute);
      config.storage.write("theme", attribute);
    }, false);
    /*  */
    beautifybutton.addEventListener("click", function () {
      try {
        const txt = config.codemirror.editor.input.getValue();
        if (txt) {
          const tmp = config.beautifier.language.replace("text/", '');
          config.app.engine = tmp === "javascript" ? js_beautify : (tmp === "css" ? css_beautify : html_beautify);
          /*  */
          const result = config.app.engine(txt, config.beautifier.options);
          if (result) {
            config.codemirror.editor.output.setValue(result);
          }
        }
      } catch (e) {
        window.alert("An error has occurred! Please change the input language and try again.");
      }
    }, false);
    /*  */
    clipboard.addEventListener("click", function () {
      if (config.codemirror.editor.output) {
        const textarea = document.createElement("textarea");
        /*  */
        select.click();
        document.body.appendChild(textarea);
        textarea.value = config.codemirror.editor.output.getValue();
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
    }, false);
    /*  */
    file.addEventListener("change", function (e) {
      if (e.target) {
        if (e.target.files) {
          if (e.target.files[0]) {
            config.app.file.process(e.target.files[0], function (txt) {
              config.codemirror.editor.input.setValue(txt);
              window.setTimeout(function () {beautifybutton.click()}, 300);
            });
          }
        }
      }
    });
    /*  */
    config.storage.load(config.app.start);
    window.removeEventListener("load", config.load, false);
  },
  "app": {
    "engine": '',
    "show": {
      "error": {
        "message": function (e) {
          const fileio = document.getElementById("fileio");
          const beautifybutton = document.getElementById("beautifybutton");
          /*  */
          fileio.disabled = false;
          beautifybutton.disabled = false;
          beautifybutton.value = "Beautify";
          /*  */
          config.codemirror.editor.output.setValue(JSON.stringify(e, null, 2));
        }
      }
    },
    "reset": {
      "editor": function () {
        const reset = config.storage.read("reset") !== undefined ? config.storage.read("reset") : true;
        if (reset) {
          fetch("resources/sample.js").then(function (e) {return e.text()}).then(function (e) {
            if (e) {
              config.codemirror.editor.input.setValue(e);
              window.setTimeout(function () {beautifybutton.click()}, 300);
            }
          }).catch(function () {
            config.app.show.error.message("Error: could not find the input file!");
          });
        }
      }
    },
    "download": {
      "result": function () {
        const txt = config.codemirror.editor.output.getValue();
        if (txt) {
          const a = document.createElement('a');
          const tmp = config.beautifier.language.replace("text/", '');
          const filename = config.app.file.name ? "beautified-" + config.app.file.name : "result." + (tmp === "javascript" ? "js" : tmp);
          /*  */
          a.style.display = "none";  
          a.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(txt));
          a.setAttribute("download", filename);
          document.body.appendChild(a);
          a.click();
          /*  */
          window.setTimeout(function () {a.remove()}, 0);
        }
      }
    },
    "file": {
      "name": '',
      "process": function (file, callback) {
        if (!file) return;
        /*  */
        const type = file.type; 
        config.app.file.name = file.name;
        const language = document.getElementById("language");
        /*  */
        if (type === "text/css" || type === "text/html" || type === "text/javascript") {
          language.value = type;
          language.dispatchEvent(new Event("change"));
        }
        /*  */
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function (e) {
          const content = e.target.result;
          if (content) callback(content);
        };
      }
    },
    "update": {
      "style": function () {
        config.container.input = document.querySelector(".input");
        config.container.header = document.querySelector(".header");
        config.container.output = document.querySelector(".output");
        /*  */
        const offset = parseInt(window.getComputedStyle(config.container.header).height);
        config.container.input.style.height = window.innerWidth < 700 ? "calc(50vh - " + (offset / 2 + 15) + "px)" : "calc(100vh - " + (offset + 15) + "px)";
        config.container.output.style.height = window.innerWidth < 700 ? "calc(50vh - " + (offset / 2 + 15) + "px)" : "calc(100vh - " + (offset + 15) + "px)";
      },
      "editor": function () {
        try {
          if (config.beautifier.language) {
            config.codemirror.options.mode = config.beautifier.language;
            /*  */
            if (config.codemirror.editor.input) {
              config.codemirror.editor.input.setOption("mode", config.codemirror.options.mode);
            }
            /*  */
            if (config.codemirror.editor.output) {
              config.codemirror.editor.output.setOption("mode", config.codemirror.options.mode);
            }
          }
        } catch (e) {
          config.app.show.error.message(e);
        }
      }
    },
    "start": function () {
      const input = document.getElementById("input");
      const output = document.getElementById("output");
      const language = document.getElementById("language");
      const settings = document.querySelector(".settings");
      const beautifybutton = document.getElementById("beautifybutton");
      const theme = config.storage.read("theme") !== undefined ? config.storage.read("theme") : "light";
      /*  */
      config.container.inputs = [...settings.querySelectorAll("input")];
      document.documentElement.setAttribute("theme", theme !== undefined ? theme : "light");
      config.beautifier.language = config.storage.read("language") !== undefined ? config.storage.read("language") : "text/javascript";
      config.beautifier.options = config.storage.read("options") !== undefined ? config.storage.read("options") : config.beautifier.options;
      /*  */
      language.value = config.beautifier.language;
      config.codemirror.options.mode = config.beautifier.language;
      config.codemirror.editor.input = CodeMirror.fromTextArea(input, config.codemirror.options);
      config.codemirror.editor.output = CodeMirror.fromTextArea(output, config.codemirror.options);
      config.codemirror.editor.input.setOption("theme", theme === "dark" ? "material-darker" : "default");
      config.codemirror.editor.output.setOption("theme", theme === "dark" ? "material-darker" : "default");
      /*  */
      config.container.inputs.map(function (input) {
        if (input.id in config.beautifier.options) {
          const type = input.getAttribute("type");
          input[type === "checkbox" ? "checked" : "value"] = config.beautifier.options[input.id];
        }
        /*  */
        input.addEventListener("change", function (e) {
          const tmp = config.beautifier.options;
          const type = e.target.getAttribute("type");
          /*  */
          tmp[e.target.id] = e.target[type === "checkbox" ? "checked" : "value"];
          config.beautifier.options = tmp;
          /*  */
          config.storage.write("options", config.beautifier.options);
          beautifybutton.click();
        }, false);
      });
      /*  */
      if (config.beautifier.language === "text/javascript") {
        config.app.reset.editor();
      }
      /*  */
      config.app.update.style();
      config.app.update.editor();
    }
  }
};

config.port.connect();

window.addEventListener("load", config.load, false);
window.addEventListener("resize", config.resize.method, false);
