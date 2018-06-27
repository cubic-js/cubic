'use strict';

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var runtime = createCommonjsModule(function (module) {
!(function(global) {
  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined;
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    {
      module.exports = runtime;
    }
    return;
  }
  runtime = global.regeneratorRuntime = module.exports;
  function wrap(innerFn, outerFn, self, tryLocsList) {
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);
    generator._invoke = makeInvokeMethod(innerFn, self, context);
    return generator;
  }
  runtime.wrap = wrap;
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }
  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";
  var ContinueSentinel = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };
  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    IteratorPrototype = NativeIteratorPrototype;
  }
  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }
  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };
  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };
  runtime.awrap = function(arg) {
    return { __await: arg };
  };
  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }
        return Promise.resolve(value).then(function(unwrapped) {
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }
    var previousPromise;
    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }
      return previousPromise =
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }
    this._invoke = enqueue;
  }
  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  runtime.AsyncIterator = AsyncIterator;
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );
    return runtime.isGeneratorFunction(outerFn)
      ? iter
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };
  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;
    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }
      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }
        return doneResult();
      }
      context.method = method;
      context.arg = arg;
      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }
        if (context.method === "next") {
          context.sent = context._sent = context.arg;
        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }
          context.dispatchException(context.arg);
        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }
        state = GenStateExecuting;
        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;
          if (record.arg === ContinueSentinel) {
            continue;
          }
          return {
            value: record.arg,
            done: context.done
          };
        } else if (record.type === "throw") {
          state = GenStateCompleted;
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      context.delegate = null;
      if (context.method === "throw") {
        if (delegate.iterator.return) {
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);
          if (context.method === "throw") {
            return ContinueSentinel;
          }
        }
        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }
      return ContinueSentinel;
    }
    var record = tryCatch(method, delegate.iterator, context.arg);
    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }
    var info = record.arg;
    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }
    if (info.done) {
      context[delegate.resultName] = info.value;
      context.next = delegate.nextLoc;
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }
    } else {
      return info;
    }
    context.delegate = null;
    return ContinueSentinel;
  }
  defineIteratorMethods(Gp);
  Gp[toStringTagSymbol] = "Generator";
  Gp[iteratorSymbol] = function() {
    return this;
  };
  Gp.toString = function() {
    return "[object Generator]";
  };
  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };
    if (1 in locs) {
      entry.catchLoc = locs[1];
    }
    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }
    this.tryEntries.push(entry);
  }
  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }
  function Context(tryLocsList) {
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }
  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }
      next.done = true;
      return next;
    };
  };
  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }
      if (typeof iterable.next === "function") {
        return iterable;
      }
      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }
          next.value = undefined;
          next.done = true;
          return next;
        };
        return next.next = next;
      }
    }
    return { next: doneResult };
  }
  runtime.values = values;
  function doneResult() {
    return { value: undefined, done: true };
  }
  Context.prototype = {
    constructor: Context,
    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;
      this.method = "next";
      this.arg = undefined;
      this.tryEntries.forEach(resetTryEntry);
      if (!skipTempReset) {
        for (var name in this) {
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },
    stop: function() {
      this.done = true;
      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }
      return this.rval;
    },
    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }
      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        if (caught) {
          context.method = "next";
          context.arg = undefined;
        }
        return !! caught;
      }
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;
        if (entry.tryLoc === "root") {
          return handle("end");
        }
        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");
          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }
          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },
    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }
      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        finallyEntry = null;
      }
      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;
      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }
      return this.complete(record);
    },
    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }
      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }
      return ContinueSentinel;
    },
    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },
    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }
      throw new Error("illegal catch attempt");
    },
    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };
      if (this.method === "next") {
        this.arg = undefined;
      }
      return ContinueSentinel;
    }
  };
})(
  (function() { return this })() || Function("return this")()
);
});

var runtime$1 = /*#__PURE__*/Object.freeze({
	default: runtime,
	__moduleExports: runtime
});

var require$$0 = ( runtime$1 && runtime ) || runtime$1;

var g = (function() { return this })() || Function("return this")();
var hadRuntime = g.regeneratorRuntime &&
  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;
var oldRuntime = hadRuntime && g.regeneratorRuntime;
g.regeneratorRuntime = undefined;
var runtimeModule = require$$0;
if (hadRuntime) {
  g.regeneratorRuntime = oldRuntime;
} else {
  try {
    delete g.regeneratorRuntime;
  } catch(e) {
    g.regeneratorRuntime = undefined;
  }
}

var runtimeModule$1 = /*#__PURE__*/Object.freeze({
	default: runtimeModule,
	__moduleExports: runtimeModule
});

var require$$0$1 = ( runtimeModule$1 && runtimeModule ) || runtimeModule$1;

var regenerator = require$$0$1;

var ceil = Math.ceil;
var floor = Math.floor;
var _toInteger = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

var _toInteger$1 = /*#__PURE__*/Object.freeze({
	default: _toInteger,
	__moduleExports: _toInteger
});

var _defined = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

var _defined$1 = /*#__PURE__*/Object.freeze({
	default: _defined,
	__moduleExports: _defined
});

var toInteger = ( _toInteger$1 && _toInteger ) || _toInteger$1;

var defined = ( _defined$1 && _defined ) || _defined$1;

var _stringAt = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

var _stringAt$1 = /*#__PURE__*/Object.freeze({
	default: _stringAt,
	__moduleExports: _stringAt
});

var _library = true;

var _library$1 = /*#__PURE__*/Object.freeze({
	default: _library,
	__moduleExports: _library
});

var _global = createCommonjsModule(function (module) {
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  : Function('return this')();
if (typeof __g == 'number') __g = global;
});

var _global$1 = /*#__PURE__*/Object.freeze({
	default: _global,
	__moduleExports: _global
});

var _core = createCommonjsModule(function (module) {
var core = module.exports = { version: '2.5.1' };
if (typeof __e == 'number') __e = core;
});
var _core_1 = _core.version;

var _core$1 = /*#__PURE__*/Object.freeze({
	default: _core,
	__moduleExports: _core,
	version: _core_1
});

var _aFunction = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

var _aFunction$1 = /*#__PURE__*/Object.freeze({
	default: _aFunction,
	__moduleExports: _aFunction
});

var aFunction = ( _aFunction$1 && _aFunction ) || _aFunction$1;

var _ctx = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (             ) {
    return fn.apply(that, arguments);
  };
};

var _ctx$1 = /*#__PURE__*/Object.freeze({
	default: _ctx,
	__moduleExports: _ctx
});

var _isObject = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

var _isObject$1 = /*#__PURE__*/Object.freeze({
	default: _isObject,
	__moduleExports: _isObject
});

var isObject = ( _isObject$1 && _isObject ) || _isObject$1;

var _anObject = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

var _anObject$1 = /*#__PURE__*/Object.freeze({
	default: _anObject,
	__moduleExports: _anObject
});

var _fails = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

var _fails$1 = /*#__PURE__*/Object.freeze({
	default: _fails,
	__moduleExports: _fails
});

var require$$1 = ( _fails$1 && _fails ) || _fails$1;

var _descriptors = !require$$1(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

var _descriptors$1 = /*#__PURE__*/Object.freeze({
	default: _descriptors,
	__moduleExports: _descriptors
});

var require$$0$2 = ( _global$1 && _global ) || _global$1;

var document$1 = require$$0$2.document;
var is = isObject(document$1) && isObject(document$1.createElement);
var _domCreate = function (it) {
  return is ? document$1.createElement(it) : {};
};

var _domCreate$1 = /*#__PURE__*/Object.freeze({
	default: _domCreate,
	__moduleExports: _domCreate
});

var require$$0$3 = ( _descriptors$1 && _descriptors ) || _descriptors$1;

var require$$2 = ( _domCreate$1 && _domCreate ) || _domCreate$1;

var _ie8DomDefine = !require$$0$3 && !require$$1(function () {
  return Object.defineProperty(require$$2('div'), 'a', { get: function () { return 7; } }).a != 7;
});

var _ie8DomDefine$1 = /*#__PURE__*/Object.freeze({
	default: _ie8DomDefine,
	__moduleExports: _ie8DomDefine
});

var _toPrimitive = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var _toPrimitive$1 = /*#__PURE__*/Object.freeze({
	default: _toPrimitive,
	__moduleExports: _toPrimitive
});

var anObject = ( _anObject$1 && _anObject ) || _anObject$1;

var IE8_DOM_DEFINE = ( _ie8DomDefine$1 && _ie8DomDefine ) || _ie8DomDefine$1;

var toPrimitive = ( _toPrimitive$1 && _toPrimitive ) || _toPrimitive$1;

var dP = Object.defineProperty;
var f = require$$0$3 ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) {             }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};
var _objectDp = {
	f: f
};

