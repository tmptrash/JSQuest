/**
 * Node.js NUnitJS helper functions
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
var assert = require('assert');
var fs     = require('fs');
var Alan   = require('././Alan').Alan;


var NUnitHelper = {
    /**
     * Runs range of scripts from start to end index. Script name will be formed by rules:
     * path + '-err' + index + '.alan'.
     * @param {String} path Path and a part of file name with tests.
     * @param {Number} start Start index
     */
    runScripts: function (path, start, end) {
        var i;

        for (i = start; i <= end; i++) {
            this.runScript(path + '-err' + i + '.alan', true);
        }
    },

    /**
     * Runs specified script file and checks values of variables on finish
     * @param {String} file Path to script file
     * @param {Boolean} hasError true if script has an error in code and should throws an error, false - otherwise
     * @param {Object|undefined} vars variables we need to check. Key - var name, value - var value
     */
    runScript:  function (file, hasError, vars) {
        var s = new Alan();

        if (!fs.existsSync(file)) {
            throw new Error('Script file "' + file + '" does not exist.');
        }
        if (hasError) {
            try {
                s.run(file);
            } catch (e) {
                this._checkVars(s, vars);
                return;
            }
            throw new Error('Script "' + file +'" could throw an error, but it did not.');
        }
        s.run(file);
        this._checkVars(s, vars);
    },

    /**
     * Checks variables in script. It compares values with specified values.
     * @param {Alan} alan Reference to the Alan's class instance
     * @param {Object} vars Map of variables with values
     * @private
     */
    _checkVars: function (alan, vars) {
        for (var i in vars) {
            if (vars.hasOwnProperty(i)) {
                if (alan.getVar(i) !== vars[i]) {
                    throw new Error('Invalid variable\'s value. var: ' + i + ', value: ' + vars[i]);
                }
            }
        }

    }
};

exports.NUnitHelper = NUnitHelper;