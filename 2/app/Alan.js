/**
 * TODO:
 * This is ALAN - simple Assembler LANguage interpreter
 */
var fs        = require('fs');
var speculoos = require('./../../lib/speculoos.js');
var helper    = require('./../../lib/Helper.js').Helper;
var Simple    = require('./Simple.js').Simple;

/**
 * Alan interpreter
 * @type {Object}
 */
var Alan = speculoos.Class({
    extends      : Simple,

    /**
     * @const
     * {String} Name of the set command
     */
     // TODO: Why do we need this?
    _CMD_SET     : 'set',


    /**
     * ctor. Instantiate the object. Creates all public/private properties
     */
    constructor: function () {
        Alan.super.constructor.call(this, {
            // TODO: add commands description comment here
            commands       : {
                read  : 2,
                echo  : 1,
                cut   : 3,
                'set' : {args: 2, regexp: /^\s*([a-z]+)\s+([a-z]+[0-9]*[a-z]*)+\s*,\s*((\[.+\])|(\'.*\')|([0-9]+))\s*$/}
            }
        });
    },

    /**
     * Echoes data to the terminal
     * @param {Number} line Current line number in script
     * @param {String} scriptLine Current line of script
     * @param {String} v Name of the variable
     */
    onEcho: function (line, scriptLine, v) {
        console.log(this.getVar(v));
        return ++line;
    },

    /**
     * set command handler. Sets specified value into the variable
     * @param {Number} line Current line number in script
     * @param {String} scriptLine Current line of script
     * @param {String} v Name of the variable
     * @param {String|Number|Array} val Value
     * @return {Number} New position (line number) within the script
     */
    onSet: function (line, scriptLine, v, val) {
        //
        // set var, Number
        //
        if (helper.isNumeric(val)) {
            this.setVar(v, parseFloat(val));
        //
        // set var, String
        //
        } else if (val[0] === "'" && val[val.length - 1] === "'") {
            this.setVar(v, val.slice(1, val.length - 1));
        //
        // ser var, ['xxx', 'xxx', ...]
        //
        } else if (val[0] === "[" && val[val.length - 1] === "]") {
            this.setVar(v, this._getArray(val));
        //
        // Unknown argument
        //
        } else {
            throw new Error('Invalid set command arguments at line "' +  + '"');
        }

        return ++line;
    },

    /**
     * read command handler. Reads specified utf-8 file into variable
     * @param {Number} line Current line number in script
     * @param {String} scriptLine Current line of script
     * @param {String} file Name of file to read from
     * @param {String} v Name of variable
     * @return {Number} New position (line number) within the script
     */
    onRead: function (line, scriptLine, file, v) {
        this._checkVar(file);
        this._checkVar(v);

        this.setVar(v, fs.readFileSync(this._vars[file], 'utf-8'));

        return ++line;
    },

    /**
     * Cut one symbol or one array element from string or array
     * @param {Number} line Current line number
     * @param {String} scriptLine Current script line
     * @param {String} v Name of variable where we should get a symbol/element
     * @param {String} index Name of variable with index
     * @param {String} dest Name of variable where we will save the result
     * @return {Number}
     */
    onCut: function (line, scriptLine, v, index, dest) {
        this._checkVar(v);
        this._checkVar(dest);
        if (index < 0 || index >= this.getVar(v).length) {
            throw new Error('Invalid index within variable at line "' + scriptLine + '"');
        }

        this.setVar(dest, this.getVar(v)[this.getVar(index)]);

        return ++line;
    },

    /**
     * Set ascii symbol's number into variable
     * @param {Number} line Current line number
     * @param {String} scriptLine Current script line
     * @param {String} v Name of variable where we should get a symbol
     * @param {String} n Name of variable with for result
     * @return {Number} Line number
     */
    onAsc: function (line, scriptLine, v, n) {
        this._checkVar(v);
        this._checkVar(n);

        if (this.getVar(v).length < 1) {
            throw new Error('Invalid source variable length at line "' + scriptLine + '"');
        }

        this.setVar(n, this.getVar(v)[0]);

        return ++line;
    },

    /**
     * Run one special command and return new line position in script
     * @param {Number} line Line number in script
     * @param {String} scriptLine Current script line
     * @return {Number} New scipt's line position
     */
    runSpecialCommand: function (line, scriptLine) {
        var cmd = this.getCommand(scriptLine);

        if (cmd === this._CMD_SET) {
            line = this.runCommand(line, scriptLine, this._getSetArguments);
        } else {
            throw new Error('Invalid special command at line "' + scriptLine + '"');
        }

        return line;
    },

    /**
     * Return arguments array with 2 arguments - variable and the array reference
     * @param {String} line One script line
     * @param {Number} argCount Amount of arguments in current command
     * @return {Array} Arguments
     * @private
     */
    _getSetArguments: function (line, argCount) {
        var regexp;

        regexp = this._CMD_SET_RE.exec(line);
        if (!regexp || regexp.length < argCount + 1) {
            throw new Error('Invalid arguments for set command at line "' + line + '"');
        }

        return [regexp[2], regexp[3]];
    },

    /**
     * Return array from it's string representation
     * @param {String} part Array string representation
     * @return {Array}
     * @private
     */
    _getArray: function (part) {
        var arr = [];
        var item;
        var len;
        var i;

        part = part.slice(1, part.length - 1).split(',');

        for (i = 0, len = part.length; i < len; i++) {
            item = helper.trim(part[i]);
            arr.push(item.slice(1, item.length - 1));
        }

        return arr;
    },

    /**
     * Checks variable by name, if not it will throw an exception
     * @param {String} v Name of the variable
     * @param {String} line Raw script line
     * @private
     */
    _checkVar: function (v, line) {
        if (this.getVar(v) === false) {
            throw new Error('Variable is not defined at line "' + line + '"');
        }
    }
});


/**
 * Exports Alan interpreter class
 * @type {Alan}
 */
exports.Alan = Alan;