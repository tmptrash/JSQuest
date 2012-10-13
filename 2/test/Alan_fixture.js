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

    test.done();
};