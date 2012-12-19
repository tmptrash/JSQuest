/**
 * This is level 4 scenario class. It controls 3d objects, user input and effects. So all logic is here.
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
App.Scenario = speculoos.Class({
    extend: Lib.Class,

    /**
     * @constructor
     * We use it only for calling constructor from super class.
     */
    constructor: function () {
        this.parent(arguments);
    },

    /**
     * @override
     */
    initPrivates: function () {
        this.parent(arguments);

        /**
         * @prop
         * {App.Terminal} Instance of the terminal we are working with.
         * @private
         */
        this._terminal      = null;
        /**
         * @prop
         * {App.Satellite} Instance of the satellite.
         * @private
         */
        this._satellite     = null;
        /**
         * @prop
         * {Number} Camera speed coefficient
         * @private
         */
        this._moveSpeed     = 0.066;
        /**
         * @prop
         * {Boolean} true if disconnection process is active at the moment
         * @private
         */
        this._disconnecting = false;
    },

    /**
     * @override
     * Main initializer. Creates a terminal and a Satellite objects.
     */
    init: function () {
        this.parent(arguments);

        this._createTerminal();
        this._createSatellite();

        //
        // Make demon effect. It works every time
        //
        this._addEffect('checkConnection', {}, this._checkConnectionEffect, undefined, false);
    },

    /**
     * Runs an application. It means that, it start the 3d animation loop and starts the terminal.
     */
    run: function () {
        this._satellite.run();
    },

    /**
     * Adds one effect to effect set. It will be run on onAnimate() method
     * @param {String} name Name of the effect
     * @param {Object} heap Local heap for this effect. Will be removed ofter it will die.
     * @param {Function} fn Callback effect method
     * @param {Object|undefined} scope Scope for fn callback
     * @param {String|Boolean|undefined} msg Message for busy state. If false - it doesn't call setBusy() method
     */
    _addEffect: function (name, heap, fn, scope, msg) {
        this._satellite.addEffect(name, heap, fn, scope || this);
        if (msg !== false) {
            this._terminal.setBusy(msg || true);
        }
    },

    /**
     * Stops specified effect. Removes it from the list of effects and set terminal to unbusy state.
     * @param {String} effect Name of the effect
     * @private
     */
    _delEffect: function (effect) {
        this._satellite.delEffect(effect);
        this._terminal.setBusy(false);
    },

    /**
     * Creates _terminal console container with 5 satellites and one console text area.
     * Set this container to this._terminal
     * @private
     */
    _createTerminal: function () {
        this._terminal = new App.Terminal({
            user: 'root',
            host: 'kepler',
            id  : Lib.Helper.getId()
        });

        //
        // TODO: All this part should be in App.Scenario class
        //
        this._terminal.on('left',       this._onLeftCmd,       this);
        this._terminal.on('right',      this._onRightCmd,      this);
        this._terminal.on('up',         this._onUpCmd,         this);
        this._terminal.on('down',       this._onDownCmd,       this);
        this._terminal.on('connect',    this._onConnectCmd,    this);
        this._terminal.on('disconnect', this._onDisconnectCmd, this);
    },

    /**
     * Creates satellite class instance and stores it in this._satellite property.
     * @private
     */
    _createSatellite: function () {
        //
        // Create singleton instance of application class
        //
        this._satellite = new App.Satellite({
            moveSpeed: this._moveSpeed
        });
    },

    /**
     * Handler of left command. It moves telescope smoothly from current position
     * to the left on distance points.
     * @param {Array} args Arguments passed to left command
     * @private
     */
    _onLeftCmd: function (args) {
        //
        // This effect will be run in this._runEffects() method.
        //
        this._addEffect('moveLeft', {distance: args[0]}, this._moveCameraLeftEffect);
    },

    /**
     * Handler of right command. It moves telescope smoothly from current position
     * to the right on x points.
     * @param {Array} args Arguments passed to right command
     * @private
     */
    _onRightCmd: function (args) {
        //
        // This effect will be run in this._runEffects() method.
        //
        this._addEffect('moveRight', {distance: args[0]}, this._moveCameraRightEffect);
    },

    /**
     * Handler of up command. It moves telescope smoothly from current position
     * upper on x points.
     * @param {Array} args Arguments passed to up command
     * @private
     */
    _onUpCmd: function (args) {
        //
        // This effect will be run in this._runEffects() method.
        //
        this._addEffect('moveUp', {distance: args[0]}, this._moveCameraUpEffect);
    },

    /**
     * Handler of down command. It moves telescope smoothly from current position
     * to the down on x points.
     * @param {Array} args Arguments passed to down command
     * @private
     */
    _onDownCmd: function (args) {
        //
        // This effect will be run in this._runEffects() method.
        //
        this._addEffect('moveDown', {distance: args[0]}, this._moveCameraDownEffect);
    },

    /**
     * Handler of connect command. It checks if the earth in a view region, then it calls
     * connect(true) method from terminal instance. Satellite names should be in format 's' + X, where 1 <= X <= 5
     * @param {Array} args Arguments passed to the command
     * @private
     */
    _onConnectCmd: function (args) {
        if (!this._satellite.earthVisible()) {
            this._terminal.console.WriteLine('Connection is not available');
            return;
        }

        this._addEffect('connect', {period: 3, timer: new THREE.Clock(true), sats: args}, this._connectEffect, this, 'Connecting...');
    },

    /**
     * Handler of disconnect command. It checks if the earth in a view region, then it calls
     * connect(false) method from terminal instance. Satellite names should be in format 's' + X, where 1 <= X <= 5
     * @param {Array} args Arguments passed to the command
     * @private
     */
    _onDisconnectCmd: function (args) {
        if (this._satellite.earthVisible() && !this._disconnecting) {
            this._disconnect(args);
        }
    },

    /**
     * Disconnects specified satellites from current
     * @param {Array|undefined} args List of satellites to disconnect or undefined for all satellites
     * @private
     */
    _disconnect: function (args) {
        this._addEffect('disconnect', {period: 3, timer: new THREE.Clock(true), sats: args}, this._disconnectEffect, this, 'Disconnecting...');
    },

    /**
     * Moves camera to the left and decrease the distance on 1. It works with the local heap's
     * property - distance.
     * @param {Object} heap Local heap for this method
     * @param {String} effect Name of current effect
     * @private
     */
    _moveCameraLeftEffect: function (heap, effect) {
        if (this._continueDistanceEffect(heap, effect)) {
            this._satellite.camera.rotation.y += this._satellite.delta * this._moveSpeed;
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
        if (this._continueDistanceEffect(heap, effect)) {
            this._satellite.camera.rotation.y -= this._satellite.delta * this._moveSpeed;
        }
    },

    /**
     * Moves camera upper and decrease the distance on 1. It works with the local heap's
     * property - distance.
     * @param {Object} heap Local heap for this method
     * @param {String} effect Name of current effect
     * @private
     */
    _moveCameraUpEffect: function (heap, effect) {
        if (this._continueDistanceEffect(heap, effect)) {
            this._satellite.camera.rotation.x += this._satellite.delta * this._moveSpeed;
        }
    },

    /**
     * Moves camera to the down and decrease the distance on 1. It works with the local heap's
     * property - distance.
     * @param {Object} heap Local heap for this method
     * @param {String} effect Name of current effect
     * @private
     */
    _moveCameraDownEffect: function (heap, effect) {
        if (this._continueDistanceEffect(heap, effect)) {
            this._satellite.camera.rotation.x -= this._satellite.delta * this._moveSpeed;
        }
    },

    /**
     * Effect of the connection to the satellites. It calls every time in onAnimate() method (on every frame).
     * @param {Object} heap Local heap for this method. It contains period property.
     * @param {String} effect Name of current effect
     * @private
     */
    _connectEffect: function (heap, effect) {
        if (!this._continueTimerEffect(heap, effect)) {
            this._terminal.connect(true, heap.sats);
        }
    },

    /**
     * Effect of the disconnection with satellites. It calls every time in onAnimate() method (on every frame).
     * @param {Object} heap Local heap for this method. It contains period property.
     * @param {String} effect Name of current effect
     * @private
     */
    _disconnectEffect: function (heap, effect) {
        if (!this._continueTimerEffect(heap, effect, true)) {
            this._terminal.connect(false, heap.sats);
            this._terminal.message('Satellites have disconnected');
            this._disconnecting = false;
        }
    },

    /**
     * Checks if the earth is visible from our satellite. If it invisible, effect will be removed (stopped)
     * @param {Object} heap Local heap for this method
     * @param {String} effect Name of current effect
     * @private
     */
    _checkConnectionEffect: function (heap, effect) {
        if (!this._satellite.earthVisible() && this._terminal.hasConnections() && !this._disconnecting && !this._terminal.isBusy()) {
            this._disconnect();
            this._disconnecting = true;
        }
    },

    /**
     * Decreases distance in a heap object and return true if distance is greater then 0, false otherwise. Main purpose
     * of this method in removing specified effect at the end of the distance. It calls every time then onAnimate() calls.
     * @param {Object} heap Reference to the heap object with distance property
     * @param {String} effect Name of current effect
     * @return {Boolean} true - means that effect should be continued, false - otherwise.
     * @private
     */
    _continueDistanceEffect: function (heap, effect) {
        if (heap.distance === 0) {
            this._delEffect(effect);
            return false;
        }
        heap.distance--;

        return true;
    },

    /**
     * Checks if started, at the moment of the effect begin, timer is expired. It uses period and start
     * properties from the heap
     * @return {Boolean} true - means that effect should be continued, false - otherwise.
     * @private
     */
    _continueTimerEffect: function (heap, effect) {
        if (heap.timer.getElapsedTime() > heap.period) {
            this._delEffect(effect);
            return false;
        }

        return true;
    }
});