/**
 * TODO: add comments for all public methods
 * This is ALAN - simple Assembler LANguage interpreter
 */
var fs        = require('fs');
var Class     = require('./../../lib/speculoos.js').Class;
var Helper    = require('./../../lib/Helper.js').Helper;
var Simple    = require('./Simple.js').Simple;

/**
 * {Function} Alan interpreter
 */
var Alan = Class({
    extends      : Simple,

    /**
     * @const
     * {String} Default charset for file operations.
     */
    _FILES_CHARSET: 'utf-8',


    /**
     * ctor. Instantiates the object. Creates all public/private properties
     */
    constructor: function () {
        Alan.super.constructor.call(this, {
            /**
             * {String} Script files extension
             */
            filesExtension: 'alan',
            /**
             * {Object} Available script commands
             */
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
        if (Helper.isNumeric(val)) {
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
     * read command handler. Reads specified file into variable
     * @param {Number} line Current line number in script
     * @param {String} scriptLine Current line of script
     * @param {String} file Name of file to read from
     * @param {String} v Name of variable
     * @return {Number} New position (line number) within the script
     */
    onRead: function (line, scriptLine, file, v) {
        this._checkVar(file);
        this._checkVar(v);

        file = this.getVar(file);

        if (!fs.existsSync(file)) {
            throw new Error('File doesn\'t exists "' + file + '"');
        }
        this.setVar(v, fs.readFileSync(file, this._FILES_CHARSET));

        return ++line;
    },

    /**
     * Cut one symbol or one array's element from string or array
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
     * Return array from it's string representation. It supports only
     * array of strings.
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
            item = Helper.trim(part[i]);
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