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
     * @const
     * {RegExp} Expression for empty array
     */
    _EMPTY_ARRAY_RE: /^\s*\[\s*\]\s*$/,


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
                write : 2,
                echo  : 1,
                cut   : 3,
                asc   : 2,
                char  : 2,
                goto  : 1,
                gotog : 3,
                sub   : 2,
                append: 2,
                inc   : 1,
                dec   : 1,
                len   : 2,
                xor   : 3,
                hex   : 2,
                'set' : {args: 2, regexp: /^\s*(set)\s+([a-zA-Z_]+[0-9]*[a-zA-Z_]*)+\s*,\s*((\[.*\])|(\'.*\')|([0-9]+)|([a-zA-Z_]+[0-9]*[a-zA-Z_]*))\s*(#{1}.*)*$/}
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
            this.setVar(v, this._prepareString(val.slice(1, val.length - 1)));
        //
        // ser var, ['xxx', 'xxx', ...]
        //
        } else if (val[0] === "[" && val[val.length - 1] === "]") {
            this.setVar(v, this._getArray(val));
        //
        // set var, var
        //
        } else if (this.hasVar(val)) {
            this.setVar(v, this.getVar(val));
        //
        // Unknown argument
        //
        } else {
            throw new Error('Invalid set command arguments at line "' + scriptLine + '"');
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
     * write command handler. Writes specified string from variable to specified file
     * @param {Number} line Current line number in script
     * @param {String} scriptLine Current line of script
     * @param {String} data Name of variable with data string
     * @param {String} file Name of file to write to
     * @return {Number} New position (line number) within the script
     */
    onWrite: function (line, scriptLine, data, file) {
        this._checkVar(data, scriptLine);
        this._checkVar(file, scriptLine);

        data = this.getVar(data);
        file = this.getVar(file);

        if (!Helper.isString(file)) {
            throw new Error('Invalid file name in write command at line "' + scriptLine + '"');
        }
        if (file === '') {
            throw new Error('Specified file name is empty');
        }
        if (!Helper.isString(data)) {
            throw new Error('Only string data supported in write command. Error at line: "' + scriptLine + '"');
        }
        fs.writeFileSync(file, data, this._FILES_CHARSET);

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
     * Sets ASCII code into the character
     * @param {Number} line Current line number
     * @param {String} scriptLine Current script line
     * @param {String} n Name of variable with character code
     * @param {String} v Name of variable for result character
     * @return {Number} Line number
     */
    onChar: function (line, scriptLine, n, v) {
        this._checkVar(n, scriptLine);
        this._checkVar(v, scriptLine);

        n = this.getVar(n);

        if (!Helper.isNumber(n) || n < 0 || n > 255) {
            throw new Error('Invalid source variable value or type at line "' + scriptLine + '"');
        }

        this.setVar(v, String.fromCharCode(n));

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
        if (!((Helper.isNumber(src) && Helper.isNumber(dst)) || (Helper.isString(src) && Helper.isString(dst)) || Helper.isArray(dst))) {
            throw new Error('append command supports only numbers and strings. Error at line "' + scriptLine + '"');
        }

        if (Helper.isArray(dst)) {
            dst.push(src);
        } else {
            this.setVar(dstVar, dst + src);
        }

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
      * Decrements numeric value of variable
      * @param {Number} line Current line number
      * @param {String} scriptLine Current script line
      * @param {String} v Variable name
      * @return {Number} New line number
      */
    onDec: function (line, scriptLine, v) {
        var variable = v;

        this._checkVar(v, scriptLine);
        v = this.getVar(v);

        //
        // Only Numbers are supported
        //
        if (!Helper.isNumber(v)) {
            throw new Error('dec command supports only numbers. Error at line "' + scriptLine + '"');
        }

        this.setVar(variable, --v);

        return ++line;
    },

    /**
      * Sets length of string variable into specified variable
      * @param {Number} line Current line number
      * @param {String} scriptLine Current script line
      * @param {String} src Source variable name
      * @param {String} dst Destination variable name
      * @return {Number} New line number
      */
    onLen: function (line, scriptLine, src, dst) {
        this._checkVar(src, scriptLine);
        this._checkVar(dst, scriptLine);

        src = this.getVar(src);

        //
        // Only Strings are supported
        //
        if (!Helper.isString(src) && !Helper.isArray(src)) {
            throw new Error('len command supports only string and arrays. Error at line "' + scriptLine + '"');
        }

        this.setVar(dst, src.length);

        return ++line;
    },

    /**
      * Makes xor operation with two numbers
      * @param {Number} line Current line number
      * @param {String} scriptLine Current script line
      * @param {Number} left Name of variable with left operand
      * @param {Number} right Name of variable with right operand
      * @param {Number} dst Name of destination variable
      * @return {Number} New line number
      */
    onXor: function (line, scriptLine, left, right, dst) {
        this._checkVar(left, scriptLine);
        this._checkVar(right, scriptLine);
        this._checkVar(dst, scriptLine);

        left  = this.getVar(left);
        right = this.getVar(right);

        //
        // Only Numbers are supported
        //
        if (!Helper.isNumber(left) || !Helper.isNumber(right)) {
            throw new Error('xor command supports only numbers. Error at line "' + scriptLine + '"');
        }

        this.setVar(dst, left ^ right);

        return ++line;
    },

    /**
      * Makes xor operation with two numbers
      * @param {Number} line Current line number
      * @param {String} scriptLine Current script line
      * @param {Number} n Name of variable with decimal number
      * @param {String} hex Name of destination variable
      * @return {Number} New line number
      */
    onHex: function (line, scriptLine, n, hex) {
        var h;

        this._checkVar(n, scriptLine);
        this._checkVar(hex, scriptLine);

        n = this.getVar(n);

        //
        // Only Numbers are supported
        //
        if (!Helper.isNumber(n)) {
            throw new Error('hex command supports only numbers. Error at line "' + scriptLine + '"');
        }
        if (n > 255) {
            throw new Error('hex command supports only numbers in range 0 - 255. Error at line "' + scriptLine + '"');
        }

        h = n.toString(16);
        this.setVar(hex, h.length < 2 ? '0' + h : h);

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

        if (!this._EMPTY_ARRAY_RE.test(part)) {
            part = part.slice(1, part.length - 1).split(',');

            for (i = 0, len = part.length; i < len; i++) {
                item = Helper.trim(part[i]);
                arr.push(this._prepareString(item.slice(1, item.length - 1)));
            }
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
    },

    /**
     * Converts special characters within string into symbols. e.g. '\x20' into ' '
     * @param {String} s Source string
     * @return {String}
     * @private
     */
    _prepareString: function (s) {
        //
        // Symbols like this: '\x20'
        //
        var conv  = String.fromCharCode;
        var hexRe = /\\x([0-9a-fA-F]{2})/g;
        var items = this._getReItems(s, hexRe);
        var len   = items.length;
        var item;

        for (item = 0; item < len; item++) {
            s = s.replace('\\x' + items[item], conv(parseInt(items[item], 16)));
        }

        return s;
    },

    /**
     * Returns items found by regular expression. e.g. /[0-9]/g in string '0123' returns ['0', '1', '2', '3']
     * @param {String} s Source string
     * @param {RegExp} re Regular expression for string
     * @return {Array} Array of found items or empty array if not found
     * @private
     */
    _getReItems: function (s, re) {
        var arr = [];
        var a;

        while ((a = re.exec(s))) {
            arr.push(a[a.length - 1]);
        }

        return arr;
    }
});


/**
 * Exports Alan interpreter class
 * @type {Alan}
 */
exports.Alan = Alan;