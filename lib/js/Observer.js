/**
 * Observer/Firer pattern
 * This class can listen and fire events. Other classes inherited from this one, can
 * also listen and fire events. This is how different classes can listen each other.
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
Lib.Observer = speculoos.Class({
    extend: Lib.Class,

    /**
     * @constructor
     * @override
     * Used only for calling of parent constructor.
     */
    constructor: function () {
        Lib.Observer.base.constructor.apply(this, arguments);
    },

    /**
     * @override
     * Calls after configuration creation. It creates/initializes private fields of the class. Configuration
     * object available in this.cfg property.
     */
    initPrivates: function () {
        Lib.Observer.base.initPrivates.apply(this, arguments);

        /**
         * {Object} Map of listeners sorted by events. Key - event name, value - array of handlers in format {event: [{fn:Function, scope:Object},...]}
         * @private
         */
        this._listeners = {};
    },

    /**
     * Fires an event to all listeners in order, how they were added.
     * @param {String} event Event name
     */
    fire: function (event) {
        var listeners = this._listeners[event] || [];
        var args      = Array.prototype.slice.call(arguments);
        var lAmount   = listeners.length;
        var listener;
        var l;

        //
        // Removes first argument (event)
        //
        args.shift();
        for (l = 0; l < lAmount; l++) {
            listener = listeners[l];
            listener.fn.apply(listener.scope, args);
        }
    },

    /**
     * Bind handler[scope] to specified event
     * @param {String} event Event name
     * @param {Function} fn Handler function
     * @param {Object} scope function's context
     */
    on: function (event, fn, scope) {
        var listeners = this._listeners;

        listeners[event] = listeners[event] || [];
        listeners[event].push({fn: fn, scope: scope});
    },

    /**
     * Unbinds handler from event
     * @param {String} event Event name
     * @param {Function} fn Handler function
     * @param {Object} scope function's context
     */
    un: function (event, fn, scope) {
        var listeners = this._listeners[event] || [];
        var lAmount   = listeners.length;
        var listener;
        var l;

        if (listeners[event]) {
            for (l = 0; l < lAmount; l++) {
                listener = listeners[l];
                if (listener.fn === fn && listener.scope === scope) {
                    delete listeners[l];
                    break;
                }
            }
        }
    }
});