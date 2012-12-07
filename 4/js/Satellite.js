/**
 * Satellite class. It shows universe with the stars, the earth and a console for telescope control. It also
 * contains all internal logic of last level.
 *
 * {Object} Configuration object of class:
 *          {Number} radius         Earth radius
 *          {Number} tilt           Earth tilt
 *          {Number} rotationRadius Rotation radius of earth
 *          {Number} cloudsScale    Clouds scale
 *          {Number} moonScale      Moon scale
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
App.Satellite = speculoos.Class({
    extend: App.WebGlContainer,

    /**
     * ctor
     * We use it only for calling constructor from super class.
     */
    constructor: function (cfg) {
        App.Satellite.base.constructor.call(this, cfg);
    },

    /**
     * Private fields creator and initializer. It's not important will these variables be
     * null or with special initial values. They must be declared here first.
     */
    initPrivates: function () {
        App.Satellite.base.initPrivates.apply(this, arguments);

        var isNumber  = Lib.Helper.isNumber;

        /**
         * @prop
         * {HTMLElement} HTML element of the terminal <div> tag
         * @private
         */
        this._terminal  = null;
        /**
         * @prop
         * {Number} Camera radius. Distance from the telescope to the earth. In range 2..50
         * TODO: remove this. We use camera.fov for zooming.
         * @private
         */
        this._cameraRadius = 200;
        /**
         * @const
         * {Array} Minimum and maximum in zooming
         * @private
         */
        this._zoomRange = [5, 60];
        /**
         * @prop
         * {Object} Map of custom effect objects in format: {effect: {fn:Function, obj:Object},...}.
         * Effect examples: smooth camera moving of zooming. Functions should be from this class.
         * @private
         */
        this._effects   = {};

        //
        // Parameters, created from configuration
        //
        this.createPrivatesFromConfig({
            /**
             * {Number} Earth radius
             */
            radius       : [isNumber, 6371 ],
            /**
             * {Number} Start angle of the earth
             */
            tilt         : [isNumber, 0.41 ],
            /**
             * {Number} Speed of rotation
             */
            rotationSpeed: [isNumber, 0.007],
            /**
             * {Number} Scale for clouds
             */
            cloudsScale  : [isNumber, 1.009],
            /**
             * {Number} Scale for the moon
             */
            moonScale    : [isNumber, 0.23 ],
            /**
             * {Number} Speed of zooming
             */
            zoomSpeed    : [isNumber, 5    ]
        });
    },

    /**
     * Public fields creator and initializer. It's not important will these variables be
     * null or with special initial values. They must be declared here first.
     */
    initPublics: function () {
        App.Satellite.base.initPublics.apply(this, arguments);

        /**
         * @prop
         * {THREE.SphereGeometry} Geometry for all spheres on the scene
         */
        this.sphereGeometry = null;
        /**
         * @prop
         * {THREE.Mesh} Mesh of earth
         */
        this.meshPlanet     = null;
        /**
         * @prop
         * {THREE.Mesh} Mesh of clouds
         */
        this.meshClouds     = null;
        /**
         * @prop
         * {THREE.Mesh} Mesh of the moon
         */
        this.meshMoon       = null;
        /**
         * @prop
         * {THREE.EffectComposer}
         */
        this.composer       = null;
        /**
         * @prop
         * {Number} Rotation angle of the main camera
         */
        this.cameraAngle    = 0;
    },

    /**
     * Calls after initPrivates() and initPublics() methods. Uses for logic initialization of the instance.
     * It also positions camera, 3d objects and light on the scene before it will be shown.
     */
    init: function () {
        App.Satellite.base.init.apply(this, arguments);

        this.camera.position.z = this._radius * this._cameraRadius; // Camera
        this.light.position.set(-1, 0, 1).normalize();      // Light
        this._createSpheresGeometry();                      // Spheres geometry
        this._createPlanetMesh();                           // Earth
        this._createCloudsMesh();                           // Clouds
        this._createMoonMesh();                             // Moon
        this._createStars();                                // Stars
        this._postprocess();                                // Analog camera effect
        this._createTerminal();                             // Satellite's terminal console
    },

    /**
     * Calls every time, then current frame of 3d animation is drawing. This is main method for update
     * 3d objects in the scene.
     */
    onAnimate: function () {
        App.Satellite.base.onAnimate.call(this);

        this._moveObjects();
        this._moveCamera();
        this._runEffects();

        //
        // Updates current frame
        //
        this.renderer.clear();
        this.composer.render(this.delta);
    },

    /**
     * Rotates main objects on the scene
     * @private
     */
    _moveObjects: function () {
        //
        // Rotates the earth and clouds
        //
        this.meshPlanet.rotation.y += this._rotationSpeed * this.delta;
        this.meshClouds.rotation.y += this._rotationSpeed * this.delta;
    },

    /**
     * Rotates main camera
     * @private
     */
    _moveCamera: function () {
        var camera = this.camera;

        //
        // Rotates the camera
        //
        this.cameraAngle += Math.PI / 360 * this.delta;
        camera.position.x = this._radius * this._cameraRadius * Math.cos(this.cameraAngle);
        camera.position.z = this._radius * this._cameraRadius * Math.sin(this.cameraAngle);
        // TODO:
        camera.lookAt(this.meshPlanet.position);
    },

    /**
     * Runs custom effects for current frame. E.g. smooth camera moving or zooming.
     * It run all effects from this._effects array. Effects format: {effect: {fn:Function, obj:Object},...}
     * @private
     */
    _runEffects: function () {
        var effects = this._effects;
        var i;

        for (i in effects) {
            if (effects.hasOwnProperty(i)) {
                effects[i].fn.call(this, effects[i].heap, i);
            }
        }
    },

    /**
     * Creates spheres(earth, moon, clouds) geometry
     * @private
     */
    _createSpheresGeometry: function () {
        this.sphereGeometry = new THREE.SphereGeometry(this._radius, 100, 50);
        this.sphereGeometry.computeTangents();
    },

    /**
     * Returns mash of the earth and adds it to the scene.
     * @private
     */
    _createPlanetMesh: function () {
        // TODO: move textures to the dropbox
        // TODO: set textures size
        var planetTexture   = THREE.ImageUtils.loadTexture("textures/planets/earth_atmos_2048.jpg");
        var normalTexture   = THREE.ImageUtils.loadTexture("textures/planets/earth_normal_2048.jpg");
        var specularTexture = THREE.ImageUtils.loadTexture("textures/planets/earth_specular_2048.jpg");
        var shader          = THREE.ShaderUtils.lib.normal;
        var uniforms        = THREE.UniformsUtils.clone(shader.uniforms);
        var parameters;
        var materialNormalMap;

        uniforms.tNormal.value        = normalTexture;
        uniforms.uNormalScale.value.set(0.85, 0.85);
        uniforms.tDiffuse.value       = planetTexture;
        uniforms.tSpecular.value      = specularTexture;
        uniforms.enableAO.value       = false;
        uniforms.enableDiffuse.value  = true;
        uniforms.enableSpecular.value = true;
        uniforms.uDiffuseColor.value.setHex(0xffffff);
        uniforms.uSpecularColor.value.setHex(0x333333);
        uniforms.uAmbientColor.value.setHex(0x000000);
        uniforms.uShininess.value     = 15;
        parameters                    = {
            fragmentShader: shader.fragmentShader,
            vertexShader  : shader.vertexShader,
            uniforms      : uniforms,
            lights        : true,
            fog           : true
        };
        materialNormalMap             = new THREE.ShaderMaterial(parameters);

        this.meshPlanet               = new THREE.Mesh(this.sphereGeometry, materialNormalMap);
        this.meshPlanet.rotation.y    = 0;
        this.meshPlanet.rotation.z    = this._tilt;

        this.scene.add(this.meshPlanet);
    },

    /**
     * Creates clouds mesh and adds it to the scene.
     * @private
     */
    _createCloudsMesh: function () {
        // TODO: move textures to the dropbox
        var cloudsTexture  = THREE.ImageUtils.loadTexture("textures/planets/earth_clouds_1024.png");
        var materialClouds = new THREE.MeshLambertMaterial({color: 0xffffff, map: cloudsTexture, transparent: true});

        this.meshClouds = new THREE.Mesh(this.sphereGeometry, materialClouds);
        this.meshClouds.scale.set(this._cloudsScale, this._cloudsScale, this._cloudsScale);
        this.meshClouds.rotation.z = this._tilt;
        this.scene.add(this.meshClouds);
    },
  
    /**
     * Creates moon mesh and adds it to the scene.
     * @private
     */
    _createMoonMesh: function () {
        var moonTexture  = THREE.ImageUtils.loadTexture("textures/planets/moon_1024.jpg");
        var materialMoon = new THREE.MeshPhongMaterial({color: 0xffffff, map: moonTexture});

        this.meshMoon = new THREE.Mesh(this.sphereGeometry, materialMoon);
        this.meshMoon.position.set(this._radius * 5, 0, 0);
        this.meshMoon.scale.set(this._moonScale, this._moonScale, this._moonScale);
        this.scene.add(this.meshMoon);
    },

    /**
     * Creates stars and adds it to the scene.
     * @private
     */
    _createStars: function () {
        var i;
        var r             = this._radius;
        var starsGeometry = [new THREE.Geometry(), new THREE.Geometry()];
        var vertex;
        var stars;
        var starsMaterials;
        var s;

        for (i = 0; i < 250; i++) {
            vertex = new THREE.Vector3();
            vertex.x = Math.random() * 2 - 1;
            vertex.y = Math.random() * 2 - 1;
            vertex.z = Math.random() * 2 - 1;
            vertex.multiplyScalar(r);
            starsGeometry[0].vertices.push(vertex);
        }

        for (i = 0; i < 1500; i++) {
            vertex = new THREE.Vector3();
            vertex.x = Math.random() * 2 - 1;
            vertex.y = Math.random() * 2 - 1;
            vertex.z = Math.random() * 2 - 1;
            vertex.multiplyScalar(r);
            starsGeometry[1].vertices.push(vertex);
        }

        starsMaterials = [
            new THREE.ParticleBasicMaterial({color: 0xBBBBBB, size: 1, sizeAttenuation: false}),
            new THREE.ParticleBasicMaterial({color: 0xAAAAAA, size: 1, sizeAttenuation: false}),
            new THREE.ParticleBasicMaterial({color: 0x999999, size: 1, sizeAttenuation: false}),
            new THREE.ParticleBasicMaterial({color: 0x777777, size: 1, sizeAttenuation: false}),
            new THREE.ParticleBasicMaterial({color: 0x555555, size: 1, sizeAttenuation: false}),
            new THREE.ParticleBasicMaterial({color: 0x111111, size: 1, sizeAttenuation: false})
        ];

        for (i = 10; i < 30; i++) {
            stars = new THREE.ParticleSystem(starsGeometry[i % 2], starsMaterials[i % 6]);
            stars.rotation.x = Math.random() * 6;
            stars.rotation.y = Math.random() * 6;
            stars.rotation.z = Math.random() * 6;
            s = i * 50;
            stars.scale.set(s, s, s);
            stars.matrixAutoUpdate = false;
            stars.updateMatrix();
            this.scene.add(stars);
        }
    },

    /**
     * Makes postprocessing. Adds movie effect to the scene.
     * @private
     */
    _postprocess: function () {
        var renderModel = new THREE.RenderPass(this.scene, this.camera);
        var effectFilm  = new THREE.FilmPass(0.35, 0.75, 2048, false);

        effectFilm.renderToScreen = true;
        this.composer = new THREE.EffectComposer(this.renderer);

        this.composer.addPass(renderModel);
        this.composer.addPass(effectFilm);
    },

    /**
     * Creates terminal console container with 5 satellites and one console text area.
     * Set this container to this._terminal
     * @private
     */
    _createTerminal: function () {
        this._terminal = new App.Terminal({
            user: 'root',
            host: 'kepler'
        });
        this._terminal.on('left', this._onLeftCmd, this);
        this._terminal.on('right', this._onRightCmd, this);
        this._terminal.on('zoom', this._onZoomCmd, this);
    },

    /**
     * Handler of left command. It moves telescope smoothly from current position
     * to the left on distance points.
     * @param {Array} args Arguments passed to zoom command
     * @private
     */
    _onLeftCmd: function (args) {
        //
        // This effect will be run in this._runEffects() method.
        //
        this._effects.moveLeft = {fn: this._moveCameraLeftEffect, heap: {distance: args[0]}};
    },

    /**
     * Handler of right command. It moves telescope smoothly from current position
     * to the right on x points.
     * @param {Array} args Arguments passed to zoom command
     * @private
     */
    _onRightCmd: function (args) {
        //
        // This effect will be run in this._runEffects() method.
        //
        this._effects.moveRight = {fn: this._moveCameraRightEffect, heap: {distance: args[0]}};
    },

    /**
     * Handler of zoom command. It zooms telescope smoothly.
     * @param {Array} args Arguments passed to zoom command
     * @private
     */
    _onZoomCmd: function (args) {
        var zoom   = args[0];
        var fov    = this.camera.fov;
        var endFov = this._zoomRange[1] - zoom;
        var inc;

        //
        // zoom value must be in our range
        //
        zoom = Math.min(zoom, this._zoomRange[1]);
        zoom = Math.max(zoom, this._zoomRange[0]);

        if (fov < endFov) {
            inc = 5;
        } else {
            inc = -5;
        }
        //
        // This effect will be run in this._runEffects() method.
        //
        this._effects.zoom = {fn: this._zoomCameraEffect, heap: {fov: endFov.toFixed(), inc: inc}};
    },

    /**
     * Moves camera to the left and decrease the distance on 1. It works with the local heap's
     * property - distance.
     * @param {Object} heap Local heap for this method
     * @param {String} effect Name of current effect
     * @private
     */
    _moveCameraLeftEffect: function (heap, effect) {
        if (this._decreaseDistance(heap, effect)) {
            this.camera.rotation.y += this.delta / 15; // TODO: why 15
        }
    },

    /**
     * Moves camera to the right and decrease the distance on 1. It works with the local heap's
     * property - distance.
     * @param {Object} heap Local heap for this method
     * @param {String} effect Name of current effect
     * @private
     */
    _moveCameraRightEffect: function (heap, effect) {
        if (this._decreaseDistance(heap, effect)) {
            this.camera.rotation.y -= this.delta / 15; // TODO: why 15
        }
    },

    /**
     * Zooms camera and decreases the distance on 1. It works with the local heap's
     * property - distance.
     * @param {Object} heap Local heap for this method
     * @param {String} effect Name of current effect
     * @private
     */
    _zoomCameraEffect: function (heap, effect) {
        if (this.camera.fov.toFixed() === heap.fov) {
            delete this._effects[effect];
            return;
        }

        this.camera.fov += this.delta * heap.inc;
        this.camera.updateProjectionMatrix();
        console.log(this.camera.fov);
    },

    /**
     * Decreases distance in a heap object and return true if distance is greater then 0, false otherwise. Main purpose
     * of this method in removing specified effect at the end of the distance. It calls every time then onAnimate() calls.
     * @param {Object} heap Reference to the heap object with distance property
     * @param {String} effect Name of current effect
     * @return {Boolean}
     * @private
     */
    _decreaseDistance: function (heap, effect) {
        if (heap.distance < 0) {
            delete this._effects[effect];
        } else {
            heap.distance--;
        }

        return heap.distance > 0;
    }
});