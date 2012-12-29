/**
 * Universe class. It shows universe with the stars, the earth and a console for camera control. It doesn't
 * contain all internal logic of last level. So this class is only a container for 3d objects and the console.
 * It doesn't contain logic or movements of these 3d objects. It works like a 3d container.
 *
 * {Object} Configuration object of class:
 *          {Number} radius         Earth radius
 *          {Number} tilt           Earth tilt
 *          {Number} rotationRadius Rotation radius of earth
 *          {Number} cloudsScale    Clouds scale
 *          {Number} moonScale      Moon scale
 *          {Number} moveSpeed      Camera speed coefficient
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
App.Universe = speculoos.Class({
    extend: App.WebGlContainer,

    /**
     * @constructor
     * We use it only for calling constructor from super class.
     */
    constructor: function () {
        this.parent(arguments);
    },

    /**
     * @override
     * Private fields creator and initializer. It's not important will these variables be
     * null or with special initial values. They must be declared here first.
     */
    initPrivates: function () {
        this.parent(arguments);

        var isNumber        = Lib.Helper.isNumber;

        /**
         * @prop
         * {Number} Camera radius. Distance from the camera to the earth. In range 2..50
         * TODO: remove this. We use camera.fov for zooming.
         * @private
         */
        this._zoom          = 3;
        /**
         * @prop
         * {Object} Map of custom effect objects in format: {effect: {fn:Function, obj:Object},...}.
         * Effect examples: smooth camera moving of zooming. Functions should be from this class.
         * @private
         */
        this._effects       = {};
        /**
         * @prop
         * {THREE.Frustum} View zone of the camera
         * @private
         */
        this._frustum       = new THREE.Frustum();
        /**
         * @prop
         * {THREE.Matrix4} Helper matrix for checks if object is in visible zone
         * @private
         */
        this._frustumMat    = new THREE.Matrix4();

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
             * {Number} Speed of the camera
             */
            moveSpeed    : [isNumber, 0.066]
        });
    },

    /**
     * @override
     * Public fields creator and initializer. It's not important will these variables be
     * null or with special initial values. They must be declared here first.
     */
    initPublics: function () {
        this.parent(arguments);

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
        /**
         * @prop
         * {App.Terminal} Terminal class instance
         */
        this.terminal       = null;
    },

    /**
     * @override
     * Calls after initPrivates() and initPublics() methods. Uses for logic initialization of the instance.
     * It also positions camera, 3d objects and light on the scene before it will be shown.
     */
    init: function () {
        this.parent(arguments);

        this.camera.position.z = this._radius * this._zoom; // Camera
        this.light.position.set(-1, 0, 1).normalize();      // Light
        this._createSpheresGeometry();                      // Spheres geometry
        this._createPlanetMesh();                           // Earth
        this._createCloudsMesh();                           // Clouds
        this._createMoonMesh();                             // Moon
        this._createStars();                                // Stars
        this._postprocess();                                // Analog camera effect
    },

    /**
     * @override
     * Calls every time, then current frame of 3d animation is drawing. This is main method for update
     * 3d objects in the scene.
     */
    onAnimate: function () {
        this.parent(arguments);

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
     * Adds one effect to effect set. It will be run on onAnimate() method
     * @param {String} name Name of the effect
     * @param {Object} heap Local heap for this effect. Will be removed ofter it will die.
     * @param {Function} fn Callback effect method
     * @param {Object|undefined} scope Scope for fn callback
     */
    addEffect: function (name, heap, fn, scope) {
        this._effects[name] = {
            fn   : fn,
            scope: scope,
            heap : heap
        };
    },

    /**
     * Stops specified effect. Removes it from the list of effects and set terminal to unbusy state.
     * @param {String} effect Name of the effect
     * @private
     */
    delEffect: function (effect) {
        delete this._effects[effect];
    },

    /**
     * Return true if the earth is visible. It means that the earth are before the camera. The solution was found
     * at https://github.com/mrdoob/three.js/issues/1209
     * @return {Boolean}
     * @private
     */
    earthVisible: function () {
        this._frustum.setFromMatrix(this._frustumMat.multiply(this.camera.projectionMatrix, this.camera.matrixWorldInverse));
        return this._frustum.contains(this.meshPlanet);
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
        this.cameraAngle += Math.PI / 360 * this.delta / 2;
        camera.position.x = this._radius * this._zoom * Math.cos(this.cameraAngle);
        camera.position.z = this._radius * this._zoom * Math.sin(this.cameraAngle);
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
                effects[i].fn.call(effects[i].scope || this, effects[i].heap, i);
            }
        }
    },

    /**
     * Creates spheres(earth, moon, clouds) geometry
     * @private
     */
    _createSpheresGeometry: function () {
        this.sphereGeometry = new THREE.SphereGeometry(this._radius, 100, 100);
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
    }
});