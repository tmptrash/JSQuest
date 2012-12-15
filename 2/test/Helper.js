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
     * Calls callback function with all type of parameters (array, boolean, function,...)
     * @param {String} msg Prefix for messages
     * @param {Function} cb Callback function
     */
    callWithAllTypes: function (msg, cb) {
        assert.throws(function () {
            cb('Hello world!');
        }, undefined, msg + ' - not empty string');
        assert.throws(function () {
            cb(' ');
        }, undefined, msg + ' - string with one space');
        assert.throws(function () {
            cb('');
        }, undefined, msg + ' - empty string');
        assert.throws(function () {
            cb(123);
        }, undefined, msg + ' - number 123');
        assert.throws(function () {
            cb(0);
        }, undefined, msg + ' - number 0');
        assert.throws(function () {
            cb(-1);
        }, undefined, msg + ' - number -1');
        assert.throws(function () {
            cb(function () {});
        }, undefined, msg + ' - empty function');
        assert.throws(function () {
            cb([]);
        }, undefined, msg + ' - empty array');
        assert.throws(function () {
            cb([1,2,3]);
        }, undefined, msg + ' - not empty array');
        assert.throws(function () {
            cb(NaN);
        }, undefined, msg + ' - NaN');
        assert.throws(function () {
            cb(Infinity);
        }, undefined, msg + ' - Infinity');
        assert.throws(function () {
            cb(undefined);
        }, undefined, msg + ' - undefined');
        assert.throws(function () {
            cb(null);
        }, undefined, msg + ' - null');
        assert.throws(function () {
            cb(true);
        }, undefined, msg + ' - boolean true');
        assert.throws(function () {
            cb(false);
        }, undefined, msg + ' - boolean false');
        assert.throws(function () {
            cb(/[^]/);
        }, undefined, msg + ' - regexp');
        assert.throws(function () {
            cb({});
        }, undefined, msg + ' - object');
    },

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