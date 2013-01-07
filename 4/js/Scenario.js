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
     * We use it only for calling constructor from super class. Parent class will not be called without this.
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
        this._terminal        = null;
        /**
         * @prop
         * {App.Universe} Instance of the the universe class.
         * @private
         */
        this._universe        = null;
        /**
         * @prop
         * {Number} Camera speed coefficient
         * @private
         */
        this._moveSpeed       = 0.066;
        /**
         * @prop
         * {Boolean} true if disconnection process is active at the moment
         * @private
         */
        this._disconnecting   = false;
        /**
         * @prop
         * {App.DatabaseManager} Instance of App.DatabaseManager class. It contains all available databases (files)
         * for the local satellite.
         * @private
         */
        this._databaseManager = null;
    },

    /**
     * @override
     * Main initializer. Creates a terminal and a Universe objects.
     */
    init: function () {
        this.parent(arguments);

        this._createUniverse();
        this._createTerminal();
        this._createDatabaseManager();

        //
        // Make demon effect. It works every time
        //
        this._addEffect('checkConnection', {}, this._checkConnectionEffect, undefined, false);
    },

    /**
     * Runs an application. It means that, it start the 3d animation loop and starts the terminal.
     */
    run: function () {
        this._universe.run();
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
        this._universe.addEffect(name, heap, fn, scope || this);
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
        this._universe.delEffect(effect);
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

        this._terminal.on('left',       this._onLeftCmd,       this);
        this._terminal.on('right',      this._onRightCmd,      this);
        this._terminal.on('up',         this._onUpCmd,         this);
        this._terminal.on('down',       this._onDownCmd,       this);
        this._terminal.on('connect',    this._onConnectCmd,    this);
        this._terminal.on('disconnect', this._onDisconnectCmd, this);
        this._terminal.on('list',       this._onListCmd,       this);
        this._terminal.on('remove',     this._onRemoveCmd,     this);
        this._terminal.on('sync',       this._onSyncCmd,       this);
        this._terminal.on('pack',       this._onPackCmd,       this);
        this._terminal.on('unpack',     this._onUnpackCmd,     this);
        this._terminal.on('encrypt',    this._onEncryptCmd,    this);
        this._terminal.on('decrypt',    this._onDecryptCmd,    this);
        this._terminal.on('info',       this._onInfoCmd,       this);
    },

    /**
     * Creates database manager. It contains all available databases (files) for the local satellite. We should
     * manage all these databases (files) through this instance.
     * @private
     */
    _createDatabaseManager: function () {
        this._databaseManager = new App.DatabaseManager();

        this._databaseManager.on('empty', this._onFinishQuest, this);
        this._databaseManager.on('log', this._onDatabaseManagerLog, this);
    },

    /**
     * Creates Universe class instance and stores it in this._universe property.
     * @private
     */
    _createUniverse: function () {
        //
        // Create singleton instance of application class
        //
        this._universe = new App.Universe({
            moveSpeed: this._moveSpeed
        });
    },

    /**
     * Calls, then all databases (files) will be deleted from the local satellite and all remote satellites also.
     * It means, that our quest is over :(
     * @private
     */
    _onFinishQuest: function () {
        // TODO:
        alert('The quest has finished!!!');
    },

    /**
     * Handles log event of the terminal
     * @param {String} msg Log message
     * @private
     */
    _onDatabaseManagerLog: function (msg) {
        this._terminal.message(msg);
    },

    /**
     * Handler of left command. It moves camera smoothly from current position
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
     * Handler of right command. It moves camera smoothly from current position
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
     * Handler of up command. It moves camera smoothly from current position
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
     * Handler of down command. It moves camera smoothly from current position
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
        if (!this._universe.earthVisible()) {
            this._terminal.console.WriteLine(_('Connection is not available'));
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
        if (!this._universe.earthVisible()) {
            this._terminal.console.WriteLine(_('Nothing to disconnect.'));
            return;
        }
        if (this._disconnecting) {
            this._terminal.console.WriteLine(_('Disconnecting is steel in progress. Please wait for some time.'));
            return;
        }

        this._disconnect(args);
    },

    /**
     * list command handler. Lists all available databases for current satellite.
     * @private
     */
    _onListCmd: function () {
        var list   = this._databaseManager.list();
        var dim    = this._databaseManager.getDimension();
        var pad    = Lib.Helper.pad;
        var output = '';
        var l;

        for (l in list) {
            if (list.hasOwnProperty(l)) {
                //
                // e.g.: facebook - 12356774 Gb
                //
                output += ((output !== '' ? '\n' : '') + (pad(l, 12) + list[l].size + ' ' + dim));
            }
        }
        this._terminal.console.WriteLine(output);
    },

    /**
     * remove command handler. Creates 7 second waiting effect and calls App.DatabaseManager.remove() method after it.
     * @param {Array} args Array of databases (files) to remove
     * @private
     */
    _onRemoveCmd: function (args) {
        this._addEffect('remove', {period: 7, timer: new THREE.Clock(true), files: args}, this._removeEffect);
    },

    /**
     * sync command handler. Creates 12 second waiting effect and calls App.DatabaseManager.sync() method after it.
     * @param {Array} args Array of satellite names
     * @private
     */
    _onSyncCmd: function (args) {
        if (!this._universe.earthVisible()) {
            this._terminal.console.WriteLine(_('Synchronization is not available. Satellites hasn\'t connected.'));
            return;
        }
        if (!this._terminal.hasConnections(args)) {
            this._terminal.console.WriteLine(_('Synchronization is not available. Some of the satellites hasn\'t connected.'));
            return;
        }

        this._addEffect('sync', {period: 12, timer: new THREE.Clock(true), sats: args}, this._syncEffect, undefined, 'Synchronizing...');
    },

    /**
     * pack command handler. Creates 8 second waiting effect and calls App.DatabaseManager.pack() method after it.
     * @param {Array} args Array of databases to pack
     * @private
     */
    _onPackCmd: function (args) {
        this._addEffect('pack', {period: 8, timer: new THREE.Clock(true), files: args}, this._packEffect);
    },

    /**
     * unpack command handler. Creates 4 second waiting effect and calls App.DatabaseManager.unpack() method after it.
     * @param {Array} args Array of databases to unpack
     * @private
     */
    _onUnpackCmd: function (args) {
        this._addEffect('unpack', {period: 4, timer: new THREE.Clock(true), files: args}, this._unpackEffect);
    },

    /**
     * encrypt command handler. Creates 9 second waiting effect and calls App.DatabaseManager.encrypt() method after it.
     * @param {Array} args Array of two elements: database (files) name and the key
     * @private
     */
    _onEncryptCmd: function (args) {
        this._addEffect('encrypt', {period: 9, timer: new THREE.Clock(true), file: args[0], key: args[1]}, this._encryptEffect);
    },

    /**
     * decrypt command handler. Creates 6 second waiting effect and calls App.DatabaseManager.encrypt() method after it.
     * @param {Array} args Array of two elements: database (files) name and the key
     * @private
     */
    _onDecryptCmd: function (args) {
        this._addEffect('decrypt', {period: 6, timer: new THREE.Clock(true), file: args[0], key: args[1]}, this._decryptEffect);
    },

    /**
     * info command handler. Shows general information message.
     * @private
     */
    _onInfoCmd: function () {
        //
        // We use array only for readability
        //
        var msg = [
            _('Welcome to Kepler v1.0\n\nThis is satellite database management terminal. It manages databases placed on different satellites in real time. '),
            _('There are five available satellites for now and they are marked from s1 to s5. You can use these names in commands. '),
            _('For example: connect s2 - will connect this satellite and the s2. Every database is in the file. You can remove, pack, '),
            _('encrypt, list and synchronize these files manually in real time (see "help" command for details).\n\nAlso, this satellite has '),
            _('an analog camera and the signal transmitter. You can rotate this camera using simple interface (see "help" command for details) and use '),
            _('the transmitter to communicate with other satellites.')
        ];
        this._terminal.console.WriteLine(msg.join(''));
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
            this._universe.camera.rotation.y += this._universe.delta * this._moveSpeed;
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
            this._universe.camera.rotation.y -= this._universe.delta * this._moveSpeed;
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
            this._universe.camera.rotation.x += this._universe.delta * this._moveSpeed;
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
            this._universe.camera.rotation.x -= this._universe.delta * this._moveSpeed;
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
     * Effect of the databases remove. It calls every time in onAnimate() method (on every frame).
     * @param {Object} heap Local heap for this method. It contains period property.
     * @param {String} effect Name of current effect
     * @private
     */
    _removeEffect: function (heap, effect) {
        if (!this._continueTimerEffect(heap, effect)) {
            this._databaseManager.remove(heap.files);
        }
    },

    /**
     * Effect of the satellites sync. It calls every time in onAnimate() method (on every frame).
     * @param {Object} heap Local heap for this method. It contains period property.
     * @param {String} effect Name of current effect
     * @private
     */
    _syncEffect: function (heap, effect) {
        if (!this._continueTimerEffect(heap, effect)) {
            this._databaseManager.sync(heap.sats);
        }
    },

    /**
     * Effect of database packing. It calls every time in onAnimate() method (on every frame).
     * @param {Object} heap Local heap for this method. It contains period property.
     * @param {String} effect Name of current effect
     * @private
     */
    _packEffect: function (heap, effect) {
        if (!this._continueTimerEffect(heap, effect)) {
            this._databaseManager.pack(heap.files);
        }
    },

    /**
     * Effect of database unpacking. It calls every time in onAnimate() method (on every frame).
     * @param {Object} heap Local heap for this method. It contains period property.
     * @param {String} effect Name of current effect
     * @private
     */
    _unpackEffect: function (heap, effect) {
        if (!this._continueTimerEffect(heap, effect)) {
            this._databaseManager.unpack(heap.files);
        }
    },

    /**
     * Effect of database encrypting. It calls every time in onAnimate() method (on every frame).
     * @param {Object} heap Local heap for this method. It contains period property.
     * @param {String} effect Name of current effect
     * @private
     */
    _encryptEffect: function (heap, effect) {
        if (!this._continueTimerEffect(heap, effect)) {
            this._databaseManager.encrypt(heap.file, heap.key);
        }
    },

    /**
     * Effect of database decrypting. It calls every time in onAnimate() method (on every frame).
     * @param {Object} heap Local heap for this method. It contains period property.
     * @param {String} effect Name of current effect
     * @private
     */
    _decryptEffect: function (heap, effect) {
        if (!this._continueTimerEffect(heap, effect)) {
            this._databaseManager.decrypt(heap.file, heap.key);
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
            this._terminal.message(_('Satellites have disconnected'));
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
        if (!this._universe.earthVisible() && this._terminal.hasConnections() && !this._disconnecting && !this._terminal.isBusy()) {
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