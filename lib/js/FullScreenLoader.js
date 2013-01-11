/**
 * Simple full screen loader. It creates full screen div with 0.7 opacity with loader image
 * and message in the center.
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
Lib.FullScreenLoader = speculoos.Class({
    extend: Lib.Class,

    /**
     * @constructor
     * Exists only for super constructor call. Supported configuration:
     *     {String} msg       Loading message
     *     {String} loaderUrl URL of an image for the loader
     */
    constructor: function () {
        this.parent(arguments);
    },

    /**
     * Creates and initializes all private fields of the class
     */
    initPrivates: function () {
        this.parent(arguments);

        /**
         * @prop
         * {HtmlElement} Reference to the DOM element of the loader
         * @private
         */
        this._el = null;
    },

    /**
     * Main initializer of the class
     */
    init: function () {
        this.parent(arguments);

        this._createHtml();
    },

    /**
     * Destructor analog in C++
     */
    destroy: function () {
        document.body.removeChild(this._el);
    },

    /**
     * Shows loader
     */
    show: function () {
        this._el.style.visibility = '';
    },

    /**
     * Hides loader
     */
    hide: function () {
        this._el.style.visibility = 'hidden';
    },

    /**
     * Creates html for the loader
     * @private
     */
    _createHtml: function () {
        var container = document.createElement('div');

        //
        // Creates html node like this:
        // <div style="..."><div style="...">Message</div></div>
        //
        container.style.cssText = 'visibility: hidden; z-index: 100; left: 0; top: 0; position: absolute; width: 100%; height: 100%; overflow: hidden; opacity: 0.7; background: url(' + this.cfg.loaderUrl + ') center no-repeat; background-color: #222;';
        container.innerHTML     = '<div style="text-align: center; position: absolute; left: 50%; top: 50%; margin-left: -200px; margin-top: 40px; color: #ffffff; font-family: Verdana; width: 400px;">' + this.cfg.msg + '</div>';

        this._el = document.body.appendChild(container);
    }
});