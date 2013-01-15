/**
 * This is the most basic class for everything else. In general, all classes should be inherited from this one. It
 * contains main interface methods for private/public fields creation, initialization and configuration.
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */

//
// This peace of code is only for case, when you use this class with Node.js
//
if (typeof exports !== 'undefined') {
    var Lib       = {
        Helper: require('./Helper.js').Helper
    };
    this.speculoos = require('./external/speculoos.js');
}

Lib.Class = this.speculoos.Class({
    /**
     * @constructor
     * Main logic lives here. it calls configuration initializer, creates private/public fields or
     * the class and call init method.
     * @param {Object} cfg Class configuration
     */
    constructor: function (cfg) {
        /**
         * @prop
         * {Object} Public reference to the configuration passed to the constructor
         */
        this.cfg = Lib.Helper.isObject(cfg) ? cfg : {};

        this.initConfig();
        this.initPrivates();
        this.initPublics();
        this.init();
    },

    /**
     * Helper method for calling parent method. For example, if you have code like this:
     * ...
     * myMethod: function () {
     *     parent(); // calls myMethod() from the parent class
     * }
     * ...
     * @param {Array} args Array of arguments. You can use arguments variable here.
     * @return {*} Value of the parent method
     */
    parent: function (args) {
        var caller = arguments.callee.caller;
        var fnName = caller.fnName;

        //
        // This is last class in inheritance chunk, so we should call constructor
        // in a special way.
        //
        if (fnName === 'extend') {
            return Lib.Class.apply(this, args);
        }

        return caller.cl.base[fnName].apply(this, args);
    },

    /**
     * @interface
     * Calls first in class. Should create and prepares configuration passed to the constructor. Configuration
     * object available in this.cfg property.
     */
    initConfig: Lib.Helper.emptyFn,

    /**
     * @interface
     * Calls after configuration creation. It creates/initializes private fields of the class. Configuration
     * object available in this.cfg property.
     */
    initPrivates: Lib.Helper.emptyFn,

    /**
     * @interface
     * Calls after configuration creation and after initPrivates() method. It creates/initializes public
     * fields of the class. Configuration object available in this.cfg property.
     */
    initPublics: Lib.Helper.emptyFn,

    /**
     * @interface
     * Calls after configuration private/public fields creation. It uses for main initialization of the class.
     * It can be some internal logic or creation of some instances... Configuration object available in this.cfg property.
     */
    init: Lib.Helper.emptyFn
});

/**
 * Exports Class class. It works only for Node.js levels
 * @type {Object}
 */
if (typeof exports !== 'undefined') {
    exports.Class = Lib.Class;
}