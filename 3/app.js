/**
 * This is entry point of our Terminal application. We should create only one instance
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
function main() {
    //
    // Create singleton instance of application class
    //
    App.app = new App.Terminal('terminal', 'guest', 'terminal');
}