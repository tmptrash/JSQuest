/**
 * Stub for language support. Now, it doesn't support different languages. It only return
 * untranslated string.
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
Lib.Language = {
    /**
     * Language translation function. Translates string into the current
     * language. It only the stub. It doesn't work fully now. You can use
     * printf similar format. e.g. _('Hello {0}', 'Vasya') -> 'Hello Vasya'
     * @param {String} s String we should to translate
     * @return {String} Translated string
     * @private
     */
    _: function (s) {
        var args = Array.prototype.slice.call(arguments);
        var str  = s;
        var arg;
        var len;

        args.shift();
        for (arg = 0, len = args.length; arg < len; arg++) {
            str = str.replace('{' + arg + '}', args[arg]);
        }

        return str;
    }
};


//
// This peace of code is only for case, when you use this class with Node.js
//
if (typeof exports !== 'undefined') {
    exports.Language = Lib.Language;
} else {
    /**
     * {Function} Global shortcuts.
     */
    var _ = Lib.Language._;
}