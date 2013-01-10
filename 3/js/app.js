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
        // Emulate connection
        //
        App.loader = new Lib.FullScreenLoader({msg: _('connecting'), loaderUrl: Config.url.images.loaderImg});
        App.loader.show();

        setTimeout(function () {
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

            App.loader.hide();
            App.loader.destroy();
            delete App.loader;
        }, 9000);
    }

    //
    // Audio player will be shared between two levels
    //
    App.player = new Lib.RemotePlaylistAudioPlayer({url: Config.url.music.playlist});

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