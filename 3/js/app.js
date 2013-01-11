/**
 * This is entry point of our Terminal application. We should create only one instance
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
function main() {
    var nasa;
    var err;

    /**
     * finish event handler. It destroys the terminal from third level and creates
     * 3D canvas from fourth level.
     * @private
     */
    function _on3LevelFinish() {
        //
        // Emulate connection
        //
        var loader = new Lib.FullScreenLoader({msg: _('connecting'), loaderUrl: Config.url.images.loader});
        loader.show();

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

            loader.hide();
            loader.destroy();
        }, 9000);
    }

    //
    // Chrome detection
    //
    if (navigator.userAgent.toLowerCase().indexOf('chrome') === -1) {
        err = new Lib.FullScreenLoader({msg: _('This application works only in Chrome.'), loaderUrl: Config.url.images.loader});
        err.show();
        return;
    }

    //
    // Audio player will be shared between two levels
    //
    App.player     = new Lib.RemotePlaylistAudioPlayer({url: Config.url.music.playlist});
    //
    // Creates singleton instance of full screen mode widget
    //
    App.fullscreen = new Lib.FullScreenView();
    //
    // Create singleton instance of application class
    //
    App.app        = new App.Terminal({
        id  : 'terminal',
        user: 'guest',
        host: 'terminal'
    });
    App.app.on('finish', _on3LevelFinish, null);

    //
    // Adds NASA logo at the left bottom corner
    //
    nasa = document.createElement('div');
    nasa.style.cssText = 'background-image: url(' + Config.url.images.nasa + '); width: 120px; height: 40px; position: absolute; top: 100%; margin-top: -40px; left: 3px;';
    document.body.appendChild(nasa);
}