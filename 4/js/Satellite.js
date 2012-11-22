/**
 * Satellite class. It shows universe with the stars, the earth and a console for telescope control. It also
 * contains all internal logic of last level.
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
App.Satellite = speculoos.Class({
    extends: App.GlContainer,

    /**
     * ctor.
     * {Object} cfg Configuration object of class. Arguments:
     *          {Number} radius         Earth radius
     *          {Number} tilt           Earth tilt
     *          {Number} rotationRadius Rotation radius of earth
     *          {Number} cloudsScale    Clouds scale
     *          {Number} moonScale      Moon scale
     */
    constructor: function (cfg) {
        // TODO: do we nned for this ctor?
        App.Satellite.super.constructor.call(cfg);
    },

    /**
     * Private fields creator and initializer
     */
    initPrivates: function () {
        var isNumber = Helper.isNumber;

        this.createPrivateFields({
            radius       : [isNumber, 6371 ],
            tilt         : [isNumber, 0.41 ],
            rotationSpeed: [isNumber, 0.007],
            cloudsScale  : [isNumber, 1.009],
            moonScale    : [isNumber, 0.23 ]
        });
    },

    /**
     * Public fields creator and initializer
     */
    initPublics: function () {
        // TODO:
//        var sceneCube;
//        var geometry, meshPlanet, meshClouds, meshMoon;
//        var dirLight, pointLight, ambientLight;
    },

    /**
     * Calls every time, then current frame of 3d animation is drawing. This is main method for update
     * 3d objects in the scene.
     */
    onAnimate: function () {
        // TODO:
        App.Satellite.super.onAnimate.call(this);
    },

    /**
     * Calls after onAnimate() method. Uses for
     */
    onAfterAnimate: function () {
        // TODO:
        App.Satellite.super.onAfterAnimate.call(this);
    }
});