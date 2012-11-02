/**
 * This class packs javascript file replacing keywords from list by it's index+limit started from 0.
 * Script file will be token from command line second parameter. e.g. >node Archiver.js Script.js
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */


/**
 * Require section
 */
var Helper = require('./../../lib/Helper.js').Helper;
var fs     = require('fs');


var keywords    = ['break', 'case ', 'continue', 'default', 'delete ', 'do', 'else', 'for', 'function', 'if', ' in ', 'new ', 'return', 'switch', 'this.', 'this', 'typeof ', 'typeof', 'var ', 'while', 'with', 'false', 'true', 'instanceOf ', 'null', 'true', 'undefined', 'hasOwnProperty', 'Object', 'Boolean', 'Number', 'Function', 'alert', 'arguments', 'Array', 'callee', 'caller', 'clearInterval', 'clearTimeout', 'confirm', 'constructor', 'Date', 'document', 'eval', 'Infinity', 'isFinite', 'isNan', 'length', 'Math', 'NaN', 'parseFloat', 'parseInt', 'prompt', 'prototype', 'RegExp', 'setInterval', 'setTimeout', 'toString', 'valueOf', 'window', 'parent', 'super', 'call', 'apply', 'try', 'catch', 'throw', 'isString', 'isObject', 'isFunction', 'isArray', 'isNumber', 'isBoolean', 'trim', 'exec', 'test', 'file', 'folder', 'get', 'set', 'can', 'Class', 'split', 'join', 'data', 'slice', 'splice', '===', '!==', '==', '!=', '\\[\\]', '\\{\\}', '\\|\\|', '\\&\\&', 'is', '\\"\\"', '\\(\\)', '\\+\\+', '--', 'String', 'push', 'replace'];
var len         = keywords.length;
var packFile    = process.argv.length > 2 ? process.argv[2] : null;
var resultFile  = process.argv.length > 3 ? process.argv[3] : null;
var fileCharset = 'utf-8';
/**
 * {Number} The index of last alphabetical character in character map.
 */
var limit      = 126;
var startKey   = 119;
var char       = String.fromCharCode;
var i;
var data;
var result     = '';
var old;


if (packFile) {
    //
    // Here we packs the script file
    //
    data = fs.readFileSync(packFile, fileCharset);

//    for (i = 0; i < len; i++) {
//        data = data.replace(new RegExp(keywords[i], 'g'), String.fromCharCode(i + limit));
//    }


    //
    // Here we encodes the packed file
    //
    old     = startKey;
    for (i = 0, len = data.length; i < len; i++) {
        old     = data[i].charCodeAt(0) ^ old;
        result += char(old);
    }

    fs.writeFileSync(resultFile, result, fileCharset);
}
console.log(result);