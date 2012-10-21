/**
 * Unit tests for Alan class.
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
var assert      = require("assert");
var Simple      = require("../app/Alan").Alan;
var NUnitHelper = require("./Helper").NUnitHelper;
var Helper      = require("./../../lib/Helper.js").Helper;
var fs          = require("fs");


exports.testScripts = function (test) {
    var path = './../2/test/scripts/Alan/';

    NUnitHelper.runScript(path + 'set.alan', false, {v1: 0, v2: 'str', v4: 12, v5: 'qwerty'});
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


    test.done();
};