/**
 * Created with JetBrains WebStorm.
 * User: owner
 * Date: 31.10.12
 * Time: 22:31
 * To change this template use File | Settings | File Templates.
 */
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
                'set' : {args: 2, regexp: /^\s*(set)\s+([a-zA-Z]+[0-9]*[a-zA-Z]*)+\s*,\s*((\[.*\])|(\'.*\')|([0-9]+)|([a-zA-Z]+[0-9]*[a-zA-Z]*))\s*$/}
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
    }
});


/**
 * Exports Alan interpreter class
 * @type {Alan}
 */
exports.Alan = Alan;