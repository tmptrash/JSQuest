/**
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
var tc = new TestCase('App.Terminal', {
    testConstructor: function () {
        assertException('Construct App.Terminal without arguments', function () {
            var term = new App.Terminal();
        });

        assertNoException('Construct App.Terminal with minimal arguments', function () {
            var term = new App.Terminal({id: 'testId'});
        });
    }
});