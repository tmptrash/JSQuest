/**
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
var tc = new TestCase('App.Terminal', {
    setUp: function () {
        //
        // Temporary container for the terminal
        //
        tc.container = document.createElement('div');
        tc.container = document.body.appendChild(tc.container);
    },

    tearDown: function () {
        //
        // Temporary container for the terminal
        //
        document.body.removeChild(tc.container);
    },

    testConstructor: function () {
        assertNoException('Construct App.Terminal without arguments', function () {
            var term = new App.Terminal({parent: tc.container});
        });

        assertNoException('Construct App.Terminal without arguments', function () {
            var term = new App.Terminal();
        });
    },

    testLeftCmd: function () {
        var me = this;

        assertNoException('Check left command with incorrect argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('left', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'left qwerty');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check left command with incorrect argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('left', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'left 1q');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check left command with incorrect argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('left', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'left --');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check left command with incorrect argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('left', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'left @#$%^');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check left command with correct argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('left', function (args) {
                ok = args[0] === '123';
            });
            me._emulateCmd(term, 'left 123');
            assertTrue('Invalid argument', ok);
        });
    },

    /**
     * Run command string in terminal. It emulates user input.
     * @param {App.Terminal} term
     * @param {String} cmd
     * @private
     */
    _emulateCmd: function (term, cmd) {
        document.getElementById(term.cfg.id).value = document.getElementById(term.cfg.id).value + cmd;
        term.console.Enter();
    }
});