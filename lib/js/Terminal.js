/**
 * Class of the UNIX-like terminal widget. Consists of text area input field and console-like
 * logic inside. It uses third-party library - console.js for commands.
 *
 *  ------------------------
 * | user@localhost:~$      |
 * |                        |
 * |                        |
 * |                        |
 * |                        |
 * |                        |
 *  ------------------------
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
Lib.Terminal = speculoos.Class({
    extend: Lib.Observer,

    /**
     * Application constructor
     * @param {Object} cfg Configuration of the class. Available parameters:
     *        {String} id       Required. Id of text area html tag
     *        {String} user     Optional. Name of user. 'user' by default.
     *        {String} host     Optional. name of current HOST. 'localhost' by default.
     *        {Array}  commands Optional. Array of commands for the terminal in format: [[cmd-name:String, cmd-description:String],...]
     */
    constructor: function (cfg) {
        Lib.Terminal.base.constructor.call(this, cfg);

        /**
         * @prop
         * {Object} Public reference to the configuration passed to the constructor
         */
        this.cfg = Lib.Helper.isObject(cfg) ? cfg : {};

        this.initConfig();
        this.initPrivates();
        this.initPublics();
        this.init();
    },

    /**
     * Checks and prepares configuration of the class.
     * @throw Error
     */
    initConfig: function () {
        var cfg = this.cfg;

        //
        // Check required properties
        //
        if (!Lib.Helper.isString(cfg.id)) {
            throw new Error('Invalid id in configuration. Method: Lib.Terminal.initConfig().');
        }
    },

    /**
     * @abstract
     * Initializes private fields of the class. All private fields must be created here.
     * No matter if they will be initialized by null or special value.
     */
    initPrivates: function () {},

    /**
     * Initializes private fields of the class. All private fields must be created here.
     * No matter if they will be initialized by null or special value.
     */
    initPublics: function () {
        var cfg = this.cfg;

        /**
         * {String} Html tag id of the tex area for console
         * @private
         */
        this.textAreaId = cfg.id;
        /**
         * {HTMLElement} Element of a text area for terminal.
         * @private
         */
        this.textAreaEl = null;
        /**
         * {String} Current host name. 'localhost' by default
         * @private
         */
        this.host       = cfg.host || 'localhost';
        /**
         * @prop
         * {String} Name of current user. 'user' by default
         */
        this.user       = cfg.user || 'user';
        /**
         * @const
         * {Array} Supported command. [] by default
         */
        this.commands   = Lib.Helper.isArray(cfg.commands) ? cfg.commands : [];
        /**
         * @prop
         * @readonly
         * {Console} Shortcut for the console class instance
         */
        this.console    = Console;
    },

    /**
     * Main initializer of the class. You should use it for every kind of initializations
     * within class. For example logic initialization or creation of HTML nodes.
     */
    init: function () {
        //
        // We should do it here at the last moment.
        //
        this.textAreaEl = document.getElementById(this.cfg.id);
        //
        // Turn on terminal's auto scroll all the time
        //
        this.textAreaEl.addEventListener('keyup', this._onTerminalKeyUp);
        //
        // Initializes third-party library, which emulates UNIX console.
        //
        this.console.init(this.textAreaId, this.user, this.host, this._bindCommands());
    },

    /**
     * Set terminal to busy state. In this state user can not input the commands
     * @param {Boolean} busy true to disable terminal, false to enable
     */
    setBusy: function (busy) {
        this.textAreaEl.disabled = busy;
        this.textAreaEl.style.background = busy ? '#111111' : '#000';
        this.console.setBusy(busy);
    },

    /**
     * Prepares string. Replace '\\n' by '\n' and remove " symbol at the beginning and at
     * the end of string. It can be user for parameters truncate.
     * @param {String} s
     * @return {String} Prepared string
     */
    prepareString: function (s) {
        if (s !== '""' && s.length > 2) {
            if (s[0] === '"' && s[s.length - 1] === '"') {
                s = s.substr(1, s.length - 2);
            }
            return s.replace('\\n', '\n');
        }

        return s;
    },

    /**
     * Creates one command in format: [cmd-name:String, cmd-function:Function, cmd-help-string:String].
     * Handler of the command you should declare manually. Example:
     * ...
     * createCmdHandler('ping', 'This is simple PING command');
     * ...
     * _onPingCmd: function () {...}
     * ...
     * @param {String} cmd Command Name
     * @param {String} help Command help string
     */
    createCmdHandler: function (cmd, help) {
        //
        // In case of invalid command arguments, we will create empty command with empty handler
        //
        if (!Lib.Helper.isString(cmd) || cmd === '') {
            return ['nop', Lib.Helper.emptyFn, 'It do nothing'];
        }
        if (!Lib.Helper.isString(help)) {
            help = '';
        }

        return [
            cmd,
            this._createMethod(Lib.Helper.createCmdHandlerName(cmd)),
            help
        ];
    },

    /**
     * Checks arguments of a parent caller and throw error in case of invalid one
     * @param {Number} args Amount of required arguments
     * @param {String} cmd Name of the command
     */
    checkArguments: function (args, cmd) {
        //
        // + 1 because the first parameter is name of command.
        //
        if (arguments.callee.caller.arguments[0].length < args + 1) {
            throw new Error('Invalid arguments. Use \'help ' + cmd + '\' for help.');
        }
    },

    /**
     * Creates wrapper around specified method in this class, so it will be run in this scope.
     * @param {String} method Name of method
     * @return {Function}
     * @private
     */
    _createMethod: function (method) {
        var me = this;

        return function (args) {
            try {
                me[method].call(me, args);
            } catch (e) {
                this.console.WriteLine(e.message);
            }
        };
    },

    /**
     * 'keyup' DOM event handler. Scrolls terminal text area at the bottom.
     * @private
     */
    _onTerminalKeyUp: function () {
        this.scrollTop = this.scrollHeight;
    },

    /**
     * Creates array of arrays with command and command handlers in format:
     * [[cmd:String, fn:Function, cmdHelp:String], ...]
     * @return {Array}
     * @private
     */
    _bindCommands: function () {
        var me   = this;
        var cmds = me.commands;
        var ret  = [];
        var i;
        var len;
        var cmd;

        for (i = 0, len = cmds.length; i < len; i++) {
            cmd = cmds[i];
            if (cmd.length > 1) {
                ret.push(me.createCmdHandler.apply(me, cmd));
            }
        }

        return ret;
    }
});