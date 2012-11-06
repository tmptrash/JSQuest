/**
 * This application try to find password for DAR archive executing dar command line utility
 * using brute force algorithm. It gets all ASCII characters from 0 to 255 and makes password
 * from 1 to len symbols.
 *
 * Call format:
 *     node Archiver.js 'path to the dar archiver executable' amountOfSymbols
 * Usage:
 *     C:\>node Archiver.js dar.exe 2
 *   will produce passwords:
 *     '\x0000', '\x0001',... '\x00FF', '\x0000\x0000', '\x0000\x0001',... '\x00FF\x00FF'
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */

var exec = require('child_process').exec;

/**
 * Executes DAR utility using current password array
 * @param {Array} arr Array of symbol codes. e.g.: [65, 66] means 'AB'
 * @param {String} darPath Path to the DAR utility
 */
function execDar(arr, darPath) {
    exec();
}

/**
 * This function iterates by character codes from 0 to 255 and calls DAR utility in command line. It
 * calls command line utility 256 times and exits.
 * @param {Array} arr Array of symbol's codes
 * @param {Number} pos Position of the symbol in arr array
 */
function iterate(arr, pos) {
    for (var i = 0; i < 256; i++) {
        if (pos < arr.length - 1) {
            arr[pos] = i;
            arr[pos + 1] = 0;
            iterate(arr, pos + 1);
        } else {
            console.log(arr.join(','));
            arr[pos]++;
        }
    }
}

/**
 * This function try to find correct password for file compressed by DAR utility. It works with amount of
 * symbols in the password (len argument). It starts from 1 length password and will finish with len
 * symbols in password.
 * @param {Number} len Length of characters in the password
 */
function bruteForce(len) {
    var pwd = [0];

    for (var i = 0; i < len; i++) {
        iterate(pwd, 0);
        pwd.push(0);
    }
}

/**
 * Application's entry point
 * @param {Array} argv Array of parameters in format: ['../node.exe', arg1, arg2,...]
 * @return {Number} code number. 0 - ok, !0 - error code
 */
function main (argv) {
    if (argv.length < 3) {
        console.log('Incorrect amount of arguments. Usage: C:\>node.exe ./dar.exe 6');
        return 1;
    }

    bruteForce(argv[1], argv[2]);

    return 0;
}

process.exit(main(process.argv));