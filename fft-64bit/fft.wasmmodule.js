
var createModule = (function () {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;

  return (
    function (createModule) {
      createModule = createModule || {};



      // The Module object: Our interface to the outside world. We import
      // and export values on it. There are various ways Module can be used:
      // 1. Not defined. We create it here
      // 2. A function parameter, function(Module) { ..generated code.. }
      // 3. pre-run appended it, var Module = {}; ..generated code..
      // 4. External script tag defines var Module.
      // We need to check if Module already exists (e.g. case 3 above).
      // Substitution will be replaced with actual code on later stage of the build,
      // this way Closure Compiler will not mangle it (e.g. case 4. above).
      // Note that if you want to run closure, and also to use Module
      // after the generated code, you will need to define   var Module = {};
      // before the code. Then that object will be used in the code, and you
      // can continue to use Module afterwards as well.
      var Module = typeof createModule !== 'undefined' ? createModule : {};

      // Set up the promise that indicates the Module is initialized
      var readyPromiseResolve, readyPromiseReject;
      Module['ready'] = new Promise(function (resolve, reject) {
        readyPromiseResolve = resolve;
        readyPromiseReject = reject;
      });

      // --pre-jses are emitted after the Module integration code, so that they can
      // refer to Module (if they choose; they can also define Module)
      // {{PRE_JSES}}

      // Sometimes an existing Module object exists with properties
      // meant to overwrite the default module functionality. Here
      // we collect those properties and reapply _after_ we configure
      // the current environment's defaults to avoid having to be so
      // defensive during initialization.
      var moduleOverrides = {};
      var key;
      for (key in Module) {
        if (Module.hasOwnProperty(key)) {
          moduleOverrides[key] = Module[key];
        }
      }

      var arguments_ = [];
      var thisProgram = './this.program';
      var quit_ = function (status, toThrow) {
        throw toThrow;
      };

      // Determine the runtime environment we are in. You can customize this by
      // setting the ENVIRONMENT setting at compile time (see settings.js).

      var ENVIRONMENT_IS_WEB = false;
      var ENVIRONMENT_IS_WORKER = true;
      var ENVIRONMENT_IS_NODE = false;
      var ENVIRONMENT_IS_SHELL = false;

      // `/` should be present at the end if `scriptDirectory` is not empty
      var scriptDirectory = '';
      function locateFile(path) {
        if (Module['locateFile']) {
          return Module['locateFile'](path, scriptDirectory);
        }
        return scriptDirectory + path;
      }

      // Hooks that are implemented differently in different runtime environments.
      var read_,
        readAsync,
        readBinary,
        setWindowTitle;

      // Note that this includes Node.js workers when relevant (pthreads is enabled).
      // Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
      // ENVIRONMENT_IS_NODE.
      if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
        if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
          scriptDirectory = self.location.href;
        } else if (typeof document !== 'undefined' && document.currentScript) { // web
          scriptDirectory = document.currentScript.src;
        }
        // When MODULARIZE, this JS may be executed later, after document.currentScript
        // is gone, so we saved it, and we use it here instead of any other info.
        if (_scriptDir) {
          scriptDirectory = _scriptDir;
        }
        // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
        // otherwise, slice off the final part of the url to find the script directory.
        // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
        // and scriptDirectory will correctly be replaced with an empty string.
        if (scriptDirectory.indexOf('blob:') !== 0) {
          scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf('/') + 1);
        } else {
          scriptDirectory = '';
        }

        // Differentiate the Web Worker from the Node Worker case, as reading must
        // be done differently.
        {

          // include: web_or_worker_shell_read.js


          read_ = function (url) {
            try {
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              xhr.send(null);
              return xhr.responseText;
            } catch (err) {
              var data = tryParseAsDataURI(url);
              if (data) {
                return intArrayToString(data);
              }
              throw err;
            }
          };

          if (ENVIRONMENT_IS_WORKER) {
            readBinary = function (url) {
              try {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                xhr.responseType = 'arraybuffer';
                xhr.send(null);
                return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
              } catch (err) {
                var data = tryParseAsDataURI(url);
                if (data) {
                  return data;
                }
                throw err;
              }
            };
          }

          readAsync = function (url, onload, onerror) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function () {
              if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
                onload(xhr.response);
                return;
              }
              var data = tryParseAsDataURI(url);
              if (data) {
                onload(data.buffer);
                return;
              }
              onerror();
            };
            xhr.onerror = onerror;
            xhr.send(null);
          };

          // end include: web_or_worker_shell_read.js
        }

        setWindowTitle = function (title) {document.title = title};
      } else {
      }

      // Set up the out() and err() hooks, which are how we can print to stdout or
      // stderr, respectively.
      var out = Module['print'] || console.log.bind(console);
      var err = Module['printErr'] || console.warn.bind(console);

      // Merge back in the overrides
      for (key in moduleOverrides) {
        if (moduleOverrides.hasOwnProperty(key)) {
          Module[key] = moduleOverrides[key];
        }
      }
      // Free the object hierarchy contained in the overrides, this lets the GC
      // reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
      moduleOverrides = null;

      // Emit code to handle expected values on the Module object. This applies Module.x
      // to the proper local x. This has two benefits: first, we only emit it if it is
      // expected to arrive, and second, by using a local everywhere else that can be
      // minified.

      if (Module['arguments']) arguments_ = Module['arguments'];

      if (Module['thisProgram']) thisProgram = Module['thisProgram'];

      if (Module['quit']) quit_ = Module['quit'];

      // perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message




      var STACK_ALIGN = 16;

      function alignMemory(size, factor) {
        if (!factor) factor = STACK_ALIGN; // stack alignment (16-byte) by default
        return Math.ceil(size / factor) * factor;
      }

      function getNativeTypeSize(type) {
        switch (type) {
          case 'i1': case 'i8': return 1;
          case 'i16': return 2;
          case 'i32': return 4;
          case 'i64': return 8;
          case 'float': return 4;
          case 'double': return 8;
          default: {
            if (type[type.length - 1] === '*') {
              return 4; // A pointer
            } else if (type[0] === 'i') {
              var bits = Number(type.substr(1));
              assert(bits % 8 === 0, 'getNativeTypeSize invalid bits ' + bits + ', type ' + type);
              return bits / 8;
            } else {
              return 0;
            }
          }
        }
      }

      function warnOnce(text) {
        if (!warnOnce.shown) warnOnce.shown = {};
        if (!warnOnce.shown[text]) {
          warnOnce.shown[text] = 1;
          err(text);
        }
      }

      // include: runtime_functions.js


      // Wraps a JS function as a wasm function with a given signature.
      function convertJsFunctionToWasm(func, sig) {

        // If the type reflection proposal is available, use the new
        // "WebAssembly.Function" constructor.
        // Otherwise, construct a minimal wasm module importing the JS function and
        // re-exporting it.
        if (typeof WebAssembly.Function === "function") {
          var typeNames = {
            'i': 'i32',
            'j': 'i64',
            'f': 'f32',
            'd': 'f64'
          };
          var type = {
            parameters: [],
            results: sig[0] == 'v' ? [] : [typeNames[sig[0]]]
          };
          for (var i = 1;i < sig.length;++i) {
            type.parameters.push(typeNames[sig[i]]);
          }
          return new WebAssembly.Function(type, func);
        }

        // The module is static, with the exception of the type section, which is
        // generated based on the signature passed in.
        var typeSection = [
          0x01, // id: section,
          0x00, // length: 0 (placeholder)
          0x01, // count: 1
          0x60, // form: func
        ];
        var sigRet = sig.slice(0, 1);
        var sigParam = sig.slice(1);
        var typeCodes = {
          'i': 0x7f, // i32
          'j': 0x7e, // i64
          'f': 0x7d, // f32
          'd': 0x7c, // f64
        };

        // Parameters, length + signatures
        typeSection.push(sigParam.length);
        for (var i = 0;i < sigParam.length;++i) {
          typeSection.push(typeCodes[sigParam[i]]);
        }

        // Return values, length + signatures
        // With no multi-return in MVP, either 0 (void) or 1 (anything else)
        if (sigRet == 'v') {
          typeSection.push(0x00);
        } else {
          typeSection = typeSection.concat([0x01, typeCodes[sigRet]]);
        }

        // Write the overall length of the type section back into the section header
        // (excepting the 2 bytes for the section id and length)
        typeSection[1] = typeSection.length - 2;

        // Rest of the module is static
        var bytes = new Uint8Array([
          0x00, 0x61, 0x73, 0x6d, // magic ("\0asm")
          0x01, 0x00, 0x00, 0x00, // version: 1
        ].concat(typeSection, [
          0x02, 0x07, // import section
          // (import "e" "f" (func 0 (type 0)))
          0x01, 0x01, 0x65, 0x01, 0x66, 0x00, 0x00,
          0x07, 0x05, // export section
          // (export "f" (func 0 (type 0)))
          0x01, 0x01, 0x66, 0x00, 0x00,
        ]));

        // We can compile this wasm module synchronously because it is very small.
        // This accepts an import (at "e.f"), that it reroutes to an export (at "f")
        var module = new WebAssembly.Module(bytes);
        var instance = new WebAssembly.Instance(module, {
          'e': {
            'f': func
          }
        });
        var wrappedFunc = instance.exports['f'];
        return wrappedFunc;
      }

      var freeTableIndexes = [];

      // Weak map of functions in the table to their indexes, created on first use.
      var functionsInTableMap;

      function getEmptyTableSlot() {
        // Reuse a free index if there is one, otherwise grow.
        if (freeTableIndexes.length) {
          return freeTableIndexes.pop();
        }
        // Grow the table
        try {
          wasmTable.grow(1);
        } catch (err) {
          if (!(err instanceof RangeError)) {
            throw err;
          }
          throw 'Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.';
        }
        return wasmTable.length - 1;
      }

      // Add a wasm function to the table.
      function addFunctionWasm(func, sig) {
        // Check if the function is already in the table, to ensure each function
        // gets a unique index. First, create the map if this is the first use.
        if (!functionsInTableMap) {
          functionsInTableMap = new WeakMap();
          for (var i = 0;i < wasmTable.length;i++) {
            var item = wasmTable.get(i);
            // Ignore null values.
            if (item) {
              functionsInTableMap.set(item, i);
            }
          }
        }
        if (functionsInTableMap.has(func)) {
          return functionsInTableMap.get(func);
        }

        // It's not in the table, add it now.

        var ret = getEmptyTableSlot();

        // Set the new value.
        try {
          // Attempting to call this with JS function will cause of table.set() to fail
          wasmTable.set(ret, func);
        } catch (err) {
          if (!(err instanceof TypeError)) {
            throw err;
          }
          var wrapped = convertJsFunctionToWasm(func, sig);
          wasmTable.set(ret, wrapped);
        }

        functionsInTableMap.set(func, ret);

        return ret;
      }

      function removeFunction(index) {
        functionsInTableMap.delete(wasmTable.get(index));
        freeTableIndexes.push(index);
      }

      // 'sig' parameter is required for the llvm backend but only when func is not
      // already a WebAssembly function.
      function addFunction(func, sig) {

        return addFunctionWasm(func, sig);
      }

      // end include: runtime_functions.js
      // include: runtime_debug.js


      // end include: runtime_debug.js
      function makeBigInt(low, high, unsigned) {
        return unsigned ? ((+((low >>> 0))) + ((+((high >>> 0))) * 4294967296.0)) : ((+((low >>> 0))) + ((+((high | 0))) * 4294967296.0));
      }

      var tempRet0 = 0;

      var setTempRet0 = function (value) {
        tempRet0 = value;
      };

      var getTempRet0 = function () {
        return tempRet0;
      };



      // === Preamble library stuff ===

      // Documentation for the public APIs defined in this file must be updated in:
      //    site/source/docs/api_reference/preamble.js.rst
      // A prebuilt local version of the documentation is available at:
      //    site/build/text/docs/api_reference/preamble.js.txt
      // You can also build docs locally as HTML or other formats in site/
      // An online HTML version (which may be of a different version of Emscripten)
      //    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

      var wasmBinary;
      if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
      var noExitRuntime = Module['noExitRuntime'] || true;

      if (typeof WebAssembly !== 'object') {
        abort('no native wasm support detected');
      }

      // include: runtime_safe_heap.js


      // In MINIMAL_RUNTIME, setValue() and getValue() are only available when building with safe heap enabled, for heap safety checking.
      // In traditional runtime, setValue() and getValue() are always available (although their use is highly discouraged due to perf penalties)

      /** @param {number} ptr
          @param {number} value
          @param {string} type
          @param {number|boolean=} noSafe */
      function setValue(ptr, value, type, noSafe) {
        type = type || 'i8';
        if (type.charAt(type.length - 1) === '*') type = 'i32'; // pointers are 32-bit
        switch (type) {
          case 'i1': HEAP8[((ptr) >> 0)] = value; break;
          case 'i8': HEAP8[((ptr) >> 0)] = value; break;
          case 'i16': HEAP16[((ptr) >> 1)] = value; break;
          case 'i32': HEAP32[((ptr) >> 2)] = value; break;
          case 'i64': (tempI64 = [value >>> 0, (tempDouble = value, (+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble) / 4294967296.0))), 4294967295.0)) | 0) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296.0))))) >>> 0) : 0)], HEAP32[((ptr) >> 2)] = tempI64[0], HEAP32[(((ptr) + (4)) >> 2)] = tempI64[1]); break;
          case 'float': HEAPF32[((ptr) >> 2)] = value; break;
          case 'double': HEAPF64[((ptr) >> 3)] = value; break;
          default: abort('invalid type for setValue: ' + type);
        }
      }

      /** @param {number} ptr
          @param {string} type
          @param {number|boolean=} noSafe */
      function getValue(ptr, type, noSafe) {
        type = type || 'i8';
        if (type.charAt(type.length - 1) === '*') type = 'i32'; // pointers are 32-bit
        switch (type) {
          case 'i1': return HEAP8[((ptr) >> 0)];
          case 'i8': return HEAP8[((ptr) >> 0)];
          case 'i16': return HEAP16[((ptr) >> 1)];
          case 'i32': return HEAP32[((ptr) >> 2)];
          case 'i64': return HEAP32[((ptr) >> 2)];
          case 'float': return HEAPF32[((ptr) >> 2)];
          case 'double': return HEAPF64[((ptr) >> 3)];
          default: abort('invalid type for getValue: ' + type);
        }
        return null;
      }

      // end include: runtime_safe_heap.js
      // Wasm globals

      var wasmMemory;

      //========================================
      // Runtime essentials
      //========================================

      // whether we are quitting the application. no code should run after this.
      // set in exit() and abort()
      var ABORT = false;

      // set by exit() and abort().  Passed to 'onExit' handler.
      // NOTE: This is also used as the process return code code in shell environments
      // but only when noExitRuntime is false.
      var EXITSTATUS;

      /** @type {function(*, string=)} */
      function assert(condition, text) {
        if (!condition) {
          abort('Assertion failed: ' + text);
        }
      }

      // Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
      function getCFunc(ident) {
        var func = Module['_' + ident]; // closure exported function
        assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported');
        return func;
      }

      // C calling interface.
      /** @param {string|null=} returnType
          @param {Array=} argTypes
          @param {Arguments|Array=} args
          @param {Object=} opts */
      function ccall(ident, returnType, argTypes, args, opts) {
        // For fast lookup of conversion functions
        var toC = {
          'string': function (str) {
            var ret = 0;
            if (str !== null && str !== undefined && str !== 0) { // null string
              // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
              var len = (str.length << 2) + 1;
              ret = stackAlloc(len);
              stringToUTF8(str, ret, len);
            }
            return ret;
          },
          'array': function (arr) {
            var ret = stackAlloc(arr.length);
            writeArrayToMemory(arr, ret);
            return ret;
          }
        };

        function convertReturnValue(ret) {
          if (returnType === 'string') return UTF8ToString(ret);
          if (returnType === 'boolean') return Boolean(ret);
          return ret;
        }

        var func = getCFunc(ident);
        var cArgs = [];
        var stack = 0;
        if (args) {
          for (var i = 0;i < args.length;i++) {
            var converter = toC[argTypes[i]];
            if (converter) {
              if (stack === 0) stack = stackSave();
              cArgs[i] = converter(args[i]);
            } else {
              cArgs[i] = args[i];
            }
          }
        }
        var ret = func.apply(null, cArgs);

        ret = convertReturnValue(ret);
        if (stack !== 0) stackRestore(stack);
        return ret;
      }

      /** @param {string=} returnType
          @param {Array=} argTypes
          @param {Object=} opts */
      function cwrap(ident, returnType, argTypes, opts) {
        argTypes = argTypes || [];
        // When the function takes numbers and returns a number, we can just return
        // the original function
        var numericArgs = argTypes.every(function (type) {return type === 'number'});
        var numericRet = returnType !== 'string';
        if (numericRet && numericArgs && !opts) {
          return getCFunc(ident);
        }
        return function () {
          return ccall(ident, returnType, argTypes, arguments, opts);
        }
      }

      var ALLOC_NORMAL = 0; // Tries to use _malloc()
      var ALLOC_STACK = 1; // Lives for the duration of the current function call

      // allocate(): This is for internal use. You can use it yourself as well, but the interface
      //             is a little tricky (see docs right below). The reason is that it is optimized
      //             for multiple syntaxes to save space in generated code. So you should
      //             normally not use allocate(), and instead allocate memory using _malloc(),
      //             initialize it with setValue(), and so forth.
      // @slab: An array of data.
      // @allocator: How to allocate memory, see ALLOC_*
      /** @type {function((Uint8Array|Array<number>), number)} */
      function allocate(slab, allocator) {
        var ret;

        if (allocator == ALLOC_STACK) {
          ret = stackAlloc(slab.length);
        } else {
          ret = _malloc(slab.length);
        }

        if (slab.subarray || slab.slice) {
          HEAPU8.set(/** @type {!Uint8Array} */(slab), ret);
        } else {
          HEAPU8.set(new Uint8Array(slab), ret);
        }
        return ret;
      }

      // include: runtime_strings.js


      // runtime_strings.js: Strings related runtime functions that are part of both MINIMAL_RUNTIME and regular runtime.

      // Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
      // a copy of that string as a Javascript String object.

      var UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined;

      /**
       * @param {number} idx
       * @param {number=} maxBytesToRead
       * @return {string}
       */
      function UTF8ArrayToString(heap, idx, maxBytesToRead) {
        var endIdx = idx + maxBytesToRead;
        var endPtr = idx;
        // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
        // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
        // (As a tiny code save trick, compare endPtr against endIdx using a negation, so that undefined means Infinity)
        while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr;

        if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
          return UTF8Decoder.decode(heap.subarray(idx, endPtr));
        } else {
          var str = '';
          // If building with TextDecoder, we have already computed the string length above, so test loop end condition against that
          while (idx < endPtr) {
            // For UTF8 byte structure, see:
            // http://en.wikipedia.org/wiki/UTF-8#Description
            // https://www.ietf.org/rfc/rfc2279.txt
            // https://tools.ietf.org/html/rfc3629
            var u0 = heap[idx++];
            if (!(u0 & 0x80)) {str += String.fromCharCode(u0); continue;}
            var u1 = heap[idx++] & 63;
            if ((u0 & 0xE0) == 0xC0) {str += String.fromCharCode(((u0 & 31) << 6) | u1); continue;}
            var u2 = heap[idx++] & 63;
            if ((u0 & 0xF0) == 0xE0) {
              u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
            } else {
              u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heap[idx++] & 63);
            }

            if (u0 < 0x10000) {
              str += String.fromCharCode(u0);
            } else {
              var ch = u0 - 0x10000;
              str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
            }
          }
        }
        return str;
      }

      // Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns a
      // copy of that string as a Javascript String object.
      // maxBytesToRead: an optional length that specifies the maximum number of bytes to read. You can omit
      //                 this parameter to scan the string until the first \0 byte. If maxBytesToRead is
      //                 passed, and the string at [ptr, ptr+maxBytesToReadr[ contains a null byte in the
      //                 middle, then the string will cut short at that byte index (i.e. maxBytesToRead will
      //                 not produce a string of exact length [ptr, ptr+maxBytesToRead[)
      //                 N.B. mixing frequent uses of UTF8ToString() with and without maxBytesToRead may
      //                 throw JS JIT optimizations off, so it is worth to consider consistently using one
      //                 style or the other.
      /**
       * @param {number} ptr
       * @param {number=} maxBytesToRead
       * @return {string}
       */
      function UTF8ToString(ptr, maxBytesToRead) {
        return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
      }

      // Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
      // encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
      // Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
      // Parameters:
      //   str: the Javascript string to copy.
      //   heap: the array to copy to. Each index in this array is assumed to be one 8-byte element.
      //   outIdx: The starting offset in the array to begin the copying.
      //   maxBytesToWrite: The maximum number of bytes this function can write to the array.
      //                    This count should include the null terminator,
      //                    i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
      //                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
      // Returns the number of bytes written, EXCLUDING the null terminator.

      function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
        if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
          return 0;

        var startIdx = outIdx;
        var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
        for (var i = 0;i < str.length;++i) {
          // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
          // See http://unicode.org/faq/utf_bom.html#utf16-3
          // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
          var u = str.charCodeAt(i); // possibly a lead surrogate
          if (u >= 0xD800 && u <= 0xDFFF) {
            var u1 = str.charCodeAt(++i);
            u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
          }
          if (u <= 0x7F) {
            if (outIdx >= endIdx) break;
            heap[outIdx++] = u;
          } else if (u <= 0x7FF) {
            if (outIdx + 1 >= endIdx) break;
            heap[outIdx++] = 0xC0 | (u >> 6);
            heap[outIdx++] = 0x80 | (u & 63);
          } else if (u <= 0xFFFF) {
            if (outIdx + 2 >= endIdx) break;
            heap[outIdx++] = 0xE0 | (u >> 12);
            heap[outIdx++] = 0x80 | ((u >> 6) & 63);
            heap[outIdx++] = 0x80 | (u & 63);
          } else {
            if (outIdx + 3 >= endIdx) break;
            heap[outIdx++] = 0xF0 | (u >> 18);
            heap[outIdx++] = 0x80 | ((u >> 12) & 63);
            heap[outIdx++] = 0x80 | ((u >> 6) & 63);
            heap[outIdx++] = 0x80 | (u & 63);
          }
        }
        // Null-terminate the pointer to the buffer.
        heap[outIdx] = 0;
        return outIdx - startIdx;
      }

      // Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
      // null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
      // Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
      // Returns the number of bytes written, EXCLUDING the null terminator.

      function stringToUTF8(str, outPtr, maxBytesToWrite) {
        return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
      }

      // Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.
      function lengthBytesUTF8(str) {
        var len = 0;
        for (var i = 0;i < str.length;++i) {
          // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
          // See http://unicode.org/faq/utf_bom.html#utf16-3
          var u = str.charCodeAt(i); // possibly a lead surrogate
          if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
          if (u <= 0x7F) ++len;
          else if (u <= 0x7FF) len += 2;
          else if (u <= 0xFFFF) len += 3;
          else len += 4;
        }
        return len;
      }

      // end include: runtime_strings.js
      // include: runtime_strings_extra.js


      // runtime_strings_extra.js: Strings related runtime functions that are available only in regular runtime.

      // Given a pointer 'ptr' to a null-terminated ASCII-encoded string in the emscripten HEAP, returns
      // a copy of that string as a Javascript String object.

      function AsciiToString(ptr) {
        var str = '';
        while (1) {
          var ch = HEAPU8[((ptr++) >> 0)];
          if (!ch) return str;
          str += String.fromCharCode(ch);
        }
      }

      // Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
      // null-terminated and encoded in ASCII form. The copy will require at most str.length+1 bytes of space in the HEAP.

      function stringToAscii(str, outPtr) {
        return writeAsciiToMemory(str, outPtr, false);
      }

      // Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
      // a copy of that string as a Javascript String object.

      var UTF16Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-16le') : undefined;

      function UTF16ToString(ptr, maxBytesToRead) {
        var endPtr = ptr;
        // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
        // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
        var idx = endPtr >> 1;
        var maxIdx = idx + maxBytesToRead / 2;
        // If maxBytesToRead is not passed explicitly, it will be undefined, and this
        // will always evaluate to true. This saves on code size.
        while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
        endPtr = idx << 1;

        if (endPtr - ptr > 32 && UTF16Decoder) {
          return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
        } else {
          var str = '';

          // If maxBytesToRead is not passed explicitly, it will be undefined, and the for-loop's condition
          // will always evaluate to true. The loop is then terminated on the first null char.
          for (var i = 0;!(i >= maxBytesToRead / 2);++i) {
            var codeUnit = HEAP16[(((ptr) + (i * 2)) >> 1)];
            if (codeUnit == 0) break;
            // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
            str += String.fromCharCode(codeUnit);
          }

          return str;
        }
      }

      // Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
      // null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
      // Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
      // Parameters:
      //   str: the Javascript string to copy.
      //   outPtr: Byte address in Emscripten HEAP where to write the string to.
      //   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
      //                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
      //                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
      // Returns the number of bytes written, EXCLUDING the null terminator.

      function stringToUTF16(str, outPtr, maxBytesToWrite) {
        // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
        if (maxBytesToWrite === undefined) {
          maxBytesToWrite = 0x7FFFFFFF;
        }
        if (maxBytesToWrite < 2) return 0;
        maxBytesToWrite -= 2; // Null terminator.
        var startPtr = outPtr;
        var numCharsToWrite = (maxBytesToWrite < str.length * 2) ? (maxBytesToWrite / 2) : str.length;
        for (var i = 0;i < numCharsToWrite;++i) {
          // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
          var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
          HEAP16[((outPtr) >> 1)] = codeUnit;
          outPtr += 2;
        }
        // Null-terminate the pointer to the HEAP.
        HEAP16[((outPtr) >> 1)] = 0;
        return outPtr - startPtr;
      }

      // Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

      function lengthBytesUTF16(str) {
        return str.length * 2;
      }

      function UTF32ToString(ptr, maxBytesToRead) {
        var i = 0;

        var str = '';
        // If maxBytesToRead is not passed explicitly, it will be undefined, and this
        // will always evaluate to true. This saves on code size.
        while (!(i >= maxBytesToRead / 4)) {
          var utf32 = HEAP32[(((ptr) + (i * 4)) >> 2)];
          if (utf32 == 0) break;
          ++i;
          // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
          // See http://unicode.org/faq/utf_bom.html#utf16-3
          if (utf32 >= 0x10000) {
            var ch = utf32 - 0x10000;
            str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
          } else {
            str += String.fromCharCode(utf32);
          }
        }
        return str;
      }

      // Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
      // null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
      // Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
      // Parameters:
      //   str: the Javascript string to copy.
      //   outPtr: Byte address in Emscripten HEAP where to write the string to.
      //   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
      //                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
      //                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
      // Returns the number of bytes written, EXCLUDING the null terminator.

      function stringToUTF32(str, outPtr, maxBytesToWrite) {
        // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
        if (maxBytesToWrite === undefined) {
          maxBytesToWrite = 0x7FFFFFFF;
        }
        if (maxBytesToWrite < 4) return 0;
        var startPtr = outPtr;
        var endPtr = startPtr + maxBytesToWrite - 4;
        for (var i = 0;i < str.length;++i) {
          // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
          // See http://unicode.org/faq/utf_bom.html#utf16-3
          var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
          if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
            var trailSurrogate = str.charCodeAt(++i);
            codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
          }
          HEAP32[((outPtr) >> 2)] = codeUnit;
          outPtr += 4;
          if (outPtr + 4 > endPtr) break;
        }
        // Null-terminate the pointer to the HEAP.
        HEAP32[((outPtr) >> 2)] = 0;
        return outPtr - startPtr;
      }

      // Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

      function lengthBytesUTF32(str) {
        var len = 0;
        for (var i = 0;i < str.length;++i) {
          // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
          // See http://unicode.org/faq/utf_bom.html#utf16-3
          var codeUnit = str.charCodeAt(i);
          if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
          len += 4;
        }

        return len;
      }

      // Allocate heap space for a JS string, and write it there.
      // It is the responsibility of the caller to free() that memory.
      function allocateUTF8(str) {
        var size = lengthBytesUTF8(str) + 1;
        var ret = _malloc(size);
        if (ret) stringToUTF8Array(str, HEAP8, ret, size);
        return ret;
      }

      // Allocate stack space for a JS string, and write it there.
      function allocateUTF8OnStack(str) {
        var size = lengthBytesUTF8(str) + 1;
        var ret = stackAlloc(size);
        stringToUTF8Array(str, HEAP8, ret, size);
        return ret;
      }

      // Deprecated: This function should not be called because it is unsafe and does not provide
      // a maximum length limit of how many bytes it is allowed to write. Prefer calling the
      // function stringToUTF8Array() instead, which takes in a maximum length that can be used
      // to be secure from out of bounds writes.
      /** @deprecated
          @param {boolean=} dontAddNull */
      function writeStringToMemory(string, buffer, dontAddNull) {
        warnOnce('writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!');

        var /** @type {number} */ lastChar, /** @type {number} */ end;
        if (dontAddNull) {
          // stringToUTF8Array always appends null. If we don't want to do that, remember the
          // character that existed at the location where the null will be placed, and restore
          // that after the write (below).
          end = buffer + lengthBytesUTF8(string);
          lastChar = HEAP8[end];
        }
        stringToUTF8(string, buffer, Infinity);
        if (dontAddNull) HEAP8[end] = lastChar; // Restore the value under the null character.
      }

      function writeArrayToMemory(array, buffer) {
        HEAP8.set(array, buffer);
      }

      /** @param {boolean=} dontAddNull */
      function writeAsciiToMemory(str, buffer, dontAddNull) {
        for (var i = 0;i < str.length;++i) {
          HEAP8[((buffer++) >> 0)] = str.charCodeAt(i);
        }
        // Null-terminate the pointer to the HEAP.
        if (!dontAddNull) HEAP8[((buffer) >> 0)] = 0;
      }

      // end include: runtime_strings_extra.js
      // Memory management

      function alignUp(x, multiple) {
        if (x % multiple > 0) {
          x += multiple - (x % multiple);
        }
        return x;
      }

      var HEAP,
        /** @type {ArrayBuffer} */
        buffer,
        /** @type {Int8Array} */
        HEAP8,
        /** @type {Uint8Array} */
        HEAPU8,
        /** @type {Int16Array} */
        HEAP16,
        /** @type {Uint16Array} */
        HEAPU16,
        /** @type {Int32Array} */
        HEAP32,
        /** @type {Uint32Array} */
        HEAPU32,
        /** @type {Float32Array} */
        HEAPF32,
        /** @type {Float64Array} */
        HEAPF64;

      function updateGlobalBufferAndViews(buf) {
        buffer = buf;
        Module['HEAP8'] = HEAP8 = new Int8Array(buf);
        Module['HEAP16'] = HEAP16 = new Int16Array(buf);
        Module['HEAP32'] = HEAP32 = new Int32Array(buf);
        Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
        Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
        Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
        Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
        Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
      }

      var TOTAL_STACK = 5242880;

      var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 16777216;

      // include: runtime_init_table.js
      // In regular non-RELOCATABLE mode the table is exported
      // from the wasm module and this will be assigned once
      // the exports are available.
      var wasmTable;

      // end include: runtime_init_table.js
      // include: runtime_stack_check.js


      // end include: runtime_stack_check.js
      // include: runtime_assertions.js


      // end include: runtime_assertions.js
      var __ATPRERUN__ = []; // functions called before the runtime is initialized
      var __ATINIT__ = []; // functions called during startup
      var __ATMAIN__ = []; // functions called when main() is to be run
      var __ATEXIT__ = []; // functions called during shutdown
      var __ATPOSTRUN__ = []; // functions called after the main() is called

      var runtimeInitialized = false;
      var runtimeExited = false;

      function preRun() {

        if (Module['preRun']) {
          if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
          while (Module['preRun'].length) {
            addOnPreRun(Module['preRun'].shift());
          }
        }

        callRuntimeCallbacks(__ATPRERUN__);
      }

      function initRuntime() {
        runtimeInitialized = true;


        callRuntimeCallbacks(__ATINIT__);
      }

      function preMain() {

        callRuntimeCallbacks(__ATMAIN__);
      }

      function exitRuntime() {
        runtimeExited = true;
      }

      function postRun() {

        if (Module['postRun']) {
          if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
          while (Module['postRun'].length) {
            addOnPostRun(Module['postRun'].shift());
          }
        }

        callRuntimeCallbacks(__ATPOSTRUN__);
      }

      function addOnPreRun(cb) {
        __ATPRERUN__.unshift(cb);
      }

      function addOnInit(cb) {
        __ATINIT__.unshift(cb);
      }

      function addOnPreMain(cb) {
        __ATMAIN__.unshift(cb);
      }

      function addOnExit(cb) {
      }

      function addOnPostRun(cb) {
        __ATPOSTRUN__.unshift(cb);
      }

      // include: runtime_math.js


      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

      // end include: runtime_math.js
      // A counter of dependencies for calling run(). If we need to
      // do asynchronous work before running, increment this and
      // decrement it. Incrementing must happen in a place like
      // Module.preRun (used by emcc to add file preloading).
      // Note that you can add dependencies in preRun, even though
      // it happens right before run - run will be postponed until
      // the dependencies are met.
      var runDependencies = 0;
      var runDependencyWatcher = null;
      var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

      function getUniqueRunDependency(id) {
        return id;
      }

      function addRunDependency(id) {
        runDependencies++;

        if (Module['monitorRunDependencies']) {
          Module['monitorRunDependencies'](runDependencies);
        }

      }

      function removeRunDependency(id) {
        runDependencies--;

        if (Module['monitorRunDependencies']) {
          Module['monitorRunDependencies'](runDependencies);
        }

        if (runDependencies == 0) {
          if (runDependencyWatcher !== null) {
            clearInterval(runDependencyWatcher);
            runDependencyWatcher = null;
          }
          if (dependenciesFulfilled) {
            var callback = dependenciesFulfilled;
            dependenciesFulfilled = null;
            callback(); // can add another dependenciesFulfilled
          }
        }
      }

      Module["preloadedImages"] = {}; // maps url to image data
      Module["preloadedAudios"] = {}; // maps url to audio data

      /** @param {string|number=} what */
      function abort(what) {
        if (Module['onAbort']) {
          Module['onAbort'](what);
        }

        what += '';
        err(what);

        ABORT = true;
        EXITSTATUS = 1;

        what = 'abort(' + what + '). Build with -s ASSERTIONS=1 for more info.';

        // Use a wasm runtime error, because a JS error might be seen as a foreign
        // exception, which means we'd run destructors on it. We need the error to
        // simply make the program stop.
        var e = new WebAssembly.RuntimeError(what);

        readyPromiseReject(e);
        // Throw the error whether or not MODULARIZE is set because abort is used
        // in code paths apart from instantiation where an exception is expected
        // to be thrown when abort is called.
        throw e;
      }

      // {{MEM_INITIALIZER}}

      // include: memoryprofiler.js


      // end include: memoryprofiler.js
      // include: URIUtils.js


      function hasPrefix(str, prefix) {
        return String.prototype.startsWith ?
          str.startsWith(prefix) :
          str.indexOf(prefix) === 0;
      }

      // Prefix of data URIs emitted by SINGLE_FILE and related options.
      var dataURIPrefix = 'data:application/octet-stream;base64,';

      // Indicates whether filename is a base64 data URI.
      function isDataURI(filename) {
        return hasPrefix(filename, dataURIPrefix);
      }

      var fileURIPrefix = "file://";

      // Indicates whether filename is delivered via file protocol (as opposed to http/https)
      function isFileURI(filename) {
        return hasPrefix(filename, fileURIPrefix);
      }

      // end include: URIUtils.js
      var wasmBinaryFile = 'data:application/octet-stream;base64,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cmlwdGVuOjptZW1vcnlfdmlldzxzaWduZWQgY2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgY2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8c2hvcnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIHNob3J0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGludD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8bG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgbG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50OF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50OF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQxNl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50MTZfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50MzJfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDMyX3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGZsb2F0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxkb3VibGU+AE5TdDNfXzIxMmJhc2ljX3N0cmluZ0ljTlNfMTFjaGFyX3RyYWl0c0ljRUVOU185YWxsb2NhdG9ySWNFRUVFAE5TdDNfXzIyMV9fYmFzaWNfc3RyaW5nX2NvbW1vbklMYjFFRUUAAGwXAABVBwAA8BcAABYHAAAAAAAAAQAAAHwHAAAAAAAATlN0M19fMjEyYmFzaWNfc3RyaW5nSWhOU18xMWNoYXJfdHJhaXRzSWhFRU5TXzlhbGxvY2F0b3JJaEVFRUUAAPAXAACcBwAAAAAAAAEAAAB8BwAAAAAAAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0l3TlNfMTFjaGFyX3RyYWl0c0l3RUVOU185YWxsb2NhdG9ySXdFRUVFAADwFwAA9AcAAAAAAAABAAAAfAcAAAAAAABOU3QzX18yMTJiYXNpY19zdHJpbmdJRHNOU18xMWNoYXJfdHJhaXRzSURzRUVOU185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';
      if (!isDataURI(wasmBinaryFile)) {
        wasmBinaryFile = locateFile(wasmBinaryFile);
      }

      function getBinary(file) {
        try {
          if (file == wasmBinaryFile && wasmBinary) {
            return new Uint8Array(wasmBinary);
          }
          var binary = tryParseAsDataURI(file);
          if (binary) {
            return binary;
          }
          if (readBinary) {
            return readBinary(file);
          } else {
            throw "both async and sync fetching of the wasm failed";
          }
        }
        catch (err) {
          abort(err);
        }
      }

      function getBinaryPromise() {
        // If we don't have the binary yet, try to to load it asynchronously.
        // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
        // See https://github.com/github/fetch/pull/92#issuecomment-140665932
        // Cordova or Electron apps are typically loaded from a file:// url.
        // So use fetch if it is available and the url is not a file, otherwise fall back to XHR.
        if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
          if (typeof fetch === 'function'
          ) {
            return fetch(wasmBinaryFile, {credentials: 'same-origin'}).then(function (response) {
              if (!response['ok']) {
                throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
              }
              return response['arrayBuffer']();
            }).catch(function () {
              return getBinary(wasmBinaryFile);
            });
          }
        }

        // Otherwise, getBinary should be able to get it synchronously
        return Promise.resolve().then(function () {return getBinary(wasmBinaryFile);});
      }

      // Create the wasm instance.
      // Receives the wasm imports, returns the exports.
      function createWasm() {
        // prepare imports
        var info = {
          'env': asmLibraryArg,
          'wasi_snapshot_preview1': asmLibraryArg,
        };
        // Load the wasm module and create an instance of using native support in the JS engine.
        // handle a generated wasm instance, receiving its exports and
        // performing other necessary setup
        /** @param {WebAssembly.Module=} module*/
        function receiveInstance(instance, module) {
          var exports = instance.exports;

          Module['asm'] = exports;

          wasmMemory = Module['asm']['memory'];
          updateGlobalBufferAndViews(wasmMemory.buffer);

          wasmTable = Module['asm']['__indirect_function_table'];

          addOnInit(Module['asm']['__wasm_call_ctors']);

          removeRunDependency('wasm-instantiate');
        }
        // we can't run yet (except in a pthread, where we have a custom sync instantiator)
        addRunDependency('wasm-instantiate');

        function receiveInstantiatedSource(output) {
          // 'output' is a WebAssemblyInstantiatedSource object which has both the module and instance.
          // receiveInstance() will swap in the exports (to Module.asm) so they can be called
          // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
          // When the regression is fixed, can restore the above USE_PTHREADS-enabled path.
          receiveInstance(output['instance']);
        }

        function instantiateArrayBuffer(receiver) {
          return getBinaryPromise().then(function (binary) {
            var result = WebAssembly.instantiate(binary, info);
            return result;
          }).then(receiver, function (reason) {
            err('failed to asynchronously prepare wasm: ' + reason);

            abort(reason);
          });
        }

        // Prefer streaming instantiation if available.
        function instantiateAsync() {
          if (!wasmBinary &&
            typeof WebAssembly.instantiateStreaming === 'function' &&
            !isDataURI(wasmBinaryFile) &&
            typeof fetch === 'function') {
            return fetch(wasmBinaryFile, {credentials: 'same-origin'}).then(function (response) {
              var result = WebAssembly.instantiateStreaming(response, info);
              return result.then(receiveInstantiatedSource, function (reason) {
                // We expect the most common failure cause to be a bad MIME type for the binary,
                // in which case falling back to ArrayBuffer instantiation should work.
                err('wasm streaming compile failed: ' + reason);
                err('falling back to ArrayBuffer instantiation');
                return instantiateArrayBuffer(receiveInstantiatedSource);
              });
            });
          } else {
            return instantiateArrayBuffer(receiveInstantiatedSource);
          }
        }

        // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
        // to manually instantiate the Wasm module themselves. This allows pages to run the instantiation parallel
        // to any other async startup actions they are performing.
        if (Module['instantiateWasm']) {
          try {
            var exports = Module['instantiateWasm'](info, receiveInstance);
            return exports;
          } catch (e) {
            err('Module.instantiateWasm callback failed with error: ' + e);
            return false;
          }
        }

        // If instantiation fails, reject the module ready promise.
        instantiateAsync().catch(readyPromiseReject);
        return {}; // no exports yet; we'll fill them in later
      }

      // Globals used by JS i64 conversions (see makeSetValue)
      var tempDouble;
      var tempI64;

      // === Body ===

      var ASM_CONSTS = {

      };






      function callRuntimeCallbacks(callbacks) {
        while (callbacks.length > 0) {
          var callback = callbacks.shift();
          if (typeof callback == 'function') {
            callback(Module); // Pass the module as the first argument.
            continue;
          }
          var func = callback.func;
          if (typeof func === 'number') {
            if (callback.arg === undefined) {
              wasmTable.get(func)();
            } else {
              wasmTable.get(func)(callback.arg);
            }
          } else {
            func(callback.arg === undefined ? null : callback.arg);
          }
        }
      }

      function demangle(func) {
        return func;
      }

      function demangleAll(text) {
        var regex =
          /\b_Z[\w\d_]+/g;
        return text.replace(regex,
          function (x) {
            var y = demangle(x);
            return x === y ? x : (y + ' [' + x + ']');
          });
      }

      function jsStackTrace() {
        var error = new Error();
        if (!error.stack) {
          // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
          // so try that as a special-case.
          try {
            throw new Error();
          } catch (e) {
            error = e;
          }
          if (!error.stack) {
            return '(no stack trace available)';
          }
        }
        return error.stack.toString();
      }

      var runtimeKeepaliveCounter = 0;
      function keepRuntimeAlive() {
        return noExitRuntime || runtimeKeepaliveCounter > 0;
      }

      function stackTrace() {
        var js = jsStackTrace();
        if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']();
        return demangleAll(js);
      }

      function getShiftFromSize(size) {
        switch (size) {
          case 1: return 0;
          case 2: return 1;
          case 4: return 2;
          case 8: return 3;
          default:
            throw new TypeError('Unknown type size: ' + size);
        }
      }

      function embind_init_charCodes() {
        var codes = new Array(256);
        for (var i = 0;i < 256;++i) {
          codes[i] = String.fromCharCode(i);
        }
        embind_charCodes = codes;
      }
      var embind_charCodes = undefined;
      function readLatin1String(ptr) {
        var ret = "";
        var c = ptr;
        while (HEAPU8[c]) {
          ret += embind_charCodes[HEAPU8[c++]];
        }
        return ret;
      }

      var awaitingDependencies = {};

      var registeredTypes = {};

      var typeDependencies = {};

      var char_0 = 48;

      var char_9 = 57;
      function makeLegalFunctionName(name) {
        if (undefined === name) {
          return '_unknown';
        }
        name = name.replace(/[^a-zA-Z0-9_]/g, '$');
        var f = name.charCodeAt(0);
        if (f >= char_0 && f <= char_9) {
          return '_' + name;
        } else {
          return name;
        }
      }
      function createNamedFunction(name, body) {
        name = makeLegalFunctionName(name);
        /*jshint evil:true*/
        return new Function(
          "body",
          "return function " + name + "() {\n" +
          "    \"use strict\";" +
          "    return body.apply(this, arguments);\n" +
          "};\n"
        )(body);
      }
      function extendError(baseErrorType, errorName) {
        var errorClass = createNamedFunction(errorName, function (message) {
          this.name = errorName;
          this.message = message;

          var stack = (new Error(message)).stack;
          if (stack !== undefined) {
            this.stack = this.toString() + '\n' +
              stack.replace(/^Error(:[^\n]*)?\n/, '');
          }
        });
        errorClass.prototype = Object.create(baseErrorType.prototype);
        errorClass.prototype.constructor = errorClass;
        errorClass.prototype.toString = function () {
          if (this.message === undefined) {
            return this.name;
          } else {
            return this.name + ': ' + this.message;
          }
        };

        return errorClass;
      }
      var BindingError = undefined;
      function throwBindingError(message) {
        throw new BindingError(message);
      }

      var InternalError = undefined;
      function throwInternalError(message) {
        throw new InternalError(message);
      }
      function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
        myTypes.forEach(function (type) {
          typeDependencies[type] = dependentTypes;
        });

        function onComplete(typeConverters) {
          var myTypeConverters = getTypeConverters(typeConverters);
          if (myTypeConverters.length !== myTypes.length) {
            throwInternalError('Mismatched type converter count');
          }
          for (var i = 0;i < myTypes.length;++i) {
            registerType(myTypes[i], myTypeConverters[i]);
          }
        }

        var typeConverters = new Array(dependentTypes.length);
        var unregisteredTypes = [];
        var registered = 0;
        dependentTypes.forEach(function (dt, i) {
          if (registeredTypes.hasOwnProperty(dt)) {
            typeConverters[i] = registeredTypes[dt];
          } else {
            unregisteredTypes.push(dt);
            if (!awaitingDependencies.hasOwnProperty(dt)) {
              awaitingDependencies[dt] = [];
            }
            awaitingDependencies[dt].push(function () {
              typeConverters[i] = registeredTypes[dt];
              ++registered;
              if (registered === unregisteredTypes.length) {
                onComplete(typeConverters);
              }
            });
          }
        });
        if (0 === unregisteredTypes.length) {
          onComplete(typeConverters);
        }
      }
      /** @param {Object=} options */
      function registerType(rawType, registeredInstance, options) {
        options = options || {};

        if (!('argPackAdvance' in registeredInstance)) {
          throw new TypeError('registerType registeredInstance requires argPackAdvance');
        }

        var name = registeredInstance.name;
        if (!rawType) {
          throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
        }
        if (registeredTypes.hasOwnProperty(rawType)) {
          if (options.ignoreDuplicateRegistrations) {
            return;
          } else {
            throwBindingError("Cannot register type '" + name + "' twice");
          }
        }

        registeredTypes[rawType] = registeredInstance;
        delete typeDependencies[rawType];

        if (awaitingDependencies.hasOwnProperty(rawType)) {
          var callbacks = awaitingDependencies[rawType];
          delete awaitingDependencies[rawType];
          callbacks.forEach(function (cb) {
            cb();
          });
        }
      }
      function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
        var shift = getShiftFromSize(size);

        name = readLatin1String(name);
        registerType(rawType, {
          name: name,
          'fromWireType': function (wt) {
            // ambiguous emscripten ABI: sometimes return values are
            // true or false, and sometimes integers (0 or 1)
            return !!wt;
          },
          'toWireType': function (destructors, o) {
            return o ? trueValue : falseValue;
          },
          'argPackAdvance': 8,
          'readValueFromPointer': function (pointer) {
            // TODO: if heap is fixed (like in asm.js) this could be executed outside
            var heap;
            if (size === 1) {
              heap = HEAP8;
            } else if (size === 2) {
              heap = HEAP16;
            } else if (size === 4) {
              heap = HEAP32;
            } else {
              throw new TypeError("Unknown boolean type size: " + name);
            }
            return this['fromWireType'](heap[pointer >> shift]);
          },
          destructorFunction: null, // This type does not need a destructor
        });
      }

      var emval_free_list = [];

      var emval_handle_array = [{}, {value: undefined}, {value: null}, {value: true}, {value: false}];
      function __emval_decref(handle) {
        if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
          emval_handle_array[handle] = undefined;
          emval_free_list.push(handle);
        }
      }

      function count_emval_handles() {
        var count = 0;
        for (var i = 5;i < emval_handle_array.length;++i) {
          if (emval_handle_array[i] !== undefined) {
            ++count;
          }
        }
        return count;
      }

      function get_first_emval() {
        for (var i = 5;i < emval_handle_array.length;++i) {
          if (emval_handle_array[i] !== undefined) {
            return emval_handle_array[i];
          }
        }
        return null;
      }
      function init_emval() {
        Module['count_emval_handles'] = count_emval_handles;
        Module['get_first_emval'] = get_first_emval;
      }
      function __emval_register(value) {
        switch (value) {
          case undefined: {return 1;}
          case null: {return 2;}
          case true: {return 3;}
          case false: {return 4;}
          default: {
            var handle = emval_free_list.length ?
              emval_free_list.pop() :
              emval_handle_array.length;

            emval_handle_array[handle] = {refcount: 1, value: value};
            return handle;
          }
        }
      }

      function simpleReadValueFromPointer(pointer) {
        return this['fromWireType'](HEAPU32[pointer >> 2]);
      }
      function __embind_register_emval(rawType, name) {
        name = readLatin1String(name);
        registerType(rawType, {
          name: name,
          'fromWireType': function (handle) {
            var rv = emval_handle_array[handle].value;
            __emval_decref(handle);
            return rv;
          },
          'toWireType': function (destructors, value) {
            return __emval_register(value);
          },
          'argPackAdvance': 8,
          'readValueFromPointer': simpleReadValueFromPointer,
          destructorFunction: null, // This type does not need a destructor

          // TODO: do we need a deleteObject here?  write a test where
          // emval is passed into JS via an interface
        });
      }

      function _embind_repr(v) {
        if (v === null) {
          return 'null';
        }
        var t = typeof v;
        if (t === 'object' || t === 'array' || t === 'function') {
          return v.toString();
        } else {
          return '' + v;
        }
      }

      function floatReadValueFromPointer(name, shift) {
        switch (shift) {
          case 2: return function (pointer) {
            return this['fromWireType'](HEAPF32[pointer >> 2]);
          };
          case 3: return function (pointer) {
            return this['fromWireType'](HEAPF64[pointer >> 3]);
          };
          default:
            throw new TypeError("Unknown float type: " + name);
        }
      }
      function __embind_register_float(rawType, name, size) {
        var shift = getShiftFromSize(size);
        name = readLatin1String(name);
        registerType(rawType, {
          name: name,
          'fromWireType': function (value) {
            return value;
          },
          'toWireType': function (destructors, value) {
            // todo: Here we have an opportunity for -O3 level "unsafe" optimizations: we could
            // avoid the following if() and assume value is of proper type.
            if (typeof value !== "number" && typeof value !== "boolean") {
              throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
            }
            return value;
          },
          'argPackAdvance': 8,
          'readValueFromPointer': floatReadValueFromPointer(name, shift),
          destructorFunction: null, // This type does not need a destructor
        });
      }

      function integerReadValueFromPointer(name, shift, signed) {
        // integers are quite common, so generate very specialized functions
        switch (shift) {
          case 0: return signed ?
            function readS8FromPointer(pointer) {return HEAP8[pointer];} :
            function readU8FromPointer(pointer) {return HEAPU8[pointer];};
          case 1: return signed ?
            function readS16FromPointer(pointer) {return HEAP16[pointer >> 1];} :
            function readU16FromPointer(pointer) {return HEAPU16[pointer >> 1];};
          case 2: return signed ?
            function readS32FromPointer(pointer) {return HEAP32[pointer >> 2];} :
            function readU32FromPointer(pointer) {return HEAPU32[pointer >> 2];};
          default:
            throw new TypeError("Unknown integer type: " + name);
        }
      }
      function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
        name = readLatin1String(name);
        if (maxRange === -1) { // LLVM doesn't have signed and unsigned 32-bit types, so u32 literals come out as 'i32 -1'. Always treat those as max u32.
          maxRange = 4294967295;
        }

        var shift = getShiftFromSize(size);

        var fromWireType = function (value) {
          return value;
        };

        if (minRange === 0) {
          var bitshift = 32 - 8 * size;
          fromWireType = function (value) {
            return (value << bitshift) >>> bitshift;
          };
        }

        var isUnsignedType = (name.indexOf('unsigned') != -1);

        registerType(primitiveType, {
          name: name,
          'fromWireType': fromWireType,
          'toWireType': function (destructors, value) {
            // todo: Here we have an opportunity for -O3 level "unsafe" optimizations: we could
            // avoid the following two if()s and assume value is of proper type.
            if (typeof value !== "number" && typeof value !== "boolean") {
              throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
            }
            if (value < minRange || value > maxRange) {
              throw new TypeError('Passing a number "' + _embind_repr(value) + '" from JS side to C/C++ side to an argument of type "' + name + '", which is outside the valid range [' + minRange + ', ' + maxRange + ']!');
            }
            return isUnsignedType ? (value >>> 0) : (value | 0);
          },
          'argPackAdvance': 8,
          'readValueFromPointer': integerReadValueFromPointer(name, shift, minRange !== 0),
          destructorFunction: null, // This type does not need a destructor
        });
      }

      function __embind_register_memory_view(rawType, dataTypeIndex, name) {
        var typeMapping = [
          Int8Array,
          Uint8Array,
          Int16Array,
          Uint16Array,
          Int32Array,
          Uint32Array,
          Float32Array,
          Float64Array,
        ];

        var TA = typeMapping[dataTypeIndex];

        function decodeMemoryView(handle) {
          handle = handle >> 2;
          var heap = HEAPU32;
          var size = heap[handle]; // in elements
          var data = heap[handle + 1]; // byte offset into emscripten heap
          return new TA(buffer, data, size);
        }

        name = readLatin1String(name);
        registerType(rawType, {
          name: name,
          'fromWireType': decodeMemoryView,
          'argPackAdvance': 8,
          'readValueFromPointer': decodeMemoryView,
        }, {
          ignoreDuplicateRegistrations: true,
        });
      }

      function __embind_register_std_string(rawType, name) {
        name = readLatin1String(name);
        var stdStringIsUTF8
          //process only std::string bindings with UTF8 support, in contrast to e.g. std::basic_string<unsigned char>
          = (name === "std::string");

        registerType(rawType, {
          name: name,
          'fromWireType': function (value) {
            var length = HEAPU32[value >> 2];

            var str;
            if (stdStringIsUTF8) {
              var decodeStartPtr = value + 4;
              // Looping here to support possible embedded '0' bytes
              for (var i = 0;i <= length;++i) {
                var currentBytePtr = value + 4 + i;
                if (i == length || HEAPU8[currentBytePtr] == 0) {
                  var maxRead = currentBytePtr - decodeStartPtr;
                  var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                  if (str === undefined) {
                    str = stringSegment;
                  } else {
                    str += String.fromCharCode(0);
                    str += stringSegment;
                  }
                  decodeStartPtr = currentBytePtr + 1;
                }
              }
            } else {
              var a = new Array(length);
              for (var i = 0;i < length;++i) {
                a[i] = String.fromCharCode(HEAPU8[value + 4 + i]);
              }
              str = a.join('');
            }

            _free(value);

            return str;
          },
          'toWireType': function (destructors, value) {
            if (value instanceof ArrayBuffer) {
              value = new Uint8Array(value);
            }

            var getLength;
            var valueIsOfTypeString = (typeof value === 'string');

            if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
              throwBindingError('Cannot pass non-string to std::string');
            }
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              getLength = function () {return lengthBytesUTF8(value);};
            } else {
              getLength = function () {return value.length;};
            }

            // assumes 4-byte alignment
            var length = getLength();
            var ptr = _malloc(4 + length + 1);
            HEAPU32[ptr >> 2] = length;
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              stringToUTF8(value, ptr + 4, length + 1);
            } else {
              if (valueIsOfTypeString) {
                for (var i = 0;i < length;++i) {
                  var charCode = value.charCodeAt(i);
                  if (charCode > 255) {
                    _free(ptr);
                    throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
                  }
                  HEAPU8[ptr + 4 + i] = charCode;
                }
              } else {
                for (var i = 0;i < length;++i) {
                  HEAPU8[ptr + 4 + i] = value[i];
                }
              }
            }

            if (destructors !== null) {
              destructors.push(_free, ptr);
            }
            return ptr;
          },
          'argPackAdvance': 8,
          'readValueFromPointer': simpleReadValueFromPointer,
          destructorFunction: function (ptr) {_free(ptr);},
        });
      }

      function __embind_register_std_wstring(rawType, charSize, name) {
        name = readLatin1String(name);
        var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
        if (charSize === 2) {
          decodeString = UTF16ToString;
          encodeString = stringToUTF16;
          lengthBytesUTF = lengthBytesUTF16;
          getHeap = function () {return HEAPU16;};
          shift = 1;
        } else if (charSize === 4) {
          decodeString = UTF32ToString;
          encodeString = stringToUTF32;
          lengthBytesUTF = lengthBytesUTF32;
          getHeap = function () {return HEAPU32;};
          shift = 2;
        }
        registerType(rawType, {
          name: name,
          'fromWireType': function (value) {
            // Code mostly taken from _embind_register_std_string fromWireType
            var length = HEAPU32[value >> 2];
            var HEAP = getHeap();
            var str;

            var decodeStartPtr = value + 4;
            // Looping here to support possible embedded '0' bytes
            for (var i = 0;i <= length;++i) {
              var currentBytePtr = value + 4 + i * charSize;
              if (i == length || HEAP[currentBytePtr >> shift] == 0) {
                var maxReadBytes = currentBytePtr - decodeStartPtr;
                var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
                if (str === undefined) {
                  str = stringSegment;
                } else {
                  str += String.fromCharCode(0);
                  str += stringSegment;
                }
                decodeStartPtr = currentBytePtr + charSize;
              }
            }

            _free(value);

            return str;
          },
          'toWireType': function (destructors, value) {
            if (!(typeof value === 'string')) {
              throwBindingError('Cannot pass non-string to C++ string type ' + name);
            }

            // assumes 4-byte alignment
            var length = lengthBytesUTF(value);
            var ptr = _malloc(4 + length + charSize);
            HEAPU32[ptr >> 2] = length >> shift;

            encodeString(value, ptr + 4, length + charSize);

            if (destructors !== null) {
              destructors.push(_free, ptr);
            }
            return ptr;
          },
          'argPackAdvance': 8,
          'readValueFromPointer': simpleReadValueFromPointer,
          destructorFunction: function (ptr) {_free(ptr);},
        });
      }

      function __embind_register_void(rawType, name) {
        name = readLatin1String(name);
        registerType(rawType, {
          isVoid: true, // void return values can be optimized out sometimes
          name: name,
          'argPackAdvance': 0,
          'fromWireType': function () {
            return undefined;
          },
          'toWireType': function (destructors, o) {
            // TODO: assert if anything else is given?
            return undefined;
          },
        });
      }

      function _emscripten_memcpy_big(dest, src, num) {
        HEAPU8.copyWithin(dest, src, src + num);
      }

      function abortOnCannotGrowMemory(requestedSize) {
        abort('OOM');
      }
      function _emscripten_resize_heap(requestedSize) {
        var oldSize = HEAPU8.length;
        requestedSize = requestedSize >>> 0;
        abortOnCannotGrowMemory(requestedSize);
      }
      embind_init_charCodes();
      BindingError = Module['BindingError'] = extendError(Error, 'BindingError');;
      InternalError = Module['InternalError'] = extendError(Error, 'InternalError');;
      init_emval();;
      var ASSERTIONS = false;



      /** @type {function(string, boolean=, number=)} */
      function intArrayFromString(stringy, dontAddNull, length) {
        var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
        var u8array = new Array(len);
        var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
        if (dontAddNull) u8array.length = numBytesWritten;
        return u8array;
      }

      function intArrayToString(array) {
        var ret = [];
        for (var i = 0;i < array.length;i++) {
          var chr = array[i];
          if (chr > 0xFF) {
            if (ASSERTIONS) {
              assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
            }
            chr &= 0xFF;
          }
          ret.push(String.fromCharCode(chr));
        }
        return ret.join('');
      }


      // Copied from https://github.com/strophe/strophejs/blob/e06d027/src/polyfills.js#L149

      // This code was written by Tyler Akins and has been placed in the
      // public domain.  It would be nice if you left this header intact.
      // Base64 code from Tyler Akins -- http://rumkin.com

      /**
       * Decodes a base64 string.
       * @param {string} input The string to decode.
       */
      var decodeBase64 = typeof atob === 'function' ? atob : function (input) {
        var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

        var output = '';
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
        do {
          enc1 = keyStr.indexOf(input.charAt(i++));
          enc2 = keyStr.indexOf(input.charAt(i++));
          enc3 = keyStr.indexOf(input.charAt(i++));
          enc4 = keyStr.indexOf(input.charAt(i++));

          chr1 = (enc1 << 2) | (enc2 >> 4);
          chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
          chr3 = ((enc3 & 3) << 6) | enc4;

          output = output + String.fromCharCode(chr1);

          if (enc3 !== 64) {
            output = output + String.fromCharCode(chr2);
          }
          if (enc4 !== 64) {
            output = output + String.fromCharCode(chr3);
          }
        } while (i < input.length);
        return output;
      };

      // Converts a string of base64 into a byte array.
      // Throws error on invalid input.
      function intArrayFromBase64(s) {

        try {
          var decoded = decodeBase64(s);
          var bytes = new Uint8Array(decoded.length);
          for (var i = 0;i < decoded.length;++i) {
            bytes[i] = decoded.charCodeAt(i);
          }
          return bytes;
        } catch (_) {
          throw new Error('Converting base64 string to bytes failed.');
        }
      }

      // If filename is a base64 data URI, parses and returns data (Buffer on node,
      // Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
      function tryParseAsDataURI(filename) {
        if (!isDataURI(filename)) {
          return;
        }

        return intArrayFromBase64(filename.slice(dataURIPrefix.length));
      }


      var asmLibraryArg = {
        "_embind_register_bool": __embind_register_bool,
        "_embind_register_emval": __embind_register_emval,
        "_embind_register_float": __embind_register_float,
        "_embind_register_integer": __embind_register_integer,
        "_embind_register_memory_view": __embind_register_memory_view,
        "_embind_register_std_string": __embind_register_std_string,
        "_embind_register_std_wstring": __embind_register_std_wstring,
        "_embind_register_void": __embind_register_void,
        "emscripten_memcpy_big": _emscripten_memcpy_big,
        "emscripten_resize_heap": _emscripten_resize_heap
      };
      var asm = createWasm();
      /** @type {function(...*):?} */
      var ___wasm_call_ctors = Module["___wasm_call_ctors"] = function () {
        return (___wasm_call_ctors = Module["___wasm_call_ctors"] = Module["asm"]["__wasm_call_ctors"]).apply(null, arguments);
      };

      /** @type {function(...*):?} */
      var _FFT = Module["_FFT"] = function () {
        return (_FFT = Module["_FFT"] = Module["asm"]["FFT"]).apply(null, arguments);
      };

      /** @type {function(...*):?} */
      var _iFFT = Module["_iFFT"] = function () {
        return (_iFFT = Module["_iFFT"] = Module["asm"]["iFFT"]).apply(null, arguments);
      };

      /** @type {function(...*):?} */
      var _sin_table = Module["_sin_table"] = function () {
        return (_sin_table = Module["_sin_table"] = Module["asm"]["sin_table"]).apply(null, arguments);
      };

      /** @type {function(...*):?} */
      var _bit_reverse = Module["_bit_reverse"] = function () {
        return (_bit_reverse = Module["_bit_reverse"] = Module["asm"]["bit_reverse"]).apply(null, arguments);
      };

      /** @type {function(...*):?} */
      var ___getTypeName = Module["___getTypeName"] = function () {
        return (___getTypeName = Module["___getTypeName"] = Module["asm"]["__getTypeName"]).apply(null, arguments);
      };

      /** @type {function(...*):?} */
      var ___embind_register_native_and_builtin_types = Module["___embind_register_native_and_builtin_types"] = function () {
        return (___embind_register_native_and_builtin_types = Module["___embind_register_native_and_builtin_types"] = Module["asm"]["__embind_register_native_and_builtin_types"]).apply(null, arguments);
      };

      /** @type {function(...*):?} */
      var ___errno_location = Module["___errno_location"] = function () {
        return (___errno_location = Module["___errno_location"] = Module["asm"]["__errno_location"]).apply(null, arguments);
      };

      /** @type {function(...*):?} */
      var _malloc = Module["_malloc"] = function () {
        return (_malloc = Module["_malloc"] = Module["asm"]["malloc"]).apply(null, arguments);
      };

      /** @type {function(...*):?} */
      var stackSave = Module["stackSave"] = function () {
        return (stackSave = Module["stackSave"] = Module["asm"]["stackSave"]).apply(null, arguments);
      };

      /** @type {function(...*):?} */
      var stackRestore = Module["stackRestore"] = function () {
        return (stackRestore = Module["stackRestore"] = Module["asm"]["stackRestore"]).apply(null, arguments);
      };

      /** @type {function(...*):?} */
      var stackAlloc = Module["stackAlloc"] = function () {
        return (stackAlloc = Module["stackAlloc"] = Module["asm"]["stackAlloc"]).apply(null, arguments);
      };

      /** @type {function(...*):?} */
      var _free = Module["_free"] = function () {
        return (_free = Module["_free"] = Module["asm"]["free"]).apply(null, arguments);
      };





      // === Auto-generated postamble setup entry stuff ===

      Module["ccall"] = ccall;
      Module["cwrap"] = cwrap;

      var calledRun;

      /**
       * @constructor
       * @this {ExitStatus}
       */
      function ExitStatus(status) {
        this.name = "ExitStatus";
        this.message = "Program terminated with exit(" + status + ")";
        this.status = status;
      }

      var calledMain = false;

      dependenciesFulfilled = function runCaller() {
        // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
        if (!calledRun) run();
        if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
      };

      /** @type {function(Array=)} */
      function run(args) {
        args = args || arguments_;

        if (runDependencies > 0) {
          return;
        }

        preRun();

        // a preRun added a dependency, run will be called later
        if (runDependencies > 0) {
          return;
        }

        function doRun() {
          // run may have just been called through dependencies being fulfilled just in this very frame,
          // or while the async setStatus time below was happening
          if (calledRun) return;
          calledRun = true;
          Module['calledRun'] = true;

          if (ABORT) return;

          initRuntime();

          preMain();

          readyPromiseResolve(Module);
          if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

          postRun();
        }

        if (Module['setStatus']) {
          Module['setStatus']('Running...');
          setTimeout(function () {
            setTimeout(function () {
              Module['setStatus']('');
            }, 1);
            doRun();
          }, 1);
        } else {
          doRun();
        }
      }
      Module['run'] = run;

      /** @param {boolean|number=} implicit */
      function exit(status, implicit) {
        EXITSTATUS = status;

        // if this is just main exit-ing implicitly, and the status is 0, then we
        // don't need to do anything here and can just leave. if the status is
        // non-zero, though, then we need to report it.
        // (we may have warned about this earlier, if a situation justifies doing so)
        if (implicit && keepRuntimeAlive() && status === 0) {
          return;
        }

        if (keepRuntimeAlive()) {
        } else {

          exitRuntime();

          if (Module['onExit']) Module['onExit'](status);

          ABORT = true;
        }

        quit_(status, new ExitStatus(status));
      }

      if (Module['preInit']) {
        if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
        while (Module['preInit'].length > 0) {
          Module['preInit'].pop()();
        }
      }

      run();







      return createModule.ready
    }
  );
})();
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = createModule;
else if (typeof define === 'function' && define['amd'])
  define([], function () {return createModule;});
else if (typeof exports === 'object')
  exports["createModule"] = createModule;
