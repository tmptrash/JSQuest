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
        // TODO: do we need for this ctor?
        App.Satellite.super.constructor.call(this, cfg);
    },

    /**
     * Private fields creator and initializer
     */
    initPrivates: function () {
        App.Satellite.super.initPrivates.apply(this, arguments);

        var isNumber = Helper.isNumber;

        this.createPrivateFields({
            // TODO: add comments
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
        App.Satellite.super.initPublics.apply(this, arguments);

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
    },

    /**
     * Calls after initPrivates() and initPublics() methods. Uses for logic initialization of the instance.
     */
    init: function () {
        App.Satellite.super.init.apply(this, arguments);

        this.camera.position.z = this._radius * 6.0;   // Camera
        this.light.position.set(-1, 0, 1).normalize(); // Light
        this._createSpheresGeometry();                 // Spheres geometry
        this._createPlanetMesh();                      // Earth
        this._createCloudsMesh();                      // Clouds
        this._createMoonMesh();                        // Moon
        this._createStars();                           // Stars
        this._postprocess();                           // Analog camera effect
    },

    /**
     * Calls every time, then current frame of 3d animation is drawing. This is main method for update
     * 3d objects in the scene.
     */
    onAnimate: function () {
        // TODO:
        App.Satellite.super.onAnimate.call(this);

        this.meshPlanet.rotation.y += this._rotationSpeed * this.delta;
        this.meshClouds.rotation.y += 1.25 * this._rotationSpeed * this.delta;
    },

    /**
     * Calls after onAnimate() method. Uses for
     */
    onAfterAnimate: function () {
        // TODO:
        App.Satellite.super.onAfterAnimate.call(this);
        this.composer.render(this.delta);
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
        // TODO: set textures size
        var planetTexture   = THREE.ImageUtils.loadTexture("textures/planets/earth_atmos_4096.jpg");
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
            new THREE.ParticleBasicMaterial({color: 0x555555, size: 2, sizeAttenuation: false}),
            new THREE.ParticleBasicMaterial({color: 0x555555, size: 1, sizeAttenuation: false}),
            new THREE.ParticleBasicMaterial({color: 0x333333, size: 2, sizeAttenuation: false}),
            new THREE.ParticleBasicMaterial({color: 0x3a3a3a, size: 1, sizeAttenuation: false}),
            new THREE.ParticleBasicMaterial({color: 0x1a1a1a, size: 2, sizeAttenuation: false}),
            new THREE.ParticleBasicMaterial({color: 0x1a1a1a, size: 1, sizeAttenuation: false})
        ];

        for (i = 10; i < 30; i++) {
            stars = new THREE.ParticleSystem(starsGeometry[i % 2], starsMaterials[i % 6]);
            stars.rotation.x = Math.random() * 6;
            stars.rotation.y = Math.random() * 6;
            stars.rotation.z = Math.random() * 6;
            s = i * 10;
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
        this.composer = new THREE.EffectComposer(renderer);

        this.composer.addPass(renderModel);
        this.composer.addPass(effectFilm);
    }
});