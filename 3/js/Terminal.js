/**
 * Application class of Terminal app. It supports many command (see command
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
App.Terminal = speculoos.Class({
    extend: Lib.Terminal,

    /**
     * @constructor
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
            ['list',    _('Info : Lists all files\\folders within active folder\nUsage: list')],
            ['saf',     _('Info : Sets Active Folder to specified one. Only one folder per command is supported.\nUsage: saf folder')],
            ['gaf',     _('Info : Gets active folder.\nUsage: gaf')],
            ['connect', _('Info : Connects to the orbital satellite and starts video streaming from it\'s camera. Only an administrator has a permissions for that.\nUsage: connect user password')],
            ['read',    _('Info : Reads specified file in active folder.\nUsage: read file')],
            ['rf',      _('Info : Removes specified file in active folder.\nUsage: rf file')],
            ['uf',      _('Info : Updates specified file in active folder with data block.\nUsage: uf file index data')],
            ['login',   _('Info : Changes active user of terminal.\nUsage: login user password')],
            ['cef',     _('Info : Creates empty file within active folder. Use uf command to create file\'s body.\nUsage: cef file')],
            ['gfp',     _('Info : Shows file permissions.\nUsage: gfp file')],
            ['reboot',  _('Info : Reboots the terminal and reconnects it with a satellite. This command will close the session and all history and local data will be lost.\nUsage: reboot')],
            ['info',    _('Info : Shows information about terminal.\nUsage: info')]
        ];

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
         * {App.Fs} Reference to File System class instance
         * @private
         */
        this._fs = new App.SatelliteFs();
    },

    /**
     * Main initializer of the class
     */
    init: function () {
        this._createHtml();

        this.parent(arguments);
    },

    /**
     * Analog of the destructor in C++. Removes terminal from DOM. This
     * method should be called manually before call delete operator.
     */
    destroy: function () {
        document.body.removeChild(document.getElementById('container'));
    },

    /**
     * Creates html container for the terminal.
     * @private
     */
    _createHtml: function () {
        //
        // Final html will be like this:
        //
        // <div id="container">
        //     <textarea id="terminal" cols="10" rows="5"></textarea>
        // </div>
        //
        var container = document.createElement('div');

        container.id        = 'container';
        container.innerHTML = '<textarea id="' + this.cfg.id + '" class="terminal" rows="5" cols="10"></textarea>';

        document.body.appendChild(container);
    },

    /**
     * list command handler. It has no arguments. Shows all supported commands in separate lines.
     * @private
     */
    _onListCmd: function () {
        var filesFilders = this._fs.getList();

        filesFilders.unshift('..');
        this.console.WriteLine(filesFilders.join('\n'));
    },

    /**
     * saf command handler. Sets active folder in file system. Can show error message id needed.
     * @param {Array} args Array of command arguments.
     * @private
     */
    _onSafCmd: function (args) {
        this.checkArguments(1, 'saf');
        this._fs.setActiveFolder(args[1]);
    },

    /**
     * gaf command handler. Gets active folder.
     * @private
     */
    _onGafCmd: function () {
        this.console.WriteLine(this._fs.getActiveFolder());
    },

    /**
     * connect command handler. Connects to the remote orbital satellite.
     * @param {Array} args Array of command arguments.
     * @return {undefined}
     * @private
     */
    _onConnectCmd: function (args) {
        this.checkArguments(2, 'connect');

        if (Lib.Helper.md5(this.prepareString(args[2])) !== this._fs.getHashByUser(args[1])) {
            this.console.WriteLine(_('Incorrect password'));
            return undefined;
        }

        this.fire('finish');
    },

    /**
     * read command handler. Dump file content to console.
     * @param {Array} args Array of command arguments.
     * @private
     */
    _onReadCmd: function (args) {
        this.checkArguments(1, 'read');
        this.console.WriteLine(this._fs.read(args[1]));
    },

    /**
     * rf command handler. Removes specified file in active folder.
     * @param {Array} args Array of command arguments.
     * @private
     */
    _onRfCmd: function (args) {
        this.checkArguments(1, 'rf');
        this.console.WriteLine(this._fs.remove(args[1]));
    },

    /**
     * uf command handler. Updates specified file in active folder with data blockstarting from index.
     * @param {Array} args Array of command arguments.
     * @private
     */
    _onUfCmd: function (args) {
        this.checkArguments(3, 'uf');
        this._fs.updateFile(args[1], parseInt(args[2], 10), this.prepareString(args[3]));
    },

    /**
     * login command handler. Changes active user within terminal.
     * @param {Array} args Array of command arguments.
     * @private
     */
    _onLoginCmd: function (args) {
        this.checkArguments(2, 'login');

        var user = args[1];

        if (this._fs.getHashByUser(user) === Lib.Helper.md5(this.prepareString(args[2]))) {
            this._fs.setActiveUser(user);
            //
            // Initialize Console library for new user
            //
            this.console.init(this.textAreaId, user, this.host, this.commands, true);
        } else {
            this.console.WriteLine(_('Invalid login or password'));
        }
    },

    /**
     * cef command handler. Creates empty file within active folder.
     * @param {Array} args Array of command arguments.
     * @private
     */
    _onCefCmd: function (args) {
        this.checkArguments(1, 'cef');
        this._fs.create(args[1]);
    },

    /**
     * gfp command handler. Gets permissons of the file within active folder.
     * @param {Array} args Array of command arguments.
     * @private
     */
    _onGfpCmd: function (args) {
        this.checkArguments(1, 'gfp');
        this.console.WriteLine('READ-DELETE-UPDATE : ' + this._fs.getFilePermissions(args[1]).join(''));
    },

    /**
     * reboot command handler. Reboots the terminal and clear all local data.
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
     * info command handler. Shows terminal's information.
     * @private
     */
    _onInfoCmd: function () {
        this.console.WriteLine(
            _('[ Description ]\n') +
            _('Welcome to the remote terminal application. This software works in similar way as FTP protocol. ') +
            _('It connects to the remote orbital satellite using special remote procedure call API. Every terminal works within ') +
            _('it\'s session. The session clears every time when user reboots the terminal. It means, that file system and ') +
            _('command\'s history will be also reset.\n\n') +
            _('[ Permissions ]\n') +
            _('Remote server has special permissions logic. Every folder contains permission file called - perm. It contains a list ') +
            _('of all files within current folder with it\'s permissions. Every record of this file is equal to 8 bytes. Also, first two ') +
            _('header lines of this file are similar to other permission files.')
        );
    }
});