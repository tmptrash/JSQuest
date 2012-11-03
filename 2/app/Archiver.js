/**
 * This is JavaScript file for Node.js interpreter.
 *
 * This small utility packs javascript file passed in command line parameter replacing keywords from list by it's index+limit
 * started from 0. After that, it encrypts this file with start key and iterative xor operation.
 * Script file will be token from command line (second parameter). Result will be stored in the last parameter. e.g.:
 * C:\>node.exe Archiver.js InFile.js OutFile.js
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */


/**
 * Require section
 */
var Helper = require('./../../lib/Helper.js').Helper;
var fs     = require('fs');

/**
 * @const
 * {String} Default character set of files we should to archive and encode
 */
var FILE_CHARSET  = 'utf-8';
/**
 * @const
 * {Number} The index of last alphabetical character in character map. We will add this
 * value to the index of keywords from keywords variable.
 */
var KEYWORD_LIMIT = 126;
/**
 * @const
 * {Number} Start key for xor encryption. It uses as first xor argument during xor operation. e.g.
 * Source file content: 'ABCD' -> [0x65, 0x66, 0x67, 0x68]
 * Start key          : 0x77
 * Result will be     : 0x65 ^ 0x77 = 0x12, 0x12 ^ 0x66 = 0x74,...
 */
var START_KEY     = 119;
/**
 * {Array} Map of keywords, which will be replaced in script file by it's index + limit. For example 'case' will be replaced by
 * character with code 1 + 126 === '\u007F'.
 * It will be used in RegExps, so it should be in special format. e.g.: '++' should be written as '\\+\\+'
 */
var KEYWORDS      = ['break', 'case ', 'continue', 'default', 'delete ', 'do', 'else', 'for', 'function', 'if', ' in ', 'new ', 'return', 'switch', 'this.', 'this', 'typeof ', 'typeof', 'var ', 'while', 'with', 'false', 'true', 'instanceOf ', 'null', 'true', 'undefined', 'hasOwnProperty', 'Object', 'Boolean', 'Number', 'Function', 'alert', 'arguments', 'Array', 'callee', 'caller', 'clearInterval', 'clearTimeout', 'confirm', 'constructor', 'Date', 'document', 'eval', 'Infinity', 'isFinite', 'isNan', 'length', 'Math', 'NaN', 'parseFloat', 'parseInt', 'prompt', 'prototype', 'RegExp', 'setInterval', 'setTimeout', 'toString', 'valueOf', 'window', 'parent', 'super', 'call', 'apply', 'try', 'catch', 'throw', 'isString', 'isObject', 'isFunction', 'isArray', 'isNumber', 'isBoolean', 'trim', 'exec', 'test', 'file', 'folder', 'get', 'set', 'can', 'Class', 'split', 'join', 'srcData', 'slice', 'splice', '===', '!==', '==', '!=', '\\[\\]', '\\{\\}', '\\|\\|', '\\&\\&', 'is', '\\"\\"', '\\(\\)', '\\+\\+', '--', 'String', 'push', 'replace'];


/**
 * Packs a file using keyword array. It resplaces all found keywords from array by it's index + KEYWORD_LIMIT
 * @param {String} file Name of file we should to pack
 * @return {String} Packed string
 */
function pack(file) {
    var data = fs.readFileSync(file, FILE_CHARSET);

    for (var i = 0, len = KEYWORDS.length; i < len; i++) {
        data = data.replace(new RegExp(KEYWORDS[i], 'g'), String.fromCharCode(i + KEYWORD_LIMIT));
    }

    return data;
}

/**
 * Encodes source file and create destination file
 * @param {String} data String data to encode
 * @return {String} encoded data
 */
function encrypt(data) {
    var dstData     = '';
    var toCharacter = String.fromCharCode;

    for (var i = 0, len = data.length, oldKey = START_KEY; i < len; i++) {
        oldKey     = data[i].charCodeAt(0) ^ oldKey;
        dstData += toCharacter(oldKey);
    }

    return dstData;
}

/**
 * Entry point function
 * @param {Array} argv Array of command line arguments
 * @return {Number} Success code. 0 - ok, !0 - error code
 */
function main (argv) {
    var srcFile = argv.length > 2 ? argv[2] : null;
    var dstFile = argv.length > 3 ? argv[3] : null;
    var dstData;
    var srcData;

    if (!srcFile || !dstFile) {
        console.log('Invalid parameters. Usage: node.exe Archiver.js InFile.js OutFile.js');
        return -1;
    }

    srcData = pack(srcFile);
    dstData = encrypt(srcData);
    fs.writeFileSync(dstFile, dstData, FILE_CHARSET);

    return 0;
}

/**
 * Entry point
 */
return main(process.argv);