var _objectDp$1 = /*#__PURE__*/Object.freeze({
	default: _objectDp,
	__moduleExports: _objectDp,
	f: f
});

var _propertyDesc = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var _propertyDesc$1 = /*#__PURE__*/Object.freeze({
	default: _propertyDesc,
	__moduleExports: _propertyDesc
});

var dP$1 = ( _objectDp$1 && _objectDp ) || _objectDp$1;

var descriptor = ( _propertyDesc$1 && _propertyDesc ) || _propertyDesc$1;

var _hide = require$$0$3 ? function (object, key, value) {
  return dP$1.f(object, key, descriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var _hide$1 = /*#__PURE__*/Object.freeze({
	default: _hide,
	__moduleExports: _hide
});

var require$$1$1 = ( _core$1 && _core ) || _core$1;

var ctx = ( _ctx$1 && _ctx ) || _ctx$1;

var require$$0$4 = ( _hide$1 && _hide ) || _hide$1;

var PROTOTYPE = 'prototype';
var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? require$$1$1 : require$$1$1[name] || (require$$1$1[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? require$$0$2 : IS_STATIC ? require$$0$2[name] : (require$$0$2[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && key in exports) continue;
    out = own ? target[key] : source[key];
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    : IS_BIND && own ? ctx(out, require$$0$2)
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      if (type & $export.R && expProto && !expProto[key]) require$$0$4(expProto, key, out);
    }
  }
};
$export.F = 1;
$export.G = 2;
$export.S = 4;
$export.P = 8;
$export.B = 16;
$export.W = 32;
$export.U = 64;
$export.R = 128;
var _export = $export;

var _export$1 = /*#__PURE__*/Object.freeze({
	default: _export,
	__moduleExports: _export
});

var _redefine = require$$0$4;

var _redefine$1 = /*#__PURE__*/Object.freeze({
	default: _redefine,
	__moduleExports: _redefine
});

var hasOwnProperty = {}.hasOwnProperty;
var _has = function (it, key) {
  return hasOwnProperty.call(it, key);
};

var _has$1 = /*#__PURE__*/Object.freeze({
	default: _has,
	__moduleExports: _has
});

var _iterators = {};

var _iterators$1 = /*#__PURE__*/Object.freeze({
	default: _iterators,
	__moduleExports: _iterators
});

var toString = {}.toString;
var _cof = function (it) {
  return toString.call(it).slice(8, -1);
};

var _cof$1 = /*#__PURE__*/Object.freeze({
	default: _cof,
	__moduleExports: _cof
});

var cof = ( _cof$1 && _cof ) || _cof$1;

var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

var _iobject$1 = /*#__PURE__*/Object.freeze({
	default: _iobject,
	__moduleExports: _iobject
});

var IObject = ( _iobject$1 && _iobject ) || _iobject$1;

var _toIobject = function (it) {
  return IObject(defined(it));
};

var _toIobject$1 = /*#__PURE__*/Object.freeze({
	default: _toIobject,
	__moduleExports: _toIobject
});

var min = Math.min;
var _toLength = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0;
};

var _toLength$1 = /*#__PURE__*/Object.freeze({
	default: _toLength,
	__moduleExports: _toLength
});

var max = Math.max;
var min$1 = Math.min;
var _toAbsoluteIndex = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min$1(index, length);
};

var _toAbsoluteIndex$1 = /*#__PURE__*/Object.freeze({
	default: _toAbsoluteIndex,
	__moduleExports: _toAbsoluteIndex
});

var toIObject = ( _toIobject$1 && _toIobject ) || _toIobject$1;

var toLength = ( _toLength$1 && _toLength ) || _toLength$1;

var toAbsoluteIndex = ( _toAbsoluteIndex$1 && _toAbsoluteIndex ) || _toAbsoluteIndex$1;

var _arrayIncludes = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      if (value != value) return true;
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

var _arrayIncludes$1 = /*#__PURE__*/Object.freeze({
	default: _arrayIncludes,
	__moduleExports: _arrayIncludes
});

var SHARED = '__core-js_shared__';
var store = require$$0$2[SHARED] || (require$$0$2[SHARED] = {});
var _shared = function (key) {
  return store[key] || (store[key] = {});
};

var _shared$1 = /*#__PURE__*/Object.freeze({
	default: _shared,
	__moduleExports: _shared
});

var id = 0;
var px = Math.random();
var _uid = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

var _uid$1 = /*#__PURE__*/Object.freeze({
	default: _uid,
	__moduleExports: _uid
});

var require$$0$5 = ( _shared$1 && _shared ) || _shared$1;

var uid = ( _uid$1 && _uid ) || _uid$1;

var shared = require$$0$5('keys');
var _sharedKey = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

var _sharedKey$1 = /*#__PURE__*/Object.freeze({
	default: _sharedKey,
	__moduleExports: _sharedKey
});

var has = ( _has$1 && _has ) || _has$1;

var require$$0$6 = ( _arrayIncludes$1 && _arrayIncludes ) || _arrayIncludes$1;

var require$$1$2 = ( _sharedKey$1 && _sharedKey ) || _sharedKey$1;

var arrayIndexOf = require$$0$6(false);
var IE_PROTO = require$$1$2('IE_PROTO');
var _objectKeysInternal = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

var _objectKeysInternal$1 = /*#__PURE__*/Object.freeze({
	default: _objectKeysInternal,
	__moduleExports: _objectKeysInternal
});

var _enumBugKeys = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

var _enumBugKeys$1 = /*#__PURE__*/Object.freeze({
	default: _enumBugKeys,
	__moduleExports: _enumBugKeys
});

var $keys = ( _objectKeysInternal$1 && _objectKeysInternal ) || _objectKeysInternal$1;

var require$$0$7 = ( _enumBugKeys$1 && _enumBugKeys ) || _enumBugKeys$1;

var _objectKeys = Object.keys || function keys(O) {
  return $keys(O, require$$0$7);
};

var _objectKeys$1 = /*#__PURE__*/Object.freeze({
	default: _objectKeys,
	__moduleExports: _objectKeys
});

var getKeys = ( _objectKeys$1 && _objectKeys ) || _objectKeys$1;

var _objectDps = require$$0$3 ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP$1.f(O, P = keys[i++], Properties[P]);
  return O;
};

var _objectDps$1 = /*#__PURE__*/Object.freeze({
	default: _objectDps,
	__moduleExports: _objectDps
});

var document$2 = require$$0$2.document;
var _html = document$2 && document$2.documentElement;

var _html$1 = /*#__PURE__*/Object.freeze({
	default: _html,
	__moduleExports: _html
});

var dPs = ( _objectDps$1 && _objectDps ) || _objectDps$1;

var html = ( _html$1 && _html ) || _html$1;

var IE_PROTO$1 = require$$1$2('IE_PROTO');
var Empty = function () {             };
var PROTOTYPE$1 = 'prototype';
var createDict = function () {
  var iframe = require$$2('iframe');
  var i = require$$0$7.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  iframe.src = 'javascript:';
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE$1][require$$0$7[i]];
  return createDict();
};
var _objectCreate = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE$1] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE$1] = null;
    result[IE_PROTO$1] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

var _objectCreate$1 = /*#__PURE__*/Object.freeze({
	default: _objectCreate,
	__moduleExports: _objectCreate
});

var _wks = createCommonjsModule(function (module) {
var store = require$$0$5('wks');
var Symbol = require$$0$2.Symbol;
var USE_SYMBOL = typeof Symbol == 'function';
var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};
$exports.store = store;
});

var _wks$1 = /*#__PURE__*/Object.freeze({
	default: _wks,
	__moduleExports: _wks
});

var require$$0$8 = ( _wks$1 && _wks ) || _wks$1;

var def = dP$1.f;
var TAG = require$$0$8('toStringTag');
var _setToStringTag = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

var _setToStringTag$1 = /*#__PURE__*/Object.freeze({
	default: _setToStringTag,
	__moduleExports: _setToStringTag
});

var create = ( _objectCreate$1 && _objectCreate ) || _objectCreate$1;

var setToStringTag = ( _setToStringTag$1 && _setToStringTag ) || _setToStringTag$1;

var IteratorPrototype = {};
require$$0$4(IteratorPrototype, require$$0$8('iterator'), function () { return this; });
var _iterCreate = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};

