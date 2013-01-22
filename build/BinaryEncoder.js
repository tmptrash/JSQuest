/**
 * This file compresses specified JavaScript file into unreadable sequence.
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
var _  = require('./../lib/js/Language.js').Language._;
var fs = require('fs');

var RETURN_OK  = 0;
var RETURN_ERR = 1;

/**
 * Encodes input string into unreadable sequence
 * @param {String} str Input string
 * @return {String} Encoded string
 */
function encode(str) {
    var result     = '';
    var char_true  = '\t';
    var char_false = ' ';
    var k;
    var i;
    var j;
    var d;

    for (k = 0; k < str.length; k++) {
        for (i = 0; i < str[k].length; i++) {
            d = parseInt(str[k].charCodeAt(i), 10).toString(2);
            for (j = 0; j < d.length; j++) {
                result += (parseInt(d[j], 10)) ? char_true : char_false;
            }
            result += '\n';
        }
    }

    return result;
}

/**
 * Decodes encoded string by encode() method.
 * @param {String} str Encoded string
 * @return {String} Original string
 */
function decode(str) {
    var result    = '';
    var char_true = '\t';
    var i;
    var j;
    var chr;
    var encoded;

    str = str.split('\n');
    for (i = 0; i < str.length; i++) {
        encoded = '';
        for (j = 0; j < str[i].length; j++) {
            encoded += (str[i][j] === char_true) ? '1' : '0';
        }
        chr     = parseInt(encoded, 2);
        result += String.fromCharCode(chr.toString(10));
    }

    return result.substr(0, result.length - 1);
}

if (process.argv.length < 4) {
    console.log(_('Invalid argument amount. Usage: node Compressor inFile.js OutFile.js'));
    process.exit(RETURN_ERR);
}

var inFile  = process.argv[2];
var outFile = process.argv[3];

if (!fs.existsSync(inFile)) {
    console.log(_('Input script file doesn\'t exists: {0}', inFile));
    process.exit(RETURN_ERR);
}

//
// Entry point of application
//
function main() {
    fs.writeFileSync(outFile, encode(fs.readFileSync(inFile, 'utf-8')), 'utf-8');
    return RETURN_OK;
}

process.exit(main());
