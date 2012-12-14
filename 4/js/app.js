/**
 * Level 4 application class. This is entry point of application. We should create only one instance here.
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
function main() {
    //
    // Create singleton instance of application class
    //
    App.app = new App.Satellite();
    App.app.run();
}