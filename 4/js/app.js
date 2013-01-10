/**
 * Level 4 application class. This is entry point of application. We should create only one instance here.
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
function main() {
    //
    // Create singleton instance of scenario (application) class
    //
    App.app = new App.Scenario();
    App.app.run();
    //
    // Create singleton instance of audio player
    //
    App.player = new Lib.RemotePlaylistAudioPlayer({url: Config.url.music.playlist});

}