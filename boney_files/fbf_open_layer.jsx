/*
 * @author Petrusha Petrovich <syslef@gmail.com>
 */
// Opens source files of the selected layers in their default apps.
// Открывает исходники выбранных слоёв в приложениях по умолчанию.
// version 1.0

(function OpenSelectedLayers(thisObj) {
    var scriptName = "Open Selected Layers";

    if (!app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {
        alert("Пожалуйста, выберите композицию.", scriptName);
        return;
    }

    var activeComp = app.project.activeItem;
    var selectedLayers = activeComp.selectedLayers;

    if (selectedLayers.length === 0) {
        alert("Пожалуйста, выделите хотя бы один слой.", scriptName);
        return;
    }

    function openFileWithDefaultApp(filePath) {
        // Windows: "start", macOS: "open" / Windows — "start", macOS — "open"
        var command = ($.os.indexOf('Windows') !== -1)
            ? 'cmd.exe /c start "" "' + filePath + '"'
            : 'open "' + filePath + '"';
        system.callSystem(command);
    }

    app.beginUndoGroup(scriptName);

    for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];

        if (layer.source && layer.source.file) {
            var filePath = layer.source.file.fsName;
            openFileWithDefaultApp(filePath);
        } else {
            alert("Слой \"" + layer.name + "\" не содержит источника с файлом.", scriptName);
        }
    }

    app.endUndoGroup();
})(this);
