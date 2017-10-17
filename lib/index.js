'use strict';

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();



var asyncToGenerator = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var Connection = require("./connection.js");
var Blitz = function () {
  function Blitz(options) {
    classCallCheck(this, Blitz);
    this.connecting = null;
    this.options = Object.assign({
      api_url: "http://localhost:3010/",
      auth_url: "http://localhost:3030/",
      namespace: '/',
      user_key: null,
      user_secret: null,
      ignore_limiter: false
    }, options);
    var api = this.options.api_url;
    var auth = this.options.auth_url;
    this.options.api_url = api[api.length - 1] === "/" ? api.slice(0, -1) : api;
    this.options.auth_url = auth[auth.length - 1] === "/" ? auth.slice(0, -1) : auth;
    this.connect();
  }
  createClass(Blitz, [{
    key: "connect",
    value: function () {
      var _ref = asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.connection = new Connection(this.options);
                this.connecting = this.connection.connect();
                _context.next = 4;
                return this.connecting;
              case 4:
                this.connecting = null;
              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));
      function connect() {
        return _ref.apply(this, arguments);
      }
      return connect;
    }()
  }, {
    key: "subscribe",
    value: function () {
      var _ref2 = asyncToGenerator(regeneratorRuntime.mark(function _callee2(endpoint) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.connecting;
              case 2:
                this.emit("subscribe", endpoint);
              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));
      function subscribe(_x) {
        return _ref2.apply(this, arguments);
      }
      return subscribe;
    }()
  }, {
    key: "on",
    value: function () {
      var _ref3 = asyncToGenerator(regeneratorRuntime.mark(function _callee3(ev, func) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.connecting;
              case 2:
                this.connection.client.on(ev, func);
              case 3:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));
      function on(_x2, _x3) {
        return _ref3.apply(this, arguments);
      }
      return on;
    }()
  }, {
    key: "emit",
    value: function () {
      var _ref4 = asyncToGenerator(regeneratorRuntime.mark(function _callee4(ev, data) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.connecting;
              case 2:
                this.connection.client.emit(ev, data);
              case 3:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));
      function emit(_x4, _x5) {
        return _ref4.apply(this, arguments);
      }
      return emit;
    }()
  }, {
    key: "query",
    value: function () {
      var _ref5 = asyncToGenerator(regeneratorRuntime.mark(function _callee5(verb, _query) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.connecting;
              case 2:
                return _context5.abrupt("return", this.connection.request(verb, _query));
              case 3:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));
      function query(_x6, _x7) {
        return _ref5.apply(this, arguments);
      }
      return query;
    }()
  }, {
    key: "get",
    value: function get$$1(query) {
      return this.query("GET", query);
    }
  }, {
    key: "post",
    value: function post(url, body) {
      var query = {
        url: url,
        body: body
      };
      return this.query("POST", query);
    }
  }, {
    key: "put",
    value: function put(url, body) {
      var query = {
        url: url,
        body: body
      };
      return this.query("PUT", query);
    }
  }, {
    key: "patch",
    value: function patch(url, body) {
      var query = {
        url: url,
        body: body
      };
      return this.query("PATCH", query);
    }
  }, {
    key: "delete",
    value: function _delete(url, body) {
      var query = {
        url: url,
        body: body
      };
      return this.query("DELETE", query);
    }
  }]);
  return Blitz;
}();
module.exports = Blitz;
//# sourceMappingURL=index.js.map