var _iterCreate$1 = /*#__PURE__*/Object.freeze({
	default: _iterCreate,
	__moduleExports: _iterCreate
});

var _toObject = function (it) {
  return Object(defined(it));
};

var _toObject$1 = /*#__PURE__*/Object.freeze({
	default: _toObject,
	__moduleExports: _toObject
});

var toObject = ( _toObject$1 && _toObject ) || _toObject$1;

var IE_PROTO$2 = require$$1$2('IE_PROTO');
var ObjectProto = Object.prototype;
var _objectGpo = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO$2)) return O[IE_PROTO$2];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

var _objectGpo$1 = /*#__PURE__*/Object.freeze({
	default: _objectGpo,
	__moduleExports: _objectGpo
});

var LIBRARY = ( _library$1 && _library ) || _library$1;

var $export$1 = ( _export$1 && _export ) || _export$1;

var redefine = ( _redefine$1 && _redefine ) || _redefine$1;

var Iterators = ( _iterators$1 && _iterators ) || _iterators$1;

var $iterCreate = ( _iterCreate$1 && _iterCreate ) || _iterCreate$1;

var getPrototypeOf = ( _objectGpo$1 && _objectGpo ) || _objectGpo$1;

var ITERATOR = require$$0$8('iterator');
var BUGGY = !([].keys && 'next' in [].keys());
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';
var returnThis = function () { return this; };
var _iterDefine = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      setToStringTag(IteratorPrototype, TAG, true);
      if (!LIBRARY && !has(IteratorPrototype, ITERATOR)) require$$0$4(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    require$$0$4(proto, ITERATOR, $default);
  }
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export$1($export$1.P + $export$1.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

var _iterDefine$1 = /*#__PURE__*/Object.freeze({
	default: _iterDefine,
	__moduleExports: _iterDefine
});

var require$$0$9 = ( _stringAt$1 && _stringAt ) || _stringAt$1;

var require$$0$a = ( _iterDefine$1 && _iterDefine ) || _iterDefine$1;

var $at = require$$0$9(true);
require$$0$a(String, 'String', function (iterated) {
  this._t = String(iterated);
  this._i = 0;
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});

var _addToUnscopables = function () {             };

var _addToUnscopables$1 = /*#__PURE__*/Object.freeze({
	default: _addToUnscopables,
	__moduleExports: _addToUnscopables
});

var _iterStep = function (done, value) {
  return { value: value, done: !!done };
};

var _iterStep$1 = /*#__PURE__*/Object.freeze({
	default: _iterStep,
	__moduleExports: _iterStep
});

var addToUnscopables = ( _addToUnscopables$1 && _addToUnscopables ) || _addToUnscopables$1;

var step = ( _iterStep$1 && _iterStep ) || _iterStep$1;

var es6_array_iterator = require$$0$a(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated);
  this._i = 0;
  this._k = kind;
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');
Iterators.Arguments = Iterators.Array;
addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

var TO_STRING_TAG = require$$0$8('toStringTag');
var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
  'TextTrackList,TouchList').split(',');
for (var i = 0; i < DOMIterables.length; i++) {
  var NAME = DOMIterables[i];
  var Collection = require$$0$2[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto[TO_STRING_TAG]) require$$0$4(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}

var TAG$1 = require$$0$8('toStringTag');
var ARG = cof(function () { return arguments; }()) == 'Arguments';
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) {             }
};
var _classof = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    : typeof (T = tryGet(O = Object(it), TAG$1)) == 'string' ? T
    : ARG ? cof(O)
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

var _classof$1 = /*#__PURE__*/Object.freeze({
	default: _classof,
	__moduleExports: _classof
});

var _anInstance = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};

var _anInstance$1 = /*#__PURE__*/Object.freeze({
	default: _anInstance,
	__moduleExports: _anInstance
});

var _iterCall = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};

var _iterCall$1 = /*#__PURE__*/Object.freeze({
	default: _iterCall,
	__moduleExports: _iterCall
});

var ITERATOR$1 = require$$0$8('iterator');
var ArrayProto = Array.prototype;
var _isArrayIter = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR$1] === it);
};

var _isArrayIter$1 = /*#__PURE__*/Object.freeze({
	default: _isArrayIter,
	__moduleExports: _isArrayIter
});

var classof = ( _classof$1 && _classof ) || _classof$1;

var ITERATOR$2 = require$$0$8('iterator');
var core_getIteratorMethod = require$$1$1.getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR$2]
    || it['@@iterator']
    || Iterators[classof(it)];
};

var core_getIteratorMethod$1 = /*#__PURE__*/Object.freeze({
	default: core_getIteratorMethod,
	__moduleExports: core_getIteratorMethod
});

var call = ( _iterCall$1 && _iterCall ) || _iterCall$1;

var isArrayIter = ( _isArrayIter$1 && _isArrayIter ) || _isArrayIter$1;

var getIterFn = ( core_getIteratorMethod$1 && core_getIteratorMethod ) || core_getIteratorMethod$1;

var _forOf = createCommonjsModule(function (module) {
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;
});

var _forOf$1 = /*#__PURE__*/Object.freeze({
	default: _forOf,
	__moduleExports: _forOf
});

var SPECIES = require$$0$8('species');
var _speciesConstructor = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};

var _speciesConstructor$1 = /*#__PURE__*/Object.freeze({
	default: _speciesConstructor,
	__moduleExports: _speciesConstructor
});

var _invoke = function (fn, args, that) {
  var un = that === undefined;
  switch (args.length) {
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return fn.apply(that, args);
};

var _invoke$1 = /*#__PURE__*/Object.freeze({
	default: _invoke,
	__moduleExports: _invoke
});

var invoke = ( _invoke$1 && _invoke ) || _invoke$1;

var process = require$$0$2.process;
var setTask = require$$0$2.setImmediate;
var clearTask = require$$0$2.clearImmediate;
var MessageChannel = require$$0$2.MessageChannel;
var Dispatch = require$$0$2.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;
var run = function () {
  var id = +this;
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function (event) {
  run.call(event.data);
};
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  if (cof(process) == 'process') {
    defer = function (id) {
      process.nextTick(ctx(run, id, 1));
    };
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(ctx(run, id, 1));
    };
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  } else if (require$$0$2.addEventListener && typeof postMessage == 'function' && !require$$0$2.importScripts) {
    defer = function (id) {
      require$$0$2.postMessage(id + '', '*');
    };
    require$$0$2.addEventListener('message', listener, false);
  } else if (ONREADYSTATECHANGE in require$$2('script')) {
    defer = function (id) {
      html.appendChild(require$$2('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run.call(id);
      };
    };
  } else {
    defer = function (id) {
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
var _task = {
  set: setTask,
  clear: clearTask
};
var _task_1 = _task.set;
var _task_2 = _task.clear;

var _task$1 = /*#__PURE__*/Object.freeze({
	default: _task,
	__moduleExports: _task,
	set: _task_1,
	clear: _task_2
});

var require$$0$b = ( _task$1 && _task ) || _task$1;

var macrotask = require$$0$b.set;
var Observer = require$$0$2.MutationObserver || require$$0$2.WebKitMutationObserver;
var process$1 = require$$0$2.process;
var Promise$1 = require$$0$2.Promise;
var isNode = cof(process$1) == 'process';
var _microtask = function () {
  var head, last, notify;
  var flush = function () {
    var parent, fn;
    if (isNode && (parent = process$1.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (e) {
        if (head) notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if (parent) parent.enter();
  };
  if (isNode) {
    notify = function () {
      process$1.nextTick(flush);
    };
  } else if (Observer) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, { characterData: true });
    notify = function () {
      node.data = toggle = !toggle;
    };
  } else if (Promise$1 && Promise$1.resolve) {
    var promise = Promise$1.resolve();
    notify = function () {
      promise.then(flush);
    };
  } else {
    notify = function () {
      macrotask.call(require$$0$2, flush);
    };
  }
  return function (fn) {
    var task = { fn: fn, next: undefined };
    if (last) last.next = task;
    if (!head) {
      head = task;
      notify();
    } last = task;
  };
};

var _microtask$1 = /*#__PURE__*/Object.freeze({
	default: _microtask,
	__moduleExports: _microtask
});

function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
}
var f$1 = function (C) {
  return new PromiseCapability(C);
};
var _newPromiseCapability = {
	f: f$1
};

var _newPromiseCapability$1 = /*#__PURE__*/Object.freeze({
	default: _newPromiseCapability,
	__moduleExports: _newPromiseCapability,
	f: f$1
});

var _perform = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (e) {
    return { e: true, v: e };
  }
};

var _perform$1 = /*#__PURE__*/Object.freeze({
	default: _perform,
	__moduleExports: _perform
});

var newPromiseCapability = ( _newPromiseCapability$1 && _newPromiseCapability ) || _newPromiseCapability$1;

var _promiseResolve = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

var _promiseResolve$1 = /*#__PURE__*/Object.freeze({
	default: _promiseResolve,
	__moduleExports: _promiseResolve
});

var _redefineAll = function (target, src, safe) {
  for (var key in src) {
    if (safe && target[key]) target[key] = src[key];
    else require$$0$4(target, key, src[key]);
  } return target;
};

var _redefineAll$1 = /*#__PURE__*/Object.freeze({
	default: _redefineAll,
	__moduleExports: _redefineAll
});

var SPECIES$1 = require$$0$8('species');
var _setSpecies = function (KEY) {
  var C = typeof require$$1$1[KEY] == 'function' ? require$$1$1[KEY] : require$$0$2[KEY];
  if (require$$0$3 && C && !C[SPECIES$1]) dP$1.f(C, SPECIES$1, {
    configurable: true,
    get: function () { return this; }
  });
};

var _setSpecies$1 = /*#__PURE__*/Object.freeze({
	default: _setSpecies,
	__moduleExports: _setSpecies
});

var ITERATOR$3 = require$$0$8('iterator');
var SAFE_CLOSING = false;
try {
  var riter = [7][ITERATOR$3]();
  riter['return'] = function () { SAFE_CLOSING = true; };
} catch (e) {             }
var _iterDetect = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR$3]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR$3] = function () { return iter; };
    exec(arr);
  } catch (e) {             }
  return safe;
};

