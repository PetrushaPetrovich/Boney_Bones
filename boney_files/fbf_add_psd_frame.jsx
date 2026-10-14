/*
 * @author Petrusha Petrovich <syslef@gmail.com>
 */
// Renders the current frame as PSD, imports it above the top selected layer (1 frame long),
// opens the Frames folder and the file in Photoshop with a clean layer added.
// If a "(Footage)" folder sits next to the project, Frames goes inside it.
// Рендерит текущий кадр в PSD, импортирует над верхним выделенным слоем (1 кадр),
// открывает папку Frames и файл в Photoshop с чистым слоем. Есть "(Footage)" — Frames внутри неё.
// version 1.6

(function AddPSDFrame(thisObj) {
    var scriptName = "Add PSD frame";

    if (!app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {
        alert("Пожалуйста, выберите композицию.", scriptName);
        return;
    }

    var activeComp = app.project.activeItem;

    if (!app.project.file) {
        alert("Пожалуйста, сохраните проект перед использованием скрипта.", scriptName);
        return;
    }

    // Remember the top selected layer index BEFORE render / Индекс верхнего выделенного слоя ДО рендера
    var insertAboveIdx = null;
    (function rememberSelectionIndex() {
        if (activeComp.selectedLayers && activeComp.selectedLayers.length > 0) {
            var minIdx = activeComp.selectedLayers[0].index; // topmost = smallest index / верхний = меньший индекс
            for (var i = 1; i < activeComp.selectedLayers.length; i++) {
                var idx = activeComp.selectedLayers[i].index;
                if (idx < minIdx) minIdx = idx;
            }
            insertAboveIdx = minIdx;
        }
    })();

    var projectFolder = app.project.file.parent;

    // "(Footage)" folder next to the project -> frames go inside / есть "(Footage)" — кадры внутрь неё
    var footageFolder = new Folder(projectFolder.fsName + "/(Footage)");
    var baseDir = footageFolder.exists ? footageFolder : projectFolder;

    var saveFolder = new Folder(baseDir.fsName + "/Frames");
    if (!saveFolder.exists && !saveFolder.create()) {
        alert("Не удалось создать папку для сохранения кадров: " + saveFolder.fsName, scriptName);
        return;
    }

    var currentFrame = Math.floor(activeComp.time * activeComp.frameRate);
    var baseFileName = "Frame_" + activeComp.name + "_" + currentFrame;
    var filePath = saveFolder.fsName + "/" + baseFileName + ".psd";

    function getUniqueFilePath(baseFilePath) {
        var file = new File(baseFilePath);
        var counter = 2;
        while (file.exists) {
            var uniqueFilePath = baseFilePath.replace(/\.psd$/, "_" + counter + ".psd");
            file = new File(uniqueFilePath);
            counter++;
        }
        return file.fsName;
    }

    function saveFrameAsPSD() {
        filePath = getUniqueFilePath(filePath);

        var savedFile = new File(filePath);
        var renderQueue = app.project.renderQueue;

        // Temporarily disable queued items / Временно выключаем задания очереди
        var previousQueueState = [];
        try {
            for (var i = 1; i <= renderQueue.numItems; i++) {
                var item = renderQueue.item(i);
                if (item.status === RQItemStatus.QUEUED) {
                    previousQueueState.push({ item: item, render: item.render });
                    item.render = false;
                }
            }

            app.executeCommand(2104); // Add to Render Queue (active comp)

            var renderItem = renderQueue.item(renderQueue.numItems);
            if (!renderItem) {
                throw new Error("Не удалось добавить элемент в очередь рендера.");
            }

            renderItem.applyTemplate("Best Settings");
            renderItem.render = true;

            var outputModule = renderItem.outputModule(1);
            outputModule.applyTemplate("Photoshop");
            outputModule.file = savedFile;

            renderQueue.render();
            renderItem.remove();

            if (!savedFile.exists) {
                throw new Error("Не удалось создать PSD файл.");
            }

        } catch (err) {
            alert("Ошибка во время рендера: " + err.message, scriptName);
        } finally {
            // Restore previous items / Восстанавливаем задания
            for (var i = 0; i < previousQueueState.length; i++) {
                previousQueueState[i].item.render = previousQueueState[i].render;
            }
        }

        return savedFile.exists ? filePath : false;
    }

    function importLayerIntoProjectAndTimeline(psdFilePath) {
        var importedFile = app.project.importFile(new ImportOptions(new File(psdFilePath)));
        if (!importedFile) {
            alert("Не удалось импортировать PSD файл.");
            return;
        }

        var framesFolder = null;
        for (var i = 1; i <= app.project.rootFolder.numItems; i++) {
            var it = app.project.rootFolder.item(i);
            if (it.name === "Frames" && it instanceof FolderItem) {
                framesFolder = it;
                break;
            }
        }
        if (!framesFolder) framesFolder = app.project.rootFolder.items.addFolder("Frames");

        importedFile.parentFolder = framesFolder;

        // Add to timeline (always lands on top: index 1) / Слой всегда встаёт наверх
        var newLayer = activeComp.layers.add(importedFile);
        newLayer.startTime = activeComp.time;
        newLayer.outPoint = newLayer.startTime + (1 / activeComp.frameRate); // 1 frame / 1 кадр

        // Move the new layer above the previously selected one: adding on top shifted
        // old indices by +1, so that layer is now at insertAboveIdx + 1.
        // Новый слой — над ранее выделенным: после добавления наверх его индекс = insertAboveIdx + 1.
        if (insertAboveIdx !== null) {
            var refIdx = insertAboveIdx + 1;
            if (refIdx >= 1 && refIdx <= activeComp.numLayers) {
                var refLayer = activeComp.layer(refIdx);
                if (refLayer && refLayer !== newLayer) {
                    newLayer.moveBefore(refLayer);
                }
            }
        }
    }

    // --- Open PSD in Photoshop and add a clean layer / Открыть PSD в Photoshop + чистый слой ---
    function openInPhotoshopAndAddCleanLayer(psdPath) {
        function escapeForJSString(s) {
            return '"' + s.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
        }

        try {
            var bt = new BridgeTalk();
            bt.target = "photoshop";

            var psScript =
                "try {\n" +
                "  var f = new File(" + escapeForJSString(psdPath) + ");\n" +
                "  if (!f.exists) { throw new Error('Файл не найден: ' + f.fsName); }\n" +
                "  app.bringToFront();\n" +
                "  var doc = null;\n" +
                "  for (var i = 0; i < app.documents.length; i++) {\n" +
                "    try { if (app.documents[i].fullName && app.documents[i].fullName.fsName === f.fsName) { doc = app.documents[i]; break; } } catch(e) {}\n" +
                "  }\n" +
                "  if (!doc) doc = app.open(f);\n" +
                "  var newLayer = doc.artLayers.add();\n" +
                "  newLayer.name = 'Layer 1';\n" +
                "  newLayer.opacity = 100;\n" +
                "  try { newLayer.kind = LayerKind.NORMAL; } catch(e) {}\n" +
                "} catch (e) {\n" +
                "  alert('Photoshop: ' + e.message);\n" +
                "}";

            bt.body = psScript;

            bt.onError = function (msg) {
                alert("BridgeTalk/Photoshop ошибка: " + msg.body);
                // Fallback: open via system command / Фолбэк: открыть системной командой
                try {
                    var cmd = ($.os.indexOf('Windows') !== -1)
                        ? 'cmd.exe /c start \"\" \"' + psdPath + '\"'
                        : 'open \"' + psdPath + '\"';
                    system.callSystem(cmd);
                } catch (e) {}
            };

            bt.send();

        } catch (e) {
            // No BridgeTalk — open as is / Нет BridgeTalk — открываем как есть
            try {
                var cmd2 = ($.os.indexOf('Windows') !== -1)
                    ? 'cmd.exe /c start \"\" \"' + psdPath + '\"'
                    : 'open \"' + psdPath + '\"';
                system.callSystem(cmd2);
            } catch (e2) {}
        }
    }

    // (optional) default-app open / (опционально) открыть приложением по умолчанию
    function openFileWithDefaultApp(filePath) {
        var command = ($.os.indexOf('Windows') !== -1)
            ? 'cmd.exe /c start "" "' + filePath + '"'
            : 'open "' + filePath + '"';
        system.callSystem(command);
    }

    // Render runs outside the undo group: renderQueue.render() manages AE's internal undo
    // groups itself; wrapping it breaks the stack ("Undo group mismatch, will attempt to fix").
    // Рендер — вне undo-группы: render() сам управляет undo, обёртка ломает стек.
    var savedFilePath = saveFrameAsPSD();

    if (savedFilePath) {
        app.beginUndoGroup(scriptName);
        try {
            importLayerIntoProjectAndTimeline(savedFilePath);
            try { saveFolder.execute(); } catch (e) {} // open frames folder before Photoshop / открыть папку кадров
            openInPhotoshopAndAddCleanLayer(savedFilePath);
            activeComp.openInViewer();
        } catch (err) {
            alert("Ошибка: " + err.message, scriptName);
        } finally {
            app.endUndoGroup();
        }
    }

})(this);