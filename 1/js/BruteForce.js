/**
 * This console application try to find password for archive, executing unpacker command line utility,
 * using brute force algorithm. It gets all ASCII characters from 0 to 255 (excepts CHAR_EXCLUDE)
 * and generates passwords from 1 to len symbols. Archive will be called with all generated passwords.
 *
 * Call format:
 *     node BruteForce.js unpackerPath passwordLength
 * Usage:
 *     C:\>node BruteForce.js 7z.exe packedFile 2
 *   will produce passwords:
 *     '!', '#',... 'z', '!!', '!#',... 'zz'
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */

/**
 * {Object} Object in format {stdout:String, stderr:String}. This is synchronous execution package. It runs specified
 * application binary and returns it's stdout string. We should call this function with second argument in true to obtain
 * stdout/stderr object.
 */
var exec = require('exec-sync');


/**
 * @const
 * {Number} OK error code of our application. This code will be returned to OS after execution if all ok.
 */
var RETURN_OK        = 0;
/**
 * @const
 * {Number} OK error code. This code will be returned to OS after execution in case of error.
 */
var RETURN_ERR       = -1;
/**
 * @const
 * {Number} Index of first ASCII character for the password. First character is '!'
 */
var CHAR_INDEX_START = 33;
/**
 * @const
 * {Number} Index of last ASCII character for the password. Last character is 'z'
 */
var CHAR_INDEX_END   = 122;
/**
 * @const
 * {Object} Character which we should exclude from password string. The values meaning nothing.
 * Symbols by code:     "      &      <      >      `      |
 */
var CHAR_EXCLUDE     = {34: 1, 38: 1, 60: 1, 62: 1, 96: 1, 124: 1};

/**
 * @prop
 * {String} Path to the packed file, that we should to brute force. User will pass this parameter thought command line argument
 */
var packedFile       = null;
/**
 * @prop
 * {String} Path to the unpacker command line utility. User will pass this parameter thought command line argument
 */
var unpackerPath     = null;

/**
 * Formats date and time like this: YYYY-MM-DD hh:mm:ss
 * @param {Date} dt date object
 * @return {String} formatted date  and time
 */
function formatTime(dt) {
    return (
        dt.toISOString().
        replace(/T/, ' ').        // replace T with a space
        replace(/\..+/, '')       // delete the dot and everything after
    );
}

/**
 * Executes unpacker utility using current password array. It converts array into a string
 * of characters (character per ASCII index) and joins it. If passed password key is correct,
 * then unpacker utility will return a message with a small report inside (in stdout property).
 * This report should starts with string: 'Everything is Ok'.
 * It will be our success text marker.
 * @param {Array} arr Array of symbol codes. e.g.: [65, 66] means 'AB'
 * @return {Boolean} true means that password found, false otherwise
 */
function execUnpacker(arr) {
    var pwd = String.fromCharCode.apply(null, arr);
    var stdout;

    //
    // This is how data file was compressed: 7z a -mx0 -mhe test *.*
    //
    stdout = exec(unpackerPath + ' e -y -p' + pwd + ' ' + packedFile, true).stdout;
    if (stdout.indexOf('Everything is Ok') !== -1) {
        console.log('Password was cracked: "' + pwd + '"');
        return true;
    }

    return false;
}

/**
 * This function iterates by character codes from 0 to 255 and calls unpacker utility in command line. It recursive
 * and calls itself on every symbol in the password. If arr.length === 3, then it will be called 103^3 times. 103,
 * means amount of symbols for the password. This function operates by array of ASCII codes. Every code is a number
 * in ASCII table. e.g.: [65, 66, 67] means, that current password is 'ABC'. Next one will be 'ABD', the next 'ABE'
 * and so on.
 * @param {Array} arr Array of symbol's codes
 * @param {Number} pos Position of the symbol in arr array
 * @return {Boolean} true - password found, false - password was not found
 */
function iterate(arr, pos) {
    var ret = false;
    var i;

    for (i = CHAR_INDEX_START; i <= CHAR_INDEX_END; i++) {
        if (pos < arr.length - 1) {
            if (CHAR_EXCLUDE[i] === undefined) {
                arr[pos] = i;
                arr[pos + 1] = CHAR_INDEX_START;
                ret = iterate(arr, pos + 1);
                if (ret) {
                    break;
                }
            }
        } else {
            if (CHAR_EXCLUDE[arr[pos]] === undefined) {
                ret = execUnpacker(arr);
                if (ret) {
                    break;
                }
            }
            arr[pos]++;
        }
    }

    return ret;
}

/**
 * This function try to find correct password for the file compressed by unpacker utility. It works with amount of
 * symbols in the password (len argument). It starts from 1 length password and will finish with len
 * symbols in password.
 * @param {Number} len Length of characters in the password
 * @return {Number} code number. RETURN_OK - ok, RETURN_ERR - error code
 */
function bruteForce(len) {
    var pwd = [CHAR_INDEX_START];
    var ret;
    var i;

    for (i = 0; i < len; i++) {
        ret = iterate(pwd, 0);
        if (ret) {
            return RETURN_OK;
        }
        pwd.push(CHAR_INDEX_START);
    }

    return RETURN_ERR;
}

/**
 * Application's entry point
 * @param {Array} argv Array of parameters in format: ['../node.exe', arg1, arg2,...]
 * @return {Number} code number. RETURN_OK - ok, RETURN_ERR - error code
 */
function main(argv) {
    var ret;

    if (argv.length < 5) {
        console.log('Incorrect amount of arguments. Usage: C:\\>node.exe BruteForce.js 7z.exe packedFile 6');
        return RETURN_ERR;
    }
    console.log('Started at', formatTime(new Date()));
    packedFile   = argv[3];
    unpackerPath = argv[2];
    ret = bruteForce(parseInt(argv[4], 10));
    console.log('Finished at', formatTime(new Date()));

    return ret;
}


/**
 * This line starts our command line utility
 */
process.exit(main(process.argv));