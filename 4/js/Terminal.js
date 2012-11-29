/**
 * Satellite's telescope console. It contains console commands for moving and zooming telescope and
 * managing of huge databases between similar satellites. It creates all HTML structure for satellites
 * representation and console text area for commands. Every satellite can be in one of two states:
 * connected(green) and disconnected(grey).
 *
 * Visualisation for three satellites in browser:
 *  ------   ------   ------
 * |      | |      | |      |
 * | Sat1 | | Sat2 | | Sat3 |
 *  ------   ------   ------
 *  ------------------------
 * | root@kepler:~$         |
 * |                        |
 * |                        |
 * |                        |
 * |                        |
 * |                        |
 *  ------------------------
 *
 * Supported commands:
 *     left       x                 Move camera to the left to x points
 *     right      x                 Move camera to the right to x points
 *     top        x                 Move camera to the top to x points
 *     down       x                 Move camera to the down to x points
 *     zoom       x                 Zoom telescope (0 < x < 50) This is just moves camera by z axes
 *     connect    s1...sx           Connects to specified list of satellites (s1...sx - satellites)
 *     disconnect s1...sx           Disconnects from the list of satellites (s1...sx - satellites)
 *     remove     db1...dbx         Remove specified list of databases (db1...dbx - database names)
 *     sync       db1...dbx sx      Synchronize databases with specified satellite (db1...dbx - database names, sx - satellite name)
 *     pack       db1...dbx         Packs databases into db1p...dbxp, where "p" means packed (db1...dbx - database names)
 *     unpack     db1p...dbxp       Unpacks databases into db1...dbx (db1p...dbxp - packed database names)
 *     send       db1...dbx sx      Send databases to the satellite (db1...dbx - database names, sx - satellite name)
 *     list                         Lists all available databases with sizes
 *     msg        sx message        Send a message to specified satellite (sx - satellite, message - text message)
 *     encrypt    dbx key           Encrypts database by key (dbx - database name, key - string key for encryption)
 *     decrypt    dbxe key          Decrypts database by key (dbxe - encrypted database name, key - string key for encryption)
 *
 * @author DeadbraiN
 * @email deadbrainman@gmail.com
 */
