/**
 * Satellite's telescope console. It contains console commands for moving and zooming telescope and
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
 *     left       x                 Move telescope to the left to x points
 *     right      x                 Move telescope to the right to x points
 *     up         x                 Move telescope to the top to x points
 *     down       x                 Move telescope to the down to x points
 *     zoom       x                 Zoom telescope (0 < x < 50) This is just moves camera by z axes
 *     connect    s1...sx           Connects to specified list of satellites (s1...sx - satellites)
 *     disconnect s1...sx           Disconnects from the list of satellites (s1...sx - satellites)
 *     remove     db1...dbx         Remove specified list of databases (db1...dbx - database names)
 *     sync       db1...dbx sx      Synchronize databases with specified satellite (db1...dbx - database names, sx - satellite name)
 *     pack       db1...dbx         Packs databases into db1p...dbxp, where "p" means packed (db1...dbx - database names)
 *     unpack     db1p...dbxp       Unpacks databases into db1...dbx (db1p...dbxp - packed database names)
 *     send       db1...dbx sx      Send databases to the satellite (db1...dbx - database names, sx - satellite name)
 *     list                         Lists all available databases with sizes
 *     msg        sx message        Send a message to specified satellite (sx - satellite, message - text message)
 *     encrypt    dbx key           Encrypts database by key (dbx - database name, key - string key for encryption)
 *     decrypt    dbxe key          Decrypts database by key (dbxe - encrypted database name, key - string key for encryption)
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
     * @constructor
     * We use this override only for calling constructor from superclass. This is
     * how we fix a bug from speculoos library.
     * @param {Object} cfg Configuration of the class
     */
    constructor: function (cfg) {
        cfg = cfg || {};

        /**
         * @conf
         * {Array} Only this class knows about it's commands
         */
        cfg.commands = [
            ['left',    'Info : Moves telescope to the left on X points.\nUsage: left 152'],
            ['right',   'Info : Moves telescope to the right on X points.\nUsage: right 130'],
            ['up',      'Info : Moves telescope to the top on X points.\nUsage: up 42'],
            ['down',    'Info : Moves telescope to the down on X points.\nUsage: down 72'],
            ['zoom',    'Info : Zoom telescope in range 1 to 50.\nUsage: zoom 37']
        ];
        /**
         * @conf
         * {String} Id of a text area with console. We should pass it to a Console library.
         */
        cfg.id       = Lib.Helper.md5((new Date()).toString());


        App.Terminal.base.constructor.call(this, cfg);
    },

    /**
     * Initializes private fields of the class. All private fields must be created here.
     * No matter if they will be initialized by null or special value.
     */
    initPrivates: function () {
        App.Terminal.base.initPrivates.apply(this, arguments);

        /**
         * @prop
         * {HTMLElement} Reference to the HTML node of element, where we will add terminal container
         * @private
         */
        this._parent = Lib.Helper.isElement(this.cfg.parent) ? this.cfg.parent : document.body;
    },

    /**
     * Main initializer of the class. You should use it for every kind of initializations
     * within class. For example logic initialization or creation of HTML nodes.
     */
    init: function () {
        this._createHtml();
        //
        // Here we create all simple command handlers. See this._createSimpleHandlers() for details.
        //
        this._createSimpleHandlers([
            ['left',  1],
            ['right', 1],
            ['up',    1],
            ['down',  1],
            ['zoom',  1]
        ]);

        //
        // We should call parent method here, because we use there div, we created before
        //
        App.Terminal.base.init.apply(this, arguments);
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
                '<textarea id="' + this.cfg.id + '" class="terminal" rows="6" cols="10"></textarea>';

        this._parent.appendChild(container);
    },

    /**
     * Creates simple handlers for specified commands. Handler checks amount of arguments
     * of the command and throws an exception in case of wrong amount. Also, it fires an event.
     * @param {Array} commands Array of commands in format [[cmd:String, amount:Number],...]
     * @private
     */
    _createSimpleHandlers: function (commands) {
        var i;
        var len = commands.length;

        for (i = 0; i < len; i++) {
            this._createSimpleHandler(commands[i][0], commands[i][1]);
        }
    },

    /**
     * Creates simple handler for specified command. This handler checks amount of arguments
     * and throws an exception in case of wrong amount. Also, it fires an event.
     * @param {String} command Name of the command in console
     * @param {Number} args    Amount of arguments for command
     * @private
     */
    _createSimpleHandler: function (command, args) {
        this[Lib.Helper.createCmdHandlerName(command)] = function (cmdArgs) {
            this.checkArguments(args, command);
            this.fire(command, cmdArgs.slice(1));
        };
    }
});