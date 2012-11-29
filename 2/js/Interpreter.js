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

//
// Entry point of application
//
var scriptFile = process.argv.length > 2 ? process.argv[2] : '';

if (!Lib.Helper.isString(scriptFile)) {
    console.log('Invalid script file: ' + scriptFile);
    // TODO: constant should be moved upper
    process.exit(1);
}
if (!fs.existsSync(scriptFile)) {
    console.log('Script file doesn\'t exists: ' + scriptFile);
    // TODO: constant should be moved upper
    process.exit(1);
}

//
// Runs Alan script
//
try {
    (new Alan()).run(scriptFile);
} catch (e) {
    console.log(e.message);
}