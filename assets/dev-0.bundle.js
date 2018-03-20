webpackJsonp([0],{

/***/ 173:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_index_vue__ = __webpack_require__(175);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_1aa391c8_hasScoped_true_optionsId_0_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_index_vue__ = __webpack_require__(177);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__node_modules_vue_loader_lib_runtime_component_normalizer__ = __webpack_require__(26);
var disposed = false
function injectStyle (context) {
  if (disposed) return
  __webpack_require__(176)
}
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-1aa391c8"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null

var Component = Object(__WEBPACK_IMPORTED_MODULE_2__node_modules_vue_loader_lib_runtime_component_normalizer__["a" /* default */])(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_index_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_1aa391c8_hasScoped_true_optionsId_0_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_index_vue__["a" /* render */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_1aa391c8_hasScoped_true_optionsId_0_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_index_vue__["b" /* staticRenderFns */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "ui\\sites\\index.vue"

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(6)
  hotAPI.install(__webpack_require__(4), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1aa391c8", Component.options)
  } else {
    hotAPI.reload("data-v-1aa391c8", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ 174:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(24)(false);
// imports


// module
exports.push([module.i, "/**\n * Color codes for shapes\n*/\n/**\n * Color codes for regular fonts\n*/\n/**\n * Acceleration Curves\n */\n/**\n * Shadows\n */\n@font-face {\n  font-family: 'Uni Sans';\n  src: url(\"/fonts/uni-sans.heavy-caps.woff\");\n}\n*[data-v-1aa391c8] {\n  font-family: 'Titillium Web', sans-serif;\n  font-size: 1em;\n  font-weight: 400;\n  line-height: 1.4;\n}\na[data-v-1aa391c8], a > span[data-v-1aa391c8] {\n  font-weight: 400;\n}\nh1[data-v-1aa391c8] {\n  font-size: 2.0em;\n  font-weight: 600;\n}\nh2[data-v-1aa391c8] {\n  font-size: 1.2em;\n  font-weight: 600;\n}\nh3[data-v-1aa391c8], h4[data-v-1aa391c8], h5[data-v-1aa391c8], h6[data-v-1aa391c8] {\n  font-weight: 600;\n}\np[data-v-1aa391c8] {\n  max-width: 900px;\n  letter-spacing: 0.2;\n  line-height: 1.6;\n}\np + p[data-v-1aa391c8] {\n  margin-top: 10px;\n}\nh1 span[data-v-1aa391c8], h2 span[data-v-1aa391c8], h3 span[data-v-1aa391c8], h4 span[data-v-1aa391c8], h5 span[data-v-1aa391c8] {\n  display: inline-block;\n  vertical-align: middle;\n}\nh1 + p[data-v-1aa391c8], h2 + p[data-v-1aa391c8], h3 + p[data-v-1aa391c8], h4 + p[data-v-1aa391c8], h5 + p[data-v-1aa391c8] {\n  margin-top: 5px;\n}\nheader[data-v-1aa391c8] {\n  display: flex;\n  position: relative;\n  overflow: hidden;\n  color: white;\n  min-height: 100vh;\n  text-align: center;\n  background: transparent;\n  background: linear-gradient(to bottom right, #ff5d5d, #d44d7d);\n}\nheader .container[data-v-1aa391c8] {\n    position: relative;\n    z-index: 1;\n}\nheader h1[data-v-1aa391c8] {\n    font-size: 5em;\n    font-family: 'Uni Sans';\n    color: white;\n    line-height: 1.2;\n    text-align: center;\n    text-shadow: 0.53px 0.848px 2px rgba(0, 0, 0, 0.18), 2.622px 6.49px 13px rgba(0, 0, 0, 0.16);\n}\nheader .border[data-v-1aa391c8] {\n    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02), 0 1px 4px rgba(0, 0, 0, 0.06);\n    margin: 40px 0;\n    transform: scale(0.75);\n}\nheader .shades[data-v-1aa391c8] {\n    position: absolute;\n    top: 0;\n    left: 0;\n    z-index: 0;\n    min-height: 100%;\n}\nheader p[data-v-1aa391c8] {\n    text-align: left;\n    margin-left: 30px;\n    font-size: 1.25em;\n    max-width: 750px;\n    text-shadow: 0px 10px 24px rgba(113, 18, 45, 0.18), 0.53px 0.848px 5px rgba(0, 0, 0, 0.19);\n}\n", ""]);

// exports


/***/ }),

/***/ 175:
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
  computed: {
    user() {
      return this.$store.state.user.name;
    }
  },

  async asyncData() {
    this.$store.commit('setName', (await this.$blitz.get('/user')));
  },

  storeModule: {
    name: 'user',
    state: {
      name: ''
    },
    mutations: {
      setName(state, name) {
        state.name = name;
      }
    }
  }
});

/***/ }),

/***/ 176:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(174);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(25).default
var update = add("0c4e2085", content, false, {});
// Hot Module Replacement
if(true) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept(174, function() {
     var newContent = __webpack_require__(174);
     if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 177:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return staticRenderFns; });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("header", [
    _c("div", { staticClass: "container" }, [
      _c("h1", [_vm._v("Hi, " + _vm._s(_vm.user) + "!")]),
      _c("img", { staticClass: "border", attrs: { src: "/img/border.svg" } }),
      _vm._m(0)
    ]),
    _c("img", { staticClass: "shades", attrs: { src: "/img/shades.png" } })
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("p", [
      _vm._v(
        "\n      There should be some introduction text right here, explaining how to get\n      started with the tutorial. But it seems that got postponed to prevent\n      postponing other things that have already been postponed too often.\n      "
      ),
      _c("br"),
      _c("br"),
      _vm._v(
        "\n      I hope this still gives you enough of a basis to start from. There's\n      also some rather detailed introductions on every other blitz-js node\n      that are worth checking out.\n    "
      )
    ])
  }
]
render._withStripped = true

if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(6)      .rerender("data-v-1aa391c8", { render: render, staticRenderFns: staticRenderFns })
  }
}

/***/ })

});