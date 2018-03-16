webpackJsonp([2],{

/***/ 124:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createApp = createApp;

var _vue = __webpack_require__(5);

var _vue2 = _interopRequireDefault(_vue);

var _vueTouchHotfix = __webpack_require__(125);

var _vueTouchHotfix2 = _interopRequireDefault(_vueTouchHotfix);

var _app = __webpack_require__(59);

var _app2 = _interopRequireDefault(_app);

var _blitzJsQuery = __webpack_require__(129);

var _blitzJsQuery2 = _interopRequireDefault(_blitzJsQuery);

var _router = __webpack_require__(152);

var _store = __webpack_require__(155);

var _vuexRouterSync = __webpack_require__(157);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createApp(context) {
  if (context) {
    _vue2.default.prototype.$blitz = context.api;
  } else {
      _vue2.default.prototype.$blitz = new _blitzJsQuery2.default({
        api_url: "http://localhost:3003",
        auth_url: "http://localhost:3030"
      });
    }
  var router = (0, _router.createRouter)();
  var store = (0, _store.createStore)(_vue2.default.prototype.$blitz);

  (0, _vuexRouterSync.sync)(store, router);

  _vue2.default.use(_vueTouchHotfix2.default);

  var app = new _vue2.default({
    router: router,
    store: store,
    render: function render(createElement) {
      return createElement(_app2.default);
    }
  });
  return { app: app, router: router, store: store };
}

/***/ }),

/***/ 126:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(34);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(61).default
var update = add("e85f5a5c", content, false, {});
// Hot Module Replacement
if(true) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept(34, function() {
     var newContent = __webpack_require__(34);
     if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 128:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return staticRenderFns; });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "app" } }, [_c("router-view")], 1)
}
var staticRenderFns = []
render._withStripped = true

if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(15)      .rerender("data-v-7fb9c132", { render: render, staticRenderFns: staticRenderFns })
  }
}

/***/ }),

/***/ 148:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 152:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRouter = createRouter;

var _vue = __webpack_require__(5);

var _vue2 = _interopRequireDefault(_vue);

var _vueRouter = __webpack_require__(153);

var _vueRouter2 = _interopRequireDefault(_vueRouter);

var _routes = __webpack_require__(154);

var _routes2 = _interopRequireDefault(_routes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_vue2.default.use(_vueRouter2.default);

function createRouter() {
  var config = {
    mode: 'history',
    scrollBehavior: function scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition;
      } else {
        return {
          x: 0,
          y: 0
        };
      }
    },

    routes: _routes2.default
  };

  return new _vueRouter2.default(config);
}

/***/ }),

/***/ 154:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = [{
  "path": "/",
  "component": function component() {
    return __webpack_require__.e/* import() */(0).then(__webpack_require__.bind(null, 167));
  },
  "props": true
}];

/***/ }),

/***/ 155:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createStore = createStore;

var _vue = __webpack_require__(5);

var _vue2 = _interopRequireDefault(_vue);

var _vuex = __webpack_require__(156);

var _vuex2 = _interopRequireDefault(_vuex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_vue2.default.use(_vuex2.default);

function createStore(blitz) {
  var store = new _vuex2.default.Store();
  store.$blitz = blitz;
  return store;
}

/***/ }),

/***/ 158:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _regenerator = __webpack_require__(56);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = __webpack_require__(75);

var _keys2 = _interopRequireDefault(_keys);

var _promise = __webpack_require__(25);

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = __webpack_require__(57);

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var callAsyncRecursive = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(parent, store, router) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!parent.components) {
              _context.next = 3;
              break;
            }

            _context.next = 3;
            return _promise2.default.all((0, _keys2.default)(parent.components).map(function (c) {
              return callAsyncRecursive(parent.components[c], store, router);
            }));

          case 3:
            if (!parent.asyncData) {
              _context.next = 5;
              break;
            }

            return _context.abrupt("return", parent.asyncData({
              store: store,
              route: router.currentRoute
            }));

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function callAsyncRecursive(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

exports.callAsyncRecursive = callAsyncRecursive;

/***/ }),

