/**
 * This is simple Assembler like language interpreter's base class. It preprocess and translates
 * string scripts line by line. It doesn't know about special commands. It only knows
 * amount of arguments and line regexp, if needed. Default script line looks like:
 *
 * operator var1[, var2, ...], where
 *     operator - name of language operator. e.g.: set, cut, read,...
 *     varX     - name of variable
 *
 * The interpreter works only with variables. Constants are not supported, but can be implemented
 * in command callback methods within child classes.
 * Every script line should be separated by separator. See separator config property. By default
 * it is '\r\n' or '\n' symbols. Charset of the script should be set in charset configuration. It's
 * utf-8 by default.
 *
 * It also supports comments and labels. By default, comment looks like this:
 * #
 * # This is a comment
 * #
 *
 * Default label looks like this:
 * :labelName
 *
 * Available configuration is:
 *     fileExtension - extension of script files. e.g.: 'script' or 'txt'. 'simple' by default
 *     charSet       - script charset. It uses for correct file opening.
 *     separator     - operators separator string. '\r\n' or '\n' by default.
 *     commentRe     - RegExp expression for comment. Default comment is '#'
 *     labelRe       - RegExp expression for label. Default format is: :labelName. See _LABEL_RE constant.
 *
 * Usage:
 * //
 * // The simplest example, how we can use this class directly.
 * // In this case, it can parse comments and labels, but without command support.
 * //
 * var simple = new Simple({
 *     commands: {}
 * });
 *
 * s.run('#\n# Comment\n#\n:label\n# end of script');
 *
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */

/**
 * This is where requires section begins. We include the libraries, we want to use.
 */
var fs        = require('fs');
var speculoos = require('./../../lib/js/external/speculoos.js');
var Helper    = require('./../../lib/js/Helper.js').Helper;
var Class     = require('./../../lib/js/Class.js').Class;

/**
 * Simple interpreter class
 */