var _iterDetect$1 = /*#__PURE__*/Object.freeze({
	default: _iterDetect,
	__moduleExports: _iterDetect
});

var anInstance = ( _anInstance$1 && _anInstance ) || _anInstance$1;

var forOf = ( _forOf$1 && _forOf ) || _forOf$1;

var speciesConstructor = ( _speciesConstructor$1 && _speciesConstructor ) || _speciesConstructor$1;

var require$$1$3 = ( _microtask$1 && _microtask ) || _microtask$1;

var perform = ( _perform$1 && _perform ) || _perform$1;

var promiseResolve = ( _promiseResolve$1 && _promiseResolve ) || _promiseResolve$1;

var require$$3 = ( _redefineAll$1 && _redefineAll ) || _redefineAll$1;

var require$$5 = ( _setSpecies$1 && _setSpecies ) || _setSpecies$1;

var require$$7 = ( _iterDetect$1 && _iterDetect ) || _iterDetect$1;

var task = require$$0$b.set;
var microtask = require$$1$3();
var PROMISE = 'Promise';
var TypeError$1 = require$$0$2.TypeError;
var process$2 = require$$0$2.process;
var $Promise = require$$0$2[PROMISE];
var isNode$1 = classof(process$2) == 'process';
var empty = function () {             };
var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability$1 = newGenericPromiseCapability = newPromiseCapability.f;
var USE_NATIVE = !!function () {
  try {
    var promise = $Promise.resolve(1);
    var FakePromise = (promise.constructor = {})[require$$0$8('species')] = function (exec) {
      exec(empty, empty);
    };
    return (isNode$1 || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
  } catch (e) {             }
}();
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function (promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;
    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then;
      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value);
            if (domain) domain.exit();
          }
          if (result === reaction.promise) {
            reject(TypeError$1('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        reject(e);
      }
    };
    while (chain.length > i) run(chain[i++]);
    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};