/***/ 162:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _keys = __webpack_require__(75);

var _keys2 = _interopRequireDefault(_keys);

var _lodash = __webpack_require__(163);

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var registerStoreModules = function registerStoreModules(parent, store, checkPreState) {
  if (parent.components) {
    (0, _keys2.default)(parent.components).forEach(function (c) {
      return registerStoreModules(parent.components[c], store);
    });
  }

  if (parent.storeModule) {
    var preserveState = checkPreState ? {
      preserveState: store.state[parent.storeModule.name] ? true : false
    } : {};
    var preregistered = false;

    if (parent.storeModule.mutations) {
      preregistered = store._mutations[(0, _keys2.default)(parent.storeModule.mutations)[0]];
    } else if (parent.storeModule.actions) {
      preregistered = store._actions[(0, _keys2.default)(parent.storeModule.actions)[0]];
    } else if (parent.storeModule.getters) {
      preregistered = store._getters[(0, _keys2.default)(parent.storeModule.getters)[0]];
    }

    return !preregistered ? store.registerModule(parent.storeModule.name, parent.storeModule, preserveState) : null;
  }
};

exports.registerStoreModules = registerStoreModules;

/***/ }),

/***/ 164:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_progress_vue__ = __webpack_require__(76);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_85ed270e_hasScoped_true_optionsId_0_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_progress_vue__ = __webpack_require__(166);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__node_modules_vue_loader_lib_runtime_component_normalizer__ = __webpack_require__(39);
var disposed = false
function injectStyle (context) {
  if (disposed) return
  __webpack_require__(165)
}
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-85ed270e"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null

var Component = Object(__WEBPACK_IMPORTED_MODULE_2__node_modules_vue_loader_lib_runtime_component_normalizer__["a" /* default */])(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_progress_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_85ed270e_hasScoped_true_optionsId_0_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_progress_vue__["a" /* render */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_85ed270e_hasScoped_true_optionsId_0_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_progress_vue__["b" /* staticRenderFns */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "ui\\components\\progress.vue"

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(15)
  hotAPI.install(__webpack_require__(5), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-85ed270e", Component.options)
  } else {
    hotAPI.reload("data-v-85ed270e", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ 165:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(38);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(61).default
var update = add("1a24efa8", content, false, {});
// Hot Module Replacement
if(true) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept(38, function() {
     var newContent = __webpack_require__(38);
     if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 166:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return staticRenderFns; });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", {
    staticClass: "progress",
    style: {
      width: _vm.percent + "%",
      height: _vm.height,
      "background-color": _vm.canSuccess ? _vm.color : _vm.failedColor,
      opacity: _vm.show ? 1 : 0
    }
  })
}
var staticRenderFns = []
render._withStripped = true

if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(15)      .rerender("data-v-85ed270e", { render: render, staticRenderFns: staticRenderFns })
  }
}

/***/ }),

/***/ 34:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(60)(false);
// imports


// module
exports.push([module.i, "/**\n * Color codes for shapes\n*/\n/**\n * Color codes for regular fonts\n*/\n/**\n * Acceleration Curves\n */\n/**\n * Shadows\n */\n* {\n  font-family: sans-serif;\n  font-size: 1em;\n  font-weight: 400;\n  line-height: 1.4;\n}\na, a > span {\n  font-weight: 400;\n}\nh1 {\n  font-size: 2.0em;\n  font-weight: 600;\n}\nh2 {\n  font-size: 1.2em;\n  font-weight: 600;\n}\nh3, h4, h5, h6 {\n  font-weight: 600;\n}\np {\n  max-width: 900px;\n  letter-spacing: 0.2;\n  line-height: 1.6;\n}\np + p {\n  margin-top: 10px;\n}\nh1 span, h2 span, h3 span, h4 span, h5 span {\n  display: inline-block;\n  vertical-align: middle;\n}\nh1 + p, h2 + p, h3 + p, h4 + p, h5 + p {\n  margin-top: 5px;\n}\n", ""]);

// exports


/***/ }),