var Simple = speculoos.Class({
    extend       : Class,

    /**
     * @const
     * {String} Return symbols for Windows OS. It uses by preprocessor as line separator by default.
     */
    _RETURN_WIN  : '\r\n',
    /**
     * @const
     * {String} Return symbols for UNIX OS. It uses by preprocessor as line separator by default.
     */
    _RETURN_UNIX : '\n',
    /**
     * @const
     * {RegExp} Expression for command and first parameter. e.g. inc i. You should use round brackets
     * for command and first argument. Preprocessor uses these expressions for splitting command and
     * the parameter. Command must be on a first place, before the argument. Other symbols will be ignored.
     */
    _CMD_RE      : /^\s*([a-zA-Z_]+)\s+([a-zA-Z_]+[0-9]*[a-zA-Z_]*)+\s*.*$/,
    /**
     * @const
     * {RegExp} Expression for command only (without first parameter). e.g.: inc ... Don't forget about
     * round brackets. First brackets interprets as a command. Other symbols will be ignored.
     */
    _CMD_ONLY_RE : /^\s*([a-zA-Z_]+)\s+.*/,
    /**
     * @const
     * {RegExp} Expression for one variable within one command. e.g.: asc ch, n; where ch and n - variables.
     * You must use one round brackets for the variable.
     */
    _VAR_RE      : /^\s*([a-zA-Z_]+[0-9]*[a-zA-Z_]*)+\s*(#{1}.*)*$/,
    /**
     * @const
     * {RegExp} Expression for label. e.g: :label. You must use round brackets around label name.
     */
    _LABEL_RE    : /^\s*:\s*([a-zA-Z_]+[0-9]*[a-zA-Z_]*)+\s*(#{1}.*)*$/,
    /**
     * @const
     * Default comment regexp. This is line comment. So, if line starts from comment symbol. It will
     * be removed.
     * @private
     */
    _COMMENT_RE  : /^\s*#/,


    /**
     * @constructor
     * Uses only for parent constructor call.
     */
    constructor: function () {
        Simple.base.constructor.apply(this, arguments);
    },

    /**
     * @override
     * Check configuration correctness
     */
    initConfig: function () {
        Simple.base.initConfig.apply(this, arguments);

        if (this.cfg.fileExtension !== undefined && (!Helper.isString(this.cfg.fileExtension) || this.cfg.fileExtension.length < 1)) {
            throw new Error('Invalid script file extension configuration');
        }
        if (this.cfg.charSet !== undefined && (!Helper.isString(this.cfg.charSet) || this.cfg.charSet.length < 1)) {
            throw new Error('Invalid script charset configuration');
        }
        if (this.cfg.separator !== undefined && (!Helper.isString(this.cfg.separator) || this.cfg.separator.length < 1)) {
            throw new Error('Invalid script separator configuration');
        }
        if (this.cfg.commentRe !== undefined && !Helper.isRegexp(this.cfg.commentRe)) {
            throw new Error('Invalid comment configuration');
        }
        if (this.cfg.labelRe !== undefined && !Helper.isRegexp(this.cfg.labelRe)) {
            throw new Error('Invalid label configuration');
        }
        if (!Helper.isObject(this.cfg.commands)) {
            throw new Error('Invalid script commands configuration');
        }
    },

    /**
     * @override
     * Creates all private fields of a class
     */
    initPrivates: function () {
        /**
         * @prop
         * {Object} Global map of variables. Key - var name, value - it's value
         * @private
         */
        this._vars = {};
        /**
         * @prop
         * {Object} Global map of labels. Key - label name, value - script line number
         * @private
         */
        this._labels = {};
        /**
         * @prop
         * {String} Script files extension. Can be changed by fileExtension config parameter.
         * @private
         */
        this._fileExtension = this.cfg.fileExtension || 'simple';
        /**
         * @prop
         * {String} Script file charset. Can be changed by charset config parameter.
         * @private
         */
        this._charSet = this.cfg.charSet || 'utf-8';
        /**
         * @prop
         * Default keywords separator (e.g.: ';' symbol in C\C++). null means windows or unix. See _RETURN_WIN|_RETURN_UNIX constants
         * @private
         */
        this._separator = this.cfg.separator || null;
        /**
         * @prop
         * Comment regexp
         * @private
         */
        this._commentRe = this.cfg.commentRe || this._COMMENT_RE;
        /**
         * @prop
         * Label regexp
         * @private
         */
        this._labelRe   = this.cfg.labelRe || this._LABEL_RE;
        /**
         * @prop
         * {Object} Map of commands. Key - command name, value - object in format {arguments-count: callback}
         * or amount of arguments.
         * @private
         */
        this._commands = this.cfg.commands;
    },

    /**
     * @override
     * Creates/initializes all public fields in a class
     */
    initPublics: function () {
        /**
         * @readonly
         * @prop
         * {String|Array} Reference to internal script representation. After run() method call
         * it contains array. During run(), it contains string.
         */
         this.source = '';
    },

    /**
     * Sets script file or script string for translating and run it. Source code should be in UTF-8 charset if
     * you use file. In a simple case you should use only this method, after you created the instance.
     * @param {String} script Path to the file with script or script string
     */
    run: function (script) {
        var ext    = this._fileExtension;
        var extLen = ext.length;

        /**
         * Only string scripts are supported
         */
        if (!Helper.isString(script)) {
            throw new Error('Invalid script parameter in run method. Should be a string.');
        }

        /**
         * If it is a file, load it from file system
         */
        if (script.substr(script.length - extLen) === ext) {
            this.source = fs.readFileSync(script, this._charSet);
        } else {
            this.source = script;
        }

        this.interpret(this.preprocess(this.source));
    },

    /**
     * Prepares source code for interpreting. Remove comments and process labels. It also do some stuff
     * if child class overrides onPreprocessLine() method. You should pass raw script code here.
     * @param {String} lines Source code of script
     * @return {Array} Array of prepared for translation lines
     */
    preprocess: function (lines) {
        var i;
        var len;
        var line;


        this.reset();

        if (!Helper.isString(lines)) {
            throw new Error('Invalid script parameter in preprocess() method.');
        }

        /**
         * Splits code into the lines and remove comments. Also it process labels.
         * Public source property will be store an array of preprocessed script lines.
         */
        this.source = lines = lines.split(this._getSeparator(lines));

        for (i = 0, len = lines.length; i < len; i++) {
            line = lines[i];

            if (this.isEmpty(line)) {
                this.onPreprocessEmpty(lines, i, line);
            /**
             * Parses comment
             */
            } else if (this.isComment(line)) {
                this.onPreprocessComment(lines, i, line);
            /**
             * Parses label
             */
            } else if (this.isLabel(line)) {
                this.onPreprocessLabel(lines, i, line);
            /**
             * Parses or just skips all other lines
             */
            } else {
                this.onPreprocessLine(lines, i, line);
            }
        }

        return lines;
    },

    /**
     * Interprets script text. This method should be called after preprocess() method. It works with
     * an array of preprocessed script lines.
     * @param {Array} lines Source code of script in lines
     */
    interpret: function (lines) {
        /**
         * Current line
         */
        var line        = 0;
        var linesAmount = lines.length;
        var scriptLine;

        while (line < linesAmount) {
            scriptLine = lines[line];

            /**
             * Skip empty lines
             */
            if (scriptLine === '') {
                line++;
            /**
             * This is a command, run it
             */
            } else {
                line = this.runCommand(line, scriptLine);
            }
        }
    },

    /**
     * Resets state of interpreter. It means that, it will remove all internal data of interpreter.
     */
    reset: function () {
        this._vars   = {};
        this._labels = {};
    },

    /**
     * Calls every time then, preprocessor finds an empty line.
     * @param {Array} lines Array of script lines
     * @param {Number} index Number of current line
     * @param {String} line Current script line
     */
    onPreprocessEmpty: function (lines, index, line) {
        lines[index] = '';
    },

    /**
     * Calls every time then preprocessor finds a comment. By default we clear this line.
     * @param {Array} lines Array of script lines
     * @param {Number} index Number of current line
     * @param {String} line Current script line
     */
    onPreprocessComment: function (lines, index, line) {
        /**
         * Remove comment by default. It will be just an empty line.
         * You shouldn't remove line, because labels can be broken.
         */
        lines[index] = '';
    },

    /**
     * Calls every time then preprocessor finds a label. By default we clear this line.
     * @param {Array} lines Array of script lines
     * @param {Number} index Number of current line
     * @param {String} line Current script line
     */
    onPreprocessLabel: function (lines, index, line) {
        var label = this.getLabel(line);

        if (this._labels[label]) {
            throw new Error('Label "' + label + '" is already exists at line "' + line + '"');
        }
        this._labels[label] = index;
        lines[index] = '';
    },

    /**
     * @abstract
     * Calls every time then preprocessor find 'unknown' command. Unknown means: not a label/comment.
     * @param {Array} lines Array of script lines
     * @param {Number} index Number of current line
     * @param {String} line Current script line
     */
    onPreprocessLine: function (lines, index, line) {},

    /**
     * Run one command and return new line position in script. It calls from interpreter.
     * @param {Number} line Line number in script
     * @param {String} scriptLine Current script line
     * @return {Number}
     */
    runCommand: function (line, scriptLine) {
        var cmd    = this.getCommand(scriptLine);
        var count  = this._commands[cmd];
        var regexp = Helper.isObject(count) ? this._commands[cmd].regexp : undefined;
        var args   = this.getArguments(scriptLine, Helper.isNumber(count) ? count : count.args, regexp);
        var cmdFn  = this['on' + cmd.charAt(0).toUpperCase() + cmd.slice(1)];

        if (Helper.isFunction(cmdFn)) {
            return cmdFn.apply(this, [line, scriptLine].concat(args));
        }

        throw new Error('Command was set, but it has no handler at line "' + line + '"');
    },

    /**
     * Returns true if specified line is empty. Empty means ' \t'
     *
     * @param {String} line Raw one script line
     */
    isEmpty: function (line) {
        return Helper.trim(line) === '';
    },

    /**
     * Checks if specified line is comment. It calls from preprocessor.
     * @param {String} line Raw one script line
     * @return {Boolean}
     */
    isComment: function (line) {
        return this._commentRe.test(line);
    },

    /**
     * Checks if specified line is the label. It calls from preprocessor.
     * @param {String} line Raw one script line
     * @return {Boolean}
     */
    isLabel: function (line) {
        return this._labelRe.test(line);
    },

    /**
     * Return name of label in specified raw line of code. It calls from preprocessor.
     * @param {String} line Raw code line
     * @return {String}
     * @throw {Error}
     */
    getLabel: function (line) {
        var res = this._labelRe.exec(line);

        if (!res || res.length < 2) {
            throw new Error('Invalid label operator at line "' + line + '"');
        }

        return res[1];
    },

    /**
     * Return name of the command in specified raw line of script. It calls from interpreter.
     * @param {String} line One raw script line
     * @return {String} Command name
     */
    getCommand: function (line) {
        var cmd = this._CMD_ONLY_RE.exec(line);

        if (!cmd || cmd.length < 2) {
            throw new Error('Invalid or unknown command at line "' + line + '"');
        }
        if (!this._commands[cmd[1]]) {
            throw new Error('Unknown command ' + cmd + ' at line "' + line + '"');
        }

        return cmd[1];
    },

    /**
     * Gets one argument from specified string. Calls from interpreter.
     * @param {String} line Current raw script line
     * @param {String} part String with raw argument
     * @param {Boolean} isFirst true if this is first argument
     * @return {String} name of variable
     * @private
     */
    getArgument: function (line, part, isFirst) {
        var regexp;

        /**
         * First argument must be in any case
         */
        if (isFirst) {
            regexp = this._CMD_RE.exec(part);
            if (!regexp || regexp.length < 3) {
                throw new Error('Invalid command or first argument at line "' + line + '"');
            }
            return regexp[2];
        }

        /**
         * Try to get second, third and so on argument
         */
        regexp = this._VAR_RE.exec(part);
        if (!regexp || regexp.length < 2) {
            throw new Error('Invalid second argument in command at line "' + line + '"');
        }

        return regexp[1];
    },

    /**
     * Return arguments array with 1, 2 and so on arguments. Every item of array - is a name of the variable
     * within the script.
     * @param {String} line One script line
     * @param {Number} argCount Amount of arguments in current command
     * @param {RegExp} regexp RegExp for script line
     * @return {Array} Array of values
     * @private
     */
    getArguments: function (line, argCount, regexp) {
        var args;
        var params = [];
        var i;

        if (regexp && Helper.isRegexp(regexp)) {
            params = regexp.exec(line);
            if (!params) {
                throw new Error('Invalid command format at line "' + line + '"');
            }
            /**
             * Remove entire string and the operator at the beginning
             */
            params.shift();
            params.shift();
        /**
         * RegExp expression didn't set, use default regexp
         */
        } else {
            args = line.split(',');
            for (i = 0; i < argCount; i++) {
                params.push(this.getArgument(line, args[i], i === 0));
            }
        }

        return params;
    },

    /**
     * Return variable's value. It calls after script ran.
     * @param {String} v Name of variable to return
     * @return {String|Number|Boolean} value of the variable or false if undefined
     */
    getVar: function (v) {
        return this._vars[v] === undefined ? false : this._vars[v];
    },

    /**
     * Sets variable's value
     * @param {String} v Name of variable to set
     */
    setVar: function (v, val) {
        return this._vars[v] = val;
    },

    /**
     * Return script line number, where specified label was defined.
     * @param {String} label Name of label
     * @return {Number} Line number or -1 if label is undefined
     */
    getLineByLabel: function (label) {
        return this._labels[label] || -1;
    },

    /**
     * Checks whenever specified variable is exists. You should use this method after preprocess() method
     * @param {String} label Name of label to check
     * @return {Boolean}
     */
    hasLabel: function (label) {
        return this._labels[label] !== undefined;
    },

    /**
     * Return true if specified variable is exist
     * @param {String} v Name of variable
     * @return {Boolean}
     */
    hasVar: function (v) {
        return this._vars[v] !== undefined;
    },

    /**
     * Return keyword separator string. e.g: ';' symbol in C\C++
     * @param {String} script Script raw code
     * @return {String} separator string or symbol
     * @private
     */
    _getSeparator: function (script) {
        var separator = this._separator;

        /**
         * Separator string was not set. Set to default one depending of script content
         */
        if (separator === null) {
            return script.indexOf(this._RETURN_WIN) !== -1 ? this._RETURN_WIN : this._RETURN_UNIX;
        }

        return separator;
    }
});

/**
 * Exports Simple interpreter class
 * @type {Simple}
 */
exports.Simple = Simple;