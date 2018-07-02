(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("Wb8Gej"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/base64-js/lib/b64.js","/../../node_modules/base64-js/lib")
},{"Wb8Gej":2,"buffer":3}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("Wb8Gej"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/browserify/node_modules/process/browser.js","/../../node_modules/browserify/node_modules/process")
},{"Wb8Gej":2,"buffer":3}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("Wb8Gej"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/buffer/index.js","/../../node_modules/buffer")
},{"Wb8Gej":2,"base64-js":1,"buffer":3,"ieee754":4}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

}).call(this,require("Wb8Gej"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/ieee754/index.js","/../../node_modules/ieee754")
},{"Wb8Gej":2,"buffer":3}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*
 * Copyright (c) 2009 The Chromium Authors. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *    * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *    * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// A simple camera controller which uses an HTML element as the event
// source for constructing a view matrix. Assign an "onchange"
// function to the controller as follows to receive the updated X and
// Y angles for the camera:
//
//   var controller = new CameraController(canvas);
//   controller.onchange = function(xRot, yRot) { ... };
//
// The view matrix is computed elsewhere.
//
// opt_canvas (an HTMLCanvasElement) and opt_context (a
// WebGLRenderingContext) can be passed in to make the hit detection
// more precise -- only opaque pixels will be considered as the start
// of a drag action.
function CameraController(element, opt_canvas, opt_context) {
    var controller = this;
    this.onchange = null;
    this.xRot = 0;
    this.yRot = 0;
    this.zRot = 0;
    this.scaleFactor = 3.0;
    this.dragging = false;
    this.curX = 0;
    this.curY = 0;

    if (opt_canvas)
        this.canvas_ = opt_canvas;

    if (opt_context)
        this.context_ = opt_context;

    // TODO(smus): Remove this to re-introduce mouse panning.
    return;

    // Assign a mouse down handler to the HTML element.
    element.onmousedown = function(ev) {
        controller.curX = ev.clientX;
        controller.curY = ev.clientY;
        var dragging = false;
        if (controller.canvas_ && controller.context_) {
            var rect = controller.canvas_.getBoundingClientRect();
            // Transform the event's x and y coordinates into the coordinate
            // space of the canvas
            var canvasRelativeX = ev.pageX - rect.left;
            var canvasRelativeY = ev.pageY - rect.top;
            var canvasWidth = controller.canvas_.width;
            var canvasHeight = controller.canvas_.height;

            // Read back a small portion of the frame buffer around this point
            if (canvasRelativeX > 0 && canvasRelativeX < canvasWidth &&
                canvasRelativeY > 0 && canvasRelativeY < canvasHeight) {
                var pixels = controller.context_.readPixels(canvasRelativeX,
                                                            canvasHeight - canvasRelativeY,
                                                            1,
                                                            1,
                                                            controller.context_.RGBA,
                                                            controller.context_.UNSIGNED_BYTE);
                if (pixels) {
                    // See whether this pixel has an alpha value of >= about 10%
                    if (pixels[3] > (255.0 / 10.0)) {
                        dragging = true;
                    }
                }
            }
        } else {
            dragging = true;
        }

        controller.dragging = dragging;
    };

    // Assign a mouse up handler to the HTML element.
    element.onmouseup = function(ev) {
        controller.dragging = false;
    };

    // Assign a mouse move handler to the HTML element.
    element.onmousemove = function(ev) {
        if (controller.dragging) {
            // Determine how far we have moved since the last mouse move
            // event.
            var curX = ev.clientX;
            var curY = ev.clientY;
            var deltaX = (controller.curX - curX) / controller.scaleFactor;
            var deltaY = (controller.curY - curY) / controller.scaleFactor;
            controller.curX = curX;
            controller.curY = curY;
            // Update the X and Y rotation angles based on the mouse motion.
            controller.yRot = (controller.yRot + deltaX) % 360;
            controller.xRot = (controller.xRot + deltaY);
            // Clamp the X rotation to prevent the camera from going upside
            // down.
            if (controller.xRot < -90) {
                controller.xRot = -90;
            } else if (controller.xRot > 90) {
                controller.xRot = 90;
            }
            // Send the onchange event to any listener.
            if (controller.onchange != null) {
                controller.onchange(controller.xRot, controller.yRot);
            }
        }
    };
}


module.exports = CameraController;

}).call(this,require("Wb8Gej"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/3D/cameraController.js","/3D")
},{"Wb8Gej":2,"buffer":3}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*
 * Copyright (c) 2009, Mozilla Corp
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the <organization> nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY <copyright holder> ''AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL <copyright holder> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * Based on sample code from the OpenGL(R) ES 2.0 Programming Guide, which carriers
 * the following header:
 *
 * Book:      OpenGL(R) ES 2.0 Programming Guide
 * Authors:   Aaftab Munshi, Dan Ginsburg, Dave Shreiner
 * ISBN-10:   0321502795
 * ISBN-13:   9780321502797
 * Publisher: Addison-Wesley Professional
 * URLs:      http://safari.informit.com/9780321563835
 *            http://www.opengles-book.com
 */

//
// A simple 4x4 Matrix utility class
//

function Matrix4x4() {
  this.elements = Array(16);
  this.loadIdentity();
}

Matrix4x4.prototype = {
  scale: function (sx, sy, sz) {
    this.elements[0*4+0] *= sx;
    this.elements[0*4+1] *= sx;
    this.elements[0*4+2] *= sx;
    this.elements[0*4+3] *= sx;

    this.elements[1*4+0] *= sy;
    this.elements[1*4+1] *= sy;
    this.elements[1*4+2] *= sy;
    this.elements[1*4+3] *= sy;

    this.elements[2*4+0] *= sz;
    this.elements[2*4+1] *= sz;
    this.elements[2*4+2] *= sz;
    this.elements[2*4+3] *= sz;

    return this;
  },

  translate: function (tx, ty, tz) {
    this.elements[3*4+0] += this.elements[0*4+0] * tx + this.elements[1*4+0] * ty + this.elements[2*4+0] * tz;
    this.elements[3*4+1] += this.elements[0*4+1] * tx + this.elements[1*4+1] * ty + this.elements[2*4+1] * tz;
    this.elements[3*4+2] += this.elements[0*4+2] * tx + this.elements[1*4+2] * ty + this.elements[2*4+2] * tz;
    this.elements[3*4+3] += this.elements[0*4+3] * tx + this.elements[1*4+3] * ty + this.elements[2*4+3] * tz;

    return this;
  },

  rotate: function (angle, x, y, z) {
    var mag = Math.sqrt(x*x + y*y + z*z);
    var sinAngle = Math.sin(angle * Math.PI / 180.0);
    var cosAngle = Math.cos(angle * Math.PI / 180.0);

    if (mag > 0) {
      var xx, yy, zz, xy, yz, zx, xs, ys, zs;
      var oneMinusCos;
      var rotMat;

      x /= mag;
      y /= mag;
      z /= mag;

      xx = x * x;
      yy = y * y;
      zz = z * z;
      xy = x * y;
      yz = y * z;
      zx = z * x;
      xs = x * sinAngle;
      ys = y * sinAngle;
      zs = z * sinAngle;
      oneMinusCos = 1.0 - cosAngle;

      rotMat = new Matrix4x4();

      rotMat.elements[0*4+0] = (oneMinusCos * xx) + cosAngle;
      rotMat.elements[0*4+1] = (oneMinusCos * xy) - zs;
      rotMat.elements[0*4+2] = (oneMinusCos * zx) + ys;
      rotMat.elements[0*4+3] = 0.0;

      rotMat.elements[1*4+0] = (oneMinusCos * xy) + zs;
      rotMat.elements[1*4+1] = (oneMinusCos * yy) + cosAngle;
      rotMat.elements[1*4+2] = (oneMinusCos * yz) - xs;
      rotMat.elements[1*4+3] = 0.0;

      rotMat.elements[2*4+0] = (oneMinusCos * zx) - ys;
      rotMat.elements[2*4+1] = (oneMinusCos * yz) + xs;
      rotMat.elements[2*4+2] = (oneMinusCos * zz) + cosAngle;
      rotMat.elements[2*4+3] = 0.0;

      rotMat.elements[3*4+0] = 0.0;
      rotMat.elements[3*4+1] = 0.0;
      rotMat.elements[3*4+2] = 0.0;
      rotMat.elements[3*4+3] = 1.0;

      rotMat = rotMat.multiply(this);
      this.elements = rotMat.elements;
    }

    return this;
  },

  frustum: function (left, right, bottom, top, nearZ, farZ) {
    var deltaX = right - left;
    var deltaY = top - bottom;
    var deltaZ = farZ - nearZ;
    var frust;

    if ( (nearZ <= 0.0) || (farZ <= 0.0) ||
         (deltaX <= 0.0) || (deltaY <= 0.0) || (deltaZ <= 0.0) )
         return this;

    frust = new Matrix4x4();

    frust.elements[0*4+0] = 2.0 * nearZ / deltaX;
    frust.elements[0*4+1] = frust.elements[0*4+2] = frust.elements[0*4+3] = 0.0;

    frust.elements[1*4+1] = 2.0 * nearZ / deltaY;
    frust.elements[1*4+0] = frust.elements[1*4+2] = frust.elements[1*4+3] = 0.0;

    frust.elements[2*4+0] = (right + left) / deltaX;
    frust.elements[2*4+1] = (top + bottom) / deltaY;
    frust.elements[2*4+2] = -(nearZ + farZ) / deltaZ;
    frust.elements[2*4+3] = -1.0;

    frust.elements[3*4+2] = -2.0 * nearZ * farZ / deltaZ;
    frust.elements[3*4+0] = frust.elements[3*4+1] = frust.elements[3*4+3] = 0.0;

    frust = frust.multiply(this);
    this.elements = frust.elements;

    return this;
  },

  perspective: function (fovy, aspect, nearZ, farZ) {
    var frustumH = Math.tan(fovy / 360.0 * Math.PI) * nearZ;
    var frustumW = frustumH * aspect;

    return this.frustum(-frustumW, frustumW, -frustumH, frustumH, nearZ, farZ);
  },

  ortho: function (left, right, bottom, top, nearZ, farZ) {
    var deltaX = right - left;
    var deltaY = top - bottom;
    var deltaZ = farZ - nearZ;

    var ortho = new Matrix4x4();

    if ( (deltaX == 0.0) || (deltaY == 0.0) || (deltaZ == 0.0) )
        return this;

    ortho.elements[0*4+0] = 2.0 / deltaX;
    ortho.elements[3*4+0] = -(right + left) / deltaX;
    ortho.elements[1*4+1] = 2.0 / deltaY;
    ortho.elements[3*4+1] = -(top + bottom) / deltaY;
    ortho.elements[2*4+2] = -2.0 / deltaZ;
    ortho.elements[3*4+2] = -(nearZ + farZ) / deltaZ;

    ortho = ortho.multiply(this);
    this.elements = ortho.elements;

    return this;
  },

  multiply: function (right) {
    var tmp = new Matrix4x4();

    for (var i = 0; i < 4; i++) {
      tmp.elements[i*4+0] =
	(this.elements[i*4+0] * right.elements[0*4+0]) +
	(this.elements[i*4+1] * right.elements[1*4+0]) +
	(this.elements[i*4+2] * right.elements[2*4+0]) +
	(this.elements[i*4+3] * right.elements[3*4+0]) ;

      tmp.elements[i*4+1] =
	(this.elements[i*4+0] * right.elements[0*4+1]) +
	(this.elements[i*4+1] * right.elements[1*4+1]) +
	(this.elements[i*4+2] * right.elements[2*4+1]) +
	(this.elements[i*4+3] * right.elements[3*4+1]) ;

      tmp.elements[i*4+2] =
	(this.elements[i*4+0] * right.elements[0*4+2]) +
	(this.elements[i*4+1] * right.elements[1*4+2]) +
	(this.elements[i*4+2] * right.elements[2*4+2]) +
	(this.elements[i*4+3] * right.elements[3*4+2]) ;

      tmp.elements[i*4+3] =
	(this.elements[i*4+0] * right.elements[0*4+3]) +
	(this.elements[i*4+1] * right.elements[1*4+3]) +
	(this.elements[i*4+2] * right.elements[2*4+3]) +
	(this.elements[i*4+3] * right.elements[3*4+3]) ;
    }

    this.elements = tmp.elements;
    return this;
  },

  copy: function () {
    var tmp = new Matrix4x4();
    for (var i = 0; i < 16; i++) {
      tmp.elements[i] = this.elements[i];
    }
    return tmp;
  },

  get: function (row, col) {
    return this.elements[4*row+col];
  },

  // In-place inversion
  invert: function () {
    var tmp_0 = this.get(2,2) * this.get(3,3);
    var tmp_1 = this.get(3,2) * this.get(2,3);
    var tmp_2 = this.get(1,2) * this.get(3,3);
    var tmp_3 = this.get(3,2) * this.get(1,3);
    var tmp_4 = this.get(1,2) * this.get(2,3);
    var tmp_5 = this.get(2,2) * this.get(1,3);
    var tmp_6 = this.get(0,2) * this.get(3,3);
    var tmp_7 = this.get(3,2) * this.get(0,3);
    var tmp_8 = this.get(0,2) * this.get(2,3);
    var tmp_9 = this.get(2,2) * this.get(0,3);
    var tmp_10 = this.get(0,2) * this.get(1,3);
    var tmp_11 = this.get(1,2) * this.get(0,3);
    var tmp_12 = this.get(2,0) * this.get(3,1);
    var tmp_13 = this.get(3,0) * this.get(2,1);
    var tmp_14 = this.get(1,0) * this.get(3,1);
    var tmp_15 = this.get(3,0) * this.get(1,1);
    var tmp_16 = this.get(1,0) * this.get(2,1);
    var tmp_17 = this.get(2,0) * this.get(1,1);
    var tmp_18 = this.get(0,0) * this.get(3,1);
    var tmp_19 = this.get(3,0) * this.get(0,1);
    var tmp_20 = this.get(0,0) * this.get(2,1);
    var tmp_21 = this.get(2,0) * this.get(0,1);
    var tmp_22 = this.get(0,0) * this.get(1,1);
    var tmp_23 = this.get(1,0) * this.get(0,1);

    var t0 = ((tmp_0 * this.get(1,1) + tmp_3 * this.get(2,1) + tmp_4 * this.get(3,1)) -
              (tmp_1 * this.get(1,1) + tmp_2 * this.get(2,1) + tmp_5 * this.get(3,1)));
    var t1 = ((tmp_1 * this.get(0,1) + tmp_6 * this.get(2,1) + tmp_9 * this.get(3,1)) -
              (tmp_0 * this.get(0,1) + tmp_7 * this.get(2,1) + tmp_8 * this.get(3,1)));
    var t2 = ((tmp_2 * this.get(0,1) + tmp_7 * this.get(1,1) + tmp_10 * this.get(3,1)) -
              (tmp_3 * this.get(0,1) + tmp_6 * this.get(1,1) + tmp_11 * this.get(3,1)));
    var t3 = ((tmp_5 * this.get(0,1) + tmp_8 * this.get(1,1) + tmp_11 * this.get(2,1)) -
              (tmp_4 * this.get(0,1) + tmp_9 * this.get(1,1) + tmp_10 * this.get(2,1)));

    var d = 1.0 / (this.get(0,0) * t0 + this.get(1,0) * t1 + this.get(2,0) * t2 + this.get(3,0) * t3);

    var out_00 = d * t0;
    var out_01 = d * t1;
    var out_02 = d * t2;
    var out_03 = d * t3;

    var out_10 = d * ((tmp_1 * this.get(1,0) + tmp_2 * this.get(2,0) + tmp_5 * this.get(3,0)) -
                      (tmp_0 * this.get(1,0) + tmp_3 * this.get(2,0) + tmp_4 * this.get(3,0)));
    var out_11 = d * ((tmp_0 * this.get(0,0) + tmp_7 * this.get(2,0) + tmp_8 * this.get(3,0)) -
                      (tmp_1 * this.get(0,0) + tmp_6 * this.get(2,0) + tmp_9 * this.get(3,0)));
    var out_12 = d * ((tmp_3 * this.get(0,0) + tmp_6 * this.get(1,0) + tmp_11 * this.get(3,0)) -
                      (tmp_2 * this.get(0,0) + tmp_7 * this.get(1,0) + tmp_10 * this.get(3,0)));
    var out_13 = d * ((tmp_4 * this.get(0,0) + tmp_9 * this.get(1,0) + tmp_10 * this.get(2,0)) -
                      (tmp_5 * this.get(0,0) + tmp_8 * this.get(1,0) + tmp_11 * this.get(2,0)));

    var out_20 = d * ((tmp_12 * this.get(1,3) + tmp_15 * this.get(2,3) + tmp_16 * this.get(3,3)) -
                      (tmp_13 * this.get(1,3) + tmp_14 * this.get(2,3) + tmp_17 * this.get(3,3)));
    var out_21 = d * ((tmp_13 * this.get(0,3) + tmp_18 * this.get(2,3) + tmp_21 * this.get(3,3)) -
                      (tmp_12 * this.get(0,3) + tmp_19 * this.get(2,3) + tmp_20 * this.get(3,3)));
    var out_22 = d * ((tmp_14 * this.get(0,3) + tmp_19 * this.get(1,3) + tmp_22 * this.get(3,3)) -
                      (tmp_15 * this.get(0,3) + tmp_18 * this.get(1,3) + tmp_23 * this.get(3,3)));
    var out_23 = d * ((tmp_17 * this.get(0,3) + tmp_20 * this.get(1,3) + tmp_23 * this.get(2,3)) -
                      (tmp_16 * this.get(0,3) + tmp_21 * this.get(1,3) + tmp_22 * this.get(2,3)));

    var out_30 = d * ((tmp_14 * this.get(2,2) + tmp_17 * this.get(3,2) + tmp_13 * this.get(1,2)) -
                      (tmp_16 * this.get(3,2) + tmp_12 * this.get(1,2) + tmp_15 * this.get(2,2)));
    var out_31 = d * ((tmp_20 * this.get(3,2) + tmp_12 * this.get(0,2) + tmp_19 * this.get(2,2)) -
                      (tmp_18 * this.get(2,2) + tmp_21 * this.get(3,2) + tmp_13 * this.get(0,2)));
    var out_32 = d * ((tmp_18 * this.get(1,2) + tmp_23 * this.get(3,2) + tmp_15 * this.get(0,2)) -
                      (tmp_22 * this.get(3,2) + tmp_14 * this.get(0,2) + tmp_19 * this.get(1,2)));
    var out_33 = d * ((tmp_22 * this.get(2,2) + tmp_16 * this.get(0,2) + tmp_21 * this.get(1,2)) -
                      (tmp_20 * this.get(1,2) + tmp_23 * this.get(2,2) + tmp_17 * this.get(0,2)));

    this.elements[0*4+0] = out_00;
    this.elements[0*4+1] = out_01;
    this.elements[0*4+2] = out_02;
    this.elements[0*4+3] = out_03;
    this.elements[1*4+0] = out_10;
    this.elements[1*4+1] = out_11;
    this.elements[1*4+2] = out_12;
    this.elements[1*4+3] = out_13;
    this.elements[2*4+0] = out_20;
    this.elements[2*4+1] = out_21;
    this.elements[2*4+2] = out_22;
    this.elements[2*4+3] = out_23;
    this.elements[3*4+0] = out_30;
    this.elements[3*4+1] = out_31;
    this.elements[3*4+2] = out_32;
    this.elements[3*4+3] = out_33;
    return this;
  },

  // Returns new matrix which is the inverse of this
  inverse: function () {
    var tmp = this.copy();
    return tmp.invert();
  },

  // In-place transpose
  transpose: function () {
    var tmp = this.elements[0*4+1];
    this.elements[0*4+1] = this.elements[1*4+0];
    this.elements[1*4+0] = tmp;

    tmp = this.elements[0*4+2];
    this.elements[0*4+2] = this.elements[2*4+0];
    this.elements[2*4+0] = tmp;

    tmp = this.elements[0*4+3];
    this.elements[0*4+3] = this.elements[3*4+0];
    this.elements[3*4+0] = tmp;

    tmp = this.elements[1*4+2];
    this.elements[1*4+2] = this.elements[2*4+1];
    this.elements[2*4+1] = tmp;

    tmp = this.elements[1*4+3];
    this.elements[1*4+3] = this.elements[3*4+1];
    this.elements[3*4+1] = tmp;

    tmp = this.elements[2*4+3];
    this.elements[2*4+3] = this.elements[3*4+2];
    this.elements[3*4+2] = tmp;

    return this;
  },

  loadIdentity: function () {
    for (var i = 0; i < 16; i++)
      this.elements[i] = 0;
    this.elements[0*4+0] = 1.0;
    this.elements[1*4+1] = 1.0;
    this.elements[2*4+2] = 1.0;
    this.elements[3*4+3] = 1.0;
    return this;
  }
};

module.exports = Matrix4x4;

}).call(this,require("Wb8Gej"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/3D/matrix4x4.js","/3D")
},{"Wb8Gej":2,"buffer":3}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/********************************************************
Copyright 2016 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*********************************************************/

var Matrix4x4 = require('./matrix4x4');
var CameraController = require('./cameraController');

var ANALYSISTYPE_FREQUENCY 		= 0;
var ANALYSISTYPE_SONOGRAM 		= 1;
var ANALYSISTYPE_3D_SONOGRAM 	= 2;
var ANALYSISTYPE_WAVEFORM 		= 3;

// The "model" matrix is the "world" matrix in Standard Annotations and Semantics
var model 		= 0;
var view 		= 0;
var projection 	= 0;

function createGLErrorWrapper(context, fname) {
	return function() {
		var rv = context[fname].apply(context, arguments);
		var err = context.getError();
		if (err != 0)
			throw "GL error " + err + " in " + fname;
		return rv;
	};
}

function create3DDebugContext(context) {
	// Thanks to Ilmari Heikkinen for the idea on how to implement this so elegantly.
	var wrap = {};
	for (var i in context) {
		try {
			if (typeof context[i] == 'function') {
				wrap[i] = createGLErrorWrapper(context, i);
			} else {
				wrap[i] = context[i];
			}
		} catch (e) {
			// console.log("create3DDebugContext: Error accessing " + i);
		}
	}
	wrap.getError = function() {
		return context.getError();
	};
	return wrap;
}

/**
 * Class AnalyserView
 */

AnalyserView = function(canvas) {
	// NOTE: the default value of this needs to match the selected radio button

	// This analysis type may be overriden later on if we discover we don't support the right shader features.
	this.analysisType = ANALYSISTYPE_3D_SONOGRAM;

	this.sonogram3DWidth = 256;
	this.sonogram3DHeight = 256;
	this.sonogram3DGeometrySize = 9.5;
	
	this.freqByteData = 0;
	this.texture = 0;
	this.TEXTURE_HEIGHT = 256;
	this.yoffset = 0;

	this.frequencyShader = 0;
	this.waveformShader = 0;
	this.sonogramShader = 0;
	this.sonogram3DShader = 0;

	// Background color
	this.backgroundColor = [.08, .08, .08, 1];
	this.foregroundColor = [0,.7,0,1];

	this.canvas = canvas;
	this.initGL();
}

AnalyserView.prototype.getAvailableContext = function(canvas, contextList) {
	if (canvas.getContext) {
		for(var i = 0; i < contextList.length; ++i) {
			try {
				var context = canvas.getContext(contextList[i], { antialias:true });
				if(context !== null)
					return context;
			} catch(ex) { }
		}
	}
	return null;
}

AnalyserView.prototype.initGL = function() {
	model 		= new Matrix4x4();
	view 		= new Matrix4x4();
	projection 	= new Matrix4x4();
	// ________________________________________
	var sonogram3DWidth = this.sonogram3DWidth;
	var sonogram3DHeight = this.sonogram3DHeight;
	var sonogram3DGeometrySize = this.sonogram3DGeometrySize;
	var backgroundColor = this.backgroundColor;
	// ________________________________________
	var canvas = this.canvas;
	// ________________________________________
	var gl = this.getAvailableContext(canvas, ['webgl', 'experimental-webgl']);
	this.gl = gl;

	// If we're missing this shader feature, then we can't do the 3D visualization.
	this.has3DVisualizer = (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) > 0);

	if (!this.has3DVisualizer && this.analysisType == ANALYSISTYPE_3D_SONOGRAM)
		this.analysisType = ANALYSISTYPE_FREQUENCY;

	var cameraController = new CameraController(canvas);
	this.cameraController = cameraController;


	cameraController.xRot = -180;
	cameraController.yRot = 270;
	cameraController.zRot = 90;

	cameraController.xT = 0;
	// Zoom level.
	cameraController.yT = -2;
	// Translation in the x axis.
	cameraController.zT = -2;

	gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], backgroundColor[3]);
	gl.enable(gl.DEPTH_TEST);

	// Initialization for the 2D visualizations
	var vertices = new Float32Array([
		1.0,   1.0,   0.0,
		-1.0,   1.0,   0.0,
		-1.0,   -1.0,   0.0,
		1.0,   1.0,   0.0,
		-1.0,   -1.0,   0.0,
		1.0,   -1.0,   0.0]);
	var texCoords = new Float32Array([
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 1.0,
		0.0, 0.0,
		1.0, 0.0]);

	var vboTexCoordOffset = vertices.byteLength;
	this.vboTexCoordOffset = vboTexCoordOffset;

	// Create the vertices and texture coordinates
	var vbo = gl.createBuffer();
	this.vbo = vbo;

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER,
		vboTexCoordOffset + texCoords.byteLength,
		gl.STATIC_DRAW);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
		gl.bufferSubData(gl.ARRAY_BUFFER, vboTexCoordOffset, texCoords);

	// Initialization for the 3D visualizations
	var numVertices = sonogram3DWidth * sonogram3DHeight;
	if (numVertices > 65536) {
		throw "Sonogram 3D resolution is too high: can only handle 65536 vertices max";
	}
	vertices = new Float32Array(numVertices * 3);
	texCoords = new Float32Array(numVertices * 2);

	for (var z = 0; z < sonogram3DHeight; z++) {
		for (var x = 0; x < sonogram3DWidth; x++) {
			// Generate a reasonably fine mesh in the X-Z plane
			vertices[3 * (sonogram3DWidth * z + x) + 0] =
			sonogram3DGeometrySize * (x - sonogram3DWidth / 2) / sonogram3DWidth;
			vertices[3 * (sonogram3DWidth * z + x) + 1] = 0;
			vertices[3 * (sonogram3DWidth * z + x) + 2] = sonogram3DGeometrySize * (z - sonogram3DHeight / 2) / sonogram3DHeight;

			texCoords[2 * (sonogram3DWidth * z + x) + 0] = x / (sonogram3DWidth - 1);
			texCoords[2 * (sonogram3DWidth * z + x) + 1] = z / (sonogram3DHeight - 1);
		}
	}

	var vbo3DTexCoordOffset = vertices.byteLength;
	this.vbo3DTexCoordOffset = vbo3DTexCoordOffset;

	// Create the vertices and texture coordinates
	var sonogram3DVBO = gl.createBuffer();
	this.sonogram3DVBO = sonogram3DVBO;

	gl.bindBuffer(gl.ARRAY_BUFFER, sonogram3DVBO);
	gl.bufferData(gl.ARRAY_BUFFER, vbo3DTexCoordOffset + texCoords.byteLength, gl.STATIC_DRAW);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
	gl.bufferSubData(gl.ARRAY_BUFFER, vbo3DTexCoordOffset, texCoords);

	// Now generate indices
	var sonogram3DNumIndices = (sonogram3DWidth - 1) * (sonogram3DHeight - 1) * 6;
	this.sonogram3DNumIndices = sonogram3DNumIndices - (6 * 600);

	var indices = new Uint16Array(sonogram3DNumIndices);
	// We need to use TRIANGLES instead of for example TRIANGLE_STRIP
	// because we want to make one draw call instead of hundreds per
	// frame, and unless we produce degenerate triangles (which are very
	// ugly) we won't be able to split the rows.
	var idx = 0;
	for (var z = 0; z < sonogram3DHeight - 1; z++) {
		for (var x = 0; x < sonogram3DWidth - 1; x++) {
			indices[idx++] = z * sonogram3DWidth + x;
			indices[idx++] = z * sonogram3DWidth + x + 1;
			indices[idx++] = (z + 1) * sonogram3DWidth + x + 1;
			indices[idx++] = z * sonogram3DWidth + x;
			indices[idx++] = (z + 1) * sonogram3DWidth + x + 1;
			indices[idx++] = (z + 1) * sonogram3DWidth + x;
		}
	}

	var sonogram3DIBO = gl.createBuffer();
	this.sonogram3DIBO = sonogram3DIBO;

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sonogram3DIBO);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
	// Note we do not unbind this buffer -- not necessary

	// Load the shaders
	this.frequencyShader = o3djs.shader.loadFromURL(gl, "bin/shaders/common-vertex.shader", "bin/shaders/frequency-fragment.shader");
	this.waveformShader = o3djs.shader.loadFromURL(gl, "bin/shaders/common-vertex.shader", "bin/shaders/waveform-fragment.shader");
	this.sonogramShader = o3djs.shader.loadFromURL(gl, "bin/shaders/common-vertex.shader", "bin/shaders/sonogram-fragment.shader");

	if (this.has3DVisualizer){
		this.sonogram3DShader = o3djs.shader.loadFromURL(gl, "bin/shaders/sonogram-vertex.shader", "bin/shaders/sonogram-fragment.shader");

	}
	console.log('this.sonogramShader', this.sonogramShader);
	console.log('this.sonogram3DShader', this.sonogram3DShader);
}

