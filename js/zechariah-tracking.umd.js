(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ZechariahTracking = {}));
})(this, (function (exports) { 'use strict';

  /**
   * Create a bound version of a function with a specified `this` context
   *
   * @param {Function} fn - The function to bind
   * @param {*} thisArg - The value to be passed as the `this` parameter
   * @returns {Function} A new function that will call the original function with the specified `this` context
   */
  function bind$1(fn, thisArg) {
    return function wrap() {
      return fn.apply(thisArg, arguments);
    };
  }

  // utils is a library of generic helper functions non-specific to axios

  const {toString} = Object.prototype;
  const {getPrototypeOf} = Object;
  const {iterator, toStringTag} = Symbol;

  const kindOf = (cache => thing => {
      const str = toString.call(thing);
      return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
  })(Object.create(null));

  const kindOfTest = (type) => {
    type = type.toLowerCase();
    return (thing) => kindOf(thing) === type
  };

  const typeOfTest = type => thing => typeof thing === type;

  /**
   * Determine if a value is an Array
   *
   * @param {Object} val The value to test
   *
   * @returns {boolean} True if value is an Array, otherwise false
   */
  const {isArray} = Array;

  /**
   * Determine if a value is undefined
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if the value is undefined, otherwise false
   */
  const isUndefined = typeOfTest('undefined');

  /**
   * Determine if a value is a Buffer
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Buffer, otherwise false
   */
  function isBuffer(val) {
    return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
      && isFunction$1(val.constructor.isBuffer) && val.constructor.isBuffer(val);
  }

  /**
   * Determine if a value is an ArrayBuffer
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is an ArrayBuffer, otherwise false
   */
  const isArrayBuffer = kindOfTest('ArrayBuffer');


  /**
   * Determine if a value is a view on an ArrayBuffer
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
   */
  function isArrayBufferView(val) {
    let result;
    if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
      result = ArrayBuffer.isView(val);
    } else {
      result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
    }
    return result;
  }

  /**
   * Determine if a value is a String
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a String, otherwise false
   */
  const isString = typeOfTest('string');

  /**
   * Determine if a value is a Function
   *
   * @param {*} val The value to test
   * @returns {boolean} True if value is a Function, otherwise false
   */
  const isFunction$1 = typeOfTest('function');

  /**
   * Determine if a value is a Number
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Number, otherwise false
   */
  const isNumber = typeOfTest('number');

  /**
   * Determine if a value is an Object
   *
   * @param {*} thing The value to test
   *
   * @returns {boolean} True if value is an Object, otherwise false
   */
  const isObject = (thing) => thing !== null && typeof thing === 'object';

  /**
   * Determine if a value is a Boolean
   *
   * @param {*} thing The value to test
   * @returns {boolean} True if value is a Boolean, otherwise false
   */
  const isBoolean = thing => thing === true || thing === false;

  /**
   * Determine if a value is a plain Object
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a plain Object, otherwise false
   */
  const isPlainObject = (val) => {
    if (kindOf(val) !== 'object') {
      return false;
    }

    const prototype = getPrototypeOf(val);
    return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(toStringTag in val) && !(iterator in val);
  };

  /**
   * Determine if a value is an empty object (safely handles Buffers)
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is an empty object, otherwise false
   */
  const isEmptyObject = (val) => {
    // Early return for non-objects or Buffers to prevent RangeError
    if (!isObject(val) || isBuffer(val)) {
      return false;
    }

    try {
      return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
    } catch (e) {
      // Fallback for any other objects that might cause RangeError with Object.keys()
      return false;
    }
  };

  /**
   * Determine if a value is a Date
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Date, otherwise false
   */
  const isDate = kindOfTest('Date');

  /**
   * Determine if a value is a File
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a File, otherwise false
   */
  const isFile = kindOfTest('File');

  /**
   * Determine if a value is a Blob
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Blob, otherwise false
   */
  const isBlob = kindOfTest('Blob');

  /**
   * Determine if a value is a FileList
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a File, otherwise false
   */
  const isFileList = kindOfTest('FileList');

  /**
   * Determine if a value is a Stream
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Stream, otherwise false
   */
  const isStream = (val) => isObject(val) && isFunction$1(val.pipe);

  /**
   * Determine if a value is a FormData
   *
   * @param {*} thing The value to test
   *
   * @returns {boolean} True if value is an FormData, otherwise false
   */
  const isFormData = (thing) => {
    let kind;
    return thing && (
      (typeof FormData === 'function' && thing instanceof FormData) || (
        isFunction$1(thing.append) && (
          (kind = kindOf(thing)) === 'formdata' ||
          // detect form-data instance
          (kind === 'object' && isFunction$1(thing.toString) && thing.toString() === '[object FormData]')
        )
      )
    )
  };

  /**
   * Determine if a value is a URLSearchParams object
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a URLSearchParams object, otherwise false
   */
  const isURLSearchParams = kindOfTest('URLSearchParams');

  const [isReadableStream, isRequest, isResponse, isHeaders] = ['ReadableStream', 'Request', 'Response', 'Headers'].map(kindOfTest);

  /**
   * Trim excess whitespace off the beginning and end of a string
   *
   * @param {String} str The String to trim
   *
   * @returns {String} The String freed of excess whitespace
   */
  const trim = (str) => str.trim ?
    str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');

  /**
   * Iterate over an Array or an Object invoking a function for each item.
   *
   * If `obj` is an Array callback will be called passing
   * the value, index, and complete array for each item.
   *
   * If 'obj' is an Object callback will be called passing
   * the value, key, and complete object for each property.
   *
   * @param {Object|Array} obj The object to iterate
   * @param {Function} fn The callback to invoke for each item
   *
   * @param {Boolean} [allOwnKeys = false]
   * @returns {any}
   */
  function forEach(obj, fn, {allOwnKeys = false} = {}) {
    // Don't bother if no value provided
    if (obj === null || typeof obj === 'undefined') {
      return;
    }

    let i;
    let l;

    // Force an array if not already something iterable
    if (typeof obj !== 'object') {
      /*eslint no-param-reassign:0*/
      obj = [obj];
    }

    if (isArray(obj)) {
      // Iterate over array values
      for (i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      // Buffer check
      if (isBuffer(obj)) {
        return;
      }

      // Iterate over object keys
      const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
      const len = keys.length;
      let key;

      for (i = 0; i < len; i++) {
        key = keys[i];
        fn.call(null, obj[key], key, obj);
      }
    }
  }

  function findKey(obj, key) {
    if (isBuffer(obj)){
      return null;
    }

    key = key.toLowerCase();
    const keys = Object.keys(obj);
    let i = keys.length;
    let _key;
    while (i-- > 0) {
      _key = keys[i];
      if (key === _key.toLowerCase()) {
        return _key;
      }
    }
    return null;
  }

  const _global = (() => {
    /*eslint no-undef:0*/
    if (typeof globalThis !== "undefined") return globalThis;
    return typeof self !== "undefined" ? self : (typeof window !== 'undefined' ? window : global)
  })();

  const isContextDefined = (context) => !isUndefined(context) && context !== _global;

  /**
   * Accepts varargs expecting each argument to be an object, then
   * immutably merges the properties of each object and returns result.
   *
   * When multiple objects contain the same key the later object in
   * the arguments list will take precedence.
   *
   * Example:
   *
   * ```js
   * var result = merge({foo: 123}, {foo: 456});
   * console.log(result.foo); // outputs 456
   * ```
   *
   * @param {Object} obj1 Object to merge
   *
   * @returns {Object} Result of all merge properties
   */
  function merge(/* obj1, obj2, obj3, ... */) {
    const {caseless, skipUndefined} = isContextDefined(this) && this || {};
    const result = {};
    const assignValue = (val, key) => {
      const targetKey = caseless && findKey(result, key) || key;
      if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
        result[targetKey] = merge(result[targetKey], val);
      } else if (isPlainObject(val)) {
        result[targetKey] = merge({}, val);
      } else if (isArray(val)) {
        result[targetKey] = val.slice();
      } else if (!skipUndefined || !isUndefined(val)) {
        result[targetKey] = val;
      }
    };

    for (let i = 0, l = arguments.length; i < l; i++) {
      arguments[i] && forEach(arguments[i], assignValue);
    }
    return result;
  }

  /**
   * Extends object a by mutably adding to it the properties of object b.
   *
   * @param {Object} a The object to be extended
   * @param {Object} b The object to copy properties from
   * @param {Object} thisArg The object to bind function to
   *
   * @param {Boolean} [allOwnKeys]
   * @returns {Object} The resulting value of object a
   */
  const extend = (a, b, thisArg, {allOwnKeys}= {}) => {
    forEach(b, (val, key) => {
      if (thisArg && isFunction$1(val)) {
        a[key] = bind$1(val, thisArg);
      } else {
        a[key] = val;
      }
    }, {allOwnKeys});
    return a;
  };

  /**
   * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
   *
   * @param {string} content with BOM
   *
   * @returns {string} content value without BOM
   */
  const stripBOM = (content) => {
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    return content;
  };

  /**
   * Inherit the prototype methods from one constructor into another
   * @param {function} constructor
   * @param {function} superConstructor
   * @param {object} [props]
   * @param {object} [descriptors]
   *
   * @returns {void}
   */
  const inherits = (constructor, superConstructor, props, descriptors) => {
    constructor.prototype = Object.create(superConstructor.prototype, descriptors);
    constructor.prototype.constructor = constructor;
    Object.defineProperty(constructor, 'super', {
      value: superConstructor.prototype
    });
    props && Object.assign(constructor.prototype, props);
  };

  /**
   * Resolve object with deep prototype chain to a flat object
   * @param {Object} sourceObj source object
   * @param {Object} [destObj]
   * @param {Function|Boolean} [filter]
   * @param {Function} [propFilter]
   *
   * @returns {Object}
   */
  const toFlatObject = (sourceObj, destObj, filter, propFilter) => {
    let props;
    let i;
    let prop;
    const merged = {};

    destObj = destObj || {};
    // eslint-disable-next-line no-eq-null,eqeqeq
    if (sourceObj == null) return destObj;

    do {
      props = Object.getOwnPropertyNames(sourceObj);
      i = props.length;
      while (i-- > 0) {
        prop = props[i];
        if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
          destObj[prop] = sourceObj[prop];
          merged[prop] = true;
        }
      }
      sourceObj = filter !== false && getPrototypeOf(sourceObj);
    } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

    return destObj;
  };

  /**
   * Determines whether a string ends with the characters of a specified string
   *
   * @param {String} str
   * @param {String} searchString
   * @param {Number} [position= 0]
   *
   * @returns {boolean}
   */
  const endsWith = (str, searchString, position) => {
    str = String(str);
    if (position === undefined || position > str.length) {
      position = str.length;
    }
    position -= searchString.length;
    const lastIndex = str.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
  };


  /**
   * Returns new array from array like object or null if failed
   *
   * @param {*} [thing]
   *
   * @returns {?Array}
   */
  const toArray = (thing) => {
    if (!thing) return null;
    if (isArray(thing)) return thing;
    let i = thing.length;
    if (!isNumber(i)) return null;
    const arr = new Array(i);
    while (i-- > 0) {
      arr[i] = thing[i];
    }
    return arr;
  };

  /**
   * Checking if the Uint8Array exists and if it does, it returns a function that checks if the
   * thing passed in is an instance of Uint8Array
   *
   * @param {TypedArray}
   *
   * @returns {Array}
   */
  // eslint-disable-next-line func-names
  const isTypedArray = (TypedArray => {
    // eslint-disable-next-line func-names
    return thing => {
      return TypedArray && thing instanceof TypedArray;
    };
  })(typeof Uint8Array !== 'undefined' && getPrototypeOf(Uint8Array));

  /**
   * For each entry in the object, call the function with the key and value.
   *
   * @param {Object<any, any>} obj - The object to iterate over.
   * @param {Function} fn - The function to call for each entry.
   *
   * @returns {void}
   */
  const forEachEntry = (obj, fn) => {
    const generator = obj && obj[iterator];

    const _iterator = generator.call(obj);

    let result;

    while ((result = _iterator.next()) && !result.done) {
      const pair = result.value;
      fn.call(obj, pair[0], pair[1]);
    }
  };

  /**
   * It takes a regular expression and a string, and returns an array of all the matches
   *
   * @param {string} regExp - The regular expression to match against.
   * @param {string} str - The string to search.
   *
   * @returns {Array<boolean>}
   */
  const matchAll = (regExp, str) => {
    let matches;
    const arr = [];

    while ((matches = regExp.exec(str)) !== null) {
      arr.push(matches);
    }

    return arr;
  };

  /* Checking if the kindOfTest function returns true when passed an HTMLFormElement. */
  const isHTMLForm = kindOfTest('HTMLFormElement');

  const toCamelCase = str => {
    return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g,
      function replacer(m, p1, p2) {
        return p1.toUpperCase() + p2;
      }
    );
  };

  /* Creating a function that will check if an object has a property. */
  const hasOwnProperty = (({hasOwnProperty}) => (obj, prop) => hasOwnProperty.call(obj, prop))(Object.prototype);

  /**
   * Determine if a value is a RegExp object
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a RegExp object, otherwise false
   */
  const isRegExp = kindOfTest('RegExp');

  const reduceDescriptors = (obj, reducer) => {
    const descriptors = Object.getOwnPropertyDescriptors(obj);
    const reducedDescriptors = {};

    forEach(descriptors, (descriptor, name) => {
      let ret;
      if ((ret = reducer(descriptor, name, obj)) !== false) {
        reducedDescriptors[name] = ret || descriptor;
      }
    });

    Object.defineProperties(obj, reducedDescriptors);
  };

  /**
   * Makes all methods read-only
   * @param {Object} obj
   */

  const freezeMethods = (obj) => {
    reduceDescriptors(obj, (descriptor, name) => {
      // skip restricted props in strict mode
      if (isFunction$1(obj) && ['arguments', 'caller', 'callee'].indexOf(name) !== -1) {
        return false;
      }

      const value = obj[name];

      if (!isFunction$1(value)) return;

      descriptor.enumerable = false;

      if ('writable' in descriptor) {
        descriptor.writable = false;
        return;
      }

      if (!descriptor.set) {
        descriptor.set = () => {
          throw Error('Can not rewrite read-only method \'' + name + '\'');
        };
      }
    });
  };

  const toObjectSet = (arrayOrString, delimiter) => {
    const obj = {};

    const define = (arr) => {
      arr.forEach(value => {
        obj[value] = true;
      });
    };

    isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));

    return obj;
  };

  const noop = () => {};

  const toFiniteNumber = (value, defaultValue) => {
    return value != null && Number.isFinite(value = +value) ? value : defaultValue;
  };



  /**
   * If the thing is a FormData object, return true, otherwise return false.
   *
   * @param {unknown} thing - The thing to check.
   *
   * @returns {boolean}
   */
  function isSpecCompliantForm(thing) {
    return !!(thing && isFunction$1(thing.append) && thing[toStringTag] === 'FormData' && thing[iterator]);
  }

  const toJSONObject = (obj) => {
    const stack = new Array(10);

    const visit = (source, i) => {

      if (isObject(source)) {
        if (stack.indexOf(source) >= 0) {
          return;
        }

        //Buffer check
        if (isBuffer(source)) {
          return source;
        }

        if(!('toJSON' in source)) {
          stack[i] = source;
          const target = isArray(source) ? [] : {};

          forEach(source, (value, key) => {
            const reducedValue = visit(value, i + 1);
            !isUndefined(reducedValue) && (target[key] = reducedValue);
          });

          stack[i] = undefined;

          return target;
        }
      }

      return source;
    };

    return visit(obj, 0);
  };

  const isAsyncFn = kindOfTest('AsyncFunction');

  const isThenable = (thing) =>
    thing && (isObject(thing) || isFunction$1(thing)) && isFunction$1(thing.then) && isFunction$1(thing.catch);

  // original code
  // https://github.com/DigitalBrainJS/AxiosPromise/blob/16deab13710ec09779922131f3fa5954320f83ab/lib/utils.js#L11-L34

  const _setImmediate = ((setImmediateSupported, postMessageSupported) => {
    if (setImmediateSupported) {
      return setImmediate;
    }

    return postMessageSupported ? ((token, callbacks) => {
      _global.addEventListener("message", ({source, data}) => {
        if (source === _global && data === token) {
          callbacks.length && callbacks.shift()();
        }
      }, false);

      return (cb) => {
        callbacks.push(cb);
        _global.postMessage(token, "*");
      }
    })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
  })(
    typeof setImmediate === 'function',
    isFunction$1(_global.postMessage)
  );

  const asap = typeof queueMicrotask !== 'undefined' ?
    queueMicrotask.bind(_global) : ( typeof process !== 'undefined' && process.nextTick || _setImmediate);

  // *********************


  const isIterable = (thing) => thing != null && isFunction$1(thing[iterator]);


  var utils$1 = {
    isArray,
    isArrayBuffer,
    isBuffer,
    isFormData,
    isArrayBufferView,
    isString,
    isNumber,
    isBoolean,
    isObject,
    isPlainObject,
    isEmptyObject,
    isReadableStream,
    isRequest,
    isResponse,
    isHeaders,
    isUndefined,
    isDate,
    isFile,
    isBlob,
    isRegExp,
    isFunction: isFunction$1,
    isStream,
    isURLSearchParams,
    isTypedArray,
    isFileList,
    forEach,
    merge,
    extend,
    trim,
    stripBOM,
    inherits,
    toFlatObject,
    kindOf,
    kindOfTest,
    endsWith,
    toArray,
    forEachEntry,
    matchAll,
    isHTMLForm,
    hasOwnProperty,
    hasOwnProp: hasOwnProperty, // an alias to avoid ESLint no-prototype-builtins detection
    reduceDescriptors,
    freezeMethods,
    toObjectSet,
    toCamelCase,
    noop,
    toFiniteNumber,
    findKey,
    global: _global,
    isContextDefined,
    isSpecCompliantForm,
    toJSONObject,
    isAsyncFn,
    isThenable,
    setImmediate: _setImmediate,
    asap,
    isIterable
  };

  /**
   * Create an Error with the specified message, config, error code, request and response.
   *
   * @param {string} message The error message.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [config] The config.
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   *
   * @returns {Error} The created error.
   */
  function AxiosError$1(message, code, config, request, response) {
    Error.call(this);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error()).stack;
    }

    this.message = message;
    this.name = 'AxiosError';
    code && (this.code = code);
    config && (this.config = config);
    request && (this.request = request);
    if (response) {
      this.response = response;
      this.status = response.status ? response.status : null;
    }
  }

  utils$1.inherits(AxiosError$1, Error, {
    toJSON: function toJSON() {
      return {
        // Standard
        message: this.message,
        name: this.name,
        // Microsoft
        description: this.description,
        number: this.number,
        // Mozilla
        fileName: this.fileName,
        lineNumber: this.lineNumber,
        columnNumber: this.columnNumber,
        stack: this.stack,
        // Axios
        config: utils$1.toJSONObject(this.config),
        code: this.code,
        status: this.status
      };
    }
  });

  const prototype$1 = AxiosError$1.prototype;
  const descriptors = {};

  [
    'ERR_BAD_OPTION_VALUE',
    'ERR_BAD_OPTION',
    'ECONNABORTED',
    'ETIMEDOUT',
    'ERR_NETWORK',
    'ERR_FR_TOO_MANY_REDIRECTS',
    'ERR_DEPRECATED',
    'ERR_BAD_RESPONSE',
    'ERR_BAD_REQUEST',
    'ERR_CANCELED',
    'ERR_NOT_SUPPORT',
    'ERR_INVALID_URL'
  // eslint-disable-next-line func-names
  ].forEach(code => {
    descriptors[code] = {value: code};
  });

  Object.defineProperties(AxiosError$1, descriptors);
  Object.defineProperty(prototype$1, 'isAxiosError', {value: true});

  // eslint-disable-next-line func-names
  AxiosError$1.from = (error, code, config, request, response, customProps) => {
    const axiosError = Object.create(prototype$1);

    utils$1.toFlatObject(error, axiosError, function filter(obj) {
      return obj !== Error.prototype;
    }, prop => {
      return prop !== 'isAxiosError';
    });

    const msg = error && error.message ? error.message : 'Error';

    // Prefer explicit code; otherwise copy the low-level error's code (e.g. ECONNREFUSED)
    const errCode = code == null && error ? error.code : code;
    AxiosError$1.call(axiosError, msg, errCode, config, request, response);

    // Chain the original error on the standard field; non-enumerable to avoid JSON noise
    if (error && axiosError.cause == null) {
      Object.defineProperty(axiosError, 'cause', { value: error, configurable: true });
    }

    axiosError.name = (error && error.name) || 'Error';

    customProps && Object.assign(axiosError, customProps);

    return axiosError;
  };

  // eslint-disable-next-line strict
  var httpAdapter = null;

  /**
   * Determines if the given thing is a array or js object.
   *
   * @param {string} thing - The object or array to be visited.
   *
   * @returns {boolean}
   */
  function isVisitable(thing) {
    return utils$1.isPlainObject(thing) || utils$1.isArray(thing);
  }

  /**
   * It removes the brackets from the end of a string
   *
   * @param {string} key - The key of the parameter.
   *
   * @returns {string} the key without the brackets.
   */
  function removeBrackets(key) {
    return utils$1.endsWith(key, '[]') ? key.slice(0, -2) : key;
  }

  /**
   * It takes a path, a key, and a boolean, and returns a string
   *
   * @param {string} path - The path to the current key.
   * @param {string} key - The key of the current object being iterated over.
   * @param {string} dots - If true, the key will be rendered with dots instead of brackets.
   *
   * @returns {string} The path to the current key.
   */
  function renderKey(path, key, dots) {
    if (!path) return key;
    return path.concat(key).map(function each(token, i) {
      // eslint-disable-next-line no-param-reassign
      token = removeBrackets(token);
      return !dots && i ? '[' + token + ']' : token;
    }).join(dots ? '.' : '');
  }

  /**
   * If the array is an array and none of its elements are visitable, then it's a flat array.
   *
   * @param {Array<any>} arr - The array to check
   *
   * @returns {boolean}
   */
  function isFlatArray(arr) {
    return utils$1.isArray(arr) && !arr.some(isVisitable);
  }

  const predicates = utils$1.toFlatObject(utils$1, {}, null, function filter(prop) {
    return /^is[A-Z]/.test(prop);
  });

  /**
   * Convert a data object to FormData
   *
   * @param {Object} obj
   * @param {?Object} [formData]
   * @param {?Object} [options]
   * @param {Function} [options.visitor]
   * @param {Boolean} [options.metaTokens = true]
   * @param {Boolean} [options.dots = false]
   * @param {?Boolean} [options.indexes = false]
   *
   * @returns {Object}
   **/

  /**
   * It converts an object into a FormData object
   *
   * @param {Object<any, any>} obj - The object to convert to form data.
   * @param {string} formData - The FormData object to append to.
   * @param {Object<string, any>} options
   *
   * @returns
   */
  function toFormData$1(obj, formData, options) {
    if (!utils$1.isObject(obj)) {
      throw new TypeError('target must be an object');
    }

    // eslint-disable-next-line no-param-reassign
    formData = formData || new (FormData)();

    // eslint-disable-next-line no-param-reassign
    options = utils$1.toFlatObject(options, {
      metaTokens: true,
      dots: false,
      indexes: false
    }, false, function defined(option, source) {
      // eslint-disable-next-line no-eq-null,eqeqeq
      return !utils$1.isUndefined(source[option]);
    });

    const metaTokens = options.metaTokens;
    // eslint-disable-next-line no-use-before-define
    const visitor = options.visitor || defaultVisitor;
    const dots = options.dots;
    const indexes = options.indexes;
    const _Blob = options.Blob || typeof Blob !== 'undefined' && Blob;
    const useBlob = _Blob && utils$1.isSpecCompliantForm(formData);

    if (!utils$1.isFunction(visitor)) {
      throw new TypeError('visitor must be a function');
    }

    function convertValue(value) {
      if (value === null) return '';

      if (utils$1.isDate(value)) {
        return value.toISOString();
      }

      if (utils$1.isBoolean(value)) {
        return value.toString();
      }

      if (!useBlob && utils$1.isBlob(value)) {
        throw new AxiosError$1('Blob is not supported. Use a Buffer instead.');
      }

      if (utils$1.isArrayBuffer(value) || utils$1.isTypedArray(value)) {
        return useBlob && typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
      }

      return value;
    }

    /**
     * Default visitor.
     *
     * @param {*} value
     * @param {String|Number} key
     * @param {Array<String|Number>} path
     * @this {FormData}
     *
     * @returns {boolean} return true to visit the each prop of the value recursively
     */
    function defaultVisitor(value, key, path) {
      let arr = value;

      if (value && !path && typeof value === 'object') {
        if (utils$1.endsWith(key, '{}')) {
          // eslint-disable-next-line no-param-reassign
          key = metaTokens ? key : key.slice(0, -2);
          // eslint-disable-next-line no-param-reassign
          value = JSON.stringify(value);
        } else if (
          (utils$1.isArray(value) && isFlatArray(value)) ||
          ((utils$1.isFileList(value) || utils$1.endsWith(key, '[]')) && (arr = utils$1.toArray(value))
          )) {
          // eslint-disable-next-line no-param-reassign
          key = removeBrackets(key);

          arr.forEach(function each(el, index) {
            !(utils$1.isUndefined(el) || el === null) && formData.append(
              // eslint-disable-next-line no-nested-ternary
              indexes === true ? renderKey([key], index, dots) : (indexes === null ? key : key + '[]'),
              convertValue(el)
            );
          });
          return false;
        }
      }

      if (isVisitable(value)) {
        return true;
      }

      formData.append(renderKey(path, key, dots), convertValue(value));

      return false;
    }

    const stack = [];

    const exposedHelpers = Object.assign(predicates, {
      defaultVisitor,
      convertValue,
      isVisitable
    });

    function build(value, path) {
      if (utils$1.isUndefined(value)) return;

      if (stack.indexOf(value) !== -1) {
        throw Error('Circular reference detected in ' + path.join('.'));
      }

      stack.push(value);

      utils$1.forEach(value, function each(el, key) {
        const result = !(utils$1.isUndefined(el) || el === null) && visitor.call(
          formData, el, utils$1.isString(key) ? key.trim() : key, path, exposedHelpers
        );

        if (result === true) {
          build(el, path ? path.concat(key) : [key]);
        }
      });

      stack.pop();
    }

    if (!utils$1.isObject(obj)) {
      throw new TypeError('data must be an object');
    }

    build(obj);

    return formData;
  }

  /**
   * It encodes a string by replacing all characters that are not in the unreserved set with
   * their percent-encoded equivalents
   *
   * @param {string} str - The string to encode.
   *
   * @returns {string} The encoded string.
   */
  function encode$1(str) {
    const charMap = {
      '!': '%21',
      "'": '%27',
      '(': '%28',
      ')': '%29',
      '~': '%7E',
      '%20': '+',
      '%00': '\x00'
    };
    return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
      return charMap[match];
    });
  }

  /**
   * It takes a params object and converts it to a FormData object
   *
   * @param {Object<string, any>} params - The parameters to be converted to a FormData object.
   * @param {Object<string, any>} options - The options object passed to the Axios constructor.
   *
   * @returns {void}
   */
  function AxiosURLSearchParams(params, options) {
    this._pairs = [];

    params && toFormData$1(params, this, options);
  }

  const prototype = AxiosURLSearchParams.prototype;

  prototype.append = function append(name, value) {
    this._pairs.push([name, value]);
  };

  prototype.toString = function toString(encoder) {
    const _encode = encoder ? function(value) {
      return encoder.call(this, value, encode$1);
    } : encode$1;

    return this._pairs.map(function each(pair) {
      return _encode(pair[0]) + '=' + _encode(pair[1]);
    }, '').join('&');
  };

  /**
   * It replaces all instances of the characters `:`, `$`, `,`, `+`, `[`, and `]` with their
   * URI encoded counterparts
   *
   * @param {string} val The value to be encoded.
   *
   * @returns {string} The encoded value.
   */
  function encode(val) {
    return encodeURIComponent(val).
      replace(/%3A/gi, ':').
      replace(/%24/g, '$').
      replace(/%2C/gi, ',').
      replace(/%20/g, '+');
  }

  /**
   * Build a URL by appending params to the end
   *
   * @param {string} url The base of the url (e.g., http://www.google.com)
   * @param {object} [params] The params to be appended
   * @param {?(object|Function)} options
   *
   * @returns {string} The formatted url
   */
  function buildURL(url, params, options) {
    /*eslint no-param-reassign:0*/
    if (!params) {
      return url;
    }
    
    const _encode = options && options.encode || encode;

    if (utils$1.isFunction(options)) {
      options = {
        serialize: options
      };
    } 

    const serializeFn = options && options.serialize;

    let serializedParams;

    if (serializeFn) {
      serializedParams = serializeFn(params, options);
    } else {
      serializedParams = utils$1.isURLSearchParams(params) ?
        params.toString() :
        new AxiosURLSearchParams(params, options).toString(_encode);
    }

    if (serializedParams) {
      const hashmarkIndex = url.indexOf("#");

      if (hashmarkIndex !== -1) {
        url = url.slice(0, hashmarkIndex);
      }
      url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }

    return url;
  }

  class InterceptorManager {
    constructor() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    use(fulfilled, rejected, options) {
      this.handlers.push({
        fulfilled,
        rejected,
        synchronous: options ? options.synchronous : false,
        runWhen: options ? options.runWhen : null
      });
      return this.handlers.length - 1;
    }

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     *
     * @returns {void}
     */
    eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    }

    /**
     * Clear all interceptors from the stack
     *
     * @returns {void}
     */
    clear() {
      if (this.handlers) {
        this.handlers = [];
      }
    }

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     *
     * @returns {void}
     */
    forEach(fn) {
      utils$1.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    }
  }

  var transitionalDefaults = {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  };

  var URLSearchParams$1 = typeof URLSearchParams !== 'undefined' ? URLSearchParams : AxiosURLSearchParams;

  var FormData$1 = typeof FormData !== 'undefined' ? FormData : null;

  var Blob$1 = typeof Blob !== 'undefined' ? Blob : null;

  var platform$1 = {
    isBrowser: true,
    classes: {
      URLSearchParams: URLSearchParams$1,
      FormData: FormData$1,
      Blob: Blob$1
    },
    protocols: ['http', 'https', 'file', 'blob', 'url', 'data']
  };

  const hasBrowserEnv = typeof window !== 'undefined' && typeof document !== 'undefined';

  const _navigator = typeof navigator === 'object' && navigator || undefined;

  /**
   * Determine if we're running in a standard browser environment
   *
   * This allows axios to run in a web worker, and react-native.
   * Both environments support XMLHttpRequest, but not fully standard globals.
   *
   * web workers:
   *  typeof window -> undefined
   *  typeof document -> undefined
   *
   * react-native:
   *  navigator.product -> 'ReactNative'
   * nativescript
   *  navigator.product -> 'NativeScript' or 'NS'
   *
   * @returns {boolean}
   */
  const hasStandardBrowserEnv = hasBrowserEnv &&
    (!_navigator || ['ReactNative', 'NativeScript', 'NS'].indexOf(_navigator.product) < 0);

  /**
   * Determine if we're running in a standard browser webWorker environment
   *
   * Although the `isStandardBrowserEnv` method indicates that
   * `allows axios to run in a web worker`, the WebWorker will still be
   * filtered out due to its judgment standard
   * `typeof window !== 'undefined' && typeof document !== 'undefined'`.
   * This leads to a problem when axios post `FormData` in webWorker
   */
  const hasStandardBrowserWebWorkerEnv = (() => {
    return (
      typeof WorkerGlobalScope !== 'undefined' &&
      // eslint-disable-next-line no-undef
      self instanceof WorkerGlobalScope &&
      typeof self.importScripts === 'function'
    );
  })();

  const origin = hasBrowserEnv && window.location.href || 'http://localhost';

  var utils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    hasBrowserEnv: hasBrowserEnv,
    hasStandardBrowserEnv: hasStandardBrowserEnv,
    hasStandardBrowserWebWorkerEnv: hasStandardBrowserWebWorkerEnv,
    navigator: _navigator,
    origin: origin
  });

  var platform = {
    ...utils,
    ...platform$1
  };

  function toURLEncodedForm(data, options) {
    return toFormData$1(data, new platform.classes.URLSearchParams(), {
      visitor: function(value, key, path, helpers) {
        if (platform.isNode && utils$1.isBuffer(value)) {
          this.append(key, value.toString('base64'));
          return false;
        }

        return helpers.defaultVisitor.apply(this, arguments);
      },
      ...options
    });
  }

  /**
   * It takes a string like `foo[x][y][z]` and returns an array like `['foo', 'x', 'y', 'z']
   *
   * @param {string} name - The name of the property to get.
   *
   * @returns An array of strings.
   */
  function parsePropPath(name) {
    // foo[x][y][z]
    // foo.x.y.z
    // foo-x-y-z
    // foo x y z
    return utils$1.matchAll(/\w+|\[(\w*)]/g, name).map(match => {
      return match[0] === '[]' ? '' : match[1] || match[0];
    });
  }

  /**
   * Convert an array to an object.
   *
   * @param {Array<any>} arr - The array to convert to an object.
   *
   * @returns An object with the same keys and values as the array.
   */
  function arrayToObject(arr) {
    const obj = {};
    const keys = Object.keys(arr);
    let i;
    const len = keys.length;
    let key;
    for (i = 0; i < len; i++) {
      key = keys[i];
      obj[key] = arr[key];
    }
    return obj;
  }

  /**
   * It takes a FormData object and returns a JavaScript object
   *
   * @param {string} formData The FormData object to convert to JSON.
   *
   * @returns {Object<string, any> | null} The converted object.
   */
  function formDataToJSON(formData) {
    function buildPath(path, value, target, index) {
      let name = path[index++];

      if (name === '__proto__') return true;

      const isNumericKey = Number.isFinite(+name);
      const isLast = index >= path.length;
      name = !name && utils$1.isArray(target) ? target.length : name;

      if (isLast) {
        if (utils$1.hasOwnProp(target, name)) {
          target[name] = [target[name], value];
        } else {
          target[name] = value;
        }

        return !isNumericKey;
      }

      if (!target[name] || !utils$1.isObject(target[name])) {
        target[name] = [];
      }

      const result = buildPath(path, value, target[name], index);

      if (result && utils$1.isArray(target[name])) {
        target[name] = arrayToObject(target[name]);
      }

      return !isNumericKey;
    }

    if (utils$1.isFormData(formData) && utils$1.isFunction(formData.entries)) {
      const obj = {};

      utils$1.forEachEntry(formData, (name, value) => {
        buildPath(parsePropPath(name), value, obj, 0);
      });

      return obj;
    }

    return null;
  }

  /**
   * It takes a string, tries to parse it, and if it fails, it returns the stringified version
   * of the input
   *
   * @param {any} rawValue - The value to be stringified.
   * @param {Function} parser - A function that parses a string into a JavaScript object.
   * @param {Function} encoder - A function that takes a value and returns a string.
   *
   * @returns {string} A stringified version of the rawValue.
   */
  function stringifySafely(rawValue, parser, encoder) {
    if (utils$1.isString(rawValue)) {
      try {
        (parser || JSON.parse)(rawValue);
        return utils$1.trim(rawValue);
      } catch (e) {
        if (e.name !== 'SyntaxError') {
          throw e;
        }
      }
    }

    return (encoder || JSON.stringify)(rawValue);
  }

  const defaults = {

    transitional: transitionalDefaults,

    adapter: ['xhr', 'http', 'fetch'],

    transformRequest: [function transformRequest(data, headers) {
      const contentType = headers.getContentType() || '';
      const hasJSONContentType = contentType.indexOf('application/json') > -1;
      const isObjectPayload = utils$1.isObject(data);

      if (isObjectPayload && utils$1.isHTMLForm(data)) {
        data = new FormData(data);
      }

      const isFormData = utils$1.isFormData(data);

      if (isFormData) {
        return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
      }

      if (utils$1.isArrayBuffer(data) ||
        utils$1.isBuffer(data) ||
        utils$1.isStream(data) ||
        utils$1.isFile(data) ||
        utils$1.isBlob(data) ||
        utils$1.isReadableStream(data)
      ) {
        return data;
      }
      if (utils$1.isArrayBufferView(data)) {
        return data.buffer;
      }
      if (utils$1.isURLSearchParams(data)) {
        headers.setContentType('application/x-www-form-urlencoded;charset=utf-8', false);
        return data.toString();
      }

      let isFileList;

      if (isObjectPayload) {
        if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
          return toURLEncodedForm(data, this.formSerializer).toString();
        }

        if ((isFileList = utils$1.isFileList(data)) || contentType.indexOf('multipart/form-data') > -1) {
          const _FormData = this.env && this.env.FormData;

          return toFormData$1(
            isFileList ? {'files[]': data} : data,
            _FormData && new _FormData(),
            this.formSerializer
          );
        }
      }

      if (isObjectPayload || hasJSONContentType ) {
        headers.setContentType('application/json', false);
        return stringifySafely(data);
      }

      return data;
    }],

    transformResponse: [function transformResponse(data) {
      const transitional = this.transitional || defaults.transitional;
      const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
      const JSONRequested = this.responseType === 'json';

      if (utils$1.isResponse(data) || utils$1.isReadableStream(data)) {
        return data;
      }

      if (data && utils$1.isString(data) && ((forcedJSONParsing && !this.responseType) || JSONRequested)) {
        const silentJSONParsing = transitional && transitional.silentJSONParsing;
        const strictJSONParsing = !silentJSONParsing && JSONRequested;

        try {
          return JSON.parse(data, this.parseReviver);
        } catch (e) {
          if (strictJSONParsing) {
            if (e.name === 'SyntaxError') {
              throw AxiosError$1.from(e, AxiosError$1.ERR_BAD_RESPONSE, this, null, this.response);
            }
            throw e;
          }
        }
      }

      return data;
    }],

    /**
     * A timeout in milliseconds to abort a request. If set to 0 (default) a
     * timeout is not created.
     */
    timeout: 0,

    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',

    maxContentLength: -1,
    maxBodyLength: -1,

    env: {
      FormData: platform.classes.FormData,
      Blob: platform.classes.Blob
    },

    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    },

    headers: {
      common: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': undefined
      }
    }
  };

  utils$1.forEach(['delete', 'get', 'head', 'post', 'put', 'patch'], (method) => {
    defaults.headers[method] = {};
  });

  // RawAxiosHeaders whose duplicates are ignored by node
  // c.f. https://nodejs.org/api/http.html#http_message_headers
  const ignoreDuplicateOf = utils$1.toObjectSet([
    'age', 'authorization', 'content-length', 'content-type', 'etag',
    'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
    'last-modified', 'location', 'max-forwards', 'proxy-authorization',
    'referer', 'retry-after', 'user-agent'
  ]);

  /**
   * Parse headers into an object
   *
   * ```
   * Date: Wed, 27 Aug 2014 08:58:49 GMT
   * Content-Type: application/json
   * Connection: keep-alive
   * Transfer-Encoding: chunked
   * ```
   *
   * @param {String} rawHeaders Headers needing to be parsed
   *
   * @returns {Object} Headers parsed into an object
   */
  var parseHeaders = rawHeaders => {
    const parsed = {};
    let key;
    let val;
    let i;

    rawHeaders && rawHeaders.split('\n').forEach(function parser(line) {
      i = line.indexOf(':');
      key = line.substring(0, i).trim().toLowerCase();
      val = line.substring(i + 1).trim();

      if (!key || (parsed[key] && ignoreDuplicateOf[key])) {
        return;
      }

      if (key === 'set-cookie') {
        if (parsed[key]) {
          parsed[key].push(val);
        } else {
          parsed[key] = [val];
        }
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    });

    return parsed;
  };

  const $internals = Symbol('internals');

  function normalizeHeader(header) {
    return header && String(header).trim().toLowerCase();
  }

  function normalizeValue(value) {
    if (value === false || value == null) {
      return value;
    }

    return utils$1.isArray(value) ? value.map(normalizeValue) : String(value);
  }

  function parseTokens(str) {
    const tokens = Object.create(null);
    const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
    let match;

    while ((match = tokensRE.exec(str))) {
      tokens[match[1]] = match[2];
    }

    return tokens;
  }

  const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());

  function matchHeaderValue(context, value, header, filter, isHeaderNameFilter) {
    if (utils$1.isFunction(filter)) {
      return filter.call(this, value, header);
    }

    if (isHeaderNameFilter) {
      value = header;
    }

    if (!utils$1.isString(value)) return;

    if (utils$1.isString(filter)) {
      return value.indexOf(filter) !== -1;
    }

    if (utils$1.isRegExp(filter)) {
      return filter.test(value);
    }
  }

  function formatHeader(header) {
    return header.trim()
      .toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
        return char.toUpperCase() + str;
      });
  }

  function buildAccessors(obj, header) {
    const accessorName = utils$1.toCamelCase(' ' + header);

    ['get', 'set', 'has'].forEach(methodName => {
      Object.defineProperty(obj, methodName + accessorName, {
        value: function(arg1, arg2, arg3) {
          return this[methodName].call(this, header, arg1, arg2, arg3);
        },
        configurable: true
      });
    });
  }

  let AxiosHeaders$1 = class AxiosHeaders {
    constructor(headers) {
      headers && this.set(headers);
    }

    set(header, valueOrRewrite, rewrite) {
      const self = this;

      function setHeader(_value, _header, _rewrite) {
        const lHeader = normalizeHeader(_header);

        if (!lHeader) {
          throw new Error('header name must be a non-empty string');
        }

        const key = utils$1.findKey(self, lHeader);

        if(!key || self[key] === undefined || _rewrite === true || (_rewrite === undefined && self[key] !== false)) {
          self[key || _header] = normalizeValue(_value);
        }
      }

      const setHeaders = (headers, _rewrite) =>
        utils$1.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));

      if (utils$1.isPlainObject(header) || header instanceof this.constructor) {
        setHeaders(header, valueOrRewrite);
      } else if(utils$1.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
        setHeaders(parseHeaders(header), valueOrRewrite);
      } else if (utils$1.isObject(header) && utils$1.isIterable(header)) {
        let obj = {}, dest, key;
        for (const entry of header) {
          if (!utils$1.isArray(entry)) {
            throw TypeError('Object iterator must return a key-value pair');
          }

          obj[key = entry[0]] = (dest = obj[key]) ?
            (utils$1.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]]) : entry[1];
        }

        setHeaders(obj, valueOrRewrite);
      } else {
        header != null && setHeader(valueOrRewrite, header, rewrite);
      }

      return this;
    }

    get(header, parser) {
      header = normalizeHeader(header);

      if (header) {
        const key = utils$1.findKey(this, header);

        if (key) {
          const value = this[key];

          if (!parser) {
            return value;
          }

          if (parser === true) {
            return parseTokens(value);
          }

          if (utils$1.isFunction(parser)) {
            return parser.call(this, value, key);
          }

          if (utils$1.isRegExp(parser)) {
            return parser.exec(value);
          }

          throw new TypeError('parser must be boolean|regexp|function');
        }
      }
    }

    has(header, matcher) {
      header = normalizeHeader(header);

      if (header) {
        const key = utils$1.findKey(this, header);

        return !!(key && this[key] !== undefined && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
      }

      return false;
    }

    delete(header, matcher) {
      const self = this;
      let deleted = false;

      function deleteHeader(_header) {
        _header = normalizeHeader(_header);

        if (_header) {
          const key = utils$1.findKey(self, _header);

          if (key && (!matcher || matchHeaderValue(self, self[key], key, matcher))) {
            delete self[key];

            deleted = true;
          }
        }
      }

      if (utils$1.isArray(header)) {
        header.forEach(deleteHeader);
      } else {
        deleteHeader(header);
      }

      return deleted;
    }

    clear(matcher) {
      const keys = Object.keys(this);
      let i = keys.length;
      let deleted = false;

      while (i--) {
        const key = keys[i];
        if(!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
          delete this[key];
          deleted = true;
        }
      }

      return deleted;
    }

    normalize(format) {
      const self = this;
      const headers = {};

      utils$1.forEach(this, (value, header) => {
        const key = utils$1.findKey(headers, header);

        if (key) {
          self[key] = normalizeValue(value);
          delete self[header];
          return;
        }

        const normalized = format ? formatHeader(header) : String(header).trim();

        if (normalized !== header) {
          delete self[header];
        }

        self[normalized] = normalizeValue(value);

        headers[normalized] = true;
      });

      return this;
    }

    concat(...targets) {
      return this.constructor.concat(this, ...targets);
    }

    toJSON(asStrings) {
      const obj = Object.create(null);

      utils$1.forEach(this, (value, header) => {
        value != null && value !== false && (obj[header] = asStrings && utils$1.isArray(value) ? value.join(', ') : value);
      });

      return obj;
    }

    [Symbol.iterator]() {
      return Object.entries(this.toJSON())[Symbol.iterator]();
    }

    toString() {
      return Object.entries(this.toJSON()).map(([header, value]) => header + ': ' + value).join('\n');
    }

    getSetCookie() {
      return this.get("set-cookie") || [];
    }

    get [Symbol.toStringTag]() {
      return 'AxiosHeaders';
    }

    static from(thing) {
      return thing instanceof this ? thing : new this(thing);
    }

    static concat(first, ...targets) {
      const computed = new this(first);

      targets.forEach((target) => computed.set(target));

      return computed;
    }

    static accessor(header) {
      const internals = this[$internals] = (this[$internals] = {
        accessors: {}
      });

      const accessors = internals.accessors;
      const prototype = this.prototype;

      function defineAccessor(_header) {
        const lHeader = normalizeHeader(_header);

        if (!accessors[lHeader]) {
          buildAccessors(prototype, _header);
          accessors[lHeader] = true;
        }
      }

      utils$1.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);

      return this;
    }
  };

  AxiosHeaders$1.accessor(['Content-Type', 'Content-Length', 'Accept', 'Accept-Encoding', 'User-Agent', 'Authorization']);

  // reserved names hotfix
  utils$1.reduceDescriptors(AxiosHeaders$1.prototype, ({value}, key) => {
    let mapped = key[0].toUpperCase() + key.slice(1); // map `set` => `Set`
    return {
      get: () => value,
      set(headerValue) {
        this[mapped] = headerValue;
      }
    }
  });

  utils$1.freezeMethods(AxiosHeaders$1);

  /**
   * Transform the data for a request or a response
   *
   * @param {Array|Function} fns A single function or Array of functions
   * @param {?Object} response The response object
   *
   * @returns {*} The resulting transformed data
   */
  function transformData(fns, response) {
    const config = this || defaults;
    const context = response || config;
    const headers = AxiosHeaders$1.from(context.headers);
    let data = context.data;

    utils$1.forEach(fns, function transform(fn) {
      data = fn.call(config, data, headers.normalize(), response ? response.status : undefined);
    });

    headers.normalize();

    return data;
  }

  function isCancel$1(value) {
    return !!(value && value.__CANCEL__);
  }

  /**
   * A `CanceledError` is an object that is thrown when an operation is canceled.
   *
   * @param {string=} message The message.
   * @param {Object=} config The config.
   * @param {Object=} request The request.
   *
   * @returns {CanceledError} The created error.
   */
  function CanceledError$1(message, config, request) {
    // eslint-disable-next-line no-eq-null,eqeqeq
    AxiosError$1.call(this, message == null ? 'canceled' : message, AxiosError$1.ERR_CANCELED, config, request);
    this.name = 'CanceledError';
  }

  utils$1.inherits(CanceledError$1, AxiosError$1, {
    __CANCEL__: true
  });

  /**
   * Resolve or reject a Promise based on response status.
   *
   * @param {Function} resolve A function that resolves the promise.
   * @param {Function} reject A function that rejects the promise.
   * @param {object} response The response.
   *
   * @returns {object} The response.
   */
  function settle(resolve, reject, response) {
    const validateStatus = response.config.validateStatus;
    if (!response.status || !validateStatus || validateStatus(response.status)) {
      resolve(response);
    } else {
      reject(new AxiosError$1(
        'Request failed with status code ' + response.status,
        [AxiosError$1.ERR_BAD_REQUEST, AxiosError$1.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
        response.config,
        response.request,
        response
      ));
    }
  }

  function parseProtocol(url) {
    const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
    return match && match[1] || '';
  }

  /**
   * Calculate data maxRate
   * @param {Number} [samplesCount= 10]
   * @param {Number} [min= 1000]
   * @returns {Function}
   */
  function speedometer(samplesCount, min) {
    samplesCount = samplesCount || 10;
    const bytes = new Array(samplesCount);
    const timestamps = new Array(samplesCount);
    let head = 0;
    let tail = 0;
    let firstSampleTS;

    min = min !== undefined ? min : 1000;

    return function push(chunkLength) {
      const now = Date.now();

      const startedAt = timestamps[tail];

      if (!firstSampleTS) {
        firstSampleTS = now;
      }

      bytes[head] = chunkLength;
      timestamps[head] = now;

      let i = tail;
      let bytesCount = 0;

      while (i !== head) {
        bytesCount += bytes[i++];
        i = i % samplesCount;
      }

      head = (head + 1) % samplesCount;

      if (head === tail) {
        tail = (tail + 1) % samplesCount;
      }

      if (now - firstSampleTS < min) {
        return;
      }

      const passed = startedAt && now - startedAt;

      return passed ? Math.round(bytesCount * 1000 / passed) : undefined;
    };
  }

  /**
   * Throttle decorator
   * @param {Function} fn
   * @param {Number} freq
   * @return {Function}
   */
  function throttle$1(fn, freq) {
    let timestamp = 0;
    let threshold = 1000 / freq;
    let lastArgs;
    let timer;

    const invoke = (args, now = Date.now()) => {
      timestamp = now;
      lastArgs = null;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      fn(...args);
    };

    const throttled = (...args) => {
      const now = Date.now();
      const passed = now - timestamp;
      if ( passed >= threshold) {
        invoke(args, now);
      } else {
        lastArgs = args;
        if (!timer) {
          timer = setTimeout(() => {
            timer = null;
            invoke(lastArgs);
          }, threshold - passed);
        }
      }
    };

    const flush = () => lastArgs && invoke(lastArgs);

    return [throttled, flush];
  }

  const progressEventReducer = (listener, isDownloadStream, freq = 3) => {
    let bytesNotified = 0;
    const _speedometer = speedometer(50, 250);

    return throttle$1(e => {
      const loaded = e.loaded;
      const total = e.lengthComputable ? e.total : undefined;
      const progressBytes = loaded - bytesNotified;
      const rate = _speedometer(progressBytes);
      const inRange = loaded <= total;

      bytesNotified = loaded;

      const data = {
        loaded,
        total,
        progress: total ? (loaded / total) : undefined,
        bytes: progressBytes,
        rate: rate ? rate : undefined,
        estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
        event: e,
        lengthComputable: total != null,
        [isDownloadStream ? 'download' : 'upload']: true
      };

      listener(data);
    }, freq);
  };

  const progressEventDecorator = (total, throttled) => {
    const lengthComputable = total != null;

    return [(loaded) => throttled[0]({
      lengthComputable,
      total,
      loaded
    }), throttled[1]];
  };

  const asyncDecorator = (fn) => (...args) => utils$1.asap(() => fn(...args));

  var isURLSameOrigin = platform.hasStandardBrowserEnv ? ((origin, isMSIE) => (url) => {
    url = new URL(url, platform.origin);

    return (
      origin.protocol === url.protocol &&
      origin.host === url.host &&
      (isMSIE || origin.port === url.port)
    );
  })(
    new URL(platform.origin),
    platform.navigator && /(msie|trident)/i.test(platform.navigator.userAgent)
  ) : () => true;

  var cookies = platform.hasStandardBrowserEnv ?

    // Standard browser envs support document.cookie
    {
      write(name, value, expires, path, domain, secure, sameSite) {
        if (typeof document === 'undefined') return;

        const cookie = [`${name}=${encodeURIComponent(value)}`];

        if (utils$1.isNumber(expires)) {
          cookie.push(`expires=${new Date(expires).toUTCString()}`);
        }
        if (utils$1.isString(path)) {
          cookie.push(`path=${path}`);
        }
        if (utils$1.isString(domain)) {
          cookie.push(`domain=${domain}`);
        }
        if (secure === true) {
          cookie.push('secure');
        }
        if (utils$1.isString(sameSite)) {
          cookie.push(`SameSite=${sameSite}`);
        }

        document.cookie = cookie.join('; ');
      },

      read(name) {
        if (typeof document === 'undefined') return null;
        const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : null;
      },

      remove(name) {
        this.write(name, '', Date.now() - 86400000, '/');
      }
    }

    :

    // Non-standard browser env (web workers, react-native) lack needed support.
    {
      write() {},
      read() {
        return null;
      },
      remove() {}
    };

  /**
   * Determines whether the specified URL is absolute
   *
   * @param {string} url The URL to test
   *
   * @returns {boolean} True if the specified URL is absolute, otherwise false
   */
  function isAbsoluteURL(url) {
    // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
    // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
    // by any combination of letters, digits, plus, period, or hyphen.
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
  }

  /**
   * Creates a new URL by combining the specified URLs
   *
   * @param {string} baseURL The base URL
   * @param {string} relativeURL The relative URL
   *
   * @returns {string} The combined URL
   */
  function combineURLs(baseURL, relativeURL) {
    return relativeURL
      ? baseURL.replace(/\/?\/$/, '') + '/' + relativeURL.replace(/^\/+/, '')
      : baseURL;
  }

  /**
   * Creates a new URL by combining the baseURL with the requestedURL,
   * only when the requestedURL is not already an absolute URL.
   * If the requestURL is absolute, this function returns the requestedURL untouched.
   *
   * @param {string} baseURL The base URL
   * @param {string} requestedURL Absolute or relative URL to combine
   *
   * @returns {string} The combined full path
   */
  function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
    let isRelativeUrl = !isAbsoluteURL(requestedURL);
    if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
      return combineURLs(baseURL, requestedURL);
    }
    return requestedURL;
  }

  const headersToObject = (thing) => thing instanceof AxiosHeaders$1 ? { ...thing } : thing;

  /**
   * Config-specific merge-function which creates a new config-object
   * by merging two configuration objects together.
   *
   * @param {Object} config1
   * @param {Object} config2
   *
   * @returns {Object} New object resulting from merging config2 to config1
   */
  function mergeConfig$1(config1, config2) {
    // eslint-disable-next-line no-param-reassign
    config2 = config2 || {};
    const config = {};

    function getMergedValue(target, source, prop, caseless) {
      if (utils$1.isPlainObject(target) && utils$1.isPlainObject(source)) {
        return utils$1.merge.call({caseless}, target, source);
      } else if (utils$1.isPlainObject(source)) {
        return utils$1.merge({}, source);
      } else if (utils$1.isArray(source)) {
        return source.slice();
      }
      return source;
    }

    // eslint-disable-next-line consistent-return
    function mergeDeepProperties(a, b, prop, caseless) {
      if (!utils$1.isUndefined(b)) {
        return getMergedValue(a, b, prop, caseless);
      } else if (!utils$1.isUndefined(a)) {
        return getMergedValue(undefined, a, prop, caseless);
      }
    }

    // eslint-disable-next-line consistent-return
    function valueFromConfig2(a, b) {
      if (!utils$1.isUndefined(b)) {
        return getMergedValue(undefined, b);
      }
    }

    // eslint-disable-next-line consistent-return
    function defaultToConfig2(a, b) {
      if (!utils$1.isUndefined(b)) {
        return getMergedValue(undefined, b);
      } else if (!utils$1.isUndefined(a)) {
        return getMergedValue(undefined, a);
      }
    }

    // eslint-disable-next-line consistent-return
    function mergeDirectKeys(a, b, prop) {
      if (prop in config2) {
        return getMergedValue(a, b);
      } else if (prop in config1) {
        return getMergedValue(undefined, a);
      }
    }

    const mergeMap = {
      url: valueFromConfig2,
      method: valueFromConfig2,
      data: valueFromConfig2,
      baseURL: defaultToConfig2,
      transformRequest: defaultToConfig2,
      transformResponse: defaultToConfig2,
      paramsSerializer: defaultToConfig2,
      timeout: defaultToConfig2,
      timeoutMessage: defaultToConfig2,
      withCredentials: defaultToConfig2,
      withXSRFToken: defaultToConfig2,
      adapter: defaultToConfig2,
      responseType: defaultToConfig2,
      xsrfCookieName: defaultToConfig2,
      xsrfHeaderName: defaultToConfig2,
      onUploadProgress: defaultToConfig2,
      onDownloadProgress: defaultToConfig2,
      decompress: defaultToConfig2,
      maxContentLength: defaultToConfig2,
      maxBodyLength: defaultToConfig2,
      beforeRedirect: defaultToConfig2,
      transport: defaultToConfig2,
      httpAgent: defaultToConfig2,
      httpsAgent: defaultToConfig2,
      cancelToken: defaultToConfig2,
      socketPath: defaultToConfig2,
      responseEncoding: defaultToConfig2,
      validateStatus: mergeDirectKeys,
      headers: (a, b, prop) => mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true)
    };

    utils$1.forEach(Object.keys({...config1, ...config2}), function computeConfigValue(prop) {
      const merge = mergeMap[prop] || mergeDeepProperties;
      const configValue = merge(config1[prop], config2[prop], prop);
      (utils$1.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
    });

    return config;
  }

  var resolveConfig = (config) => {
    const newConfig = mergeConfig$1({}, config);

    let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;

    newConfig.headers = headers = AxiosHeaders$1.from(headers);

    newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);

    // HTTP basic authentication
    if (auth) {
      headers.set('Authorization', 'Basic ' +
        btoa((auth.username || '') + ':' + (auth.password ? unescape(encodeURIComponent(auth.password)) : ''))
      );
    }

    if (utils$1.isFormData(data)) {
      if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) {
        headers.setContentType(undefined); // browser handles it
      } else if (utils$1.isFunction(data.getHeaders)) {
        // Node.js FormData (like form-data package)
        const formHeaders = data.getHeaders();
        // Only set safe headers to avoid overwriting security headers
        const allowedHeaders = ['content-type', 'content-length'];
        Object.entries(formHeaders).forEach(([key, val]) => {
          if (allowedHeaders.includes(key.toLowerCase())) {
            headers.set(key, val);
          }
        });
      }
    }  

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.

    if (platform.hasStandardBrowserEnv) {
      withXSRFToken && utils$1.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));

      if (withXSRFToken || (withXSRFToken !== false && isURLSameOrigin(newConfig.url))) {
        // Add xsrf header
        const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies.read(xsrfCookieName);

        if (xsrfValue) {
          headers.set(xsrfHeaderName, xsrfValue);
        }
      }
    }

    return newConfig;
  };

  const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';

  var xhrAdapter = isXHRAdapterSupported && function (config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
      const _config = resolveConfig(config);
      let requestData = _config.data;
      const requestHeaders = AxiosHeaders$1.from(_config.headers).normalize();
      let {responseType, onUploadProgress, onDownloadProgress} = _config;
      let onCanceled;
      let uploadThrottled, downloadThrottled;
      let flushUpload, flushDownload;

      function done() {
        flushUpload && flushUpload(); // flush events
        flushDownload && flushDownload(); // flush events

        _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);

        _config.signal && _config.signal.removeEventListener('abort', onCanceled);
      }

      let request = new XMLHttpRequest();

      request.open(_config.method.toUpperCase(), _config.url, true);

      // Set the request timeout in MS
      request.timeout = _config.timeout;

      function onloadend() {
        if (!request) {
          return;
        }
        // Prepare the response
        const responseHeaders = AxiosHeaders$1.from(
          'getAllResponseHeaders' in request && request.getAllResponseHeaders()
        );
        const responseData = !responseType || responseType === 'text' || responseType === 'json' ?
          request.responseText : request.response;
        const response = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config,
          request
        };

        settle(function _resolve(value) {
          resolve(value);
          done();
        }, function _reject(err) {
          reject(err);
          done();
        }, response);

        // Clean up request
        request = null;
      }

      if ('onloadend' in request) {
        // Use onloadend if available
        request.onloadend = onloadend;
      } else {
        // Listen for ready state to emulate onloadend
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }
          // readystate handler is calling before onerror or ontimeout handlers,
          // so we should call onloadend on the next 'tick'
          setTimeout(onloadend);
        };
      }

      // Handle browser request cancellation (as opposed to a manual cancellation)
      request.onabort = function handleAbort() {
        if (!request) {
          return;
        }

        reject(new AxiosError$1('Request aborted', AxiosError$1.ECONNABORTED, config, request));

        // Clean up request
        request = null;
      };

      // Handle low level network errors
    request.onerror = function handleError(event) {
         // Browsers deliver a ProgressEvent in XHR onerror
         // (message may be empty; when present, surface it)
         // See https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/error_event
         const msg = event && event.message ? event.message : 'Network Error';
         const err = new AxiosError$1(msg, AxiosError$1.ERR_NETWORK, config, request);
         // attach the underlying event for consumers who want details
         err.event = event || null;
         reject(err);
         request = null;
      };
      
      // Handle timeout
      request.ontimeout = function handleTimeout() {
        let timeoutErrorMessage = _config.timeout ? 'timeout of ' + _config.timeout + 'ms exceeded' : 'timeout exceeded';
        const transitional = _config.transitional || transitionalDefaults;
        if (_config.timeoutErrorMessage) {
          timeoutErrorMessage = _config.timeoutErrorMessage;
        }
        reject(new AxiosError$1(
          timeoutErrorMessage,
          transitional.clarifyTimeoutError ? AxiosError$1.ETIMEDOUT : AxiosError$1.ECONNABORTED,
          config,
          request));

        // Clean up request
        request = null;
      };

      // Remove Content-Type if data is undefined
      requestData === undefined && requestHeaders.setContentType(null);

      // Add headers to the request
      if ('setRequestHeader' in request) {
        utils$1.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
          request.setRequestHeader(key, val);
        });
      }

      // Add withCredentials to request if needed
      if (!utils$1.isUndefined(_config.withCredentials)) {
        request.withCredentials = !!_config.withCredentials;
      }

      // Add responseType to request if needed
      if (responseType && responseType !== 'json') {
        request.responseType = _config.responseType;
      }

      // Handle progress if needed
      if (onDownloadProgress) {
        ([downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true));
        request.addEventListener('progress', downloadThrottled);
      }

      // Not all browsers support upload events
      if (onUploadProgress && request.upload) {
        ([uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress));

        request.upload.addEventListener('progress', uploadThrottled);

        request.upload.addEventListener('loadend', flushUpload);
      }

      if (_config.cancelToken || _config.signal) {
        // Handle cancellation
        // eslint-disable-next-line func-names
        onCanceled = cancel => {
          if (!request) {
            return;
          }
          reject(!cancel || cancel.type ? new CanceledError$1(null, config, request) : cancel);
          request.abort();
          request = null;
        };

        _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
        if (_config.signal) {
          _config.signal.aborted ? onCanceled() : _config.signal.addEventListener('abort', onCanceled);
        }
      }

      const protocol = parseProtocol(_config.url);

      if (protocol && platform.protocols.indexOf(protocol) === -1) {
        reject(new AxiosError$1('Unsupported protocol ' + protocol + ':', AxiosError$1.ERR_BAD_REQUEST, config));
        return;
      }


      // Send the request
      request.send(requestData || null);
    });
  };

  const composeSignals = (signals, timeout) => {
    const {length} = (signals = signals ? signals.filter(Boolean) : []);

    if (timeout || length) {
      let controller = new AbortController();

      let aborted;

      const onabort = function (reason) {
        if (!aborted) {
          aborted = true;
          unsubscribe();
          const err = reason instanceof Error ? reason : this.reason;
          controller.abort(err instanceof AxiosError$1 ? err : new CanceledError$1(err instanceof Error ? err.message : err));
        }
      };

      let timer = timeout && setTimeout(() => {
        timer = null;
        onabort(new AxiosError$1(`timeout ${timeout} of ms exceeded`, AxiosError$1.ETIMEDOUT));
      }, timeout);

      const unsubscribe = () => {
        if (signals) {
          timer && clearTimeout(timer);
          timer = null;
          signals.forEach(signal => {
            signal.unsubscribe ? signal.unsubscribe(onabort) : signal.removeEventListener('abort', onabort);
          });
          signals = null;
        }
      };

      signals.forEach((signal) => signal.addEventListener('abort', onabort));

      const {signal} = controller;

      signal.unsubscribe = () => utils$1.asap(unsubscribe);

      return signal;
    }
  };

  const streamChunk = function* (chunk, chunkSize) {
    let len = chunk.byteLength;

    if (len < chunkSize) {
      yield chunk;
      return;
    }

    let pos = 0;
    let end;

    while (pos < len) {
      end = pos + chunkSize;
      yield chunk.slice(pos, end);
      pos = end;
    }
  };

  const readBytes = async function* (iterable, chunkSize) {
    for await (const chunk of readStream(iterable)) {
      yield* streamChunk(chunk, chunkSize);
    }
  };

  const readStream = async function* (stream) {
    if (stream[Symbol.asyncIterator]) {
      yield* stream;
      return;
    }

    const reader = stream.getReader();
    try {
      for (;;) {
        const {done, value} = await reader.read();
        if (done) {
          break;
        }
        yield value;
      }
    } finally {
      await reader.cancel();
    }
  };

  const trackStream = (stream, chunkSize, onProgress, onFinish) => {
    const iterator = readBytes(stream, chunkSize);

    let bytes = 0;
    let done;
    let _onFinish = (e) => {
      if (!done) {
        done = true;
        onFinish && onFinish(e);
      }
    };

    return new ReadableStream({
      async pull(controller) {
        try {
          const {done, value} = await iterator.next();

          if (done) {
           _onFinish();
            controller.close();
            return;
          }

          let len = value.byteLength;
          if (onProgress) {
            let loadedBytes = bytes += len;
            onProgress(loadedBytes);
          }
          controller.enqueue(new Uint8Array(value));
        } catch (err) {
          _onFinish(err);
          throw err;
        }
      },
      cancel(reason) {
        _onFinish(reason);
        return iterator.return();
      }
    }, {
      highWaterMark: 2
    })
  };

  const DEFAULT_CHUNK_SIZE = 64 * 1024;

  const {isFunction} = utils$1;

  const globalFetchAPI = (({Request, Response}) => ({
    Request, Response
  }))(utils$1.global);

  const {
    ReadableStream: ReadableStream$1, TextEncoder
  } = utils$1.global;


  const test = (fn, ...args) => {
    try {
      return !!fn(...args);
    } catch (e) {
      return false
    }
  };

  const factory = (env) => {
    env = utils$1.merge.call({
      skipUndefined: true
    }, globalFetchAPI, env);

    const {fetch: envFetch, Request, Response} = env;
    const isFetchSupported = envFetch ? isFunction(envFetch) : typeof fetch === 'function';
    const isRequestSupported = isFunction(Request);
    const isResponseSupported = isFunction(Response);

    if (!isFetchSupported) {
      return false;
    }

    const isReadableStreamSupported = isFetchSupported && isFunction(ReadableStream$1);

    const encodeText = isFetchSupported && (typeof TextEncoder === 'function' ?
        ((encoder) => (str) => encoder.encode(str))(new TextEncoder()) :
        async (str) => new Uint8Array(await new Request(str).arrayBuffer())
    );

    const supportsRequestStream = isRequestSupported && isReadableStreamSupported && test(() => {
      let duplexAccessed = false;

      const hasContentType = new Request(platform.origin, {
        body: new ReadableStream$1(),
        method: 'POST',
        get duplex() {
          duplexAccessed = true;
          return 'half';
        },
      }).headers.has('Content-Type');

      return duplexAccessed && !hasContentType;
    });

    const supportsResponseStream = isResponseSupported && isReadableStreamSupported &&
      test(() => utils$1.isReadableStream(new Response('').body));

    const resolvers = {
      stream: supportsResponseStream && ((res) => res.body)
    };

    isFetchSupported && ((() => {
      ['text', 'arrayBuffer', 'blob', 'formData', 'stream'].forEach(type => {
        !resolvers[type] && (resolvers[type] = (res, config) => {
          let method = res && res[type];

          if (method) {
            return method.call(res);
          }

          throw new AxiosError$1(`Response type '${type}' is not supported`, AxiosError$1.ERR_NOT_SUPPORT, config);
        });
      });
    })());

    const getBodyLength = async (body) => {
      if (body == null) {
        return 0;
      }

      if (utils$1.isBlob(body)) {
        return body.size;
      }

      if (utils$1.isSpecCompliantForm(body)) {
        const _request = new Request(platform.origin, {
          method: 'POST',
          body,
        });
        return (await _request.arrayBuffer()).byteLength;
      }

      if (utils$1.isArrayBufferView(body) || utils$1.isArrayBuffer(body)) {
        return body.byteLength;
      }

      if (utils$1.isURLSearchParams(body)) {
        body = body + '';
      }

      if (utils$1.isString(body)) {
        return (await encodeText(body)).byteLength;
      }
    };

    const resolveBodyLength = async (headers, body) => {
      const length = utils$1.toFiniteNumber(headers.getContentLength());

      return length == null ? getBodyLength(body) : length;
    };

    return async (config) => {
      let {
        url,
        method,
        data,
        signal,
        cancelToken,
        timeout,
        onDownloadProgress,
        onUploadProgress,
        responseType,
        headers,
        withCredentials = 'same-origin',
        fetchOptions
      } = resolveConfig(config);

      let _fetch = envFetch || fetch;

      responseType = responseType ? (responseType + '').toLowerCase() : 'text';

      let composedSignal = composeSignals([signal, cancelToken && cancelToken.toAbortSignal()], timeout);

      let request = null;

      const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
        composedSignal.unsubscribe();
      });

      let requestContentLength;

      try {
        if (
          onUploadProgress && supportsRequestStream && method !== 'get' && method !== 'head' &&
          (requestContentLength = await resolveBodyLength(headers, data)) !== 0
        ) {
          let _request = new Request(url, {
            method: 'POST',
            body: data,
            duplex: "half"
          });

          let contentTypeHeader;

          if (utils$1.isFormData(data) && (contentTypeHeader = _request.headers.get('content-type'))) {
            headers.setContentType(contentTypeHeader);
          }

          if (_request.body) {
            const [onProgress, flush] = progressEventDecorator(
              requestContentLength,
              progressEventReducer(asyncDecorator(onUploadProgress))
            );

            data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
          }
        }

        if (!utils$1.isString(withCredentials)) {
          withCredentials = withCredentials ? 'include' : 'omit';
        }

        // Cloudflare Workers throws when credentials are defined
        // see https://github.com/cloudflare/workerd/issues/902
        const isCredentialsSupported = isRequestSupported && "credentials" in Request.prototype;

        const resolvedOptions = {
          ...fetchOptions,
          signal: composedSignal,
          method: method.toUpperCase(),
          headers: headers.normalize().toJSON(),
          body: data,
          duplex: "half",
          credentials: isCredentialsSupported ? withCredentials : undefined
        };

        request = isRequestSupported && new Request(url, resolvedOptions);

        let response = await (isRequestSupported ? _fetch(request, fetchOptions) : _fetch(url, resolvedOptions));

        const isStreamResponse = supportsResponseStream && (responseType === 'stream' || responseType === 'response');

        if (supportsResponseStream && (onDownloadProgress || (isStreamResponse && unsubscribe))) {
          const options = {};

          ['status', 'statusText', 'headers'].forEach(prop => {
            options[prop] = response[prop];
          });

          const responseContentLength = utils$1.toFiniteNumber(response.headers.get('content-length'));

          const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
            responseContentLength,
            progressEventReducer(asyncDecorator(onDownloadProgress), true)
          ) || [];

          response = new Response(
            trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
              flush && flush();
              unsubscribe && unsubscribe();
            }),
            options
          );
        }

        responseType = responseType || 'text';

        let responseData = await resolvers[utils$1.findKey(resolvers, responseType) || 'text'](response, config);

        !isStreamResponse && unsubscribe && unsubscribe();

        return await new Promise((resolve, reject) => {
          settle(resolve, reject, {
            data: responseData,
            headers: AxiosHeaders$1.from(response.headers),
            status: response.status,
            statusText: response.statusText,
            config,
            request
          });
        })
      } catch (err) {
        unsubscribe && unsubscribe();

        if (err && err.name === 'TypeError' && /Load failed|fetch/i.test(err.message)) {
          throw Object.assign(
            new AxiosError$1('Network Error', AxiosError$1.ERR_NETWORK, config, request),
            {
              cause: err.cause || err
            }
          )
        }

        throw AxiosError$1.from(err, err && err.code, config, request);
      }
    }
  };

  const seedCache = new Map();

  const getFetch = (config) => {
    let env = (config && config.env) || {};
    const {fetch, Request, Response} = env;
    const seeds = [
      Request, Response, fetch
    ];

    let len = seeds.length, i = len,
      seed, target, map = seedCache;

    while (i--) {
      seed = seeds[i];
      target = map.get(seed);

      target === undefined && map.set(seed, target = (i ? new Map() : factory(env)));

      map = target;
    }

    return target;
  };

  getFetch();

  /**
   * Known adapters mapping.
   * Provides environment-specific adapters for Axios:
   * - `http` for Node.js
   * - `xhr` for browsers
   * - `fetch` for fetch API-based requests
   * 
   * @type {Object<string, Function|Object>}
   */
  const knownAdapters = {
    http: httpAdapter,
    xhr: xhrAdapter,
    fetch: {
      get: getFetch,
    }
  };

  // Assign adapter names for easier debugging and identification
  utils$1.forEach(knownAdapters, (fn, value) => {
    if (fn) {
      try {
        Object.defineProperty(fn, 'name', { value });
      } catch (e) {
        // eslint-disable-next-line no-empty
      }
      Object.defineProperty(fn, 'adapterName', { value });
    }
  });

  /**
   * Render a rejection reason string for unknown or unsupported adapters
   * 
   * @param {string} reason
   * @returns {string}
   */
  const renderReason = (reason) => `- ${reason}`;

  /**
   * Check if the adapter is resolved (function, null, or false)
   * 
   * @param {Function|null|false} adapter
   * @returns {boolean}
   */
  const isResolvedHandle = (adapter) => utils$1.isFunction(adapter) || adapter === null || adapter === false;

  /**
   * Get the first suitable adapter from the provided list.
   * Tries each adapter in order until a supported one is found.
   * Throws an AxiosError if no adapter is suitable.
   * 
   * @param {Array<string|Function>|string|Function} adapters - Adapter(s) by name or function.
   * @param {Object} config - Axios request configuration
   * @throws {AxiosError} If no suitable adapter is available
   * @returns {Function} The resolved adapter function
   */
  function getAdapter$1(adapters, config) {
    adapters = utils$1.isArray(adapters) ? adapters : [adapters];

    const { length } = adapters;
    let nameOrAdapter;
    let adapter;

    const rejectedReasons = {};

    for (let i = 0; i < length; i++) {
      nameOrAdapter = adapters[i];
      let id;

      adapter = nameOrAdapter;

      if (!isResolvedHandle(nameOrAdapter)) {
        adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];

        if (adapter === undefined) {
          throw new AxiosError$1(`Unknown adapter '${id}'`);
        }
      }

      if (adapter && (utils$1.isFunction(adapter) || (adapter = adapter.get(config)))) {
        break;
      }

      rejectedReasons[id || '#' + i] = adapter;
    }

    if (!adapter) {
      const reasons = Object.entries(rejectedReasons)
        .map(([id, state]) => `adapter ${id} ` +
          (state === false ? 'is not supported by the environment' : 'is not available in the build')
        );

      let s = length ?
        (reasons.length > 1 ? 'since :\n' + reasons.map(renderReason).join('\n') : ' ' + renderReason(reasons[0])) :
        'as no adapter specified';

      throw new AxiosError$1(
        `There is no suitable adapter to dispatch the request ` + s,
        'ERR_NOT_SUPPORT'
      );
    }

    return adapter;
  }

  /**
   * Exports Axios adapters and utility to resolve an adapter
   */
  var adapters = {
    /**
     * Resolve an adapter from a list of adapter names or functions.
     * @type {Function}
     */
    getAdapter: getAdapter$1,

    /**
     * Exposes all known adapters
     * @type {Object<string, Function|Object>}
     */
    adapters: knownAdapters
  };

  /**
   * Throws a `CanceledError` if cancellation has been requested.
   *
   * @param {Object} config The config that is to be used for the request
   *
   * @returns {void}
   */
  function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }

    if (config.signal && config.signal.aborted) {
      throw new CanceledError$1(null, config);
    }
  }

  /**
   * Dispatch a request to the server using the configured adapter.
   *
   * @param {object} config The config that is to be used for the request
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  function dispatchRequest(config) {
    throwIfCancellationRequested(config);

    config.headers = AxiosHeaders$1.from(config.headers);

    // Transform request data
    config.data = transformData.call(
      config,
      config.transformRequest
    );

    if (['post', 'put', 'patch'].indexOf(config.method) !== -1) {
      config.headers.setContentType('application/x-www-form-urlencoded', false);
    }

    const adapter = adapters.getAdapter(config.adapter || defaults.adapter, config);

    return adapter(config).then(function onAdapterResolution(response) {
      throwIfCancellationRequested(config);

      // Transform response data
      response.data = transformData.call(
        config,
        config.transformResponse,
        response
      );

      response.headers = AxiosHeaders$1.from(response.headers);

      return response;
    }, function onAdapterRejection(reason) {
      if (!isCancel$1(reason)) {
        throwIfCancellationRequested(config);

        // Transform response data
        if (reason && reason.response) {
          reason.response.data = transformData.call(
            config,
            config.transformResponse,
            reason.response
          );
          reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
        }
      }

      return Promise.reject(reason);
    });
  }

  const VERSION$2 = "1.13.2";

  const validators$1 = {};

  // eslint-disable-next-line func-names
  ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach((type, i) => {
    validators$1[type] = function validator(thing) {
      return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
    };
  });

  const deprecatedWarnings = {};

  /**
   * Transitional option validator
   *
   * @param {function|boolean?} validator - set to false if the transitional option has been removed
   * @param {string?} version - deprecated version / removed since version
   * @param {string?} message - some message with additional info
   *
   * @returns {function}
   */
  validators$1.transitional = function transitional(validator, version, message) {
    function formatMessage(opt, desc) {
      return '[Axios v' + VERSION$2 + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
    }

    // eslint-disable-next-line func-names
    return (value, opt, opts) => {
      if (validator === false) {
        throw new AxiosError$1(
          formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
          AxiosError$1.ERR_DEPRECATED
        );
      }

      if (version && !deprecatedWarnings[opt]) {
        deprecatedWarnings[opt] = true;
        // eslint-disable-next-line no-console
        console.warn(
          formatMessage(
            opt,
            ' has been deprecated since v' + version + ' and will be removed in the near future'
          )
        );
      }

      return validator ? validator(value, opt, opts) : true;
    };
  };

  validators$1.spelling = function spelling(correctSpelling) {
    return (value, opt) => {
      // eslint-disable-next-line no-console
      console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
      return true;
    }
  };

  /**
   * Assert object's properties type
   *
   * @param {object} options
   * @param {object} schema
   * @param {boolean?} allowUnknown
   *
   * @returns {object}
   */

  function assertOptions(options, schema, allowUnknown) {
    if (typeof options !== 'object') {
      throw new AxiosError$1('options must be an object', AxiosError$1.ERR_BAD_OPTION_VALUE);
    }
    const keys = Object.keys(options);
    let i = keys.length;
    while (i-- > 0) {
      const opt = keys[i];
      const validator = schema[opt];
      if (validator) {
        const value = options[opt];
        const result = value === undefined || validator(value, opt, options);
        if (result !== true) {
          throw new AxiosError$1('option ' + opt + ' must be ' + result, AxiosError$1.ERR_BAD_OPTION_VALUE);
        }
        continue;
      }
      if (allowUnknown !== true) {
        throw new AxiosError$1('Unknown option ' + opt, AxiosError$1.ERR_BAD_OPTION);
      }
    }
  }

  var validator = {
    assertOptions,
    validators: validators$1
  };

  const validators = validator.validators;

  /**
   * Create a new instance of Axios
   *
   * @param {Object} instanceConfig The default config for the instance
   *
   * @return {Axios} A new instance of Axios
   */
  let Axios$1 = class Axios {
    constructor(instanceConfig) {
      this.defaults = instanceConfig || {};
      this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
     * @param {?Object} config
     *
     * @returns {Promise} The Promise to be fulfilled
     */
    async request(configOrUrl, config) {
      try {
        return await this._request(configOrUrl, config);
      } catch (err) {
        if (err instanceof Error) {
          let dummy = {};

          Error.captureStackTrace ? Error.captureStackTrace(dummy) : (dummy = new Error());

          // slice off the Error: ... line
          const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, '') : '';
          try {
            if (!err.stack) {
              err.stack = stack;
              // match without the 2 top stack lines
            } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ''))) {
              err.stack += '\n' + stack;
            }
          } catch (e) {
            // ignore the case where "stack" is an un-writable property
          }
        }

        throw err;
      }
    }

    _request(configOrUrl, config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof configOrUrl === 'string') {
        config = config || {};
        config.url = configOrUrl;
      } else {
        config = configOrUrl || {};
      }

      config = mergeConfig$1(this.defaults, config);

      const {transitional, paramsSerializer, headers} = config;

      if (transitional !== undefined) {
        validator.assertOptions(transitional, {
          silentJSONParsing: validators.transitional(validators.boolean),
          forcedJSONParsing: validators.transitional(validators.boolean),
          clarifyTimeoutError: validators.transitional(validators.boolean)
        }, false);
      }

      if (paramsSerializer != null) {
        if (utils$1.isFunction(paramsSerializer)) {
          config.paramsSerializer = {
            serialize: paramsSerializer
          };
        } else {
          validator.assertOptions(paramsSerializer, {
            encode: validators.function,
            serialize: validators.function
          }, true);
        }
      }

      // Set config.allowAbsoluteUrls
      if (config.allowAbsoluteUrls !== undefined) ; else if (this.defaults.allowAbsoluteUrls !== undefined) {
        config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
      } else {
        config.allowAbsoluteUrls = true;
      }

      validator.assertOptions(config, {
        baseUrl: validators.spelling('baseURL'),
        withXsrfToken: validators.spelling('withXSRFToken')
      }, true);

      // Set config.method
      config.method = (config.method || this.defaults.method || 'get').toLowerCase();

      // Flatten headers
      let contextHeaders = headers && utils$1.merge(
        headers.common,
        headers[config.method]
      );

      headers && utils$1.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        (method) => {
          delete headers[method];
        }
      );

      config.headers = AxiosHeaders$1.concat(contextHeaders, headers);

      // filter out skipped interceptors
      const requestInterceptorChain = [];
      let synchronousRequestInterceptors = true;
      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
          return;
        }

        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      const responseInterceptorChain = [];
      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      });

      let promise;
      let i = 0;
      let len;

      if (!synchronousRequestInterceptors) {
        const chain = [dispatchRequest.bind(this), undefined];
        chain.unshift(...requestInterceptorChain);
        chain.push(...responseInterceptorChain);
        len = chain.length;

        promise = Promise.resolve(config);

        while (i < len) {
          promise = promise.then(chain[i++], chain[i++]);
        }

        return promise;
      }

      len = requestInterceptorChain.length;

      let newConfig = config;

      while (i < len) {
        const onFulfilled = requestInterceptorChain[i++];
        const onRejected = requestInterceptorChain[i++];
        try {
          newConfig = onFulfilled(newConfig);
        } catch (error) {
          onRejected.call(this, error);
          break;
        }
      }

      try {
        promise = dispatchRequest.call(this, newConfig);
      } catch (error) {
        return Promise.reject(error);
      }

      i = 0;
      len = responseInterceptorChain.length;

      while (i < len) {
        promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
      }

      return promise;
    }

    getUri(config) {
      config = mergeConfig$1(this.defaults, config);
      const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
      return buildURL(fullPath, config.params, config.paramsSerializer);
    }
  };

  // Provide aliases for supported request methods
  utils$1.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
    /*eslint func-names:0*/
    Axios$1.prototype[method] = function(url, config) {
      return this.request(mergeConfig$1(config || {}, {
        method,
        url,
        data: (config || {}).data
      }));
    };
  });

  utils$1.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    /*eslint func-names:0*/

    function generateHTTPMethod(isForm) {
      return function httpMethod(url, data, config) {
        return this.request(mergeConfig$1(config || {}, {
          method,
          headers: isForm ? {
            'Content-Type': 'multipart/form-data'
          } : {},
          url,
          data
        }));
      };
    }

    Axios$1.prototype[method] = generateHTTPMethod();

    Axios$1.prototype[method + 'Form'] = generateHTTPMethod(true);
  });

  /**
   * A `CancelToken` is an object that can be used to request cancellation of an operation.
   *
   * @param {Function} executor The executor function.
   *
   * @returns {CancelToken}
   */
  let CancelToken$1 = class CancelToken {
    constructor(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      let resolvePromise;

      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      const token = this;

      // eslint-disable-next-line func-names
      this.promise.then(cancel => {
        if (!token._listeners) return;

        let i = token._listeners.length;

        while (i-- > 0) {
          token._listeners[i](cancel);
        }
        token._listeners = null;
      });

      // eslint-disable-next-line func-names
      this.promise.then = onfulfilled => {
        let _resolve;
        // eslint-disable-next-line func-names
        const promise = new Promise(resolve => {
          token.subscribe(resolve);
          _resolve = resolve;
        }).then(onfulfilled);

        promise.cancel = function reject() {
          token.unsubscribe(_resolve);
        };

        return promise;
      };

      executor(function cancel(message, config, request) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new CanceledError$1(message, config, request);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     */
    throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    }

    /**
     * Subscribe to the cancel signal
     */

    subscribe(listener) {
      if (this.reason) {
        listener(this.reason);
        return;
      }

      if (this._listeners) {
        this._listeners.push(listener);
      } else {
        this._listeners = [listener];
      }
    }

    /**
     * Unsubscribe from the cancel signal
     */

    unsubscribe(listener) {
      if (!this._listeners) {
        return;
      }
      const index = this._listeners.indexOf(listener);
      if (index !== -1) {
        this._listeners.splice(index, 1);
      }
    }

    toAbortSignal() {
      const controller = new AbortController();

      const abort = (err) => {
        controller.abort(err);
      };

      this.subscribe(abort);

      controller.signal.unsubscribe = () => this.unsubscribe(abort);

      return controller.signal;
    }

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    static source() {
      let cancel;
      const token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token,
        cancel
      };
    }
  };

  /**
   * Syntactic sugar for invoking a function and expanding an array for arguments.
   *
   * Common use case would be to use `Function.prototype.apply`.
   *
   *  ```js
   *  function f(x, y, z) {}
   *  var args = [1, 2, 3];
   *  f.apply(null, args);
   *  ```
   *
   * With `spread` this example can be re-written.
   *
   *  ```js
   *  spread(function(x, y, z) {})([1, 2, 3]);
   *  ```
   *
   * @param {Function} callback
   *
   * @returns {Function}
   */
  function spread$1(callback) {
    return function wrap(arr) {
      return callback.apply(null, arr);
    };
  }

  /**
   * Determines whether the payload is an error thrown by Axios
   *
   * @param {*} payload The value to test
   *
   * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
   */
  function isAxiosError$1(payload) {
    return utils$1.isObject(payload) && (payload.isAxiosError === true);
  }

  const HttpStatusCode$1 = {
    Continue: 100,
    SwitchingProtocols: 101,
    Processing: 102,
    EarlyHints: 103,
    Ok: 200,
    Created: 201,
    Accepted: 202,
    NonAuthoritativeInformation: 203,
    NoContent: 204,
    ResetContent: 205,
    PartialContent: 206,
    MultiStatus: 207,
    AlreadyReported: 208,
    ImUsed: 226,
    MultipleChoices: 300,
    MovedPermanently: 301,
    Found: 302,
    SeeOther: 303,
    NotModified: 304,
    UseProxy: 305,
    Unused: 306,
    TemporaryRedirect: 307,
    PermanentRedirect: 308,
    BadRequest: 400,
    Unauthorized: 401,
    PaymentRequired: 402,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    ProxyAuthenticationRequired: 407,
    RequestTimeout: 408,
    Conflict: 409,
    Gone: 410,
    LengthRequired: 411,
    PreconditionFailed: 412,
    PayloadTooLarge: 413,
    UriTooLong: 414,
    UnsupportedMediaType: 415,
    RangeNotSatisfiable: 416,
    ExpectationFailed: 417,
    ImATeapot: 418,
    MisdirectedRequest: 421,
    UnprocessableEntity: 422,
    Locked: 423,
    FailedDependency: 424,
    TooEarly: 425,
    UpgradeRequired: 426,
    PreconditionRequired: 428,
    TooManyRequests: 429,
    RequestHeaderFieldsTooLarge: 431,
    UnavailableForLegalReasons: 451,
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavailable: 503,
    GatewayTimeout: 504,
    HttpVersionNotSupported: 505,
    VariantAlsoNegotiates: 506,
    InsufficientStorage: 507,
    LoopDetected: 508,
    NotExtended: 510,
    NetworkAuthenticationRequired: 511,
    WebServerIsDown: 521,
    ConnectionTimedOut: 522,
    OriginIsUnreachable: 523,
    TimeoutOccurred: 524,
    SslHandshakeFailed: 525,
    InvalidSslCertificate: 526,
  };

  Object.entries(HttpStatusCode$1).forEach(([key, value]) => {
    HttpStatusCode$1[value] = key;
  });

  /**
   * Create an instance of Axios
   *
   * @param {Object} defaultConfig The default config for the instance
   *
   * @returns {Axios} A new instance of Axios
   */
  function createInstance(defaultConfig) {
    const context = new Axios$1(defaultConfig);
    const instance = bind$1(Axios$1.prototype.request, context);

    // Copy axios.prototype to instance
    utils$1.extend(instance, Axios$1.prototype, context, {allOwnKeys: true});

    // Copy context to instance
    utils$1.extend(instance, context, null, {allOwnKeys: true});

    // Factory for creating new instances
    instance.create = function create(instanceConfig) {
      return createInstance(mergeConfig$1(defaultConfig, instanceConfig));
    };

    return instance;
  }

  // Create the default instance to be exported
  const axios = createInstance(defaults);

  // Expose Axios class to allow class inheritance
  axios.Axios = Axios$1;

  // Expose Cancel & CancelToken
  axios.CanceledError = CanceledError$1;
  axios.CancelToken = CancelToken$1;
  axios.isCancel = isCancel$1;
  axios.VERSION = VERSION$2;
  axios.toFormData = toFormData$1;

  // Expose AxiosError class
  axios.AxiosError = AxiosError$1;

  // alias for CanceledError for backward compatibility
  axios.Cancel = axios.CanceledError;

  // Expose all/spread
  axios.all = function all(promises) {
    return Promise.all(promises);
  };

  axios.spread = spread$1;

  // Expose isAxiosError
  axios.isAxiosError = isAxiosError$1;

  // Expose mergeConfig
  axios.mergeConfig = mergeConfig$1;

  axios.AxiosHeaders = AxiosHeaders$1;

  axios.formToJSON = thing => formDataToJSON(utils$1.isHTMLForm(thing) ? new FormData(thing) : thing);

  axios.getAdapter = adapters.getAdapter;

  axios.HttpStatusCode = HttpStatusCode$1;

  axios.default = axios;

  // This module is intended to unwrap Axios default export as named.
  // Keep top-level export same with static properties
  // so that it can keep same with es module or cjs
  const {
    Axios,
    AxiosError,
    CanceledError,
    isCancel,
    CancelToken,
    VERSION: VERSION$1,
    all,
    Cancel,
    isAxiosError,
    spread,
    toFormData,
    AxiosHeaders,
    HttpStatusCode,
    formToJSON,
    getAdapter,
    mergeConfig
  } = axios;

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  var dayjs_min = {exports: {}};

  (function (module, exports$1) {
  	!function(t,e){module.exports=e();}(commonjsGlobal,(function(){var t=1e3,e=6e4,n=36e5,r="millisecond",i="second",s="minute",u="hour",a="day",o="week",c="month",f="quarter",h="year",d="date",l="Invalid Date",$=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,y=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,M={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(t){var e=["th","st","nd","rd"],n=t%100;return "["+t+(e[(n-20)%10]||e[n]||e[0])+"]"}},m=function(t,e,n){var r=String(t);return !r||r.length>=e?t:""+Array(e+1-r.length).join(n)+t},v={s:m,z:function(t){var e=-t.utcOffset(),n=Math.abs(e),r=Math.floor(n/60),i=n%60;return (e<=0?"+":"-")+m(r,2,"0")+":"+m(i,2,"0")},m:function t(e,n){if(e.date()<n.date())return -t(n,e);var r=12*(n.year()-e.year())+(n.month()-e.month()),i=e.clone().add(r,c),s=n-i<0,u=e.clone().add(r+(s?-1:1),c);return +(-(r+(n-i)/(s?i-u:u-i))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(t){return {M:c,y:h,w:o,d:a,D:d,h:u,m:s,s:i,ms:r,Q:f}[t]||String(t||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},g="en",D={};D[g]=M;var p="$isDayjsObject",S=function(t){return t instanceof _||!(!t||!t[p])},w=function t(e,n,r){var i;if(!e)return g;if("string"==typeof e){var s=e.toLowerCase();D[s]&&(i=s),n&&(D[s]=n,i=s);var u=e.split("-");if(!i&&u.length>1)return t(u[0])}else {var a=e.name;D[a]=e,i=a;}return !r&&i&&(g=i),i||!r&&g},O=function(t,e){if(S(t))return t.clone();var n="object"==typeof e?e:{};return n.date=t,n.args=arguments,new _(n)},b=v;b.l=w,b.i=S,b.w=function(t,e){return O(t,{locale:e.$L,utc:e.$u,x:e.$x,$offset:e.$offset})};var _=function(){function M(t){this.$L=w(t.locale,null,true),this.parse(t),this.$x=this.$x||t.x||{},this[p]=true;}var m=M.prototype;return m.parse=function(t){this.$d=function(t){var e=t.date,n=t.utc;if(null===e)return new Date(NaN);if(b.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var r=e.match($);if(r){var i=r[2]-1||0,s=(r[7]||"0").substring(0,3);return n?new Date(Date.UTC(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)):new Date(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)}}return new Date(e)}(t),this.init();},m.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds();},m.$utils=function(){return b},m.isValid=function(){return !(this.$d.toString()===l)},m.isSame=function(t,e){var n=O(t);return this.startOf(e)<=n&&n<=this.endOf(e)},m.isAfter=function(t,e){return O(t)<this.startOf(e)},m.isBefore=function(t,e){return this.endOf(e)<O(t)},m.$g=function(t,e,n){return b.u(t)?this[e]:this.set(n,t)},m.unix=function(){return Math.floor(this.valueOf()/1e3)},m.valueOf=function(){return this.$d.getTime()},m.startOf=function(t,e){var n=this,r=!!b.u(e)||e,f=b.p(t),l=function(t,e){var i=b.w(n.$u?Date.UTC(n.$y,e,t):new Date(n.$y,e,t),n);return r?i:i.endOf(a)},$=function(t,e){return b.w(n.toDate()[t].apply(n.toDate("s"),(r?[0,0,0,0]:[23,59,59,999]).slice(e)),n)},y=this.$W,M=this.$M,m=this.$D,v="set"+(this.$u?"UTC":"");switch(f){case h:return r?l(1,0):l(31,11);case c:return r?l(1,M):l(0,M+1);case o:var g=this.$locale().weekStart||0,D=(y<g?y+7:y)-g;return l(r?m-D:m+(6-D),M);case a:case d:return $(v+"Hours",0);case u:return $(v+"Minutes",1);case s:return $(v+"Seconds",2);case i:return $(v+"Milliseconds",3);default:return this.clone()}},m.endOf=function(t){return this.startOf(t,false)},m.$set=function(t,e){var n,o=b.p(t),f="set"+(this.$u?"UTC":""),l=(n={},n[a]=f+"Date",n[d]=f+"Date",n[c]=f+"Month",n[h]=f+"FullYear",n[u]=f+"Hours",n[s]=f+"Minutes",n[i]=f+"Seconds",n[r]=f+"Milliseconds",n)[o],$=o===a?this.$D+(e-this.$W):e;if(o===c||o===h){var y=this.clone().set(d,1);y.$d[l]($),y.init(),this.$d=y.set(d,Math.min(this.$D,y.daysInMonth())).$d;}else l&&this.$d[l]($);return this.init(),this},m.set=function(t,e){return this.clone().$set(t,e)},m.get=function(t){return this[b.p(t)]()},m.add=function(r,f){var d,l=this;r=Number(r);var $=b.p(f),y=function(t){var e=O(l);return b.w(e.date(e.date()+Math.round(t*r)),l)};if($===c)return this.set(c,this.$M+r);if($===h)return this.set(h,this.$y+r);if($===a)return y(1);if($===o)return y(7);var M=(d={},d[s]=e,d[u]=n,d[i]=t,d)[$]||1,m=this.$d.getTime()+r*M;return b.w(m,this)},m.subtract=function(t,e){return this.add(-1*t,e)},m.format=function(t){var e=this,n=this.$locale();if(!this.isValid())return n.invalidDate||l;var r=t||"YYYY-MM-DDTHH:mm:ssZ",i=b.z(this),s=this.$H,u=this.$m,a=this.$M,o=n.weekdays,c=n.months,f=n.meridiem,h=function(t,n,i,s){return t&&(t[n]||t(e,r))||i[n].slice(0,s)},d=function(t){return b.s(s%12||12,t,"0")},$=f||function(t,e,n){var r=t<12?"AM":"PM";return n?r.toLowerCase():r};return r.replace(y,(function(t,r){return r||function(t){switch(t){case "YY":return String(e.$y).slice(-2);case "YYYY":return b.s(e.$y,4,"0");case "M":return a+1;case "MM":return b.s(a+1,2,"0");case "MMM":return h(n.monthsShort,a,c,3);case "MMMM":return h(c,a);case "D":return e.$D;case "DD":return b.s(e.$D,2,"0");case "d":return String(e.$W);case "dd":return h(n.weekdaysMin,e.$W,o,2);case "ddd":return h(n.weekdaysShort,e.$W,o,3);case "dddd":return o[e.$W];case "H":return String(s);case "HH":return b.s(s,2,"0");case "h":return d(1);case "hh":return d(2);case "a":return $(s,u,true);case "A":return $(s,u,false);case "m":return String(u);case "mm":return b.s(u,2,"0");case "s":return String(e.$s);case "ss":return b.s(e.$s,2,"0");case "SSS":return b.s(e.$ms,3,"0");case "Z":return i}return null}(t)||i.replace(":","")}))},m.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},m.diff=function(r,d,l){var $,y=this,M=b.p(d),m=O(r),v=(m.utcOffset()-this.utcOffset())*e,g=this-m,D=function(){return b.m(y,m)};switch(M){case h:$=D()/12;break;case c:$=D();break;case f:$=D()/3;break;case o:$=(g-v)/6048e5;break;case a:$=(g-v)/864e5;break;case u:$=g/n;break;case s:$=g/e;break;case i:$=g/t;break;default:$=g;}return l?$:b.a($)},m.daysInMonth=function(){return this.endOf(c).$D},m.$locale=function(){return D[this.$L]},m.locale=function(t,e){if(!t)return this.$L;var n=this.clone(),r=w(t,e,true);return r&&(n.$L=r),n},m.clone=function(){return b.w(this.$d,this)},m.toDate=function(){return new Date(this.valueOf())},m.toJSON=function(){return this.isValid()?this.toISOString():null},m.toISOString=function(){return this.$d.toISOString()},m.toString=function(){return this.$d.toUTCString()},M}(),k=_.prototype;return O.prototype=k,[["$ms",r],["$s",i],["$m",s],["$H",u],["$W",a],["$M",c],["$y",h],["$D",d]].forEach((function(t){k[t[1]]=function(e){return this.$g(e,t[0],t[1])};})),O.extend=function(t,e){return t.$i||(t(e,_,O),t.$i=true),O},O.locale=w,O.isDayjs=S,O.unix=function(t){return O(1e3*t)},O.en=D[g],O.Ls=D,O.p={},O})); 
  } (dayjs_min));

  var dayjs_minExports = dayjs_min.exports;
  var dayjs = /*@__PURE__*/getDefaultExportFromCjs(dayjs_minExports);

  /**
   * Zechariah Event Tracking Library
   *
   * 基于 zechariah 的埋点方法插件
   *
   * @version 1.1.0
   * @author Leqee Group
   */
  /**
   * 库版本号
   * 与 package.json 中的 version 保持一致
   */
  const VERSION = '1.1.0';
  // 事件级别数组，支持更多级别的事件
  const eventLevels = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];
  /**
   * 根据字符串事件名称解析为对象
   * @param strEvent 字符串事件名称，如 '简历管理_查看简历_详情'
   */
  const getObjByStrEvent = (strEvent) => {
      const obj = {};
      if (strEvent) {
          const parts = strEvent.split('_');
          for (let [index, item] of parts.entries()) {
              if (eventLevels[index]) {
                  obj[eventLevels[index]] = item;
              }
          }
      }
      return obj;
  };
  /**
   * 节流函数
   */
  const throttle = (func, wait) => {
      let timeout = null;
      return function (...args) {
          if (!timeout) {
              timeout = setTimeout(() => {
                  timeout = null;
                  func.apply(this, args);
              }, wait);
          }
      };
  };
  /**
   * 从 cookies 中获取指定值
   * @param name cookie 名称
   * @returns cookie 值，如果不存在则返回 null
   */
  const getCookie = (name) => {
      if (typeof document === 'undefined')
          return null;
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.startsWith(name + '=')) {
              return decodeURIComponent(cookie.substring(name.length + 1));
          }
      }
      return null;
  };
  /**
   * 生成并存储设备唯一标识哈希码
   * @returns 哈希码字符串
   */
  const getOrCreateDeviceHash = () => {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          return '';
      }
      const STORAGE_KEY = 'event_track_device_hash';
      let deviceHash = localStorage.getItem(STORAGE_KEY);
      if (!deviceHash) {
          // 生成唯一哈希码：时间戳 + 随机数 + 用户代理信息
          const timestamp = Date.now().toString(36);
          const random = Math.random().toString(36).substring(2, 15);
          const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
          const userAgentHash = userAgent ? btoa(userAgent).substring(0, 10) : '';
          // 组合并生成哈希
          const combined = `${timestamp}_${random}_${userAgentHash}`;
          deviceHash = btoa(combined).substring(0, 32); // 取前32位作为哈希码
          // 存储到localStorage
          localStorage.setItem(STORAGE_KEY, deviceHash);
      }
      return deviceHash;
  };
  /**
   * 获取设备IP地址（异步）
   * @returns Promise<string> IP地址
   */
  const getDeviceIP = async () => {
      // 优先从localStorage获取已缓存的IP
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          const cachedIP = localStorage.getItem('event_track_device_ip');
          if (cachedIP) {
              return cachedIP;
          }
      }
      // 尝试通过WebRTC获取本地IP（仅用于开发/测试环境）
      try {
          const ip = await getLocalIP();
          if (ip && typeof localStorage !== 'undefined') {
              localStorage.setItem('event_track_device_ip', ip);
          }
          return ip || '';
      }
      catch (e) {
          // WebRTC获取失败，返回空字符串（实际IP由服务端记录）
          return '';
      }
  };
  /**
   * 通过WebRTC获取本地IP地址
   * @returns Promise<string> IP地址
   */
  const getLocalIP = () => {
      return new Promise((resolve) => {
          if (typeof RTCPeerConnection === 'undefined') {
              resolve('');
              return;
          }
          const pc = new RTCPeerConnection({
              iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
          });
          pc.createDataChannel('');
          pc.onicecandidate = (event) => {
              if (event.candidate) {
                  const candidate = event.candidate.candidate;
                  const match = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
                  if (match && match[1]) {
                      const ip = match[1];
                      // 排除本地回环地址和私有IP
                      if (ip !== '127.0.0.1' && !ip.startsWith('192.168.') && !ip.startsWith('10.') && !ip.startsWith('172.')) {
                          pc.close();
                          resolve(ip);
                          return;
                      }
                  }
              }
          };
          pc.createOffer()
              .then(offer => pc.setLocalDescription(offer))
              .catch(() => resolve(''));
          // 超时处理
          setTimeout(() => {
              pc.close();
              resolve('');
          }, 3000);
      });
  };
  /**
   * 根据 URL 判断是否为测试环境
   * @returns true 表示测试环境，false 表示正式环境
   */
  const detectEnvironment = () => {
      if (typeof window === 'undefined')
          return false;
      const href = window.location.href.toLowerCase();
      const hostname = window.location.hostname.toLowerCase();
      // 检查 URL 中是否包含 "test"
      return href.includes('test') || hostname.includes('test') || hostname.includes('localhost') || hostname.includes('127.0.0.1');
  };
  class EventTrack {
      constructor() {
          this.url = '';
          this.deviceHash = ''; // 设备哈希码
          this.deviceIP = ''; // 设备IP地址
          this.globalConfig = {};
          this.autoTrackConfig = null;
          this.router = null;
          this.scrollThrottleFunc = null;
          this.inputThrottleFunc = null;
          this.resizeThrottleFunc = null;
          this.domListeners = [];
          // 错误监听器列表
          this.errorListeners = [];
          // 用于记录最近点击的元素和时间，避免点击时触发 focus/blur 事件
          this.recentClickInfo = { element: null, timestamp: 0 };
          // 标记是否正在处理点击事件（用于同步忽略 focus/blur）
          this.isProcessingClick = false;
          this.isInitialized = false;
          this.routeChangeUnwatch = null;
          // 是否输出调试日志
          this.debug = false;
          // 保存原始的 console.error
          this.originalConsoleError = null;
          // 记录页面加载时间戳，用于计算页面浏览时长
          this.pageLoadTimestamp = 0;
          // 记录当前页面的 URL，用于路由变化时计算停留时长
          this.currentPageUrl = '';
          // 最近一次虚拟 pageLoad（用于路由切换防重）
          this.recentVirtualPageLoad = { url: '', timestamp: 0 };
          // 虚拟 pageLoad 防重时间窗口（毫秒）
          this.virtualPageLoadDedupeWindow = 500;
          /** 与 ARMS setUsername 类似：每次上报前调用 */
          this.setUsernameFn = null;
          /** 每次上报前调用，写入 attributes.realname 等 */
          this.setRealnameFn = null;
      }
      /**
       * 将 setUsername / setRealname 的返回值合并进 attributes（每条上报前调用，无缓存）。
       * 已注册回调时每次都会重新执行；当前无值时写入空字符串，便于登录后下一包即带上新值，并覆盖 globalConfig 中的旧值。
       */
      appendIdentityAttributes(attributes) {
          if (this.setUsernameFn) {
              try {
                  const v = this.setUsernameFn();
                  const s = v != null && String(v).trim() !== '' ? String(v).trim() : '';
                  attributes.username = s;
              }
              catch (e) {
                  if (this.debug) {
                      console.warn('[EventTrack] setUsername 执行异常', e);
                  }
              }
          }
          if (this.setRealnameFn) {
              try {
                  const v = this.setRealnameFn();
                  const s = v != null && String(v).trim() !== '' ? String(v).trim() : '';
                  attributes.realname = s;
              }
              catch (e) {
                  if (this.debug) {
                      console.warn('[EventTrack] setRealname 执行异常', e);
                  }
              }
          }
      }
      /**
       * 处理记录逻辑
       */
      async handleRecord(eventType, param, extraParam) {
          try {
              if (!this.url) {
                  throw new Error('#EventTrack url empty');
              }
              // 验证参数类型不能相同
              if (typeof param === typeof extraParam && param !== undefined && extraParam !== undefined) {
                  throw new Error('#EventTrack 参数错误');
              }
              const attributes = {
                  ...this.globalConfig,
                  date: dayjs().format('YYYY-MM-DD')
              };
              // 解析事件字符串
              const eventObj = typeof param === 'string'
                  ? getObjByStrEvent(param)
                  : getObjByStrEvent(extraParam || '');
              // 获取记录参数（对象类型）
              const recordParams = (typeof param === 'object' ? param : extraParam) || {};
              // 合并属性
              Object.assign(attributes, recordParams, eventObj);
              // 添加设备哈希码（作为身份标识）
              if (!this.deviceHash) {
                  this.deviceHash = getOrCreateDeviceHash();
              }
              if (this.deviceHash) {
                  attributes.device_hash = this.deviceHash;
                  // 同时设置deviceHash字段以兼容不同命名风格
                  attributes.deviceHash = this.deviceHash;
              }
              // 添加设备IP地址（如果已获取）
              if (this.deviceIP) {
                  attributes.device_ip = this.deviceIP;
                  // 同时设置deviceIp字段以兼容不同命名风格
                  attributes.deviceIp = this.deviceIP;
              }
              this.appendIdentityAttributes(attributes);
              const data = {
                  event_key: eventType,
                  attributes
              };
              if (this.debug) {
                  // 解析 URL 验证查询参数
                  const currentYardKey = this._currentYardKey;
                  try {
                      const urlObj = new URL(this.url);
                      const yardReportKey = urlObj.searchParams.get('yard-report-key');
                  }
                  catch (e) {
                  }
              }
              // 构建请求 headers
              const headers = {
                  'Content-Type': 'application/json'
              };
              // 发送请求
              // axios.post 会自动保留 URL 中的查询参数，不需要在 config.params 中设置
              await axios.post(this.url, data, {
                  headers
              });
          }
          catch (error) {
              // 输出详细的错误信息，便于调试
              if (error.response) {
                  // 服务器返回了错误响应
                  const status = error.response.status;
                  const statusText = error.response.statusText;
                  const errorData = error.response.data;
                  if (status === 401) {
                      console.warn('[EventTrack] 401 未授权错误:', {
                          url: this.url,
                          message: 'yard-report-key 可能无效或 yard 状态不是 ON',
                          status,
                          statusText,
                          errorData
                      });
                  }
                  else {
                      console.log('[EventTrack] 请求错误:', {
                          url: this.url,
                          status,
                          statusText,
                          errorData
                      });
                  }
              }
              else if (error.request) {
                  // 请求已发送但没有收到响应
                  console.log('[EventTrack] 网络错误:', {
                      url: this.url,
                      message: error.message || '请求失败，未收到响应'
                  });
              }
              else {
                  // 其他错误
                  console.log('[EventTrack] 错误:', {
                      url: this.url,
                      message: error.message || '未知错误',
                      error
                  });
              }
          }
      }
      /**
       * 追踪页面加载完成
       */
      trackPageLoad() {
          if (!this.autoTrackConfig?.trackPageLoad)
              return;
          const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
          const currentTime = Date.now();
          // 记录当前页面的加载时间戳和 URL
          // 如果是首次加载或 URL 发生变化，更新时间戳
          if (!this.pageLoadTimestamp || this.currentPageUrl !== currentUrl) {
              this.pageLoadTimestamp = currentTime;
              this.currentPageUrl = currentUrl;
          }
          // 计算页面加载耗时（毫秒）
          let pageLoadDuration = 0;
          if (typeof window !== 'undefined' && window.performance) {
              try {
                  // 优先使用 Performance Navigation Timing API
                  const navigation = performance.getEntriesByType('navigation')[0];
                  if (navigation) {
                      // 页面加载耗时 = loadEventEnd - fetchStart
                      pageLoadDuration = Math.round(navigation.loadEventEnd - navigation.fetchStart);
                  }
                  else if (performance.timing) {
                      // 降级使用已废弃但广泛支持的 performance.timing
                      const timing = performance.timing;
                      if (timing.loadEventEnd > 0 && timing.fetchStart > 0) {
                          pageLoadDuration = timing.loadEventEnd - timing.fetchStart;
                      }
                  }
              }
              catch (e) {
                  if (this.debug) {
                      console.warn('[EventTrack Auto] 无法获取页面加载时间:', e);
                  }
              }
          }
          const eventName = this.autoTrackConfig.pageLoad || '页面_加载完成';
          const attributes = {
              page_url: currentUrl,
              page_title: typeof document !== 'undefined' ? document.title : '',
              load_time: currentTime, // 保留加载完成的时间戳
              page_load_duration: pageLoadDuration, // 页面加载耗时（毫秒）
              event_type: 'pageLoad'
          };
          if (this.debug) {
              console.log('[EventTrack Auto] 页面加载完成', {
                  eventName,
                  attributes,
                  pageLoadTimestamp: this.pageLoadTimestamp,
                  pageLoadDuration
              });
          }
          this.view(eventName, attributes);
      }
      /**
       * 追踪路由变动
       * 支持 Vue Router、React Router、原生 History API、Hash 路由
       */
      trackRouteChange(to, from) {
          if (!this.autoTrackConfig?.trackRouteChange)
              return;
          const currentTime = Date.now();
          let stayTime = 0;
          // 计算上一个页面的停留时长（秒）
          if (this.pageLoadTimestamp > 0) {
              stayTime = (currentTime - this.pageLoadTimestamp) / 1000;
          }
          const eventName = this.autoTrackConfig.routeChange || '路由_变动';
          const routeInfo = {};
          // 处理不同类型的路由参数
          if (typeof to === 'string') {
              // 字符串类型（原生路由或 Hash 路由）
              routeInfo.to_path = to;
              routeInfo.from_path = typeof from === 'string' ? from : (typeof window !== 'undefined' ? window.location.pathname : '');
          }
          else if (to && typeof to === 'object') {
              // Vue Router 对象
              routeInfo.to_path = to.path || to.fullPath || '';
              routeInfo.to_name = to.name || '';
              routeInfo.to_params = JSON.stringify(to.params || {});
              routeInfo.to_query = JSON.stringify(to.query || {});
              if (from && typeof from === 'object') {
                  routeInfo.from_path = from.path || from.fullPath || '';
                  routeInfo.from_name = from.name || '';
              }
          }
          else {
              // 默认使用当前 URL
              routeInfo.to_path = typeof window !== 'undefined' ? (window.location.pathname + window.location.search) : '';
              routeInfo.from_path = typeof from === 'string' ? from : '';
          }
          // 添加完整的 URL 信息（适用于原生页面）
          const newUrl = typeof window !== 'undefined' ? window.location.href : '';
          if (typeof window !== 'undefined') {
              routeInfo.full_url = newUrl;
              routeInfo.hash = window.location.hash || '';
          }
          // 记录停留时长（秒）
          routeInfo.stay_time = stayTime.toFixed(2);
          routeInfo.from_page = this.currentPageUrl || routeInfo.from_path;
          routeInfo.to_page = newUrl || routeInfo.to_path;
          // 更新页面加载时间戳和当前 URL
          this.pageLoadTimestamp = currentTime;
          this.currentPageUrl = newUrl;
          // 添加事件类型标识
          routeInfo.event_type = 'routeChange';
          if (this.debug) {
              console.log('[EventTrack Auto] 路由变动', { eventName, routeInfo, stayTime });
          }
          this.view(eventName, routeInfo);
          // 路由切换后补发一条虚拟页面加载事件，用于 SPA 页面访问统计（PV/受访页面）
          if (this.autoTrackConfig?.trackPageLoad) {
              const virtualPageUrl = routeInfo.to_page || newUrl || routeInfo.to_path || '';
              const lastVirtualPageLoad = this.recentVirtualPageLoad;
              const isDuplicateVirtualPageLoad = !!(virtualPageUrl &&
                  lastVirtualPageLoad.url === virtualPageUrl &&
                  (currentTime - lastVirtualPageLoad.timestamp) <= this.virtualPageLoadDedupeWindow);
              if (isDuplicateVirtualPageLoad) {
                  if (this.debug) {
                      console.log('[EventTrack Auto] 跳过重复虚拟页面加载', {
                          page_url: virtualPageUrl,
                          dedupeWindow: this.virtualPageLoadDedupeWindow
                      });
                  }
                  return;
              }
              this.recentVirtualPageLoad = {
                  url: virtualPageUrl,
                  timestamp: currentTime
              };
              const virtualPageLoadEventName = this.autoTrackConfig.pageLoad || '页面_加载完成';
              const virtualPageLoadAttributes = {
                  page_url: virtualPageUrl,
                  page_title: typeof document !== 'undefined' ? document.title : '',
                  load_time: currentTime,
                  page_load_duration: 0,
                  referrer: routeInfo.from_page || routeInfo.from_path || '',
                  source_event: 'routeChange',
                  virtual_page_load: true,
                  event_type: 'pageLoad'
              };
              if (this.debug) {
                  console.log('[EventTrack Auto] 路由变动触发虚拟页面加载', {
                      eventName: virtualPageLoadEventName,
                      attributes: virtualPageLoadAttributes
                  });
              }
              this.view(virtualPageLoadEventName, virtualPageLoadAttributes);
          }
      }
      /**
       * 获取元素的事件名称（优先使用 data-track 属性）
       */
      getEventName(element, defaultEventName) {
          // 兼容处理：如果元素不存在，直接返回默认事件名称
          if (!element || typeof element.getAttribute !== 'function') {
              return defaultEventName;
          }
          try {
              const dataTrack = element.getAttribute('data-track');
              // 如果元素有 data-track 属性且值不为空，直接使用其值作为事件名称
              if (dataTrack && dataTrack.trim() !== '') {
                  return dataTrack.trim();
              }
          }
          catch (error) {
              // 如果 getAttribute 调用失败，使用默认事件名称
              console.log('#EventTrack getEventName error', error);
          }
          return defaultEventName;
      }
      /**
       * 判断元素是否是按钮类元素（支持 el-button、ant-button 等组件）
       */
      isButtonElement(element) {
          if (!element)
              return false;
          // 1. 标准按钮标签
          if (element.tagName === 'BUTTON') {
              return true;
          }
          // 2. 链接标签
          if (element.tagName === 'A' && element.getAttribute('href')) {
              return true;
          }
          // 3. role="button" 属性
          if (element.getAttribute('role') === 'button') {
              return true;
          }
          // 4. 有 onclick 属性或事件监听器
          if (element.onclick !== null) {
              return true;
          }
          // 5. 检查父元素是否是按钮
          const parentButton = element.closest('button');
          if (parentButton) {
              return true;
          }
          // 6. 检查父元素是否是链接
          const parentLink = element.closest('a[href]');
          if (parentLink) {
              return true;
          }
          // 7. Element Plus el-button（通常是 button 标签，但检查 class）
          const classList = element.classList;
          if (classList && (classList.contains('el-button') ||
              classList.contains('el-button--primary') ||
              classList.contains('el-button--success') ||
              classList.contains('el-button--warning') ||
              classList.contains('el-button--danger') ||
              classList.contains('el-button--info') ||
              classList.contains('el-button--text'))) {
              return true;
          }
          // 8. Ant Design ant-btn
          if (classList && (classList.contains('ant-btn') ||
              classList.contains('ant-btn-primary') ||
              classList.contains('ant-btn-success') ||
              classList.contains('ant-btn-warning') ||
              classList.contains('ant-btn-danger'))) {
              return true;
          }
          // 9. 检查父元素是否有按钮相关的 class
          const parentWithButtonClass = element.closest('.el-button, .ant-btn, [role="button"]');
          if (parentWithButtonClass) {
              return true;
          }
          // 10. 如果有 data-track 属性且值包含"按钮"或"button"，认为是按钮
          const dataTrack = element.getAttribute('data-track');
          if (dataTrack && (dataTrack.includes('按钮') || dataTrack.toLowerCase().includes('button'))) {
              return true;
          }
          return false;
      }
      /**
       * 截取可见文案长度（与原有 element_text 上限一致）
       */
      truncateClickLabel(s, maxLen) {
          const t = s.trim();
          if (!t)
              return '';
          return t.length > maxLen ? t.substring(0, maxLen) : t;
      }
      /**
       * 优先 innerText（可见文字），其次 textContent
       */
      getHTMLElementVisibleText(el, maxLen) {
          try {
              const it = (el.innerText || '').trim();
              if (it)
                  return this.truncateClickLabel(it, maxLen);
              const tc = (el.textContent || '').trim();
              if (tc)
                  return this.truncateClickLabel(tc, maxLen);
          }
          catch (e) {
              /* ignore */
          }
          return '';
      }
      /**
       * 图片：alt / title / 文件名
       */
      getImageClickLabel(el) {
          const alt = (el.getAttribute('alt') || '').trim();
          if (alt)
              return `[图片] ${alt}`;
          const title = (el.getAttribute('title') || '').trim();
          if (title)
              return `[图片] ${title}`;
          const src = el.getAttribute('src') || el.getAttribute('data-src') || '';
          if (src) {
              try {
                  const href = typeof window !== 'undefined' ? window.location.href : 'http://localhost/';
                  const path = new URL(src, href).pathname;
                  const base = path.split('/').pop() || '';
                  if (base)
                      return `[图片] ${base}`;
              }
              catch (e) {
                  const seg = src.split('/').pop()?.split('?')[0];
                  if (seg)
                      return `[图片] ${seg}`;
              }
          }
          return '[图片]';
      }
      /**
       * SVG / 常见图标 class：生成可读占位说明
       */
      getSvgOrIconClickLabel(el) {
          const svgRoot = el.tagName === 'SVG' ? el : el.closest('svg');
          if (svgRoot) {
              const aria = svgRoot.getAttribute('aria-label')?.trim();
              if (aria)
                  return `[图标] ${aria}`;
              const titleNode = svgRoot.querySelector('title');
              const tt = titleNode?.textContent?.trim();
              if (tt)
                  return `[图标] ${tt}`;
              return '[图标]';
          }
          const rawClass = el.className;
          const cls = typeof rawClass === 'string' ? rawClass : String(rawClass || '');
          if (/\b(el-icon-|anticon|iconfont|fa-|mdi-|icon-)/i.test(cls)) {
              const m = cls.match(/\bel-icon-([\w-]+)\b/);
              if (m)
                  return `[图标] ${m[1]}`;
              const m2 = cls.match(/\bicon-([\w-]+)\b/i);
              if (m2 && m2[1].length < 40)
                  return `[图标] ${m2[1]}`;
              return '[图标]';
          }
          return '';
      }
      /**
       * 解析点击展示文案：子节点无字时向上查找；图片/图标单独标明
       */
      resolveClickElementText(target, clickedButton) {
          const maxLen = 50;
          let t = this.getHTMLElementVisibleText(target, maxLen);
          if (t)
              return t;
          const aria = target.getAttribute('aria-label')?.trim();
          if (aria)
              return this.truncateClickLabel(aria, maxLen);
          const title = target.getAttribute('title')?.trim();
          if (title)
              return this.truncateClickLabel(title, maxLen);
          if (target.tagName === 'IMG') {
              return this.truncateClickLabel(this.getImageClickLabel(target), maxLen);
          }
          const iconLabel = this.getSvgOrIconClickLabel(target);
          if (iconLabel)
              return this.truncateClickLabel(iconLabel, maxLen);
          if (clickedButton && clickedButton !== target) {
              t = this.getHTMLElementVisibleText(clickedButton, maxLen);
              if (t)
                  return t;
              const ba = clickedButton.getAttribute('aria-label')?.trim();
              if (ba)
                  return this.truncateClickLabel(ba, maxLen);
              if (clickedButton.tagName === 'IMG') {
                  return this.truncateClickLabel(this.getImageClickLabel(clickedButton), maxLen);
              }
              const btnIcon = this.getSvgOrIconClickLabel(clickedButton);
              if (btnIcon)
                  return this.truncateClickLabel(btnIcon, maxLen);
          }
          let node = target.parentElement;
          for (let depth = 0; node && node !== document.body && depth < 12; depth++) {
              const tag = node.tagName;
              if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') {
                  node = node.parentElement;
                  continue;
              }
              t = this.getHTMLElementVisibleText(node, maxLen);
              if (t)
                  return t;
              const pAria = node.getAttribute('aria-label')?.trim();
              if (pAria)
                  return this.truncateClickLabel(pAria, maxLen);
              const pTitle = node.getAttribute('title')?.trim();
              if (pTitle)
                  return this.truncateClickLabel(pTitle, maxLen);
              if (node.tagName === 'IMG') {
                  return this.truncateClickLabel(this.getImageClickLabel(node), maxLen);
              }
              const pIcon = this.getSvgOrIconClickLabel(node);
              if (pIcon)
                  return this.truncateClickLabel(pIcon, maxLen);
              const nestedSvg = node.querySelector?.('svg');
              if (nestedSvg) {
                  const sl = this.getSvgOrIconClickLabel(nestedSvg);
                  if (sl)
                      return this.truncateClickLabel(sl, maxLen);
              }
              node = node.parentElement;
          }
          if (target.closest('svg')) {
              return '[图标]';
          }
          if (target.tagName === 'IMG') {
              return '[图片]';
          }
          return '';
      }
      /**
       * 追踪点击事件
       * 记录所有点击事件，包括按钮和节点
       */
      trackClick(event) {
          if (!this.autoTrackConfig?.trackClick)
              return;
          let target = event.target;
          if (!target)
              return;
          // 首先向上查找带有 data-track 属性的元素（优先查找）
          let trackElement = target;
          let hasDataTrack = false;
          let dataTrackElement = null;
          // 向上查找带有 data-track 属性的元素
          while (trackElement && trackElement !== document.body) {
              const dataTrack = trackElement.getAttribute('data-track');
              if (dataTrack && dataTrack.trim() !== '') {
                  hasDataTrack = true;
                  dataTrackElement = trackElement; // 记录带有 data-track 的元素
                  break;
              }
              trackElement = trackElement.parentElement;
          }
          // 查找按钮元素
          let clickedButton = null;
          if (!this.isButtonElement(target)) {
              const buttonElement = target.closest('button, a[href], [role="button"], .el-button, .ant-btn');
              if (buttonElement) {
                  clickedButton = buttonElement;
              }
          }
          else {
              clickedButton = target;
          }
          // 确定追踪目标：优先使用 data-track 元素，否则使用实际点击的元素
          if (hasDataTrack && dataTrackElement) {
              // 使用带有 data-track 的元素作为追踪目标
              target = dataTrackElement;
          }
          else {
              // 如果没有 data-track，使用实际点击的元素（记录所有点击）
              // 如果点击的是按钮内部的元素，使用按钮元素
              if (clickedButton && clickedButton !== target) {
                  target = clickedButton;
              }
              // 否则使用原始 target（记录所有节点点击）
          }
          // 如果配置了选择器，检查是否匹配
          if (this.autoTrackConfig.clickSelector) {
              if (!target.matches(this.autoTrackConfig.clickSelector)) {
                  return;
              }
          }
          // 检查点击的是否是按钮元素（使用实际点击的按钮元素，而不是 data-track 元素）
          const isButton = clickedButton ? this.isButtonElement(clickedButton) : this.isButtonElement(target);
          // 标记正在处理点击事件，同步忽略 focus/blur 事件
          this.isProcessingClick = true;
          // 记录所有点击信息，用于后续过滤 focus/blur 事件
          // 使用实际点击的元素（可能是按钮）来记录，但追踪目标使用 data-track 元素
          this.recentClickInfo = {
              element: clickedButton || target,
              timestamp: Date.now()
          };
          // 优先使用 data-track 属性的值作为事件名称
          // 如果没有 data-track，根据元素类型生成事件名称
          let defaultEventName = this.autoTrackConfig.click || '页面_点击';
          if (!hasDataTrack) {
              // 如果是按钮，使用"按钮_点击"
              if (isButton) {
                  defaultEventName = '按钮_点击';
              }
              else {
                  // 其他节点使用"节点_点击"
                  defaultEventName = '节点_点击';
              }
          }
          const eventName = this.getEventName(target, defaultEventName);
          const resolvedText = this.resolveClickElementText(target, clickedButton);
          const clickInfo = {
              element_tag: target.tagName.toLowerCase(),
              element_class: target.className || '',
              element_text: resolvedText,
              click_x: event.clientX,
              click_y: event.clientY
          };
          if (target.id) {
              clickInfo.element_id = target.id;
          }
          // 记录 data-track 属性值（用于调试）
          const dataTrack = target.getAttribute('data-track');
          if (dataTrack) {
              clickInfo.track_data = dataTrack;
          }
          // 如果实际点击的是按钮，记录按钮信息
          if (clickedButton && clickedButton !== target) {
              clickInfo.clicked_button_tag = clickedButton.tagName.toLowerCase();
              clickInfo.clicked_button_class = clickedButton.className || '';
              clickInfo.clicked_button_text = this.resolveClickElementText(clickedButton, null);
          }
          // 添加事件类型标识和元素类型
          clickInfo.event_type = 'click';
          clickInfo.is_button = isButton;
          if (this.debug) {
              console.log('[EventTrack Auto] 点击事件', { eventName, clickInfo });
          }
          this.operate(eventName, clickInfo);
          // 根据点击的元素类型决定清除标志的时间
          // 如果是按钮元素，延长标志持续时间（200ms），以捕获异步触发的 focus/blur 事件
          // 例如：点击按钮后打开对话框，对话框中的输入框获得焦点
          const clearDelay = isButton ? 200 : 0;
          setTimeout(() => {
              this.isProcessingClick = false;
          }, clearDelay);
      }
      /**
       * 追踪双击事件
       */
      trackDblclick(event) {
          if (!this.autoTrackConfig?.trackDblclick)
              return;
          const target = event.target;
          if (!target)
              return;
          // 如果配置了选择器，检查是否匹配
          if (this.autoTrackConfig.dblclickSelector) {
              if (!target.matches(this.autoTrackConfig.dblclickSelector)) {
                  return;
              }
          }
          // 优先使用 data-track 属性的值作为事件名称
          const defaultEventName = this.autoTrackConfig.dblclick || '页面_双击';
          const eventName = this.getEventName(target, defaultEventName);
          const dblclickInfo = {
              element_tag: target.tagName.toLowerCase(),
              element_id: target.id || '',
              element_class: target.className || '',
              element_text: target.textContent?.trim().substring(0, 50) || '',
              click_x: event.clientX,
              click_y: event.clientY
          };
          // 添加事件类型标识
          dblclickInfo.event_type = 'dblclick';
          if (this.debug) {
              console.log('[EventTrack Auto] 双击事件', { eventName, dblclickInfo });
          }
          this.operate(eventName, dblclickInfo);
      }
      /**
       * 追踪滚动事件
       */
      trackScroll() {
          if (!this.autoTrackConfig?.trackScroll)
              return;
          const eventName = this.autoTrackConfig.scroll || '页面_滚动';
          const scrollInfo = {
              scroll_top: typeof window !== 'undefined' ? window.pageYOffset || document.documentElement.scrollTop : 0,
              scroll_left: typeof window !== 'undefined' ? window.pageXOffset || document.documentElement.scrollLeft : 0,
              window_height: typeof window !== 'undefined' ? window.innerHeight : 0,
              window_width: typeof window !== 'undefined' ? window.innerWidth : 0,
              document_height: typeof document !== 'undefined' ? document.documentElement.scrollHeight : 0
          };
          // 添加事件类型标识
          scrollInfo.event_type = 'scroll';
          if (this.debug) {
              console.log('[EventTrack Auto] 滚动事件', { eventName, scrollInfo });
          }
          this.operate(eventName, scrollInfo);
      }
      /**
       * 追踪表单提交事件
       */
      trackSubmit(event) {
          if (!this.autoTrackConfig?.trackSubmit)
              return;
          const target = event.target;
          if (!target || target.tagName !== 'FORM')
              return;
          // 如果配置了选择器，检查是否匹配
          if (this.autoTrackConfig.submitSelector) {
              if (!target.matches(this.autoTrackConfig.submitSelector)) {
                  return;
              }
          }
          // 优先使用 data-track 属性的值作为事件名称
          const defaultEventName = this.autoTrackConfig.submit || '表单_提交';
          const eventName = this.getEventName(target, defaultEventName);
          const submitInfo = {
              form_id: target.id || '',
              form_action: target.action || '',
              form_method: target.method || 'get',
              form_name: target.name || ''
          };
          // 添加事件类型标识
          submitInfo.event_type = 'submit';
          if (this.debug) {
              console.log('[EventTrack Auto] 表单提交', { eventName, submitInfo });
          }
          this.operate(eventName, submitInfo);
      }
      /**
       * 检查是否是 Element Plus 组件（el-select、el-input 等）
       */
      isElementPlusComponent(element) {
          if (!element)
              return false;
          // 检查元素本身或父元素是否有 Element Plus 组件的标识
          const elSelect = element.closest('.el-select, el-select');
          const elInput = element.closest('.el-input, el-input');
          const elInputNumber = element.closest('.el-input-number, el-input-number');
          if (elSelect || elInput || elInputNumber) {
              return true;
          }
          // 检查是否是 el-select 内部的 input 元素
          if (element.tagName === 'INPUT' && element.closest('.el-select')) {
              return true;
          }
          return false;
      }
      /**
       * 追踪输入框聚焦事件
       */
      trackFocus(event) {
          if (!this.autoTrackConfig?.trackFocus)
              return;
          const target = event.target;
          if (!target)
              return;
          // Element Plus 组件（如 el-select）需要特殊处理，不应用点击去重逻辑
          const isElComponent = this.isElementPlusComponent(target);
          // 如果启用了点击时忽略 focus/blur 的配置
          if (this.autoTrackConfig?.ignoreFocusBlurOnClick !== false && !isElComponent) {
              // 优先检查是否正在处理点击事件（同步忽略）
              if (this.isProcessingClick) {
                  if (this.debug) {
                      console.log('[EventTrack Auto] 忽略聚焦事件（正在处理点击事件）', {
                          targetElement: target.tagName,
                          targetElementClass: target.className
                      });
                  }
                  return;
              }
              // 如果最近有点击事件（任何元素），在时间窗口内完全忽略所有 focus 事件
              let ignoreTime = this.autoTrackConfig?.clickFocusBlurIgnoreTime || 500;
              // 如果点击的是按钮元素，延长忽略时间窗口（按钮点击后可能异步打开对话框等）
              if (this.recentClickInfo.element && this.isButtonElement(this.recentClickInfo.element)) {
                  ignoreTime = Math.max(ignoreTime, 1500); // 按钮点击后至少忽略 1.5 秒
              }
              const timeSinceClick = Date.now() - this.recentClickInfo.timestamp;
              if (timeSinceClick < ignoreTime && this.recentClickInfo.element) {
                  const clickedElement = this.recentClickInfo.element;
                  if (this.debug) {
                      console.log('[EventTrack Auto] 忽略聚焦事件（由点击引起）', {
                          timeSinceClick,
                          ignoreTime,
                          clickedElement: clickedElement.tagName,
                          clickedElementClass: clickedElement.className,
                          targetElement: target.tagName,
                          targetElementClass: target.className
                      });
                  }
                  return;
              }
          }
          // 优先使用 data-track 属性的值作为事件名称
          const defaultEventName = this.autoTrackConfig.focus || '输入框_聚焦';
          const eventName = this.getEventName(target, defaultEventName);
          const focusInfo = {
              element_tag: target.tagName.toLowerCase(),
              element_id: target.id || '',
              element_type: target.type || '',
              element_name: target.name || ''
          };
          // 添加事件类型标识
          focusInfo.event_type = 'focus';
          if (this.debug) {
              console.log('[EventTrack Auto] 输入框聚焦', { eventName, focusInfo });
          }
          this.operate(eventName, focusInfo);
      }
      /**
       * 追踪输入框失焦事件
       */
      trackBlur(event) {
          if (!this.autoTrackConfig?.trackBlur)
              return;
          const target = event.target;
          if (!target)
              return;
          // Element Plus 组件（如 el-select）需要特殊处理，不应用点击去重逻辑
          const isElComponent = this.isElementPlusComponent(target);
          // 如果启用了点击时忽略 focus/blur 的配置
          if (this.autoTrackConfig?.ignoreFocusBlurOnClick !== false && !isElComponent) {
              // 优先检查是否正在处理点击事件（同步忽略）
              if (this.isProcessingClick) {
                  if (this.debug) {
                      console.log('[EventTrack Auto] 忽略失焦事件（正在处理点击事件）', {
                          targetElement: target.tagName,
                          targetElementClass: target.className
                      });
                  }
                  return;
              }
              // 如果最近有点击事件（任何元素），在时间窗口内完全忽略所有 blur 事件
              let ignoreTime = this.autoTrackConfig?.clickFocusBlurIgnoreTime || 500;
              // 如果点击的是按钮元素，延长忽略时间窗口（按钮点击后可能异步打开对话框等）
              if (this.recentClickInfo.element && this.isButtonElement(this.recentClickInfo.element)) {
                  ignoreTime = Math.max(ignoreTime, 1500); // 按钮点击后至少忽略 1.5 秒
              }
              const timeSinceClick = Date.now() - this.recentClickInfo.timestamp;
              if (timeSinceClick < ignoreTime && this.recentClickInfo.element) {
                  const clickedElement = this.recentClickInfo.element;
                  if (this.debug) {
                      console.log('[EventTrack Auto] 忽略失焦事件（由点击引起）', {
                          timeSinceClick,
                          ignoreTime,
                          clickedElement: clickedElement.tagName,
                          clickedElementClass: clickedElement.className,
                          targetElement: target.tagName,
                          targetElementClass: target.className
                      });
                  }
                  return;
              }
          }
          // 对于 Element Plus 组件，尝试从组件元素获取 data-track
          let trackElement = target;
          if (isElComponent) {
              // 查找最近的 el-select、el-input 等组件元素
              const elComponent = target.closest('.el-select, .el-input, .el-input-number, el-select, el-input, el-input-number');
              if (elComponent) {
                  trackElement = elComponent;
              }
          }
          // 优先使用 data-track 属性的值作为事件名称
          const defaultEventName = this.autoTrackConfig.blur || '输入框_失焦';
          const eventName = this.getEventName(trackElement, defaultEventName);
          const blurInfo = {
              element_tag: target.tagName.toLowerCase(),
              element_id: target.id || '',
              element_type: target.type || '',
              element_name: target.name || '',
              element_value: target.value ? target.value.substring(0, 50) : '',
              is_element_plus: isElComponent
          };
          // 添加事件类型标识
          blurInfo.event_type = 'blur';
          if (this.debug) {
              console.log('[EventTrack Auto] 输入框失焦', { eventName, blurInfo });
          }
          this.operate(eventName, blurInfo);
      }
      /**
       * 追踪鼠标悬停事件
       */
      trackMouseenter(event) {
          if (!this.autoTrackConfig?.trackMouseenter)
              return;
          const target = event.target;
          if (!target)
              return;
          // 优先使用 data-track 属性的值作为事件名称
          const defaultEventName = this.autoTrackConfig.mouseenter || '元素_鼠标悬停';
          const eventName = this.getEventName(target, defaultEventName);
          const mouseenterInfo = {
              element_tag: target.tagName.toLowerCase(),
              element_id: target.id || '',
              element_class: target.className || '',
              mouse_x: event.clientX,
              mouse_y: event.clientY
          };
          // 添加事件类型标识
          mouseenterInfo.event_type = 'mouseenter';
          if (this.debug) {
              console.log('[EventTrack Auto] 鼠标悬停', { eventName, mouseenterInfo });
          }
          this.operate(eventName, mouseenterInfo);
      }
      /**
       * 追踪鼠标离开事件
       */
      trackMouseleave(event) {
          if (!this.autoTrackConfig?.trackMouseleave)
              return;
          const target = event.target;
          if (!target)
              return;
          // 优先使用 data-track 属性的值作为事件名称
          const defaultEventName = this.autoTrackConfig.mouseleave || '元素_鼠标离开';
          const eventName = this.getEventName(target, defaultEventName);
          const mouseleaveInfo = {
              element_tag: target.tagName.toLowerCase(),
              element_id: target.id || '',
              element_class: target.className || ''
          };
          // 添加事件类型标识
          mouseleaveInfo.event_type = 'mouseleave';
          if (this.debug) {
              console.log('[EventTrack Auto] 鼠标离开', { eventName, mouseleaveInfo });
          }
          this.operate(eventName, mouseleaveInfo);
      }
      /**
       * 追踪输入框输入事件
       */
      trackInput(event) {
          if (!this.autoTrackConfig?.trackInput)
              return;
          const target = event.target;
          if (!target)
              return;
          // 如果配置了选择器，检查是否匹配
          if (this.autoTrackConfig.inputSelector) {
              if (!target.matches(this.autoTrackConfig.inputSelector)) {
                  return;
              }
          }
          // 优先使用 data-track 属性的值作为事件名称
          const defaultEventName = this.autoTrackConfig.input || '输入框_输入';
          const eventName = this.getEventName(target, defaultEventName);
          const inputInfo = {
              element_tag: target.tagName.toLowerCase(),
              element_id: target.id || '',
              element_type: target.type || '',
              element_name: target.name || '',
              value_length: target.value.length
          };
          // 添加事件类型标识
          inputInfo.event_type = 'input';
          if (this.debug) {
              console.log('[EventTrack Auto] 输入框输入', { eventName, inputInfo });
          }
          this.operate(eventName, inputInfo);
      }
      /**
       * 追踪键盘按键事件
       */
      trackKeydown(event) {
          if (!this.autoTrackConfig?.trackKeydown)
              return;
          const target = event.target;
          if (!target)
              return;
          // 优先使用 data-track 属性的值作为事件名称
          const defaultEventName = this.autoTrackConfig.keydown || '键盘_按键';
          const eventName = this.getEventName(target, defaultEventName);
          const keydownInfo = {
              element_tag: target.tagName.toLowerCase(),
              element_id: target.id || '',
              key: event.key,
              key_code: event.keyCode || event.code,
              ctrl_key: event.ctrlKey,
              shift_key: event.shiftKey,
              alt_key: event.altKey,
              meta_key: event.metaKey
          };
          // 添加事件类型标识
          keydownInfo.event_type = 'keydown';
          if (this.debug) {
              console.log('[EventTrack Auto] 键盘按键', { eventName, keydownInfo });
          }
          this.operate(eventName, keydownInfo);
      }
      /**
       * 追踪页面可见性变化事件
       */
      trackVisibilitychange() {
          if (!this.autoTrackConfig?.trackVisibilitychange)
              return;
          const eventName = this.autoTrackConfig.visibilitychange || '页面_可见性变化';
          const visibilityInfo = {
              visibility_state: typeof document !== 'undefined' ? document.visibilityState : 'unknown',
              hidden: typeof document !== 'undefined' ? document.hidden : false
          };
          // 添加事件类型标识
          visibilityInfo.event_type = 'visibilitychange';
          if (this.debug) {
              console.log('[EventTrack Auto] 页面可见性变化', { eventName, visibilityInfo });
          }
          this.operate(eventName, visibilityInfo);
      }
      /**
       * 追踪页面离开事件
       * 在页面卸载前计算并发送停留时长
       */
      trackPageUnload() {
          if (!this.autoTrackConfig?.trackPageUnload)
              return;
          const currentTime = Date.now();
          let stayTime = 0;
          // 计算当前页面的停留时长（秒）
          if (this.pageLoadTimestamp > 0) {
              stayTime = (currentTime - this.pageLoadTimestamp) / 1000;
          }
          const eventName = this.autoTrackConfig.pageUnload || '页面_离开';
          const attributes = {
              page_url: this.currentPageUrl || (typeof window !== 'undefined' ? window.location.href : ''),
              page_title: typeof document !== 'undefined' ? document.title : '',
              unload_time: currentTime,
              stay_time: stayTime.toFixed(2), // 停留时长（秒）
              event_type: 'pageUnload'
          };
          if (this.debug) {
              console.log('[EventTrack Auto] 页面离开', { eventName, attributes, stayTime });
          }
          // 使用 sendBeacon 发送数据，确保在页面卸载时也能成功发送
          // sendBeacon 是专门为页面卸载场景设计的 API
          try {
              // 确保设备哈希码已初始化
              if (!this.deviceHash) {
                  this.deviceHash = getOrCreateDeviceHash();
              }
              const data = {
                  event_key: 'view',
                  attributes: {
                      ...attributes,
                      ...this.globalConfig,
                      date: dayjs().format('YYYY-MM-DD')
                  }
              };
              // 添加设备哈希码（作为身份标识）
              if (this.deviceHash) {
                  data.attributes.device_hash = this.deviceHash;
                  data.attributes.deviceHash = this.deviceHash;
              }
              // 添加设备IP地址（如果已获取）
              if (this.deviceIP) {
                  data.attributes.device_ip = this.deviceIP;
                  data.attributes.deviceIp = this.deviceIP;
              }
              this.appendIdentityAttributes(data.attributes);
              // 构建请求 URL（包含 yard-report-key）
              const url = this.url;
              const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
              // 使用 sendBeacon 发送（同步、可靠）
              if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
                  navigator.sendBeacon(url, blob);
                  if (this.debug) {
                      console.log('[EventTrack Auto] 使用 sendBeacon 发送页面离开事件', { url, data });
                  }
              }
              else {
                  // 降级方案：使用同步 XMLHttpRequest
                  const xhr = new XMLHttpRequest();
                  xhr.open('POST', url, false); // false 表示同步请求
                  xhr.setRequestHeader('Content-Type', 'application/json');
                  xhr.send(JSON.stringify(data));
                  if (this.debug) {
                      console.log('[EventTrack Auto] 使用同步 XMLHttpRequest 发送页面离开事件', { url, data });
                  }
              }
          }
          catch (error) {
              console.error('[EventTrack Auto] 发送页面离开事件失败', error);
          }
      }
      /**
       * 追踪窗口大小变化事件
       */
      trackResize() {
          if (!this.autoTrackConfig?.trackResize)
              return;
          const eventName = this.autoTrackConfig.resize || '窗口_大小变化';
          const resizeInfo = {
              window_width: typeof window !== 'undefined' ? window.innerWidth : 0,
              window_height: typeof window !== 'undefined' ? window.innerHeight : 0,
              screen_width: typeof screen !== 'undefined' ? screen.width : 0,
              screen_height: typeof screen !== 'undefined' ? screen.height : 0
          };
          // 添加事件类型标识
          resizeInfo.event_type = 'resize';
          if (this.debug) {
              console.log('[EventTrack Auto] 窗口大小变化', { eventName, resizeInfo });
          }
          this.operate(eventName, resizeInfo);
      }
      /**
       * 设置路由监听
       * 支持 Vue Router、React Router、原生 History API、Hash 路由
       */
      setupRouteListener() {
          if (typeof window === 'undefined')
              return;
          try {
              // 如果传入了 router，优先使用框架路由
              if (this.router) {
                  // Vue Router 2/3/4
                  if (this.router.afterEach) {
                      this.routeChangeUnwatch = this.router.afterEach((to, from) => {
                          this.trackRouteChange(to, from);
                      });
                      return;
                  }
                  // Vue Router 1
                  else if (this.router.afterEach) {
                      this.router.afterEach((transition) => {
                          this.trackRouteChange(transition.to, transition.from);
                      });
                      return;
                  }
                  // React Router
                  else if (this.router.listen) {
                      this.routeChangeUnwatch = this.router.listen((location) => {
                          this.trackRouteChange(location.pathname);
                      });
                      return;
                  }
              }
              // 原生路由监听（适用于非 Vue/React 页面）
              // 记录当前路径，用于对比
              let currentPath = window.location.pathname + window.location.search;
              let currentHash = window.location.hash;
              // History API 路由监听
              if (window.history) {
                  const originalPushState = window.history.pushState.bind(window.history);
                  const originalReplaceState = window.history.replaceState.bind(window.history);
                  // 重写 pushState
                  window.history.pushState = (state, title, url) => {
                      originalPushState(state, title, url);
                      const newPath = window.location.pathname + window.location.search;
                      if (newPath !== currentPath) {
                          currentPath = newPath;
                          this.trackRouteChange(window.location.pathname, currentPath);
                      }
                  };
                  // 重写 replaceState
                  window.history.replaceState = (state, title, url) => {
                      originalReplaceState(state, title, url);
                      const newPath = window.location.pathname + window.location.search;
                      if (newPath !== currentPath) {
                          currentPath = newPath;
                          this.trackRouteChange(window.location.pathname, currentPath);
                      }
                  };
                  // 监听浏览器前进后退
                  const handlePopState = () => {
                      const newPath = window.location.pathname + window.location.search;
                      if (newPath !== currentPath) {
                          currentPath = newPath;
                          this.trackRouteChange(window.location.pathname, currentPath);
                      }
                  };
                  window.addEventListener('popstate', handlePopState);
                  // 保存清理函数
                  this.routeChangeUnwatch = () => {
                      window.removeEventListener('popstate', handlePopState);
                      window.history.pushState = originalPushState;
                      window.history.replaceState = originalReplaceState;
                  };
              }
              // Hash 路由监听（适用于 #/path 这种路由方式）
              // 首屏无 hash 时也必须注册 hashchange，否则 SPA 首次写入 #/... 时不会触发「路由_变动」
              const handleHashChange = () => {
                  const newHash = window.location.hash;
                  if (newHash !== currentHash) {
                      const fromHash = currentHash;
                      currentHash = newHash;
                      const hashPath = newHash.replace(/^#/, '') || '/';
                      const fromHashPath = fromHash.replace(/^#/, '') || '';
                      this.trackRouteChange(hashPath, fromHashPath);
                  }
              };
              window.addEventListener('hashchange', handleHashChange);
              const existingUnwatch = this.routeChangeUnwatch;
              this.routeChangeUnwatch = () => {
                  window.removeEventListener('hashchange', handleHashChange);
                  if (existingUnwatch) {
                      existingUnwatch();
                  }
              };
          }
          catch (error) {
              console.log('#EventTrack setupRouteListener error', error);
          }
      }
      /**
       * 设置 DOM 事件监听
       */
      setupDOMListeners() {
          if (typeof window === 'undefined' || typeof document === 'undefined')
              return;
          try {
              // 点击事件
              if (this.autoTrackConfig?.trackClick) {
                  const handler = (e) => this.trackClick(e);
                  document.addEventListener('click', handler, true);
                  this.domListeners.push({ element: document, event: 'click', handler });
              }
              // 双击事件
              if (this.autoTrackConfig?.trackDblclick) {
                  const handler = (e) => this.trackDblclick(e);
                  document.addEventListener('dblclick', handler, true);
                  this.domListeners.push({ element: document, event: 'dblclick', handler });
              }
              // 滚动事件（节流）
              if (this.autoTrackConfig?.trackScroll) {
                  const throttleTime = this.autoTrackConfig.scrollThrottle || 500;
                  this.scrollThrottleFunc = throttle(() => this.trackScroll(), throttleTime);
                  window.addEventListener('scroll', this.scrollThrottleFunc, true);
                  this.domListeners.push({ element: window, event: 'scroll', handler: this.scrollThrottleFunc });
              }
              // 表单提交事件
              if (this.autoTrackConfig?.trackSubmit) {
                  const handler = (e) => this.trackSubmit(e);
                  document.addEventListener('submit', handler, true);
                  this.domListeners.push({ element: document, event: 'submit', handler });
              }
              // 输入框聚焦事件
              if (this.autoTrackConfig?.trackFocus) {
                  const handler = (e) => this.trackFocus(e);
                  document.addEventListener('focus', handler, true);
                  this.domListeners.push({ element: document, event: 'focus', handler });
              }
              // 输入框失焦事件
              if (this.autoTrackConfig?.trackBlur) {
                  const handler = (e) => this.trackBlur(e);
                  document.addEventListener('blur', handler, true);
                  this.domListeners.push({ element: document, event: 'blur', handler });
              }
              // 鼠标悬停事件
              if (this.autoTrackConfig?.trackMouseenter) {
                  const handler = (e) => this.trackMouseenter(e);
                  document.addEventListener('mouseenter', handler, true);
                  this.domListeners.push({ element: document, event: 'mouseenter', handler });
              }
              // 鼠标离开事件
              if (this.autoTrackConfig?.trackMouseleave) {
                  const handler = (e) => this.trackMouseleave(e);
                  document.addEventListener('mouseleave', handler, true);
                  this.domListeners.push({ element: document, event: 'mouseleave', handler });
              }
              // 输入框输入事件（节流）
              if (this.autoTrackConfig?.trackInput) {
                  const throttleTime = this.autoTrackConfig.inputThrottle || 300;
                  this.inputThrottleFunc = throttle((e) => this.trackInput(e), throttleTime);
                  document.addEventListener('input', this.inputThrottleFunc, true);
                  this.domListeners.push({ element: document, event: 'input', handler: this.inputThrottleFunc });
              }
              // 键盘按键事件
              if (this.autoTrackConfig?.trackKeydown) {
                  const handler = (e) => this.trackKeydown(e);
                  document.addEventListener('keydown', handler, true);
                  this.domListeners.push({ element: document, event: 'keydown', handler });
              }
              // 页面可见性变化事件
              if (this.autoTrackConfig?.trackVisibilitychange) {
                  const handler = () => this.trackVisibilitychange();
                  document.addEventListener('visibilitychange', handler);
                  this.domListeners.push({ element: document, event: 'visibilitychange', handler });
              }
              // 窗口大小变化事件（节流）
              if (this.autoTrackConfig?.trackResize) {
                  const throttleTime = this.autoTrackConfig.resizeThrottle || 300;
                  this.resizeThrottleFunc = throttle(() => this.trackResize(), throttleTime);
                  window.addEventListener('resize', this.resizeThrottleFunc);
                  this.domListeners.push({ element: window, event: 'resize', handler: this.resizeThrottleFunc });
              }
              // 页面离开事件（beforeunload 和 pagehide）
              if (this.autoTrackConfig?.trackPageUnload) {
                  // beforeunload 事件（页面卸载前）
                  const beforeUnloadHandler = () => {
                      this.trackPageUnload();
                  };
                  window.addEventListener('beforeunload', beforeUnloadHandler);
                  this.domListeners.push({ element: window, event: 'beforeunload', handler: beforeUnloadHandler });
                  // pagehide 事件（页面隐藏时，更可靠）
                  const pageHideHandler = () => {
                      this.trackPageUnload();
                  };
                  window.addEventListener('pagehide', pageHideHandler);
                  this.domListeners.push({ element: window, event: 'pagehide', handler: pageHideHandler });
              }
          }
          catch (error) {
              console.log('#EventTrack setupDOMListeners error', error);
          }
      }
      /**
       * 追踪接口请求
       */
      trackRequest(url, method, status, statusText, responseTime) {
          if (!this.autoTrackConfig?.trackRequest)
              return;
          // 防止死循环：忽略埋点接口本身的请求
          if (url && typeof url === 'string' && typeof window !== 'undefined') {
              try {
                  const baseUrl = window.location?.origin || '';
                  const urlObj = new URL(url, baseUrl);
                  const pathname = urlObj.pathname.toLowerCase();
                  // 如果是埋点接口，不追踪（避免死循环）
                  if (pathname.includes('/api/report/report-yard-event') || pathname.includes('/report/report-yard-event')) {
                      return;
                  }
              }
              catch (e) {
                  // URL 解析失败，检查字符串是否包含埋点接口路径
                  if (url.toLowerCase().includes('report-yard-event')) {
                      return;
                  }
              }
          }
          else if (url && typeof url === 'string') {
              // 非浏览器环境，直接检查字符串
              if (url.toLowerCase().includes('report-yard-event')) {
                  return;
              }
          }
          // 如果配置了过滤函数，检查是否需要追踪
          if (this.autoTrackConfig.requestFilter) {
              if (!this.autoTrackConfig.requestFilter(url, method)) {
                  return;
              }
          }
          const eventName = this.autoTrackConfig.request || '接口_请求';
          const requestInfo = {
              request_url: url,
              request_method: method.toUpperCase(),
              request_time: Date.now()
          };
          // 确保状态码和耗时总是被记录（如果未提供，使用默认值）
          requestInfo.response_status = status !== undefined ? status : 0;
          requestInfo.response_status_text = statusText || (status !== undefined ? `HTTP ${status}` : 'Unknown');
          requestInfo.response_time = responseTime !== undefined ? responseTime : 0;
          // 提取 URL 路径（去除查询参数）
          try {
              if (typeof window !== 'undefined' && window.location) {
                  const baseUrl = window.location.origin || '';
                  const urlObj = new URL(url, baseUrl);
                  requestInfo.request_path = urlObj.pathname;
                  requestInfo.request_query = urlObj.search;
              }
              else {
                  // 非浏览器环境，尝试解析相对 URL
                  const urlObj = new URL(url, 'http://localhost');
                  requestInfo.request_path = urlObj.pathname;
                  requestInfo.request_query = urlObj.search;
              }
          }
          catch (e) {
              // 如果 URL 解析失败，使用原始 URL
              requestInfo.request_path = url;
          }
          // 添加事件类型标识
          requestInfo.event_type = 'request';
          if (this.debug) {
              console.log('[EventTrack Auto] 接口请求', { eventName, requestInfo });
          }
          this.operate(eventName, requestInfo);
      }
      /**
       * 追踪错误事件
       */
      trackError(errorInfo) {
          if (!this.autoTrackConfig?.trackError)
              return;
          const eventName = this.autoTrackConfig.error || '页面_错误';
          if (this.debug) {
              console.log('[EventTrack Auto] 错误追踪', { eventName, errorInfo });
          }
          // 使用 operate 类型记录错误
          this.operate(eventName, errorInfo);
      }
      /**
       * 设置错误监听器
       */
      setupErrorListeners() {
          if (typeof window === 'undefined')
              return;
          if (!this.autoTrackConfig?.trackError)
              return;
          try {
              const self = this;
              // 1. 监听全局 JS 错误和资源加载错误
              const errorHandler = (event) => {
                  const errorInfo = {
                      error_type: 'error',
                      error_message: event.message || 'Unknown error',
                      error_source: event.filename || '',
                      error_line: event.lineno || 0,
                      error_column: event.colno || 0,
                      page_url: window.location.href,
                      user_agent: navigator.userAgent || ''
                  };
                  // 如果是资源加载错误（图片、脚本、样式表等）
                  if (event.target && event.target.tagName) {
                      const target = event.target;
                      errorInfo.resource_type = target.tagName.toLowerCase();
                      errorInfo.resource_url = target.src || target.href || target.src || '';
                      errorInfo.error_type = 'resource_error';
                      errorInfo.error_message = `资源加载失败: ${errorInfo.resource_type} - ${errorInfo.resource_url}`;
                  }
                  else if (event.error) {
                      // JS 错误
                      errorInfo.error_type = 'js_error';
                      errorInfo.error_message = event.error.message || event.message || 'Unknown error';
                      errorInfo.error_stack = event.error.stack || '';
                  }
                  self.trackError(errorInfo);
              };
              window.addEventListener('error', errorHandler, true);
              this.errorListeners.push({ type: 'error', handler: errorHandler });
              // 2. 监听 Promise 未捕获的错误
              const unhandledRejectionHandler = (event) => {
                  const errorInfo = {
                      error_type: 'promise_rejection',
                      error_message: '',
                      page_url: window.location.href,
                      user_agent: navigator.userAgent || ''
                  };
                  if (event.reason) {
                      if (typeof event.reason === 'string') {
                          errorInfo.error_message = event.reason;
                      }
                      else if (event.reason instanceof Error) {
                          errorInfo.error_message = event.reason.message || 'Unhandled Promise Rejection';
                          errorInfo.error_stack = event.reason.stack || '';
                      }
                      else {
                          errorInfo.error_message = JSON.stringify(event.reason);
                      }
                  }
                  else {
                      errorInfo.error_message = 'Unhandled Promise Rejection';
                  }
                  self.trackError(errorInfo);
              };
              window.addEventListener('unhandledrejection', unhandledRejectionHandler);
              this.errorListeners.push({ type: 'unhandledrejection', handler: unhandledRejectionHandler });
              // 3. 监听控制台错误（如果启用）
              if (this.autoTrackConfig.trackConsoleError) {
                  this.originalConsoleError = console.error;
                  const consoleErrorHandler = (...args) => {
                      // 先调用原始的 console.error
                      if (this.originalConsoleError) {
                          this.originalConsoleError.apply(console, args);
                      }
                      // 记录到埋点系统
                      const errorInfo = {
                          error_type: 'console_error',
                          error_message: args.map(arg => {
                              if (typeof arg === 'string')
                                  return arg;
                              if (arg instanceof Error)
                                  return arg.message;
                              try {
                                  return JSON.stringify(arg);
                              }
                              catch {
                                  return String(arg);
                              }
                          }).join(' '),
                          page_url: window.location.href,
                          user_agent: navigator.userAgent || ''
                      };
                      // 如果有 Error 对象，提取堆栈信息
                      const errorObj = args.find(arg => arg instanceof Error);
                      if (errorObj) {
                          errorInfo.error_stack = errorObj.stack || '';
                      }
                      self.trackError(errorInfo);
                  };
                  console.error = consoleErrorHandler;
                  this.errorListeners.push({ type: 'console_error', handler: consoleErrorHandler });
              }
          }
          catch (error) {
              console.log('#EventTrack setupErrorListeners error', error);
          }
      }
      /**
       * 设置请求拦截器（拦截 fetch 和 XMLHttpRequest）
       */
      setupRequestInterceptor() {
          if (typeof window === 'undefined')
              return;
          try {
              // 拦截 fetch
              if (window.fetch) {
                  const originalFetch = window.fetch;
                  const self = this;
                  window.fetch = function (...args) {
                      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
                      const method = (args[1]?.method || 'GET').toUpperCase();
                      const startTime = Date.now();
                      // 调用原始 fetch
                      return originalFetch.apply(this, args)
                          .then((response) => {
                          const responseTime = Date.now() - startTime;
                          // 追踪请求完成（包含状态码和耗时）
                          self.trackRequest(url, method, response.status, response.statusText, responseTime);
                          return response;
                      })
                          .catch((error) => {
                          const responseTime = Date.now() - startTime;
                          // 追踪请求失败（包含状态码和耗时）
                          self.trackRequest(url, method, 0, error.message || 'Request failed', responseTime);
                          throw error;
                      });
                  };
              }
              // 拦截 XMLHttpRequest
              if (window.XMLHttpRequest) {
                  const originalOpen = XMLHttpRequest.prototype.open;
                  const originalSend = XMLHttpRequest.prototype.send;
                  const self = this;
                  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
                      this._trackingUrl = typeof url === 'string' ? url : url.toString();
                      this._trackingMethod = method.toUpperCase();
                      this._trackingStartTime = Date.now();
                      return originalOpen.apply(this, [method, url, ...rest]);
                  };
                  XMLHttpRequest.prototype.send = function (body) {
                      const url = this._trackingUrl;
                      const method = this._trackingMethod;
                      const startTime = this._trackingStartTime;
                      if (url && method) {
                          // 监听请求完成（loadend 事件会在所有情况下触发，包括成功、错误、超时、取消）
                          this.addEventListener('loadend', function () {
                              const responseTime = Date.now() - startTime;
                              const status = this.status;
                              const statusText = this.statusText;
                              // 追踪请求完成（包含状态码和耗时）
                              self.trackRequest(url, method, status, statusText, responseTime);
                          });
                          // 监听请求错误（网络错误）
                          this.addEventListener('error', function () {
                              const responseTime = Date.now() - startTime;
                              // 追踪请求失败（包含状态码和耗时）
                              self.trackRequest(url, method, 0, 'Network Error', responseTime);
                          });
                          // 监听请求超时
                          this.addEventListener('timeout', function () {
                              const responseTime = Date.now() - startTime;
                              // 追踪请求超时（包含状态码和耗时）
                              self.trackRequest(url, method, 408, 'Request Timeout', responseTime);
                          });
                          // 监听请求取消
                          this.addEventListener('abort', function () {
                              const responseTime = Date.now() - startTime;
                              // 追踪请求取消（包含状态码和耗时）
                              self.trackRequest(url, method, 0, 'Request Aborted', responseTime);
                          });
                      }
                      return originalSend.call(this, body);
                  };
              }
          }
          catch (error) {
              console.log('#EventTrack setupRequestInterceptor error', error);
          }
      }
      /**
       * 移除所有监听器
       */
      removeListeners() {
          // 移除路由监听
          if (this.routeChangeUnwatch) {
              this.routeChangeUnwatch();
              this.routeChangeUnwatch = null;
          }
          // 移除所有 DOM 事件监听
          this.domListeners.forEach(({ element, event, handler }) => {
              try {
                  element.removeEventListener(event, handler, true);
              }
              catch (e) {
                  // 某些事件可能不支持 capture 模式
                  try {
                      element.removeEventListener(event, handler);
                  }
                  catch (e2) {
                      console.log('#EventTrack removeEventListener error', event, e2);
                  }
              }
          });
          this.domListeners = [];
          // 移除错误监听器
          this.errorListeners.forEach(({ type, handler }) => {
              try {
                  if (type === 'error' || type === 'unhandledrejection') {
                      window.removeEventListener(type, handler, true);
                  }
                  else if (type === 'console_error' && this.originalConsoleError) {
                      // 恢复原始的 console.error
                      console.error = this.originalConsoleError;
                  }
              }
              catch (e) {
                  console.log('#EventTrack removeErrorListener error', type, e);
              }
          });
          this.errorListeners = [];
          this.originalConsoleError = null;
          // 清理节流函数引用
          this.scrollThrottleFunc = null;
          this.inputThrottleFunc = null;
          this.resizeThrottleFunc = null;
      }
      /**
       * 初始化
       */
      init(config = {}) {
          try {
              const { isProd: configIsProd, yardKeyTest: configYardKeyTest, yardKeyProd: configYardKeyProd, globalConfig = {}, autoTrack, router, debug = false, autoInit = true, setUsername, setRealname } = config;
              // 仅当调用方显式传入 setUsername / setRealname 时才更新，避免底部「自动 init」覆盖业务侧已配置的回调
              if ('setUsername' in config) {
                  this.setUsernameFn = typeof setUsername === 'function' ? setUsername : null;
              }
              if ('setRealname' in config) {
                  this.setRealnameFn = typeof setRealname === 'function' ? setRealname : null;
              }
              // 设置调试模式
              this.debug = debug;
              // 打印版本号（始终输出，便于检查是否是最新版本）
              console.log(`[EventTrack] 事件追踪库已加载 | 版本: ${VERSION} | 库名: @zecharich/Tracking${debug ? ' | 调试模式: 已开启' : ''}`);
              // 自动模式：从 cookies 读取配置
              let yardKeyTest = configYardKeyTest;
              let yardKeyProd = configYardKeyProd;
              let isProd = configIsProd;
              if (autoInit || (!configYardKeyTest && !configYardKeyProd)) {
                  // 尝试从 cookies 读取
                  const cookieYardKeyTest = getCookie('yardKeyTest');
                  const cookieYardKeyProd = getCookie('yardKeyProd');
                  if (cookieYardKeyTest) {
                      yardKeyTest = cookieYardKeyTest;
                      if (debug) {
                          console.log('[EventTrack] 从 cookies 读取 yardKeyTest:', yardKeyTest);
                      }
                  }
                  if (cookieYardKeyProd) {
                      yardKeyProd = cookieYardKeyProd;
                      if (debug) {
                          console.log('[EventTrack] 从 cookies 读取 yardKeyProd:', yardKeyProd);
                      }
                  }
                  // 自动判断环境
                  if (isProd === undefined) {
                      isProd = !detectEnvironment();
                      if (debug) {
                          console.log('[EventTrack] 自动判断环境:', isProd ? '正式环境' : '测试环境');
                      }
                  }
              }
              // 验证必要的配置
              if (!yardKeyTest && !yardKeyProd) {
                  console.warn('[EventTrack] 警告: 未找到 yardKeyTest 或 yardKeyProd，请确保已设置 cookies 或传入配置');
                  return;
              }
              // 根据环境选择密钥
              const yardKey = isProd ? yardKeyProd : yardKeyTest;
              if (!yardKey) {
                  console.warn(`[EventTrack] 警告: 未找到 ${isProd ? 'yardKeyProd' : 'yardKeyTest'}，埋点功能可能无法正常工作`);
                  return;
              }
              // 保存 yardKey 到实例，用于调试
              this._currentYardKey = yardKey;
              // 初始化设备哈希码和IP地址（在打开监控系统时自动注入）
              this.deviceHash = getOrCreateDeviceHash();
              // 异步获取IP地址
              getDeviceIP().then(ip => {
                  this.deviceIP = ip;
                  if (debug && ip) {
                      console.log('[EventTrack] 设备IP地址:', ip);
                  }
              }).catch(() => {
                  // IP获取失败，不影响埋点功能
              });
              if (debug) {
                  console.log('[EventTrack] 设备哈希码:', this.deviceHash);
              }
              // 构建埋点 URL，确保查询参数正确传递
              const baseUrl = isProd
                  ? 'https://zechariah.leqeegroup.com/api/report/report-yard-event'
                  : 'https://zechariah.test.leqeegroup.com/api/report/report-yard-event';
              // 使用 URLSearchParams 确保查询参数正确传递（浏览器环境）
              if (typeof URL !== 'undefined' && typeof URLSearchParams !== 'undefined') {
                  try {
                      const urlObj = new URL(baseUrl);
                      urlObj.searchParams.set('yard-report-key', yardKey); // URLSearchParams 会自动处理编码
                      this.url = urlObj.toString();
                  }
                  catch (e) {
                      // URL 构造失败，使用手动拼接方式
                      const encodedYardKey = encodeURIComponent(yardKey);
                      this.url = `${baseUrl}?yard-report-key=${encodedYardKey}`;
                  }
              }
              else {
                  // 非浏览器环境，使用手动拼接方式
                  const encodedYardKey = encodeURIComponent(yardKey);
                  this.url = `${baseUrl}?yard-report-key=${encodedYardKey}`;
              }
              if (debug) {
                  console.log('[EventTrack] 构建的埋点 URL:', this.url);
                  console.log('[EventTrack] yard-report-key 值:', yardKey);
                  console.log('[EventTrack] 环境:', isProd ? '正式环境' : '测试环境');
                  // 验证 URL 中的查询参数
                  try {
                      const urlObj = new URL(this.url);
                      const paramValue = urlObj.searchParams.get('yard-report-key');
                      console.log('[EventTrack] URL 中的 yard-report-key 参数值:', paramValue);
                      if (paramValue !== yardKey) {
                          console.warn('[EventTrack] 警告: URL 中的参数值与原始值不一致！', {
                              original: yardKey,
                              inUrl: paramValue
                          });
                      }
                  }
                  catch (e) {
                      console.warn('[EventTrack] 无法解析 URL 验证参数:', e);
                  }
              }
              this.globalConfig = globalConfig;
              this.router = router;
              // 设置自动追踪配置
              // 如果启用了自动初始化或传入了 autoTrack，则设置自动追踪
              const shouldAutoTrack = autoInit || autoTrack;
              if (shouldAutoTrack) {
                  this.autoTrackConfig = {
                      enabled: true,
                      trackPageLoad: true,
                      trackRouteChange: true,
                      trackPageUnload: true, // 启用页面离开追踪，用于计算停留时长
                      trackClick: true,
                      // clickSelector 不设置默认值，记录所有点击事件（包括按钮和节点）
                      ignoreFocusBlurOnClick: true, // 启用点击去重
                      clickFocusBlurIgnoreTime: 500,
                      trackDblclick: false,
                      trackScroll: true,
                      trackSubmit: false,
                      trackFocus: false,
                      trackBlur: false,
                      trackMouseenter: false,
                      trackMouseleave: false,
                      trackInput: false,
                      trackKeydown: true,
                      trackVisibilitychange: true,
                      trackResize: true,
                      trackRequest: true, // 默认启用请求追踪
                      trackError: true, // 默认启用错误追踪
                      trackConsoleError: true, // 默认启用控制台错误追踪
                      scrollThrottle: 500,
                      inputThrottle: 300,
                      resizeThrottle: 300,
                      pageLoad: '页面_加载完成',
                      routeChange: '路由_变动',
                      pageUnload: '页面_离开',
                      click: '页面_点击',
                      request: '接口_请求',
                      dblclick: '页面_双击',
                      scroll: '页面_滚动',
                      submit: '表单_提交',
                      focus: '输入框_聚焦',
                      blur: '输入框_失焦',
                      mouseenter: '元素_鼠标悬停',
                      mouseleave: '元素_鼠标离开',
                      input: '输入框_输入',
                      keydown: '键盘_按键',
                      visibilitychange: '页面_可见性变化',
                      resize: '窗口_大小变化',
                      error: '页面_错误',
                      ...autoTrack
                  };
                  // 强制开启：页面离开与路由变动上报为平均访问时长等指标所必需，不受用户配置覆盖
                  this.autoTrackConfig.trackPageUnload = true;
                  this.autoTrackConfig.trackRouteChange = true;
                  // 如果启用了自动追踪
                  if (this.autoTrackConfig.enabled) {
                      // 移除旧的监听器
                      this.removeListeners();
                      // 设置路由监听
                      if (this.autoTrackConfig.trackRouteChange) {
                          this.setupRouteListener();
                      }
                      // 设置 DOM 事件监听
                      this.setupDOMListeners();
                      // 设置错误监听器
                      if (this.autoTrackConfig.trackError) {
                          this.setupErrorListeners();
                      }
                      // 设置请求拦截器
                      if (this.autoTrackConfig.trackRequest) {
                          this.setupRequestInterceptor();
                      }
                      // 追踪页面加载
                      if (this.autoTrackConfig.trackPageLoad) {
                          if (typeof document !== 'undefined' && document.readyState === 'complete') {
                              this.trackPageLoad();
                          }
                          else if (typeof window !== 'undefined') {
                              window.addEventListener('load', () => this.trackPageLoad());
                          }
                      }
                  }
              }
              this.isInitialized = true;
          }
          catch (error) {
              console.log('#EventTrack init error', this, error);
          }
      }
      /**
       * 更新全局属性
       */
      updateGlobalConfig(config) {
          Object.assign(this.globalConfig, config);
      }
      /**
       * 在登录完成或 Cookie 就绪后再设置身份解析函数（无需再次 init 全量配置）。
       * 传 `null` 可清除对应回调。
       */
      setUserIdentity(options) {
          if (Object.prototype.hasOwnProperty.call(options, 'setUsername')) {
              const fn = options.setUsername;
              this.setUsernameFn = typeof fn === 'function' ? fn : null;
          }
          if (Object.prototype.hasOwnProperty.call(options, 'setRealname')) {
              const fn = options.setRealname;
              this.setRealnameFn = typeof fn === 'function' ? fn : null;
          }
          if (this.debug) {
              console.log('[EventTrack] setUserIdentity 已更新', {
                  hasSetUsername: !!this.setUsernameFn,
                  hasSetRealname: !!this.setRealnameFn
              });
          }
      }
      /**
       * 启用/禁用自动追踪
       */
      setAutoTrack(enabled) {
          if (this.autoTrackConfig) {
              this.autoTrackConfig.enabled = enabled;
              if (enabled) {
                  this.setupRouteListener();
                  this.setupDOMListeners();
                  if (this.autoTrackConfig.trackError) {
                      this.setupErrorListeners();
                  }
              }
              else {
                  this.removeListeners();
              }
          }
      }
      /**
       * 通用记录方法（默认 operate）
       */
      record(params, extraParam) {
          try {
              let event = 'operate';
              if (typeof params === 'object') {
                  event = params.event || 'operate';
                  delete params.event;
              }
              else if (typeof extraParam === 'object' && extraParam) {
                  event = extraParam.event || 'operate';
                  delete extraParam.event;
              }
              this.handleRecord(event, params, extraParam);
          }
          catch (error) {
              console.log('#EventTrack record error', this, error);
          }
      }
      /**
       * 追踪查看类型事件
       */
      view(params, extraParam) {
          this.handleRecord('view', params, extraParam);
      }
      /**
       * 追踪成功类型事件
       */
      success(params, extraParam) {
          this.handleRecord('success', params, extraParam);
      }
      /**
       * 追踪操作类型事件
       */
      operate(params, extraParam) {
          this.handleRecord('operate', params, extraParam);
      }
  }
  /**
   * 绑定方法到上下文
   */
  const bind = (fn, thisArg) => {
      return function (...args) {
          return fn.apply(thisArg, args);
      };
  };
  const createEventTracking = () => {
      const context = new EventTrack();
      const instance = bind(EventTrack.prototype.record, context);
      // 绑定所有方法到实例
      const methods = Object.getOwnPropertyNames(EventTrack.prototype).filter((i) => i !== 'constructor' && i !== 'handleRecord' && !i.startsWith('track') && i !== 'setupRouteListener' && i !== 'setupDOMListeners' && i !== 'removeListeners');
      for (const key of methods) {
          instance[key] = bind(EventTrack.prototype[key], context);
      }
      return instance;
  };
  const eventTrack = createEventTracking();
  // 导出版本号，便于外部访问（已在文件顶部定义并导出）
  /**
   * 自动初始化（仅在浏览器环境中执行）
   * 如果检测到 cookies 中有 yardKeyTest 或 yardKeyProd，则自动初始化
   */
  if (typeof window !== 'undefined') {
      // 等待 DOM 加载完成
      const autoInit = () => {
          const yardKeyTest = getCookie('yardKeyTest');
          const yardKeyProd = getCookie('yardKeyProd');
          // 如果 cookies 中有配置，自动初始化
          if (yardKeyTest || yardKeyProd) {
              eventTrack.init({
                  autoInit: true,
                  debug: false // 默认开启调试模式
              });
          }
      };
      // 如果 DOM 已经加载完成，立即执行
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
          // 延迟执行，确保其他脚本已加载
          setTimeout(autoInit, 100);
      }
      else {
          // 等待 DOM 加载完成
          document.addEventListener('DOMContentLoaded', () => {
              setTimeout(autoInit, 100);
          });
      }
  }

  exports.VERSION = VERSION;
  exports.default = eventTrack;
  exports.eventTrack = eventTrack;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.js.map
