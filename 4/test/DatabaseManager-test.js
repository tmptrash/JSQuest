/**
 * App.DatabaseManager class test cases
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 * TODO:
 */
TestCase('App.DatabaseManager', {
    testConstructor: function () {
        assertNoException('Construct App.DatabaseManager', function () {
            new App.DatabaseManager();
        });
    }
});