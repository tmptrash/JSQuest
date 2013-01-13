copy /b ..\lib\css\style.css+..\lib\css\terminal.css+..\3\css\terminal.css+..\4\css\terminal.css term-in.css
java -jar yuicompressor-2.4.7.jar --type=css term-in.css -o term.css
java -jar compiler.jar --compilation_level=SIMPLE_OPTIMIZATIONS --js=../lib/js/external/console-min.js --js=../lib/js/external/speculoos.js --js=../lib/js/Core.js --js=../lib/js/external/Helper.js --js=../lib/js/external/jsonp.js --js=../4/js/libs/three.js --js=../4/js/libs/shaders/CopyShader.js --js=../4/js/libs/shaders/FilmShader.js --js=../4/js/libs/postprocessing/EffectComposer.js --js=../4/js/libs/postprocessing/ShaderPass.js --js=../4/js/libs/postprocessing/MaskPass.js --js=../4/js/libs/postprocessing/RenderPass.js --js=../4/js/libs/postprocessing/FilmPass.js --js=../4/js/libs/Detector.js --js=../lib/js/Helper.js --js=../lib/js/Language.js --js=../lib/js/Class.js --js=../lib/js/Observer.js --js=../lib/js/Terminal.js --js=../lib/js/PlaylistAudioPlayer.js --js=../lib/js/RemotePlaylistAudioPlayer.js --js=../lib/js/FullScreenLoader.js --js=../lib/js/FullScreenView.js --js=../cfg/Config.js --js=../3/js/Core.js --js=../3/js/Fs.js --js=../3/js/SatelliteFs.js --js=../3/js/Terminal.js --js=../4/js/WebGlContainer.js --js=../4/js/Universe.js --js=../4/js/SatelliteTerminal.js --js=../4/js/DatabaseManager.js --js=../4/js/Scenario.js --js=../3/js/app.js --js_output_file=term.js
rm -f term-in.css
copy /b index-1.html+term.css+index-2.html+term.js+index-3.html term.html
rm -f term.css
rm -f term.js
node ..\2\js\Archiver.js term.html ..\build\data.bin
rm -f term.html
7z a -mx0 -mhe n. data.bin -pN83
rm -f data.bin