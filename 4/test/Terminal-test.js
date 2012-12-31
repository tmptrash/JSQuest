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

        assertNoException('Check left command with incorrect argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('left', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'left -123');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check left command with correct argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('left', function (args) {
                ok = args[0] === '123';
            });
            me._emulateCmd(term, 'left 123');
            assertTrue('Valid argument', ok);
        });
    },

    testRightCmd: function () {
        var me = this;

        assertNoException('Check right command with incorrect argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('right', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'right qwerty');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check right command with incorrect argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('right', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'right 1q');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check right command with incorrect argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('right', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'right --');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check right command with incorrect argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('right', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'right @#$%^');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check right command with incorrect argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('right', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'right -123');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check right command with correct argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('right', function (args) {
                ok = args[0] === '123';
            });
            me._emulateCmd(term, 'right 123');
            assertTrue('Valid argument', ok);
        });
    },

    testUpCmd: function () {
        var me = this;

        assertNoException('Check up command with incorrect argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('up', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'up qwerty');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check up command with incorrect argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('up', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'up 1q');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check up command with incorrect argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('up', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'up --');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check up command with incorrect argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('up', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'up @#$%^');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check up command with incorrect argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('up', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'up -123');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check up command with correct argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('up', function (args) {
                ok = args[0] === '123';
            });
            me._emulateCmd(term, 'up 123');
            assertTrue('Valid argument', ok);
        });
    },

    testDownCmd: function () {
        var me = this;

        assertNoException('Check down command with incorrect argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('down', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'down qwerty');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check down command with incorrect argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('down', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'down 1q');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check down command with incorrect argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('down', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'down --');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check down command with incorrect argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('down', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'down @#$%^');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check down command with incorrect argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('down', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'down -123');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check down command with correct argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('down', function (args) {
                ok = args[0] === '123';
            });
            me._emulateCmd(term, 'down 123');
            assertTrue('Valid argument', ok);
        });
    },

    testConnect: function () {
        var me = this;

        assertNoException('Check connect command with incorrect argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('connect', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'connect');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check connect command with correct arguments', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('connect', function (args) {
                ok = (args[0] === 's1' && args[1] === 's3');
            });
            me._emulateCmd(term, 'connect s1 s3');
            assertTrue('Valid argument', ok);
        });
    },

    testDisconnect: function () {
        var me = this;

        assertNoException('Check disconnect command with incorrect argument', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('disconnect', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'disconnect');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check disconnect command with correct arguments', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('disconnect', function (args) {
                ok = (args[0] === 's1' && args[1] === 's3');
            });
            me._emulateCmd(term, 'disconnect s1 s3');
            assertTrue('Valid argument', ok);
        });
    },

    testRemove: function () {
        var me = this;

        assertNoException('Check remove command with incorrect arguments', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('remove', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'remove');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check remove command with correct arguments', function () {
            var term = new App.Terminal({parent: tc.container});
            var ok   = false;

            term.on('remove', function (args) {
                ok = (args[0] === 'f1' && args[1] === 'f3');
            });
            me._emulateCmd(term, 'remove f1 f3');
            assertTrue('Valid argument', ok);
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