/***/ 38:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(60)(false);
// imports


// module
exports.push([module.i, "/**\n * Color codes for shapes\n*/\n/**\n * Color codes for regular fonts\n*/\n/**\n * Acceleration Curves\n */\n/**\n * Shadows\n */\n*[data-v-85ed270e] {\n  font-family: sans-serif;\n  font-size: 1em;\n  font-weight: 400;\n  line-height: 1.4;\n}\na[data-v-85ed270e], a > span[data-v-85ed270e] {\n  font-weight: 400;\n}\nh1[data-v-85ed270e] {\n  font-size: 2.0em;\n  font-weight: 600;\n}\nh2[data-v-85ed270e] {\n  font-size: 1.2em;\n  font-weight: 600;\n}\nh3[data-v-85ed270e], h4[data-v-85ed270e], h5[data-v-85ed270e], h6[data-v-85ed270e] {\n  font-weight: 600;\n}\np[data-v-85ed270e] {\n  max-width: 900px;\n  letter-spacing: 0.2;\n  line-height: 1.6;\n}\np + p[data-v-85ed270e] {\n  margin-top: 10px;\n}\nh1 span[data-v-85ed270e], h2 span[data-v-85ed270e], h3 span[data-v-85ed270e], h4 span[data-v-85ed270e], h5 span[data-v-85ed270e] {\n  display: inline-block;\n  vertical-align: middle;\n}\nh1 + p[data-v-85ed270e], h2 + p[data-v-85ed270e], h3 + p[data-v-85ed270e], h4 + p[data-v-85ed270e], h5 + p[data-v-85ed270e] {\n  margin-top: 5px;\n}\n.progress[data-v-85ed270e] {\n  position: fixed;\n  top: 0px;\n  left: 0px;\n  right: 0px;\n  height: 2px;\n  width: 0%;\n  transition: width 0.2s, opacity 0.4s;\n  opacity: 1;\n  background: transparent;\n  background: linear-gradient(to bottom right, #6ae974, #3ad1d7);\n  z-index: 999999;\n}\n", ""]);

// exports


/***/ }),

/***/ 59:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__node_modules_vue_loader_lib_template_compiler_index_id_data_v_7fb9c132_hasScoped_false_optionsId_0_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_app_vue__ = __webpack_require__(128);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_runtime_component_normalizer__ = __webpack_require__(39);
var disposed = false
function injectStyle (context) {
  if (disposed) return
  __webpack_require__(126)
}
/* script */
var __vue_script__ = null
/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null

var Component = Object(__WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_runtime_component_normalizer__["a" /* default */])(
  __vue_script__,
  __WEBPACK_IMPORTED_MODULE_0__node_modules_vue_loader_lib_template_compiler_index_id_data_v_7fb9c132_hasScoped_false_optionsId_0_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_app_vue__["a" /* render */],
  __WEBPACK_IMPORTED_MODULE_0__node_modules_vue_loader_lib_template_compiler_index_id_data_v_7fb9c132_hasScoped_false_optionsId_0_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_app_vue__["b" /* staticRenderFns */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "ui\\app.vue"

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(15)
  hotAPI.install(__webpack_require__(5), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-7fb9c132", Component.options)
  } else {
    hotAPI.reload("data-v-7fb9c132", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ 76:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["a"] = ({
  data() {
    return {
      percent: 0,
      show: false,
      canSuccess: true,
      duration: 1500,
      height: '0.125em',
      color: '#ffca2b',
      failedColor: '#ff0000'
    };
  },

  methods: {
    start() {
      this.show = true;
      this.canSuccess = true;
      if (this._timer) {
        clearInterval(this._timer);
        this.percent = 0;
      }
      this._cut = 10000 / this.duration;
      this._timer = setInterval(() => {
        this.increase(this._cut * Math.random());

        // First stage (rather fast), then 10x slower after 33%
        if (this.percent > 33) {
          clearInterval(this._timer);
          this.throttle();
        }
      }, 100);
      return this;
    },
    throttle() {
      this._timer = setInterval(() => {
        this.increase(this._cut * Math.random() * 0.1);
        if (this.percent > 85) {
          clearInterval(this._timer);
        }
      }, 100);
    },
    set(num) {
      this.show = true;
      this.canSuccess = true;
      this.percent = Math.floor(num);
      return this;
    },
    get() {
      return Math.floor(this.percent);
    },
    increase(num) {
      this.percent = this.percent + num;
      return this;
    },
    decrease(num) {
      this.percent = this.percent - num;
      return this;
    },
    finish() {
      this.percent = 100;
      this.hide();
      return this;
    },
    pause() {
      clearInterval(this._timer);
      return this;
    },
    hide() {
      clearInterval(this._timer);
      this._timer = null;
      setTimeout(() => {
        this.show = false;
        this.$nextTick(() => {
          setTimeout(() => {
            this.percent = 0;
          }, 200);
        });
      }, 500);
      return this;
    },
    fail() {
      this.canSuccess = false;
      return this;
    }
  }
});

/***/ }),

/***/ 77:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(78);
module.exports = __webpack_require__(87);


/***/ }),

