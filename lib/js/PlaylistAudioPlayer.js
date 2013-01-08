/**
 * This is HTML5 audio tag based audio player. It plays, mp3 files from specified playlist passed
 * to the constructor in configuration. It can loop and autoplay the playlist (see configuration
 * parameters).
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
Lib.PlaylistAudioPlayer = speculoos.Class({
    extend: Lib.Observer,

    /**
     * @constructor
     * Exists only for it's parent method.
     * @param {Object} cfg Configuration of the class. Available parameters:
     *        {Array}   playlist Optional. Array of URLs with mp3 songs
     *        {Boolean} autoplay Optional. true to start playing after instance will be areated
     *        {Element} parent   Optional. Parent html tag for audio tag
     *        {Boolean} loop     Optional. loop the playlist
     */
    constructor: function (cfg) {
        Lib.Terminal.base.constructor.call(this, cfg);
    },

    /**
     * @override
     */
    initConfig: function () {
        this.parent(arguments);

        var cfg = this.cfg;

        /**
         * @conf
         * {Array} Default value for the playlist
         */
        cfg.playlist = Lib.Helper.isArray(cfg.playlist) ? cfg.playlist : [];
        /**
         * @conf
         * {Boolean} true to start playing after class will starts
         */
        cfg.autoplay = Lib.Helper.isBoolean(cfg.autoplay) ? cfg.autoplay : true;
        /**
         * @conf
         * {Boolean} true to start playing after class will starts
         */
        cfg.parent   = Lib.Helper.isElement(cfg.parent) ? cfg.parent : document.body;
        /**
         * @conf
         * {Boolean} true to start playing after class will starts
         */
        cfg.loop     = Lib.Helper.isBoolean(cfg.loop) ? cfg.loop : true;
    },

    /**
     * @override
     * Private fields initializer
     */
    initPrivates: function () {
        this.parent(arguments);

        /**
         * @prop
         * {String} Unique audio tag id
         * @private
         */
        this._id        = Lib.Helper.getId();
        /**
         * @prop
         * {HtmlElement} Reference to the HTML5 audio tag
         * @private
         */
        this._el        = null;
        /**
         * @prop
         * {Number} Index of the current song
         * @private
         */
        this._songIndex = 0;
    },

    /**
     * @override
     * Creates html for the player and starts playing
     */
    init: function () {
        this.parent(arguments);

        this._createHtml();
        this._addHandlers();
    },

    /**
     * Creates HTML5 audio tag play playing
     * @private
     */
    _createHtml: function () {
        var container = document.createElement('audio');

        //
        // Creates html nodes like this:
        // <audio src="..." autoplay/>
        //
        container.style.cssText = 'position: absolute; top: 3px; left: 3px; z-index: 100; width: 48px; opacity: 0.4;';
        container.controls      = true;
        container.id            = this._id;
        container.src           = this.cfg.playlist[this._songIndex];
        container.autoplay      = this.cfg.autoplay;

        this._el = this.cfg.parent.appendChild(container);
    },

    /**
     * Binds handlers to the audio tag
     * @private
     */
    _addHandlers: function () {
        var me = this;

        me._el.addEventListener('ended', function () {me._onEnd.apply(me, arguments); });
    },

    /**
     * Handler of the event then current song is ended
     * @private
     */
    _onEnd: function () {
        var cfg = this.cfg;

        this._songIndex++;
        if (this._songIndex < cfg.playlist.length) {
            this._el.src = cfg.playlist[this._songIndex];
        } else if (cfg.loop) {
            this._songIndex = 0;
            this._el.src = cfg.playlist[this._songIndex];
        }
    }
});