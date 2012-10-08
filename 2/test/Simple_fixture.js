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

    assert.doesNotThrow(function () {
        var s = new Simple({
            separator: ';',
            commands : {}
        });

        s.run(';;');
        assert.strictEqual(s.source.length, 3, 'Check two separators');
        assert.strictEqual(s.source[0], '', 'Check empty lines');
        assert.strictEqual(s.source[1], '', 'Check empty lines');
        assert.strictEqual(s.source[2], '', 'Check empty lines');
    }, undefined, 'Check separator config property');

    assert.doesNotThrow(function () {
        var s = new Simple({
            commentRe: /^\s*\/\//,
            commands : {}
        });

        s.run('// test\n//123\n//');
        assert.strictEqual(s.source.length, 3, 'Check comments amount');
        assert.strictEqual(s.source[0], '', 'Check row after comment');
        assert.strictEqual(s.source[1], '', 'Check row after comment');
        assert.strictEqual(s.source[2], '', 'Check row after comment');
    }, undefined, 'Check custom (C style) comments');

    assert.doesNotThrow(function () {
        var s = new Simple({
            labelRe: /^\s*:([0-9]+)\s*/,
            commands : {}
        });

        s.run('#\n:1\n');
        assert.strictEqual(s.source.length, 3, 'Check rows amount');
        assert.strictEqual(s.source[0], '', 'Check first row');
        assert.strictEqual(s.source[1], '', 'Check second row');
        assert.strictEqual(s.source[2], '', 'Check third row');
        assert.strictEqual(s.hasLabel('1'), true, 'Check label existence');
    }, undefined, 'Check custom labels');

    assert.doesNotThrow(function () {
        var s = new Simple({
           commands: {}
        });

        s.run('#\n:l\n#\n\n');
        s.run('../2/scripts/runTest.simple');
    }, undefined, 'Checks run() method');

    test.done();
};