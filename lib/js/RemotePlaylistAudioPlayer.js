/**
 * Audio Player based on the remote playlist. Playlist should be loaded from the Dropbox. It's a simple
 * json in format: {playlist: [url:String,...]}.
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
Lib.RemotePlaylistAudioPlayer = speculoos.Class({
    extend: Lib.PlaylistAudioPlayer,

    /**
     * @constructor
     * Exists only for it's parent method.
     * @param {Object} cfg Configuration of the class. Available parameters:
     *        {String} url Required. URL of the playlist.
     */
    constructor: function (cfg) {
        this.parent(arguments);
    },

    /**
     * Initializer of the class.
     */
    init: function () {
        this.parent(arguments);

        Lib.Helper.jsonp(this.cfg.url, this._onPlaylistLoaded, this);
    },

    /**
     * Calls then playlist will load it's data.
     * @param {Object} data Playlist content
     * @private
     */
    _onPlaylistLoaded: function (data) {
        if (Lib.Helper.isObject(data) && Lib.Helper.isArray(data.playlist)) {
            this.setPlaylist(data.playlist);
        }
    }
});