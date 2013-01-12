/**
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
var tc = new TestCase('App.SatelliteTerminal', {
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
        assertNoException('Construct App.SatelliteTerminal without arguments', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
        });

        assertNoException('Construct App.SatelliteTerminal without arguments', function () {
            var term = new App.SatelliteTerminal();
        });
    },

    testLeftCmd: function () {
        var me = this;

        assertNoException('Check left command with incorrect argument', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('left', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'left qwerty');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check left command with incorrect argument', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('left', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'left 1q');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check left command with incorrect argument', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('left', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'left --');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check left command with incorrect argument', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('left', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'left @#$%^');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check left command with incorrect argument', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('left', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'left -123');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check left command with correct argument', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
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
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('right', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'right qwerty');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check right command with incorrect argument', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('right', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'right 1q');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check right command with incorrect argument', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('right', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'right --');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check right command with incorrect argument', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('right', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'right @#$%^');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check right command with incorrect argument', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('right', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'right -123');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check right command with correct argument', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
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
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('up', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'up qwerty');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check up command with incorrect argument', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('up', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'up 1q');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check up command with incorrect argument', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('up', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'up --');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check up command with incorrect argument', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('up', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'up @#$%^');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check up command with incorrect argument', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('up', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'up -123');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check up command with correct argument', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
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
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('down', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'down qwerty');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check down command with incorrect argument', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('down', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'down 1q');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check down command with incorrect argument', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('down', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'down --');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check down command with incorrect argument', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('down', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'down @#$%^');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check down command with incorrect argument', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('down', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'down -123');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check down command with correct argument', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
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
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('connect', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'connect');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check connect command with correct arguments', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
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
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('disconnect', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'disconnect');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check disconnect command with correct arguments', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('disconnect', function (args) {
                ok = (args[0] === 's1' && args[1] === 's3');
            });
            me._emulateCmd(term, 'disconnect s1 s3');
            assertTrue('Valid argument', ok);
        });
    },

    testList: function () {
        var me = this;

        assertNoException('Check list command with extra arguments', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('list', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'list a1 a4');
            assertTrue('Valid argument', ok);
        });

        assertNoException('Check list command without arguments', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('list', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'list');
            assertTrue('Valid argument', ok);
        });
    },

    testRemove: function () {
        var me = this;

        assertNoException('Check remove command with incorrect arguments', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('remove', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'remove');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check remove command with correct arguments', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('remove', function (args) {
                ok = (args[0] === 'f1' && args[1] === 'f3');
            });
            me._emulateCmd(term, 'remove f1 f3');
            assertTrue('Valid argument', ok);
        });
    },

    testSync: function () {
        var me = this;

        assertNoException('Check sync command without arguments', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('sync', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'sync');
            assertFalse('Invalid arguments', ok);
        });

        assertNoException('Check sync command with correct arguments', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('sync', function (args) {
                ok = (args[0] === 's1' && args[1] === 's3');
            });
            me._emulateCmd(term, 'sync s1 s3');
            assertTrue('Valid argument', ok);
        });
    },

    testPack: function () {
        var me = this;

        assertNoException('Check pack command with incorrect arguments', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('pack', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'pack');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check pack command with correct arguments', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('pack', function (args) {
                ok = (args[0] === 'f1' && args[1] === 'f3');
            });
            me._emulateCmd(term, 'pack f1 f3');
            assertTrue('Valid argument', ok);
        });
    },

    testUnpack: function () {
        var me = this;

        assertNoException('Check unpack command with incorrect arguments', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('unpack', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'unpack');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check unpack command with correct arguments', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('unpack', function (args) {
                ok = (args[0] === 'f1' && args[1] === 'f3');
            });
            me._emulateCmd(term, 'unpack f1 f3');
            assertTrue('Valid argument', ok);
        });
    },

    testEncrypt: function () {
        var me = this;

        assertNoException('Check encrypt command without arguments', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('encrypt', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'encrypt');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check encrypt command with invalid arguments', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('encrypt', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'encrypt f1');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check encrypt command with correct arguments', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('encrypt', function (args) {
                ok = (args[0] === 'f1' && args[1] === '12345678');
            });
            me._emulateCmd(term, 'encrypt f1 12345678');
            assertTrue('Valid argument', ok);
        });
    },

    testDecrypt: function () {
        var me = this;

        assertNoException('Check decrypt command without arguments', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('decrypt', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'decrypt');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check decrypt command with invalid arguments', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('decrypt', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'decrypt f1');
            assertFalse('Invalid argument', ok);
        });

        assertNoException('Check decrypt command with correct arguments', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('decrypt', function (args) {
                ok = (args[0] === 'f1' && args[1] === '12345678');
            });
            me._emulateCmd(term, 'decrypt f1 12345678');
            assertTrue('Valid argument', ok);
        });
    },

    testInfo: function () {
        var me = this;

        assertNoException('Check info command with extra arguments', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('info', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'info a1 a4');
            assertTrue('Valid argument', ok);
        });

        assertNoException('Check info command without arguments', function () {
            var term = new App.SatelliteTerminal({parent: tc.container});
            var ok   = false;

            term.on('info', function (args) {
                ok = true;
            });
            me._emulateCmd(term, 'info');
            assertTrue('Valid argument', ok);
        });
    },

    /**
     * Run command string in terminal. It emulates user input.
     * @param {App.SatelliteTerminal} term
     * @param {String} cmd
     * @private
     */
    _emulateCmd: function (term, cmd) {
        document.getElementById(term.cfg.id).value = document.getElementById(term.cfg.id).value + cmd;
        term.console.Enter();
    }
});