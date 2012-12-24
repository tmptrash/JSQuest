/**
 * Database manager class. It manages a list of files (databases) available of this satellite.
 * It can remove, pack, encrypt and synchronize databases on local satellite. During synchronization, it
 * works in similar way like SVN does. Manager synchronizes databases (files) between satellites using
 * coping. If remote satellite contains file with similar name it will be merged with the same on the
 * local satellite and both satellites will be contained final file version.
 * All changes will be stored in the local storage of the browser. So on the next start of application
 * all files will be loaded into this class.
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
    extend: Lib.Class,

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
    _DATA_FILES_DEL : 'files-del',
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
                skype     : {size: 45075}
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
     * Removes specified databases (files) from a local satellite.
     * @param {Array} files Array of file names
     * @return {Boolean|String} true - ok, string message if error
     */
    remove: function (files) {
        var delDbs;

        if (!Lib.Helper.isArray(files)) {
            return 'Invalid parameter during removing databases. Array of database files required.';
        }

        delDbs = this._get(this._DATA_FILES_DEL);
        this._changeFiles(files, function (curDbs, files, file) {
            delDbs[file] = curDbs[file];
            delete curDbs[file];
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
        var db;
        var remoteDb = this._remoteDb;
        var dbs      = this._get(this._DATA_FILES);
        var delDbs   = this._get(this._DATA_FILES_DEL);
        var remoteFiles;
        var i;
        var len;

        if (!Lib.Helper.isArray(args)) {
            return 'Invalid arguments format for sync command. Array required. Should be: sat1...satx';
        }
        if (args.length < 1) {
            return 'Invalid amount of arguments for sync command. Should be at least one.';
        }

        for (i = 0, len = args.length; i < len; i++) {
            remoteFiles = remoteDb[args[i]];
            for (db in remoteFiles) {
                if (remoteFiles.hasOwnProperty(db)) {
                    if (dbs[db] === undefined && delDbs[db] === undefined) {
                        dbs[db] = remoteFiles[db];
                    }
                }
            }
        }
        this._set(this._DATA_FILES, dbs);

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
            return 'Invalid parameter during packing databases. Array of database files required.';
        }

        delDbs = this._get(this._DATA_FILES_DEL);
        this._changeFiles(files, function (curDbs, files, file) {
            newDb = file + this._PACK_POSTFIX;
            //
            // Skips already packed files
            //
            if (curDbs[file] && file.indexOf(this._PACK_POSTFIX) === -1) {
                curDbs[newDb] = (curDbs[file].size / 7).toFixed();
                //
                // If we add file with similar name as deleted, then we must unset it from deleted files map.
                //
                delete delDbs[newDb];
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
            return 'Invalid parameter during unpacking databases. Array of database files required.';
        }

        delDbs = this._get(this._DATA_FILES_DEL);
        this._changeFiles(files, function (curDbs, files, file) {
            newDb = file.substr(0, file.length - this._PACK_POSTFIX.length);
            //
            // Skips not packed files
            //
            if (curDbs[file] && file.indexOf(this._PACK_POSTFIX) !== -1) {
                curDbs[newDb] = (curDbs[file].size * 7).toFixed();
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
            return 'Database file does not exist';
        }
        if (!Lib.Helper.isString(key)) {
            return 'Invalid key. String type required.';
        }

        newDb = file + this._ENCRYPT_POSTFIX;
        dbs[newDb]     = dbs[file];
        dbs[newDb].key = key;
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
            return 'Database file does not exist';
        }
        if (dbs[file].key !== key) {
            return 'Selected database file was encrypted with another key';
        }

        newDb      = file.substr(0, file.length - this._ENCRYPT_POSTFIX);
        dbs[newDb] = dbs[file];
        delete dbs[newDb].key;

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

    /**
     * This is a helper method, that iterates thought removed databases (files) saved in local storage (available
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
//    _changeDeletedFiles: function (files, cb) {
//        var dbs = this._get(this._DATA_FILES_DEL);
//        var file;
//        var filesLen;
//
//        for (file = 0, filesLen = files.length; file < filesLen; file++) {
//            cb.call(this, dbs, files, files[file], file);
//        }
//
//        this._set(this._DATA_FILES_DEL, dbs);
//    }
});