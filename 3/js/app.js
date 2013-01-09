/**
 * This is entry point of our Terminal application. We should create only one instance
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
function main() {
    /**
     * finish event handler. It destroys the terminal from third level and creates
     * 3D canvas from fourth level.
     * @private
     */
    function _on3LevelFinish() {
        //
        // Removes 3 level
        //
        App.app.destroy();
        delete App.app;

        //
        // creates 4 level
        //
        App.app = new App.Scenario();
        App.app.run();
    }

    //
    // Audio player will be shared between two levels
    //
    App.player = new Lib.RemotePlaylistAudioPlayer({url: 'https://dl.dropbox.com/s/2leypb2aduqpyto/3.json?dl=1'});

    //
    // Create singleton instance of application class
    //
    App.app = new App.Terminal({
        id  : 'terminal',
        user: 'guest',
        host: 'terminal'
    });

    App.app.on('finish', _on3LevelFinish, null);
}