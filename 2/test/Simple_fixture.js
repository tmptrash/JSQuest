/**
 * Unit tests for Simple class.
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
var assert      = require("assert");
var Simple      = require("../app/Simple").Simple;
var NUnitHelper = require("./Helper").NUnitHelper;
var Helper      = require("./../../lib/Helper.js").Helper;


exports.testConstructor = function (test) {
    assert.throws(function () {
        new Simple();
    }, undefined, 'create Simple class instance without configuration');

    assert.throws(function () {
        new Simple({});
    }, undefined, 'create Simple class instance with empty configuration');

    assert.doesNotThrow(function () {
        NUnitHelper.callWithAllTypes('Check constructor', function (arg) {
            new Simple(arg);
        });
    }, undefined, 'create Simple class instance');

    assert.doesNotThrow(function () {
        new Simple({
            commands: {
                read: 2
            }
        });
    }, undefined, 'create Simple class instance');

    test.done();
};

exports.testRun = function (test) {
    assert.doesNotThrow(function () {
        var s = new Simple({
            fileExtension: 'alan',
            commands     : {}
        });

        NUnitHelper.callWithAllTypes('Check constructor', function (arg) {
            if (Helper.isString(arg)) {
                throw new Error('String');
            }
            s.run(arg);
        });
    }, undefined, 'Check fileExtension config property');

    assert.throws(function () {
        var s = new Simple({
            fileExtension: 'alan',
            commands     : {}
        });

        s.run('../2/scripts/empty.alan123');
    }, undefined, 'Check wrong fileExtension config property');

    assert.doesNotThrow(function () {
        var s = new Simple({
            fileExtension: 'alan',
            commands     : {}
        });

        s.run('../2/scripts/empty.alan');
        assert.strictEqual(s.source.length, 1, 'Check empty script');
        assert.strictEqual(s.source[0], '', 'Check empty script');
    }, undefined, 'Check fileExtension config property');

    test.done();
};