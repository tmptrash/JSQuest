/**
 * App.SatelliteFs class test cases
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
TestCase('App.SatelliteFs', {
    testConstructor: function () {
        assertNoException('Construct App.SatelliteFs', function() {
            new App.SatelliteFs();
        });
    },

    testGetHashByUser: function () {
        assertNoException('Check MD5 hashes for different users', function() {
            var fs = new App.SatelliteFs();
            assertTrue('Check MD5 hash for guest', fs.getHashByUser('guest') === '084e0343a0486ff05530df6c705c8bb4');
            assertTrue('Check MD5 hash for root', fs.getHashByUser('jack') === 'ad23e6cd35a85ecb451dd956946601e2');
            assertFalse('Check hash of the unknown user', fs.getHashByUser('unknown-user'));
            assertFalse('Check hash of the unknown user', fs.getHashByUser('gues'));
            assertException('Check hash undefined user', function () {
                fs.getHashByUser();
            });
            App.test.callWithAllTypes('Check hash for type', function (arg) {
                //
                // We should skip right parameters
                //
                if (App.isString(arg) && arg !== '') {
                    throw new Error('Error');
                } else {
                    fs.getHashByUser(arg);
                }
            });
        });
    },

    testSetActiveUser: function () {
        assertNoException('Check set active user', function () {
            App.test.callWithAllTypes('Check set active user with type', function (arg) {
                var fs = new App.SatelliteFs();
                //
                // We should skip right parameters
                //
                if (App.isString(arg) && arg !== '') {
                    throw new Error('Error');
                } else {
                    fs.setActiveUser(arg);
                }
            });
        });
        assertNoException('Set active user to root', function () {
            var fs = new App.SatelliteFs();

            fs.setActiveUser('jack');
            fs.create('test');
            fs.update('test', 0, 'bob');
            assertTrue('Read file by root', fs.read('test') === 'bob');

            fs.setActiveUser('guest');
            assertException('Read file by guest', function () {
                fs.read('test');
            });

            fs.setActiveUser('bob');
            assertException('Read file by bob', function () {
                fs.read('test');
            });
        });
    },

    testGetActiveFolder: function () {
        assertNoException('Check get active folder', function () {
            var fs = new App.SatelliteFs();

            assertTrue('Check root folder', fs.getActiveFolder() === '.');
            fs.setActiveFolder('bin');
            assertTrue('Check bin folder', fs.getActiveFolder() === 'bin');
        });
    },

    testSetActiveFolder: function () {
        assertNoException('Check set active user', function () {
            App.test.callWithAllTypes('Check set active user with type', function (arg) {
                (new App.SatelliteFs()).setActiveFolder(arg);
            });
        });
        assertNoException('Check set active folder', function () {
            var fs = new App.SatelliteFs();

            fs.setActiveFolder('bin');
            assertTrue('Check bin folder', fs.getActiveFolder() === 'bin');
            fs.setActiveFolder('..');
            assertTrue('Check bin folder', fs.getActiveFolder() === '.');
            fs.setActiveFolder('..');
            assertTrue('Check bin folder', fs.getActiveFolder() === '.');
            assertException('Check . folder', function () {
                fs.setActiveFolder('.');
            });
        });
    },

    testGetFilePermissions: function () {
        assertNoException('Check get file permissions', function () {
            App.test.callWithAllTypes('Check get file permissions with type', function (arg) {
                (new App.SatelliteFs()).getFilePermissions(arg);
            });
        });
        assertNoException('Check get root file permissions', function () {
            var fs = new App.SatelliteFs();
            var perms;

            fs.create('test');
            perms = fs.getFilePermissions('test');
            assertTrue('Check guest\'s file permissions', perms[0] === '1' && perms[1] === '1' && perms[2] === '1');

            fs.setActiveUser('jack');
            fs.create('test1');
            perms = fs.getFilePermissions('test1');
            assertTrue('Check root\'s file permissions', perms[0] === '1' && perms[1] === '1' && perms[2] === '1');

            fs.setActiveUser('guest');
            perms = fs.getFilePermissions('test1');
            assertTrue('Check root\'s file permissions by guest', perms[0] === '0' && perms[1] === '0' && perms[2] === '0');
        });
    },

    testExists: function () {
        assertNoException('Check file exists', function () {
            App.test.callWithAllTypes('Check file exists with type', function (arg) {
                var fs = new App.SatelliteFs();
                //
                // We should skip right parameters
                //
                if (App.isString(arg) && arg !== '') {
                    throw new Error('Error');
                } else {
                    fs.exists(arg);
                }
            });
        });
        assertException('Check file without arguments', function () {
            var fs = new App.SatelliteFs();

            fs.exists();
        });
        assertNoException('Check get root file permissions', function () {
            var fs = new App.SatelliteFs();

            fs.create('test');
            assertTrue('Check file exists', fs.exists('test'));
            assertFalse('Check file exists', fs.exists('test1'));

            fs.setActiveFolder('bin');
            fs.create('test');
            assertTrue('Check file exists', fs.exists('test'));
            assertFalse('Check file exists', fs.exists('test1'));

            fs.setActiveFolder('..');
            fs.setActiveFolder('bin');
            assertTrue('Check file exists', fs.exists('test'));
            assertFalse('Check file exists', fs.exists('test1'));
        });
    },

    testCreate: function () {
        assertNoException('Check file creation', function () {
            App.test.callWithAllTypes('Check file creation with type', function (arg) {
                var fs = new App.SatelliteFs();
                //
                // We should skip right parameters
                //
                if (App.isString(arg) && arg !== '') {
                    throw new Error('Error');
                } else {
                    fs.exists(arg);
                }
            });
        });
        assertException('Create file without arguments', function () {
            var fs = new App.SatelliteFs();

            fs.create();
        });
        assertNoException('Check file creation', function () {
            var fs = new App.SatelliteFs();

            fs.create('test');
            assertTrue('Check file exists', fs.exists('test'));

            fs.setActiveFolder('bin');
            fs.create('test');
            assertTrue('Check file exists', fs.exists('test'));

            fs.setActiveFolder('..');
            fs.setActiveFolder('bin');
            assertException('Create file again', function () {
                fs.create('test');
            });
            assertException('Create .. file', function () {
                fs.create('..');
            });
            assertException('Create invalid file *', function () {
                fs.create('*');
            });
            assertException('Create invalid file', function () {
                fs.create('мастер йода!');
            });
        });
    },

    testRead: function () {
        assertNoException('Read file', function () {
            App.test.callWithAllTypes('Read file with type', function (arg) {
                (new App.SatelliteFs()).read(arg);
            });
        });
        assertException('Read file without arguments', function () {
            var fs = new App.SatelliteFs();

            fs.read();
        });
        assertNoException('Read file', function () {
            var fs = new App.SatelliteFs();

            fs.create('test');
            fs.update('test', 0, 'data');
            assertTrue('Reading created file', fs.read('test') === 'data');
            assertException('Reading undefined file', function () {
                fs.read('test1');
            });
            assertException('Reading folder', function () {
                fs.read('bin');
            });
            assertNoException('Reading file without permissions', function () {
                fs.setActiveUser('jack');
                fs.create('test1');
                fs.setActiveUser('guest');
                assertException('Reading file without permissions', function () {
                    fs.read('test1');
                });
            });
        });
    },

    testRemove: function () {
        assertNoException('Remove file', function () {
            App.test.callWithAllTypes('Remove file with type', function (arg) {
                (new App.SatelliteFs()).remove(arg);
            });
        });
        assertException('Remove file without arguments', function () {
            var fs = new App.SatelliteFs();

            fs.remove();
        });
        assertNoException('Remove file without permissions', function () {
            var fs = new App.SatelliteFs();

            fs.setActiveUser('jack');
            fs.create('test');
            fs.setActiveUser('guest');
            assertException('Remove file without permissions', function () {
                fs.remove('test');
            });
        });
        assertNoException('Remove file with remove permission', function () {
            var fs = new App.SatelliteFs();

            assertNoException('Create new file by guest', function () {
                fs.setActiveFolder('usr');
                fs.create('test');
                fs.update('perm', 192, '010');
            });
            fs.remove('test');
        });
        assertException('Remove folder', function () {
            var fs = new App.SatelliteFs();

            fs.remove('usr');
        });
        assertNoException('Remove normal file', function () {
            var fs = new App.SatelliteFs();

            fs.create('test');
            fs.remove('test');
            assertException('Remove undefined file', function () {
                fs.remove('test');
            });
        });
    },

    testUpdate: function () {
        assertNoException('Update file', function () {
            App.test.callWithAllTypes('Update file with first wrong type', function (arg) {
                (new App.SatelliteFs()).update(arg, 0, 'new');
            });
            App.test.callWithAllTypes('Update file with second wrong type', function (arg) {
                var fs = new App.SatelliteFs();

                if (arg <= 0) {
                    throw new Error('Error');
                } else {
                    fs.create('test');
                    fs.update('test', arg, 'new');
                }
            });
            App.test.callWithAllTypes('Update file with third wrong type', function (arg) {
                var fs = new App.SatelliteFs();

                if (App.isString(arg)) {
                    throw new Error('Error');
                } else {
                    fs.create('test');
                    fs.update('test', 0, arg);
                }
            });
        });
        assertException('Update file without permissions', function () {
            var fs = new App.SatelliteFs();

            assertNoException('Create new file by root', function () {
                fs.setActiveUser('jack');
                fs.create('test');
                fs.setActiveUser('guest');
            });
            fs.update('test', 0, 'new');
        });
        assertNoException('Update file with update permission', function () {
            var fs = new App.SatelliteFs();

            assertNoException('Create new file by guest', function () {
                fs.setActiveFolder('usr');
                fs.create('test');
                fs.update('perm', 192, '001');
            });
            fs.update('test', 0, 'new');
        });
        assertException('Update folder', function () {
            var fs = new App.SatelliteFs();

            fs.update('usr', 0, 'new');
        });
        assertNoException('Update normal file', function () {
            var fs = new App.SatelliteFs();
            var body;

            fs.create('test');
            fs.update('test', 0, 'new');
            body = fs.read('test');
            assertTrue('Check file after update', body[0] === 'n' && body[1] === 'e' && body[2] === 'w');
            fs.update('test', 0, 'old');
            body = fs.read('test');
            assertTrue('Check file after second update', body[0] === 'o' && body[1] === 'l' && body[2] === 'd');
        });
    }
});