AnalyserView.prototype.initByteBuffer = function() {
	var gl = this.gl;
	var TEXTURE_HEIGHT = this.TEXTURE_HEIGHT;

	if (!this.freqByteData || this.freqByteData.length != this.analyser.frequencyBinCount) {
		freqByteData = new Uint8Array(this.analyser.frequencyBinCount);
		this.freqByteData = freqByteData;

		// (Re-)Allocate the texture object
		if (this.texture) {
			gl.deleteTexture(this.texture);
			this.texture = null;
		}
		var texture = gl.createTexture();
		this.texture = texture;

		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		// TODO(kbr): WebGL needs to properly clear out the texture when null is specified
		var tmp = new Uint8Array(freqByteData.length * TEXTURE_HEIGHT);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, freqByteData.length, TEXTURE_HEIGHT, 0, gl.ALPHA, gl.UNSIGNED_BYTE, tmp);
	}
}

AnalyserView.prototype.setAnalysisType = function(type) {
	// Check for read textures in vertex shaders.
	if (!this.has3DVisualizer && type == ANALYSISTYPE_3D_SONOGRAM)
		return;

	this.analysisType = type;
}

AnalyserView.prototype.analysisType = function() {
	return this.analysisType;
}

AnalyserView.prototype.doFrequencyAnalysis = function(event) {
	var freqByteData = this.freqByteData;

	switch(this.analysisType) {
	case ANALYSISTYPE_FREQUENCY:
		this.analyser.smoothingTimeConstant = 0.75;
		this.analyser.getByteFrequencyData(freqByteData);
		break;

	case ANALYSISTYPE_SONOGRAM:
	case ANALYSISTYPE_3D_SONOGRAM:
		this.analyser.smoothingTimeConstant = 0;
		this.analyser.getByteFrequencyData(freqByteData);
		break;

	case ANALYSISTYPE_WAVEFORM:
		this.analyser.smoothingTimeConstant = 0.1;
		this.analyser.getByteTimeDomainData(freqByteData);
		break;
	}

	this.drawGL();
}

AnalyserView.prototype.drawGL = function() {
	var canvas = this.canvas;
	var gl = this.gl;
	var vbo = this.vbo;
	var vboTexCoordOffset = this.vboTexCoordOffset;
	var sonogram3DVBO = this.sonogram3DVBO;
	var vbo3DTexCoordOffset = this.vbo3DTexCoordOffset;
	var sonogram3DGeometrySize = this.sonogram3DGeometrySize;
	var sonogram3DNumIndices = this.sonogram3DNumIndices;
	var sonogram3DWidth = this.sonogram3DWidth;
	var sonogram3DHeight = this.sonogram3DHeight;
	var freqByteData = this.freqByteData;
	var texture = this.texture;
	var TEXTURE_HEIGHT = this.TEXTURE_HEIGHT;

	var frequencyShader = this.frequencyShader;
	var waveformShader = this.waveformShader;
	var sonogramShader = this.sonogramShader;
	var sonogram3DShader = this.sonogram3DShader;


	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
	if (this.analysisType != ANALYSISTYPE_SONOGRAM && this.analysisType != ANALYSISTYPE_3D_SONOGRAM) {
		this.yoffset = 0;
	}

	gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, this.yoffset, freqByteData.length, 1, gl.ALPHA, gl.UNSIGNED_BYTE, freqByteData);

	if (this.analysisType == ANALYSISTYPE_SONOGRAM || this.analysisType == ANALYSISTYPE_3D_SONOGRAM) {
		this.yoffset = (this.yoffset + 1) % TEXTURE_HEIGHT;
	}
	var yoffset = this.yoffset;

	// Point the frequency data texture at texture unit 0 (the default),
	// which is what we're using since we haven't called activeTexture
	// in our program

	var vertexLoc;
	var texCoordLoc;
	var frequencyDataLoc;
	var foregroundColorLoc;
	var backgroundColorLoc;
	var texCoordOffset;

	var currentShader;

	switch (this.analysisType) {
	case ANALYSISTYPE_FREQUENCY:
	case ANALYSISTYPE_WAVEFORM:
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		currentShader = this.analysisType == ANALYSISTYPE_FREQUENCY ? frequencyShader : waveformShader;
		currentShader.bind();
		vertexLoc = currentShader.gPositionLoc;
		texCoordLoc = currentShader.gTexCoord0Loc;
		frequencyDataLoc = currentShader.frequencyDataLoc;
		foregroundColorLoc = currentShader.foregroundColorLoc;
		backgroundColorLoc = currentShader.backgroundColorLoc;
		gl.uniform1f(currentShader.yoffsetLoc, 0.5 / (TEXTURE_HEIGHT - 1));
		texCoordOffset = vboTexCoordOffset;
		break;

	case ANALYSISTYPE_SONOGRAM:
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		sonogramShader.bind();
		vertexLoc = sonogramShader.gPositionLoc;
		texCoordLoc = sonogramShader.gTexCoord0Loc;
		frequencyDataLoc = sonogramShader.frequencyDataLoc;
		foregroundColorLoc = sonogramShader.foregroundColorLoc;
		backgroundColorLoc = sonogramShader.backgroundColorLoc;
		gl.uniform1f(sonogramShader.yoffsetLoc, yoffset / (TEXTURE_HEIGHT - 1));
		texCoordOffset = vboTexCoordOffset;
		break;

	case ANALYSISTYPE_3D_SONOGRAM:

		gl.bindBuffer(gl.ARRAY_BUFFER, sonogram3DVBO);
		sonogram3DShader.bind();
		vertexLoc           = sonogram3DShader.gPositionLoc;
		texCoordLoc         = sonogram3DShader.gTexCoord0Loc;
		frequencyDataLoc    = sonogram3DShader.frequencyDataLoc;
		foregroundColorLoc  = sonogram3DShader.foregroundColorLoc;
		backgroundColorLoc  = sonogram3DShader.backgroundColorLoc;

		gl.uniform1i(sonogram3DShader.vertexFrequencyDataLoc, 0);

		var normalizedYOffset = this.yoffset / (TEXTURE_HEIGHT - 1);

		gl.uniform1f(sonogram3DShader.yoffsetLoc, normalizedYOffset);

		var discretizedYOffset = Math.floor(normalizedYOffset * (sonogram3DHeight - 1)) / (sonogram3DHeight - 1);

		gl.uniform1f(sonogram3DShader.vertexYOffsetLoc, discretizedYOffset);
		gl.uniform1f(sonogram3DShader.verticalScaleLoc, sonogram3DGeometrySize / 3.5 );

		// Set up the model, view and projection matrices
		projection.loadIdentity();
		projection.perspective(55 /*35*/, canvas.width / canvas.height, 1, 100);
		view.loadIdentity();
		view.translate(0, 0, -9.0 /*-13.0*/);

		// Add in camera controller's rotation
		model.loadIdentity();
		model.rotate(this.cameraController.xRot, 1, 0, 0);
		model.rotate(this.cameraController.yRot, 0, 1, 0);
		model.rotate(this.cameraController.zRot, 0, 0, 1);
		model.translate(this.cameraController.xT, this.cameraController.yT, this.cameraController.zT);

		// Compute necessary matrices
		var mvp = new Matrix4x4();
		mvp.multiply(model);
		mvp.multiply(view);
		mvp.multiply(projection);
		gl.uniformMatrix4fv(sonogram3DShader.worldViewProjectionLoc, gl.FALSE, mvp.elements);
		texCoordOffset = vbo3DTexCoordOffset;
		// console.log('model',mvp.elements);
		break;

	}

	if (frequencyDataLoc) {
		gl.uniform1i(frequencyDataLoc, 0);
	}
	if (foregroundColorLoc) {
		gl.uniform4fv(foregroundColorLoc, this.foregroundColor);
	}
	if (backgroundColorLoc) {
		gl.uniform4fv(backgroundColorLoc, this.backgroundColor);
	}

	// Set up the vertex attribute arrays
	gl.enableVertexAttribArray(vertexLoc);
	gl.vertexAttribPointer(vertexLoc, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(texCoordLoc);
	gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, gl.FALSE, 0, texCoordOffset);



	// Clear the render area
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Actually draw
	if (this.analysisType == ANALYSISTYPE_FREQUENCY || this.analysisType == ANALYSISTYPE_WAVEFORM || this.analysisType == ANALYSISTYPE_SONOGRAM) {
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	} else if (this.analysisType == ANALYSISTYPE_3D_SONOGRAM) {
		// Note: this expects the element array buffer to still be bound
		gl.drawElements(gl.TRIANGLES, sonogram3DNumIndices, gl.UNSIGNED_SHORT, 0);
	}

	// Disable the attribute arrays for cleanliness
	gl.disableVertexAttribArray(vertexLoc);
	gl.disableVertexAttribArray(texCoordLoc);
};

AnalyserView.prototype.setAnalyserNode = function(analyser) {
  this.analyser = analyser;
};


module.exports = AnalyserView;

}).call(this,require("Wb8Gej"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/3D/visualizer.js","/3D")
},{"./cameraController":5,"./matrix4x4":6,"Wb8Gej":2,"buffer":3}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/********************************************************
Copyright 2016 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*********************************************************/



'use strict';

window.isMobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) );
window.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
window.isAndroid = /Android/.test(navigator.userAgent) && !window.MSStream;

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
		  window.webkitRequestAnimationFrame ||
		  window.mozRequestAnimationFrame    ||
		  function( callback ){
			window.setTimeout(callback, 1000 / 60);
		  };
})();

// -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~
var spec3D = require('./ui/spectrogram');
// -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~

$(function(){
	var parseQueryString = function(){
		var q = window.location.search.slice(1).split('&');
		for(var i=0; i < q.length; ++i){
			var qi = q[i].split('=');
			q[i] = {};
			q[i][qi[0]] = qi[1];
		}
		return q;
	}

	var getLocalization = function(){
		var q = parseQueryString();
		var lang = 'en';
		for(var i=0; i < q.length; i++){
			if(q[i].ln != undefined){
				lang = q[i].ln;
			}
		}
		var url = "https://gweb-musiclab-site.appspot.com/static/locales/" + lang + "/locale-music-lab.json";
		$.ajax({
			url: url,
			dataType: "json",
			async: true,
			success: function( response ) {
				$.each(response,function(key,value){
					var item = $("[data-name='"+ key +"']");
					if(item.length > 0){
						console.log('value.message',value.message);
						item.attr('data-name',value.message);
					}
				});
			},
			error: function(err){
				console.warn(err);
			}
		});
	}

	var startup = function (){
        var source = null; // global source for user dropped audio

		getLocalization();
		window.parent.postMessage('ready','*');

		var sp = spec3D;
		sp.attached();
		// --------------------------------------------
		$('.music-box__tool-tip').hide(0);
		$('#loadingSound').hide(0);

		var locked = false;

		$('.music-box__buttons__button').click(function(e){
			sp.startRender();
			
			var wasPlaying = sp.isPlaying();
			sp.stop();
			sp.drawingMode = false;
			
			if($(this).hasClass('selected')) {
				$('.music-box__buttons__button').removeClass('selected'); 
			}else{
				$('.music-box__buttons__button').removeClass('selected'); 
				$(this).addClass('selected');
				// check for start recoding data instruction **********************
				if ($(this).attr('data-mic')!== undefined) {
					if(window.isIOS){
						// Throw Microphone Error *********************************
						window.parent.postMessage('error2','*');
						// Remove Selection ***************************************
						$(this).removeClass('selected');
					}else{
						// Show Record Modal Screen *******************************
						$('#record').fadeIn().delay(2000).fadeOut();
						// Start Recording ****************************************
						sp.live();
					}
				// Check for Start drawing data instruction  **********************
				}else if ($(this).attr('data-draw') !== undefined) {
					sp.drawingMode = true;
					$('#drawAnywhere').fadeIn().delay(2000).fadeOut();
				// Check for play audio data instruction **************************
				}else if ($(this).attr('data-src') !== undefined) {
					sp.loopChanged( true );
					$('#loadingMessage').text($(this).attr('data-name'));
					sp.play($(this).attr('data-src'));
				}else if ($(this).attr('data-lock') !== undefined) {
					locked = !locked;
				}
			}
		})
		
		var killSound = function(){
			sp.startRender();
			var wasPlaying = sp.isPlaying();
			sp.stop();
			sp.drawingMode = false;
			$('.music-box__buttons__button').removeClass('selected'); 
		}

		window.addEventListener('blur', function() {
			!locked && killSound();
		});
		document.addEventListener('visibilitychange', function(){
			!locked && killSound();
		});

        var decodeBuffer = function(file) {
            // Credit: https://github.com/kylestetz/AudioDrop && https://ericbidelman.tumblr.com/post/13471195250/web-audio-api-how-to-playing-audio-based-on-user
            var AudioContext = window.AudioContext || window.webkitAudioContext;
            var context = new AudioContext();
            // var source = null;
            var audioBuffer = null;
            var fileReader = new FileReader();

            fileReader.onload = function(fileEvent) {
                var data = fileEvent.target.result;

                context.decodeAudioData(data, function(buffer) {
                    // audioBuffer is global to reuse the decoded audio later.
                    audioBuffer = buffer;
                    source = context.createBufferSource();
                    source.buffer = audioBuffer;
                    source.loop = true;
                    source.connect(context.destination);

                    // Visualizer
                    sp.startRender();
                    sp.loopChanged( true );
                    sp.userAudio(source);
                    $('#loadingSound').delay(500).fadeOut().hide(0);
                }, function(e) {
                    console.log('Error decoding file', e);
                });
            };

            fileReader.readAsArrayBuffer(file);
        };

        var fileDrop = function() {
            var $fileDrop = $('#fileDrop');
            var $description = $('.file-overlay-description');

            $(window).on({'dragover': function(e) {
                e.preventDefault();
                e.stopPropagation();

                $description.text('Drop your sound file here.');
                $fileDrop.addClass('active');
            }, 'dragleave': function(e) {
                e.preventDefault();
                e.stopPropagation();

                $fileDrop.removeClass('active');
            }, 'drop': function(e) {
                e.preventDefault();
                e.stopPropagation();

                $fileDrop.addClass('pointer-events');

                // Stop other sounds
                killSound();

                var droppedFiles = e.originalEvent.dataTransfer;
                if (droppedFiles && droppedFiles.files.length && droppedFiles.items[0] && droppedFiles.items[0].type !== 'audio/midi') {
                    $.each(droppedFiles.files, function(i, file) {
                        if (file.type.indexOf('audio') > -1) {
                            $('#loadingMessage').text(file.name);
                            $('#loadingSound').show(0);
                            decodeBuffer(file);
                            $fileDrop.removeClass('active');
                            $fileDrop.removeClass('pointer-events');
                        } else {
                            $description.text('Only sound files will work here.');
						}
                    });
                } else {
                    $description.text('Only sound files will work here.');
				}
            } });

            $fileDrop.on('click', function() {
                $fileDrop.removeClass('active');
                $fileDrop.removeClass('pointer-events');
			});
        };

        fileDrop();
	};

	var elm = $('#iosButton');
	if(!window.isIOS){
		elm.addClass('hide');
		startup();
    console.log(2);
	}else{
		window.parent.postMessage('loaded','*');
		elm[0].addEventListener('touchend', function(e){
			elm.addClass('hide');
			startup();
		},false);
	}
});

}).call(this,require("Wb8Gej"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_9bbed7e6.js","/")
},{"./ui/spectrogram":10,"Wb8Gej":2,"buffer":3}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/********************************************************
Copyright 2016 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*********************************************************/

var Util = require('../util/util.js');

function Player() {
	// Create an audio graph.
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	context = new AudioContext();

	var analyser = context.createAnalyser();
	//analyser.fftSize = 2048 * 2 * 2
	// analyser.fftSize = (window.isMobile)? 2048 : 8192;
	analyser.fftSize = (window.isMobile)?1024 : 2048;
	analyser.smoothingTimeConstant = 0;

	// Create a mix.
	var mix = context.createGain();

	// Create a bandpass filter.
	var bandpass = context.createBiquadFilter();
	bandpass.Q.value = 10;
	bandpass.type = 'bandpass';

	var filterGain = context.createGain();
	filterGain.gain.value = 1;

	// Connect audio processing graph
	mix.connect(analyser);
	analyser.connect(filterGain);
	filterGain.connect(context.destination);

	this.context = context;
	this.mix = mix;
	// this.bandpass = bandpass;
	this.filterGain = filterGain;
	this.analyser = analyser;

	this.buffers = {};

	// Connect an empty source node to the mix.
	Util.loadTrackSrc(this.context, 'bin/snd/empty.mp3', function(buffer) {
		var source = this.createSource_(buffer, true);
		source.loop = true;
		source.start(0);
	}.bind(this));
	
}

Player.prototype.playSrc = function(src) {
	// Stop all of the mic stuff.
	this.filterGain.gain.value = 1;
	if (this.input) {
		this.input.disconnect();
		this.input = null;
		return;
	}

	if (this.buffers[src]) {
		$('#loadingSound').fadeIn(100).delay(1000).fadeOut(500);
		this.playHelper_(src);
		return;
	}

	$('#loadingSound').fadeIn(100);
	Util.loadTrackSrc(this.context, src, function(buffer) {
		this.buffers[src] = buffer;
		this.playHelper_(src);
		$('#loadingSound').delay(500).fadeOut(500);
	}.bind(this));
};

Player.prototype.playUserAudio = function(src) {
  // Stop all of the mic stuff.
  this.filterGain.gain.value = 1;
  if (this.input) {
    this.input.disconnect();
    this.input = null;
    return;
  }
  this.buffers['user'] = src.buffer;
  this.playHelper_('user');
};

Player.prototype.playHelper_ = function(src) {
	var buffer = this.buffers[src];
	this.source = this.createSource_(buffer, true);
	this.source.start(0);

	if (!this.loop) {
		this.playTimer = setTimeout(function() {
			this.stop();
	}.bind(this), buffer.duration * 2000);
	}
};

Player.prototype.live = function() {
	if(window.isIOS){
		window.parent.postMessage('error2','*');
		console.log("cant use mic on ios");
	}else{
		if (this.input) {
			this.input.disconnect();
			this.input = null;
			return;
		}

		var self = this;
    navigator.mediaDevices.getUserMedia({audio: true}).then(function(stream) {
      self.onStream_(stream);
		}).catch(function() {
      self.onStreamError(this);
		});

		this.filterGain.gain.value = 0;
	}
};

Player.prototype.onStream_ = function(stream) {
	var input = this.context.createMediaStreamSource(stream);
	input.connect(this.mix);
	this.input = input;
	this.stream = stream;
};

Player.prototype.onStreamError_ = function(e) {
	// TODO: Error handling.
};

Player.prototype.setLoop = function(loop) {
	this.loop = loop;
};

Player.prototype.createSource_ = function(buffer, loop) {
	var source = this.context.createBufferSource();
	source.buffer = buffer;
	source.loop = loop;
	source.connect(this.mix);
	return source;
};

Player.prototype.setMicrophoneInput = function() {
	// TODO: Implement me!
};

Player.prototype.stop = function() {
	if (this.source) {
		this.source.stop(0);
		this.source = null;
		clearTimeout(this.playTimer);
		this.playTimer = null;

	}
	if (this.input) {
		this.input.disconnect();
		this.input = null;
		return;
	}
};

Player.prototype.getAnalyserNode = function() {
	return this.analyser;
};

Player.prototype.setBandpassFrequency = function(freq) {
	if (freq == null) {
		console.log('Removing bandpass filter');
		// Remove the effect of the bandpass filter completely, connecting the mix to the analyser directly.
		this.mix.disconnect();
		this.mix.connect(this.analyser);
	} else {
		// console.log('Setting bandpass frequency to %d Hz', freq);
		// Only set the frequency if it's specified, otherwise use the old one.
		this.bandpass.frequency.value = freq;
		this.mix.disconnect();
		this.mix.connect(this.bandpass);
		// bandpass is connected to filterGain.
		this.filterGain.connect(this.analyser);
	}
};

Player.prototype.playTone = function(freq) {
	if (!this.osc) {
		this.osc = this.context.createOscillator();
		this.osc.connect(this.mix);
		this.osc.type = 'sine';
		this.osc.start(0);
	}
	this.osc.frequency.value = freq;
	this.filterGain.gain.value = .2;

	
};

Player.prototype.stopTone = function() {
	this.osc.stop(0);
	this.osc = null;
};

module.exports = Player;

}).call(this,require("Wb8Gej"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/ui/player.js","/ui")
},{"../util/util.js":11,"Wb8Gej":2,"buffer":3}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/********************************************************
Copyright 2016 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*********************************************************/

'use strict'
var Util = require('../util/util.js');
var Player = require('../ui/player');
var AnalyserView = require('../3D/visualizer');


var spec3D = {
  cxRot: 90,
  drawingMode: false,
  prevX: 0,
  handleTrack: function(e) {
    switch(e.type){
      case 'mousedown':
      case 'touchstart':
        // START: MOUSEDOWN ---------------------------------------------
        spec3D.prevX = Number(e.pageX) || Number(e.originalEvent.touches[0].pageX)
        $(e.currentTarget).on('mousemove',spec3D.handleTrack)
        $(e.currentTarget).on('touchmove',spec3D.handleTrack)

        if (spec3D.drawingMode == false) return false
        var freq = spec3D.yToFreq(Number(e.pageY) || Number(e.originalEvent.touches[0].pageY));

        if (spec3D.isPlaying()) spec3D.player.setBandpassFrequency(freq);
        else spec3D.player.playTone(freq);
        return false;
        break;
      case 'mousemove' :
      case 'touchmove' :
        // TRACK --------------------------------------------------------
        var ddx = (Number(e.pageX) || Number(e.originalEvent.touches[0].pageX)) - spec3D.prevX;
        spec3D.prevX = Number(e.pageX) || Number(e.originalEvent.touches[0].pageX)

        if(spec3D.drawingMode){

          var y = Number(e.pageY) || Number(e.originalEvent.touches[0].pageY);
          var freq = spec3D.yToFreq(y);
          // console.log('%f px maps to %f Hz', y, freq);

          if (spec3D.isPlaying()) spec3D.player.setBandpassFrequency(freq);
          else spec3D.player.playTone(freq);

        } else if (spec3D.isPlaying()) {

          spec3D.cxRot += (ddx * .2)

          if (spec3D.cxRot < 0) spec3D.cxRot = 0;
          else if ( spec3D.cxRot > 90) spec3D.cxRot = 90;

          // spec3D.analyserView.cameraController.yRot = spec3D.easeInOutCubic(spec3D.cxRot / 90, 180 , 90 , 1);
          // spec3D.analyserView.cameraController.zT = spec3D.easeInOutCubic(spec3D.cxRot / 90,-2,-1,1);
          // console.log(spec3D.cxRot / 90);
          // spec3D.analyserView.cameraController.zT = -6 + ((spec3D.cxRot / 90) * 4);
        }
        return false;
        break;
      case 'mouseup' :
      case 'touchend':
      // END: MOUSEUP -------------------------------------------------
        $(e.currentTarget).off('mousemove',spec3D.handleTrack)
        $(e.currentTarget).off('touchmove',spec3D.handleTrack)
        if (spec3D.drawingMode == false) return false

        if (spec3D.isPlaying()) spec3D.player.setBandpassFrequency(null);
        else spec3D.player.stopTone();
        return false;
        break;
    }
  },

  attached: function() {
    console.log('spectrogram-3d attached');
    Util.setLogScale(20, 20, 20000, 20000);
    spec3D.onResize_();
    spec3D.init_();

    window.addEventListener('resize', spec3D.onResize_.bind(spec3D));
  },

  stop: function() {
    spec3D.player.stop();
  },

  isPlaying: function() {
    return !!this.player.source;
  },

  stopRender: function() {
    spec3D.isRendering = false;
  },

  startRender: function() {
    if (spec3D.isRendering) {
      return;
    }
    spec3D.isRendering = true;
    spec3D.draw_();
  },

  loopChanged: function(loop) {
    spec3D.player.setLoop(loop);
  },

  play: function(src) {
    spec3D.src = src;
    spec3D.player.playSrc(src);
  },

  live: function() {
    spec3D.player.live();
  },

  userAudio: function(src) {
    spec3D.player.playUserAudio(src)
  },

  init_: function() {
    // Initialize everything.
    var player = new Player();
    var analyserNode = player.getAnalyserNode();

    var analyserView = new AnalyserView(this.canvas);
    analyserView.setAnalyserNode(analyserNode);
    analyserView.initByteBuffer();

    spec3D.player = player;
    spec3D.analyserView = analyserView;
    $('#spectrogram')
      .on('mousedown',this.handleTrack)
      .on('touchstart',this.handleTrack)
      .on('mouseup',this.handleTrack)
      .on('touchend',this.handleTrack)
  },

  onResize_: function() {
    console.log('onResize_');
    var canvas = $('#spectrogram')[0];
    spec3D.canvas = canvas;

    // access sibling or parent elements here
    canvas.width = $(window).width();
    canvas.height = $(window).height();

    // Also size the legend canvas.
    var legend = $('#legend')[0];
    legend.width = $(window).width();
    legend.height = $(window).height() - 158;

    spec3D.drawLegend_();
  },

  draw_: function() {
    if (!spec3D.isRendering) {
      console.log('stopped draw_');
      return;
    }

    spec3D.analyserView.doFrequencyAnalysis();
    requestAnimationFrame(spec3D.draw_.bind(spec3D));
  },

  drawLegend_: function() {
    // Draw a simple legend.
    var canvas = $('#legend')[0];
    var ctx = canvas.getContext('2d');
    var x = canvas.width - 10;



    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Roboto';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('20,000 Hz -', x, canvas.height - spec3D.freqToY(20000));
    ctx.fillText('2,000 Hz -', x, canvas.height - spec3D.freqToY(2000));
    ctx.fillText('200 Hz -', x, canvas.height - spec3D.freqToY(200));
    ctx.fillText('20 Hz -', x, canvas.height - spec3D.freqToY(20));

  },

  /**
   * Convert between frequency and the offset on the canvas (in screen space).
   * For now, we fudge this...
   *
   * TODO(smus): Make this work properly with WebGL.
   */
  freqStart: 20,
  freqEnd: 20000,
  padding: 30,
  yToFreq: function(y) {
    var padding = spec3D.padding;
    var height = $('#spectrogram').height();

    if (height < 2*padding || // The spectrogram isn't tall enough
        y < padding || // Y is out of bounds on top.
        y > height - padding) { // Y is out of bounds on the bottom.
      return null;
    }
    var percentFromBottom = 1 - (y - padding) / (height - padding);
    var freq = spec3D.freqStart + (spec3D.freqEnd - spec3D.freqStart)* percentFromBottom;
    return Util.lin2log(freq);
  },

  // Just an inverse of yToFreq.
  freqToY: function(logFreq) {
    // Go from logarithmic frequency to linear.
    var freq = Util.log2lin(logFreq);
    var height = $('#spectrogram').height();
    var padding = spec3D.padding;
    // Get the frequency percentage.
    var percent = (freq - spec3D.freqStart) / (spec3D.freqEnd - spec3D.freqStart);
    // Apply padding, etc.
    return spec3D.padding + percent * (height - 2*padding);
  },
  easeInOutCubic: function (t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t + b;
    return c/2*((t-=2)*t*t + 2) + b;
  },
  easeInOutQuad: function (t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t + b;
    return -c/2 * ((--t)*(t-2) - 1) + b;
  },
  easeInOutQuint: function (t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  },
  easeInOutExpo: function (t, b, c, d) {
    if (t==0) return b;
    if (t==d) return b+c;
    if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
    return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
  }
};


module.exports = spec3D;

}).call(this,require("Wb8Gej"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/ui/spectrogram.js","/ui")
},{"../3D/visualizer":7,"../ui/player":9,"../util/util.js":11,"Wb8Gej":2,"buffer":3}],11:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/********************************************************
Copyright 2016 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*********************************************************/

var Util = window.Util || {};

Util.loadTrackSrc = function(context, src, callback, opt_progressCallback) {
  var request = new XMLHttpRequest();
  request.open('GET', src, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously.
  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      callback(buffer);
    }, function(e) {
      console.error(e);
    });
  };
  if (opt_progressCallback) {
    request.onprogress = function(e) {
      var percent = e.loaded / e.total;
      opt_progressCallback(percent);
    };
  }

  request.send();
};

