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
        assertNoException('list command', function () {
            //
            // Emulates first run
            //
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');

            var ct  = new App.DatabaseManager();
            var dbs = ct.list();

            assertTrue('facebook', dbs.facebook.size === 10087108);
            assertTrue('vk', dbs.vk.size === 12567098);
            assertTrue('icq', dbs.icq.size === 24405);
            assertTrue('tels', dbs.tels.size === 4587);
        });
    },

    testDimension: function () {
        localStorage.removeItem('jsql4synchronized');
        localStorage.removeItem('jsql4files');

        var ct = new App.DatabaseManager();

        assertTrue('Dimension', ct.getDimension() === 'Gb');
    },

    testRemove: function () {
        assertNoException('Check one database remove', function () {
            localStorage.removeItem('jsql4synchronized');
            localStorage.removeItem('jsql4files');

            var dm = new App.DatabaseManager();
            var dbs;

            assertTrue('Facebook removing', dm.remove(['facebook']));
            dbs = dm.list();
            assertTrue('Facebook database exists', dbs.facebook === undefined);
        });

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
    }
});