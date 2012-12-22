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
            localStorage.clear();

            var ct  = new App.DatabaseManager();
            var dbs = ct.list();

            assertTrue('facebook', dbs.facebook.size === 10087108);
            assertTrue('vk', dbs.vk.size === 12567098);
            assertTrue('icq', dbs.icq.size === 24405);
            assertTrue('tels', dbs.tels.size === 4587);
        });
    }
});