/**
 * This is a Satellite File System class. It contains folders/files and special permissions files (perm).
 * This file system is special. User can only surf throught one folder down and one folder up using
 * setActiveFolder method call. You can use xpath for that in method getFolder(). Every folder must contains permission file
 * (perm). It contains permissions for all files within active folder. Every time you add or delere some files
 * permission file will be updated. It contains permissions for himself also. Permission file consists of
 * 8 symbol records in format:
 * "FILE    USER1   USER2   PERM1   PERM2"
 * where:
 * FILE  - name of file
 * USER1 - name of the first user (only two users support)
 * USER2 - name of the second user
 * PERM1 - permissions for the first user in format READ-DELETE-UPDATE XXX (111 or 101 or...)
 * PERM2 - permissions for the second user in same format
 *
 * Format of one folder in File System:
 * 'folder name': {
 *     'sub folder name': {
 *         ...                    // recursive. All folders must have this property
 *     },
 *     'file name': 'content',    // file is just a key-value pair, key -it's name, value - it's data
 *     ...
 * }
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
App.SatelliteFs = speculoos.Class({
    extend           : App.Fs,

    /**
     * @const
     * {Number} Index of READ permission in RDE string
     */
    _PERM_READ        : 0,
    /**
     * @const
     * {Number} Index of DELETE permission in RDE string
     */
    _PERM_DELETE      : 1,
    /**
     * @const
     * {Number} Index of READ permission in RDE string
     */
    _PERM_UPDATE      : 2,
    /**
     * @const
     * {Number} Index of file field within permission file
     */
    _PERM_FILE_INDEX  : 0,
    /**
     * @const
     * {Number} Index of field of the first user within permission file
     */
    _PERM_USER1_INDEX : 1,
    /**
     * @const
     * {Number} Index of field of the second user within permission file
     */
    _PERM_USER2_INDEX : 2,
    /**
     * @const
     * {Number} Index of field with permissions of first user within permission file
     */
    _PERM_PERM1_INDEX : 3,
    /**
     * @const
     * {Number} Index of field with permissions of second user within permission file
     */
    _PERM_PERM2_INDEX : 4,
    /**
     * @const
     * {Number} Permission file one record data length
     */
    _PERM_REC_LEN     : 8,
    /**
     * @const
     * {Number} Amount of records in one line in permission file
     */
    _PERM_REC_PER_LINE: 6,
    /**
     * @const
     * {String} Name of file with permissions
     */
    _PERM_FILENAME    : 'perm',
    /**
     * @const
     * {Number} Amount of header lines in permission file - perm
     */
    _PERM_HEAD_LINES  : 2,

    /**
     * @const
     * {Number} Users file one record data length
     */
    _USERS_REC_LEN    : 3,
    /**
     * @const
     * {Number} Index of field with user name within users file
     */
    _USERS_USER_INDEX : 0,
    /**
     * @const
     * {Number} Index of field with user password within users file
     */
    _USERS_MD5_INDEX  : 1,
    /**
     * @const
     * {String} Name of file, where user's data stores
     */
    _USERS_FILENAME   : 'users',
    /**
     * @const
     * {String} Path to the users file
     */
    _USERS_FILE_PATH  : 'usr/bin',

    /**
     * @const
     * {String} The name of jack user
     */
    _USER_ROOT        : 'jack',
    /**
     * @const
     * {String} The name of guest user
     */
    _USER_GUEST       : 'guest',


    /**
     * Constructs File System class
     */
    constructor: function () {
        App.SatelliteFs.base.constructor.call(this, {
            bin  : {
                //
                // Here is an emulation of system binaries - commands we can use in terminal
                //
                list   : '',
                saf    : '',
                gaf    : '',
                connect: '',
                read   : '',
                rf     : '',
                uf     : '',
                login  : '',
                cef    : '',
                gfp    : '',
                reboot : '',
                info   : '',
                perm   : 'Permission file. It contains permissions for all files within current folder.\n' +
                    'FILE    USER1   USER2   PERM1   PERM2   \n' +
                    'list    jack    guest   000     000     \n' +
                    'saf     jack    guest   000     000     \n' +
                    'gaf     jack    guest   000     000     \n' +
                    'connect jack    guest   000     000     \n' +
                    'read    jack    guest   000     000     \n' +
                    'rf      jack    guest   000     000     \n' +
                    'uf      jack    guest   000     000     \n' +
                    'login   jack    guest   000     000     \n' +
                    'cef     jack    guest   000     000     \n' +
                    'gfp     jack    guest   000     000     \n' +
                    'reboot  jack    guest   000     000     \n' +
                    'info    jack    guest   000     000     \n' +
                    'perm    jack    guest   000     000     '
            },
            boot : {
                kernel: '',
                system: '',
                boot  : '',
                grub  : '',
                init  : '',
                perm : 'Permission file. It contains permissions for all files within current folder.\n' +
                    'FILE    USER1   USER2   PERM1   PERM2   \n' +
                    'kernel  jack    guest   000     000     \n' +
                    'system  jack    guest   000     000     \n' +
                    'boot    jack    guest   000     000     \n' +
                    'grub    jack    guest   000     000     \n' +
                    'init    jack    guest   111     000     \n' +
                    'perm    jack    guest   000     000     \n'
            },
            usr  : {
                bin  : {
                    rep  : {
                        '01' : '#\n# January report file\n#\n' +
                            'IND KKR RTP USR LOG PWD UID\n' +
                            '1.6 2.6 1.0 7.0 5.5 6.2 6.0\n' +
                            '4.2 3.2 7.5 3.1 5.7 5.2 7.6\n' +
                            '2.7 6.4 4.4 5.7 8.7 5.3 7.2',
                        '02' : '#\n# February report file\n#\n' +
                            'IND KKR RTP USR LOG PWD UID\n' +
                            '1.5 3.4 3.5 4.3 2.7 8.4 4.4\n' +
                            '3.4 3.6 4.2 3.7 4.6 7.8 7.3\n' +
                            '2.1 1.6 7.4 4.4 2.5 6.4 3.8',
                        perm : 'Permission file. It contains permissions for all files within current folder.\nFILE    USER1   USER2   PERM1   PERM2   \nperm    jack    guest   111     000     \n01      jack    guest   111     101     \n02      jack    guest   111     101     '
                    },
                    users: 'This file contains information about users and it\'s password hashes.\nUSER    MD5                             \njack    ad23e6cd35a85ecb451dd956946601e2\nguest   084e0343a0486ff05530df6c705c8bb4',
                    perm : 'Permission file. It contains permissions for all files within current folder.\nFILE    USER1   USER2   PERM1   PERM2   \nperm    jack    guest   111     001     \nusers   jack    guest   111     000     '
                },
                sbin : {
                    perm : 'Permission file. It contains permissions for all files within current folder.\nFILE    USER1   USER2   PERM1   PERM2   \nperm    jack    guest   111     000     '
                },
                inc  : {
                    perm : 'Permission file. It contains permissions for all files within current folder.\nFILE    USER1   USER2   PERM1   PERM2   \nperm    jack    guest   111     000     '
                },
                share: {
                    perm : 'Permission file. It contains permissions for all files within current folder.\nFILE    USER1   USER2   PERM1   PERM2   \nperm    jack    guest   111     000     '
                },
                lib  : {
                    obj   : '',
                    bin   : '',
                    lib   : '',
                    stdlib: '',
                    fs    : '',
                    term  : '',
                    link  : '',
                    perm  : 'Permission file. It contains permissions for all files within current folder.\n' +
                        'FILE    USER1   USER2   PERM1   PERM2   \n' +
                        'obj     jack    guest   111     000     \n' +
                        'bin     jack    guest   111     000     \n' +
                        'lib     jack    guest   111     000     \n' +
                        'stdlib  jack    guest   111     000     \n' +
                        'fs      jack    guest   111     000     \n' +
                        'term    jack    guest   111     000     \n' +
                        'link    jack    guest   111     000     \n' +
                        'perm    jack    guest   111     100     '
                },
                perm: 'Permission file. It contains permissions for all files within current folder.\nFILE    USER1   USER2   PERM1   PERM2   \nperm    jack    guest   111     001     '
            },
            guest: {
                tmp  : 'This is simple text file',
                perm : 'Permission file. It contains permissions for all files within current folder.\nFILE    USER1   USER2   PERM1   PERM2   \nperm    jack    guest   111     101     \ntmp     jack    guest   111     111     '
            },
            root : {
                cache : '#\n# There is no data here at the moment...\n#',
                satlog: '#\n# 10.08.12 15:32 Ron: The telescope doesn\'t work correctly. The picture is smooth.\n# 13.08.12 12:15 Jack: Finally, the telescope were fixed.\n# 13.08.12 12:30 Jack: Video stream was tested also.\n# 14.08.12 09:45 Ben: Guys, you can use connect command from remote terminal.\n#',
                perm  : 'Permission file. It contains permissions for all files within current folder.\n' +
                    'FILE    USER1   USER2   PERM1   PERM2   \n' +
                    'perm    jack    guest   111     000     \n' +
                    'cache   jack    guest   111     000     \n' +
                    'satlog  jack    guest   111     100     '
            },
            tmp  : {
                perm  : 'Permission file. It contains permissions for all files within current folder.\n' +
                    'FILE    USER1   USER2   PERM1   PERM2   \n' +
                    'perm    jack    guest   111     100     '
            },
            home : {
                perm: 'Permission file. It contains permissions for all files within current folder.\n' +
                    'FILE    USER1   USER2   PERM1   PERM2   \n' +
                    'perm    jack    guest   111     111     '
            },
            perm : 'Permission file. It contains permissions for all files within current folder.\nFILE    USER1   USER2   PERM1   PERM2   \nperm    jack    guest   111     000     '
        });

        /**
         * @prop
         * {String} Name of active user. It can be changed by login command. Default: guest
         * @private
         */
        this._activeUser = 'guest';
        /**
         * @prop
         * {Object} Active file\folder at the moment. This is reference to the node in this._fs.
         * @private
         */
        this._activeFolder = this.getRootFolder();
        /**
         * @prop
         * {String} Name of active folder. Can be '.' for jack folder
         * @private
         */
        this._activeFolderName = '.';
        /**
         * @const
         * {RegExp} Regular expression for parsing permission file data
         * @private
         */
        this._permRecRe = /([^]{8})([^]{8})([^]{8})([^]{8})([^]{8})\n*/g;
        /**
         * @prop
         * {Object} Permissions cache. Actual value are in the perm files. Format: {fileName: {user1: 'XXX', user2: 'XXX'},...}
         * @private
         */
        this._permCache = {};

        /**
         * @const
         * {RegExp} Regular expression for parsing users file data
         * @private
         */
        this._usersRecRe = /([^]{8})([0-9abcdefABCDEF]{32})\n*/g;

        //
        // We should parse permission file in the jack folder, we started from
        //
        this._parsePermissionFile();
    },

    /**
     * Returns MD5 hash by specified user's name
     * @param {String} user Name of user
     * @return {String|Boolean} MD5 hash or false if no user
     * @throw {Error} In case of critical exceptions
     */
    getHashByUser: function (user) {
        if (!Lib.Helper.isString(user) || user === '') {
            throw new Error('Invalid user name');
        }

        var usersContent = this._prepareFileContent(App.SatelliteFs.base.readFile.call(this, this.getFolder(this._USERS_FILE_PATH), this._USERS_FILENAME));
        var re           = this._usersRecRe;
        var trim         = Lib.Helper.trim;
        var data;

        re.lastIndex = 0;
        data         = re.exec(usersContent);
        while (data) {
            if (!Lib.Helper.isArray(data) || data.length !== this._USERS_REC_LEN) {
                throw new Error('Invalid format of users file');
            }
            data.shift();

            if (trim(data[this._USERS_USER_INDEX]) === user) {
                return trim(data[this._USERS_MD5_INDEX]);
            }

            data = re.exec(usersContent);
        }

        return false;
    },

    /**
     * Sets active use
     * @param {String} user Name of user
     */
    setActiveUser: function (user) {
        if (!Lib.Helper.isString(user) || user === '') {
            throw new Error('Invalid user');
        }

        this._activeUser = user;
    },

    /**
     * Return name of active folder.
     * @return {String} Name of active folder or '.' for jack folder
     */
    getActiveFolder: function () {
        return this._activeFolderName;
    },

    /**
     * Set active folder. Active folder - it is only one of sub folders or upper folder (..).
     * Example: setActiveFolder('folder') or setActiveFolder('..')
     * @param {String} folder Name of the folder
     * @throw {Error} In case of critical exceptions
     */
    setActiveFolder: function (folder) {
        var activeFolder = this._activeFolder;

        if (folder === '..') {
            this._activeFolderName = this.getParentName(activeFolder);
            this._activeFolder     = this.getParent(activeFolder);
            this._parsePermissionFile();
        }
        else if (activeFolder && Lib.Helper.isObject(activeFolder[folder])) {
            this._activeFolder     = this.getChild(activeFolder, folder);
            this._activeFolderName = folder;
            this._parsePermissionFile();
        } else {
            throw new Error('Folder not found');
        }
    },

    /**
     * Return array of file permissions in format: [String, String, String], where
     * String can be '0' or '1'
     * @param {String} file File name within active folder
     * @return {Array|Boolean} Array of permissions of false if error
     * @throw {Error} In case of critical exceptions
     */
    getFilePermissions: function (file) {
        var me = this;

        if (!this.exists(file)) {
            throw new Error('File not found.');
        }

        return [me.canRead(file) ? '1' : '0', me.canDelete(file) ? '1' : '0', me.canUpdate(file) ? '1' : '0'];
    },

    /**
     * Return true if file with specified name is exists in active folder
     * @param {String} file Name of file
     * @return {Boolean}
     * @throw {Error} In case of critical exceptions
     */
    exists: function (file) {
        return App.SatelliteFs.base.fileExists.call(this, this._activeFolder, file);
    },

    /**
     * Creates empty file within active folder. To create file's body use uf command
     * @param {String} file Name of file
     * @throw {Error} In case of critical exceptions
     */
    create: function (file) {
        App.SatelliteFs.base.createFile.call(this, this._activeFolder, file);

        this._addPermissionRecord(file);
    },

    /**
     * Return specified file content
     * @param {String} file Name of file
     * @return {String|Boolean} File content or false if has error
     * @throw {Error} In case of critical exceptions
     */
    read: function (file) {
        if (!this.canRead(file)) {
            throw new Error('You don\'t have permission to read this file');
        }

        return App.SatelliteFs.base.readFile.call(this, this._activeFolder, file);
    },

    /**
     * Removes file within active folder
     * @param {String} file Name of file
     * @throw {Error} In case of critical exceptions
     */
    remove: function (file) {
        if (!this.canDelete(file)) {
            throw new Error('You don\'t have permission to delete this file');
        }

        App.SatelliteFs.base.deleteFile.call(this, this._activeFolder, file);
        this._deletePermissionRecord(file);
    },

    /**
     * Updates file within active folder with data block starting from index
     * @param {String} file Name of file
     * @param {Number} index Start index. started from 0
     * @param {String} data Data block for update
     * @throw {Error} In case of critical exceptions
     */
    update: function (file, index, data) {
        if (!this.canUpdate(file)) {
            throw new Error('You don\'t have permission to update this file');
        }

        App.SatelliteFs.base.updateFile.call(this, this._activeFolder, file, index, data);

        if (file === this._PERM_FILENAME) {
            this._parsePermissionFile();
        }
    },

    /**
     * Return list of subfolders in active folder
     * @return {Array} Array of folder names
     * @throw {Error} In case of critical exceptions
     */
    getList: function () {
        return App.SatelliteFs.base.getFilesAndFolders.call(this, this._activeFolder);
    },

    /**
     * Checks READ permission for the file
     * @param {String} file Name of file
     * @return {Boolean}
     * @throw {Error} In case of critical exceptions
     */
    canRead: function (file) {
        return this._checkFilePermission(file, this._PERM_READ);
    },

    /**
     * Checks DELETE permission for the file. perm file can not be deleted
     * @param {String} file Name of file
     * @return {Boolean}
     * @throw {Error} In case of critical exceptions
     */
    canDelete: function (file) {
        return this._checkFilePermission(file, this._PERM_DELETE) && file !== this._PERM_FILENAME;
    },

    /**
     * Checks UPDATE permission for the file
     * @param {String} file Name of file
     * @return {Boolean}
     * @throw {Error} In case of critical exceptions
     */
    canUpdate: function (file) {
        return this._checkFilePermission(file, this._PERM_UPDATE);
    },

    /**
     * Checks specified permission for specified file
     * @param {String} file File name
     * @param {Number} perm Index of the permission
     * @return {Boolean}
     * @throw {Error} In case of critical exceptions
     */
    _checkFilePermission: function (file, perm) {
        if (this.exists(file)) {
            if (!this._permCache[file] || !this._permCache[file][this._activeUser] || !this._permCache[file][this._activeUser][perm]) {
                throw new Error('Looks like permission file has broken. Use reboot command to reset the session and reboot terminal.');
            }

            return this._permCache[file][this._activeUser][perm] === '1';
        }

        return false;
    },

    /**
     * Parses permission file and stores parsed data in this._permissions cache object.
     * canRead(), canDelete(),... will be used this cache
     * @throw {Error} In case of critical exceptions
     * @private
     */
    _parsePermissionFile: function () {
        var trim         = Lib.Helper.trim;
        var re           = this._permRecRe;
        var activeFolder = this._activeFolder;
        var fileContent;
        var data;
        var perms;

        if (this.exists(this._PERM_FILENAME)) {
            //
            // Skip first two lines with description
            //
            this._permCache = {};
            fileContent = this._prepareFileContent(activeFolder[this._PERM_FILENAME]);

            data = re.exec(fileContent);
            while (data) {
                if (!Lib.Helper.isArray(data) || data.length !== this._PERM_REC_PER_LINE) {
                    throw new Error('Invalid format of permission file');
                }
                data.shift();

                perms = {};
                perms[trim(data[this._PERM_USER1_INDEX])] = trim(data[this._PERM_PERM1_INDEX]);
                perms[trim(data[this._PERM_USER2_INDEX])] = trim(data[this._PERM_PERM2_INDEX]);
                this._permCache[trim(data[this._PERM_FILE_INDEX])] = perms;

                data = re.exec(fileContent);
            }
        }
    },

    /**
     * Prepares content of the file. Cuts first two lines with comments and
     * return entire file's body.
     * @param {String} content File's content (body)
     * @return {String}
     * @private
     */
    _prepareFileContent: function (content) {
        var body = content.split('\n');

        body.shift();
        body.shift();

        return body.join('\n');
    },

    /**
     * Deletes record about a file with all permissions
     * @param {String} file
     * @throw {Error} In case of critical exceptions
     * @private
     */
    _deletePermissionRecord: function (file) {
        var activeFolder = this._activeFolder;
        var trim         = Lib.Helper.trim;
        var fileContent;
        var recIndex;

        if (this.exists(this._PERM_FILENAME)) {
            fileContent = activeFolder[this._PERM_FILENAME].split('\n');

            for (recIndex = this._PERM_HEAD_LINES; recIndex < fileContent.length; recIndex++) {
                if (trim(fileContent[recIndex].substr(0, this._PERM_REC_LEN)) === file) {
                    fileContent.splice(recIndex, 1);
                    break;
                }
            }
            activeFolder[this._PERM_FILENAME] = fileContent.join('\n');
        }
    },

    /**
     * Adds one file permission record into the perm file within active folder
     * @param {String} file New file name
     * @throw {Error} In case of critical exceptions
     * @private
     */
    _addPermissionRecord: function (file) {
        var me           = this;
        var activeFolder = me._activeFolder;
        var pad          = Lib.Helper.pad;

        if (this.appendToFile(activeFolder, this._PERM_FILENAME,
            '\n' +
            pad(file,           me._PERM_REC_LEN) +
            pad(me._USER_ROOT,  me._PERM_REC_LEN) +
            pad(me._USER_GUEST, me._PERM_REC_LEN) +
            pad('111',          me._PERM_REC_LEN) + // jack always has all permissions
            pad(me._activeUser === me._USER_GUEST ? '111' : '000', me._PERM_REC_LEN)
        )) {
            me._parsePermissionFile();
        }
    }
});