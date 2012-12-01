/**
 * Application class of Terminal app
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
App.Terminal = speculoos.Class({
    extend: Lib.Terminal,

    /**
     * Application constructor
     * @param {Object} cfg Configuration of the class. Available parameters:
     *        {String} id       Required. Id of text area html tag
     *        {String} user     Optional. Name of user. 'user' by default.
     *        {String} host     Optional. name of current HOST. 'localhost' by default.
     *        {Array}  commands Optional. Array of commands for the terminal in format: [[cmd-name:String, cmd-description:String],...]
     */
    constructor: function (cfg) {
        /**
         * @const
         * {Array} Supported commands
         */
        cfg.commands = [
            this._createCommand('list',    'Info : Lists all files\\folders within active folder\nUsage: list'),
            this._createCommand('saf',     'Info : Sets Active Folder to specified one. Only one folder per command is supported.\nUsage: saf folder'),
            this._createCommand('gaf',     'Info : Gets active folder.\nUsage: gaf'),
            this._createCommand('connect', 'Info : Connects to the orbital satellite and starts video streaming from it\'s camera. Only an administrator has a permissions for that.\nUsage: connect user password'),
            this._createCommand('read',    'Info : Reads specified file in active folder.\nUsage: read file'),
            this._createCommand('rf',      'Info : Removes specified file in active folder.\nUsage: rf file'),
            this._createCommand('uf',      'Info : Updates specified file in active folder with data block.\nUsage: uf file index data'),
            this._createCommand('login',   'Info : Changes active user of terminal.\nUsage: login user password'),
            this._createCommand('cef',     'Info : Creates empty file within active folder. Use uf command to create file\'s body.\nUsage: cef file'),
            this._createCommand('gfp',     'Info : Shows file permissions.\nUsage: gfp file'),
            this._createCommand('reboot',  'Info : Reboots the terminal and reconnects it with a satellite. This command will close the session and all history and local data will be lost.\nUsage: reboot'),
            this._createCommand('info',    'Info : Shows information about terminal.\nUsage: info')
        ];

        App.Terminal.base.constructor.call(this, cfg);
    },

    /**
     * Initializes private fields of the class. All private fields must be created here.
     * No matter if they will be initialized by null or special value.
     */
    initPrivates: function () {
        App.Terminal.base.initPrivates.call(this);

        /**
         * @prop
         * {App.Fs} Reference to File System class instance
         * @private
         */
        this._fs = new App.SatelliteFs();
    },

    /**
     * LIST command handler. It has no arguments. Shows all supported commands in separate lines.
     * @private
     */
    _onListCmd: function () {
        var filesFilders = this._fs.getList();

        filesFilders.unshift('..');
        Console.WriteLine(filesFilders.join('\n'));
    },

    /**
     * SAF command handler. Sets active folder in file system. Can show error message id needed.
     * @param {Array} args Array of command arguments.
     * @private
     */
    _onSafCmd: function (args) {
        this._checkArguments(1, 'saf');
        this._fs.setActiveFolder(args[1]);
    },

    /**
     * GAF command handler. Gets active folder.
     * @private
     */
    _onGafCmd: function () {
        this.console.WriteLine(this._fs.getActiveFolder());
    },

    /**
     * CONNECT command handler. Connects to the remote orbital satellite.
     * @param {Array} args Array of command arguments.
     * @private
     */
    _onConnectCmd: function (args) {
        this._checkArguments(2, 'connect');

        // TODO: Here is the demo will begin
    },

    /**
     * READ command handler. Dump file content to console.
     * @param {Array} args Array of command arguments.
     * @private
     */
    _onReadCmd: function (args) {
        this._checkArguments(1, 'read');
        this.console.WriteLine(this._fs.read(args[1]));
    },

    /**
     * RF command handler. Removes specified file in active folder.
     * @param {Array} args Array of command arguments.
     * @private
     */
    _onRfCmd: function (args) {
        this._checkArguments(1, 'rf');
        this.console.WriteLine(this._fs.remove(args[1]));
    },

    /**
     * UF command handler. Updates specified file in active folder with data blockstarting from index.
     * @param {Array} args Array of command arguments.
     * @private
     */
    _onUfCmd: function (args) {
        this._checkArguments(3, 'uf');
        this._fs.updateFile(args[1], parseInt(args[2], 10), this._prepareString(args[3]));
    },

    /**
     * LOGIN command handler. Changes active user within terminal.
     * @param {Array} args Array of command arguments.
     * @private
     */
    _onLoginCmd: function (args) {
        this._checkArguments(2, 'login');

        var user = args[1];

        if (this._fs.getHashByUser(user) === Lib.Helper.md5(this._prepareString(args[2]))) {
            this._fs.setActiveUser(user);
            //
            // Initialize Console library for new user
            //
            this.console.init(this.textAreaId, user, this.host, this.commands, true);
        } else {
            this.console.WriteLine('Invalid login or password');
        }
    },

    /**
     * CEF command handler. Creates empty file within active folder.
     * @param {Array} args Array of command arguments.
     * @private
     */
    _onCefCmd: function (args) {
        this._checkArguments(1, 'cef');
        this._fs.create(args[1]);
    },

    /**
     * GFP command handler. Gets permissons of the file within active folder.
     * @param {Array} args Array of command arguments.
     * @private
     */
    _onGfpCmd: function (args) {
        this._checkArguments(1, 'gfp');
        this.console.WriteLine('READ-DELETE-UPDATE : ' + this._fs.getFilePermissions(args[1]).join(''));
    },

    /**
     * REBOOT command handler. Reboots the terminal and clear all local data.
     * @private
     */
    _onRebootCmd: function () {
        var seconds = 5;
        var tick    = seconds;
        var timeout = 1000;

        function interval() {
            if (tick > 0) {
                setTimeout(interval, timeout);
                if (tick === seconds) {
                    this.console.Write('Rebooting');
                } else {
                    this.console.Write('.');
                }
                tick--;
            } else {
                location.reload();
            }
        }

        setTimeout(interval, 1);
    },

    /**
     * INFO command handler. Shows terminal's information.
     * @private
     */
    _onInfoCmd: function () {
        this.console.WriteLine(
            '[ Description ]\n' +
            'Welcome to the remote terminal application. This software works in similar way as FTP protocol. ' +
            'It connects to the remote orbital satellite using special remote procedure call API. Every terminal works within ' +
            'it\'s session. The session clears every time when user reboots the terminal. It means, that file system and ' +
            'command\'s history will be also reset.\n\n' +
            '[ Permissions ]\n' +
            'Remote server has special permissions logic. Every folder contains permission file called - perm. It contains a list ' +
            'of all files within current folder with it\'s permissions. Every record of this file is equal to 8 bytes. Also, first two ' +
            'header lines of this file are similar to other permission files.'
        );
    },

    /**
     * Prepares string. Replace '\\n' by '\n' and remove " symbol at the beginning and at the end
     * @param {String} s
     * @return {String} Prepared string
     * @private
     */
    _prepareString: function (s) {
        if (s !== '""' && s.length > 2) {
            if (s[0] === '"' && s[s.length - 1] === '"') {
                s = s.substr(1, s.length - 2);
            }
            return s.replace('\\n', '\n');
        }

        return s;
    },

    /**
     * Creates one command in format: [cmd-name:String, cmd-function:Function, cmd-help-string:String]
     * @param {String} cmd Command Name
     * @param {String} help Command help string
     * @private
     */
    _createCommand: function (cmd, help) {
        return [
            cmd,
            this._createMethod('_on' + Lib.Helper.capitalize(cmd) + 'Cmd'),
            help
        ];
    },

    /**
     * Checks arguments of a parent caller and throw error in case of invalid amount.
     * You should call this method from your command handlers.
     * @param {Number} args Amount of required arguments
     * @param {String} cmd Name of command
     * @private
     */
    _checkArguments: function (args, cmd) {
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
     * keyup DOM event handler. Scroll terminal textarea at the bottom.
     * @private
     */
    _onTerminalKeyUp: function() {
        this.scrollTop = this.scrollHeight;
    }
});