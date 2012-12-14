/**
 * This is console application, that interprets an script written on Alan language.
 * It interprets first argument as a script. Example:
 *
 * $>node.exe Interpreter.js script.alan
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */


/**
 * Require section
 */
var Alan   = require('./Alan.js').Alan;
var Helper = require('./../../lib/js/Helper.js').Helper;
var fs     = require('fs');

var RETURN_OK  = 0;
var RETURN_ERR = 1;

//
// Entry point of application
//
var scriptFile = process.argv.length > 2 ? process.argv[2] : '';

if (!Helper.isString(scriptFile)) {
    console.log('Invalid script file: ' + scriptFile);
    process.exit(RETURN_ERR);
}
if (!fs.existsSync(scriptFile)) {
    console.log('Script file doesn\'t exists: ' + scriptFile);
    process.exit(RETURN_ERR);
}

//
// Runs Alan script
//
try {
    (new Alan()).run(scriptFile);
    process.exit(RETURN_OK);
} catch (e) {
    console.log(e.message);
    process.exit(RETURN_ERR);
}