/**
 * App.Fs class test cases
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
TestCase('App.Fs', {
    testConstructor: function () {
        App.test.callWithAllTypes('Construct App.Fs with wrong configuration', function (arg) {
            //
            // We should skip right parameters
            //
            if (App.isObject(arg)) {
                throw new Error('Error');
            } else {
                new App.Fs(arg);
            }
        });
        assertNoException('Construct App.Fs with wrong configuration - no parameters', function() {
            new App.Fs();
        });
        assertNoException('Construct App.Fs with empty file system', function() {
            new App.Fs({});
        });
        assertNoException('Construct App.Fs with file system', function() {
            new App.Fs({
                folder: {
                    file: 'body'
                }
            });
        });
        App.test.callWithAllTypes('Construct App.Fs with corrupted structure', function (arg) {
            //
            // Skip correct value
            //
            if (App.isString(arg) || App.isObject(arg)) {
                throw new Error('This is correct value!');
            }

            new App.Fs({
                folder: {
                    folder1: {
                        file: '',
                        f   : 'test',
                        ff  : arg
                    }
                }
            });
        });
        assertException('Construct App.Fs with correct data but use invalid parent', function () {
            var data = {folder: {file: 'old'}};
            var fs   = new App.Fs(data);

            fs.readFile(data.folder, 'file');
        });
    },

    testCreateFile: function () {
        assertNoException('Create file in root folder', function() {
            var fs = App.test.createSimpleFs();

            fs.fs.createFile(fs.data, 'file1');
            assertTrue('File created', fs.fs.fileExists(fs.data, 'file1'));
        });
        App.test.callWithAllTypes('Create file with wrong first parameter', function (arg) {
            var fs = App.test.createSimpleFs();

            //
            // We should skip right parameters
            //
            if (App.isObject(arg)) {
                throw new Error('Error');
            } else {
                fs.fs.createFile(arg, 'test');
            }
        });
        App.test.callWithAllTypes('Create file with wrong second parameter', function (arg) {
            var fs = App.test.createSimpleFs();

            //
            // We should skip right parameters
            //
            if (App.isString(arg) && arg !== '') {
                throw new Error('Error');
            } else {
                fs.fs.createFile(fs.data, arg);
            }
        });
        assertNoException('Create file in root folder twice', function() {
            var fs = App.test.createSimpleFs();

            fs.fs.createFile(fs.data, 'file1');
            assertException('Create file again', function () {
                fs.fs.createFile(fs.data, 'file1');
            });
        });
        assertNoException('Create file with the same name like a folder', function() {
            var fs = App.test.createSimpleFs();

            assertException('Create file', function () {
                fs.fs.createFile(fs.data, 'folder');
            });
        });
        assertException('Create file without parameters', function() {
            App.test.createSimpleFs().fs.createFile();
        });
    },

    testReadFile: function () {
        assertNoException('Read simple file', function() {
            var fs = App.test.createSimpleFs();

            assertTrue('Check file body', fs.fs.readFile(fs.data.folder, 'file') === 'old');
        });
        assertNoException('Read folder', function() {
            var fs = App.test.createSimpleFs();

            assertException('Read folder', function() {
                fs.fs.readFile(fs.data, 'folder');
            });
        });
        assertNoException('Read undefined file', function() {
            var fs = App.test.createSimpleFs();

            assertException('Read undefined file', function() {
                fs.fs.readFile(fs.data, 'file');
            });
        });
        assertNoException('Read empty file', function() {
            var data = {
                file: ''
            };
            var fs   = new App.Fs(data);
            assertTrue('Read empty file', fs.readFile(fs.getRootFolder(), 'file') === '');
        });
        assertException('Read file without parameters', function() {
            var fs = App.test.createSimpleFs();
            fs.fs.readFile();
        });
    },

    testDeleteFile: function () {
        App.test.callWithAllTypes('Delete file with wrong first parameter', function (arg) {
            var fs = App.test.createSimpleFs();

            //
            // We should skip right parameters
            //
            if (App.isString(arg)) {
                throw new Error('This is correct value!');
            } else {
                fa.fs.deleteFile(arg, 'file');
            }
        });
        App.test.callWithAllTypes('Delete file with wrong second parameter', function (arg) {
            var fs = App.test.createSimpleFs();

            //
            // We should skip right parameters
            //
            if (App.isString(arg)) {
                throw new Error('This is correct value!');
            } else {
                fs.fs.deleteFile(fs.data.folder, arg);
            }
        });
        assertException('Delete folder', function() {
            var fs = App.test.createSimpleFs();

            fs.fs.deleteFile(fs.data, 'folder');
        });
        assertException('Delete file twice', function() {
            var fs = App.test.createSimpleFs();

            fs.fs.deleteFile(fs.data.folder, 'file');
            fs.fs.deleteFile(fs.data.folder, 'file');
        });
        assertException('Delete file without parameters', function() {
            var fs = App.test.createSimpleFs();
            fs.fs.deleteFile();
        });
        assertNoException('Delete normal file', function() {
            var fs = App.test.createSimpleFs();
            fs.fs.deleteFile(fs.data.folder, 'file');
            assertTrue('Delete normal file', fs.data.folder.file === undefined);
        });
    },

    testUpdateFile: function () {
        App.test.callWithAllTypes('Update file with wrong first parameter', function (arg) {
            var fs = App.test.createSimpleFs();

            //
            // We should skip right parameters
            //
            if (App.isObject(arg)) {
                throw new Error('This is correct value!');
            } else {
                fs.fs.updateFile(arg, 'file', 0, 'new body');
            }
        });
        App.test.callWithAllTypes('Update file with wrong second parameter', function (arg) {
            var fs = App.test.createSimpleFs();

            //
            // We should skip right parameters
            //
            if (App.isString(arg) && arg !== '') {
                throw new Error('This is correct value!');
            } else {
                fs.fs.updateFile(fs.data.folder, arg, 0, 'new body');
            }
        });
        App.test.callWithAllTypes('Update file with wrong third parameter', function (arg) {
            var fs = App.test.createSimpleFs();

            //
            // We should skip right parameters
            //
            if (App.isNumber(arg)) {
                throw new Error('This is correct value!');
            } else {
                fs.fs.updateFile(fs.data.folder, 'file', arg, 'new body');
            }
        });
        App.test.callWithAllTypes('Update file with wrong fourth parameter', function (arg) {
            var fs = App.test.createSimpleFs();

            //
            // We should skip right parameters
            //
            if (App.isString(arg)) {
                throw new Error('This is correct value!');
            } else {
                fs.fs.updateFile(fs.data.folder, 'file', 0, arg);
            }
        });
        assertException('Update folder', function() {
            var fs = App.test.createSimpleFs();
            fs.fs.updateFile(fs.data, 'folder', 0, 'new data');
        });
        assertException('Update file without parameters', function() {
            var fs = App.test.createSimpleFs();
            fs.fs.updateFile();
        });
        assertException('Update empty file with invalid index', function() {
            var data = {folder: {file: ''}};
            var fs   = new App.Fs(data);
            fs.updateFile(fs.getRootFolder().folder, 'file', 1, 'new');
        });
        assertException('Update normal file with invalid index', function() {
            var fs = App.test.createSimpleFs();
            fs.fs.updateFile(fs.data.folder, 'file', 4, 'new');
        });
        assertNoException('Update empty file', function() {
            var fs = App.test.createSimpleFs();
            fs.fs.updateFile(fs.data.folder, 'file', 0, 'new');
            assertTrue('Update normal file', fs.fs.readFile(fs.data.folder, 'file') === 'new');
        });
        assertNoException('Update normal file', function() {
            var fs = App.test.createSimpleFs();
            fs.fs.updateFile(fs.data.folder, 'file', 0, 'new');
            assertTrue('Update normal file', fs.fs.readFile(fs.data.folder, 'file') === 'new');
            fs.fs.updateFile(fs.data.folder, 'file', 0, 'old');
            assertTrue('Update normal file', fs.fs.readFile(fs.data.folder, 'file') === 'old');
        });
    },

    testGetFilesAndFolders: function () {
        assertNoException('Call getFilesAndFolders() on root', function () {
            var fs = App.test.createSimpleFs();
            var ff;

            ff = fs.fs.getFilesAndFolders(fs.data);
            assertTrue('Call getFilesAndFolders() on folder', ff.length === 1 && ff[0] === '[folder]');
            ff = fs.fs.getFilesAndFolders(fs.data.folder);
            assertTrue('Call getFilesAndFolders() on folder', ff.length === 1 && ff[0] === 'file');
        });
        assertNoException('Call getFilesAndFolders() on file and folder', function () {
            var fs   = new App.Fs({folder: {}, file: ''});
            var data = fs.getRootFolder();
            var ff;

            ff = fs.getFilesAndFolders(data);
            assertTrue('Call getFilesAndFolders() on file and folder', ff.length === 2 && ff[0] === '[folder]' && ff[1] === 'file');
        });
        assertNoException('Call getFilesAndFolders() on one file', function () {
            var fs   = new App.Fs({file: ''});
            var data = fs.getRootFolder();
            var ff;

            ff = fs.getFilesAndFolders(data);
            assertTrue('Call getFilesAndFolders() on one file', ff.length === 1 && ff[0] === 'file');
        });
        assertNoException('Call getFilesAndFolders() on empty folder', function () {
            var fs   = new App.Fs({});
            var data = fs.getRootFolder();
            var ff;

            ff = fs.getFilesAndFolders(data);
            assertTrue('Call getFilesAndFolders() on folder', ff.length === 0);
        });
    },

    testFileExists: function () {
        App.test.callWithAllTypes('Check file with wrong first parameter', function (arg) {
            var fs = App.test.createSimpleFs();
            fs.fs.fileExists(arg, 'file');
        });
        App.test.callWithAllTypes('Check file with wrong second parameter', function (arg) {
            var fs = App.test.createSimpleFs();

            if (App.isString(arg) && arg.length > 0) {
                throw new Error('Error');
            } else {
                fs.fs.fileExists(fs.data.folder, arg);
            }
        });
        assertException('Check file without parameters', function () {
            var fs = App.test.createSimpleFs();
            fs.fs.fileExists();
        });
        assertNoException('Check files and folders existence', function () {
            var fs = App.test.createSimpleFs();

            assertTrue('File exists', fs.fs.fileExists(fs.data.folder, 'file'));
            assertFalse('File exists', fs.fs.fileExists(fs.data.folder, 'file1'));
            assertFalse('File exists', fs.fs.fileExists(fs.data, 'folder'));
            fs.fs.createFile(fs.data.folder, 'file1');
            assertTrue('File exists', fs.fs.fileExists(fs.data.folder, 'file1'));
        });
    },

    testGetParent: function () {
        App.test.callWithAllTypes('Check parent with wrong first parameter', function (arg) {
            var fs = App.test.createSimpleFs();
            fs.fs.getParent(arg);
        });
        assertNoException('Check parent', function () {
            var fs = App.test.createSimpleFs();
            assertTrue('Check parent', fs.fs.getParent(fs.data.folder) === fs.data);
            assertTrue('Check parent of root', fs.fs.getParent(fs.data) === fs.data);
            assertException('Check parent of file', function () {
                fs.fs.getParent(fs.data.folder.file);
            });
        });
    },

    testGetChild: function () {
        App.test.callWithAllTypes('Check child with wrong first parameter', function (arg) {
            var fs = App.test.createSimpleFs();
            fs.fs.getChild(arg, 'folder');
        });
        App.test.callWithAllTypes('Check child with wrong second parameter', function (arg) {
            var fs = App.test.createSimpleFs();
            fs.fs.getChild(fs.data, arg);
        });
        assertNoException('Check child', function () {
            var fs = App.test.createSimpleFs();
            assertException('Check invalid child', function () {
                fs.fs.getChild(fs.data, 'invalid');
            });
            assertException('Check child of folder and file', function () {
                fs.fs.getChild(fs.data.folder, 'file');
            });
            assertTrue('Check normal child', fs.fs.getChild(fs.data, 'folder') === fs.data.folder);
        });
    },

    testGetParentName: function () {
        App.test.callWithAllTypes('Check parent with wrong first parameter', function (arg) {
            var fs = App.test.createSimpleFs();
            fs.fs.getParentName(arg);
        });
        assertNoException('Check parent name', function () {
            var fs   = new App.Fs({folder: {folder1: {}}});
            var data = fs.getRootFolder();

            assertTrue('Check root name', fs.getParentName(data) === '.');
            assertTrue('Check name of sub root folder', fs.getParentName(data.folder) === '.');
            assertTrue('Check parent of sub sub folder', fs.getParentName(data.folder.folder1) === 'folder');
        });
    },

    testGetRootFolder: function () {
        var fs = new App.Fs({f1: {f2: {}}});

        assertTrue('Get root folder', Lib.Helper.isObject(fs.getRootFolder()));
        assertTrue('Get root folder', fs.getRootFolder().f1 !== undefined && Lib.Helper.isObject(fs.getRootFolder().f1));
        assertTrue('Get root folder', fs.getRootFolder().f1.f2 !== undefined && Lib.Helper.isObject(fs.getRootFolder().f1.f2));
    },

    testGetFolder: function () {
        App.test.callWithAllTypes('Check get folder with wrong first parameter', function (arg) {
            var fs = App.test.createSimpleFs();

            if (App.isString(arg) && arg.length > 0) {
                throw new Error('Error');
            } else {
                fs.fs.getFolder(arg);
            }
        });
        assertNoException('Get folder', function () {
            var fs = new App.Fs({f1: {f2: {file: ''}}});

            assertTrue('Get root folder', fs.getFolder('/') === false);
            assertTrue('Get sub folder', fs.getFolder('f1') === fs.getRootFolder().f1);
            assertTrue('Get sub sub folder', fs.getFolder('f1/f2') === fs.getRootFolder().f1.f2);
        });
    },

    testAppendToFile: function () {
        App.test.callWithAllTypes('Append to file with wrong first parameter', function (arg) {
            var fs = App.test.createSimpleFs();
            fs.fs.appendToFile(arg, 'file', 'test');
        });
        App.test.callWithAllTypes('Append to file with wrong second parameter', function (arg) {
            var fs = App.test.createSimpleFs();
            fs.fs.appendToFile(fs.fs.getFolder('folder'), arg, 'test');
        });
        App.test.callWithAllTypes('Append to file with wrong third parameter', function (arg) {
            var fs = App.test.createSimpleFs();
            if (App.isString(arg)) {
                throw new Error('Error');
            }
            fs.fs.appendToFile(fs.fs.getFolder('folder'), 'file', arg);
        });
        assertNoException('Append normal data to the empty file', function () {
            var fs = new App.Fs({f1: {f2: {file: ''}}});

            fs.appendToFile(fs.getFolder('f1/f2'), 'file', 'test');
            assertTrue('Get file data', fs.readFile(fs.getFolder('f1/f2'), 'file') === 'test');
        });
        assertNoException('Append normal data to not empty file', function () {
            var fs = new App.Fs({f1: {f2: {file: '123'}}});

            fs.appendToFile(fs.getFolder('f1/f2'), 'file', 'test');
            assertTrue('Get file data', fs.readFile(fs.getFolder('f1/f2'), 'file') === '123test');
        });
    },

    testSequenceOfCommands: function () {
        assertNoException('Commands sequence', function () {
            var folder;
            var folders;
            var fs = new App.Fs({
                f1: {
                    f2: {
                        file3: '',
                        file4: 'test'
                    },
                    f5: {}
                }
            });

            folder  = fs.getFolder('f1/f2');
            assertTrue('Read empty file', fs.readFile(folder, 'file3') === '');
            assertTrue('Read empty file', fs.readFile(folder, 'file4') === 'test');
            assertTrue('Read empty file again', fs.readFile(folder, 'file3') === '');
            folder  = fs.getParent(folder);
            folders = fs.getFilesAndFolders(folder);
            assertTrue('Check folder subfolders', folders.length === 2 && folders[0] === '[f2]' && folders[1] === '[f5]');
            folder  = fs.getChild(folder, 'f5');
            fs.createFile(folder, 'file6');
            fs.fileExists(folder, 'file6');
            fs.updateFile(folder, 'file6', 0, 'test');
            assertTrue('Check created file body', fs.readFile(folder, 'file6') === 'test');
            fs.appendToFile(folder, 'file6', '123');
            assertTrue('Check created file body', fs.readFile(folder, 'file6') === 'test123');
            folders = fs.getFilesAndFolders(folder);
            assertTrue('Check files list', folders.length === 1 && folders[0] === 'file6');
            fs.deleteFile(folder, 'file6');
            assertTrue('Check deleted file existence', !fs.fileExists(folder, 'file6'));
            folder = fs.getParent(folder);
            assertTrue('Check parent folder', fs.getRootFolder() === fs.getParent(folder));
        });
    }
});