var onUnhandled = function (promise) {
  task.call(require$$0$2, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;
    if (unhandled) {
      result = perform(function () {
        if (isNode$1) {
          process$2.emit('unhandledRejection', value, promise);
        } else if (handler = require$$0$2.onunhandledrejection) {
          handler({ promise: promise, reason: value });
        } else if ((console = require$$0$2.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      });
      promise._h = isNode$1 || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};
var isUnhandled = function (promise) {
  if (promise._h == 1) return false;
  var chain = promise._a || promise._c;
  var i = 0;
  var reaction;
  while (chain.length > i) {
    reaction = chain[i++];
    if (reaction.fail || !isUnhandled(reaction.promise)) return false;
  } return true;
};
var onHandleUnhandled = function (promise) {
  task.call(require$$0$2, function () {
    var handler;
    if (isNode$1) {
      process$2.emit('rejectionHandled', promise);
    } else if (handler = require$$0$2.onrejectionhandled) {
      handler({ promise: promise, reason: promise._v });
    }
  });
};
var $reject = function (value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise;
  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function (value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise;
  try {
    if (promise === value) throw TypeError$1("Promise can't be resolved itself");
    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = { _w: promise, _d: false };
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({ _w: promise, _d: false }, e);
  }
};
if (!USE_NATIVE) {
  $Promise = function Promise(executor) {
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  };
  Internal = function Promise(executor) {
    this._c = [];
    this._a = undefined;
    this._s = 0;
    this._d = false;
    this._v = undefined;
    this._h = 0;
    this._n = false;
  };
  Internal.prototype = require$$3($Promise.prototype, {
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability$1(speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode$1 ? process$2.domain : undefined;
      this._c.push(reaction);
      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject = ctx($reject, promise, 1);
  };
  newPromiseCapability.f = newPromiseCapability$1 = function (C) {
    return C === $Promise || C === Wrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}
$export$1($export$1.G + $export$1.W + $export$1.F * !USE_NATIVE, { Promise: $Promise });
setToStringTag($Promise, PROMISE);
require$$5(PROMISE);
Wrapper = require$$1$1[PROMISE];
$export$1($export$1.S + $export$1.F * !USE_NATIVE, PROMISE, {
  reject: function reject(r) {
    var capability = newPromiseCapability$1(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export$1($export$1.S + $export$1.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  resolve: function resolve(x) {
    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
  }
});
$export$1($export$1.S + $export$1.F * !(USE_NATIVE && require$$7(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability$1(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability$1(C);
    var reject = capability.reject;
    var result = perform(function () {
      forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});

$export$1($export$1.P + $export$1.R, 'Promise', { 'finally': function (onFinally) {
  var C = speciesConstructor(this, require$$1$1.Promise || require$$0$2.Promise);
  var isFunction = typeof onFinally == 'function';
  return this.then(
    isFunction ? function (x) {
      return promiseResolve(C, onFinally()).then(function () { return x; });
    } : onFinally,
    isFunction ? function (e) {
      return promiseResolve(C, onFinally()).then(function () { throw e; });
    } : onFinally
  );
} });

$export$1($export$1.S, 'Promise', { 'try': function (callbackfn) {
  var promiseCapability = newPromiseCapability.f(this);
  var result = perform(callbackfn);
  (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
  return promiseCapability.promise;
} });

var promise = require$$1$1.Promise;

var promise$1 = /*#__PURE__*/Object.freeze({
	default: promise,
	__moduleExports: promise
});

var require$$0$c = ( promise$1 && promise ) || promise$1;

var promise$2 = createCommonjsModule(function (module) {
module.exports = { "default": require$$0$c, __esModule: true };
});
var _Promise = unwrapExports(promise$2);

var promise$3 = /*#__PURE__*/Object.freeze({
	default: _Promise,
	__moduleExports: promise$2
});

var _promise = ( promise$3 && _Promise ) || promise$3;

var asyncToGenerator = createCommonjsModule(function (module, exports) {
exports.__esModule = true;
var _promise2 = _interopRequireDefault(_promise);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
exports.default = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new _promise2.default(function (resolve, reject) {
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
          return _promise2.default.resolve(value).then(function (value) {
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
});
var _asyncToGenerator = unwrapExports(asyncToGenerator);

var f$2 = Object.getOwnPropertySymbols;
var _objectGops = {
	f: f$2
};

var _objectGops$1 = /*#__PURE__*/Object.freeze({
	default: _objectGops,
	__moduleExports: _objectGops,
	f: f$2
});

var f$3 = {}.propertyIsEnumerable;
var _objectPie = {
	f: f$3
};

var _objectPie$1 = /*#__PURE__*/Object.freeze({
	default: _objectPie,
	__moduleExports: _objectPie,
	f: f$3
});

var gOPS = ( _objectGops$1 && _objectGops ) || _objectGops$1;

var pIE = ( _objectPie$1 && _objectPie ) || _objectPie$1;

var $assign = Object.assign;
var _objectAssign = !$assign || require$$1(function () {
  var A = {};
  var B = {};
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) {
  var T = toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = gOPS.f;
  var isEnum = pIE.f;
  while (aLen > index) {
    var S = IObject(arguments[index++]);
    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
  } return T;
} : $assign;

var _objectAssign$1 = /*#__PURE__*/Object.freeze({
	default: _objectAssign,
	__moduleExports: _objectAssign
});

var require$$0$d = ( _objectAssign$1 && _objectAssign ) || _objectAssign$1;

$export$1($export$1.S + $export$1.F, 'Object', { assign: require$$0$d });

var assign = require$$1$1.Object.assign;

var assign$1 = /*#__PURE__*/Object.freeze({
	default: assign,
	__moduleExports: assign
});

var require$$0$e = ( assign$1 && assign ) || assign$1;

var assign$2 = createCommonjsModule(function (module) {
module.exports = { "default": require$$0$e, __esModule: true };
});
var _Object$assign = unwrapExports(assign$2);

var classCallCheck = createCommonjsModule(function (module, exports) {
exports.__esModule = true;
exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
});
var _classCallCheck = unwrapExports(classCallCheck);

$export$1($export$1.S + $export$1.F * !require$$0$3, 'Object', { defineProperty: dP$1.f });

var $Object = require$$1$1.Object;
var defineProperty = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};

var defineProperty$1 = /*#__PURE__*/Object.freeze({
	default: defineProperty,
	__moduleExports: defineProperty
});

var require$$0$f = ( defineProperty$1 && defineProperty ) || defineProperty$1;

var defineProperty$2 = createCommonjsModule(function (module) {
module.exports = { "default": require$$0$f, __esModule: true };
});
var defineProperty$3 = unwrapExports(defineProperty$2);

var defineProperty$4 = /*#__PURE__*/Object.freeze({
	default: defineProperty$3,
	__moduleExports: defineProperty$2
});

var _defineProperty = ( defineProperty$4 && defineProperty$3 ) || defineProperty$4;

var createClass = createCommonjsModule(function (module, exports) {
exports.__esModule = true;
var _defineProperty2 = _interopRequireDefault(_defineProperty);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }
  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
});
var _createClass = unwrapExports(createClass);

var io = require('socket.io-client');
var timeout = function timeout(fn, s) {
  return new _Promise(function (resolve) {
    return setTimeout(function () {
      return resolve(fn());
    }, s);
  });
};
var Auth = function () {
  function Auth(options) {
    _classCallCheck(this, Auth);
    this.options = options;
    this.client = io.connect(this.options.auth_url + '/');
  }
  _createClass(Auth, [{
    key: 'req',
    value: function () {
      var _ref = _asyncToGenerator(regenerator.mark(function _callee(verb, query) {
        var _this = this;
        var res;
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return new _Promise(function (resolve) {
                  return _this.client.emit(verb, query, resolve);
                });
              case 2:
                res = _context.sent;
                _context.prev = 3;
                res = JSON.parse(res.body);
                _context.next = 10;
                break;
              case 7:
                _context.prev = 7;
                _context.t0 = _context['catch'](3);
                throw res;
              case 10:
                if (!res.error) {
                  _context.next = 14;
                  break;
                }
                throw res;
              case 14:
                return _context.abrupt('return', res);
              case 15:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[3, 7]]);
      }));
      function req(_x, _x2) {
        return _ref.apply(this, arguments);
      }
      return req;
    }()
  }, {
    key: 'authorize',
    value: function () {
      var _ref2 = _asyncToGenerator(regenerator.mark(function _callee2() {
        var refresh = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.refresh_token;
        return regenerator.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(this.options.user_key && this.options.user_secret || refresh)) {
                  _context2.next = 2;
                  break;
                }
                return _context2.abrupt('return', refresh ? this.refreshToken() : this.getToken());
              case 2:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));
      function authorize() {
        return _ref2.apply(this, arguments);
      }
      return authorize;
    }()
  }, {
    key: 'getToken',
    value: function () {
      var _ref3 = _asyncToGenerator(regenerator.mark(function _callee3() {
        var _this2 = this;
        var body, res, t;
        return regenerator.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                body = {
                  user_key: this.options.user_key,
                  user_secret: this.options.user_secret
                };
                _context3.prev = 1;
                _context3.next = 4;
                return this.req('POST', {
                  url: '/authenticate',
                  body: body
                });
              case 4:
                res = _context3.sent;
                this.access_token = res.access_token;
                this.refresh_token = res.refresh_token;
                _context3.next = 16;
                break;
              case 9:
                _context3.prev = 9;
                _context3.t0 = _context3['catch'](1);
                t = _context3.t0.reason ? parseInt(_context3.t0.reason.replace(/[^0-9]+/g, '')) : 500;
                t = isNaN(t) ? 500 : t;
                if (_context3.t0.statusCode !== 503) {
                  console.error('cubic-client encountered an error while authenticating:');
                  console.error(_context3.t0);
                  console.error('retrying in ' + t + 'ms \n');
                }
                _context3.next = 16;
                return timeout(function () {
                  return _this2.getToken();
                }, t);
              case 16:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this, [[1, 9]]);
      }));
      function getToken() {
        return _ref3.apply(this, arguments);
      }
      return getToken;
    }()
  }, {
    key: 'refreshToken',
    value: function () {
      var _ref4 = _asyncToGenerator(regenerator.mark(function _callee4() {
        var _this3 = this;
        var body, res, t;
        return regenerator.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (this.refreshing) {
                  _context4.next = 17;
                  break;
                }
                this.refreshing = true;
                body = {
                  refresh_token: this.refresh_token
                };
                _context4.prev = 3;
                _context4.next = 6;
                return this.req('POST', {
                  url: '/refresh',
                  body: body
                });
              case 6:
                res = _context4.sent;
                this.access_token = res.access_token;
                this.refreshing = false;
                _context4.next = 17;
                break;
              case 11:
                _context4.prev = 11;
                _context4.t0 = _context4['catch'](3);
                this.refreshing = false;
                t = _context4.t0.reason ? parseInt(_context4.t0.reason.replace(/[^0-9]+/g, '')) : 5000;
                _context4.next = 17;
                return timeout(function () {
                  return _this3.refreshToken();
                }, t);
              case 17:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this, [[3, 11]]);
      }));
      function refreshToken() {
        return _ref4.apply(this, arguments);
      }
      return refreshToken;
    }()
  }]);
  return Auth;
}();

var _objectSap = function (KEY, exec) {
  var fn = (require$$1$1.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export$1($export$1.S + $export$1.F * require$$1(function () { fn(1); }), 'Object', exp);
};

var _objectSap$1 = /*#__PURE__*/Object.freeze({
	default: _objectSap,
	__moduleExports: _objectSap
});

var require$$0$g = ( _objectSap$1 && _objectSap ) || _objectSap$1;

require$$0$g('getPrototypeOf', function () {
  return function getPrototypeOf$$1(it) {
    return getPrototypeOf(toObject(it));
  };
});

var getPrototypeOf$1 = require$$1$1.Object.getPrototypeOf;

var getPrototypeOf$2 = /*#__PURE__*/Object.freeze({
	default: getPrototypeOf$1,
	__moduleExports: getPrototypeOf$1
});

var require$$0$h = ( getPrototypeOf$2 && getPrototypeOf$1 ) || getPrototypeOf$2;

var getPrototypeOf$3 = createCommonjsModule(function (module) {
module.exports = { "default": require$$0$h, __esModule: true };
});
var _Object$getPrototypeOf = unwrapExports(getPrototypeOf$3);

var f$4 = require$$0$8;
var _wksExt = {
	f: f$4
};

var _wksExt$1 = /*#__PURE__*/Object.freeze({
	default: _wksExt,
	__moduleExports: _wksExt,
	f: f$4
});

var wksExt = ( _wksExt$1 && _wksExt ) || _wksExt$1;

var iterator = wksExt.f('iterator');

var iterator$1 = /*#__PURE__*/Object.freeze({
	default: iterator,
	__moduleExports: iterator
});

var require$$0$i = ( iterator$1 && iterator ) || iterator$1;

var iterator$2 = createCommonjsModule(function (module) {
module.exports = { "default": require$$0$i, __esModule: true };
});
var iterator$3 = unwrapExports(iterator$2);

var iterator$4 = /*#__PURE__*/Object.freeze({
	default: iterator$3,
	__moduleExports: iterator$2
});

var _meta = createCommonjsModule(function (module) {
var META = uid('meta');
var setDesc = dP$1.f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !require$$1(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id,
    w: {}
  } });
};
var fastKey = function (it, create) {
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    if (!isExtensible(it)) return 'F';
    if (!create) return 'E';
    setMeta(it);
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    if (!isExtensible(it)) return true;
    if (!create) return false;
    setMeta(it);
  } return it[META].w;
};
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};
});
var _meta_1 = _meta.KEY;
var _meta_2 = _meta.NEED;
var _meta_3 = _meta.fastKey;
var _meta_4 = _meta.getWeak;
var _meta_5 = _meta.onFreeze;

var _meta$1 = /*#__PURE__*/Object.freeze({
	default: _meta,
	__moduleExports: _meta,
	KEY: _meta_1,
	NEED: _meta_2,
	fastKey: _meta_3,
	getWeak: _meta_4,
	onFreeze: _meta_5
});

var defineProperty$5 = dP$1.f;
var _wksDefine = function (name) {
  var $Symbol = require$$1$1.Symbol || (require$$1$1.Symbol = LIBRARY ? {} : require$$0$2.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty$5($Symbol, name, { value: wksExt.f(name) });
};

var _wksDefine$1 = /*#__PURE__*/Object.freeze({
	default: _wksDefine,
	__moduleExports: _wksDefine
});

var _enumKeys = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};

var _enumKeys$1 = /*#__PURE__*/Object.freeze({
	default: _enumKeys,
	__moduleExports: _enumKeys
});

var _isArray = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};

var _isArray$1 = /*#__PURE__*/Object.freeze({
	default: _isArray,
	__moduleExports: _isArray
});

var hiddenKeys = require$$0$7.concat('length', 'prototype');
var f$5 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};
var _objectGopn = {
	f: f$5
};

var _objectGopn$1 = /*#__PURE__*/Object.freeze({
	default: _objectGopn,
	__moduleExports: _objectGopn,
	f: f$5
});

var require$$0$j = ( _objectGopn$1 && _objectGopn ) || _objectGopn$1;

var gOPN = require$$0$j.f;
var toString$1 = {}.toString;
var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];
var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};
var f$6 = function getOwnPropertyNames(it) {
  return windowNames && toString$1.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};
var _objectGopnExt = {
	f: f$6
};

var _objectGopnExt$1 = /*#__PURE__*/Object.freeze({
	default: _objectGopnExt,
	__moduleExports: _objectGopnExt,
	f: f$6
});

var gOPD = Object.getOwnPropertyDescriptor;
var f$7 = require$$0$3 ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) {             }
  if (has(O, P)) return descriptor(!pIE.f.call(O, P), O[P]);
};
var _objectGopd = {
	f: f$7
};

var _objectGopd$1 = /*#__PURE__*/Object.freeze({
	default: _objectGopd,
	__moduleExports: _objectGopd,
	f: f$7
});

var require$$0$k = ( _meta$1 && _meta ) || _meta$1;

var require$$0$l = ( _wksDefine$1 && _wksDefine ) || _wksDefine$1;

var enumKeys = ( _enumKeys$1 && _enumKeys ) || _enumKeys$1;

var isArray = ( _isArray$1 && _isArray ) || _isArray$1;

var gOPNExt = ( _objectGopnExt$1 && _objectGopnExt ) || _objectGopnExt$1;

var require$$1$4 = ( _objectGopd$1 && _objectGopd ) || _objectGopd$1;

var META = require$$0$k.KEY;
var gOPD$1 = require$$1$4.f;
var dP$2 = dP$1.f;
var gOPN$1 = gOPNExt.f;
var $Symbol = require$$0$2.Symbol;
var $JSON = require$$0$2.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE$2 = 'prototype';
var HIDDEN = require$$0$8('_hidden');
var TO_PRIMITIVE = require$$0$8('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = require$$0$5('symbol-registry');
var AllSymbols = require$$0$5('symbols');
var OPSymbols = require$$0$5('op-symbols');
var ObjectProto$1 = Object[PROTOTYPE$2];
var USE_NATIVE$1 = typeof $Symbol == 'function';
var QObject = require$$0$2.QObject;
var setter = !QObject || !QObject[PROTOTYPE$2] || !QObject[PROTOTYPE$2].findChild;
var setSymbolDesc = require$$0$3 && require$$1(function () {
  return create(dP$2({}, 'a', {
    get: function () { return dP$2(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD$1(ObjectProto$1, key);
  if (protoDesc) delete ObjectProto$1[key];
  dP$2(it, key, D);
  if (protoDesc && it !== ObjectProto$1) dP$2(ObjectProto$1, key, protoDesc);
} : dP$2;
var wrap = function (tag) {
  var sym = AllSymbols[tag] = create($Symbol[PROTOTYPE$2]);
  sym._k = tag;
  return sym;
};
var isSymbol = USE_NATIVE$1 && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};
var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto$1) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP$2(it, HIDDEN, descriptor(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = create(D, { enumerable: descriptor(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP$2(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create$$1(it, P) {
  return P === undefined ? create(it) : $defineProperties(create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto$1 && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto$1 && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD$1(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN$1(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto$1;
  var names = gOPN$1(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto$1, key) : true)) result.push(AllSymbols[key]);
  } return result;
};
if (!USE_NATIVE$1) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto$1) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, descriptor(1, value));
    };
    if (require$$0$3 && setter) setSymbolDesc(ObjectProto$1, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE$2], 'toString', function toString() {
    return this._k;
  });
  require$$1$4.f = $getOwnPropertyDescriptor;
  dP$1.f = $defineProperty;
  require$$0$j.f = gOPNExt.f = $getOwnPropertyNames;
  pIE.f = $propertyIsEnumerable;
  gOPS.f = $getOwnPropertySymbols;
  if (require$$0$3 && !LIBRARY) {
    redefine(ObjectProto$1, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }
  wksExt.f = function (name) {
    return wrap(require$$0$8(name));
  };
}
$export$1($export$1.G + $export$1.W + $export$1.F * !USE_NATIVE$1, { Symbol: $Symbol });
for (var es6Symbols = (
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)require$$0$8(es6Symbols[j++]);
for (var wellKnownSymbols = getKeys(require$$0$8.store), k = 0; wellKnownSymbols.length > k;) require$$0$l(wellKnownSymbols[k++]);
$export$1($export$1.S + $export$1.F * !USE_NATIVE$1, 'Symbol', {
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});
$export$1($export$1.S + $export$1.F * !USE_NATIVE$1, 'Object', {
  create: $create,
  defineProperty: $defineProperty,
  defineProperties: $defineProperties,
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  getOwnPropertyNames: $getOwnPropertyNames,
  getOwnPropertySymbols: $getOwnPropertySymbols
});
$JSON && $export$1($export$1.S + $export$1.F * (!USE_NATIVE$1 || require$$1(function () {
  var S = $Symbol();
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    if (it === undefined || isSymbol(it)) return;
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    replacer = args[1];
    if (typeof replacer == 'function') $replacer = replacer;
    if ($replacer || !isArray(replacer)) replacer = function (key, value) {
      if ($replacer) value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});
$Symbol[PROTOTYPE$2][TO_PRIMITIVE] || require$$0$4($Symbol[PROTOTYPE$2], TO_PRIMITIVE, $Symbol[PROTOTYPE$2].valueOf);
setToStringTag($Symbol, 'Symbol');
setToStringTag(Math, 'Math', true);
setToStringTag(require$$0$2.JSON, 'JSON', true);

require$$0$l('asyncIterator');

require$$0$l('observable');

var symbol = require$$1$1.Symbol;

var symbol$1 = /*#__PURE__*/Object.freeze({
	default: symbol,
	__moduleExports: symbol
});

var require$$0$m = ( symbol$1 && symbol ) || symbol$1;

var symbol$2 = createCommonjsModule(function (module) {
module.exports = { "default": require$$0$m, __esModule: true };
});
var symbol$3 = unwrapExports(symbol$2);

var symbol$4 = /*#__PURE__*/Object.freeze({
	default: symbol$3,
	__moduleExports: symbol$2
});

var _iterator = ( iterator$4 && iterator$3 ) || iterator$4;

var _symbol = ( symbol$4 && symbol$3 ) || symbol$4;

var _typeof_1 = createCommonjsModule(function (module, exports) {
exports.__esModule = true;
var _iterator2 = _interopRequireDefault(_iterator);
var _symbol2 = _interopRequireDefault(_symbol);
var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};
});
var _typeof = unwrapExports(_typeof_1);

var _typeof$1 = /*#__PURE__*/Object.freeze({
	default: _typeof,
	__moduleExports: _typeof_1
});

var _typeof2 = ( _typeof$1 && _typeof ) || _typeof$1;

var possibleConstructorReturn = createCommonjsModule(function (module, exports) {
exports.__esModule = true;
var _typeof3 = _interopRequireDefault(_typeof2);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
exports.default = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
};
});
var _possibleConstructorReturn = unwrapExports(possibleConstructorReturn);

var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
var _setProto = {
  set: Object.setPrototypeOf || ('__proto__' in {} ?
    function (test, buggy, set) {
      try {
        set = ctx(Function.call, require$$1$4.f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};
var _setProto_1 = _setProto.set;
var _setProto_2 = _setProto.check;

var _setProto$1 = /*#__PURE__*/Object.freeze({
	default: _setProto,
	__moduleExports: _setProto,
	set: _setProto_1,
	check: _setProto_2
});

var require$$0$n = ( _setProto$1 && _setProto ) || _setProto$1;

$export$1($export$1.S, 'Object', { setPrototypeOf: require$$0$n.set });

var setPrototypeOf = require$$1$1.Object.setPrototypeOf;

var setPrototypeOf$1 = /*#__PURE__*/Object.freeze({
	default: setPrototypeOf,
	__moduleExports: setPrototypeOf
});

var require$$0$o = ( setPrototypeOf$1 && setPrototypeOf ) || setPrototypeOf$1;

var setPrototypeOf$2 = createCommonjsModule(function (module) {
module.exports = { "default": require$$0$o, __esModule: true };
});
var setPrototypeOf$3 = unwrapExports(setPrototypeOf$2);

var setPrototypeOf$4 = /*#__PURE__*/Object.freeze({
	default: setPrototypeOf$3,
	__moduleExports: setPrototypeOf$2
});

$export$1($export$1.S, 'Object', { create: create });

var $Object$1 = require$$1$1.Object;
var create$1 = function create(P, D) {
  return $Object$1.create(P, D);
};

var create$2 = /*#__PURE__*/Object.freeze({
	default: create$1,
	__moduleExports: create$1
});

var require$$0$p = ( create$2 && create$1 ) || create$2;

var create$3 = createCommonjsModule(function (module) {
module.exports = { "default": require$$0$p, __esModule: true };
});
var create$4 = unwrapExports(create$3);

var create$5 = /*#__PURE__*/Object.freeze({
	default: create$4,
	__moduleExports: create$3
});

var _setPrototypeOf = ( setPrototypeOf$4 && setPrototypeOf$3 ) || setPrototypeOf$4;

var _create = ( create$5 && create$4 ) || create$5;

var inherits = createCommonjsModule(function (module, exports) {
exports.__esModule = true;
var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);
var _create2 = _interopRequireDefault(_create);
var _typeof3 = _interopRequireDefault(_typeof2);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
exports.default = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : (0, _typeof3.default)(superClass)));
  }
  subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
};
});
var _inherits = unwrapExports(inherits);

var ServerError = function (_Error) {
  _inherits(ServerError, _Error);
  function ServerError(_ref, query) {
    var statusCode = _ref.statusCode,
        body = _ref.body;
    _classCallCheck(this, ServerError);
    var _this = _possibleConstructorReturn(this, (ServerError.__proto__ || _Object$getPrototypeOf(ServerError)).call(this, "Cubic-client encountered an error while requesting " + query + ": " + statusCode + " - " + body.error + " (" + body.reason + ")"));
    _this.statusCode = statusCode;
    _this.reason = body.reason;
    _this.error = body.error;
    return _this;
  }
  return ServerError;
}(Error);

var io$1 = require('socket.io-client');
var queue$1 = require('async-delay-queue');
var timeout$1 = function timeout(fn, s) {
  return new _Promise(function (resolve) {
    return setTimeout(function () {
      return resolve(fn());
    }, s);
  });
};
var Connection = function () {
  function Connection(options) {
    _classCallCheck(this, Connection);
    this.options = options;
    this.subscriptions = [];
    this.queue = queue$1;
    this.auth = new Auth(options);
  }
  _createClass(Connection, [{
    key: 'connect',
    value: function () {
      var _ref = _asyncToGenerator(regenerator.mark(function _callee() {
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.auth.authorize();
              case 2:
                _context.next = 4;
                return this.setClient();
              case 4:
              case 'end':
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
    key: 'setClient',
    value: function () {
      var _ref2 = _asyncToGenerator(regenerator.mark(function _callee3() {
        var _this = this;
        var sioConfig;
        return regenerator.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                sioConfig = this.auth.access_token ? {
                  query: 'bearer=' + this.auth.access_token
                } : {};
                this.client = io$1.connect(this.options.api_url + this.options.namespace, sioConfig);
                this.client.on('disconnect', _asyncToGenerator(regenerator.mark(function _callee2() {
                  return regenerator.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          _this.reload();
                        case 1:
                        case 'end':
                          return _context2.stop();
                      }
                    }
                  }, _callee2, _this);
                })));
                this.client.on('subscribed', function (sub) {
                  if (!_this.subscriptions.includes(sub)) _this.subscriptions.push(sub);
                });
                this.client.on('connect', function () {
                  _this.subscriptions.forEach(function (sub) {
                    return _this.client.emit('subscribe', sub);
                  });
                });
                _context3.next = 7;
                return timeout$1(function () {
                  return _this.client.connected ? null : _this.setClient();
                }, 1000);
              case 7:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));
      function setClient() {
        return _ref2.apply(this, arguments);
      }
      return setClient;
    }()
  }, {
    key: 'reconnect',
    value: function () {
      var _ref4 = _asyncToGenerator(regenerator.mark(function _callee4(refresh) {
        var _this2 = this;
        return regenerator.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                this.client.disconnect();
                _context4.next = 3;
                return this.auth.authorize(refresh);
              case 3:
                this.client.io.opts.query = this.auth.access_token ? 'bearer=' + this.auth.access_token : null;
                this.client.connect();
                this.client.once('connect', function () {
                  _this2.reconnecting = _Promise.resolve();
                });
                _context4.next = 8;
                return timeout$1(function () {
                  return _this2.client.connected ? null : _this2.reload();
                }, 1000);
              case 8:
                _context4.next = 10;
                return this.reconnecting;
              case 10:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));
      function reconnect(_x) {
        return _ref4.apply(this, arguments);
      }
      return reconnect;
    }()
  }, {
    key: 'reload',
    value: function () {
      var _ref5 = _asyncToGenerator(regenerator.mark(function _callee5(refresh) {
        return regenerator.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.reconnecting;
              case 2:
                if (_context5.sent) {
                  _context5.next = 4;
                  break;
                }
                this.reconnecting = this.reconnect(refresh);
              case 4:
                return _context5.abrupt('return', this.reconnecting);
              case 5:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));
      function reload(_x2) {
        return _ref5.apply(this, arguments);
      }
      return reload;
    }()
  }, {
    key: 'request',
    value: function () {
      var _ref6 = _asyncToGenerator(regenerator.mark(function _callee6(verb, query) {
        var res;
        return regenerator.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.req(verb, query);
              case 2:
                res = _context6.sent;
                return _context6.abrupt('return', this.errCheck(res, verb, query));
              case 4:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));
      function request(_x3, _x4) {
        return _ref6.apply(this, arguments);
      }
      return request;
    }()
  }, {
    key: 'req',
    value: function () {
      var _ref7 = _asyncToGenerator(regenerator.mark(function _callee7(verb, query) {
        var _this3 = this;
        return regenerator.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                return _context7.abrupt('return', new _Promise(function (resolve) {
                  return _this3.client.emit(verb, query, resolve);
                }));
              case 1:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));
      function req(_x5, _x6) {
        return _ref7.apply(this, arguments);
      }
      return req;
    }()
  }, {
    key: 'retry',
    value: function () {
      var _ref8 = _asyncToGenerator(regenerator.mark(function _callee8(res, verb, query) {
        var _this4 = this;
        var delay, reres;
        return regenerator.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                delay = res.body && res.body.reason ? parseInt(res.body.reason.replace(/[^0-9]+/g, '')) : 500;
                delay = isNaN(delay) ? 500 : delay;
                _context8.next = 4;
                return this.queue.delay(function () {
                  return _this4.req(verb, query);
                }, delay, 30000, 'unshift');
              case 4:
                reres = _context8.sent;
                return _context8.abrupt('return', this.errCheck(reres, verb, query));
              case 6:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));
      function retry(_x7, _x8, _x9) {
        return _ref8.apply(this, arguments);
      }
      return retry;
    }()
  }, {
    key: 'errCheck',
    value: function () {
      var _ref9 = _asyncToGenerator(regenerator.mark(function _callee9() {
        var res = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var verb = arguments[1];
        var query = arguments[2];
        return regenerator.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                if (!(parseInt(res.statusCode.toString()[0]) > 3)) {
                  _context9.next = 12;
                  break;
                }
                if (!(res.body && res.body.reason && res.body.reason.includes('jwt expired'))) {
                  _context9.next = 5;
                  break;
                }
                _context9.next = 4;
                return this.reload();
              case 4:
                return _context9.abrupt('return', this.retry(res, verb, query));
              case 5:
                if (!(res.statusCode === 429 && !this.options.ignore_limiter)) {
                  _context9.next = 7;
                  break;
                }
                return _context9.abrupt('return', this.retry(res, verb, query));
              case 7:
                if (!(res.statusCode === 503)) {
                  _context9.next = 9;
                  break;
                }
                return _context9.abrupt('return', this.retry(res, verb, query));
              case 9:
                throw new ServerError(res, query);
              case 12:
                return _context9.abrupt('return', this.parse(res));
              case 13:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));
      function errCheck() {
        return _ref9.apply(this, arguments);
      }
      return errCheck;
    }()
  }, {
    key: 'parse',
    value: function parse(res) {
      try {
        return JSON.parse(res.body);
      } catch (e) {
        return res.body;
      }
    }
  }]);
  return Connection;
}();

var Client = function () {
  function Client(options) {
    _classCallCheck(this, Client);
    this.options = _Object$assign({
      api_url: 'http://localhost:3003/',
      auth_url: 'http://localhost:3030/',
      namespace: '/',
      user_key: null,
      user_secret: null,
      ignore_limiter: false
    }, options);
    var api = this.options.api_url;
    var auth = this.options.auth_url;
    this.options.api_url = api[api.length - 1] === '/' ? api.slice(0, -1) : api;
    this.options.auth_url = auth[auth.length - 1] === '/' ? auth.slice(0, -1) : auth;
    this.connect();
  }
  _createClass(Client, [{
    key: 'connect',
    value: function () {
      var _ref = _asyncToGenerator(regenerator.mark(function _callee() {
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.connection = new Connection(this.options);
                this.connecting = this.connection.connect();
                _context.next = 4;
                return this.connecting;
              case 4:
              case 'end':
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
    key: 'connections',
    value: function () {
      var _ref2 = _asyncToGenerator(regenerator.mark(function _callee2() {
        return regenerator.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.connecting;
              case 2:
                _context2.next = 4;
                return this.connection.reconnecting;
              case 4:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));
      function connections() {
        return _ref2.apply(this, arguments);
      }
      return connections;
    }()
  }, {
    key: 'subscribe',
    value: function () {
      var _ref3 = _asyncToGenerator(regenerator.mark(function _callee3(endpoint, fn) {
        return regenerator.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.connections();
              case 2:
                this.emit('subscribe', endpoint);
                return _context3.abrupt('return', fn ? this.on(endpoint, fn) : null);
              case 4:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));
      function subscribe(_x, _x2) {
        return _ref3.apply(this, arguments);
      }
      return subscribe;
    }()
  }, {
    key: 'unsubscribe',
    value: function () {
      var _ref4 = _asyncToGenerator(regenerator.mark(function _callee4(endpoint) {
        return regenerator.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.connections();
              case 2:
                this.emit('unsubscribe', endpoint);
                this.connection.client.off(endpoint);
              case 4:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));
      function unsubscribe(_x3) {
        return _ref4.apply(this, arguments);
      }
      return unsubscribe;
    }()
  }, {
    key: 'on',
    value: function () {
      var _ref5 = _asyncToGenerator(regenerator.mark(function _callee5(ev, fn) {
        return regenerator.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.connections();
              case 2:
                return _context5.abrupt('return', this.connection.client.on(ev, fn));
              case 3:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));
      function on(_x4, _x5) {
        return _ref5.apply(this, arguments);
      }
      return on;
    }()
  }, {
    key: 'once',
    value: function () {
      var _ref6 = _asyncToGenerator(regenerator.mark(function _callee6(ev, fn) {
        return regenerator.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.connections();
              case 2:
                return _context6.abrupt('return', this.connection.client.once(ev, fn));
              case 3:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));
      function once(_x6, _x7) {
        return _ref6.apply(this, arguments);
      }
      return once;
    }()
  }, {
    key: 'emit',
    value: function () {
      var _ref7 = _asyncToGenerator(regenerator.mark(function _callee7(ev, data) {
        return regenerator.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.connections();
              case 2:
                this.connection.client.emit(ev, data);
              case 3:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));
      function emit(_x8, _x9) {
        return _ref7.apply(this, arguments);
      }
      return emit;
    }()
  }, {
    key: 'query',
    value: function () {
      var _ref8 = _asyncToGenerator(regenerator.mark(function _callee8(verb, _query) {
        return regenerator.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return this.connections();
              case 2:
                return _context8.abrupt('return', this.connection.request(verb, _query));
              case 3:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));
      function query(_x10, _x11) {
        return _ref8.apply(this, arguments);
      }
      return query;
    }()
  }, {
    key: 'get',
    value: function get(query) {
      return this.query('GET', query);
    }
  }, {
    key: 'post',
    value: function post(url, body) {
      var query = {
        url: url,
        body: body
      };
      return this.query('POST', query);
    }
  }, {
    key: 'put',
    value: function put(url, body) {
      var query = {
        url: url,
        body: body
      };
      return this.query('PUT', query);
    }
  }, {
    key: 'patch',
    value: function patch(url, body) {
      var query = {
        url: url,
        body: body
      };
      return this.query('PATCH', query);
    }
  }, {
    key: 'delete',
    value: function _delete(url, body) {
      var query = {
        url: url,
        body: body
      };
      return this.query('DELETE', query);
    }
  }, {
    key: 'login',
    value: function () {
      var _ref9 = _asyncToGenerator(regenerator.mark(function _callee9(user, secret) {
        return regenerator.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.next = 2;
                return this.connections();
              case 2:
                this.connection.auth.options.user_key = user;
                this.connection.auth.options.user_secret = secret;
                return _context9.abrupt('return', this.connection.reload(false));
              case 5:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));
      function login(_x12, _x13) {
        return _ref9.apply(this, arguments);
      }
      return login;
    }()
  }, {
    key: 'setRefreshToken',
    value: function () {
      var _ref10 = _asyncToGenerator(regenerator.mark(function _callee10(token) {
        return regenerator.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return this.connections();
              case 2:
                this.connection.auth.refresh_token = token;
              case 3:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));
      function setRefreshToken(_x14) {
        return _ref10.apply(this, arguments);
      }
      return setRefreshToken;
    }()
  }, {
    key: 'getRefreshToken',
    value: function () {
      var _ref11 = _asyncToGenerator(regenerator.mark(function _callee11() {
        return regenerator.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _context11.next = 2;
                return this.connections();
              case 2:
                return _context11.abrupt('return', this.connection.auth.refresh_token);
              case 3:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));
      function getRefreshToken() {
        return _ref11.apply(this, arguments);
      }
      return getRefreshToken;
    }()
  }, {
    key: 'setAccessToken',
    value: function () {
      var _ref12 = _asyncToGenerator(regenerator.mark(function _callee12(token) {
        return regenerator.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                _context12.next = 2;
                return this.connections();
              case 2:
                this.connection.auth.access_token = token;
                return _context12.abrupt('return', this.connection.reload());
              case 4:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));
      function setAccessToken(_x15) {
        return _ref12.apply(this, arguments);
      }
      return setAccessToken;
    }()
  }, {
    key: 'getAccessToken',
    value: function () {
      var _ref13 = _asyncToGenerator(regenerator.mark(function _callee13() {
        return regenerator.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                _context13.next = 2;
                return this.connections();
              case 2:
                return _context13.abrupt('return', this.connection.auth.access_token);
              case 3:
              case 'end':
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));
      function getAccessToken() {
        return _ref13.apply(this, arguments);
      }
      return getAccessToken;
    }()
  }]);
  return Client;
}();

module.exports = Client;
//# sourceMappingURL=index.js.map
