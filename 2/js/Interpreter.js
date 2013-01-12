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
var _      = require('./../../lib/js/Language.js').Language._;
var fs     = require('fs');

var RETURN_OK  = 0;
var RETURN_ERR = 1;

//
// Entry point of application
//
var scriptFile = process.argv.length > 2 ? process.argv[2] : '';

if (!Helper.isString(scriptFile)) {
    console.log(_('Invalid script file: {0}', scriptFile));
    process.exit(RETURN_ERR);
}
if (!fs.existsSync(scriptFile)) {
    console.log(_('Script file doesn\'t exists: {0}', scriptFile));
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