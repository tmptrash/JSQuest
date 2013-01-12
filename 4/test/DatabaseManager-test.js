/**
 * App.DatabaseManager class test cases
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
var tc = new TestCase('App.DatabaseManager', {
    testConstructor: function () {
        assertNoException('Construct App.DatabaseManager', function () {
            var ct = new App.DatabaseManager();
        });
    },

    testList: function () {
        var me = this;

        assertNoException('list command', function () {
            //
            // Emulates first run
            //
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');
            localStorage.removeItem('jsql4files-d');
            localStorage.removeItem('jsql4sats-s');

            var ct  = new App.DatabaseManager();
            var dbs = ct.list();

            me._checkDefaultFiles(dbs);
        });
    },

    testDimension: function () {
        localStorage.removeItem('jsql4synchronized');
        localStorage.removeItem('jsql4files');
        localStorage.removeItem('jsql4files-d');
        localStorage.removeItem('jsql4sats-s');

        var ct = new App.DatabaseManager();

        assertTrue('Dimension', ct.getDimension() === 'Gb');
    },

    testRemove: function () {
        var me = this;

        assertNoException('Check remove command with invalid arguments', function () {
            App.test.Helper.callWithAllTypes('Check remove for type', function (arg) {
                if (Lib.Helper.isArray(arg)) {
                    throw new Error('Array');
                }

                localStorage.removeItem('jsql4synchronized');
                localStorage.removeItem('jsql4files');
                localStorage.removeItem('jsql4files-d');
                localStorage.removeItem('jsql4sats-s');

                var dm  = new App.DatabaseManager();
                var msg = dm.remove(arg);

                if (msg !== true) {
                    throw new Error(msg);
                }
            });
        });

        assertNoException('Check one database remove', function () {
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');
            localStorage.removeItem('jsql4files-d');
            localStorage.removeItem('jsql4sats-s');

            var dm = new App.DatabaseManager();
            var dbs;

            assertTrue('Facebook removing', dm.remove(['facebook']));
            dbs = dm.list();
            assertTrue('Facebook database exists', dbs.facebook === undefined);
        });
        assertNoException('Check empty database remove', function () {
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');
            localStorage.removeItem('jsql4files-d');
            localStorage.removeItem('jsql4sats-s');

            var dm  = new App.DatabaseManager();

            assertTrue('Facebook removing', dm.remove([]));
            me._checkDefaultFiles(dm.list());
        });
        assertNoException('Check unknown database remove', function () {
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');
            localStorage.removeItem('jsql4files-d');
            localStorage.removeItem('jsql4sats-s');

            var dm  = new App.DatabaseManager();

            assertTrue('Facebook removing', dm.remove(['unknown-db']));
            me._checkDefaultFiles(dm.list());
        });
    },

    testSync: function () {
        var me = this;

        assertNoException('Check sync command with invalid arguments', function () {
            App.test.Helper.callWithAllTypes('Check remove for type', function (arg) {
                if (Lib.Helper.isArray(arg)) {
                    throw new Error('Array');
                }

                localStorage.removeItem('jsql4synchronized');
                localStorage.removeItem('jsql4files');
                localStorage.removeItem('jsql4files-d');
                localStorage.removeItem('jsql4sats-s');

                var dm  = new App.DatabaseManager();

                if (dm.sync(arg) !== true) {
                    throw new Error('Invalid argument');
                }
            });
        });

        assertNoException('Check sync command with one satellite', function () {
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');
            localStorage.removeItem('jsql4files-d');
            localStorage.removeItem('jsql4sats-s');

            var dm  = new App.DatabaseManager();
            var dbs;

            //
            // Sync with first satellite
            //
            assertTrue('Check sync', dm.sync(['s1']) === true);
            dbs = dm.list();
            me._checkDefaultFiles(dbs);
            assertTrue('Check added skype database', dbs.skype.size === 4507578638902);

            //
            // Remove database, added from first satellite
            //
            assertTrue('Check skype database removing', dm.remove(['skype']) === true);
            dbs = dm.list();
            me._checkDefaultFiles(dbs);
            assertTrue('Check removed skype database', dbs.skype === undefined);

            //
            // Sync with first satellite again. skype database should be added again
            //
            assertTrue('Check sync', dm.sync(['s1']) === true);
            dbs = dm.list();
            me._checkDefaultFiles(dbs);
            assertTrue('Check added skype database', dbs.skype === undefined);
        });

        assertNoException('Check sync command with two satellites', function () {
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');
            localStorage.removeItem('jsql4files-d');
            localStorage.removeItem('jsql4sats-s');

            var dm  = new App.DatabaseManager();
            var dbs;

            //
            // Sync with two satellites
            //
            assertTrue('Check sync', dm.sync(['s1', 's3']) === true);
            dbs = dm.list();
            me._checkDefaultFiles(dbs);
            assertTrue('Check added skype database', dbs.skype.size === 4507578638902);
            assertTrue('Check added mail database', dbs.mail.size === 8512758);

            //
            // Remove database, added from first satellite
            //
            assertTrue('Check skype database removing', dm.remove(['skype', 'mail']) === true);
            dbs = dm.list();
            me._checkDefaultFiles(dbs);
            assertTrue('Check removed skype database', dbs.skype === undefined);
            assertTrue('Check removed mail database', dbs.mail === undefined);

            //
            // Sync with first satellite again. skype database should be added again
            //
            assertTrue('Check sync', dm.sync(['s1', 's3']) === true);
            dbs = dm.list();
            me._checkDefaultFiles(dbs);
            assertTrue('Check added skype database', dbs.skype === undefined);
            assertTrue('Check added mail database', dbs.mail === undefined);
        });

        assertNoException('Check sync command with two unknown satellites', function () {
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');
            localStorage.removeItem('jsql4files-d');
            localStorage.removeItem('jsql4sats-s');

            var dm = new App.DatabaseManager();

            //
            // Sync with two unknown satellites
            //
            assertTrue('Check sync', dm.sync(['unk1', 'unk2']) === true);
            me._checkDefaultFiles(dm.list());
        });

        assertNoException('Check sync/remove commands with two satellites', function () {
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');
            localStorage.removeItem('jsql4files-d');
            localStorage.removeItem('jsql4sats-s');

            var dm = new App.DatabaseManager();
            var dbs;

            //
            // Sync with two satellites
            //
            assertTrue('Check sync', dm.remove(['facebook']) === true);
            dbs = dm.list();
            assertTrue('Check removed facebook database', dbs.facebook === undefined);
            dbs = dm.list();
            assertTrue('Check sync', dm.sync(['s1', 's2']) === true);
            dbs = dm.list();
            assertTrue('Check removed facebook database', dbs.facebook === undefined);
        });

        assertNoException('Check sync/remove commands with two satellites', function () {
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');
            localStorage.removeItem('jsql4files-d');
            localStorage.removeItem('jsql4sats-s');

            var dm = new App.DatabaseManager();
            var dbs;

            //
            // Sync with first satellite
            //
            assertTrue('Check sync', dm.sync(['s1']) === true);
            dbs = dm.list();
            me._checkDefaultFiles(dbs);
            assertTrue('Check added skype database', dbs.skype.size === 4507578638902);

            //
            // Check second run
            //
            dm = new App.DatabaseManager();
            me._checkDefaultFiles(dbs);
            assertTrue('Check added skype database', dbs.skype.size === 4507578638902);
        });
    },

    testPack: function () {
        var me = this;

        assertNoException('Check pack command with invalid arguments', function () {
            App.test.Helper.callWithAllTypes('Check pack for type', function (arg) {
                if (Lib.Helper.isArray(arg)) {
                    throw new Error('Array');
                }

                localStorage.removeItem('jsql4synchronized');
                localStorage.removeItem('jsql4files');
                localStorage.removeItem('jsql4files-d');
                localStorage.removeItem('jsql4sats-s');

                var dm  = new App.DatabaseManager();

                if (dm.pack(arg) !== true) {
                    throw new Error('Invalid argument');
                }
            });
        });

        assertNoException('Check pack command with one database', function () {
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');
            localStorage.removeItem('jsql4files-d');
            localStorage.removeItem('jsql4sats-s');

            var dm  = new App.DatabaseManager();
            var packedName = 'facebook-p';
            var dbs;

            assertTrue('Check pack', dm.pack(['facebook']) === true);
            dbs = dm.list();
            me._checkDefaultFiles(dbs);
            assertTrue('Check added facebook database', Lib.Helper.isObject(dbs[packedName]));

            //
            // Try to pack already packed database. It shouldn't be packed
            //
            assertTrue('Check pack', dm.pack([packedName]) === true);
            dbs = dm.list();
            me._checkDefaultFiles(dbs);
            assertTrue('Check added facebook database', Lib.Helper.isObject(dbs[packedName]));
            assertTrue('Check added facebook database', dbs[packedName + '-p'] === undefined);
        });

        assertNoException('Check pack command with unknown database', function () {
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');
            localStorage.removeItem('jsql4files-d');
            localStorage.removeItem('jsql4sats-s');

            var dm  = new App.DatabaseManager();
            var dbs;

            assertTrue('Check pack', dm.pack(['unknown']) === true);
            dbs = dm.list();
            me._checkDefaultFiles(dbs);
            assertTrue('Check added facebook database', dbs['unknown-p'] === undefined);
        });
    },

    testUnpack: function () {
        var me = this;

        assertNoException('Check unpack command with invalid arguments', function () {
            App.test.Helper.callWithAllTypes('Check unpack for type', function (arg) {
                if (Lib.Helper.isArray(arg)) {
                    throw new Error('Array');
                }

                localStorage.removeItem('jsql4synchronized');
                localStorage.removeItem('jsql4files');
                localStorage.removeItem('jsql4files-d');
                localStorage.removeItem('jsql4sats-s');

                var dm  = new App.DatabaseManager();

                if (dm.unpack(arg) !== true) {
                    throw new Error('Invalid argument');
                }
            });
        });

        assertNoException('Check unpack command', function () {
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');
            localStorage.removeItem('jsql4files-d');
            localStorage.removeItem('jsql4sats-s');

            var dm  = new App.DatabaseManager();
            var dbs;

            //
            // First, pack vk database
            //
            assertTrue('Check pack', dm.pack(['vk']) === true);
            dbs = dm.list();
            assertTrue('Check added vk database', Lib.Helper.isObject(dbs['vk-p']));
            //
            // Second, remove original vk database
            //
            assertTrue('Check remove', dm.remove(['vk']) === true);
            //
            // Unpacks
            //
            assertTrue('Check unpack', dm.unpack(['vk-p']) === true);
            dbs = dm.list();
            me._checkDefaultFiles(dbs);
            assertTrue('Check added vk database', Lib.Helper.isObject(dbs.vk));
        });

        assertNoException('Check unpack command with unknown databases', function () {
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');
            localStorage.removeItem('jsql4files-d');
            localStorage.removeItem('jsql4sats-s');

            var dm  = new App.DatabaseManager();
            var dbs;

            assertTrue('Check unpack', dm.unpack(['unknown']) === true);
            dbs = dm.list();
            me._checkDefaultFiles(dbs);
        });

        assertNoException('Check unpack command with not packed database', function () {
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');
            localStorage.removeItem('jsql4files-d');
            localStorage.removeItem('jsql4sats-s');

            var dm  = new App.DatabaseManager();
            var dbs;

            assertTrue('Check unpack', dm.unpack(['vk']) === true);
            dbs = dm.list();
            me._checkDefaultFiles(dbs);
        });
    },

    testEncrypt: function () {
        var me = this;

        assertNoException('Check encrypt command with invalid database names', function () {
            App.test.Helper.callWithAllTypes('Check encrypt for type', function (arg) {
                if (Lib.Helper.isString(arg)) {
                    throw new Error('String');
                }

                localStorage.removeItem('jsql4synchronized');
                localStorage.removeItem('jsql4files');
                localStorage.removeItem('jsql4files-d');
                localStorage.removeItem('jsql4sats-s');

                var dm  = new App.DatabaseManager();

                if (dm.encrypt(arg, '12345678') !== true) {
                    throw new Error('Invalid argument');
                }
            });
        });

        assertNoException('Check encrypt command with invalid encryption key', function () {
            App.test.Helper.callWithAllTypes('Check encrypt for type', function (arg) {
                if (Lib.Helper.isString(arg)) {
                    throw new Error('String');
                }

                localStorage.removeItem('jsql4synchronized');
                localStorage.removeItem('jsql4files');
                localStorage.removeItem('jsql4files-d');
                localStorage.removeItem('jsql4sats-s');

                var dm  = new App.DatabaseManager();

                if (dm.encrypt('vk', arg) !== true) {
                    throw new Error('Invalid argument');
                }
            });
        });

        assertNoException('Check encrypt command with unknown database', function () {
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');
            localStorage.removeItem('jsql4files-d');
            localStorage.removeItem('jsql4sats-s');

            var dm = new App.DatabaseManager();

            assertTrue('Check encrypt', dm.encrypt('unknown', '12345678') !== true);
        });

        assertNoException('Check encrypt command', function () {
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');
            localStorage.removeItem('jsql4files-d');
            localStorage.removeItem('jsql4sats-s');

            var dm = new App.DatabaseManager();
            var dbs;

            assertTrue('Check encrypt', dm.encrypt('vk', '12345678') === true);
            dbs = dm.list();
            me._checkDefaultFiles(dbs);
            assertTrue('Check added vk-e database', Lib.Helper.isObject(dbs['vk-e']));
        });
    },

    testDencrypt: function () {
        var me = this;

        assertNoException('Check decrypt command with invalid database names', function () {
            App.test.Helper.callWithAllTypes('Check decrypt for type', function (arg) {
                if (Lib.Helper.isString(arg)) {
                    throw new Error('String');
                }

                localStorage.removeItem('jsql4synchronized');
                localStorage.removeItem('jsql4files');
                localStorage.removeItem('jsql4files-d');
                localStorage.removeItem('jsql4sats-s');

                var dm  = new App.DatabaseManager();

                if (dm.decrypt(arg, '12345678') !== true) {
                    throw new Error('Invalid argument');
                }
            });
        });

        assertNoException('Check decrypt command with incorrect key', function () {
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');
            localStorage.removeItem('jsql4files-d');
            localStorage.removeItem('jsql4sats-s');

            var dm = new App.DatabaseManager();
            var dbs;

            assertTrue('Check encrypt', dm.encrypt('vk', '12345678') === true);
            dbs = dm.list();
            assertTrue('Check added vk-e database', Lib.Helper.isObject(dbs['vk-e']));
            assertTrue('Check remove', dm.remove(['vk']) === true);
            dbs = dm.list();
            assertTrue('Check removed vk database', dbs.vk === undefined);
            assertTrue('Check decrypt', dm.decrypt('vk-e', 'invalid') !== true);
            dbs = dm.list();
            assertTrue('Check added vk database', dbs.vk === undefined);
        });

        assertNoException('Check decrypt command', function () {
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');
            localStorage.removeItem('jsql4files-d');
            localStorage.removeItem('jsql4sats-s');

            var dm  = new App.DatabaseManager();
            var dbs;

            assertTrue('Check encrypt', dm.encrypt('vk', '12345678') === true);
            dbs = dm.list();
            assertTrue('Check added vk-e database', Lib.Helper.isObject(dbs['vk-e']));
            assertTrue('Check remove', dm.remove(['vk']) === true);
            dbs = dm.list();
            assertTrue('Check added vk-e database', dbs.vk === undefined);
            assertTrue('Check decrypt', dm.decrypt('vk-e', '12345678') === true);
            dbs = dm.list();
            assertTrue('Check added vk database', Lib.Helper.isObject(dbs.vk));
        });
    },

    /**
     * Checks default list of databases (files) on current satellite
     * @param {Object} dbs Databases (files) of current satellite
     * @private
     * @throw {Error}
     */
    _checkDefaultFiles: function (dbs) {
        assertTrue('facebook', dbs.facebook.size === 10087108);
        assertTrue('vk', dbs.vk.size === 12567098);
        assertTrue('icq', dbs.icq.size === 24405);
        assertTrue('tels', dbs.tels.size === 4587);
    }
});