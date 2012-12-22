/**
 * Contains helper functions for testing
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
App.test = {
    /**
     * Calls callback function with all type of parameters (array, boolean, function,...)
     * @param {String} msg Prefix for messages
     * @param {Function} cb Callback function
     */
    callWithAllTypes: function (msg, cb) {
        assertException(msg + ' - not empty string', function() {
            cb('Hello world!');
        });
        assertException(msg + ' - string with one space', function() {
            cb(' ');
        });
        assertException(msg + ' - empty string', function() {
            cb('');
        });
        assertException(msg + ' - number 123', function() {
            cb(123);
        });
        assertException(msg + ' - number 0', function() {
            cb(0);
        });
        assertException(msg + ' - number -1', function() {
            cb(-1);
        });
        assertException(msg + ' - empty function', function() {
            cb(function () {});
        });
        assertException(msg + ' - empty array', function() {
            cb([]);
        });
        assertException(msg + ' - not empty array', function() {
            cb([1,2,3]);
        });
        assertException(msg + ' - NaN', function() {
            cb(NaN);
        });
        assertException(msg + ' - Infinity', function() {
            cb(Infinity);
        });
        assertException(msg + ' - undefined', function() {
            cb(udef);
        });
        assertException(msg + ' - null', function() {
            cb(null);
        });
        assertException(msg + ' - boolean true', function() {
            cb(true);
        });
        assertException(msg + ' - boolean false', function() {
            cb(false);
        });
        assertException(msg + ' - regexp', function() {
            cb(/[^]/);
        });
        assertException(msg + ' - object', function() {
            cb({});
        });
    },

    /**
     * Creates simple File System tree and return it
     * @return {Object} in format {fs: Object, data: String}
     */
    createSimpleFs: function () {
        var data = {
            folder: {
                file: 'old'
            }
        };
        var fs   = new App.Fs(data);

        return {fs: fs, data: fs.getRootFolder()};
    }
};