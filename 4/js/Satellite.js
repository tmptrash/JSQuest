/**
 * Satellite class. It shows dark sky with the start, the earth and a console for telescope control.
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
App.Satellite = speculoos.Class({
    /**
     * ctor.
     */
    constructor: function () {
        this._radius      = cfg.radius || 6371;
        var tilt          = 0.41;
        var rotationSpeed = 0.007;

        var cloudsScale   = 1.009;
        var moonScale     = 0.23;
    }
});