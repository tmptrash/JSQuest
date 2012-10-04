/**
 * Node.js NUnitJS helper functions
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
var assert = require('assert');

var NUnitHelper = {
    /**
     * Calls callback function with all type of parameters (array, boolean, function,...)
     * @param {String} msg Prefix for messages
     * @param {Function} cb Callback function
     */
    callWithAllTypes: function (msg, cb) {
        assert.throws(function() {
            cb('Hello world!');
        }, undefined, msg + ' - not empty string');
        assert.throws(function() {
            cb(' ');
        }, undefined, msg + ' - string with one space');
        assert.throws(function() {
            cb('');
        }, undefined, msg + ' - empty string');
        assert.throws(function() {
            cb(123);
        }, undefined, msg + ' - number 123');
        assert.throws(function() {
            cb(0);
        }, undefined, msg + ' - number 0');
        assert.throws(function() {
            cb(-1);
        }, undefined, msg + ' - number -1');
        assert.throws(function() {
            cb(function () {});
        }, undefined, msg + ' - empty function');
        assert.throws(function() {
            cb([]);
        }, undefined, msg + ' - empty array');
        assert.throws(function() {
            cb([1,2,3]);
        }, undefined, msg + ' - not empty array');
        assert.throws(function() {
            cb(NaN);
        }, undefined, msg + ' - NaN');
        assert.throws(function() {
            cb(Infinity);
        }, undefined, msg + ' - Infinity');
        assert.throws(function() {
            cb(undefined);
        }, undefined, msg + ' - undefined');
        assert.throws(function() {
            cb(null);
        }, undefined, msg + ' - null');
        assert.throws(function() {
            cb(true);
        }, undefined, msg + ' - boolean true');
        assert.throws(function() {
            cb(false);
        }, undefined, msg + ' - boolean false');
        assert.throws(function() {
            cb(/[^]/);
        }, undefined, msg + ' - regexp');
        assert.throws(function() {
            cb({});
        }, undefined, msg + ' - object');
    }
};

exports.NUnitHelper = NUnitHelper;