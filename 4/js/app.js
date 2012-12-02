/**
 * Level 4 application class. This is entry point of application. We should create only one instance here.
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
function main() {
    /**
     * keyup DOM event handler. Scroll terminal textarea at the bottom.
     * @private
     */
    function _onTerminalKeyUp() {
        this.scrollTop = this.scrollHeight;
    }
    // TODO: this code should be in separate class
    // Initialize Console library
    // TODO: add commands here
    Console.init('terminal', 'root', 'kepler', []);
    //
    // Turn on terminal's autoscroll all the time
    //
    document.getElementById('terminal').addEventListener('keyup', _onTerminalKeyUp);

    //
    // Create singleton instance of application class
    //
    App.app = new App.Satellite();
    App.app.run();
}