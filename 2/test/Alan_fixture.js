/**
 * Unit tests for Alan class.
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
var assert      = require("assert");
var Simple      = require("./Alan").Alan;
var NUnitHelper = require("./Helper").NUnitHelper;
var Helper      = require("./../../lib/js/Helper.js").Helper;
var fs          = require("fs");


exports.testScripts = function (test) {
    var path = './../2/test/scripts/Alan/';

    NUnitHelper.runScript(path + 'set.alan', false, {v1: 0, v2: 'str', v4: 12, v5: 'qwerty', n1: 2});
    NUnitHelper.runScript(path + 'set-empty-arr.alan', true);
    NUnitHelper.runScripts(path + 'set', 1, 17);

    NUnitHelper.runScript(path + 'cut.alan', false, {d1: 'q', d2: 'q'});
    NUnitHelper.runScripts(path + 'cut', 1, 9);

    NUnitHelper.runScript(path + 'read.alan', false);
    NUnitHelper.runScript(path + 'read-empty.alan', false);
    NUnitHelper.runScript(path + 'read-folder.alan', true);
    NUnitHelper.runScripts(path + 'read', 1, 8);

    NUnitHelper.runScript(path + 'echo.alan', false);
    NUnitHelper.runScripts(path + 'echo', 1, 4);

    NUnitHelper.runScript(path + 'asc.alan', false, {n1: 65, n2: 65});
    NUnitHelper.runScripts(path + 'asc', 1, 10);

    NUnitHelper.runScript(path + 'goto.alan', false, {a: 2});
    NUnitHelper.runScripts(path + 'goto', 1, 4);

    NUnitHelper.runScript(path + 'gotog.alan', false, {a: 1, b: 3});
    NUnitHelper.runScripts(path + 'gotog', 1, 9);

    NUnitHelper.runScript(path + 'sub.alan', false, {v1: 1});
    NUnitHelper.runScripts(path + 'sub', 1, 10);

    NUnitHelper.runScript(path + 'append.alan', false, {v1: 5, s1: 'qwerty', s3: ''});
    NUnitHelper.runScripts(path + 'append', 1, 7);

    NUnitHelper.runScript(path + 'inc.alan', false, {v1: 4, v2: 1});
    NUnitHelper.runScripts(path + 'inc', 1, 4);

    NUnitHelper.runScript(path + 'len.alan', false, {l1: 3, l2: 3});
    NUnitHelper.runScripts(path + 'len', 1, 11);

    NUnitHelper.runScript(path + 'dec.alan', false, {v1: 9});
    NUnitHelper.runScripts(path + 'dec', 1, 5);

    NUnitHelper.runScript(path + 'xor.alan', false, {v3: 164});
    NUnitHelper.runScripts(path + 'xor', 1, 20);

    NUnitHelper.runScript(path + 'char.alan', false, {v2: 'A'});
    NUnitHelper.runScripts(path + 'char', 1, 11);

    NUnitHelper.runScript(path + 'hex.alan', false, {hex: '10', hex1: '01'});
    NUnitHelper.runScripts(path + 'hex', 1, 16);

    assert.doesNotThrow(function () {
        NUnitHelper.runScript(path + 'write.alan', false);
        assert.strictEqual(fs.existsSync('file'), true, 'file "file" should exists');
        assert.strictEqual(fs.readFileSync('file', 'utf-8'), '123', 'Check file content after write command');
    }, undefined, 'test write command');
    NUnitHelper.runScripts(path + 'write', 1, 12);

    test.done();
};