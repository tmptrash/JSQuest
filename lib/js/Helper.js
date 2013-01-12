/**
 * Global helper class. Singleton. Contains common usable functions for any class.
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 * TODO: create different helpers. e.g.: Helper.String
 * TODO: move helpers to separate namespace - Helper
 */

if (typeof exports !== 'undefined') {
    if (Lib === undefined) {
        var Lib    = {};
        var window = {};
    }
    Lib.external = {Helper: require('./external/Helper.js').Helper};
}

/**
 * @singleton
 * {Object} Global helper object
 */
Lib.Helper = {
    /**
     * Just empty function. Can be used for interface methods, stubs and so on.
     */
    emptyFn: function () {},

    /**
     * Clones object|Array|Function
     * @param {Object|Array|Function}
     * @return {Object|Array|Function}
     */
    clone: function (o) {
        return JSON.parse(JSON.stringify(o));
    },

    /**
     * Returns unique string id
     * @return {String}
     */
    getId: function () {
        Lib.Helper.uniqueId = Lib.Helper.uniqueId || 0;
        Lib.Helper.uniqueId++;
        return Lib.Helper.md5(Lib.Helper.uniqueId.toString());
    },

    /**
     * MD5 hash generator. Written by Chris Coyier
     * @param {String} string Input string
     * @return {String} Hash
     */
    md5: Lib.external.Helper.md5,

    /**
     * Javascript string pad. http://www.webtoolkit.info/
     * @param {String} str String we should to pad
     * @param {Number|undefined} len Amount of pad symbols
     * @param {String|undefined} pad Pasd symbol
     * @param {String||undefined} dir 'right' | 'left'
     * @return {String}
     **/
    pad: Lib.external.Helper.pad,

    /**
     * Strip whitespace from the beginning and end of a string
     * @param {String} str
     * @return {String}
     */
    trim: function (str) {
        return str.replace(/^\s+|\s+$/g, "");
    },

    /**
     * Capitalize string. hello -> Hello
     * @param {String} s
     * @return {String} Capitalized string
     */
    capitalize: function (s) {
        return Lib.Helper.isString(s) && s.length > 0 ? s[0].toUpperCase() + s.substr(1) : s;
    },

    /**
     * Analog of printf method. First argument - source string, other - format arguments.
     * e.g.: format('My name is {0}', 'Vasya') -> 'My name is Vasya'
     * @param {String} s Source function
     * @return {String} Formatted string
     */
    format: function (s) {
        var args = Array.prototype.slice.call(arguments);
        var str  = s;
        var arg;
        var len;

        args.shift();
        for (arg = 0, len = args.length; arg < len; arg++) {
            str = str.replace('{' + arg + '}', args[arg]);
        }

        return str;
    },

    /**
     * Creates name of the handler, which will handle specified command in console.
     * @param {String} cmd Name of the command
     * @return {String} Handler name
     */
    createCmdHandlerName: function (cmd) {
        return '_on' + Lib.Helper.capitalize(cmd) + 'Cmd';
    },

    /**
      * Returns true if the passed value is a JavaScript Array, false otherwise.
      *
      * @param {Object} target The target to test
      * @return {Boolean}
      * @method
      */
    isArray: Array.isArray || function (value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    },

    /**
     * Returns true if specified expression is regular expression
     * @param {Mixed} val
     * @return {Boolean}
     */
    isRegexp: function (val) {
        return val instanceof RegExp;
    },

     /**
      * Returns true if the passed value is a JavaScript Object, false otherwise.
      * @param {Object} value The value to test
      * @return {Boolean}
      * @method
      */
    isObject: (Object.prototype.toString.call(null) === '[object Object]') ? function (value) {
        // check ownerDocument here as well to exclude DOM nodes
        return value !== null && value !== undefined && Object.prototype.toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
    } : function (value) {
        return Object.prototype.toString.call(value) === '[object Object]';
    },

     /**
      * Returns true if the passed value is a JavaScript Function, false otherwise. Safari 3.x and 4.x returns
      * 'function' for typeof <NodeList>, hence we need to fall back to using Object.prototype.toString (slower)
      * @param {Object} value The value to test
      * @return {Boolean}
      * @method
      */
    isFunction: (window.document !== undefined && typeof document.getElementsByTagName('body') === 'function') ? function (value) {
        return Object.prototype.toString.call(value) === '[object Function]';
    } : function (value) {
        return typeof value === 'function';
    },

     /**
      * Returns true if the passed value is a number. Returns false for non-finite numbers.
      * @param {Object} value The value to test
      * @return {Boolean}
      */
    isNumber: function (value) {
        return typeof value === 'number' && isFinite(value);
    },

    /**
     * Validates that a value is numeric.
     * @param {Object} value Examples: 1, '1', '2.34', '0x23'
     * @return {Boolean} True if numeric, false otherwise
     */
    isNumeric: function (value) {
        return !isNaN(parseFloat(value)) && !isNaN(Number(value)) && isFinite(value);
    },

     /**
      * Returns true if the passed value is a string.
      * @param {Object} value The value to test
      * @return {Boolean}
      */
    isString: function (value) {
        return typeof value === 'string';
    },

     /**
      * Returns true if the passed value is a boolean.
      *
      * @param {Object} value The value to test
      * @return {Boolean}
      */
    isBoolean: function (value) {
        return typeof value === 'boolean';
    },

    /**
     * Returns true if the passed value is an HTMLElement
     * @param {Object} value The value to test
     * @return {Boolean}
     */
    isElement: function (value) {
        return value ? value.nodeType === 1 : false;
    },

    /**
     * Makes JSONP cross domain request and calls callback function with one
     * parameter - received data.
     * @param {String} url URL
     * @param {Function} cb Callback.
     * @param {Object} scope Scope for callback
     */
    jsonp: function (url, cb, scope) {
        JSONP.init({callbackName: 'jsqcallback'});
        JSONP.get(url, undefined, function (data) {cb.call(scope, data); });
    }
};

/**
 * @prop
 * {Mixed} Reference to the global object (namespace)
 */
var global = this;
/**
 * Exports Helper class. It works only for Node.js levels
 * @type {Object}
 */
if (typeof exports !== 'undefined') {
    exports.Helper = Lib.Helper;
}