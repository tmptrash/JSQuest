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

            var ct  = new App.DatabaseManager();
            var dbs = ct.list();

            me._checkDefaultFiles(dbs);
        });
    },

    testDimension: function () {
        localStorage.removeItem('jsql4synchronized');
        localStorage.removeItem('jsql4files');

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

            var dm = new App.DatabaseManager();
            var dbs;

            assertTrue('Facebook removing', dm.remove(['facebook']));
            dbs = dm.list();
            assertTrue('Facebook database exists', dbs.facebook === undefined);
        });
        assertNoException('Check empty database remove', function () {
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');

            var dm  = new App.DatabaseManager();

            assertTrue('Facebook removing', dm.remove([]));
            me._checkDefaultFiles(dm.list());
        });
        assertNoException('Check unknown database remove', function () {
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');

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

                var dm  = new App.DatabaseManager();
                var msg = dm.sync(arg);

                if (msg !== true) {
                    throw new Error(msg);
                }
            });
        });

        assertNoException('Check sync command with one satellite', function () {
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');

            var dm  = new App.DatabaseManager();
            var msg;
            var dbs;

            //
            // Sync with first satellite
            //
            msg = dm.sync(['s1']);
            if (msg !== true) {
                throw new Error(msg);
            }
            dbs = dm.list();
            me._checkDefaultFiles(dbs);
            assertTrue('Check added skype database', dbs.skype.size === 45075);

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
            msg = dm.sync(['s1']);
            if (msg !== true) {
                throw new Error(msg);
            }
            dbs = dm.list();
            me._checkDefaultFiles(dbs);
            assertTrue('Check added skype database', dbs.skype === undefined);
        });

        assertNoException('Check sync command with two satellites', function () {
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');

            var dm  = new App.DatabaseManager();
            var msg;
            var dbs;

            //
            // Sync with two satellites
            //
            msg = dm.sync(['s1', 's3']);
            if (msg !== true) {
                throw new Error(msg);
            }
            dbs = dm.list();
            me._checkDefaultFiles(dbs);
            assertTrue('Check added skype database', dbs.skype.size === 45075);
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
            msg = dm.sync(['s1', 's3']);
            if (msg !== true) {
                throw new Error(msg);
            }
            dbs = dm.list();
            me._checkDefaultFiles(dbs);
            assertTrue('Check added skype database', dbs.skype === undefined);
            assertTrue('Check added mail database', dbs.mail === undefined);
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