/**
 * This is Web GL container class. It contains (and crete it) canvas tag inside and all public 3D properties, like
 * scene, camera and so on.
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
App.GlContainer = speculoos.Class({
    /**
     * ctor
     * @param {Object} cfg Configuration of the class. Available properties:
     *                 {DOMElement} parent     Parent tag for the WebGL container
     *                 {Number}     fov        Camera frustum vertical field of view
     *                 {Number}     nearView   Camera frustum near plane
     *                 {Number}     farView    Camera frustum far plane
     *                 {Number}     fogColor   Fog color in hexadecimal. Example: 0x000000 will render far away objects black
     *                 {Number}     fogDensity Defines how fast the fog will grow dense. Default is 0.00025
     */
    constructor: function (cfg) {
        if (!Detector.webgl) {
            Detector.addGetWebGLMessage();
            return this;
        }

        /**
         *
         * @type {Object}
         * @private
         */
        this.cfg = cfg || {};

        this.initPrivates(cfg);
        this.initPublics(cfg);
        this.init();

        return this;
    },

    /**
     * Creates and Initializes public fields
     * @param {Object} cfg Configuration passed to the constructor
     */
    initPrivates: function (cfg) {
        var me       = this;
        var isNumber = Helper.isNumber;

       /**
        * @prop
        * {THREE.Clock} Timer for common usage
        */
        me._clock = new THREE.Clock();

        //
        // Here we create all private fields using special configuration object. Private fields
        // will be created in format '_' + fieldName. e.g.: _parent
        //
        me.createPrivateFields({
            /**
             * {HTMLElement} Reference to parent DOM element for our container. Container will be inserted there.
             */
            parent    : [Helper.isElement, document.body],
            /**
             * {Number} Camera frustum vertical field of view
             */
            fov       : [isNumber, 45],
            /**
             * {Number} Camera frustum near plane
             */
            nearView  : [isNumber, 1],
            /**
             * {Number} Camera frustum near plane
             */
            farView   : [isNumber, 10000000],
            /**
             * @type {Number} Fog color in hexadecimal. Example: 0x000000 will render far away objects black
             */
            fogColor  : [isNumber, 0x000000],
            /**
             * @type {Number} Defines how fast the fog will grow dense. Default is 0.00000025
             */
            fogDensity: [isNumber, 0.00000025]
        });
    },

    /**
     * Creates and Initializes public fields. These fields can be used in child classes.
     * @param {Object} cfg Configuration passed to the constructor
     */
    initPublics: function (cfg) {
        var me = this;

        /**
         * @prop
         * {THREE.WebGLRenderer} WebGL renderer
         */
        me.renderer  = new THREE.WebGLRenderer({clearAlpha: 1});
        /**
         * @prop
         * {THREE.Scene} Main scene of our world
         */
        me.scene     = new THREE.Scene();
        /**
         * @prop
         * {THREE.Camera} Viewpoint. First view camera.
         */
        me.camera    = new THREE.PerspectiveCamera(me._fov, window.innerWidth / window.innerHeight, me._nearView, me._farView);
        /**
         * @prop
         * {THREE.DirectionalLight} Main light on scene
         */
        me.light     = new THREE.DirectionalLight(0xffffff);
        /**
         * Delta between animation frames. If it bigger, then objects on screen will be moved faster, if smaller - slower
         * @type {Number}
         */
        me.delta     = 1;
    },

    /**
     * Calls after initPrivates() and initPublics() methods. Uses for logic initialization of the instance.
     */
    init: function () {
        var me = this;

        me.scene.fog = new THREE.FogExp2(me._fogColor, me._fogDensity);
        me.scene.add(me.light);
        me.renderer.setSize(window.innerWidth, window.innerHeight);
        me.renderer.sortObjects = false;
        me.renderer.autoClear   = false;
        me._parent.appendChild(me.renderer.domElement);
        window.addEventListener('resize', function () {me.onResize.apply(me, arguments); }, false);
    },

    /**
     * Runs application. Starts 3d animation
     */
    run: function () {
        this.onAnimate();
    },

    /**
     * Calls every time, then current frame of 3d animation is drawing. This is main method for update
     * 3d objects in the scene.
     */
    onAnimate: function () {
        var me = this;

        requestAnimationFrame(function () {me.onAnimate(); });
        me.delta = me._clock.getDelta();
    },

    /**
     * resize event handler for browser's window. We should update 3d objects after that.
     */
    onResize: function () {
        var me = this;

        me.renderer.setSize(window.innerWidth, window.innerHeight);
        me.camera.aspect = window.innerWidth / window.innerHeight;
        me.camera.updateProjectionMatrix();
    },

    /**
     * Creates property within current instance and point it to the one from configuration
     * @param {Object} fields Fields configuration of this class in format {fieldName: [convertFn, defValue], ...}
     * @private
     */
    createPrivateFields: function (fields) {
        var cfg = this.cfg;
        var f;
        var prop;

        for (f in fields) {
            if (fields.hasOwnProperty(f)) {
                prop = fields[f];
                this['_' + f] = prop[0](cfg[f]) ? cfg[f] : prop[1];
            }
        }
    }
});