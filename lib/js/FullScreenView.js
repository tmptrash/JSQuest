/**
 * Full screen view widget. This is simple box at the top left corner. User can click on it and application
 * will switch on the browser to the full screen mode.
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
Lib.FullScreenView = speculoos.Class({
    extend: Lib.Class,

    /**
     * @constructor
     * Exists only for super constructor call. Supported configuration:
     *     {String} el Optional. HTML element which will be turned to the full screen. body dy default.
     */
    constructor: function () {
        this.parent(arguments);
    },

    /**
     * Configuration initializer
     */
    initConfig: function () {
        this.parent(arguments);

        /**
         * @conf
         * {HTMLElement} Reference to the element, we should to full screen
         */
        this.cfg.el = Lib.Helper.isElement(this.cfg.el) ? this.cfg.el : document.body;
    },

    /**
     * Main initializer of the class
     */
    init: function () {
        this.parent(arguments);

        this._createHtml();
    },

    /**
     * Creates html for the loader
     * @private
     */
    _createHtml: function () {
        var me        = this;
        var container = document.createElement('div');

        //
        // Creates html node like this:
        // <div style="..."></div>
        //
        container.style.cssText = 'z-index: 2; width: 33px; height: 30px; left: 60px; top: 3px; position: absolute; background-image: url(' + Config.url.images.fullScreen + ')';
        container.addEventListener('click', function () {me._toggleFullScreen(); });

        document.body.appendChild(container);
    },

    /**
     * Toggle full screen mode
     * @private
     */
    _toggleFullScreen: function () {
        if (!document.webkitIsFullScreen) {
            this.cfg.el.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        } else {
            document.webkitCancelFullScreen();
        }
    }
});