/**
 * 
 */
App.test = {};
App.test.Helper = {
    callWithAllTypes: function (msg, cb) {
        assertException(function () {
            cb('Hello world!');
        }, undefined, msg + ' - not empty string');
        assertException(function () {
            cb(' ');
        }, undefined, msg + ' - string with one space');
        assertException(function () {
            cb('');
        }, undefined, msg + ' - empty string');
        assertException(function () {
            cb(123);
        }, undefined, msg + ' - number 123');
        assertException(function () {
            cb(0);
        }, undefined, msg + ' - number 0');
        assertException(function () {
            cb(-1);
        }, undefined, msg + ' - number -1');
        assertException(function () {
            cb(function () {});
        }, undefined, msg + ' - empty function');
        assertException(function () {
            cb([]);
        }, undefined, msg + ' - empty array');
        assertException(function () {
            cb([1, 2, 3]);
        }, undefined, msg + ' - not empty array');
        assertException(function () {
            cb(NaN);
        }, undefined, msg + ' - NaN');
        assertException(function () {
            cb(Infinity);
        }, undefined, msg + ' - Infinity');
        assertException(function () {
            cb(undefined);
        }, undefined, msg + ' - undefined');
        assertException(function () {
            cb(null);
        }, undefined, msg + ' - null');
        assertException(function () {
            cb(true);
        }, undefined, msg + ' - boolean true');
        assertException(function () {
            cb(false);
        }, undefined, msg + ' - boolean false');
        assertException(function () {
            cb(/[^]/);
        }, undefined, msg + ' - regexp');
        assertException(function () {
            cb({});
        }, undefined, msg + ' - object');
    }
};