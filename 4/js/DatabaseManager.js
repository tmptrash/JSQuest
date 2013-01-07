/**
 * Database manager class. It manages a list of files (databases) available of this satellite.
 * It can remove, pack, encrypt and synchronize databases on local satellite. During synchronization, it
 * works in similar way like SVN does. Manager synchronizes databases (files) between satellites using
 * coping. If remote satellite contains file with similar name it will be merged with the same on the
 * local satellite and both satellites will be contained final file version.
 * All changes will be stored in the local storage of the browser. So on the next start of application
 * all files will be loaded into this class. When the last database (file) will be removed from the local
 * and remote satellites 'empty' event will be fired.
 *
 * Supported commands:
 *     remove     db1...dbx         Remove specified list of databases (db1...dbx - database names)
 *     sync       s1...sx           Synchronize databases of current satellite with specified satellites (sx - satellite name)
 *     pack       db1...dbx         Packs databases into db1p...dbxp, where "p" means packed (db1...dbx - database names)
 *     unpack     db1p...dbxp       Unpacks databases into db1...dbx (db1p...dbxp - packed database names)
 *     list                         Lists all available databases with sizes
 *     encrypt    dbx key           Encrypts database by key (dbx - database name, key - string key for encryption)
 *     decrypt    dbxe key          Decrypts database by key (dbxe - encrypted database name, key - string key for encryption)
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
App.DatabaseManager = speculoos.Class({
    extend: Lib.Observer,

    /**
     * @const
     * {String} Prefix for local storage, where we stores databases (files) for current satellite
     * @private
     */
    _DATA_PREFIX    : 'jsql4',
    /**
     * @const
     * {String} Name of key for databases (files)
     * @private
     */
    _DATA_FILES     : 'files',
    /**
     * @const
     * {String} Name of key for databases (files), which were deleted
     * @private
     */
    _DATA_FILES_DEL : 'files-d',
    /**
     * @const
     * {String} Name of key for satellites map, which were synchronized and cleaned
     * @private
     */
    _SATS_SYNC      : 'sats-s',
    /**
     * @const
     * {String} Name of key for synchronized property
     * @private
     */
    _DATA_SYNC      : 'synchronized',
    /**
     * @const
     * {String} Postfix for packed databases (files)
     * @private
     */
    _PACK_POSTFIX   : '-p',
    /**
     * @const
     * {String} Postfix for encrypted databases (files)
     * @private
     */
    _ENCRYPT_POSTFIX: '-e',


    /**
     * @constructor
     * @override
     * It exists only for small super call fix. Parent constructor will not be called without
     * this method during class instantiating.
     */
    constructor: function () {
        this.parent(arguments);
    },

    /**
     * @override
     * Creates/Initializes all private fields
     */
    initPrivates: function () {
        this.parent(arguments);

        /**
         * @const
         * {String} Dimension postfix of databases (files). Means Gigabytes.
         * @private
         */
        this._dimension  = 'Gb';
        /**
         * @prop
         * {Object} Default databases (files) for current satellite. Key - database (file) name, value - file size
         * @private
         */
        this._defaultDb = {
            facebook  : {size: 10087108},
            vk        : {size: 12567098},
            icq       : {size: 24405},
            tels      : {size: 4587}
        };
        /**
         * @prop
         * {Object} This is emulation of the remote databases. All sizes in gigabytes. Keys - satellite names,
         * values - list of files (databases) with sizes.
         * @private
         */
        this._remoteDb  = {
            s1: {
                skype     : {size: 4507578638902}
            },
            s2: {
                classmates: {size: 107896},
                friendster: {size: 1024555},
                myspace   : {size: 1888767},
                badoo     : {size: 48957},
                linkedin  : {size: 59847}
            },
            s3: {
                mail      : {size: 8512758}
            },
            s4: {
                passport  : {size: 79458}
            },
            s5: {
                google    : {size: 26489837653}
            }
        };
        /**
         * @prop
         * {Object} Map of satellites, which were synchronized and cleaned. Under cleaned, means
         * that, all databases (files) from remote satellite were removed.
         * @private
         */
        this._syncSats  = {
            s1: false,
            s2: false,
            s3: false,
            s4: false,
            s5: false
        };
    },

    /**
     * @override
     * Main initializer of the class
     */
    init: function () {
        this.parent(arguments);

        //
        // If this is first run of application we should add default databases (files)
        // to local storage
        //
        if (!this._get(this._DATA_SYNC)) {
            this._save();
        }
    },

    /**
     * Returns dimension of files. e.g. Tb, Gb, Mb, bytes, bits
     * @return {String}
     */
    getDimension: function () {
        return this._dimension;
    },

    /**
     * Checks if specified database (file) exists on the local satellite.
     * @param {String} file Filename
     * @return {Boolean}
     */
    hasFile: function (file) {
        return this._get(this._DATA_FILES)[file] !== undefined;
    },

    /**
     * Removes specified databases (files) from a local satellite.
     * @param {Array} files Array of file names
     * @return {Boolean|String} true - ok, string message if error
     */
    remove: function (files) {
        var delDbs;

        if (!Lib.Helper.isArray(files)) {
            return _('Invalid parameter during removing databases. Array of database files required.');
        }

        delDbs = this._get(this._DATA_FILES_DEL);
        this._changeFiles(files, function (curDbs, files, file) {
            if (this.hasFile(file)) {
                delDbs[file] = curDbs[file];
                delete curDbs[file];
            } else {
                this.fire('log', _('File "{0}" doesn\'t exist.', file));
            }
        });
        this._set(this._DATA_FILES_DEL, delDbs);

        return true;
    },

    /**
     * Synchronizes databases (files) from this satellite with specified satellites. Result will be on both
     * this and remote satellites. Example of calling: sync(['s1', 's2', 's4']), means that we should synchronize
     * databases (files) vk and mail between current and s3 satellites.
     * @param {Array} args Array of satellite names
     * @return {Boolean|String} true - ok, string message if error
     */
    sync: function (args) {
        var remoteDb = this._remoteDb;
        var dbs      = this._get(this._DATA_FILES);
        var delDbs   = this._get(this._DATA_FILES_DEL);
        var remoteFiles;
        var db;
        var i;
        var len;

        if (!Lib.Helper.isArray(args)) {
            return _('Invalid arguments format for sync command. Array required. Should be: s1...sx');
        }
        if (args.length < 1) {
            return _('Invalid amount of arguments for sync command. Should be at least one.');
        }

        for (i = 0, len = args.length; i < len; i++) {
            remoteFiles = remoteDb[args[i]];
            if (remoteFiles === undefined) {
                this._terminal.WriteLine(_('Satellite "{0}" doesn\'t exist.', args[i]));
            }
            for (db in remoteFiles) {
                if (remoteFiles.hasOwnProperty(db)) {
                    if (dbs[db] === undefined && delDbs[db] === undefined) {
                        dbs[db] = remoteFiles[db];
                    }
                }
            }
        }
        this._set(this._DATA_FILES, dbs);
        this._set(this._DATA_SYNC, true);
        this._updateSatellitesSyncState(args);

        //
        // If there is no databases (files) on the local and remote satellites, 'empty' event should be called
        //
        if (this._empty()) {
            this.fire('empty');
        }

        return true;
    },

    /**
     * Packs specified databases (files) into another one with prefix this._PACK_POSTFIX
     * @param {Array} files Files we should to pack
     * @return {Boolean|String} true - ok, string message if error
     */
    pack: function (files) {
        var delDbs;
        var newDb;

        if (!Lib.Helper.isArray(files)) {
            return _('Invalid parameter during packing databases. Array of database files required.');
        }

        delDbs = this._get(this._DATA_FILES_DEL);
        this._changeFiles(files, function (curDbs, files, file) {
            newDb = file + this._PACK_POSTFIX;
            //
            // Skips already packed files
            //
            if (curDbs[file] && file.indexOf(this._PACK_POSTFIX) === -1) {
                curDbs[newDb] = {size: parseInt((curDbs[file].size / 7).toFixed(), 10), prevSize: curDbs[file].size};
                //
                // If we add file with similar name as deleted, then we must unset it from deleted files map.
                //
                delete delDbs[newDb];
            } else {
                this.fire('log', _('File "{0}" is already packed.', file));
            }
        });
        this._set(this._DATA_FILES_DEL, delDbs);

        return true;
    },

    /**
     * Unpacks specified databases (files) into another one with prefix this._PACK_POSTFIX
     * @param {Array} files Files we should to unpack
     * @return {Boolean|String} true - ok, string message if error
     */
    unpack: function (files) {
        var delDbs;
        var newDb;

        if (!Lib.Helper.isArray(files)) {
            return _('Invalid parameter during unpacking databases. Array of database files required.');
        }

        delDbs = this._get(this._DATA_FILES_DEL);
        this._changeFiles(files, function (curDbs, files, file) {
            newDb = file.substr(0, file.length - this._PACK_POSTFIX.length);
            //
            // Skips not packed files
            //
            if (curDbs[file] && file.indexOf(this._PACK_POSTFIX) !== -1) {
                curDbs[newDb] = {size: curDbs[file].prevSize};
            } else {
                this.fire('log', _('File "{0}" was not packed.', file));
            }
            //
            // If we add file with similar name as deleted, then we must unset it from deleted files map.
            //
            delete delDbs[newDb];
        });
        this._set(this._DATA_FILES_DEL, delDbs);

        return true;
    },

    /**
     * Returns a list of available databases (files) for current satellite. Format: {fileName: {size: Number}, ...} where
     *     fileName - Name of database (file)
     *     size     - File size
     * @return {Object} Map of files
     */
    list: function () {
        return this._get(this._DATA_FILES);
    },

    /**
     * Encrypts database (file) with specified key. We just emulates an encryption.
     * @param {String} file Database (file) name to encrypt
     * @param {String} key  Encryption key. You should use it for decryption. Can be empty.
     * @return {Boolean|String} true - ok, string message if error
     */
    encrypt: function (file, key) {
        var dbs    = this._get(this._DATA_FILES);
        var delDbs = this._get(this._DATA_FILES_DEL);
        var newDb;

        if (dbs[file] === undefined) {
            return _('Database file does not exist');
        }
        if (!Lib.Helper.isString(key)) {
            return _('Invalid key. String type required.');
        }

        newDb = file + this._ENCRYPT_POSTFIX;
        dbs[newDb]     = dbs[file];
        dbs[newDb].key = key;
        this._set(this._DATA_FILES, dbs);
        //
        // If we add file with similar name as deleted, then we must unset it from deleted files map.
        //
        delete delDbs[newDb];
        this._set(this._DATA_FILES_DEL, delDbs);

        return true;
    },

    /**
     * Decrypts database (file) with specified key. We just emulate a decryption.
     * @param {String} file Database (file) name to decrypt
     * @param {String} key  Decryption key, which was used for encryption. Can be empty.
     * @return {Boolean|String} true - ok, string message if error
     */
    decrypt: function (file, key) {
        var dbs    = this._get(this._DATA_FILES);
        var delDbs = this._get(this._DATA_FILES_DEL);
        var newDb;

        if (dbs[file] === undefined) {
            return _('Database file does not exist');
        }
        if (dbs[file].key !== key) {
            return _('Selected database file was encrypted with another key');
        }

        newDb      = file.substr(0, file.length - this._ENCRYPT_POSTFIX.length);
        dbs[newDb] = dbs[file];
        delete dbs[newDb].key;
        this._set(this._DATA_FILES, dbs);
        //
        // If we add file with similar name as deleted, then we must unset it from deleted files map.
        //
        delete delDbs[newDb];
        this._set(this._DATA_FILES_DEL, delDbs);

        return true;
    },

    /**
     * Returns value from local storage by key. Real key will be created by concatenating of
     * the key and this._DATA_PREFIX
     * @param {String} key Key
     * @return {*}
     * @private
     */
    _get: function (key) {
        return JSON.parse(localStorage.getItem(this._DATA_PREFIX + key));
    },

    _set: function (key, value) {
        localStorage.setItem(this._DATA_PREFIX + key, JSON.stringify(value));
    },

    _save: function () {
        this._set(this._DATA_FILES, this._defaultDb);
        this._set(this._DATA_FILES_DEL, {});
        this._set(this._SATS_SYNC, this._syncSats);
    },

    /**
     * Returns true if all databases (files) are removed and this satellite synchronized with all remote satellites also.
     * We can check it comparing removed databases (files) and all remote databases. All databases (files) should be
     * in remove map.
     * @private
     */
    _empty: function () {
        var sats = this._get(this._SATS_SYNC);
        var sat;

        if (this._hasLocalFiles()) {
            return false;
        }

        for (sat in sats) {
            if (sats.hasOwnProperty(sat) && !sats[sat]) {
                return false;
            }
        }

        return true;
    },

    /**
     * Returns true if current satellite has at least one database (file)
     * @return {Boolean}
     * @private
     */
    _hasLocalFiles: function () {
        var dbs = this._get(this._DATA_FILES);
        var db;

        for (db in dbs) {
            if (dbs.hasOwnProperty(db)) {
                return true;
            }
        }

        return false;
    },

    /**
     * Updates internal satellites map. It contains map of satellites, which were synchronized and cleaned.
     * @param {Array} sats Array of satellite names, we should to update
     * @private
     */
    _updateSatellitesSyncState: function (sats) {
        var syncSats   = this._get(this._SATS_SYNC);
        var delDbs     = this._get(this._DATA_FILES_DEL);
        var remoteSats = this._remoteDb;
        var remoteDbs;
        var db;
        var sat;
        var all;
        var i;

        for (i in sats) {
            if (sats.hasOwnProperty(i)) {
                sat = sats[i];
                if (remoteSats.hasOwnProperty(sat)) {
                    remoteDbs = remoteSats[sat];
                    all       = true;
                    for (db in remoteDbs) {
                        if (remoteDbs.hasOwnProperty(db)) {
                            if (!delDbs[db]) {
                                all = false;
                                break;
                            }
                        }
                    }
                    if (all) {
                        syncSats[sat] = true;
                    }
                }
            }
        }
        this._set(this._SATS_SYNC, syncSats);
    },

    /**
     * This is a helper method, that iterates thought databases (files) saved in local storage (available
     * on current satellite). During iteration you can change list of databases or change it's properties.
     * At the ent of iteration, they will be stored back to the local storage.
     * @param {Array} files Array of database (file) names
     * @param {Function} cb Callback function. Parameters:
     *     {Object} dbs   Reference to all available databases (files) on current satellite
     *     {Array}  files Array of databases (files) we working with
     *     {String} fn    Name of current database (file)
     *     {Number} i     Index of current database (file)
     * @private
     */
    _changeFiles: function (files, cb) {
        var dbs = this._get(this._DATA_FILES);
        var file;
        var filesLen;

        for (file = 0, filesLen = files.length; file < filesLen; file++) {
            cb.call(this, dbs, files, files[file], file);
        }

        this._set(this._DATA_FILES, dbs);
    }
});