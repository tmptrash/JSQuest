/**
 * This is a WebGL container class. It contains (and create if it doesn't contain) canvas tag
 * inside and all public 3D properties.
 *
 * 3D properties are:
 *     {THREE.WebGLRenderer}     renderer   Renderer object of the 3D scene.
 *     {THREE.Scene}             scene      Main scene of our world.
 *     {THREE.PerspectiveCamera} camera     Viewpoint. First view camera.
 *     {THREE.DirectionalLight}  light      Main light on the scene
 *     {Number}                  delta      Read only property. It depends on animation speed or amount of frames per second.
 *                                          It should be used in onAnimate() method as a coefficient for movement or rotation speed.
 * Configuration of the class. Available properties:
 *     {DOMElement}              parent     Parent HTML  tag for the WebGL container
 *     {Number}                  fov        Camera frustum vertical field of view
 *     {Number}                  nearView   Camera frustum near plane
 *     {Number}                  farView    Camera frustum far plane
 *     {Number}                  fogColor   Fog color in hexadecimal. Example: 0x000000 will render far away objects black
 *     {Number}                  fogDensity Defines how fast the fog will grow dense. Default is 0.00025
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
App.WebGlContainer = speculoos.Class({
    extend: Lib.Class,

    /**
     * @constructor
     */
    constructor: function () {
        if (!Detector.webgl) {
            Detector.addGetWebGLMessage();
            return this;
        }

        return App.WebGlContainer.base.constructor.apply(this, arguments);
    },

    /**
     * Creates and Initializes private fields. It's not important will these variables be
     * null or with special initial values. They must be declared here first.
     */
    initPrivates: function () {
        var me       = this;
        var isNumber = Lib.Helper.isNumber;

        App.WebGlContainer.base.initPrivates.apply(this, arguments);

       /**
        * @prop
        * {THREE.Clock} Timer object for delta coefficient.
        */
        me._clock = new THREE.Clock();

        //
        // Here we create all private fields using special configuration object. Private fields
        // will be created in format '_' + fieldName. e.g.: _parent
        //
        me.createPrivatesFromConfig({
            /**
             * {HTMLElement} Reference to parent DOM element for our container. Container will be inserted there.
             */
            parent    : [Lib.Helper.isElement, document.body],
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
     * Creates and Initializes public fields. These fields can be used in child classes. It's not important
     * will these variables be null or with special initial values. They must be declared here first.
     */
    initPublics: function () {
        var me = this;

        App.WebGlContainer.base.initPublics.apply(me, arguments);

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
         * @prop
         * {Number} Delta between animation frames in seconds. If it bigger, then objects on screen will move faster, if smaller - slower
         */
        me.delta     = 1;
    },

    /**
     * Calls after initPrivates() and initPublics() methods. Uses for class initialization. It creates fog
     * and light and adds it to the scene. It also bind an resize event to browser's window.
     */
    init: function () {
        var me = this;

        App.WebGlContainer.base.init.apply(me, arguments);

        me.scene.fog = new THREE.FogExp2(me._fogColor, me._fogDensity);
        me.scene.add(me.light);
        me.renderer.setSize(window.innerWidth, window.innerHeight);
        me.renderer.sortObjects = false;
        me.renderer.autoClear   = false;
        me._parent.appendChild(me.renderer.domElement);

        window.addEventListener('resize', function () {me.onResize.apply(me, arguments); }, false);
    },

    /**
     * Runs application. Starts 3d animation loop using requestAnimationFrame() method
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

        //
        // This is how we start next call of the onAnimate() method.
        //
        requestAnimationFrame(function () {me.onAnimate(); });
        //
        // This delta property can be used for speed correction. If current video card is fast, then
        // this
        //
        me.delta = me._clock.getDelta();
    },

    /**
     * 'resize' event handler for browser's window. We should update 3d scene after that. The scene's size
     * and camera aspect ratio will be changed also.
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
     */
    createPrivatesFromConfig: function (fields) {
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