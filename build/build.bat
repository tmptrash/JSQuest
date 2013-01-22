rem
rem This is JSQuest build script. It assembles all css and js files in one html file
rem encodes(BinaryEncoder.js) it and compress (7zip).
rem
rem @author DeadbraiN
rem @email deadbrainman@gmail.com
rem

rem
rem Assemble all css style files in one and compress it with YUICompressor
rem
copy /b ..\lib\css\style.css+..\lib\css\terminal.css+..\3\css\terminal.css+..\4\css\terminal.css term-in.css
java -jar yuicompressor-2.4.7.jar --type=css term-in.css -o term.css
rm -f term-in.css

rem
rem Compress all js files of the project in one with Closure Compiler
rem
java -jar compiler.jar --compilation_level=SIMPLE_OPTIMIZATIONS --js=../lib/js/external/console-min.js --js=../lib/js/external/speculoos.js --js=../lib/js/Core.js --js=../lib/js/external/Helper.js --js=../lib/js/external/jsonp.js --js=../4/js/libs/three.js --js=../4/js/libs/shaders/CopyShader.js --js=../4/js/libs/shaders/FilmShader.js --js=../4/js/libs/postprocessing/EffectComposer.js --js=../4/js/libs/postprocessing/ShaderPass.js --js=../4/js/libs/postprocessing/MaskPass.js --js=../4/js/libs/postprocessing/RenderPass.js --js=../4/js/libs/postprocessing/FilmPass.js --js=../4/js/libs/Detector.js --js=../lib/js/Helper.js --js=../lib/js/Language.js --js=../lib/js/Class.js --js=../lib/js/Observer.js --js=../lib/js/Terminal.js --js=../lib/js/PlaylistAudioPlayer.js --js=../lib/js/RemotePlaylistAudioPlayer.js --js=../lib/js/FullScreenLoader.js --js=../lib/js/FullScreenView.js --js=../cfg/Config.js --js=../3/js/Core.js --js=../3/js/Fs.js --js=../3/js/SatelliteFs.js --js=../3/js/Terminal.js --js=../4/js/WebGlContainer.js --js=../4/js/Universe.js --js=../4/js/SatelliteTerminal.js --js=../4/js/DatabaseManager.js --js=../4/js/Scenario.js --js=../3/js/app.js --js_output_file=term.js

rem
rem Encode js content to prevent cheating. See http://utf-8.jp/public/jjencode.html for details
rem
node BinaryEncoder.js term.js term-encoded.js

rem
rem Collect css and js code in one html file. Here is the script which decodes our source script:
rem function decode(str) {
rem     var result    = '';
rem     var char_true = '\t';
rem     var i;
rem     var j;
rem     var chr;
rem     var encoded;
rem 
rem     str = str.split('\n');
rem     for (i = 0; i < str.length; i++) {
rem         encoded = '';
rem         for (j = 0; j < str[i].length; j++) {
rem             encoded += (str[i][j] === char_true) ? '1' : '0';
rem         }
rem         chr     = parseInt(encoded, 2);
rem         result += String.fromCharCode(chr.toString(10));
rem     }
rem 
rem     return result.substr(0, result.length - 1);
rem }
rem //
rem // Because of eval(), we should create global variable window and call mail() menually
rem //
rem eval('window = this;' + decode(document.getElementById('script').innerText)+';main();');
rem 
copy /b index-1.html+term.css+index-2.html+term-encoded.js+index-21.html+index-22.html+index-3.html term.html
rm -f term.css
rm -f term.js
rm -f term-encoded.js

rem
rem Pack and archieve html file
rem
node ..\2\js\Archiver.js term.html ..\build\data.bin
rm -f term.html
7z a -mx0 -mhe n12.tmp data.bin -pN83
rm -f data.bin

rem
rem Adds secret header at the beginning to hide the 7z prefix, also at the beginning
rem
copy /b header.bin+n12.tmp n12.
rm -f n12.tmp