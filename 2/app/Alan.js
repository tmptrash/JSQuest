/**
 * This is ALAN - simple Assembler LANguage interpreter. It implements concrete
 * bundle of commands and inherited from Simple class. It is very simple. It contains
 * commands (commands property) and file extension configurations. This is how it
 * pass a list of supported commands into the Simple class. It also, contains a list
 * of handlers in format onXxx(). Every command from commands configuration should
 * has an pair in handlers list. For example:
 *
 * ...
 * commands: {
 *     inc: 1, // tell the Simple class, that we supports inc command with one argument
 *     set: 2  // tell the Simple class, that we supports set command with two arguments
 * }
 * ...
 * //
 * // This handler will be called if inc command will be met in script.
 * // First two arguments are the same for all handlers and means current line number
 * // and script string line. Last argument it is a name of variable, we should to increase.
 * //
 * onInc: function (line, script, v) {
 *     // do something...
 * },
 *
 * onSet: function (line, script, from, to) {
 *     // do something
 * },
 *
 * this peace of code will parse and handle script like this:
 * set a, 1
 * inc a
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */

/**
 * Include all required classes.
 */
var fs        = require('fs');
var Class     = require('./../../lib/speculoos.js').Class;
var Helper    = require('./../../lib/Helper.js').Helper;
var Simple    = require('./Simple.js').Simple;


/**
 * @class
 * {Alan} Interpreter class implementation
 */
var Alan = Class({
    extends      : Simple,

    /**
     * @const
     * {String} Default charset for file operations.
     */
    _FILES_CHARSET: 'utf-8',


    /**
     * ctor. Instantiates the object. Creates all public/private properties. It passes a configuration
     * of Alan commands and file extension into the Simple interpreter class.
     */
    constructor: function () {
        Alan.super.constructor.call(this, {
            /**
             * @conf
             * {String} Script files extension
             */
            fileExtension: 'alan',
            /**
             * @conf
             * {Object} Available script commands with amount of supported arguments.
             */
            commands       : {
                read  : 2,
                echo  : 1,
                cut   : 3,
                asc   : 2,
                goto  : 1,
                gotog : 3,
                sub   : 2,
                append: 2,
                inc   : 1,
                'set' : {args: 2, regexp: /^\s*([a-z]+)\s+([a-z]+[0-9]*[a-z]*)+\s*,\s*((\[.+\])|(\'.*\')|([0-9]+))\s*$/}
            }
        });
    },

    /**
     * Echoes value of variable to the console
     * @param {Number} line Current line number in script
     * @param {String} scriptLine Current line of script
     * @param {String} v Name of the variable
     * @return {Number} new line number
     */
    onEcho: function (line, scriptLine, v) {
        this._checkVar(v, scriptLine);

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
        this._checkVar(file, scriptLine);
        this._checkVar(v, scriptLine);

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
        this._checkVar(v, scriptLine);
        this._checkVar(index, scriptLine);
        this._checkVar(dest, scriptLine);

        v     = this.getVar(v);
        index = this.getVar(index);

        if (index < 0 || index >= v.length) {
            throw new Error('Invalid index within variable at line "' + scriptLine + '"');
        }

        this.setVar(dest, v[index]);

        return ++line;
    },

    /**
     * Set ascii symbol's number into variable
     * @param {Number} line Current line number
     * @param {String} scriptLine Current script line
     * @param {String} v Name of variable where we should get a symbol
     * @param {String} n Name of variable for result
     * @return {Number} Line number
     */
    onAsc: function (line, scriptLine, v, n) {
        this._checkVar(v, scriptLine);
        this._checkVar(n, scriptLine);

        v = this.getVar(v);

        if (!Helper.isString(v) || v.length < 1) {
            throw new Error('Invalid source variable length or type at line "' + scriptLine + '"');
        }

        this.setVar(n, v.charCodeAt(0));

        return ++line;
    },

    /**
     * Jumps into the line with specified label
     * @param {Number} line Current line number
     * @param {String} scriptLine Current script line
     * @param {String} label Name of label we need to jump
     * @return {Number} Line number
     */
    onGoto: function (line, scriptLine, label) {
        if (!this.hasLabel(label)) {
            throw new Error('Invalid label at line "' + scriptLine + '"');
        }

        return this.getLineByLabel(label);
    },

    /**
     * Jumps into the line with specified label if first argument greater then second
     * @param {Number} line Current line number
     * @param {String} scriptLine Current script line
     * @param {String|Number} left Value, that should be greater, then right
     * @param {String|Number} right Value, that should be less, then left
     * @param {String} label Name of label we need to jump
     * @return {Number} Line number
     */
    onGotog: function (line, scriptLine, left, right, label) {
         this._checkVar(left, scriptLine);
         this._checkVar(right, scriptLine);
         if (!this.hasLabel(label)) {
             throw new Error('Invalid label at line "' + scriptLine + '"');
         }

         if (this.getVar(left) > this.getVar(right)) {
             return this.getLineByLabel(label);
         }
         return ++line;
    },

    /**
     * Substitutes two variables and save the result into the first one
     * @param {Number} line Current line number
     * @param {String} scriptLine Current script line
     * @param {String} src Source variable name
     * @param {String} dst Destination variable name
     * @return {Number} New line number
     */
    onSub: function (line, scriptLine, src, dst) {
        this._checkVar(src, scriptLine);
        this._checkVar(dst, scriptLine);

        var srcVar = src;
        src = this.getVar(src);
        dst = this.getVar(dst);

        //
        // Only Numbers are supported
        //
        if (!Helper.isNumber(src) || !Helper.isNumber(dst)) {
            throw new Error('sub command supports only numbers. Error at line "' + scriptLine + '"');
        }

        this.setVar(srcVar, src - dst);

        return ++line;
    },

    /**
      * Appends destination value to the source
      * @param {Number} line Current line number
      * @param {String} scriptLine Current script line
      * @param {String} dst Destination variable name
      * @param {String} src Source variable name
      * @return {Number} New line number
      */
    onAppend: function (line, scriptLine, dst, src) {
        this._checkVar(src, scriptLine);
        this._checkVar(dst, scriptLine);

        var dstVar = dst;
        src = this.getVar(src);
        dst = this.getVar(dst);

        //
        // Only Strings and Numbers are supported
        //
        if (!(Helper.isNumber(src) && Helper.isNumber(dst) || Helper.isString(src) && Helper.isString(dst))) {
            throw new Error('append command supports only numbers and strings. Error at line "' + scriptLine + '"');
        }

        this.setVar(dstVar, dst + src);

        return ++line;
    },

    /**
      * Increments numeric value of variable
      * @param {Number} line Current line number
      * @param {String} scriptLine Current script line
      * @param {String} v Variable name
      * @return {Number} New line number
      */
    onInc: function (line, scriptLine, v) {
        var variable = v;

        this._checkVar(v, scriptLine);
        v = this.getVar(v);

        //
        // Only Numbers are supported
        //
        if (!Helper.isNumber(v)) {
            throw new Error('inc command supports only numbers. Error at line "' + scriptLine + '"');
        }

        this.setVar(variable, ++v);

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