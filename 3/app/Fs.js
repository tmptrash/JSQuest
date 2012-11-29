/**
 * This is a low level File System class. It manages folders structure and files. File system
 * tree should be passed into class configuration (fs parameter). We can work only with files
 * structure of folders always stays the same.
 *
 * Format of one folder in File System (in cobfig):
 * 'folder name': {
 *     'sub folder name': {
 *         ...                    // recursive. All folders must be objects
 *     },
 *     'file name': 'content',    // file is just a key-value pair, key - name and value - data
 *     ...
 * }
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
App.Fs = speculoos.Class({
    /**
     * @const
     * {String} Name of property which points to the parent folder
     * @private
     */
    _PARENT_REF_PROP      : '__parentFolder',
    /**
     * @const
     * {String} Name of property which points to the parent folder's name
     * @private
     */
    _PARENT_NAME_PROP     : '__parentFolderName',
    /**
     * @const
     * {String} Name of the root folder
     * @private
     */
    _ROOT_FOLDER_NAME     : '.',
    /**
     * @const
     * {String} Splitter for folder xpathes. e.g. "./folder1/folder2"
     */
    _XPATH_FOLDER_SPLITTER: '/',
    /**
     * @const
     * {RegExp} Regexp for all invalid symbols in file names
     */
    _FILENAME_RE          : /[^_A-Za-z0-9\-]/,


    /**
     * Constructs File System class
     * @param {Object} fs File System tree
     */
    constructor: function (fs) {
        //
        // Checks if file system config has a correct structure
        //
        this._checkFS(fs);

        /**
         * @prop
         * {Object} Initial File System structure and data. Every node of this
         * object contains one file\folder in file system.
         * @private
         */
        this._fs = Lib.Helper.clone(fs);

        //
        // Adds references to the parent folders for all folders
        //
        this._decorateWithParents(this._fs, this._ROOT_FOLDER_NAME);

        //
        // Sets reference to the root
        //
        this._fs[this._PARENT_REF_PROP]  = this._fs;
        this._fs[this._PARENT_NAME_PROP] = this._ROOT_FOLDER_NAME;
    },

    /**
     * Creates empty file within active folder. To create file's body
     * use uf command
     * @param {Object} parent Reference to the parent folder object for file
     * @param {String} file Name of file
     * @throw {Error} In case of critical exceptions
     */
    createFile: function (parent, file) {
        //
        // Wrong parameters check
        //
        this._checkParameters(parent, file);
        //
        // Logical error check
        //
        if (this.fileExists(parent, file)) {
            throw new Error('File already exists');
        }
        if (Lib.Helper.isObject(parent[file])) {
            throw new Error('Folder with the same name is already exists');
        }

        parent[file] = '';
    },

    /**
     * Return specified file content
     * @param {Object} parent Reference to the parent folder object for file
     * @param {String} file Name of file
     * @return {String} File content
     * @throw {Error} In case of critical exceptions
     */
    readFile: function (parent, file) {
        //
        // Wrong parameters check
        //
        this._checkParameters(parent, file);
        //
        // Logical errors check
        //
        this._checkFile(parent, file);

        return parent[file];
    },

    /**
     * Removes file within active folder
     * @param {Object} parent Reference to the parent folder object for file
     * @param {String} file Name of file
     * @throw {Error} In case of critical exceptions
     */
    deleteFile: function (parent, file) {
        //
        // Wrong parameters check
        //
        this._checkParameters(parent, file);
        //
        // Logical errors check
        //
        this._checkFile(parent, file);

        delete parent[file];
    },

    /**
     * Updates file within active folder with data block starting from index
     * @param {Object} parent Reference to the parent folder object for file
     * @param {String} file Name of file
     * @param {Number} index Start index. started from 0
     * @param {String} data Data block for update
     * @throw {Error} In case of critical exceptions
     */
    updateFile: function (parent, file, index, data) {
        //
        // Wrong parameters check
        //
        this._checkParameters(parent, file);
        //
        // Logical errors check
        //
        this._checkFile(parent, file);
        if (!Lib.Helper.isNumber(index) || index < 0 || index > parent[file].length) {
            throw new Error('Invalid index');
        }
        if (!Lib.Helper.isString(data)) {
            throw new Error('Invalid file body specified');
        }

        parent[file] = parent[file].substr(0, index) + data + parent[file].substr(index + data.length);
    },

    /**
     * Return list of subfolders in active folder
     * @param {Object} parent Reference to the parent folder object for file
     * @return {Array} Array of folder names
     * @throw {Error} In case of critical exceptions
     */
    getFilesAndFolders: function (parent) {
        //
        // Wrong parameters check
        //
        this._checkParameters(parent);

        var fileOrFolder;
        var folders        = [];
        var parentProp     = this._PARENT_REF_PROP;
        var parentNameProp = this._PARENT_NAME_PROP;

        for (fileOrFolder in parent) {
            if (parent.hasOwnProperty(fileOrFolder) && fileOrFolder !== parentProp && fileOrFolder !== parentNameProp) {
                //
                // This is folder
                //
                if (Lib.Helper.isObject(parent[fileOrFolder])) {
                    folders.push('[' + fileOrFolder + ']');
                //
                // This is file
                //
                } else {
                    folders.push(fileOrFolder);
                }
            }
        }

        return folders;
    },

    /**
     * Return true if file with specified name is exists in specified folder
     * @param {Object} parent Parent folder
     * @param {String} file Name of file
     * @return {Boolean}
     * @throw {Error} In case of critical exceptions
     */
    fileExists: function (parent, file) {
        //
        // Wrong parameters check
        //
        this._checkParameters(parent, file);
        return Lib.Helper.isString(parent[file]);
    },

    /**
     * Return reference to the parent folder
     * @param {Object} folder
     * @return {Object|Boolean} Parent folder or false if root
     * @throw {Error} In case of critical exceptions
     */
    getParent: function (folder) {
        //
        // Wrong parameters check
        //
        this._checkParameters(folder);
        return folder[this._PARENT_REF_PROP];
    },

    /**
     * Return reference to the child folder
     * @param {Object} folder
     * @param {String} child Name of child folder
     * @return {Object|Boolean} Parent folder or false if root
     * @throw {Error} In case of critical exceptions
     */
    getChild: function (folder, child) {
        //
        // Wrong parameters check
        //
        this._checkParameters(folder);
        //
        // Check child folder
        //
        if (!Lib.Helper.isString(child) || child === '' || !Lib.Helper.isObject(folder[child])) {
            throw new Error('Invalid child folder');
        }

        return folder[child];
    },

    /**
     * Returns name of the parent folder or '.' for root folder
     * @param {Object} folder
     * @return {Object|Boolean} Parent folder or false if root
     * @throw {Error} In case of critical exceptions
     */
    getParentName: function (folder) {
        //
        // Wrong parameters check
        //
        this._checkParameters(folder);
        return folder[this._PARENT_NAME_PROP];
    },

    /**
     * Returns reference to the root folder
     * @return {Object}
     */
    getRootFolder: function () {
        return this._fs;
    },

    /**
     * Return folder by it's xpath
     * @param {String} xpath XPATH in format folder/folder/.../folder
     * @return {Object|Boolean} Folder or false if not found
     * @throw {Error} In case of critical exceptions
     */
    getFolder: function (xpath) {
        //
        // Parameters check
        //
        if (!Lib.Helper.isString(xpath) || xpath === '') {
            throw new Error('Invalid XPATH for the folder');
        }

        var path = xpath.split(this._XPATH_FOLDER_SPLITTER);
        var len  = path.length;
        var root = this._fs;
        var i;

        for (i = 0; i < len && root; i++) {
            root = root[path[i]];
        }

        return root || false;
    },

    /**
     * Appends data to the file
     * @param {Object} parent Reference to the parent folder object for file
     * @param {String} file Name of file
     * @param {String} data Data we should append to the file
     * @return {Boolean}
     * @throw {Error} In case of critical exceptions
     */
    appendToFile: function (parent, file, data) {
        //
        // Wrong parameters check
        //
        this._checkParameters(parent, file);
        //
        // Logical error check
        //
        if (!this.fileExists(parent, file)) {
            throw new Error('File not found');
        }
        if (!Lib.Helper.isString(data)) {
            throw new Error('Invalid data. String required');
        }

        parent[file] += data;
        return true;
    },

    /**
     * Checks parameters and throws an exception if it wrong
     * @param {Object} parent Reference to the parent folder object for file
     * @param {String} file Name of file
     * @throw {Error} In case of critical exceptions
     * @private
     */
    _checkParameters: function (parent, file) {
        if (!Lib.Helper.isObject(parent) || !this._validFolderObject(this._fs, parent)) {
            throw new Error('Invalid parent object');
        }
        if (arguments.length > 1 && (!Lib.Helper.isString(file) || file === '' || this._FILENAME_RE.test(file))) {
            throw new Error('Invalid file name. Use letters, digits and symbols: _-');
        }
    },

    /**
     * Checks if specified folder exists in the file system tree
     * @param {Object} root Reference to current folder in internal file system tree
     * @param {Object} checkFolder Folder object we should to check
     * @return {Boolean}
     * @private
     */
    _validFolderObject: function (root, checkFolder) {
        var me = this;
        var folder;
        var child;
        var ret;

        if (checkFolder === root) {
            return true;
        }
        for (folder in root) {
            if (root.hasOwnProperty(folder) && folder !== me._PARENT_REF_PROP) {
                child = root[folder];
                if (Lib.Helper.isObject(child)) {
                    if (checkFolder === child) {
                        return true;
                    }
                    ret = me._validFolderObject(child, checkFolder);
                    if (ret) {
                        return ret;
                    }
                }
            }
        }

        return false;
    },

    /**
     * Checks parameters and throws an exception if it wrong
     * @param {Object} parent Reference to the parent folder object for file
     * @param {String} file Name of file
     * @throw {Error} In case of critical exceptions
     * @private
     */
    _checkFile: function (parent, file) {
        if (!this.fileExists(parent, file)) {
            throw new Error('File not found');
        }
    },

    /**
     * Recursive method. Walk throught all folders and adds references to the parent folders.
     * It simplify the navigation by File System tree.
     * @param {Object} root Current folder
     * @param {String} name Name of the parent folder
     */
    _decorateWithParents: function (root, name) {
        var me             = this;
        var parentProp     = me._PARENT_REF_PROP;
        var parentNameProp = me._PARENT_NAME_PROP;
        var folder;
        var child;

        for (folder in root) {
            if (root.hasOwnProperty(folder) && folder !== parentProp) {
                child = root[folder];
                if (Lib.Helper.isObject(child)) {
                    child[parentProp]     = root;
                    child[parentNameProp] = name;
                    me._decorateWithParents(child, folder);
                }
            }
        }
    },

    /**
     * Checks file structure format in a files tree object. File system tree should be without
     * references to the parent nodes (without our decorations).
     * @param {Object} fs Files tree object
     * @private
     * @throw {Error} if fs tree is incorrect
     */
    _checkFS: function (fs) {
        //
        // Check type
        //
        if (!Lib.Helper.isObject(fs)) {
            throw new Error('Invalid file system tree configuration');
        }

        this._checkFSRecursive(fs);
    },

    /**
     * Walk throught file system tree and checks all folders/files there
     * @param {Object} root Current folder
     * @private
     * @throw {Error} if fs tree is incorrect
     */
    _checkFSRecursive: function (root) {
        var me = this;
        var folder;
        var child;

        for (folder in root) {
            if (root.hasOwnProperty(folder)) {
                child = root[folder];
                //
                // If it is a folder, goes deeper
                //
                if (Lib.Helper.isObject(child)) {
                    me._checkFSRecursive(child);
                //
                // This is a file
                //
                } else if (!Lib.Helper.isString(child)) {
                    throw new Error('File structure id incorrect. One item doesn\'t look like a file. Name: ' + folder + ', Body: ' + child);
                }
            }
        }
    }
});