/**
 * Satellite's camera console. It contains console commands for moving and zooming camera and
 * managing of huge databases between similar satellites. It creates all HTML structure for satellites
 * representation and console text area for commands. Every satellite can be in one of two states:
 * connected(green) and disconnected(grey).
 *
 * Visualisation for three satellites in browser:
 *  ------   ------   ------
 * |      | |      | |      |
 * | Sat1 | | Sat2 | | Sat3 |
 *  ------   ------   ------
 *  ------------------------
 * | root@kepler:~$         |
 * |                        |
 * |                        |
 * |                        |
 * |                        |
 * |                        |
 *  ------------------------
 *
 * Supported commands:
 *     left       x                 Move camera to the left to x points
 *     right      x                 Move camera to the right to x points
 *     up         x                 Move camera to the top to x points
 *     down       x                 Move camera to the down to x points
 *     connect    s1...sx           Connects to specified list of satellites (s1...sx - satellites)
 *     disconnect s1...sx           Disconnects from the list of satellites (s1...sx - satellites)
 *     list                         Lists all available databases with sizes
 *     remove     db1...dbx         Remove specified list of databases (db1...dbx - database names)
 *     sync       s1...sx           Synchronize databases of current satellite with specified satellites (sx - satellite name)
 *     pack       db1...dbx         Packs databases into db1p...dbxp, where "p" means packed (db1...dbx - database names)
 *     unpack     db1p...dbxp       Unpacks databases into db1...dbx (db1p...dbxp - packed database names)
 *     encrypt    dbx key           Encrypts database by key (dbx - database name, key - string key for encryption)
 *     decrypt    dbxe key          Decrypts database by key (dbxe - encrypted database name, key - string key for encryption)
 *     info                         Shows general information about the satellite and the system.
 *
 * Supported configuration:
 *     {Element} parent Reference to the HTML node of element, where we will add terminal container.
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
App.Terminal = speculoos.Class({
    extend: Lib.Terminal,
    /**
     * @const
     * {String} Selector for CSS class of one satellite icon
     * @private
     */
    _SATELLITE_SELECTOR: '.satellite',
    /**
     * @const
     * {String} Path to images
     * @private
     */
    _SATELLITE_IMG     : './img/',

    /**
     * @constructor
     * We use this override only for calling constructor from superclass. This is
     * how we fix a bug from speculoos library.
     */
    constructor: function () {
        this.parent(arguments);
    },

    /**
     * @override
     * Prepares configuration. Adds commands supported by this terminal
     */
    initConfig: function () {
        /**
         * @conf
         * {Array} Only this class knows about it's commands
         */
        this.cfg.commands       = [
            ['left',       'Info : Moves camera to the left on X points.\nUsage: left 152'],
            ['right',      'Info : Moves camera to the right on X points.\nUsage: right 130'],
            ['up',         'Info : Moves camera to the top on X points.\nUsage: up 42'],
            ['down',       'Info : Moves camera to the down on X points.\nUsage: down 72'],
            ['connect',    'Info : Connects to specified list of satellites.\nUsage: connect s1 s3'],
            ['disconnect', 'Info : Disconnects specified list of satellites from the current.\nUsage: disconnect s1 s3'],
            ['list',       'Info : Lists all available databases on the current satellite.\nUsage: list'],
            ['remove',     'Info : Removes specified databases from the local satellite.\nUsage: remove db1 db2'],
            ['sync',       'Info : Synchronizes databases between current and remote satellites. If you add new database on the local satellite and call sync command, new database will be uploaded to the remote satellites as well.\nUsage: sync s1 s4'],
            ['pack',       'Info : Packs specified databases.\nUsage: pack db1 db3'],
            ['unpack',     'Info : Unpacks specified databases, packed by pack command.\nUsage: unpack db1-p db3-p'],
            ['encrypt',    'Info : Encrypts specified database with key.\nUsage: encrypt db1 12345678'],
            ['decrypt',    'Info : Decrypts specified database with key, encrypted by encrypt command.\nUsage: decrypt db1-e 12345678'],
            ['info',       'Info : Shows general information.\nUsage: info']
        ];
        /**
         * @conf
         * {String} Id of the terminal text area field
         */
        this.cfg.id = Lib.Helper.getId();

        //
        // Parent method should be called after our updates of configuration
        //
        this.parent(arguments);
    },

    /**
     * @override
     * Initializes private fields of the class. All private fields must be created here.
     * No matter if they will be initialized by null or special value.
     */
    initPrivates: function () {
        this.parent(arguments);

        /**
         * @prop
         * {HTMLElement} Reference to the HTML node of element, where we will add terminal container
         * @private
         */
        this._parent        = Lib.Helper.isElement(this.cfg.parent) ? this.cfg.parent : document.body;
        /**
         * @prop
         * {String} HTML id of the loader node
         * @private
         */
        this._loaderId      = Lib.Helper.getId();
        /**
         * @prop
         * {String} HTML id of the loader text node
         * @private
         */
        this._loaderLabelId = Lib.Helper.getId();
        /**
         * @prop
         * {Object} Map of satellites in format: {name: Boolean}, where name - name of satellite, value - connection state
         * @private
         */
        this._satellites    = {s1: false, s2: false, s3: false, s4: false, s5: false};
        /**
         * @prop
         * {Boolean} Busy state of terminal
         * @private
         */
        this._isBusy        = false;
    },

    /**
     * @override
     * Initializes public fields. You should keep all variables of your class here. Also in case if you
     * don't initialize it.
     */
    initPublics: function () {
        this.parent(arguments);

        /**
         * @prop
         * {HTMLElement} Node of the loader container
         */
        this.loaderEl      = null;
        /**
         * @prop
         * {HTMLElement} Node of the loader text container
         */
        this.loaderLabelEl = null;
        /**
         * @prop
         * {Array} Array of satellite HTML elements
         */
        this.satelliteEls  = [];
    },

    /**
     * @override
     * Main initializer of the class. You should use it for every kind of initializations
     * within class. For example logic initialization or creation of HTML nodes.
     */
    init: function () {
        this._createHtml();

        //
        // HTML nodes init
        //
        this.loaderEl      = document.getElementById(this._loaderId);
        this.loaderLabelEl = document.getElementById(this._loaderLabelId);
        this.satelliteEls  = Array.apply(this, document.querySelectorAll(this._SATELLITE_SELECTOR));
        //
        // Here we create all simple command handlers. See this._createSimpleHandlers() for details.
        //
        this._createSimpleHandlers([
            ['left',       1, this._moveValidator],
            ['right',      1, this._moveValidator],
            ['up',         1, this._moveValidator],
            ['down',       1, this._moveValidator],
            ['connect',    null],
            ['disconnect', null],
            ['list',       0],
            ['remove',     null],
            ['sync',       null],
            ['pack',       null],
            ['unpack',     null],
            ['encrypt',    2, this._encryptionValidator],
            ['decrypt',    2, this._encryptionValidator],
            ['info',       0]
        ]);

        this._updateSatelliteIcons();

        //
        // We should call parent method here, because we use there div, we created before
        //
        this.parent(arguments);
    },

    /**
     * @override
     * Set terminal to busy state. In this state user can not input the commands
     * @param {String|Boolean} busy true to disable terminal, false to enable. String to set the busy message.
     */
    setBusy: function (busy) {
        var msg    = Lib.Helper.isString(busy) ? busy : 'Working...';
        var isBusy = Lib.Helper.isString(busy) || busy;

        this.parent([isBusy]);

        this._isBusy                        = isBusy;
        this.loaderEl.style.visibility      = isBusy ? 'visible' : 'hidden';
        this.loaderLabelEl.style.visibility = isBusy ? 'visible' : 'hidden';

        if (isBusy) {
            this.loaderLabelEl.innerHTML = msg;
        }
    },

    /**
     * Returns busy state of terminal
     * @return {Boolean}
     */
    isBusy: function () {
        return this._isBusy;
    },

    /**
     * Returns true if at least one connection was established
     * @param {Array|undefined} sats2Check Array on satellite names or undefined for all satellites
     * @return {Boolean}
     */
    hasConnections: function (sats2Check) {
        var sat;
        var sats = this._satellites;

        if (Lib.Helper.isArray(sats2Check)) {
            sats2Check = this._arrayToObject(sats2Check);
        } else if (!Lib.Helper.isObject(sats2Check)) {
            sats2Check = this._satellites;
        }

        for (sat in sats2Check) {
            if (sats2Check.hasOwnProperty(sat) && !sats[sat]) {
                return false;
            }
        }

        return true;
    },

    /**
     * Connects this satellite and satellites from the list
     * @param {Boolean} connect true - we should connect, false otherwise
     * @param {Array} sats Array of satellite names. e.g.: ['s1', 's3']
     */
    connect: function (connect, sats) {
        var i;
        var len;

        //
        // If satellites are not set, we take all of them
        //
        sats = Lib.Helper.isArray(sats) ? sats : ['s1', 's2', 's3', 's4', 's5'];
        len  = sats.length;
        for (i = 0; i < len; i++) {
            if (!this._satellites.hasOwnProperty(sats[i])) {
                this.message('Invalid satellite: "' + sats[i] + '"');
            } else {
                this._satellites[sats[i]] = connect;
            }
        }

        this._updateSatelliteIcons();
    },

    /**
     * Updates satellite icons. If satellite is connected, then it should be green. If not - grey.
     * @private
     */
    _updateSatelliteIcons: function () {
        var sat;
        var satellites = this._satellites;
        var satIndex;

        for (sat in satellites) {
            if (satellites.hasOwnProperty(sat)) {
                satIndex = parseInt(sat[1], 10);
                if (Lib.Helper.isNumber(satIndex)) {
                    this.satelliteEls[satIndex - 1].style['background-image'] = satellites[sat] ? 'url(' + this._SATELLITE_IMG + 'satellite.png)' : 'url(' + this._SATELLITE_IMG + 'satellite-disabled.png)';
                }
            }
        }
    },

    /**
     * Creates all html containers for the Terminal and adds it to the this._parent node.
     * @private
     */
    _createHtml: function () {
        var container = document.createElement('div');

        //
        // Creates html nodes like this:
        // <div class="satellite-ct">
        //     <div class="satellite"></div>
        //     <div class="satellite"></div>
        //     <div class="satellite"></div>
        //     <div class="satellite"></div>
        //     <div class="satellite"></div>
        //     <textarea id="terminal" class="terminal" rows="6" cols="10"></textarea>
        // </div>
        //
        container.className = 'satellite-ct';
        container.innerHTML =
            '<div class="satellite"></div>' +
            '<div class="satellite"></div>' +
            '<div class="satellite"></div>' +
            '<div class="satellite"></div>' +
            '<div class="satellite"></div>' +
            '<textarea id="' + this.cfg.id + '" class="terminal" rows="6" cols="10"></textarea>' +
            '<div id="' + this._loaderId + '" class="loader"></div>'    +
            '<div id="' + this._loaderLabelId + '"class="loader-label"></div>';

        this._parent.appendChild(container);
    },

    /**
     * Validator for encryption and decryption. Works with two parameters, database name and the key
     * @param {Array} args Array of two elements: database name and the key
     * @return {String|Boolean} Error message or true if arguments are correct
     * @private
     */
    _encryptionValidator: function (args) {
        if (args.length < 2) {
            return 'Invalid amount of arguments. Should be: "fileName keyString", e.g.: file1 23de45fe4';
        }
        if (!Lib.Helper.isString(args[0])) {
            return 'Invalid database (file) name. String required';
        }
        if (!Lib.Helper.isString(args[1])) {
            return 'Invalid key. String required';
        }

        return true;
    },

    /**
     * Validator for all movements (left, right, up, down)
     * @param {Array} args Array of two elements: database name and the key
     * @return {String|Boolean} Error message or true if arguments are correct
     * @private
     */
    _moveValidator: function (args) {
        if (args.length < 1) {
            return 'Invalid arguments amount. One numeric argument required.';
        }
        if (!Lib.Helper.isNumeric(args)) {
            return 'Invalid argument format. Number required.';
        }
        if (parseInt(args, 10) < 0) {
            return 'Invalid argument value. Positive value required.';
        }

        return true;
    },

    /**
     * Creates simple handlers for specified commands. Handler checks amount of arguments
     * of the command and throws an exception in case of wrong amount. Also, it fires an event.
     * @param {Array} commands Array of commands in format [[cmd:String, amount:Number, validator:Function],...]
     * @private
     */
    _createSimpleHandlers: function (commands) {
        var i;
        var len = commands.length;

        for (i = 0; i < len; i++) {
            this._createSimpleHandler(commands[i][0], commands[i][1], commands[i][2]);
        }
    },

    /**
     * Creates simple handler for specified command. This handler checks amount of arguments
     * and throws an exception in case of wrong amount. Also, it fires an event.
     * @param {String} command Name of the command in console
     * @param {Number|null} args Amount of arguments for command or null if no need to check arguments
     * @param {Function|undefined} validator Validator function. Optional.
     * @private
     */
    _createSimpleHandler: function (command, args, validator) {
        this[Lib.Helper.createCmdHandlerName(command)] = function (cmdArgs) {
            this.checkArguments(args, command, validator);
            this.fire(command, cmdArgs.slice(1));
        };
    },

    /**
     * Converts Object to the Array. e.g.: ['a', 'b'] -> {a: val, b: val}
     * @param {Array} arr Array to convert
     * @param {*} val Value to fill. true by default
     * @return {Object}
     * @private
     */
    _arrayToObject: function (arr, val) {
        var i;
        var len = arr.length;
        var obj = {};

        val = val || true;
        for (i = 0; i < len; i++) {
            obj[arr[i]] = val;
        }

        return obj;
    }
});