/***/ 87:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _promise = __webpack_require__(25);

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = __webpack_require__(56);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = __webpack_require__(57);

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _vue = __webpack_require__(5);

var _vue2 = _interopRequireDefault(_vue);

var _app = __webpack_require__(124);

var _callAsyncRecursive = __webpack_require__(158);

var _registerStoreModules = __webpack_require__(162);

var _app2 = __webpack_require__(59);

var _app3 = _interopRequireDefault(_app2);

var _progress = __webpack_require__(164);

var _progress2 = _interopRequireDefault(_progress);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var progress = _vue2.default.prototype.$progress = new _vue2.default(_progress2.default).$mount();
document.body.appendChild(progress.$el);

_vue2.default.mixin({
  beforeRouteUpdate: function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(to, from, next) {
      var asyncData;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              asyncData = this.$options.asyncData;

              if (!asyncData) {
                _context.next = 9;
                break;
              }

              progress.start();
              _context.next = 5;
              return asyncData({
                store: this.$store,
                route: to
              });

            case 5:
              progress.finish();
              next();
              _context.next = 10;
              break;

            case 9:
              next();

            case 10:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function beforeRouteUpdate(_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    }

    return beforeRouteUpdate;
  }()
});

var _createApp = (0, _app.createApp)(),
    app = _createApp.app,
    router = _createApp.router,
    store = _createApp.store;

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__);
}

router.onReady(function () {
  var routerView = router.getMatchedComponents();

  (0, _registerStoreModules.registerStoreModules)(_app3.default, store);
  routerView.map(function (component) {
    return (0, _registerStoreModules.registerStoreModules)(component, store, true);
  });

  router.beforeResolve(function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(to, from, next) {
      var matched, prevMatched, diffed, activated, storeModules, asyncDataHooks;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              matched = router.getMatchedComponents(to);
              prevMatched = router.getMatchedComponents(from);
              diffed = false;
              activated = matched.filter(function (c, i) {
                return diffed || (diffed = prevMatched[i] !== c);
              });
              storeModules = activated.map(function (c) {
                return c.beforeCreate;
              }).filter(function (_) {
                return _;
              });

              (0, _registerStoreModules.registerStoreModules)(_app3.default, store);
              activated.map(function (component) {
                return (0, _registerStoreModules.registerStoreModules)(component, store, true);
              });

              asyncDataHooks = activated.map(function (c) {
                return c.asyncData;
              }).filter(function (_) {
                return _;
              });

              if (asyncDataHooks.length) {
                _context2.next = 10;
                break;
              }

              return _context2.abrupt('return', next());

            case 10:
              progress.start();

              _context2.next = 13;
              return _promise2.default.all(asyncDataHooks.map(function (hook) {
                return hook({ store: store, route: to });
              }));

            case 13:
              progress.finish();
              next();

            case 15:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    }));

    return function (_x4, _x5, _x6) {
      return _ref2.apply(this, arguments);
    };
  }());
  app.$mount('#app');
});

/***/ })

},[77]);