// Log scale conversion functions. Cheat sheet:
// http://stackoverflow.com/questions/19472747/convert-linear-scale-to-logarithmic
Util.setLogScale = function(x1, y1, x2, y2) {
  this.b = Math.log(y1/y2) / (x1-x2);
  this.a = y1 / Math.exp( this.b * x1 );
};

Util.lin2log = function(x) {
  return this.a * Math.exp( this.b * x );
};

Util.log2lin = function(y) {
  return Math.log( y / this.a ) / this.b;
};


module.exports = Util;

}).call(this,require("Wb8Gej"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/util/util.js","/util")
},{"Wb8Gej":2,"buffer":3}]},{},[8])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Z1dHBpYi9jb2RlL2Nocm9tZS1tdXNpYy1sYWIvc3BlY3Ryb2dyYW0vbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9ob21lL2Z1dHBpYi9jb2RlL2Nocm9tZS1tdXNpYy1sYWIvc3BlY3Ryb2dyYW0vbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzIiwiL2hvbWUvZnV0cGliL2NvZGUvY2hyb21lLW11c2ljLWxhYi9zcGVjdHJvZ3JhbS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL2hvbWUvZnV0cGliL2NvZGUvY2hyb21lLW11c2ljLWxhYi9zcGVjdHJvZ3JhbS9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzIiwiL2hvbWUvZnV0cGliL2NvZGUvY2hyb21lLW11c2ljLWxhYi9zcGVjdHJvZ3JhbS9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIi9ob21lL2Z1dHBpYi9jb2RlL2Nocm9tZS1tdXNpYy1sYWIvc3BlY3Ryb2dyYW0vc3JjL2phdmFzY3JpcHRzLzNEL2NhbWVyYUNvbnRyb2xsZXIuanMiLCIvaG9tZS9mdXRwaWIvY29kZS9jaHJvbWUtbXVzaWMtbGFiL3NwZWN0cm9ncmFtL3NyYy9qYXZhc2NyaXB0cy8zRC9tYXRyaXg0eDQuanMiLCIvaG9tZS9mdXRwaWIvY29kZS9jaHJvbWUtbXVzaWMtbGFiL3NwZWN0cm9ncmFtL3NyYy9qYXZhc2NyaXB0cy8zRC92aXN1YWxpemVyLmpzIiwiL2hvbWUvZnV0cGliL2NvZGUvY2hyb21lLW11c2ljLWxhYi9zcGVjdHJvZ3JhbS9zcmMvamF2YXNjcmlwdHMvZmFrZV85YmJlZDdlNi5qcyIsIi9ob21lL2Z1dHBpYi9jb2RlL2Nocm9tZS1tdXNpYy1sYWIvc3BlY3Ryb2dyYW0vc3JjL2phdmFzY3JpcHRzL3VpL3BsYXllci5qcyIsIi9ob21lL2Z1dHBpYi9jb2RlL2Nocm9tZS1tdXNpYy1sYWIvc3BlY3Ryb2dyYW0vc3JjL2phdmFzY3JpcHRzL3VpL3NwZWN0cm9ncmFtLmpzIiwiL2hvbWUvZnV0cGliL2NvZGUvY2hyb21lLW11c2ljLWxhYi9zcGVjdHJvZ3JhbS9zcmMvamF2YXNjcmlwdHMvdXRpbC91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2bENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2ZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFBMVVNfVVJMX1NBRkUgPSAnLScuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0hfVVJMX1NBRkUgPSAnXycuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XG5cdFx0ICAgIGNvZGUgPT09IFBMVVNfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XG5cdFx0ICAgIGNvZGUgPT09IFNMQVNIX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiV2I4R2VqXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJXYjhHZWpcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi8uLi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3NcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5fdXNlVHlwZWRBcnJheXNgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAoY29tcGF0aWJsZSBkb3duIHRvIElFNilcbiAqL1xuQnVmZmVyLl91c2VUeXBlZEFycmF5cyA9IChmdW5jdGlvbiAoKSB7XG4gIC8vIERldGVjdCBpZiBicm93c2VyIHN1cHBvcnRzIFR5cGVkIEFycmF5cy4gU3VwcG9ydGVkIGJyb3dzZXJzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssXG4gIC8vIENocm9tZSA3KywgU2FmYXJpIDUuMSssIE9wZXJhIDExLjYrLCBpT1MgNC4yKy4gSWYgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBhZGRpbmdcbiAgLy8gcHJvcGVydGllcyB0byBgVWludDhBcnJheWAgaW5zdGFuY2VzLCB0aGVuIHRoYXQncyB0aGUgc2FtZSBhcyBubyBgVWludDhBcnJheWAgc3VwcG9ydFxuICAvLyBiZWNhdXNlIHdlIG5lZWQgdG8gYmUgYWJsZSB0byBhZGQgYWxsIHRoZSBub2RlIEJ1ZmZlciBBUEkgbWV0aG9kcy4gVGhpcyBpcyBhbiBpc3N1ZVxuICAvLyBpbiBGaXJlZm94IDQtMjkuIE5vdyBmaXhlZDogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4XG4gIHRyeSB7XG4gICAgdmFyIGJ1ZiA9IG5ldyBBcnJheUJ1ZmZlcigwKVxuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheShidWYpXG4gICAgYXJyLmZvbyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH1cbiAgICByZXR1cm4gNDIgPT09IGFyci5mb28oKSAmJlxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nIC8vIENocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn0pKClcblxuLyoqXG4gKiBDbGFzczogQnVmZmVyXG4gKiA9PT09PT09PT09PT09XG4gKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBhcmUgYXVnbWVudGVkXG4gKiB3aXRoIGZ1bmN0aW9uIHByb3BlcnRpZXMgZm9yIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBBUEkgZnVuY3Rpb25zLiBXZSB1c2VcbiAqIGBVaW50OEFycmF5YCBzbyB0aGF0IHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0IHJldHVybnNcbiAqIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIEJ5IGF1Z21lbnRpbmcgdGhlIGluc3RhbmNlcywgd2UgY2FuIGF2b2lkIG1vZGlmeWluZyB0aGUgYFVpbnQ4QXJyYXlgXG4gKiBwcm90b3R5cGUuXG4gKi9cbmZ1bmN0aW9uIEJ1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSlcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKVxuXG4gIHZhciB0eXBlID0gdHlwZW9mIHN1YmplY3RcblxuICAvLyBXb3JrYXJvdW5kOiBub2RlJ3MgYmFzZTY0IGltcGxlbWVudGF0aW9uIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBzdHJpbmdzXG4gIC8vIHdoaWxlIGJhc2U2NC1qcyBkb2VzIG5vdC5cbiAgaWYgKGVuY29kaW5nID09PSAnYmFzZTY0JyAmJiB0eXBlID09PSAnc3RyaW5nJykge1xuICAgIHN1YmplY3QgPSBzdHJpbmd0cmltKHN1YmplY3QpXG4gICAgd2hpbGUgKHN1YmplY3QubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgICAgc3ViamVjdCA9IHN1YmplY3QgKyAnPSdcbiAgICB9XG4gIH1cblxuICAvLyBGaW5kIHRoZSBsZW5ndGhcbiAgdmFyIGxlbmd0aFxuICBpZiAodHlwZSA9PT0gJ251bWJlcicpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKVxuICAgIGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHN1YmplY3QsIGVuY29kaW5nKVxuICBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdC5sZW5ndGgpIC8vIGFzc3VtZSB0aGF0IG9iamVjdCBpcyBhcnJheS1saWtlXG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG5lZWRzIHRvIGJlIGEgbnVtYmVyLCBhcnJheSBvciBzdHJpbmcuJylcblxuICB2YXIgYnVmXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgLy8gUHJlZmVycmVkOiBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIGJ1ZiA9IEJ1ZmZlci5fYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gVEhJUyBpbnN0YW5jZSBvZiBCdWZmZXIgKGNyZWF0ZWQgYnkgYG5ld2ApXG4gICAgYnVmID0gdGhpc1xuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcbiAgICBidWYuX2lzQnVmZmVyID0gdHJ1ZVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgdHlwZW9mIHN1YmplY3QuYnl0ZUxlbmd0aCA9PT0gJ251bWJlcicpIHtcbiAgICAvLyBTcGVlZCBvcHRpbWl6YXRpb24gLS0gdXNlIHNldCBpZiB3ZSdyZSBjb3B5aW5nIGZyb20gYSB0eXBlZCBhcnJheVxuICAgIGJ1Zi5fc2V0KHN1YmplY3QpXG4gIH0gZWxzZSBpZiAoaXNBcnJheWlzaChzdWJqZWN0KSkge1xuICAgIC8vIFRyZWF0IGFycmF5LWlzaCBvYmplY3RzIGFzIGEgYnl0ZSBhcnJheVxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSlcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdC5yZWFkVUludDgoaSlcbiAgICAgIGVsc2VcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdFtpXVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgIGJ1Zi53cml0ZShzdWJqZWN0LCAwLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiAhQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiAhbm9aZXJvKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBidWZbaV0gPSAwXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBTVEFUSUMgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIChiKSB7XG4gIHJldHVybiAhIShiICE9PSBudWxsICYmIGIgIT09IHVuZGVmaW5lZCAmJiBiLl9pc0J1ZmZlcilcbn1cblxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBlbmNvZGluZykge1xuICB2YXIgcmV0XG4gIHN0ciA9IHN0ciArICcnXG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgJ3V0ZjgnKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggLyAyXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBiYXNlNjRUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoICogMlxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiAobGlzdCwgdG90YWxMZW5ndGgpIHtcbiAgYXNzZXJ0KGlzQXJyYXkobGlzdCksICdVc2FnZTogQnVmZmVyLmNvbmNhdChsaXN0LCBbdG90YWxMZW5ndGhdKVxcbicgK1xuICAgICAgJ2xpc3Qgc2hvdWxkIGJlIGFuIEFycmF5LicpXG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoMClcbiAgfSBlbHNlIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBsaXN0WzBdXG4gIH1cblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHRvdGFsTGVuZ3RoICE9PSAnbnVtYmVyJykge1xuICAgIHRvdGFsTGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB0b3RhbExlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKHRvdGFsTGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXVxuICAgIGl0ZW0uY29weShidWYsIHBvcylcbiAgICBwb3MgKz0gaXRlbS5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbi8vIEJVRkZFUiBJTlNUQU5DRSBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBfaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyIG9mIGRpZ2l0c1xuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuICBhc3NlcnQoc3RyTGVuICUgMiA9PT0gMCwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciBieXRlID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGFzc2VydCghaXNOYU4oYnl0ZSksICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IGJ5dGVcbiAgfVxuICBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9IGkgKiAyXG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIF91dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYmluYXJ5V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gX2FzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIFN1cHBvcnQgYm90aCAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpXG4gIC8vIGFuZCB0aGUgbGVnYWN5IChzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBpZiAoIWlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7ICAvLyBsZWdhY3lcbiAgICB2YXIgc3dhcCA9IGVuY29kaW5nXG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBvZmZzZXQgPSBsZW5ndGhcbiAgICBsZW5ndGggPSBzd2FwXG4gIH1cblxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuXG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuICBzdGFydCA9IE51bWJlcihzdGFydCkgfHwgMFxuICBlbmQgPSAoZW5kICE9PSB1bmRlZmluZWQpXG4gICAgPyBOdW1iZXIoZW5kKVxuICAgIDogZW5kID0gc2VsZi5sZW5ndGhcblxuICAvLyBGYXN0cGF0aCBlbXB0eSBzdHJpbmdzXG4gIGlmIChlbmQgPT09IHN0YXJ0KVxuICAgIHJldHVybiAnJ1xuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiAodGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNvdXJjZSA9IHRoaXNcblxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAoIXRhcmdldF9zdGFydCkgdGFyZ2V0X3N0YXJ0ID0gMFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ3NvdXJjZUVuZCA8IHNvdXJjZVN0YXJ0JylcbiAgYXNzZXJ0KHRhcmdldF9zdGFydCA+PSAwICYmIHRhcmdldF9zdGFydCA8IHRhcmdldC5sZW5ndGgsXG4gICAgICAndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgc291cmNlLmxlbmd0aCwgJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKVxuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpXG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCArIHN0YXJ0XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG5cbiAgaWYgKGxlbiA8IDEwMCB8fCAhQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICB0YXJnZXRbaSArIHRhcmdldF9zdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQuX3NldCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksIHRhcmdldF9zdGFydClcbiAgfVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIF91dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmVzID0gJydcbiAgdmFyIHRtcCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIGlmIChidWZbaV0gPD0gMHg3Rikge1xuICAgICAgcmVzICs9IGRlY29kZVV0ZjhDaGFyKHRtcCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgICAgIHRtcCA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRtcCArPSAnJScgKyBidWZbaV0udG9TdHJpbmcoMTYpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcyArIGRlY29kZVV0ZjhDaGFyKHRtcClcbn1cblxuZnVuY3Rpb24gX2FzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKVxuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBfYmluYXJ5U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICByZXR1cm4gX2FzY2lpU2xpY2UoYnVmLCBzdGFydCwgZW5kKVxufVxuXG5mdW5jdGlvbiBfaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyBieXRlc1tpKzFdICogMjU2KVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IGNsYW1wKHN0YXJ0LCBsZW4sIDApXG4gIGVuZCA9IGNsYW1wKGVuZCwgbGVuLCBsZW4pXG5cbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICByZXR1cm4gQnVmZmVyLl9hdWdtZW50KHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZCkpXG4gIH0gZWxzZSB7XG4gICAgdmFyIHNsaWNlTGVuID0gZW5kIC0gc3RhcnRcbiAgICB2YXIgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkLCB0cnVlKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47IGkrKykge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICAgIHJldHVybiBuZXdCdWZcbiAgfVxufVxuXG4vLyBgZ2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAob2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuZ2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy5yZWFkVUludDgob2Zmc2V0KVxufVxuXG4vLyBgc2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodiwgb2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuc2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy53cml0ZVVJbnQ4KHYsIG9mZnNldClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gIH0gZWxzZSB7XG4gICAgdmFsID0gYnVmW29mZnNldF0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMl0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICAgIHZhbCB8PSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXQgKyAzXSA8PCAyNCA+Pj4gMClcbiAgfSBlbHNlIHtcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAxXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAyXSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDNdXG4gICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXRdIDw8IDI0ID4+PiAwKVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHZhciBuZWcgPSB0aGlzW29mZnNldF0gJiAweDgwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDE2KGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQzMihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwMDAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRGbG9hdCAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZERvdWJsZSAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmYpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKSByZXR1cm5cblxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDIpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlICYgKDB4ZmYgPDwgKDggKiAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSkpKSA+Pj5cbiAgICAgICAgICAgIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpICogOFxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCA0KTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSA+Pj4gKGxpdHRsZUVuZGlhbiA/IGkgOiAzIC0gaSkgKiA4KSAmIDB4ZmZcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZiwgLTB4ODApXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIHRoaXMud3JpdGVVSW50OCh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydClcbiAgZWxzZVxuICAgIHRoaXMud3JpdGVVSW50OCgweGZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmYsIC0weDgwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MTYoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgMHhmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQzMihidWYsIDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGZpbGwodmFsdWUsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKHZhbHVlLCBzdGFydCwgZW5kKSB7XG4gIGlmICghdmFsdWUpIHZhbHVlID0gMFxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWx1ZSA9IHZhbHVlLmNoYXJDb2RlQXQoMClcbiAgfVxuXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTih2YWx1ZSksICd2YWx1ZSBpcyBub3QgYSBudW1iZXInKVxuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnZW5kIDwgc3RhcnQnKVxuXG4gIC8vIEZpbGwgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCB0aGlzLmxlbmd0aCwgJ3N0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHRoaXMubGVuZ3RoLCAnZW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgdGhpc1tpXSA9IHZhbHVlXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgb3V0ID0gW11cbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBvdXRbaV0gPSB0b0hleCh0aGlzW2ldKVxuICAgIGlmIChpID09PSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTKSB7XG4gICAgICBvdXRbaSArIDFdID0gJy4uLidcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgb3V0LmpvaW4oJyAnKSArICc+J1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5QnVmZmVyYCB3aXRoIHRoZSAqY29waWVkKiBtZW1vcnkgb2YgdGhlIGJ1ZmZlciBpbnN0YW5jZS5cbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxuICovXG5CdWZmZXIucHJvdG90eXBlLnRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgICAgcmV0dXJuIChuZXcgQnVmZmVyKHRoaXMpKS5idWZmZXJcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KHRoaXMubGVuZ3RoKVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGJ1Zi5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSlcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdCdWZmZXIudG9BcnJheUJ1ZmZlciBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlcicpXG4gIH1cbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG52YXIgQlAgPSBCdWZmZXIucHJvdG90eXBlXG5cbi8qKlxuICogQXVnbWVudCBhIFVpbnQ4QXJyYXkgKmluc3RhbmNlKiAobm90IHRoZSBVaW50OEFycmF5IGNsYXNzISkgd2l0aCBCdWZmZXIgbWV0aG9kc1xuICovXG5CdWZmZXIuX2F1Z21lbnQgPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGFyci5faXNCdWZmZXIgPSB0cnVlXG5cbiAgLy8gc2F2ZSByZWZlcmVuY2UgdG8gb3JpZ2luYWwgVWludDhBcnJheSBnZXQvc2V0IG1ldGhvZHMgYmVmb3JlIG92ZXJ3cml0aW5nXG4gIGFyci5fZ2V0ID0gYXJyLmdldFxuICBhcnIuX3NldCA9IGFyci5zZXRcblxuICAvLyBkZXByZWNhdGVkLCB3aWxsIGJlIHJlbW92ZWQgaW4gbm9kZSAwLjEzK1xuICBhcnIuZ2V0ID0gQlAuZ2V0XG4gIGFyci5zZXQgPSBCUC5zZXRcblxuICBhcnIud3JpdGUgPSBCUC53cml0ZVxuICBhcnIudG9TdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9Mb2NhbGVTdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9KU09OID0gQlAudG9KU09OXG4gIGFyci5jb3B5ID0gQlAuY29weVxuICBhcnIuc2xpY2UgPSBCUC5zbGljZVxuICBhcnIucmVhZFVJbnQ4ID0gQlAucmVhZFVJbnQ4XG4gIGFyci5yZWFkVUludDE2TEUgPSBCUC5yZWFkVUludDE2TEVcbiAgYXJyLnJlYWRVSW50MTZCRSA9IEJQLnJlYWRVSW50MTZCRVxuICBhcnIucmVhZFVJbnQzMkxFID0gQlAucmVhZFVJbnQzMkxFXG4gIGFyci5yZWFkVUludDMyQkUgPSBCUC5yZWFkVUludDMyQkVcbiAgYXJyLnJlYWRJbnQ4ID0gQlAucmVhZEludDhcbiAgYXJyLnJlYWRJbnQxNkxFID0gQlAucmVhZEludDE2TEVcbiAgYXJyLnJlYWRJbnQxNkJFID0gQlAucmVhZEludDE2QkVcbiAgYXJyLnJlYWRJbnQzMkxFID0gQlAucmVhZEludDMyTEVcbiAgYXJyLnJlYWRJbnQzMkJFID0gQlAucmVhZEludDMyQkVcbiAgYXJyLnJlYWRGbG9hdExFID0gQlAucmVhZEZsb2F0TEVcbiAgYXJyLnJlYWRGbG9hdEJFID0gQlAucmVhZEZsb2F0QkVcbiAgYXJyLnJlYWREb3VibGVMRSA9IEJQLnJlYWREb3VibGVMRVxuICBhcnIucmVhZERvdWJsZUJFID0gQlAucmVhZERvdWJsZUJFXG4gIGFyci53cml0ZVVJbnQ4ID0gQlAud3JpdGVVSW50OFxuICBhcnIud3JpdGVVSW50MTZMRSA9IEJQLndyaXRlVUludDE2TEVcbiAgYXJyLndyaXRlVUludDE2QkUgPSBCUC53cml0ZVVJbnQxNkJFXG4gIGFyci53cml0ZVVJbnQzMkxFID0gQlAud3JpdGVVSW50MzJMRVxuICBhcnIud3JpdGVVSW50MzJCRSA9IEJQLndyaXRlVUludDMyQkVcbiAgYXJyLndyaXRlSW50OCA9IEJQLndyaXRlSW50OFxuICBhcnIud3JpdGVJbnQxNkxFID0gQlAud3JpdGVJbnQxNkxFXG4gIGFyci53cml0ZUludDE2QkUgPSBCUC53cml0ZUludDE2QkVcbiAgYXJyLndyaXRlSW50MzJMRSA9IEJQLndyaXRlSW50MzJMRVxuICBhcnIud3JpdGVJbnQzMkJFID0gQlAud3JpdGVJbnQzMkJFXG4gIGFyci53cml0ZUZsb2F0TEUgPSBCUC53cml0ZUZsb2F0TEVcbiAgYXJyLndyaXRlRmxvYXRCRSA9IEJQLndyaXRlRmxvYXRCRVxuICBhcnIud3JpdGVEb3VibGVMRSA9IEJQLndyaXRlRG91YmxlTEVcbiAgYXJyLndyaXRlRG91YmxlQkUgPSBCUC53cml0ZURvdWJsZUJFXG4gIGFyci5maWxsID0gQlAuZmlsbFxuICBhcnIuaW5zcGVjdCA9IEJQLmluc3BlY3RcbiAgYXJyLnRvQXJyYXlCdWZmZXIgPSBCUC50b0FycmF5QnVmZmVyXG5cbiAgcmV0dXJuIGFyclxufVxuXG4vLyBzbGljZShzdGFydCwgZW5kKVxuZnVuY3Rpb24gY2xhbXAgKGluZGV4LCBsZW4sIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAodHlwZW9mIGluZGV4ICE9PSAnbnVtYmVyJykgcmV0dXJuIGRlZmF1bHRWYWx1ZVxuICBpbmRleCA9IH5+aW5kZXg7ICAvLyBDb2VyY2UgdG8gaW50ZWdlci5cbiAgaWYgKGluZGV4ID49IGxlbikgcmV0dXJuIGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIGluZGV4ICs9IGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIGNvZXJjZSAobGVuZ3RoKSB7XG4gIC8vIENvZXJjZSBsZW5ndGggdG8gYSBudW1iZXIgKHBvc3NpYmx5IE5hTiksIHJvdW5kIHVwXG4gIC8vIGluIGNhc2UgaXQncyBmcmFjdGlvbmFsIChlLmcuIDEyMy40NTYpIHRoZW4gZG8gYVxuICAvLyBkb3VibGUgbmVnYXRlIHRvIGNvZXJjZSBhIE5hTiB0byAwLiBFYXN5LCByaWdodD9cbiAgbGVuZ3RoID0gfn5NYXRoLmNlaWwoK2xlbmd0aClcbiAgcmV0dXJuIGxlbmd0aCA8IDAgPyAwIDogbGVuZ3RoXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkgKHN1YmplY3QpIHtcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChzdWJqZWN0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzdWJqZWN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICB9KShzdWJqZWN0KVxufVxuXG5mdW5jdGlvbiBpc0FycmF5aXNoIChzdWJqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxuICAgICAgc3ViamVjdCAmJiB0eXBlb2Ygc3ViamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBzdWJqZWN0Lmxlbmd0aCA9PT0gJ251bWJlcidcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIHZhciBiID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBpZiAoYiA8PSAweDdGKVxuICAgICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkpXG4gICAgZWxzZSB7XG4gICAgICB2YXIgc3RhcnQgPSBpXG4gICAgICBpZiAoYiA+PSAweEQ4MDAgJiYgYiA8PSAweERGRkYpIGkrK1xuICAgICAgdmFyIGggPSBlbmNvZGVVUklDb21wb25lbnQoc3RyLnNsaWNlKHN0YXJ0LCBpKzEpKS5zdWJzdHIoMSkuc3BsaXQoJyUnKVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoLmxlbmd0aDsgaisrKVxuICAgICAgICBieXRlQXJyYXkucHVzaChwYXJzZUludChoW2pdLCAxNikpXG4gICAgfVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYywgaGksIGxvXG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KHN0cilcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBwb3NcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSlcbiAgICAgIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gZGVjb2RlVXRmOENoYXIgKHN0cikge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgweEZGRkQpIC8vIFVURiA4IGludmFsaWQgY2hhclxuICB9XG59XG5cbi8qXG4gKiBXZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSB2YWx1ZSBpcyBhIHZhbGlkIGludGVnZXIuIFRoaXMgbWVhbnMgdGhhdCBpdFxuICogaXMgbm9uLW5lZ2F0aXZlLiBJdCBoYXMgbm8gZnJhY3Rpb25hbCBjb21wb25lbnQgYW5kIHRoYXQgaXQgZG9lcyBub3RcbiAqIGV4Y2VlZCB0aGUgbWF4aW11bSBhbGxvd2VkIHZhbHVlLlxuICovXG5mdW5jdGlvbiB2ZXJpZnVpbnQgKHZhbHVlLCBtYXgpIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlID49IDAsICdzcGVjaWZpZWQgYSBuZWdhdGl2ZSB2YWx1ZSBmb3Igd3JpdGluZyBhbiB1bnNpZ25lZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBpcyBsYXJnZXIgdGhhbiBtYXhpbXVtIHZhbHVlIGZvciB0eXBlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZzaW50ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZJRUVFNzU0ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbn1cblxuZnVuY3Rpb24gYXNzZXJ0ICh0ZXN0LCBtZXNzYWdlKSB7XG4gIGlmICghdGVzdCkgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UgfHwgJ0ZhaWxlZCBhc3NlcnRpb24nKVxufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIldiOEdlalwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanNcIixcIi8uLi8uLi9ub2RlX21vZHVsZXMvYnVmZmVyXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG1cbiAgdmFyIGVMZW4gPSAobkJ5dGVzICogOCkgLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIG5CaXRzID0gLTdcbiAgdmFyIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMFxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcbiAgdmFyIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV1cblxuICBpICs9IGRcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBzID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBlTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSAoZSAqIDI1NikgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBlID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBtTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSAobSAqIDI1NikgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXNcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpXG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxuICAgIGUgPSBlIC0gZUJpYXNcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxufVxuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjXG4gIHZhciBlTGVuID0gKG5CeXRlcyAqIDgpIC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMClcbiAgdmFyIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKVxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcbiAgdmFyIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDBcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXG4gICAgZSA9IGVNYXhcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS1cbiAgICAgIGMgKj0gMlxuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKytcbiAgICAgIGMgLz0gMlxuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDBcbiAgICAgIGUgPSBlTWF4XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICgodmFsdWUgKiBjKSAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSBlICsgZUJpYXNcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gMFxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpIHt9XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbVxuICBlTGVuICs9IG1MZW5cbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KSB7fVxuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyOFxufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIldiOEdlalwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2llZWU3NTRcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDA5IFRoZSBDaHJvbWl1bSBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxuICogbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZVxuICogbWV0OlxuICpcbiAqICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAqIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAgICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZVxuICogY29weXJpZ2h0IG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lclxuICogaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZVxuICogZGlzdHJpYnV0aW9uLlxuICogICAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIEdvb2dsZSBJbmMuIG5vciB0aGUgbmFtZXMgb2YgaXRzXG4gKiBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbVxuICogdGhpcyBzb2Z0d2FyZSB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTXG4gKiBcIkFTIElTXCIgQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UXG4gKiBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1JcbiAqIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUXG4gKiBPV05FUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCxcbiAqIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1RcbiAqIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLFxuICogREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZXG4gKiBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4gKiAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0VcbiAqIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cblxuLy8gQSBzaW1wbGUgY2FtZXJhIGNvbnRyb2xsZXIgd2hpY2ggdXNlcyBhbiBIVE1MIGVsZW1lbnQgYXMgdGhlIGV2ZW50XG4vLyBzb3VyY2UgZm9yIGNvbnN0cnVjdGluZyBhIHZpZXcgbWF0cml4LiBBc3NpZ24gYW4gXCJvbmNoYW5nZVwiXG4vLyBmdW5jdGlvbiB0byB0aGUgY29udHJvbGxlciBhcyBmb2xsb3dzIHRvIHJlY2VpdmUgdGhlIHVwZGF0ZWQgWCBhbmRcbi8vIFkgYW5nbGVzIGZvciB0aGUgY2FtZXJhOlxuLy9cbi8vICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQ2FtZXJhQ29udHJvbGxlcihjYW52YXMpO1xuLy8gICBjb250cm9sbGVyLm9uY2hhbmdlID0gZnVuY3Rpb24oeFJvdCwgeVJvdCkgeyAuLi4gfTtcbi8vXG4vLyBUaGUgdmlldyBtYXRyaXggaXMgY29tcHV0ZWQgZWxzZXdoZXJlLlxuLy9cbi8vIG9wdF9jYW52YXMgKGFuIEhUTUxDYW52YXNFbGVtZW50KSBhbmQgb3B0X2NvbnRleHQgKGFcbi8vIFdlYkdMUmVuZGVyaW5nQ29udGV4dCkgY2FuIGJlIHBhc3NlZCBpbiB0byBtYWtlIHRoZSBoaXQgZGV0ZWN0aW9uXG4vLyBtb3JlIHByZWNpc2UgLS0gb25seSBvcGFxdWUgcGl4ZWxzIHdpbGwgYmUgY29uc2lkZXJlZCBhcyB0aGUgc3RhcnRcbi8vIG9mIGEgZHJhZyBhY3Rpb24uXG5mdW5jdGlvbiBDYW1lcmFDb250cm9sbGVyKGVsZW1lbnQsIG9wdF9jYW52YXMsIG9wdF9jb250ZXh0KSB7XG4gICAgdmFyIGNvbnRyb2xsZXIgPSB0aGlzO1xuICAgIHRoaXMub25jaGFuZ2UgPSBudWxsO1xuICAgIHRoaXMueFJvdCA9IDA7XG4gICAgdGhpcy55Um90ID0gMDtcbiAgICB0aGlzLnpSb3QgPSAwO1xuICAgIHRoaXMuc2NhbGVGYWN0b3IgPSAzLjA7XG4gICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xuICAgIHRoaXMuY3VyWCA9IDA7XG4gICAgdGhpcy5jdXJZID0gMDtcblxuICAgIGlmIChvcHRfY2FudmFzKVxuICAgICAgICB0aGlzLmNhbnZhc18gPSBvcHRfY2FudmFzO1xuXG4gICAgaWYgKG9wdF9jb250ZXh0KVxuICAgICAgICB0aGlzLmNvbnRleHRfID0gb3B0X2NvbnRleHQ7XG5cbiAgICAvLyBUT0RPKHNtdXMpOiBSZW1vdmUgdGhpcyB0byByZS1pbnRyb2R1Y2UgbW91c2UgcGFubmluZy5cbiAgICByZXR1cm47XG5cbiAgICAvLyBBc3NpZ24gYSBtb3VzZSBkb3duIGhhbmRsZXIgdG8gdGhlIEhUTUwgZWxlbWVudC5cbiAgICBlbGVtZW50Lm9ubW91c2Vkb3duID0gZnVuY3Rpb24oZXYpIHtcbiAgICAgICAgY29udHJvbGxlci5jdXJYID0gZXYuY2xpZW50WDtcbiAgICAgICAgY29udHJvbGxlci5jdXJZID0gZXYuY2xpZW50WTtcbiAgICAgICAgdmFyIGRyYWdnaW5nID0gZmFsc2U7XG4gICAgICAgIGlmIChjb250cm9sbGVyLmNhbnZhc18gJiYgY29udHJvbGxlci5jb250ZXh0Xykge1xuICAgICAgICAgICAgdmFyIHJlY3QgPSBjb250cm9sbGVyLmNhbnZhc18uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAvLyBUcmFuc2Zvcm0gdGhlIGV2ZW50J3MgeCBhbmQgeSBjb29yZGluYXRlcyBpbnRvIHRoZSBjb29yZGluYXRlXG4gICAgICAgICAgICAvLyBzcGFjZSBvZiB0aGUgY2FudmFzXG4gICAgICAgICAgICB2YXIgY2FudmFzUmVsYXRpdmVYID0gZXYucGFnZVggLSByZWN0LmxlZnQ7XG4gICAgICAgICAgICB2YXIgY2FudmFzUmVsYXRpdmVZID0gZXYucGFnZVkgLSByZWN0LnRvcDtcbiAgICAgICAgICAgIHZhciBjYW52YXNXaWR0aCA9IGNvbnRyb2xsZXIuY2FudmFzXy53aWR0aDtcbiAgICAgICAgICAgIHZhciBjYW52YXNIZWlnaHQgPSBjb250cm9sbGVyLmNhbnZhc18uaGVpZ2h0O1xuXG4gICAgICAgICAgICAvLyBSZWFkIGJhY2sgYSBzbWFsbCBwb3J0aW9uIG9mIHRoZSBmcmFtZSBidWZmZXIgYXJvdW5kIHRoaXMgcG9pbnRcbiAgICAgICAgICAgIGlmIChjYW52YXNSZWxhdGl2ZVggPiAwICYmIGNhbnZhc1JlbGF0aXZlWCA8IGNhbnZhc1dpZHRoICYmXG4gICAgICAgICAgICAgICAgY2FudmFzUmVsYXRpdmVZID4gMCAmJiBjYW52YXNSZWxhdGl2ZVkgPCBjYW52YXNIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGl4ZWxzID0gY29udHJvbGxlci5jb250ZXh0Xy5yZWFkUGl4ZWxzKGNhbnZhc1JlbGF0aXZlWCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhc0hlaWdodCAtIGNhbnZhc1JlbGF0aXZlWSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlci5jb250ZXh0Xy5SR0JBLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlci5jb250ZXh0Xy5VTlNJR05FRF9CWVRFKTtcbiAgICAgICAgICAgICAgICBpZiAocGl4ZWxzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNlZSB3aGV0aGVyIHRoaXMgcGl4ZWwgaGFzIGFuIGFscGhhIHZhbHVlIG9mID49IGFib3V0IDEwJVxuICAgICAgICAgICAgICAgICAgICBpZiAocGl4ZWxzWzNdID4gKDI1NS4wIC8gMTAuMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRyYWdnaW5nID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRyb2xsZXIuZHJhZ2dpbmcgPSBkcmFnZ2luZztcbiAgICB9O1xuXG4gICAgLy8gQXNzaWduIGEgbW91c2UgdXAgaGFuZGxlciB0byB0aGUgSFRNTCBlbGVtZW50LlxuICAgIGVsZW1lbnQub25tb3VzZXVwID0gZnVuY3Rpb24oZXYpIHtcbiAgICAgICAgY29udHJvbGxlci5kcmFnZ2luZyA9IGZhbHNlO1xuICAgIH07XG5cbiAgICAvLyBBc3NpZ24gYSBtb3VzZSBtb3ZlIGhhbmRsZXIgdG8gdGhlIEhUTUwgZWxlbWVudC5cbiAgICBlbGVtZW50Lm9ubW91c2Vtb3ZlID0gZnVuY3Rpb24oZXYpIHtcbiAgICAgICAgaWYgKGNvbnRyb2xsZXIuZHJhZ2dpbmcpIHtcbiAgICAgICAgICAgIC8vIERldGVybWluZSBob3cgZmFyIHdlIGhhdmUgbW92ZWQgc2luY2UgdGhlIGxhc3QgbW91c2UgbW92ZVxuICAgICAgICAgICAgLy8gZXZlbnQuXG4gICAgICAgICAgICB2YXIgY3VyWCA9IGV2LmNsaWVudFg7XG4gICAgICAgICAgICB2YXIgY3VyWSA9IGV2LmNsaWVudFk7XG4gICAgICAgICAgICB2YXIgZGVsdGFYID0gKGNvbnRyb2xsZXIuY3VyWCAtIGN1clgpIC8gY29udHJvbGxlci5zY2FsZUZhY3RvcjtcbiAgICAgICAgICAgIHZhciBkZWx0YVkgPSAoY29udHJvbGxlci5jdXJZIC0gY3VyWSkgLyBjb250cm9sbGVyLnNjYWxlRmFjdG9yO1xuICAgICAgICAgICAgY29udHJvbGxlci5jdXJYID0gY3VyWDtcbiAgICAgICAgICAgIGNvbnRyb2xsZXIuY3VyWSA9IGN1clk7XG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIFggYW5kIFkgcm90YXRpb24gYW5nbGVzIGJhc2VkIG9uIHRoZSBtb3VzZSBtb3Rpb24uXG4gICAgICAgICAgICBjb250cm9sbGVyLnlSb3QgPSAoY29udHJvbGxlci55Um90ICsgZGVsdGFYKSAlIDM2MDtcbiAgICAgICAgICAgIGNvbnRyb2xsZXIueFJvdCA9IChjb250cm9sbGVyLnhSb3QgKyBkZWx0YVkpO1xuICAgICAgICAgICAgLy8gQ2xhbXAgdGhlIFggcm90YXRpb24gdG8gcHJldmVudCB0aGUgY2FtZXJhIGZyb20gZ29pbmcgdXBzaWRlXG4gICAgICAgICAgICAvLyBkb3duLlxuICAgICAgICAgICAgaWYgKGNvbnRyb2xsZXIueFJvdCA8IC05MCkge1xuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIueFJvdCA9IC05MDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY29udHJvbGxlci54Um90ID4gOTApIHtcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyLnhSb3QgPSA5MDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFNlbmQgdGhlIG9uY2hhbmdlIGV2ZW50IHRvIGFueSBsaXN0ZW5lci5cbiAgICAgICAgICAgIGlmIChjb250cm9sbGVyLm9uY2hhbmdlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyLm9uY2hhbmdlKGNvbnRyb2xsZXIueFJvdCwgY29udHJvbGxlci55Um90KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBDYW1lcmFDb250cm9sbGVyO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIldiOEdlalwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLzNEL2NhbWVyYUNvbnRyb2xsZXIuanNcIixcIi8zRFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDksIE1vemlsbGEgQ29ycFxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAqIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuICogICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAqICAgICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAgICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0XG4gKiAgICAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlXG4gKiAgICAgICBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuICogICAgICogTmVpdGhlciB0aGUgbmFtZSBvZiB0aGUgPG9yZ2FuaXphdGlvbj4gbm9yIHRoZVxuICogICAgICAgbmFtZXMgb2YgaXRzIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHNcbiAqICAgICAgIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuICpcbiAqIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgPGNvcHlyaWdodCBob2xkZXI+ICcnQVMgSVMnJyBBTkQgQU5ZXG4gKiBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG4gKiBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFXG4gKiBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCA8Y29weXJpZ2h0IGhvbGRlcj4gQkUgTElBQkxFIEZPUiBBTllcbiAqIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4gKiAoSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG4gKiBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkRcbiAqIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4gKiAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuICogU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cblxuLypcbiAqIEJhc2VkIG9uIHNhbXBsZSBjb2RlIGZyb20gdGhlIE9wZW5HTChSKSBFUyAyLjAgUHJvZ3JhbW1pbmcgR3VpZGUsIHdoaWNoIGNhcnJpZXJzXG4gKiB0aGUgZm9sbG93aW5nIGhlYWRlcjpcbiAqXG4gKiBCb29rOiAgICAgIE9wZW5HTChSKSBFUyAyLjAgUHJvZ3JhbW1pbmcgR3VpZGVcbiAqIEF1dGhvcnM6ICAgQWFmdGFiIE11bnNoaSwgRGFuIEdpbnNidXJnLCBEYXZlIFNocmVpbmVyXG4gKiBJU0JOLTEwOiAgIDAzMjE1MDI3OTVcbiAqIElTQk4tMTM6ICAgOTc4MDMyMTUwMjc5N1xuICogUHVibGlzaGVyOiBBZGRpc29uLVdlc2xleSBQcm9mZXNzaW9uYWxcbiAqIFVSTHM6ICAgICAgaHR0cDovL3NhZmFyaS5pbmZvcm1pdC5jb20vOTc4MDMyMTU2MzgzNVxuICogICAgICAgICAgICBodHRwOi8vd3d3Lm9wZW5nbGVzLWJvb2suY29tXG4gKi9cblxuLy9cbi8vIEEgc2ltcGxlIDR4NCBNYXRyaXggdXRpbGl0eSBjbGFzc1xuLy9cblxuZnVuY3Rpb24gTWF0cml4NHg0KCkge1xuICB0aGlzLmVsZW1lbnRzID0gQXJyYXkoMTYpO1xuICB0aGlzLmxvYWRJZGVudGl0eSgpO1xufVxuXG5NYXRyaXg0eDQucHJvdG90eXBlID0ge1xuICBzY2FsZTogZnVuY3Rpb24gKHN4LCBzeSwgc3opIHtcbiAgICB0aGlzLmVsZW1lbnRzWzAqNCswXSAqPSBzeDtcbiAgICB0aGlzLmVsZW1lbnRzWzAqNCsxXSAqPSBzeDtcbiAgICB0aGlzLmVsZW1lbnRzWzAqNCsyXSAqPSBzeDtcbiAgICB0aGlzLmVsZW1lbnRzWzAqNCszXSAqPSBzeDtcblxuICAgIHRoaXMuZWxlbWVudHNbMSo0KzBdICo9IHN5O1xuICAgIHRoaXMuZWxlbWVudHNbMSo0KzFdICo9IHN5O1xuICAgIHRoaXMuZWxlbWVudHNbMSo0KzJdICo9IHN5O1xuICAgIHRoaXMuZWxlbWVudHNbMSo0KzNdICo9IHN5O1xuXG4gICAgdGhpcy5lbGVtZW50c1syKjQrMF0gKj0gc3o7XG4gICAgdGhpcy5lbGVtZW50c1syKjQrMV0gKj0gc3o7XG4gICAgdGhpcy5lbGVtZW50c1syKjQrMl0gKj0gc3o7XG4gICAgdGhpcy5lbGVtZW50c1syKjQrM10gKj0gc3o7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICB0cmFuc2xhdGU6IGZ1bmN0aW9uICh0eCwgdHksIHR6KSB7XG4gICAgdGhpcy5lbGVtZW50c1szKjQrMF0gKz0gdGhpcy5lbGVtZW50c1swKjQrMF0gKiB0eCArIHRoaXMuZWxlbWVudHNbMSo0KzBdICogdHkgKyB0aGlzLmVsZW1lbnRzWzIqNCswXSAqIHR6O1xuICAgIHRoaXMuZWxlbWVudHNbMyo0KzFdICs9IHRoaXMuZWxlbWVudHNbMCo0KzFdICogdHggKyB0aGlzLmVsZW1lbnRzWzEqNCsxXSAqIHR5ICsgdGhpcy5lbGVtZW50c1syKjQrMV0gKiB0ejtcbiAgICB0aGlzLmVsZW1lbnRzWzMqNCsyXSArPSB0aGlzLmVsZW1lbnRzWzAqNCsyXSAqIHR4ICsgdGhpcy5lbGVtZW50c1sxKjQrMl0gKiB0eSArIHRoaXMuZWxlbWVudHNbMio0KzJdICogdHo7XG4gICAgdGhpcy5lbGVtZW50c1szKjQrM10gKz0gdGhpcy5lbGVtZW50c1swKjQrM10gKiB0eCArIHRoaXMuZWxlbWVudHNbMSo0KzNdICogdHkgKyB0aGlzLmVsZW1lbnRzWzIqNCszXSAqIHR6O1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgcm90YXRlOiBmdW5jdGlvbiAoYW5nbGUsIHgsIHksIHopIHtcbiAgICB2YXIgbWFnID0gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeik7XG4gICAgdmFyIHNpbkFuZ2xlID0gTWF0aC5zaW4oYW5nbGUgKiBNYXRoLlBJIC8gMTgwLjApO1xuICAgIHZhciBjb3NBbmdsZSA9IE1hdGguY29zKGFuZ2xlICogTWF0aC5QSSAvIDE4MC4wKTtcblxuICAgIGlmIChtYWcgPiAwKSB7XG4gICAgICB2YXIgeHgsIHl5LCB6eiwgeHksIHl6LCB6eCwgeHMsIHlzLCB6cztcbiAgICAgIHZhciBvbmVNaW51c0NvcztcbiAgICAgIHZhciByb3RNYXQ7XG5cbiAgICAgIHggLz0gbWFnO1xuICAgICAgeSAvPSBtYWc7XG4gICAgICB6IC89IG1hZztcblxuICAgICAgeHggPSB4ICogeDtcbiAgICAgIHl5ID0geSAqIHk7XG4gICAgICB6eiA9IHogKiB6O1xuICAgICAgeHkgPSB4ICogeTtcbiAgICAgIHl6ID0geSAqIHo7XG4gICAgICB6eCA9IHogKiB4O1xuICAgICAgeHMgPSB4ICogc2luQW5nbGU7XG4gICAgICB5cyA9IHkgKiBzaW5BbmdsZTtcbiAgICAgIHpzID0geiAqIHNpbkFuZ2xlO1xuICAgICAgb25lTWludXNDb3MgPSAxLjAgLSBjb3NBbmdsZTtcblxuICAgICAgcm90TWF0ID0gbmV3IE1hdHJpeDR4NCgpO1xuXG4gICAgICByb3RNYXQuZWxlbWVudHNbMCo0KzBdID0gKG9uZU1pbnVzQ29zICogeHgpICsgY29zQW5nbGU7XG4gICAgICByb3RNYXQuZWxlbWVudHNbMCo0KzFdID0gKG9uZU1pbnVzQ29zICogeHkpIC0genM7XG4gICAgICByb3RNYXQuZWxlbWVudHNbMCo0KzJdID0gKG9uZU1pbnVzQ29zICogengpICsgeXM7XG4gICAgICByb3RNYXQuZWxlbWVudHNbMCo0KzNdID0gMC4wO1xuXG4gICAgICByb3RNYXQuZWxlbWVudHNbMSo0KzBdID0gKG9uZU1pbnVzQ29zICogeHkpICsgenM7XG4gICAgICByb3RNYXQuZWxlbWVudHNbMSo0KzFdID0gKG9uZU1pbnVzQ29zICogeXkpICsgY29zQW5nbGU7XG4gICAgICByb3RNYXQuZWxlbWVudHNbMSo0KzJdID0gKG9uZU1pbnVzQ29zICogeXopIC0geHM7XG4gICAgICByb3RNYXQuZWxlbWVudHNbMSo0KzNdID0gMC4wO1xuXG4gICAgICByb3RNYXQuZWxlbWVudHNbMio0KzBdID0gKG9uZU1pbnVzQ29zICogengpIC0geXM7XG4gICAgICByb3RNYXQuZWxlbWVudHNbMio0KzFdID0gKG9uZU1pbnVzQ29zICogeXopICsgeHM7XG4gICAgICByb3RNYXQuZWxlbWVudHNbMio0KzJdID0gKG9uZU1pbnVzQ29zICogenopICsgY29zQW5nbGU7XG4gICAgICByb3RNYXQuZWxlbWVudHNbMio0KzNdID0gMC4wO1xuXG4gICAgICByb3RNYXQuZWxlbWVudHNbMyo0KzBdID0gMC4wO1xuICAgICAgcm90TWF0LmVsZW1lbnRzWzMqNCsxXSA9IDAuMDtcbiAgICAgIHJvdE1hdC5lbGVtZW50c1szKjQrMl0gPSAwLjA7XG4gICAgICByb3RNYXQuZWxlbWVudHNbMyo0KzNdID0gMS4wO1xuXG4gICAgICByb3RNYXQgPSByb3RNYXQubXVsdGlwbHkodGhpcyk7XG4gICAgICB0aGlzLmVsZW1lbnRzID0gcm90TWF0LmVsZW1lbnRzO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIGZydXN0dW06IGZ1bmN0aW9uIChsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXJaLCBmYXJaKSB7XG4gICAgdmFyIGRlbHRhWCA9IHJpZ2h0IC0gbGVmdDtcbiAgICB2YXIgZGVsdGFZID0gdG9wIC0gYm90dG9tO1xuICAgIHZhciBkZWx0YVogPSBmYXJaIC0gbmVhclo7XG4gICAgdmFyIGZydXN0O1xuXG4gICAgaWYgKCAobmVhclogPD0gMC4wKSB8fCAoZmFyWiA8PSAwLjApIHx8XG4gICAgICAgICAoZGVsdGFYIDw9IDAuMCkgfHwgKGRlbHRhWSA8PSAwLjApIHx8IChkZWx0YVogPD0gMC4wKSApXG4gICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIGZydXN0ID0gbmV3IE1hdHJpeDR4NCgpO1xuXG4gICAgZnJ1c3QuZWxlbWVudHNbMCo0KzBdID0gMi4wICogbmVhclogLyBkZWx0YVg7XG4gICAgZnJ1c3QuZWxlbWVudHNbMCo0KzFdID0gZnJ1c3QuZWxlbWVudHNbMCo0KzJdID0gZnJ1c3QuZWxlbWVudHNbMCo0KzNdID0gMC4wO1xuXG4gICAgZnJ1c3QuZWxlbWVudHNbMSo0KzFdID0gMi4wICogbmVhclogLyBkZWx0YVk7XG4gICAgZnJ1c3QuZWxlbWVudHNbMSo0KzBdID0gZnJ1c3QuZWxlbWVudHNbMSo0KzJdID0gZnJ1c3QuZWxlbWVudHNbMSo0KzNdID0gMC4wO1xuXG4gICAgZnJ1c3QuZWxlbWVudHNbMio0KzBdID0gKHJpZ2h0ICsgbGVmdCkgLyBkZWx0YVg7XG4gICAgZnJ1c3QuZWxlbWVudHNbMio0KzFdID0gKHRvcCArIGJvdHRvbSkgLyBkZWx0YVk7XG4gICAgZnJ1c3QuZWxlbWVudHNbMio0KzJdID0gLShuZWFyWiArIGZhclopIC8gZGVsdGFaO1xuICAgIGZydXN0LmVsZW1lbnRzWzIqNCszXSA9IC0xLjA7XG5cbiAgICBmcnVzdC5lbGVtZW50c1szKjQrMl0gPSAtMi4wICogbmVhclogKiBmYXJaIC8gZGVsdGFaO1xuICAgIGZydXN0LmVsZW1lbnRzWzMqNCswXSA9IGZydXN0LmVsZW1lbnRzWzMqNCsxXSA9IGZydXN0LmVsZW1lbnRzWzMqNCszXSA9IDAuMDtcblxuICAgIGZydXN0ID0gZnJ1c3QubXVsdGlwbHkodGhpcyk7XG4gICAgdGhpcy5lbGVtZW50cyA9IGZydXN0LmVsZW1lbnRzO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgcGVyc3BlY3RpdmU6IGZ1bmN0aW9uIChmb3Z5LCBhc3BlY3QsIG5lYXJaLCBmYXJaKSB7XG4gICAgdmFyIGZydXN0dW1IID0gTWF0aC50YW4oZm92eSAvIDM2MC4wICogTWF0aC5QSSkgKiBuZWFyWjtcbiAgICB2YXIgZnJ1c3R1bVcgPSBmcnVzdHVtSCAqIGFzcGVjdDtcblxuICAgIHJldHVybiB0aGlzLmZydXN0dW0oLWZydXN0dW1XLCBmcnVzdHVtVywgLWZydXN0dW1ILCBmcnVzdHVtSCwgbmVhclosIGZhclopO1xuICB9LFxuXG4gIG9ydGhvOiBmdW5jdGlvbiAobGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyWiwgZmFyWikge1xuICAgIHZhciBkZWx0YVggPSByaWdodCAtIGxlZnQ7XG4gICAgdmFyIGRlbHRhWSA9IHRvcCAtIGJvdHRvbTtcbiAgICB2YXIgZGVsdGFaID0gZmFyWiAtIG5lYXJaO1xuXG4gICAgdmFyIG9ydGhvID0gbmV3IE1hdHJpeDR4NCgpO1xuXG4gICAgaWYgKCAoZGVsdGFYID09IDAuMCkgfHwgKGRlbHRhWSA9PSAwLjApIHx8IChkZWx0YVogPT0gMC4wKSApXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgb3J0aG8uZWxlbWVudHNbMCo0KzBdID0gMi4wIC8gZGVsdGFYO1xuICAgIG9ydGhvLmVsZW1lbnRzWzMqNCswXSA9IC0ocmlnaHQgKyBsZWZ0KSAvIGRlbHRhWDtcbiAgICBvcnRoby5lbGVtZW50c1sxKjQrMV0gPSAyLjAgLyBkZWx0YVk7XG4gICAgb3J0aG8uZWxlbWVudHNbMyo0KzFdID0gLSh0b3AgKyBib3R0b20pIC8gZGVsdGFZO1xuICAgIG9ydGhvLmVsZW1lbnRzWzIqNCsyXSA9IC0yLjAgLyBkZWx0YVo7XG4gICAgb3J0aG8uZWxlbWVudHNbMyo0KzJdID0gLShuZWFyWiArIGZhclopIC8gZGVsdGFaO1xuXG4gICAgb3J0aG8gPSBvcnRoby5tdWx0aXBseSh0aGlzKTtcbiAgICB0aGlzLmVsZW1lbnRzID0gb3J0aG8uZWxlbWVudHM7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBtdWx0aXBseTogZnVuY3Rpb24gKHJpZ2h0KSB7XG4gICAgdmFyIHRtcCA9IG5ldyBNYXRyaXg0eDQoKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICB0bXAuZWxlbWVudHNbaSo0KzBdID1cblx0KHRoaXMuZWxlbWVudHNbaSo0KzBdICogcmlnaHQuZWxlbWVudHNbMCo0KzBdKSArXG5cdCh0aGlzLmVsZW1lbnRzW2kqNCsxXSAqIHJpZ2h0LmVsZW1lbnRzWzEqNCswXSkgK1xuXHQodGhpcy5lbGVtZW50c1tpKjQrMl0gKiByaWdodC5lbGVtZW50c1syKjQrMF0pICtcblx0KHRoaXMuZWxlbWVudHNbaSo0KzNdICogcmlnaHQuZWxlbWVudHNbMyo0KzBdKSA7XG5cbiAgICAgIHRtcC5lbGVtZW50c1tpKjQrMV0gPVxuXHQodGhpcy5lbGVtZW50c1tpKjQrMF0gKiByaWdodC5lbGVtZW50c1swKjQrMV0pICtcblx0KHRoaXMuZWxlbWVudHNbaSo0KzFdICogcmlnaHQuZWxlbWVudHNbMSo0KzFdKSArXG5cdCh0aGlzLmVsZW1lbnRzW2kqNCsyXSAqIHJpZ2h0LmVsZW1lbnRzWzIqNCsxXSkgK1xuXHQodGhpcy5lbGVtZW50c1tpKjQrM10gKiByaWdodC5lbGVtZW50c1szKjQrMV0pIDtcblxuICAgICAgdG1wLmVsZW1lbnRzW2kqNCsyXSA9XG5cdCh0aGlzLmVsZW1lbnRzW2kqNCswXSAqIHJpZ2h0LmVsZW1lbnRzWzAqNCsyXSkgK1xuXHQodGhpcy5lbGVtZW50c1tpKjQrMV0gKiByaWdodC5lbGVtZW50c1sxKjQrMl0pICtcblx0KHRoaXMuZWxlbWVudHNbaSo0KzJdICogcmlnaHQuZWxlbWVudHNbMio0KzJdKSArXG5cdCh0aGlzLmVsZW1lbnRzW2kqNCszXSAqIHJpZ2h0LmVsZW1lbnRzWzMqNCsyXSkgO1xuXG4gICAgICB0bXAuZWxlbWVudHNbaSo0KzNdID1cblx0KHRoaXMuZWxlbWVudHNbaSo0KzBdICogcmlnaHQuZWxlbWVudHNbMCo0KzNdKSArXG5cdCh0aGlzLmVsZW1lbnRzW2kqNCsxXSAqIHJpZ2h0LmVsZW1lbnRzWzEqNCszXSkgK1xuXHQodGhpcy5lbGVtZW50c1tpKjQrMl0gKiByaWdodC5lbGVtZW50c1syKjQrM10pICtcblx0KHRoaXMuZWxlbWVudHNbaSo0KzNdICogcmlnaHQuZWxlbWVudHNbMyo0KzNdKSA7XG4gICAgfVxuXG4gICAgdGhpcy5lbGVtZW50cyA9IHRtcC5lbGVtZW50cztcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBjb3B5OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRtcCA9IG5ldyBNYXRyaXg0eDQoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE2OyBpKyspIHtcbiAgICAgIHRtcC5lbGVtZW50c1tpXSA9IHRoaXMuZWxlbWVudHNbaV07XG4gICAgfVxuICAgIHJldHVybiB0bXA7XG4gIH0sXG5cbiAgZ2V0OiBmdW5jdGlvbiAocm93LCBjb2wpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1s0KnJvdytjb2xdO1xuICB9LFxuXG4gIC8vIEluLXBsYWNlIGludmVyc2lvblxuICBpbnZlcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdG1wXzAgPSB0aGlzLmdldCgyLDIpICogdGhpcy5nZXQoMywzKTtcbiAgICB2YXIgdG1wXzEgPSB0aGlzLmdldCgzLDIpICogdGhpcy5nZXQoMiwzKTtcbiAgICB2YXIgdG1wXzIgPSB0aGlzLmdldCgxLDIpICogdGhpcy5nZXQoMywzKTtcbiAgICB2YXIgdG1wXzMgPSB0aGlzLmdldCgzLDIpICogdGhpcy5nZXQoMSwzKTtcbiAgICB2YXIgdG1wXzQgPSB0aGlzLmdldCgxLDIpICogdGhpcy5nZXQoMiwzKTtcbiAgICB2YXIgdG1wXzUgPSB0aGlzLmdldCgyLDIpICogdGhpcy5nZXQoMSwzKTtcbiAgICB2YXIgdG1wXzYgPSB0aGlzLmdldCgwLDIpICogdGhpcy5nZXQoMywzKTtcbiAgICB2YXIgdG1wXzcgPSB0aGlzLmdldCgzLDIpICogdGhpcy5nZXQoMCwzKTtcbiAgICB2YXIgdG1wXzggPSB0aGlzLmdldCgwLDIpICogdGhpcy5nZXQoMiwzKTtcbiAgICB2YXIgdG1wXzkgPSB0aGlzLmdldCgyLDIpICogdGhpcy5nZXQoMCwzKTtcbiAgICB2YXIgdG1wXzEwID0gdGhpcy5nZXQoMCwyKSAqIHRoaXMuZ2V0KDEsMyk7XG4gICAgdmFyIHRtcF8xMSA9IHRoaXMuZ2V0KDEsMikgKiB0aGlzLmdldCgwLDMpO1xuICAgIHZhciB0bXBfMTIgPSB0aGlzLmdldCgyLDApICogdGhpcy5nZXQoMywxKTtcbiAgICB2YXIgdG1wXzEzID0gdGhpcy5nZXQoMywwKSAqIHRoaXMuZ2V0KDIsMSk7XG4gICAgdmFyIHRtcF8xNCA9IHRoaXMuZ2V0KDEsMCkgKiB0aGlzLmdldCgzLDEpO1xuICAgIHZhciB0bXBfMTUgPSB0aGlzLmdldCgzLDApICogdGhpcy5nZXQoMSwxKTtcbiAgICB2YXIgdG1wXzE2ID0gdGhpcy5nZXQoMSwwKSAqIHRoaXMuZ2V0KDIsMSk7XG4gICAgdmFyIHRtcF8xNyA9IHRoaXMuZ2V0KDIsMCkgKiB0aGlzLmdldCgxLDEpO1xuICAgIHZhciB0bXBfMTggPSB0aGlzLmdldCgwLDApICogdGhpcy5nZXQoMywxKTtcbiAgICB2YXIgdG1wXzE5ID0gdGhpcy5nZXQoMywwKSAqIHRoaXMuZ2V0KDAsMSk7XG4gICAgdmFyIHRtcF8yMCA9IHRoaXMuZ2V0KDAsMCkgKiB0aGlzLmdldCgyLDEpO1xuICAgIHZhciB0bXBfMjEgPSB0aGlzLmdldCgyLDApICogdGhpcy5nZXQoMCwxKTtcbiAgICB2YXIgdG1wXzIyID0gdGhpcy5nZXQoMCwwKSAqIHRoaXMuZ2V0KDEsMSk7XG4gICAgdmFyIHRtcF8yMyA9IHRoaXMuZ2V0KDEsMCkgKiB0aGlzLmdldCgwLDEpO1xuXG4gICAgdmFyIHQwID0gKCh0bXBfMCAqIHRoaXMuZ2V0KDEsMSkgKyB0bXBfMyAqIHRoaXMuZ2V0KDIsMSkgKyB0bXBfNCAqIHRoaXMuZ2V0KDMsMSkpIC1cbiAgICAgICAgICAgICAgKHRtcF8xICogdGhpcy5nZXQoMSwxKSArIHRtcF8yICogdGhpcy5nZXQoMiwxKSArIHRtcF81ICogdGhpcy5nZXQoMywxKSkpO1xuICAgIHZhciB0MSA9ICgodG1wXzEgKiB0aGlzLmdldCgwLDEpICsgdG1wXzYgKiB0aGlzLmdldCgyLDEpICsgdG1wXzkgKiB0aGlzLmdldCgzLDEpKSAtXG4gICAgICAgICAgICAgICh0bXBfMCAqIHRoaXMuZ2V0KDAsMSkgKyB0bXBfNyAqIHRoaXMuZ2V0KDIsMSkgKyB0bXBfOCAqIHRoaXMuZ2V0KDMsMSkpKTtcbiAgICB2YXIgdDIgPSAoKHRtcF8yICogdGhpcy5nZXQoMCwxKSArIHRtcF83ICogdGhpcy5nZXQoMSwxKSArIHRtcF8xMCAqIHRoaXMuZ2V0KDMsMSkpIC1cbiAgICAgICAgICAgICAgKHRtcF8zICogdGhpcy5nZXQoMCwxKSArIHRtcF82ICogdGhpcy5nZXQoMSwxKSArIHRtcF8xMSAqIHRoaXMuZ2V0KDMsMSkpKTtcbiAgICB2YXIgdDMgPSAoKHRtcF81ICogdGhpcy5nZXQoMCwxKSArIHRtcF84ICogdGhpcy5nZXQoMSwxKSArIHRtcF8xMSAqIHRoaXMuZ2V0KDIsMSkpIC1cbiAgICAgICAgICAgICAgKHRtcF80ICogdGhpcy5nZXQoMCwxKSArIHRtcF85ICogdGhpcy5nZXQoMSwxKSArIHRtcF8xMCAqIHRoaXMuZ2V0KDIsMSkpKTtcblxuICAgIHZhciBkID0gMS4wIC8gKHRoaXMuZ2V0KDAsMCkgKiB0MCArIHRoaXMuZ2V0KDEsMCkgKiB0MSArIHRoaXMuZ2V0KDIsMCkgKiB0MiArIHRoaXMuZ2V0KDMsMCkgKiB0Myk7XG5cbiAgICB2YXIgb3V0XzAwID0gZCAqIHQwO1xuICAgIHZhciBvdXRfMDEgPSBkICogdDE7XG4gICAgdmFyIG91dF8wMiA9IGQgKiB0MjtcbiAgICB2YXIgb3V0XzAzID0gZCAqIHQzO1xuXG4gICAgdmFyIG91dF8xMCA9IGQgKiAoKHRtcF8xICogdGhpcy5nZXQoMSwwKSArIHRtcF8yICogdGhpcy5nZXQoMiwwKSArIHRtcF81ICogdGhpcy5nZXQoMywwKSkgLVxuICAgICAgICAgICAgICAgICAgICAgICh0bXBfMCAqIHRoaXMuZ2V0KDEsMCkgKyB0bXBfMyAqIHRoaXMuZ2V0KDIsMCkgKyB0bXBfNCAqIHRoaXMuZ2V0KDMsMCkpKTtcbiAgICB2YXIgb3V0XzExID0gZCAqICgodG1wXzAgKiB0aGlzLmdldCgwLDApICsgdG1wXzcgKiB0aGlzLmdldCgyLDApICsgdG1wXzggKiB0aGlzLmdldCgzLDApKSAtXG4gICAgICAgICAgICAgICAgICAgICAgKHRtcF8xICogdGhpcy5nZXQoMCwwKSArIHRtcF82ICogdGhpcy5nZXQoMiwwKSArIHRtcF85ICogdGhpcy5nZXQoMywwKSkpO1xuICAgIHZhciBvdXRfMTIgPSBkICogKCh0bXBfMyAqIHRoaXMuZ2V0KDAsMCkgKyB0bXBfNiAqIHRoaXMuZ2V0KDEsMCkgKyB0bXBfMTEgKiB0aGlzLmdldCgzLDApKSAtXG4gICAgICAgICAgICAgICAgICAgICAgKHRtcF8yICogdGhpcy5nZXQoMCwwKSArIHRtcF83ICogdGhpcy5nZXQoMSwwKSArIHRtcF8xMCAqIHRoaXMuZ2V0KDMsMCkpKTtcbiAgICB2YXIgb3V0XzEzID0gZCAqICgodG1wXzQgKiB0aGlzLmdldCgwLDApICsgdG1wXzkgKiB0aGlzLmdldCgxLDApICsgdG1wXzEwICogdGhpcy5nZXQoMiwwKSkgLVxuICAgICAgICAgICAgICAgICAgICAgICh0bXBfNSAqIHRoaXMuZ2V0KDAsMCkgKyB0bXBfOCAqIHRoaXMuZ2V0KDEsMCkgKyB0bXBfMTEgKiB0aGlzLmdldCgyLDApKSk7XG5cbiAgICB2YXIgb3V0XzIwID0gZCAqICgodG1wXzEyICogdGhpcy5nZXQoMSwzKSArIHRtcF8xNSAqIHRoaXMuZ2V0KDIsMykgKyB0bXBfMTYgKiB0aGlzLmdldCgzLDMpKSAtXG4gICAgICAgICAgICAgICAgICAgICAgKHRtcF8xMyAqIHRoaXMuZ2V0KDEsMykgKyB0bXBfMTQgKiB0aGlzLmdldCgyLDMpICsgdG1wXzE3ICogdGhpcy5nZXQoMywzKSkpO1xuICAgIHZhciBvdXRfMjEgPSBkICogKCh0bXBfMTMgKiB0aGlzLmdldCgwLDMpICsgdG1wXzE4ICogdGhpcy5nZXQoMiwzKSArIHRtcF8yMSAqIHRoaXMuZ2V0KDMsMykpIC1cbiAgICAgICAgICAgICAgICAgICAgICAodG1wXzEyICogdGhpcy5nZXQoMCwzKSArIHRtcF8xOSAqIHRoaXMuZ2V0KDIsMykgKyB0bXBfMjAgKiB0aGlzLmdldCgzLDMpKSk7XG4gICAgdmFyIG91dF8yMiA9IGQgKiAoKHRtcF8xNCAqIHRoaXMuZ2V0KDAsMykgKyB0bXBfMTkgKiB0aGlzLmdldCgxLDMpICsgdG1wXzIyICogdGhpcy5nZXQoMywzKSkgLVxuICAgICAgICAgICAgICAgICAgICAgICh0bXBfMTUgKiB0aGlzLmdldCgwLDMpICsgdG1wXzE4ICogdGhpcy5nZXQoMSwzKSArIHRtcF8yMyAqIHRoaXMuZ2V0KDMsMykpKTtcbiAgICB2YXIgb3V0XzIzID0gZCAqICgodG1wXzE3ICogdGhpcy5nZXQoMCwzKSArIHRtcF8yMCAqIHRoaXMuZ2V0KDEsMykgKyB0bXBfMjMgKiB0aGlzLmdldCgyLDMpKSAtXG4gICAgICAgICAgICAgICAgICAgICAgKHRtcF8xNiAqIHRoaXMuZ2V0KDAsMykgKyB0bXBfMjEgKiB0aGlzLmdldCgxLDMpICsgdG1wXzIyICogdGhpcy5nZXQoMiwzKSkpO1xuXG4gICAgdmFyIG91dF8zMCA9IGQgKiAoKHRtcF8xNCAqIHRoaXMuZ2V0KDIsMikgKyB0bXBfMTcgKiB0aGlzLmdldCgzLDIpICsgdG1wXzEzICogdGhpcy5nZXQoMSwyKSkgLVxuICAgICAgICAgICAgICAgICAgICAgICh0bXBfMTYgKiB0aGlzLmdldCgzLDIpICsgdG1wXzEyICogdGhpcy5nZXQoMSwyKSArIHRtcF8xNSAqIHRoaXMuZ2V0KDIsMikpKTtcbiAgICB2YXIgb3V0XzMxID0gZCAqICgodG1wXzIwICogdGhpcy5nZXQoMywyKSArIHRtcF8xMiAqIHRoaXMuZ2V0KDAsMikgKyB0bXBfMTkgKiB0aGlzLmdldCgyLDIpKSAtXG4gICAgICAgICAgICAgICAgICAgICAgKHRtcF8xOCAqIHRoaXMuZ2V0KDIsMikgKyB0bXBfMjEgKiB0aGlzLmdldCgzLDIpICsgdG1wXzEzICogdGhpcy5nZXQoMCwyKSkpO1xuICAgIHZhciBvdXRfMzIgPSBkICogKCh0bXBfMTggKiB0aGlzLmdldCgxLDIpICsgdG1wXzIzICogdGhpcy5nZXQoMywyKSArIHRtcF8xNSAqIHRoaXMuZ2V0KDAsMikpIC1cbiAgICAgICAgICAgICAgICAgICAgICAodG1wXzIyICogdGhpcy5nZXQoMywyKSArIHRtcF8xNCAqIHRoaXMuZ2V0KDAsMikgKyB0bXBfMTkgKiB0aGlzLmdldCgxLDIpKSk7XG4gICAgdmFyIG91dF8zMyA9IGQgKiAoKHRtcF8yMiAqIHRoaXMuZ2V0KDIsMikgKyB0bXBfMTYgKiB0aGlzLmdldCgwLDIpICsgdG1wXzIxICogdGhpcy5nZXQoMSwyKSkgLVxuICAgICAgICAgICAgICAgICAgICAgICh0bXBfMjAgKiB0aGlzLmdldCgxLDIpICsgdG1wXzIzICogdGhpcy5nZXQoMiwyKSArIHRtcF8xNyAqIHRoaXMuZ2V0KDAsMikpKTtcblxuICAgIHRoaXMuZWxlbWVudHNbMCo0KzBdID0gb3V0XzAwO1xuICAgIHRoaXMuZWxlbWVudHNbMCo0KzFdID0gb3V0XzAxO1xuICAgIHRoaXMuZWxlbWVudHNbMCo0KzJdID0gb3V0XzAyO1xuICAgIHRoaXMuZWxlbWVudHNbMCo0KzNdID0gb3V0XzAzO1xuICAgIHRoaXMuZWxlbWVudHNbMSo0KzBdID0gb3V0XzEwO1xuICAgIHRoaXMuZWxlbWVudHNbMSo0KzFdID0gb3V0XzExO1xuICAgIHRoaXMuZWxlbWVudHNbMSo0KzJdID0gb3V0XzEyO1xuICAgIHRoaXMuZWxlbWVudHNbMSo0KzNdID0gb3V0XzEzO1xuICAgIHRoaXMuZWxlbWVudHNbMio0KzBdID0gb3V0XzIwO1xuICAgIHRoaXMuZWxlbWVudHNbMio0KzFdID0gb3V0XzIxO1xuICAgIHRoaXMuZWxlbWVudHNbMio0KzJdID0gb3V0XzIyO1xuICAgIHRoaXMuZWxlbWVudHNbMio0KzNdID0gb3V0XzIzO1xuICAgIHRoaXMuZWxlbWVudHNbMyo0KzBdID0gb3V0XzMwO1xuICAgIHRoaXMuZWxlbWVudHNbMyo0KzFdID0gb3V0XzMxO1xuICAgIHRoaXMuZWxlbWVudHNbMyo0KzJdID0gb3V0XzMyO1xuICAgIHRoaXMuZWxlbWVudHNbMyo0KzNdID0gb3V0XzMzO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIC8vIFJldHVybnMgbmV3IG1hdHJpeCB3aGljaCBpcyB0aGUgaW52ZXJzZSBvZiB0aGlzXG4gIGludmVyc2U6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdG1wID0gdGhpcy5jb3B5KCk7XG4gICAgcmV0dXJuIHRtcC5pbnZlcnQoKTtcbiAgfSxcblxuICAvLyBJbi1wbGFjZSB0cmFuc3Bvc2VcbiAgdHJhbnNwb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRtcCA9IHRoaXMuZWxlbWVudHNbMCo0KzFdO1xuICAgIHRoaXMuZWxlbWVudHNbMCo0KzFdID0gdGhpcy5lbGVtZW50c1sxKjQrMF07XG4gICAgdGhpcy5lbGVtZW50c1sxKjQrMF0gPSB0bXA7XG5cbiAgICB0bXAgPSB0aGlzLmVsZW1lbnRzWzAqNCsyXTtcbiAgICB0aGlzLmVsZW1lbnRzWzAqNCsyXSA9IHRoaXMuZWxlbWVudHNbMio0KzBdO1xuICAgIHRoaXMuZWxlbWVudHNbMio0KzBdID0gdG1wO1xuXG4gICAgdG1wID0gdGhpcy5lbGVtZW50c1swKjQrM107XG4gICAgdGhpcy5lbGVtZW50c1swKjQrM10gPSB0aGlzLmVsZW1lbnRzWzMqNCswXTtcbiAgICB0aGlzLmVsZW1lbnRzWzMqNCswXSA9IHRtcDtcblxuICAgIHRtcCA9IHRoaXMuZWxlbWVudHNbMSo0KzJdO1xuICAgIHRoaXMuZWxlbWVudHNbMSo0KzJdID0gdGhpcy5lbGVtZW50c1syKjQrMV07XG4gICAgdGhpcy5lbGVtZW50c1syKjQrMV0gPSB0bXA7XG5cbiAgICB0bXAgPSB0aGlzLmVsZW1lbnRzWzEqNCszXTtcbiAgICB0aGlzLmVsZW1lbnRzWzEqNCszXSA9IHRoaXMuZWxlbWVudHNbMyo0KzFdO1xuICAgIHRoaXMuZWxlbWVudHNbMyo0KzFdID0gdG1wO1xuXG4gICAgdG1wID0gdGhpcy5lbGVtZW50c1syKjQrM107XG4gICAgdGhpcy5lbGVtZW50c1syKjQrM10gPSB0aGlzLmVsZW1lbnRzWzMqNCsyXTtcbiAgICB0aGlzLmVsZW1lbnRzWzMqNCsyXSA9IHRtcDtcblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIGxvYWRJZGVudGl0eTogZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTY7IGkrKylcbiAgICAgIHRoaXMuZWxlbWVudHNbaV0gPSAwO1xuICAgIHRoaXMuZWxlbWVudHNbMCo0KzBdID0gMS4wO1xuICAgIHRoaXMuZWxlbWVudHNbMSo0KzFdID0gMS4wO1xuICAgIHRoaXMuZWxlbWVudHNbMio0KzJdID0gMS4wO1xuICAgIHRoaXMuZWxlbWVudHNbMyo0KzNdID0gMS4wO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hdHJpeDR4NDtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJXYjhHZWpcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8zRC9tYXRyaXg0eDQuanNcIixcIi8zRFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuQ29weXJpZ2h0IDIwMTYgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbnZhciBNYXRyaXg0eDQgPSByZXF1aXJlKCcuL21hdHJpeDR4NCcpO1xudmFyIENhbWVyYUNvbnRyb2xsZXIgPSByZXF1aXJlKCcuL2NhbWVyYUNvbnRyb2xsZXInKTtcblxudmFyIEFOQUxZU0lTVFlQRV9GUkVRVUVOQ1kgXHRcdD0gMDtcbnZhciBBTkFMWVNJU1RZUEVfU09OT0dSQU0gXHRcdD0gMTtcbnZhciBBTkFMWVNJU1RZUEVfM0RfU09OT0dSQU0gXHQ9IDI7XG52YXIgQU5BTFlTSVNUWVBFX1dBVkVGT1JNIFx0XHQ9IDM7XG5cbi8vIFRoZSBcIm1vZGVsXCIgbWF0cml4IGlzIHRoZSBcIndvcmxkXCIgbWF0cml4IGluIFN0YW5kYXJkIEFubm90YXRpb25zIGFuZCBTZW1hbnRpY3NcbnZhciBtb2RlbCBcdFx0PSAwO1xudmFyIHZpZXcgXHRcdD0gMDtcbnZhciBwcm9qZWN0aW9uIFx0PSAwO1xuXG5mdW5jdGlvbiBjcmVhdGVHTEVycm9yV3JhcHBlcihjb250ZXh0LCBmbmFtZSkge1xuXHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHJ2ID0gY29udGV4dFtmbmFtZV0uYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTtcblx0XHR2YXIgZXJyID0gY29udGV4dC5nZXRFcnJvcigpO1xuXHRcdGlmIChlcnIgIT0gMClcblx0XHRcdHRocm93IFwiR0wgZXJyb3IgXCIgKyBlcnIgKyBcIiBpbiBcIiArIGZuYW1lO1xuXHRcdHJldHVybiBydjtcblx0fTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlM0REZWJ1Z0NvbnRleHQoY29udGV4dCkge1xuXHQvLyBUaGFua3MgdG8gSWxtYXJpIEhlaWtraW5lbiBmb3IgdGhlIGlkZWEgb24gaG93IHRvIGltcGxlbWVudCB0aGlzIHNvIGVsZWdhbnRseS5cblx0dmFyIHdyYXAgPSB7fTtcblx0Zm9yICh2YXIgaSBpbiBjb250ZXh0KSB7XG5cdFx0dHJ5IHtcblx0XHRcdGlmICh0eXBlb2YgY29udGV4dFtpXSA9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdHdyYXBbaV0gPSBjcmVhdGVHTEVycm9yV3JhcHBlcihjb250ZXh0LCBpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHdyYXBbaV0gPSBjb250ZXh0W2ldO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKFwiY3JlYXRlM0REZWJ1Z0NvbnRleHQ6IEVycm9yIGFjY2Vzc2luZyBcIiArIGkpO1xuXHRcdH1cblx0fVxuXHR3cmFwLmdldEVycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIGNvbnRleHQuZ2V0RXJyb3IoKTtcblx0fTtcblx0cmV0dXJuIHdyYXA7XG59XG5cbi8qKlxuICogQ2xhc3MgQW5hbHlzZXJWaWV3XG4gKi9cblxuQW5hbHlzZXJWaWV3ID0gZnVuY3Rpb24oY2FudmFzKSB7XG5cdC8vIE5PVEU6IHRoZSBkZWZhdWx0IHZhbHVlIG9mIHRoaXMgbmVlZHMgdG8gbWF0Y2ggdGhlIHNlbGVjdGVkIHJhZGlvIGJ1dHRvblxuXG5cdC8vIFRoaXMgYW5hbHlzaXMgdHlwZSBtYXkgYmUgb3ZlcnJpZGVuIGxhdGVyIG9uIGlmIHdlIGRpc2NvdmVyIHdlIGRvbid0IHN1cHBvcnQgdGhlIHJpZ2h0IHNoYWRlciBmZWF0dXJlcy5cblx0dGhpcy5hbmFseXNpc1R5cGUgPSBBTkFMWVNJU1RZUEVfM0RfU09OT0dSQU07XG5cblx0dGhpcy5zb25vZ3JhbTNEV2lkdGggPSAyNTY7XG5cdHRoaXMuc29ub2dyYW0zREhlaWdodCA9IDI1Njtcblx0dGhpcy5zb25vZ3JhbTNER2VvbWV0cnlTaXplID0gOS41O1xuXHRcblx0dGhpcy5mcmVxQnl0ZURhdGEgPSAwO1xuXHR0aGlzLnRleHR1cmUgPSAwO1xuXHR0aGlzLlRFWFRVUkVfSEVJR0hUID0gMjU2O1xuXHR0aGlzLnlvZmZzZXQgPSAwO1xuXG5cdHRoaXMuZnJlcXVlbmN5U2hhZGVyID0gMDtcblx0dGhpcy53YXZlZm9ybVNoYWRlciA9IDA7XG5cdHRoaXMuc29ub2dyYW1TaGFkZXIgPSAwO1xuXHR0aGlzLnNvbm9ncmFtM0RTaGFkZXIgPSAwO1xuXG5cdC8vIEJhY2tncm91bmQgY29sb3Jcblx0dGhpcy5iYWNrZ3JvdW5kQ29sb3IgPSBbLjA4LCAuMDgsIC4wOCwgMV07XG5cdHRoaXMuZm9yZWdyb3VuZENvbG9yID0gWzAsLjcsMCwxXTtcblxuXHR0aGlzLmNhbnZhcyA9IGNhbnZhcztcblx0dGhpcy5pbml0R0woKTtcbn1cblxuQW5hbHlzZXJWaWV3LnByb3RvdHlwZS5nZXRBdmFpbGFibGVDb250ZXh0ID0gZnVuY3Rpb24oY2FudmFzLCBjb250ZXh0TGlzdCkge1xuXHRpZiAoY2FudmFzLmdldENvbnRleHQpIHtcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgY29udGV4dExpc3QubGVuZ3RoOyArK2kpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoY29udGV4dExpc3RbaV0sIHsgYW50aWFsaWFzOnRydWUgfSk7XG5cdFx0XHRcdGlmKGNvbnRleHQgIT09IG51bGwpXG5cdFx0XHRcdFx0cmV0dXJuIGNvbnRleHQ7XG5cdFx0XHR9IGNhdGNoKGV4KSB7IH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59XG5cbkFuYWx5c2VyVmlldy5wcm90b3R5cGUuaW5pdEdMID0gZnVuY3Rpb24oKSB7XG5cdG1vZGVsIFx0XHQ9IG5ldyBNYXRyaXg0eDQoKTtcblx0dmlldyBcdFx0PSBuZXcgTWF0cml4NHg0KCk7XG5cdHByb2plY3Rpb24gXHQ9IG5ldyBNYXRyaXg0eDQoKTtcblx0Ly8gX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1xuXHR2YXIgc29ub2dyYW0zRFdpZHRoID0gdGhpcy5zb25vZ3JhbTNEV2lkdGg7XG5cdHZhciBzb25vZ3JhbTNESGVpZ2h0ID0gdGhpcy5zb25vZ3JhbTNESGVpZ2h0O1xuXHR2YXIgc29ub2dyYW0zREdlb21ldHJ5U2l6ZSA9IHRoaXMuc29ub2dyYW0zREdlb21ldHJ5U2l6ZTtcblx0dmFyIGJhY2tncm91bmRDb2xvciA9IHRoaXMuYmFja2dyb3VuZENvbG9yO1xuXHQvLyBfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXG5cdHZhciBjYW52YXMgPSB0aGlzLmNhbnZhcztcblx0Ly8gX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1xuXHR2YXIgZ2wgPSB0aGlzLmdldEF2YWlsYWJsZUNvbnRleHQoY2FudmFzLCBbJ3dlYmdsJywgJ2V4cGVyaW1lbnRhbC13ZWJnbCddKTtcblx0dGhpcy5nbCA9IGdsO1xuXG5cdC8vIElmIHdlJ3JlIG1pc3NpbmcgdGhpcyBzaGFkZXIgZmVhdHVyZSwgdGhlbiB3ZSBjYW4ndCBkbyB0aGUgM0QgdmlzdWFsaXphdGlvbi5cblx0dGhpcy5oYXMzRFZpc3VhbGl6ZXIgPSAoZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9WRVJURVhfVEVYVFVSRV9JTUFHRV9VTklUUykgPiAwKTtcblxuXHRpZiAoIXRoaXMuaGFzM0RWaXN1YWxpemVyICYmIHRoaXMuYW5hbHlzaXNUeXBlID09IEFOQUxZU0lTVFlQRV8zRF9TT05PR1JBTSlcblx0XHR0aGlzLmFuYWx5c2lzVHlwZSA9IEFOQUxZU0lTVFlQRV9GUkVRVUVOQ1k7XG5cblx0dmFyIGNhbWVyYUNvbnRyb2xsZXIgPSBuZXcgQ2FtZXJhQ29udHJvbGxlcihjYW52YXMpO1xuXHR0aGlzLmNhbWVyYUNvbnRyb2xsZXIgPSBjYW1lcmFDb250cm9sbGVyO1xuXG5cblx0Y2FtZXJhQ29udHJvbGxlci54Um90ID0gLTE4MDtcblx0Y2FtZXJhQ29udHJvbGxlci55Um90ID0gMjcwO1xuXHRjYW1lcmFDb250cm9sbGVyLnpSb3QgPSA5MDtcblxuXHRjYW1lcmFDb250cm9sbGVyLnhUID0gMDtcblx0Ly8gWm9vbSBsZXZlbC5cblx0Y2FtZXJhQ29udHJvbGxlci55VCA9IC0yO1xuXHQvLyBUcmFuc2xhdGlvbiBpbiB0aGUgeCBheGlzLlxuXHRjYW1lcmFDb250cm9sbGVyLnpUID0gLTI7XG5cblx0Z2wuY2xlYXJDb2xvcihiYWNrZ3JvdW5kQ29sb3JbMF0sIGJhY2tncm91bmRDb2xvclsxXSwgYmFja2dyb3VuZENvbG9yWzJdLCBiYWNrZ3JvdW5kQ29sb3JbM10pO1xuXHRnbC5lbmFibGUoZ2wuREVQVEhfVEVTVCk7XG5cblx0Ly8gSW5pdGlhbGl6YXRpb24gZm9yIHRoZSAyRCB2aXN1YWxpemF0aW9uc1xuXHR2YXIgdmVydGljZXMgPSBuZXcgRmxvYXQzMkFycmF5KFtcblx0XHQxLjAsICAgMS4wLCAgIDAuMCxcblx0XHQtMS4wLCAgIDEuMCwgICAwLjAsXG5cdFx0LTEuMCwgICAtMS4wLCAgIDAuMCxcblx0XHQxLjAsICAgMS4wLCAgIDAuMCxcblx0XHQtMS4wLCAgIC0xLjAsICAgMC4wLFxuXHRcdDEuMCwgICAtMS4wLCAgIDAuMF0pO1xuXHR2YXIgdGV4Q29vcmRzID0gbmV3IEZsb2F0MzJBcnJheShbXG5cdFx0MS4wLCAxLjAsXG5cdFx0MC4wLCAxLjAsXG5cdFx0MC4wLCAwLjAsXG5cdFx0MS4wLCAxLjAsXG5cdFx0MC4wLCAwLjAsXG5cdFx0MS4wLCAwLjBdKTtcblxuXHR2YXIgdmJvVGV4Q29vcmRPZmZzZXQgPSB2ZXJ0aWNlcy5ieXRlTGVuZ3RoO1xuXHR0aGlzLnZib1RleENvb3JkT2Zmc2V0ID0gdmJvVGV4Q29vcmRPZmZzZXQ7XG5cblx0Ly8gQ3JlYXRlIHRoZSB2ZXJ0aWNlcyBhbmQgdGV4dHVyZSBjb29yZGluYXRlc1xuXHR2YXIgdmJvID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG5cdHRoaXMudmJvID0gdmJvO1xuXG5cdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2Ym8pO1xuXHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUixcblx0XHR2Ym9UZXhDb29yZE9mZnNldCArIHRleENvb3Jkcy5ieXRlTGVuZ3RoLFxuXHRcdGdsLlNUQVRJQ19EUkFXKTtcblx0XHRnbC5idWZmZXJTdWJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgMCwgdmVydGljZXMpO1xuXHRcdGdsLmJ1ZmZlclN1YkRhdGEoZ2wuQVJSQVlfQlVGRkVSLCB2Ym9UZXhDb29yZE9mZnNldCwgdGV4Q29vcmRzKTtcblxuXHQvLyBJbml0aWFsaXphdGlvbiBmb3IgdGhlIDNEIHZpc3VhbGl6YXRpb25zXG5cdHZhciBudW1WZXJ0aWNlcyA9IHNvbm9ncmFtM0RXaWR0aCAqIHNvbm9ncmFtM0RIZWlnaHQ7XG5cdGlmIChudW1WZXJ0aWNlcyA+IDY1NTM2KSB7XG5cdFx0dGhyb3cgXCJTb25vZ3JhbSAzRCByZXNvbHV0aW9uIGlzIHRvbyBoaWdoOiBjYW4gb25seSBoYW5kbGUgNjU1MzYgdmVydGljZXMgbWF4XCI7XG5cdH1cblx0dmVydGljZXMgPSBuZXcgRmxvYXQzMkFycmF5KG51bVZlcnRpY2VzICogMyk7XG5cdHRleENvb3JkcyA9IG5ldyBGbG9hdDMyQXJyYXkobnVtVmVydGljZXMgKiAyKTtcblxuXHRmb3IgKHZhciB6ID0gMDsgeiA8IHNvbm9ncmFtM0RIZWlnaHQ7IHorKykge1xuXHRcdGZvciAodmFyIHggPSAwOyB4IDwgc29ub2dyYW0zRFdpZHRoOyB4KyspIHtcblx0XHRcdC8vIEdlbmVyYXRlIGEgcmVhc29uYWJseSBmaW5lIG1lc2ggaW4gdGhlIFgtWiBwbGFuZVxuXHRcdFx0dmVydGljZXNbMyAqIChzb25vZ3JhbTNEV2lkdGggKiB6ICsgeCkgKyAwXSA9XG5cdFx0XHRzb25vZ3JhbTNER2VvbWV0cnlTaXplICogKHggLSBzb25vZ3JhbTNEV2lkdGggLyAyKSAvIHNvbm9ncmFtM0RXaWR0aDtcblx0XHRcdHZlcnRpY2VzWzMgKiAoc29ub2dyYW0zRFdpZHRoICogeiArIHgpICsgMV0gPSAwO1xuXHRcdFx0dmVydGljZXNbMyAqIChzb25vZ3JhbTNEV2lkdGggKiB6ICsgeCkgKyAyXSA9IHNvbm9ncmFtM0RHZW9tZXRyeVNpemUgKiAoeiAtIHNvbm9ncmFtM0RIZWlnaHQgLyAyKSAvIHNvbm9ncmFtM0RIZWlnaHQ7XG5cblx0XHRcdHRleENvb3Jkc1syICogKHNvbm9ncmFtM0RXaWR0aCAqIHogKyB4KSArIDBdID0geCAvIChzb25vZ3JhbTNEV2lkdGggLSAxKTtcblx0XHRcdHRleENvb3Jkc1syICogKHNvbm9ncmFtM0RXaWR0aCAqIHogKyB4KSArIDFdID0geiAvIChzb25vZ3JhbTNESGVpZ2h0IC0gMSk7XG5cdFx0fVxuXHR9XG5cblx0dmFyIHZibzNEVGV4Q29vcmRPZmZzZXQgPSB2ZXJ0aWNlcy5ieXRlTGVuZ3RoO1xuXHR0aGlzLnZibzNEVGV4Q29vcmRPZmZzZXQgPSB2Ym8zRFRleENvb3JkT2Zmc2V0O1xuXG5cdC8vIENyZWF0ZSB0aGUgdmVydGljZXMgYW5kIHRleHR1cmUgY29vcmRpbmF0ZXNcblx0dmFyIHNvbm9ncmFtM0RWQk8gPSBnbC5jcmVhdGVCdWZmZXIoKTtcblx0dGhpcy5zb25vZ3JhbTNEVkJPID0gc29ub2dyYW0zRFZCTztcblxuXHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgc29ub2dyYW0zRFZCTyk7XG5cdGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCB2Ym8zRFRleENvb3JkT2Zmc2V0ICsgdGV4Q29vcmRzLmJ5dGVMZW5ndGgsIGdsLlNUQVRJQ19EUkFXKTtcblx0Z2wuYnVmZmVyU3ViRGF0YShnbC5BUlJBWV9CVUZGRVIsIDAsIHZlcnRpY2VzKTtcblx0Z2wuYnVmZmVyU3ViRGF0YShnbC5BUlJBWV9CVUZGRVIsIHZibzNEVGV4Q29vcmRPZmZzZXQsIHRleENvb3Jkcyk7XG5cblx0Ly8gTm93IGdlbmVyYXRlIGluZGljZXNcblx0dmFyIHNvbm9ncmFtM0ROdW1JbmRpY2VzID0gKHNvbm9ncmFtM0RXaWR0aCAtIDEpICogKHNvbm9ncmFtM0RIZWlnaHQgLSAxKSAqIDY7XG5cdHRoaXMuc29ub2dyYW0zRE51bUluZGljZXMgPSBzb25vZ3JhbTNETnVtSW5kaWNlcyAtICg2ICogNjAwKTtcblxuXHR2YXIgaW5kaWNlcyA9IG5ldyBVaW50MTZBcnJheShzb25vZ3JhbTNETnVtSW5kaWNlcyk7XG5cdC8vIFdlIG5lZWQgdG8gdXNlIFRSSUFOR0xFUyBpbnN0ZWFkIG9mIGZvciBleGFtcGxlIFRSSUFOR0xFX1NUUklQXG5cdC8vIGJlY2F1c2Ugd2Ugd2FudCB0byBtYWtlIG9uZSBkcmF3IGNhbGwgaW5zdGVhZCBvZiBodW5kcmVkcyBwZXJcblx0Ly8gZnJhbWUsIGFuZCB1bmxlc3Mgd2UgcHJvZHVjZSBkZWdlbmVyYXRlIHRyaWFuZ2xlcyAod2hpY2ggYXJlIHZlcnlcblx0Ly8gdWdseSkgd2Ugd29uJ3QgYmUgYWJsZSB0byBzcGxpdCB0aGUgcm93cy5cblx0dmFyIGlkeCA9IDA7XG5cdGZvciAodmFyIHogPSAwOyB6IDwgc29ub2dyYW0zREhlaWdodCAtIDE7IHorKykge1xuXHRcdGZvciAodmFyIHggPSAwOyB4IDwgc29ub2dyYW0zRFdpZHRoIC0gMTsgeCsrKSB7XG5cdFx0XHRpbmRpY2VzW2lkeCsrXSA9IHogKiBzb25vZ3JhbTNEV2lkdGggKyB4O1xuXHRcdFx0aW5kaWNlc1tpZHgrK10gPSB6ICogc29ub2dyYW0zRFdpZHRoICsgeCArIDE7XG5cdFx0XHRpbmRpY2VzW2lkeCsrXSA9ICh6ICsgMSkgKiBzb25vZ3JhbTNEV2lkdGggKyB4ICsgMTtcblx0XHRcdGluZGljZXNbaWR4KytdID0geiAqIHNvbm9ncmFtM0RXaWR0aCArIHg7XG5cdFx0XHRpbmRpY2VzW2lkeCsrXSA9ICh6ICsgMSkgKiBzb25vZ3JhbTNEV2lkdGggKyB4ICsgMTtcblx0XHRcdGluZGljZXNbaWR4KytdID0gKHogKyAxKSAqIHNvbm9ncmFtM0RXaWR0aCArIHg7XG5cdFx0fVxuXHR9XG5cblx0dmFyIHNvbm9ncmFtM0RJQk8gPSBnbC5jcmVhdGVCdWZmZXIoKTtcblx0dGhpcy5zb25vZ3JhbTNESUJPID0gc29ub2dyYW0zRElCTztcblxuXHRnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBzb25vZ3JhbTNESUJPKTtcblx0Z2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kaWNlcywgZ2wuU1RBVElDX0RSQVcpO1xuXHQvLyBOb3RlIHdlIGRvIG5vdCB1bmJpbmQgdGhpcyBidWZmZXIgLS0gbm90IG5lY2Vzc2FyeVxuXG5cdC8vIExvYWQgdGhlIHNoYWRlcnNcblx0dGhpcy5mcmVxdWVuY3lTaGFkZXIgPSBvM2Rqcy5zaGFkZXIubG9hZEZyb21VUkwoZ2wsIFwiYmluL3NoYWRlcnMvY29tbW9uLXZlcnRleC5zaGFkZXJcIiwgXCJiaW4vc2hhZGVycy9mcmVxdWVuY3ktZnJhZ21lbnQuc2hhZGVyXCIpO1xuXHR0aGlzLndhdmVmb3JtU2hhZGVyID0gbzNkanMuc2hhZGVyLmxvYWRGcm9tVVJMKGdsLCBcImJpbi9zaGFkZXJzL2NvbW1vbi12ZXJ0ZXguc2hhZGVyXCIsIFwiYmluL3NoYWRlcnMvd2F2ZWZvcm0tZnJhZ21lbnQuc2hhZGVyXCIpO1xuXHR0aGlzLnNvbm9ncmFtU2hhZGVyID0gbzNkanMuc2hhZGVyLmxvYWRGcm9tVVJMKGdsLCBcImJpbi9zaGFkZXJzL2NvbW1vbi12ZXJ0ZXguc2hhZGVyXCIsIFwiYmluL3NoYWRlcnMvc29ub2dyYW0tZnJhZ21lbnQuc2hhZGVyXCIpO1xuXG5cdGlmICh0aGlzLmhhczNEVmlzdWFsaXplcil7XG5cdFx0dGhpcy5zb25vZ3JhbTNEU2hhZGVyID0gbzNkanMuc2hhZGVyLmxvYWRGcm9tVVJMKGdsLCBcImJpbi9zaGFkZXJzL3Nvbm9ncmFtLXZlcnRleC5zaGFkZXJcIiwgXCJiaW4vc2hhZGVycy9zb25vZ3JhbS1mcmFnbWVudC5zaGFkZXJcIik7XG5cblx0fVxuXHRjb25zb2xlLmxvZygndGhpcy5zb25vZ3JhbVNoYWRlcicsIHRoaXMuc29ub2dyYW1TaGFkZXIpO1xuXHRjb25zb2xlLmxvZygndGhpcy5zb25vZ3JhbTNEU2hhZGVyJywgdGhpcy5zb25vZ3JhbTNEU2hhZGVyKTtcbn1cblxuQW5hbHlzZXJWaWV3LnByb3RvdHlwZS5pbml0Qnl0ZUJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgZ2wgPSB0aGlzLmdsO1xuXHR2YXIgVEVYVFVSRV9IRUlHSFQgPSB0aGlzLlRFWFRVUkVfSEVJR0hUO1xuXG5cdGlmICghdGhpcy5mcmVxQnl0ZURhdGEgfHwgdGhpcy5mcmVxQnl0ZURhdGEubGVuZ3RoICE9IHRoaXMuYW5hbHlzZXIuZnJlcXVlbmN5QmluQ291bnQpIHtcblx0XHRmcmVxQnl0ZURhdGEgPSBuZXcgVWludDhBcnJheSh0aGlzLmFuYWx5c2VyLmZyZXF1ZW5jeUJpbkNvdW50KTtcblx0XHR0aGlzLmZyZXFCeXRlRGF0YSA9IGZyZXFCeXRlRGF0YTtcblxuXHRcdC8vIChSZS0pQWxsb2NhdGUgdGhlIHRleHR1cmUgb2JqZWN0XG5cdFx0aWYgKHRoaXMudGV4dHVyZSkge1xuXHRcdFx0Z2wuZGVsZXRlVGV4dHVyZSh0aGlzLnRleHR1cmUpO1xuXHRcdFx0dGhpcy50ZXh0dXJlID0gbnVsbDtcblx0XHR9XG5cdFx0dmFyIHRleHR1cmUgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG5cdFx0dGhpcy50ZXh0dXJlID0gdGV4dHVyZTtcblxuXHRcdGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRleHR1cmUpO1xuXHRcdGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1MsIGdsLkNMQU1QX1RPX0VER0UpO1xuXHRcdGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLlJFUEVBVCk7XG5cdFx0Z2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLkxJTkVBUik7XG5cdFx0Z2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLkxJTkVBUik7XG5cdFx0Ly8gVE9ETyhrYnIpOiBXZWJHTCBuZWVkcyB0byBwcm9wZXJseSBjbGVhciBvdXQgdGhlIHRleHR1cmUgd2hlbiBudWxsIGlzIHNwZWNpZmllZFxuXHRcdHZhciB0bXAgPSBuZXcgVWludDhBcnJheShmcmVxQnl0ZURhdGEubGVuZ3RoICogVEVYVFVSRV9IRUlHSFQpO1xuXHRcdGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgZ2wuQUxQSEEsIGZyZXFCeXRlRGF0YS5sZW5ndGgsIFRFWFRVUkVfSEVJR0hULCAwLCBnbC5BTFBIQSwgZ2wuVU5TSUdORURfQllURSwgdG1wKTtcblx0fVxufVxuXG5BbmFseXNlclZpZXcucHJvdG90eXBlLnNldEFuYWx5c2lzVHlwZSA9IGZ1bmN0aW9uKHR5cGUpIHtcblx0Ly8gQ2hlY2sgZm9yIHJlYWQgdGV4dHVyZXMgaW4gdmVydGV4IHNoYWRlcnMuXG5cdGlmICghdGhpcy5oYXMzRFZpc3VhbGl6ZXIgJiYgdHlwZSA9PSBBTkFMWVNJU1RZUEVfM0RfU09OT0dSQU0pXG5cdFx0cmV0dXJuO1xuXG5cdHRoaXMuYW5hbHlzaXNUeXBlID0gdHlwZTtcbn1cblxuQW5hbHlzZXJWaWV3LnByb3RvdHlwZS5hbmFseXNpc1R5cGUgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuYW5hbHlzaXNUeXBlO1xufVxuXG5BbmFseXNlclZpZXcucHJvdG90eXBlLmRvRnJlcXVlbmN5QW5hbHlzaXMgPSBmdW5jdGlvbihldmVudCkge1xuXHR2YXIgZnJlcUJ5dGVEYXRhID0gdGhpcy5mcmVxQnl0ZURhdGE7XG5cblx0c3dpdGNoKHRoaXMuYW5hbHlzaXNUeXBlKSB7XG5cdGNhc2UgQU5BTFlTSVNUWVBFX0ZSRVFVRU5DWTpcblx0XHR0aGlzLmFuYWx5c2VyLnNtb290aGluZ1RpbWVDb25zdGFudCA9IDAuNzU7XG5cdFx0dGhpcy5hbmFseXNlci5nZXRCeXRlRnJlcXVlbmN5RGF0YShmcmVxQnl0ZURhdGEpO1xuXHRcdGJyZWFrO1xuXG5cdGNhc2UgQU5BTFlTSVNUWVBFX1NPTk9HUkFNOlxuXHRjYXNlIEFOQUxZU0lTVFlQRV8zRF9TT05PR1JBTTpcblx0XHR0aGlzLmFuYWx5c2VyLnNtb290aGluZ1RpbWVDb25zdGFudCA9IDA7XG5cdFx0dGhpcy5hbmFseXNlci5nZXRCeXRlRnJlcXVlbmN5RGF0YShmcmVxQnl0ZURhdGEpO1xuXHRcdGJyZWFrO1xuXG5cdGNhc2UgQU5BTFlTSVNUWVBFX1dBVkVGT1JNOlxuXHRcdHRoaXMuYW5hbHlzZXIuc21vb3RoaW5nVGltZUNvbnN0YW50ID0gMC4xO1xuXHRcdHRoaXMuYW5hbHlzZXIuZ2V0Qnl0ZVRpbWVEb21haW5EYXRhKGZyZXFCeXRlRGF0YSk7XG5cdFx0YnJlYWs7XG5cdH1cblxuXHR0aGlzLmRyYXdHTCgpO1xufVxuXG5BbmFseXNlclZpZXcucHJvdG90eXBlLmRyYXdHTCA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgY2FudmFzID0gdGhpcy5jYW52YXM7XG5cdHZhciBnbCA9IHRoaXMuZ2w7XG5cdHZhciB2Ym8gPSB0aGlzLnZibztcblx0dmFyIHZib1RleENvb3JkT2Zmc2V0ID0gdGhpcy52Ym9UZXhDb29yZE9mZnNldDtcblx0dmFyIHNvbm9ncmFtM0RWQk8gPSB0aGlzLnNvbm9ncmFtM0RWQk87XG5cdHZhciB2Ym8zRFRleENvb3JkT2Zmc2V0ID0gdGhpcy52Ym8zRFRleENvb3JkT2Zmc2V0O1xuXHR2YXIgc29ub2dyYW0zREdlb21ldHJ5U2l6ZSA9IHRoaXMuc29ub2dyYW0zREdlb21ldHJ5U2l6ZTtcblx0dmFyIHNvbm9ncmFtM0ROdW1JbmRpY2VzID0gdGhpcy5zb25vZ3JhbTNETnVtSW5kaWNlcztcblx0dmFyIHNvbm9ncmFtM0RXaWR0aCA9IHRoaXMuc29ub2dyYW0zRFdpZHRoO1xuXHR2YXIgc29ub2dyYW0zREhlaWdodCA9IHRoaXMuc29ub2dyYW0zREhlaWdodDtcblx0dmFyIGZyZXFCeXRlRGF0YSA9IHRoaXMuZnJlcUJ5dGVEYXRhO1xuXHR2YXIgdGV4dHVyZSA9IHRoaXMudGV4dHVyZTtcblx0dmFyIFRFWFRVUkVfSEVJR0hUID0gdGhpcy5URVhUVVJFX0hFSUdIVDtcblxuXHR2YXIgZnJlcXVlbmN5U2hhZGVyID0gdGhpcy5mcmVxdWVuY3lTaGFkZXI7XG5cdHZhciB3YXZlZm9ybVNoYWRlciA9IHRoaXMud2F2ZWZvcm1TaGFkZXI7XG5cdHZhciBzb25vZ3JhbVNoYWRlciA9IHRoaXMuc29ub2dyYW1TaGFkZXI7XG5cdHZhciBzb25vZ3JhbTNEU2hhZGVyID0gdGhpcy5zb25vZ3JhbTNEU2hhZGVyO1xuXG5cblx0Z2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGV4dHVyZSk7XG5cdGdsLnBpeGVsU3RvcmVpKGdsLlVOUEFDS19BTElHTk1FTlQsIDEpO1xuXHRpZiAodGhpcy5hbmFseXNpc1R5cGUgIT0gQU5BTFlTSVNUWVBFX1NPTk9HUkFNICYmIHRoaXMuYW5hbHlzaXNUeXBlICE9IEFOQUxZU0lTVFlQRV8zRF9TT05PR1JBTSkge1xuXHRcdHRoaXMueW9mZnNldCA9IDA7XG5cdH1cblxuXHRnbC50ZXhTdWJJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIDAsIHRoaXMueW9mZnNldCwgZnJlcUJ5dGVEYXRhLmxlbmd0aCwgMSwgZ2wuQUxQSEEsIGdsLlVOU0lHTkVEX0JZVEUsIGZyZXFCeXRlRGF0YSk7XG5cblx0aWYgKHRoaXMuYW5hbHlzaXNUeXBlID09IEFOQUxZU0lTVFlQRV9TT05PR1JBTSB8fCB0aGlzLmFuYWx5c2lzVHlwZSA9PSBBTkFMWVNJU1RZUEVfM0RfU09OT0dSQU0pIHtcblx0XHR0aGlzLnlvZmZzZXQgPSAodGhpcy55b2Zmc2V0ICsgMSkgJSBURVhUVVJFX0hFSUdIVDtcblx0fVxuXHR2YXIgeW9mZnNldCA9IHRoaXMueW9mZnNldDtcblxuXHQvLyBQb2ludCB0aGUgZnJlcXVlbmN5IGRhdGEgdGV4dHVyZSBhdCB0ZXh0dXJlIHVuaXQgMCAodGhlIGRlZmF1bHQpLFxuXHQvLyB3aGljaCBpcyB3aGF0IHdlJ3JlIHVzaW5nIHNpbmNlIHdlIGhhdmVuJ3QgY2FsbGVkIGFjdGl2ZVRleHR1cmVcblx0Ly8gaW4gb3VyIHByb2dyYW1cblxuXHR2YXIgdmVydGV4TG9jO1xuXHR2YXIgdGV4Q29vcmRMb2M7XG5cdHZhciBmcmVxdWVuY3lEYXRhTG9jO1xuXHR2YXIgZm9yZWdyb3VuZENvbG9yTG9jO1xuXHR2YXIgYmFja2dyb3VuZENvbG9yTG9jO1xuXHR2YXIgdGV4Q29vcmRPZmZzZXQ7XG5cblx0dmFyIGN1cnJlbnRTaGFkZXI7XG5cblx0c3dpdGNoICh0aGlzLmFuYWx5c2lzVHlwZSkge1xuXHRjYXNlIEFOQUxZU0lTVFlQRV9GUkVRVUVOQ1k6XG5cdGNhc2UgQU5BTFlTSVNUWVBFX1dBVkVGT1JNOlxuXHRcdGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2Ym8pO1xuXHRcdGN1cnJlbnRTaGFkZXIgPSB0aGlzLmFuYWx5c2lzVHlwZSA9PSBBTkFMWVNJU1RZUEVfRlJFUVVFTkNZID8gZnJlcXVlbmN5U2hhZGVyIDogd2F2ZWZvcm1TaGFkZXI7XG5cdFx0Y3VycmVudFNoYWRlci5iaW5kKCk7XG5cdFx0dmVydGV4TG9jID0gY3VycmVudFNoYWRlci5nUG9zaXRpb25Mb2M7XG5cdFx0dGV4Q29vcmRMb2MgPSBjdXJyZW50U2hhZGVyLmdUZXhDb29yZDBMb2M7XG5cdFx0ZnJlcXVlbmN5RGF0YUxvYyA9IGN1cnJlbnRTaGFkZXIuZnJlcXVlbmN5RGF0YUxvYztcblx0XHRmb3JlZ3JvdW5kQ29sb3JMb2MgPSBjdXJyZW50U2hhZGVyLmZvcmVncm91bmRDb2xvckxvYztcblx0XHRiYWNrZ3JvdW5kQ29sb3JMb2MgPSBjdXJyZW50U2hhZGVyLmJhY2tncm91bmRDb2xvckxvYztcblx0XHRnbC51bmlmb3JtMWYoY3VycmVudFNoYWRlci55b2Zmc2V0TG9jLCAwLjUgLyAoVEVYVFVSRV9IRUlHSFQgLSAxKSk7XG5cdFx0dGV4Q29vcmRPZmZzZXQgPSB2Ym9UZXhDb29yZE9mZnNldDtcblx0XHRicmVhaztcblxuXHRjYXNlIEFOQUxZU0lTVFlQRV9TT05PR1JBTTpcblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdmJvKTtcblx0XHRzb25vZ3JhbVNoYWRlci5iaW5kKCk7XG5cdFx0dmVydGV4TG9jID0gc29ub2dyYW1TaGFkZXIuZ1Bvc2l0aW9uTG9jO1xuXHRcdHRleENvb3JkTG9jID0gc29ub2dyYW1TaGFkZXIuZ1RleENvb3JkMExvYztcblx0XHRmcmVxdWVuY3lEYXRhTG9jID0gc29ub2dyYW1TaGFkZXIuZnJlcXVlbmN5RGF0YUxvYztcblx0XHRmb3JlZ3JvdW5kQ29sb3JMb2MgPSBzb25vZ3JhbVNoYWRlci5mb3JlZ3JvdW5kQ29sb3JMb2M7XG5cdFx0YmFja2dyb3VuZENvbG9yTG9jID0gc29ub2dyYW1TaGFkZXIuYmFja2dyb3VuZENvbG9yTG9jO1xuXHRcdGdsLnVuaWZvcm0xZihzb25vZ3JhbVNoYWRlci55b2Zmc2V0TG9jLCB5b2Zmc2V0IC8gKFRFWFRVUkVfSEVJR0hUIC0gMSkpO1xuXHRcdHRleENvb3JkT2Zmc2V0ID0gdmJvVGV4Q29vcmRPZmZzZXQ7XG5cdFx0YnJlYWs7XG5cblx0Y2FzZSBBTkFMWVNJU1RZUEVfM0RfU09OT0dSQU06XG5cblx0XHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgc29ub2dyYW0zRFZCTyk7XG5cdFx0c29ub2dyYW0zRFNoYWRlci5iaW5kKCk7XG5cdFx0dmVydGV4TG9jICAgICAgICAgICA9IHNvbm9ncmFtM0RTaGFkZXIuZ1Bvc2l0aW9uTG9jO1xuXHRcdHRleENvb3JkTG9jICAgICAgICAgPSBzb25vZ3JhbTNEU2hhZGVyLmdUZXhDb29yZDBMb2M7XG5cdFx0ZnJlcXVlbmN5RGF0YUxvYyAgICA9IHNvbm9ncmFtM0RTaGFkZXIuZnJlcXVlbmN5RGF0YUxvYztcblx0XHRmb3JlZ3JvdW5kQ29sb3JMb2MgID0gc29ub2dyYW0zRFNoYWRlci5mb3JlZ3JvdW5kQ29sb3JMb2M7XG5cdFx0YmFja2dyb3VuZENvbG9yTG9jICA9IHNvbm9ncmFtM0RTaGFkZXIuYmFja2dyb3VuZENvbG9yTG9jO1xuXG5cdFx0Z2wudW5pZm9ybTFpKHNvbm9ncmFtM0RTaGFkZXIudmVydGV4RnJlcXVlbmN5RGF0YUxvYywgMCk7XG5cblx0XHR2YXIgbm9ybWFsaXplZFlPZmZzZXQgPSB0aGlzLnlvZmZzZXQgLyAoVEVYVFVSRV9IRUlHSFQgLSAxKTtcblxuXHRcdGdsLnVuaWZvcm0xZihzb25vZ3JhbTNEU2hhZGVyLnlvZmZzZXRMb2MsIG5vcm1hbGl6ZWRZT2Zmc2V0KTtcblxuXHRcdHZhciBkaXNjcmV0aXplZFlPZmZzZXQgPSBNYXRoLmZsb29yKG5vcm1hbGl6ZWRZT2Zmc2V0ICogKHNvbm9ncmFtM0RIZWlnaHQgLSAxKSkgLyAoc29ub2dyYW0zREhlaWdodCAtIDEpO1xuXG5cdFx0Z2wudW5pZm9ybTFmKHNvbm9ncmFtM0RTaGFkZXIudmVydGV4WU9mZnNldExvYywgZGlzY3JldGl6ZWRZT2Zmc2V0KTtcblx0XHRnbC51bmlmb3JtMWYoc29ub2dyYW0zRFNoYWRlci52ZXJ0aWNhbFNjYWxlTG9jLCBzb25vZ3JhbTNER2VvbWV0cnlTaXplIC8gMy41ICk7XG5cblx0XHQvLyBTZXQgdXAgdGhlIG1vZGVsLCB2aWV3IGFuZCBwcm9qZWN0aW9uIG1hdHJpY2VzXG5cdFx0cHJvamVjdGlvbi5sb2FkSWRlbnRpdHkoKTtcblx0XHRwcm9qZWN0aW9uLnBlcnNwZWN0aXZlKDU1IC8qMzUqLywgY2FudmFzLndpZHRoIC8gY2FudmFzLmhlaWdodCwgMSwgMTAwKTtcblx0XHR2aWV3LmxvYWRJZGVudGl0eSgpO1xuXHRcdHZpZXcudHJhbnNsYXRlKDAsIDAsIC05LjAgLyotMTMuMCovKTtcblxuXHRcdC8vIEFkZCBpbiBjYW1lcmEgY29udHJvbGxlcidzIHJvdGF0aW9uXG5cdFx0bW9kZWwubG9hZElkZW50aXR5KCk7XG5cdFx0bW9kZWwucm90YXRlKHRoaXMuY2FtZXJhQ29udHJvbGxlci54Um90LCAxLCAwLCAwKTtcblx0XHRtb2RlbC5yb3RhdGUodGhpcy5jYW1lcmFDb250cm9sbGVyLnlSb3QsIDAsIDEsIDApO1xuXHRcdG1vZGVsLnJvdGF0ZSh0aGlzLmNhbWVyYUNvbnRyb2xsZXIuelJvdCwgMCwgMCwgMSk7XG5cdFx0bW9kZWwudHJhbnNsYXRlKHRoaXMuY2FtZXJhQ29udHJvbGxlci54VCwgdGhpcy5jYW1lcmFDb250cm9sbGVyLnlULCB0aGlzLmNhbWVyYUNvbnRyb2xsZXIuelQpO1xuXG5cdFx0Ly8gQ29tcHV0ZSBuZWNlc3NhcnkgbWF0cmljZXNcblx0XHR2YXIgbXZwID0gbmV3IE1hdHJpeDR4NCgpO1xuXHRcdG12cC5tdWx0aXBseShtb2RlbCk7XG5cdFx0bXZwLm11bHRpcGx5KHZpZXcpO1xuXHRcdG12cC5tdWx0aXBseShwcm9qZWN0aW9uKTtcblx0XHRnbC51bmlmb3JtTWF0cml4NGZ2KHNvbm9ncmFtM0RTaGFkZXIud29ybGRWaWV3UHJvamVjdGlvbkxvYywgZ2wuRkFMU0UsIG12cC5lbGVtZW50cyk7XG5cdFx0dGV4Q29vcmRPZmZzZXQgPSB2Ym8zRFRleENvb3JkT2Zmc2V0O1xuXHRcdC8vIGNvbnNvbGUubG9nKCdtb2RlbCcsbXZwLmVsZW1lbnRzKTtcblx0XHRicmVhaztcblxuXHR9XG5cblx0aWYgKGZyZXF1ZW5jeURhdGFMb2MpIHtcblx0XHRnbC51bmlmb3JtMWkoZnJlcXVlbmN5RGF0YUxvYywgMCk7XG5cdH1cblx0aWYgKGZvcmVncm91bmRDb2xvckxvYykge1xuXHRcdGdsLnVuaWZvcm00ZnYoZm9yZWdyb3VuZENvbG9yTG9jLCB0aGlzLmZvcmVncm91bmRDb2xvcik7XG5cdH1cblx0aWYgKGJhY2tncm91bmRDb2xvckxvYykge1xuXHRcdGdsLnVuaWZvcm00ZnYoYmFja2dyb3VuZENvbG9yTG9jLCB0aGlzLmJhY2tncm91bmRDb2xvcik7XG5cdH1cblxuXHQvLyBTZXQgdXAgdGhlIHZlcnRleCBhdHRyaWJ1dGUgYXJyYXlzXG5cdGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHZlcnRleExvYyk7XG5cdGdsLnZlcnRleEF0dHJpYlBvaW50ZXIodmVydGV4TG9jLCAzLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xuXHRnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh0ZXhDb29yZExvYyk7XG5cdGdsLnZlcnRleEF0dHJpYlBvaW50ZXIodGV4Q29vcmRMb2MsIDIsIGdsLkZMT0FULCBnbC5GQUxTRSwgMCwgdGV4Q29vcmRPZmZzZXQpO1xuXG5cblxuXHQvLyBDbGVhciB0aGUgcmVuZGVyIGFyZWFcblx0Z2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuXG5cdC8vIEFjdHVhbGx5IGRyYXdcblx0aWYgKHRoaXMuYW5hbHlzaXNUeXBlID09IEFOQUxZU0lTVFlQRV9GUkVRVUVOQ1kgfHwgdGhpcy5hbmFseXNpc1R5cGUgPT0gQU5BTFlTSVNUWVBFX1dBVkVGT1JNIHx8IHRoaXMuYW5hbHlzaXNUeXBlID09IEFOQUxZU0lTVFlQRV9TT05PR1JBTSkge1xuXHRcdGdsLmRyYXdBcnJheXMoZ2wuVFJJQU5HTEVTLCAwLCA2KTtcblx0fSBlbHNlIGlmICh0aGlzLmFuYWx5c2lzVHlwZSA9PSBBTkFMWVNJU1RZUEVfM0RfU09OT0dSQU0pIHtcblx0XHQvLyBOb3RlOiB0aGlzIGV4cGVjdHMgdGhlIGVsZW1lbnQgYXJyYXkgYnVmZmVyIHRvIHN0aWxsIGJlIGJvdW5kXG5cdFx0Z2wuZHJhd0VsZW1lbnRzKGdsLlRSSUFOR0xFUywgc29ub2dyYW0zRE51bUluZGljZXMsIGdsLlVOU0lHTkVEX1NIT1JULCAwKTtcblx0fVxuXG5cdC8vIERpc2FibGUgdGhlIGF0dHJpYnV0ZSBhcnJheXMgZm9yIGNsZWFubGluZXNzXG5cdGdsLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheSh2ZXJ0ZXhMb2MpO1xuXHRnbC5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXkodGV4Q29vcmRMb2MpO1xufTtcblxuQW5hbHlzZXJWaWV3LnByb3RvdHlwZS5zZXRBbmFseXNlck5vZGUgPSBmdW5jdGlvbihhbmFseXNlcikge1xuICB0aGlzLmFuYWx5c2VyID0gYW5hbHlzZXI7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gQW5hbHlzZXJWaWV3O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIldiOEdlalwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLzNEL3Zpc3VhbGl6ZXIuanNcIixcIi8zRFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuQ29weXJpZ2h0IDIwMTYgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuXG4ndXNlIHN0cmljdCc7XG5cbndpbmRvdy5pc01vYmlsZSA9ICggL0FuZHJvaWR8d2ViT1N8aVBob25lfGlQYWR8aVBvZHxCbGFja0JlcnJ5fElFTW9iaWxlfE9wZXJhIE1pbmkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICk7XG53aW5kb3cuaXNJT1MgPSAvaVBhZHxpUGhvbmV8aVBvZC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSAmJiAhd2luZG93Lk1TU3RyZWFtO1xud2luZG93LmlzQW5kcm9pZCA9IC9BbmRyb2lkLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICYmICF3aW5kb3cuTVNTdHJlYW07XG5cbndpbmRvdy5yZXF1ZXN0QW5pbUZyYW1lID0gKGZ1bmN0aW9uKCl7XG4gIHJldHVybiAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgICB8fFxuXHRcdCAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuXHRcdCAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSAgICB8fFxuXHRcdCAgZnVuY3Rpb24oIGNhbGxiYWNrICl7XG5cdFx0XHR3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKTtcblx0XHQgIH07XG59KSgpO1xuXG4vLyAtfi1+LX4tfi1+LX4tfi1+LX4tfi1+LX4tfi1+LX4tfi1+LX4tfi1+XG52YXIgc3BlYzNEID0gcmVxdWlyZSgnLi91aS9zcGVjdHJvZ3JhbScpO1xuLy8gLX4tfi1+LX4tfi1+LX4tfi1+LX4tfi1+LX4tfi1+LX4tfi1+LX4tflxuXG4kKGZ1bmN0aW9uKCl7XG5cdHZhciBwYXJzZVF1ZXJ5U3RyaW5nID0gZnVuY3Rpb24oKXtcblx0XHR2YXIgcSA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc2xpY2UoMSkuc3BsaXQoJyYnKTtcblx0XHRmb3IodmFyIGk9MDsgaSA8IHEubGVuZ3RoOyArK2kpe1xuXHRcdFx0dmFyIHFpID0gcVtpXS5zcGxpdCgnPScpO1xuXHRcdFx0cVtpXSA9IHt9O1xuXHRcdFx0cVtpXVtxaVswXV0gPSBxaVsxXTtcblx0XHR9XG5cdFx0cmV0dXJuIHE7XG5cdH1cblxuXHR2YXIgZ2V0TG9jYWxpemF0aW9uID0gZnVuY3Rpb24oKXtcblx0XHR2YXIgcSA9IHBhcnNlUXVlcnlTdHJpbmcoKTtcblx0XHR2YXIgbGFuZyA9ICdlbic7XG5cdFx0Zm9yKHZhciBpPTA7IGkgPCBxLmxlbmd0aDsgaSsrKXtcblx0XHRcdGlmKHFbaV0ubG4gIT0gdW5kZWZpbmVkKXtcblx0XHRcdFx0bGFuZyA9IHFbaV0ubG47XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHZhciB1cmwgPSBcImh0dHBzOi8vZ3dlYi1tdXNpY2xhYi1zaXRlLmFwcHNwb3QuY29tL3N0YXRpYy9sb2NhbGVzL1wiICsgbGFuZyArIFwiL2xvY2FsZS1tdXNpYy1sYWIuanNvblwiO1xuXHRcdCQuYWpheCh7XG5cdFx0XHR1cmw6IHVybCxcblx0XHRcdGRhdGFUeXBlOiBcImpzb25cIixcblx0XHRcdGFzeW5jOiB0cnVlLFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24oIHJlc3BvbnNlICkge1xuXHRcdFx0XHQkLmVhY2gocmVzcG9uc2UsZnVuY3Rpb24oa2V5LHZhbHVlKXtcblx0XHRcdFx0XHR2YXIgaXRlbSA9ICQoXCJbZGF0YS1uYW1lPSdcIisga2V5ICtcIiddXCIpO1xuXHRcdFx0XHRcdGlmKGl0ZW0ubGVuZ3RoID4gMCl7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygndmFsdWUubWVzc2FnZScsdmFsdWUubWVzc2FnZSk7XG5cdFx0XHRcdFx0XHRpdGVtLmF0dHIoJ2RhdGEtbmFtZScsdmFsdWUubWVzc2FnZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH0sXG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0Y29uc29sZS53YXJuKGVycik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHR2YXIgc3RhcnR1cCA9IGZ1bmN0aW9uICgpe1xuICAgICAgICB2YXIgc291cmNlID0gbnVsbDsgLy8gZ2xvYmFsIHNvdXJjZSBmb3IgdXNlciBkcm9wcGVkIGF1ZGlvXG5cblx0XHRnZXRMb2NhbGl6YXRpb24oKTtcblx0XHR3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKCdyZWFkeScsJyonKTtcblxuXHRcdHZhciBzcCA9IHNwZWMzRDtcblx0XHRzcC5hdHRhY2hlZCgpO1xuXHRcdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdFx0JCgnLm11c2ljLWJveF9fdG9vbC10aXAnKS5oaWRlKDApO1xuXHRcdCQoJyNsb2FkaW5nU291bmQnKS5oaWRlKDApO1xuXG5cdFx0dmFyIGxvY2tlZCA9IGZhbHNlO1xuXG5cdFx0JCgnLm11c2ljLWJveF9fYnV0dG9uc19fYnV0dG9uJykuY2xpY2soZnVuY3Rpb24oZSl7XG5cdFx0XHRzcC5zdGFydFJlbmRlcigpO1xuXHRcdFx0XG5cdFx0XHR2YXIgd2FzUGxheWluZyA9IHNwLmlzUGxheWluZygpO1xuXHRcdFx0c3Auc3RvcCgpO1xuXHRcdFx0c3AuZHJhd2luZ01vZGUgPSBmYWxzZTtcblx0XHRcdFxuXHRcdFx0aWYoJCh0aGlzKS5oYXNDbGFzcygnc2VsZWN0ZWQnKSkge1xuXHRcdFx0XHQkKCcubXVzaWMtYm94X19idXR0b25zX19idXR0b24nKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTsgXG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0JCgnLm11c2ljLWJveF9fYnV0dG9uc19fYnV0dG9uJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7IFxuXHRcdFx0XHQkKHRoaXMpLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuXHRcdFx0XHQvLyBjaGVjayBmb3Igc3RhcnQgcmVjb2RpbmcgZGF0YSBpbnN0cnVjdGlvbiAqKioqKioqKioqKioqKioqKioqKioqXG5cdFx0XHRcdGlmICgkKHRoaXMpLmF0dHIoJ2RhdGEtbWljJykhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0aWYod2luZG93LmlzSU9TKXtcblx0XHRcdFx0XHRcdC8vIFRocm93IE1pY3JvcGhvbmUgRXJyb3IgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cdFx0XHRcdFx0XHR3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKCdlcnJvcjInLCcqJyk7XG5cdFx0XHRcdFx0XHQvLyBSZW1vdmUgU2VsZWN0aW9uICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXHRcdFx0XHRcdFx0JCh0aGlzKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdC8vIFNob3cgUmVjb3JkIE1vZGFsIFNjcmVlbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cdFx0XHRcdFx0XHQkKCcjcmVjb3JkJykuZmFkZUluKCkuZGVsYXkoMjAwMCkuZmFkZU91dCgpO1xuXHRcdFx0XHRcdFx0Ly8gU3RhcnQgUmVjb3JkaW5nICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblx0XHRcdFx0XHRcdHNwLmxpdmUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdC8vIENoZWNrIGZvciBTdGFydCBkcmF3aW5nIGRhdGEgaW5zdHJ1Y3Rpb24gICoqKioqKioqKioqKioqKioqKioqKipcblx0XHRcdFx0fWVsc2UgaWYgKCQodGhpcykuYXR0cignZGF0YS1kcmF3JykgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHNwLmRyYXdpbmdNb2RlID0gdHJ1ZTtcblx0XHRcdFx0XHQkKCcjZHJhd0FueXdoZXJlJykuZmFkZUluKCkuZGVsYXkoMjAwMCkuZmFkZU91dCgpO1xuXHRcdFx0XHQvLyBDaGVjayBmb3IgcGxheSBhdWRpbyBkYXRhIGluc3RydWN0aW9uICoqKioqKioqKioqKioqKioqKioqKioqKioqXG5cdFx0XHRcdH1lbHNlIGlmICgkKHRoaXMpLmF0dHIoJ2RhdGEtc3JjJykgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHNwLmxvb3BDaGFuZ2VkKCB0cnVlICk7XG5cdFx0XHRcdFx0JCgnI2xvYWRpbmdNZXNzYWdlJykudGV4dCgkKHRoaXMpLmF0dHIoJ2RhdGEtbmFtZScpKTtcblx0XHRcdFx0XHRzcC5wbGF5KCQodGhpcykuYXR0cignZGF0YS1zcmMnKSk7XG5cdFx0XHRcdH1lbHNlIGlmICgkKHRoaXMpLmF0dHIoJ2RhdGEtbG9jaycpICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRsb2NrZWQgPSAhbG9ja2VkO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSlcblx0XHRcblx0XHR2YXIga2lsbFNvdW5kID0gZnVuY3Rpb24oKXtcblx0XHRcdHNwLnN0YXJ0UmVuZGVyKCk7XG5cdFx0XHR2YXIgd2FzUGxheWluZyA9IHNwLmlzUGxheWluZygpO1xuXHRcdFx0c3Auc3RvcCgpO1xuXHRcdFx0c3AuZHJhd2luZ01vZGUgPSBmYWxzZTtcblx0XHRcdCQoJy5tdXNpYy1ib3hfX2J1dHRvbnNfX2J1dHRvbicpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpOyBcblx0XHR9XG5cblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIGZ1bmN0aW9uKCkge1xuXHRcdFx0IWxvY2tlZCAmJiBraWxsU291bmQoKTtcblx0XHR9KTtcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd2aXNpYmlsaXR5Y2hhbmdlJywgZnVuY3Rpb24oKXtcblx0XHRcdCFsb2NrZWQgJiYga2lsbFNvdW5kKCk7XG5cdFx0fSk7XG5cbiAgICAgICAgdmFyIGRlY29kZUJ1ZmZlciA9IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgICAgIC8vIENyZWRpdDogaHR0cHM6Ly9naXRodWIuY29tL2t5bGVzdGV0ei9BdWRpb0Ryb3AgJiYgaHR0cHM6Ly9lcmljYmlkZWxtYW4udHVtYmxyLmNvbS9wb3N0LzEzNDcxMTk1MjUwL3dlYi1hdWRpby1hcGktaG93LXRvLXBsYXlpbmctYXVkaW8tYmFzZWQtb24tdXNlclxuICAgICAgICAgICAgdmFyIEF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dDtcbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuICAgICAgICAgICAgLy8gdmFyIHNvdXJjZSA9IG51bGw7XG4gICAgICAgICAgICB2YXIgYXVkaW9CdWZmZXIgPSBudWxsO1xuICAgICAgICAgICAgdmFyIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXG4gICAgICAgICAgICBmaWxlUmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGZpbGVFdmVudCkge1xuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gZmlsZUV2ZW50LnRhcmdldC5yZXN1bHQ7XG5cbiAgICAgICAgICAgICAgICBjb250ZXh0LmRlY29kZUF1ZGlvRGF0YShkYXRhLCBmdW5jdGlvbihidWZmZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gYXVkaW9CdWZmZXIgaXMgZ2xvYmFsIHRvIHJldXNlIHRoZSBkZWNvZGVkIGF1ZGlvIGxhdGVyLlxuICAgICAgICAgICAgICAgICAgICBhdWRpb0J1ZmZlciA9IGJ1ZmZlcjtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlID0gY29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlLmJ1ZmZlciA9IGF1ZGlvQnVmZmVyO1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2UubG9vcCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZS5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFZpc3VhbGl6ZXJcbiAgICAgICAgICAgICAgICAgICAgc3Auc3RhcnRSZW5kZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgc3AubG9vcENoYW5nZWQoIHRydWUgKTtcbiAgICAgICAgICAgICAgICAgICAgc3AudXNlckF1ZGlvKHNvdXJjZSk7XG4gICAgICAgICAgICAgICAgICAgICQoJyNsb2FkaW5nU291bmQnKS5kZWxheSg1MDApLmZhZGVPdXQoKS5oaWRlKDApO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIGRlY29kaW5nIGZpbGUnLCBlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZpbGVSZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoZmlsZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGZpbGVEcm9wID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgJGZpbGVEcm9wID0gJCgnI2ZpbGVEcm9wJyk7XG4gICAgICAgICAgICB2YXIgJGRlc2NyaXB0aW9uID0gJCgnLmZpbGUtb3ZlcmxheS1kZXNjcmlwdGlvbicpO1xuXG4gICAgICAgICAgICAkKHdpbmRvdykub24oeydkcmFnb3Zlcic6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICAgICAgICAgICRkZXNjcmlwdGlvbi50ZXh0KCdEcm9wIHlvdXIgc291bmQgZmlsZSBoZXJlLicpO1xuICAgICAgICAgICAgICAgICRmaWxlRHJvcC5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICB9LCAnZHJhZ2xlYXZlJzogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICAgICAgJGZpbGVEcm9wLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgIH0sICdkcm9wJzogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICAgICAgJGZpbGVEcm9wLmFkZENsYXNzKCdwb2ludGVyLWV2ZW50cycpO1xuXG4gICAgICAgICAgICAgICAgLy8gU3RvcCBvdGhlciBzb3VuZHNcbiAgICAgICAgICAgICAgICBraWxsU291bmQoKTtcblxuICAgICAgICAgICAgICAgIHZhciBkcm9wcGVkRmlsZXMgPSBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyO1xuICAgICAgICAgICAgICAgIGlmIChkcm9wcGVkRmlsZXMgJiYgZHJvcHBlZEZpbGVzLmZpbGVzLmxlbmd0aCAmJiBkcm9wcGVkRmlsZXMuaXRlbXNbMF0gJiYgZHJvcHBlZEZpbGVzLml0ZW1zWzBdLnR5cGUgIT09ICdhdWRpby9taWRpJykge1xuICAgICAgICAgICAgICAgICAgICAkLmVhY2goZHJvcHBlZEZpbGVzLmZpbGVzLCBmdW5jdGlvbihpLCBmaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZS50eXBlLmluZGV4T2YoJ2F1ZGlvJykgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNsb2FkaW5nTWVzc2FnZScpLnRleHQoZmlsZS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjbG9hZGluZ1NvdW5kJykuc2hvdygwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNvZGVCdWZmZXIoZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGZpbGVEcm9wLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZmlsZURyb3AucmVtb3ZlQ2xhc3MoJ3BvaW50ZXItZXZlbnRzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRkZXNjcmlwdGlvbi50ZXh0KCdPbmx5IHNvdW5kIGZpbGVzIHdpbGwgd29yayBoZXJlLicpO1xuXHRcdFx0XHRcdFx0fVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkZGVzY3JpcHRpb24udGV4dCgnT25seSBzb3VuZCBmaWxlcyB3aWxsIHdvcmsgaGVyZS4nKTtcblx0XHRcdFx0fVxuICAgICAgICAgICAgfSB9KTtcblxuICAgICAgICAgICAgJGZpbGVEcm9wLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICRmaWxlRHJvcC5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgJGZpbGVEcm9wLnJlbW92ZUNsYXNzKCdwb2ludGVyLWV2ZW50cycpO1xuXHRcdFx0fSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgZmlsZURyb3AoKTtcblx0fTtcblxuXHR2YXIgZWxtID0gJCgnI2lvc0J1dHRvbicpO1xuXHRpZighd2luZG93LmlzSU9TKXtcblx0XHRlbG0uYWRkQ2xhc3MoJ2hpZGUnKTtcblx0XHRzdGFydHVwKCk7XG4gICAgY29uc29sZS5sb2coMik7XG5cdH1lbHNle1xuXHRcdHdpbmRvdy5wYXJlbnQucG9zdE1lc3NhZ2UoJ2xvYWRlZCcsJyonKTtcblx0XHRlbG1bMF0uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBmdW5jdGlvbihlKXtcblx0XHRcdGVsbS5hZGRDbGFzcygnaGlkZScpO1xuXHRcdFx0c3RhcnR1cCgpO1xuXHRcdH0sZmFsc2UpO1xuXHR9XG59KTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJXYjhHZWpcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9mYWtlXzliYmVkN2U2LmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5Db3B5cmlnaHQgMjAxNiBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxudmFyIFV0aWwgPSByZXF1aXJlKCcuLi91dGlsL3V0aWwuanMnKTtcblxuZnVuY3Rpb24gUGxheWVyKCkge1xuXHQvLyBDcmVhdGUgYW4gYXVkaW8gZ3JhcGguXG5cdHdpbmRvdy5BdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQ7XG5cdGNvbnRleHQgPSBuZXcgQXVkaW9Db250ZXh0KCk7XG5cblx0dmFyIGFuYWx5c2VyID0gY29udGV4dC5jcmVhdGVBbmFseXNlcigpO1xuXHQvL2FuYWx5c2VyLmZmdFNpemUgPSAyMDQ4ICogMiAqIDJcblx0Ly8gYW5hbHlzZXIuZmZ0U2l6ZSA9ICh3aW5kb3cuaXNNb2JpbGUpPyAyMDQ4IDogODE5Mjtcblx0YW5hbHlzZXIuZmZ0U2l6ZSA9ICh3aW5kb3cuaXNNb2JpbGUpPzEwMjQgOiAyMDQ4O1xuXHRhbmFseXNlci5zbW9vdGhpbmdUaW1lQ29uc3RhbnQgPSAwO1xuXG5cdC8vIENyZWF0ZSBhIG1peC5cblx0dmFyIG1peCA9IGNvbnRleHQuY3JlYXRlR2FpbigpO1xuXG5cdC8vIENyZWF0ZSBhIGJhbmRwYXNzIGZpbHRlci5cblx0dmFyIGJhbmRwYXNzID0gY29udGV4dC5jcmVhdGVCaXF1YWRGaWx0ZXIoKTtcblx0YmFuZHBhc3MuUS52YWx1ZSA9IDEwO1xuXHRiYW5kcGFzcy50eXBlID0gJ2JhbmRwYXNzJztcblxuXHR2YXIgZmlsdGVyR2FpbiA9IGNvbnRleHQuY3JlYXRlR2FpbigpO1xuXHRmaWx0ZXJHYWluLmdhaW4udmFsdWUgPSAxO1xuXG5cdC8vIENvbm5lY3QgYXVkaW8gcHJvY2Vzc2luZyBncmFwaFxuXHRtaXguY29ubmVjdChhbmFseXNlcik7XG5cdGFuYWx5c2VyLmNvbm5lY3QoZmlsdGVyR2Fpbik7XG5cdGZpbHRlckdhaW4uY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcblxuXHR0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuXHR0aGlzLm1peCA9IG1peDtcblx0Ly8gdGhpcy5iYW5kcGFzcyA9IGJhbmRwYXNzO1xuXHR0aGlzLmZpbHRlckdhaW4gPSBmaWx0ZXJHYWluO1xuXHR0aGlzLmFuYWx5c2VyID0gYW5hbHlzZXI7XG5cblx0dGhpcy5idWZmZXJzID0ge307XG5cblx0Ly8gQ29ubmVjdCBhbiBlbXB0eSBzb3VyY2Ugbm9kZSB0byB0aGUgbWl4LlxuXHRVdGlsLmxvYWRUcmFja1NyYyh0aGlzLmNvbnRleHQsICdiaW4vc25kL2VtcHR5Lm1wMycsIGZ1bmN0aW9uKGJ1ZmZlcikge1xuXHRcdHZhciBzb3VyY2UgPSB0aGlzLmNyZWF0ZVNvdXJjZV8oYnVmZmVyLCB0cnVlKTtcblx0XHRzb3VyY2UubG9vcCA9IHRydWU7XG5cdFx0c291cmNlLnN0YXJ0KDApO1xuXHR9LmJpbmQodGhpcykpO1xuXHRcbn1cblxuUGxheWVyLnByb3RvdHlwZS5wbGF5U3JjID0gZnVuY3Rpb24oc3JjKSB7XG5cdC8vIFN0b3AgYWxsIG9mIHRoZSBtaWMgc3R1ZmYuXG5cdHRoaXMuZmlsdGVyR2Fpbi5nYWluLnZhbHVlID0gMTtcblx0aWYgKHRoaXMuaW5wdXQpIHtcblx0XHR0aGlzLmlucHV0LmRpc2Nvbm5lY3QoKTtcblx0XHR0aGlzLmlucHV0ID0gbnVsbDtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRpZiAodGhpcy5idWZmZXJzW3NyY10pIHtcblx0XHQkKCcjbG9hZGluZ1NvdW5kJykuZmFkZUluKDEwMCkuZGVsYXkoMTAwMCkuZmFkZU91dCg1MDApO1xuXHRcdHRoaXMucGxheUhlbHBlcl8oc3JjKTtcblx0XHRyZXR1cm47XG5cdH1cblxuXHQkKCcjbG9hZGluZ1NvdW5kJykuZmFkZUluKDEwMCk7XG5cdFV0aWwubG9hZFRyYWNrU3JjKHRoaXMuY29udGV4dCwgc3JjLCBmdW5jdGlvbihidWZmZXIpIHtcblx0XHR0aGlzLmJ1ZmZlcnNbc3JjXSA9IGJ1ZmZlcjtcblx0XHR0aGlzLnBsYXlIZWxwZXJfKHNyYyk7XG5cdFx0JCgnI2xvYWRpbmdTb3VuZCcpLmRlbGF5KDUwMCkuZmFkZU91dCg1MDApO1xuXHR9LmJpbmQodGhpcykpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5wbGF5VXNlckF1ZGlvID0gZnVuY3Rpb24oc3JjKSB7XG4gIC8vIFN0b3AgYWxsIG9mIHRoZSBtaWMgc3R1ZmYuXG4gIHRoaXMuZmlsdGVyR2Fpbi5nYWluLnZhbHVlID0gMTtcbiAgaWYgKHRoaXMuaW5wdXQpIHtcbiAgICB0aGlzLmlucHV0LmRpc2Nvbm5lY3QoKTtcbiAgICB0aGlzLmlucHV0ID0gbnVsbDtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5idWZmZXJzWyd1c2VyJ10gPSBzcmMuYnVmZmVyO1xuICB0aGlzLnBsYXlIZWxwZXJfKCd1c2VyJyk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnBsYXlIZWxwZXJfID0gZnVuY3Rpb24oc3JjKSB7XG5cdHZhciBidWZmZXIgPSB0aGlzLmJ1ZmZlcnNbc3JjXTtcblx0dGhpcy5zb3VyY2UgPSB0aGlzLmNyZWF0ZVNvdXJjZV8oYnVmZmVyLCB0cnVlKTtcblx0dGhpcy5zb3VyY2Uuc3RhcnQoMCk7XG5cblx0aWYgKCF0aGlzLmxvb3ApIHtcblx0XHR0aGlzLnBsYXlUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLnN0b3AoKTtcblx0fS5iaW5kKHRoaXMpLCBidWZmZXIuZHVyYXRpb24gKiAyMDAwKTtcblx0fVxufTtcblxuUGxheWVyLnByb3RvdHlwZS5saXZlID0gZnVuY3Rpb24oKSB7XG5cdGlmKHdpbmRvdy5pc0lPUyl7XG5cdFx0d2luZG93LnBhcmVudC5wb3N0TWVzc2FnZSgnZXJyb3IyJywnKicpO1xuXHRcdGNvbnNvbGUubG9nKFwiY2FudCB1c2UgbWljIG9uIGlvc1wiKTtcblx0fWVsc2V7XG5cdFx0aWYgKHRoaXMuaW5wdXQpIHtcblx0XHRcdHRoaXMuaW5wdXQuZGlzY29ubmVjdCgpO1xuXHRcdFx0dGhpcy5pbnB1dCA9IG51bGw7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKHthdWRpbzogdHJ1ZX0pLnRoZW4oZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICBzZWxmLm9uU3RyZWFtXyhzdHJlYW0pO1xuXHRcdH0pLmNhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi5vblN0cmVhbUVycm9yKHRoaXMpO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5maWx0ZXJHYWluLmdhaW4udmFsdWUgPSAwO1xuXHR9XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLm9uU3RyZWFtXyA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuXHR2YXIgaW5wdXQgPSB0aGlzLmNvbnRleHQuY3JlYXRlTWVkaWFTdHJlYW1Tb3VyY2Uoc3RyZWFtKTtcblx0aW5wdXQuY29ubmVjdCh0aGlzLm1peCk7XG5cdHRoaXMuaW5wdXQgPSBpbnB1dDtcblx0dGhpcy5zdHJlYW0gPSBzdHJlYW07XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLm9uU3RyZWFtRXJyb3JfID0gZnVuY3Rpb24oZSkge1xuXHQvLyBUT0RPOiBFcnJvciBoYW5kbGluZy5cbn07XG5cblBsYXllci5wcm90b3R5cGUuc2V0TG9vcCA9IGZ1bmN0aW9uKGxvb3ApIHtcblx0dGhpcy5sb29wID0gbG9vcDtcbn07XG5cblBsYXllci5wcm90b3R5cGUuY3JlYXRlU291cmNlXyA9IGZ1bmN0aW9uKGJ1ZmZlciwgbG9vcCkge1xuXHR2YXIgc291cmNlID0gdGhpcy5jb250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuXHRzb3VyY2UuYnVmZmVyID0gYnVmZmVyO1xuXHRzb3VyY2UubG9vcCA9IGxvb3A7XG5cdHNvdXJjZS5jb25uZWN0KHRoaXMubWl4KTtcblx0cmV0dXJuIHNvdXJjZTtcbn07XG5cblBsYXllci5wcm90b3R5cGUuc2V0TWljcm9waG9uZUlucHV0ID0gZnVuY3Rpb24oKSB7XG5cdC8vIFRPRE86IEltcGxlbWVudCBtZSFcbn07XG5cblBsYXllci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuXHRpZiAodGhpcy5zb3VyY2UpIHtcblx0XHR0aGlzLnNvdXJjZS5zdG9wKDApO1xuXHRcdHRoaXMuc291cmNlID0gbnVsbDtcblx0XHRjbGVhclRpbWVvdXQodGhpcy5wbGF5VGltZXIpO1xuXHRcdHRoaXMucGxheVRpbWVyID0gbnVsbDtcblxuXHR9XG5cdGlmICh0aGlzLmlucHV0KSB7XG5cdFx0dGhpcy5pbnB1dC5kaXNjb25uZWN0KCk7XG5cdFx0dGhpcy5pbnB1dCA9IG51bGw7XG5cdFx0cmV0dXJuO1xuXHR9XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmdldEFuYWx5c2VyTm9kZSA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5hbmFseXNlcjtcbn07XG5cblBsYXllci5wcm90b3R5cGUuc2V0QmFuZHBhc3NGcmVxdWVuY3kgPSBmdW5jdGlvbihmcmVxKSB7XG5cdGlmIChmcmVxID09IG51bGwpIHtcblx0XHRjb25zb2xlLmxvZygnUmVtb3ZpbmcgYmFuZHBhc3MgZmlsdGVyJyk7XG5cdFx0Ly8gUmVtb3ZlIHRoZSBlZmZlY3Qgb2YgdGhlIGJhbmRwYXNzIGZpbHRlciBjb21wbGV0ZWx5LCBjb25uZWN0aW5nIHRoZSBtaXggdG8gdGhlIGFuYWx5c2VyIGRpcmVjdGx5LlxuXHRcdHRoaXMubWl4LmRpc2Nvbm5lY3QoKTtcblx0XHR0aGlzLm1peC5jb25uZWN0KHRoaXMuYW5hbHlzZXIpO1xuXHR9IGVsc2Uge1xuXHRcdC8vIGNvbnNvbGUubG9nKCdTZXR0aW5nIGJhbmRwYXNzIGZyZXF1ZW5jeSB0byAlZCBIeicsIGZyZXEpO1xuXHRcdC8vIE9ubHkgc2V0IHRoZSBmcmVxdWVuY3kgaWYgaXQncyBzcGVjaWZpZWQsIG90aGVyd2lzZSB1c2UgdGhlIG9sZCBvbmUuXG5cdFx0dGhpcy5iYW5kcGFzcy5mcmVxdWVuY3kudmFsdWUgPSBmcmVxO1xuXHRcdHRoaXMubWl4LmRpc2Nvbm5lY3QoKTtcblx0XHR0aGlzLm1peC5jb25uZWN0KHRoaXMuYmFuZHBhc3MpO1xuXHRcdC8vIGJhbmRwYXNzIGlzIGNvbm5lY3RlZCB0byBmaWx0ZXJHYWluLlxuXHRcdHRoaXMuZmlsdGVyR2Fpbi5jb25uZWN0KHRoaXMuYW5hbHlzZXIpO1xuXHR9XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnBsYXlUb25lID0gZnVuY3Rpb24oZnJlcSkge1xuXHRpZiAoIXRoaXMub3NjKSB7XG5cdFx0dGhpcy5vc2MgPSB0aGlzLmNvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpO1xuXHRcdHRoaXMub3NjLmNvbm5lY3QodGhpcy5taXgpO1xuXHRcdHRoaXMub3NjLnR5cGUgPSAnc2luZSc7XG5cdFx0dGhpcy5vc2Muc3RhcnQoMCk7XG5cdH1cblx0dGhpcy5vc2MuZnJlcXVlbmN5LnZhbHVlID0gZnJlcTtcblx0dGhpcy5maWx0ZXJHYWluLmdhaW4udmFsdWUgPSAuMjtcblxuXHRcbn07XG5cblBsYXllci5wcm90b3R5cGUuc3RvcFRvbmUgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5vc2Muc3RvcCgwKTtcblx0dGhpcy5vc2MgPSBudWxsO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiV2I4R2VqXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvdWkvcGxheWVyLmpzXCIsXCIvdWlcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbkNvcHlyaWdodCAyMDE2IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4ndXNlIHN0cmljdCdcbnZhciBVdGlsID0gcmVxdWlyZSgnLi4vdXRpbC91dGlsLmpzJyk7XG52YXIgUGxheWVyID0gcmVxdWlyZSgnLi4vdWkvcGxheWVyJyk7XG52YXIgQW5hbHlzZXJWaWV3ID0gcmVxdWlyZSgnLi4vM0QvdmlzdWFsaXplcicpO1xuXG5cbnZhciBzcGVjM0QgPSB7XG4gIGN4Um90OiA5MCxcbiAgZHJhd2luZ01vZGU6IGZhbHNlLFxuICBwcmV2WDogMCxcbiAgaGFuZGxlVHJhY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICBzd2l0Y2goZS50eXBlKXtcbiAgICAgIGNhc2UgJ21vdXNlZG93bic6XG4gICAgICBjYXNlICd0b3VjaHN0YXJ0JzpcbiAgICAgICAgLy8gU1RBUlQ6IE1PVVNFRE9XTiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgc3BlYzNELnByZXZYID0gTnVtYmVyKGUucGFnZVgpIHx8IE51bWJlcihlLm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXS5wYWdlWClcbiAgICAgICAgJChlLmN1cnJlbnRUYXJnZXQpLm9uKCdtb3VzZW1vdmUnLHNwZWMzRC5oYW5kbGVUcmFjaylcbiAgICAgICAgJChlLmN1cnJlbnRUYXJnZXQpLm9uKCd0b3VjaG1vdmUnLHNwZWMzRC5oYW5kbGVUcmFjaylcblxuICAgICAgICBpZiAoc3BlYzNELmRyYXdpbmdNb2RlID09IGZhbHNlKSByZXR1cm4gZmFsc2VcbiAgICAgICAgdmFyIGZyZXEgPSBzcGVjM0QueVRvRnJlcShOdW1iZXIoZS5wYWdlWSkgfHwgTnVtYmVyKGUub3JpZ2luYWxFdmVudC50b3VjaGVzWzBdLnBhZ2VZKSk7XG5cbiAgICAgICAgaWYgKHNwZWMzRC5pc1BsYXlpbmcoKSkgc3BlYzNELnBsYXllci5zZXRCYW5kcGFzc0ZyZXF1ZW5jeShmcmVxKTtcbiAgICAgICAgZWxzZSBzcGVjM0QucGxheWVyLnBsYXlUb25lKGZyZXEpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbW91c2Vtb3ZlJyA6XG4gICAgICBjYXNlICd0b3VjaG1vdmUnIDpcbiAgICAgICAgLy8gVFJBQ0sgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgdmFyIGRkeCA9IChOdW1iZXIoZS5wYWdlWCkgfHwgTnVtYmVyKGUub3JpZ2luYWxFdmVudC50b3VjaGVzWzBdLnBhZ2VYKSkgLSBzcGVjM0QucHJldlg7XG4gICAgICAgIHNwZWMzRC5wcmV2WCA9IE51bWJlcihlLnBhZ2VYKSB8fCBOdW1iZXIoZS5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0ucGFnZVgpXG5cbiAgICAgICAgaWYoc3BlYzNELmRyYXdpbmdNb2RlKXtcblxuICAgICAgICAgIHZhciB5ID0gTnVtYmVyKGUucGFnZVkpIHx8IE51bWJlcihlLm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXS5wYWdlWSk7XG4gICAgICAgICAgdmFyIGZyZXEgPSBzcGVjM0QueVRvRnJlcSh5KTtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygnJWYgcHggbWFwcyB0byAlZiBIeicsIHksIGZyZXEpO1xuXG4gICAgICAgICAgaWYgKHNwZWMzRC5pc1BsYXlpbmcoKSkgc3BlYzNELnBsYXllci5zZXRCYW5kcGFzc0ZyZXF1ZW5jeShmcmVxKTtcbiAgICAgICAgICBlbHNlIHNwZWMzRC5wbGF5ZXIucGxheVRvbmUoZnJlcSk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChzcGVjM0QuaXNQbGF5aW5nKCkpIHtcblxuICAgICAgICAgIHNwZWMzRC5jeFJvdCArPSAoZGR4ICogLjIpXG5cbiAgICAgICAgICBpZiAoc3BlYzNELmN4Um90IDwgMCkgc3BlYzNELmN4Um90ID0gMDtcbiAgICAgICAgICBlbHNlIGlmICggc3BlYzNELmN4Um90ID4gOTApIHNwZWMzRC5jeFJvdCA9IDkwO1xuXG4gICAgICAgICAgLy8gc3BlYzNELmFuYWx5c2VyVmlldy5jYW1lcmFDb250cm9sbGVyLnlSb3QgPSBzcGVjM0QuZWFzZUluT3V0Q3ViaWMoc3BlYzNELmN4Um90IC8gOTAsIDE4MCAsIDkwICwgMSk7XG4gICAgICAgICAgLy8gc3BlYzNELmFuYWx5c2VyVmlldy5jYW1lcmFDb250cm9sbGVyLnpUID0gc3BlYzNELmVhc2VJbk91dEN1YmljKHNwZWMzRC5jeFJvdCAvIDkwLC0yLC0xLDEpO1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHNwZWMzRC5jeFJvdCAvIDkwKTtcbiAgICAgICAgICAvLyBzcGVjM0QuYW5hbHlzZXJWaWV3LmNhbWVyYUNvbnRyb2xsZXIuelQgPSAtNiArICgoc3BlYzNELmN4Um90IC8gOTApICogNCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ21vdXNldXAnIDpcbiAgICAgIGNhc2UgJ3RvdWNoZW5kJzpcbiAgICAgIC8vIEVORDogTU9VU0VVUCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KS5vZmYoJ21vdXNlbW92ZScsc3BlYzNELmhhbmRsZVRyYWNrKVxuICAgICAgICAkKGUuY3VycmVudFRhcmdldCkub2ZmKCd0b3VjaG1vdmUnLHNwZWMzRC5oYW5kbGVUcmFjaylcbiAgICAgICAgaWYgKHNwZWMzRC5kcmF3aW5nTW9kZSA9PSBmYWxzZSkgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgaWYgKHNwZWMzRC5pc1BsYXlpbmcoKSkgc3BlYzNELnBsYXllci5zZXRCYW5kcGFzc0ZyZXF1ZW5jeShudWxsKTtcbiAgICAgICAgZWxzZSBzcGVjM0QucGxheWVyLnN0b3BUb25lKCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9LFxuXG4gIGF0dGFjaGVkOiBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygnc3BlY3Ryb2dyYW0tM2QgYXR0YWNoZWQnKTtcbiAgICBVdGlsLnNldExvZ1NjYWxlKDIwLCAyMCwgMjAwMDAsIDIwMDAwKTtcbiAgICBzcGVjM0Qub25SZXNpemVfKCk7XG4gICAgc3BlYzNELmluaXRfKCk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgc3BlYzNELm9uUmVzaXplXy5iaW5kKHNwZWMzRCkpO1xuICB9LFxuXG4gIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgIHNwZWMzRC5wbGF5ZXIuc3RvcCgpO1xuICB9LFxuXG4gIGlzUGxheWluZzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICEhdGhpcy5wbGF5ZXIuc291cmNlO1xuICB9LFxuXG4gIHN0b3BSZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHNwZWMzRC5pc1JlbmRlcmluZyA9IGZhbHNlO1xuICB9LFxuXG4gIHN0YXJ0UmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICBpZiAoc3BlYzNELmlzUmVuZGVyaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHNwZWMzRC5pc1JlbmRlcmluZyA9IHRydWU7XG4gICAgc3BlYzNELmRyYXdfKCk7XG4gIH0sXG5cbiAgbG9vcENoYW5nZWQ6IGZ1bmN0aW9uKGxvb3ApIHtcbiAgICBzcGVjM0QucGxheWVyLnNldExvb3AobG9vcCk7XG4gIH0sXG5cbiAgcGxheTogZnVuY3Rpb24oc3JjKSB7XG4gICAgc3BlYzNELnNyYyA9IHNyYztcbiAgICBzcGVjM0QucGxheWVyLnBsYXlTcmMoc3JjKTtcbiAgfSxcblxuICBsaXZlOiBmdW5jdGlvbigpIHtcbiAgICBzcGVjM0QucGxheWVyLmxpdmUoKTtcbiAgfSxcblxuICB1c2VyQXVkaW86IGZ1bmN0aW9uKHNyYykge1xuICAgIHNwZWMzRC5wbGF5ZXIucGxheVVzZXJBdWRpbyhzcmMpXG4gIH0sXG5cbiAgaW5pdF86IGZ1bmN0aW9uKCkge1xuICAgIC8vIEluaXRpYWxpemUgZXZlcnl0aGluZy5cbiAgICB2YXIgcGxheWVyID0gbmV3IFBsYXllcigpO1xuICAgIHZhciBhbmFseXNlck5vZGUgPSBwbGF5ZXIuZ2V0QW5hbHlzZXJOb2RlKCk7XG5cbiAgICB2YXIgYW5hbHlzZXJWaWV3ID0gbmV3IEFuYWx5c2VyVmlldyh0aGlzLmNhbnZhcyk7XG4gICAgYW5hbHlzZXJWaWV3LnNldEFuYWx5c2VyTm9kZShhbmFseXNlck5vZGUpO1xuICAgIGFuYWx5c2VyVmlldy5pbml0Qnl0ZUJ1ZmZlcigpO1xuXG4gICAgc3BlYzNELnBsYXllciA9IHBsYXllcjtcbiAgICBzcGVjM0QuYW5hbHlzZXJWaWV3ID0gYW5hbHlzZXJWaWV3O1xuICAgICQoJyNzcGVjdHJvZ3JhbScpXG4gICAgICAub24oJ21vdXNlZG93bicsdGhpcy5oYW5kbGVUcmFjaylcbiAgICAgIC5vbigndG91Y2hzdGFydCcsdGhpcy5oYW5kbGVUcmFjaylcbiAgICAgIC5vbignbW91c2V1cCcsdGhpcy5oYW5kbGVUcmFjaylcbiAgICAgIC5vbigndG91Y2hlbmQnLHRoaXMuaGFuZGxlVHJhY2spXG4gIH0sXG5cbiAgb25SZXNpemVfOiBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygnb25SZXNpemVfJyk7XG4gICAgdmFyIGNhbnZhcyA9ICQoJyNzcGVjdHJvZ3JhbScpWzBdO1xuICAgIHNwZWMzRC5jYW52YXMgPSBjYW52YXM7XG5cbiAgICAvLyBhY2Nlc3Mgc2libGluZyBvciBwYXJlbnQgZWxlbWVudHMgaGVyZVxuICAgIGNhbnZhcy53aWR0aCA9ICQod2luZG93KS53aWR0aCgpO1xuICAgIGNhbnZhcy5oZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XG5cbiAgICAvLyBBbHNvIHNpemUgdGhlIGxlZ2VuZCBjYW52YXMuXG4gICAgdmFyIGxlZ2VuZCA9ICQoJyNsZWdlbmQnKVswXTtcbiAgICBsZWdlbmQud2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcbiAgICBsZWdlbmQuaGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpIC0gMTU4O1xuXG4gICAgc3BlYzNELmRyYXdMZWdlbmRfKCk7XG4gIH0sXG5cbiAgZHJhd186IGZ1bmN0aW9uKCkge1xuICAgIGlmICghc3BlYzNELmlzUmVuZGVyaW5nKSB7XG4gICAgICBjb25zb2xlLmxvZygnc3RvcHBlZCBkcmF3XycpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNwZWMzRC5hbmFseXNlclZpZXcuZG9GcmVxdWVuY3lBbmFseXNpcygpO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShzcGVjM0QuZHJhd18uYmluZChzcGVjM0QpKTtcbiAgfSxcblxuICBkcmF3TGVnZW5kXzogZnVuY3Rpb24oKSB7XG4gICAgLy8gRHJhdyBhIHNpbXBsZSBsZWdlbmQuXG4gICAgdmFyIGNhbnZhcyA9ICQoJyNsZWdlbmQnKVswXTtcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgdmFyIHggPSBjYW52YXMud2lkdGggLSAxMDtcblxuXG5cbiAgICBjdHguZmlsbFN0eWxlID0gJyNGRkZGRkYnO1xuICAgIGN0eC5mb250ID0gJzE0cHggUm9ib3RvJztcbiAgICBjdHgudGV4dEFsaWduID0gJ3JpZ2h0JztcbiAgICBjdHgudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XG4gICAgY3R4LmZpbGxUZXh0KCcyMCwwMDAgSHogLScsIHgsIGNhbnZhcy5oZWlnaHQgLSBzcGVjM0QuZnJlcVRvWSgyMDAwMCkpO1xuICAgIGN0eC5maWxsVGV4dCgnMiwwMDAgSHogLScsIHgsIGNhbnZhcy5oZWlnaHQgLSBzcGVjM0QuZnJlcVRvWSgyMDAwKSk7XG4gICAgY3R4LmZpbGxUZXh0KCcyMDAgSHogLScsIHgsIGNhbnZhcy5oZWlnaHQgLSBzcGVjM0QuZnJlcVRvWSgyMDApKTtcbiAgICBjdHguZmlsbFRleHQoJzIwIEh6IC0nLCB4LCBjYW52YXMuaGVpZ2h0IC0gc3BlYzNELmZyZXFUb1koMjApKTtcblxuICB9LFxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGJldHdlZW4gZnJlcXVlbmN5IGFuZCB0aGUgb2Zmc2V0IG9uIHRoZSBjYW52YXMgKGluIHNjcmVlbiBzcGFjZSkuXG4gICAqIEZvciBub3csIHdlIGZ1ZGdlIHRoaXMuLi5cbiAgICpcbiAgICogVE9ETyhzbXVzKTogTWFrZSB0aGlzIHdvcmsgcHJvcGVybHkgd2l0aCBXZWJHTC5cbiAgICovXG4gIGZyZXFTdGFydDogMjAsXG4gIGZyZXFFbmQ6IDIwMDAwLFxuICBwYWRkaW5nOiAzMCxcbiAgeVRvRnJlcTogZnVuY3Rpb24oeSkge1xuICAgIHZhciBwYWRkaW5nID0gc3BlYzNELnBhZGRpbmc7XG4gICAgdmFyIGhlaWdodCA9ICQoJyNzcGVjdHJvZ3JhbScpLmhlaWdodCgpO1xuXG4gICAgaWYgKGhlaWdodCA8IDIqcGFkZGluZyB8fCAvLyBUaGUgc3BlY3Ryb2dyYW0gaXNuJ3QgdGFsbCBlbm91Z2hcbiAgICAgICAgeSA8IHBhZGRpbmcgfHwgLy8gWSBpcyBvdXQgb2YgYm91bmRzIG9uIHRvcC5cbiAgICAgICAgeSA+IGhlaWdodCAtIHBhZGRpbmcpIHsgLy8gWSBpcyBvdXQgb2YgYm91bmRzIG9uIHRoZSBib3R0b20uXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdmFyIHBlcmNlbnRGcm9tQm90dG9tID0gMSAtICh5IC0gcGFkZGluZykgLyAoaGVpZ2h0IC0gcGFkZGluZyk7XG4gICAgdmFyIGZyZXEgPSBzcGVjM0QuZnJlcVN0YXJ0ICsgKHNwZWMzRC5mcmVxRW5kIC0gc3BlYzNELmZyZXFTdGFydCkqIHBlcmNlbnRGcm9tQm90dG9tO1xuICAgIHJldHVybiBVdGlsLmxpbjJsb2coZnJlcSk7XG4gIH0sXG5cbiAgLy8gSnVzdCBhbiBpbnZlcnNlIG9mIHlUb0ZyZXEuXG4gIGZyZXFUb1k6IGZ1bmN0aW9uKGxvZ0ZyZXEpIHtcbiAgICAvLyBHbyBmcm9tIGxvZ2FyaXRobWljIGZyZXF1ZW5jeSB0byBsaW5lYXIuXG4gICAgdmFyIGZyZXEgPSBVdGlsLmxvZzJsaW4obG9nRnJlcSk7XG4gICAgdmFyIGhlaWdodCA9ICQoJyNzcGVjdHJvZ3JhbScpLmhlaWdodCgpO1xuICAgIHZhciBwYWRkaW5nID0gc3BlYzNELnBhZGRpbmc7XG4gICAgLy8gR2V0IHRoZSBmcmVxdWVuY3kgcGVyY2VudGFnZS5cbiAgICB2YXIgcGVyY2VudCA9IChmcmVxIC0gc3BlYzNELmZyZXFTdGFydCkgLyAoc3BlYzNELmZyZXFFbmQgLSBzcGVjM0QuZnJlcVN0YXJ0KTtcbiAgICAvLyBBcHBseSBwYWRkaW5nLCBldGMuXG4gICAgcmV0dXJuIHNwZWMzRC5wYWRkaW5nICsgcGVyY2VudCAqIChoZWlnaHQgLSAyKnBhZGRpbmcpO1xuICB9LFxuICBlYXNlSW5PdXRDdWJpYzogZnVuY3Rpb24gKHQsIGIsIGMsIGQpIHtcbiAgICBpZiAoKHQvPWQvMikgPCAxKSByZXR1cm4gYy8yKnQqdCp0ICsgYjtcbiAgICByZXR1cm4gYy8yKigodC09MikqdCp0ICsgMikgKyBiO1xuICB9LFxuICBlYXNlSW5PdXRRdWFkOiBmdW5jdGlvbiAodCwgYiwgYywgZCkge1xuICAgIGlmICgodC89ZC8yKSA8IDEpIHJldHVybiBjLzIqdCp0ICsgYjtcbiAgICByZXR1cm4gLWMvMiAqICgoLS10KSoodC0yKSAtIDEpICsgYjtcbiAgfSxcbiAgZWFzZUluT3V0UXVpbnQ6IGZ1bmN0aW9uICh0LCBiLCBjLCBkKSB7XG4gICAgaWYgKCh0Lz1kLzIpIDwgMSkgcmV0dXJuIGMvMip0KnQqdCp0KnQgKyBiO1xuICAgIHJldHVybiBjLzIqKCh0LT0yKSp0KnQqdCp0ICsgMikgKyBiO1xuICB9LFxuICBlYXNlSW5PdXRFeHBvOiBmdW5jdGlvbiAodCwgYiwgYywgZCkge1xuICAgIGlmICh0PT0wKSByZXR1cm4gYjtcbiAgICBpZiAodD09ZCkgcmV0dXJuIGIrYztcbiAgICBpZiAoKHQvPWQvMikgPCAxKSByZXR1cm4gYy8yICogTWF0aC5wb3coMiwgMTAgKiAodCAtIDEpKSArIGI7XG4gICAgcmV0dXJuIGMvMiAqICgtTWF0aC5wb3coMiwgLTEwICogLS10KSArIDIpICsgYjtcbiAgfVxufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHNwZWMzRDtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJXYjhHZWpcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi91aS9zcGVjdHJvZ3JhbS5qc1wiLFwiL3VpXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5Db3B5cmlnaHQgMjAxNiBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxudmFyIFV0aWwgPSB3aW5kb3cuVXRpbCB8fCB7fTtcblxuVXRpbC5sb2FkVHJhY2tTcmMgPSBmdW5jdGlvbihjb250ZXh0LCBzcmMsIGNhbGxiYWNrLCBvcHRfcHJvZ3Jlc3NDYWxsYmFjaykge1xuICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIHNyYywgdHJ1ZSk7XG4gIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcblxuICAvLyBEZWNvZGUgYXN5bmNocm9ub3VzbHkuXG4gIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgY29udGV4dC5kZWNvZGVBdWRpb0RhdGEocmVxdWVzdC5yZXNwb25zZSwgZnVuY3Rpb24oYnVmZmVyKSB7XG4gICAgICBjYWxsYmFjayhidWZmZXIpO1xuICAgIH0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfSk7XG4gIH07XG4gIGlmIChvcHRfcHJvZ3Jlc3NDYWxsYmFjaykge1xuICAgIHJlcXVlc3Qub25wcm9ncmVzcyA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBwZXJjZW50ID0gZS5sb2FkZWQgLyBlLnRvdGFsO1xuICAgICAgb3B0X3Byb2dyZXNzQ2FsbGJhY2socGVyY2VudCk7XG4gICAgfTtcbiAgfVxuXG4gIHJlcXVlc3Quc2VuZCgpO1xufTtcblxuLy8gTG9nIHNjYWxlIGNvbnZlcnNpb24gZnVuY3Rpb25zLiBDaGVhdCBzaGVldDpcbi8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTk0NzI3NDcvY29udmVydC1saW5lYXItc2NhbGUtdG8tbG9nYXJpdGhtaWNcblV0aWwuc2V0TG9nU2NhbGUgPSBmdW5jdGlvbih4MSwgeTEsIHgyLCB5Mikge1xuICB0aGlzLmIgPSBNYXRoLmxvZyh5MS95MikgLyAoeDEteDIpO1xuICB0aGlzLmEgPSB5MSAvIE1hdGguZXhwKCB0aGlzLmIgKiB4MSApO1xufTtcblxuVXRpbC5saW4ybG9nID0gZnVuY3Rpb24oeCkge1xuICByZXR1cm4gdGhpcy5hICogTWF0aC5leHAoIHRoaXMuYiAqIHggKTtcbn07XG5cblV0aWwubG9nMmxpbiA9IGZ1bmN0aW9uKHkpIHtcbiAgcmV0dXJuIE1hdGgubG9nKCB5IC8gdGhpcy5hICkgLyB0aGlzLmI7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gVXRpbDtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJXYjhHZWpcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi91dGlsL3V0aWwuanNcIixcIi91dGlsXCIpIl19
