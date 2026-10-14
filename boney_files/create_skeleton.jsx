/*
 * @author Petrusha Petrovich <syslef@gmail.com>
 * Imports boney_files/project.aep and copies its "boney_skeleton" shape layers into the active comp,
 * restoring parents, then removes the import and centers "C | NULL".
 * Импортирует project.aep, копирует слои скелета в активную композицию, восстанавливает родителей.
 */
(function () {

    var scriptFile = new File($.fileName);
    var projectFile = new File(scriptFile.parent.fsName + "/boney_template.aep");

    if (!projectFile.exists) {
        alert("Файл project.aep не найден рядом со скриптом.");
        return;
    }

    // Try activeItem first; if focus is on the Project panel it can be null -> use the single CompItem in selection.
    // Сначала activeItem; если фокус на панели Project — ищем единственный CompItem в project.selection.
    var targetComp = null;
    if (app.project.activeItem instanceof CompItem) {
        targetComp = app.project.activeItem;
    } else {
        var sel = app.project.selection;
        var selComps = [];
        for (var s = 0; s < sel.length; s++) {
            if (sel[s] instanceof CompItem) selComps.push(sel[s]);
        }
        if (selComps.length === 1) {
            targetComp = selComps[0];
        } else if (selComps.length > 1) {
            alert("Выбрано несколько композиций. Оставьте одну активной или выделенной.");
            return;
        }
    }
    if (!targetComp) {
        alert("Не найдена целевая композиция. Откройте её (Composition/Timeline) или выделите в Project-панели.");
        return;
    }

    // UNDO: importFile() manages its own undo entry; calling it INSIDE our undo group gives
    // "Undo group mismatch" and breaks undo. So import/collect BEFORE the group; only comp edits go inside.
    // ВАЖНО про undo: importFile() внутри нашей undo-группы ломает отмену («Undo group mismatch»),
    // поэтому импорт делаем ДО группы, а в группу заворачиваем только изменения композиции.

    var existingIds = {};
    for (var i = 1; i <= app.project.numItems; i++) {
        existingIds[app.project.item(i).id] = true;
    }

    // Import project.aep (outside the undo group) / Импорт вне undo-группы
    var io = new ImportOptions(projectFile);
    io.importAs = ImportAsType.PROJECT;
    app.project.importFile(io);

    var SOURCE_COMP_NAME = "boney_skeleton"; // <-- source comp name / имя композиции-источника

    var newItems = [];
    var srcComp = null;

    for (var i = 1; i <= app.project.numItems; i++) {
        var item = app.project.item(i);
        if (!existingIds[item.id]) {
            newItems.push(item);
            if (!srcComp && item instanceof CompItem && item.name === SOURCE_COMP_NAME) {
                srcComp = item;
            }
        }
    }

    if (!srcComp) {
        cleanupNewItems(newItems);
        alert("Композиция '" + SOURCE_COMP_NAME + "' не найдена в project.aep.");
        return;
    }

    var shapeLayers = [];
    for (var i = 1; i <= srcComp.numLayers; i++) {
        if (srcComp.layer(i) instanceof ShapeLayer) {
            shapeLayers.push(srcComp.layer(i));
        }
    }

    if (shapeLayers.length === 0) {
        cleanupNewItems(newItems);
        alert("В композиции '" + SOURCE_COMP_NAME + "' не найдено шейп-слоёв.");
        return;
    }

    // Record parent links before copying: parentRelations[i] = parent index in shapeLayers, -1 if none.
    // Запоминаем parent-связи до копирования: индекс родителя в shapeLayers, -1 если нет.
    var srcIndexToArrayIndex = {};
    for (var i = 0; i < shapeLayers.length; i++) {
        srcIndexToArrayIndex[shapeLayers[i].index] = i;
    }

    var parentRelations = [];
    for (var i = 0; i < shapeLayers.length; i++) {
        var p = shapeLayers[i].parent;
        if (p && srcIndexToArrayIndex.hasOwnProperty(p.index)) {
            parentRelations[i] = srcIndexToArrayIndex[p.index];
        } else {
            parentRelations[i] = -1;
        }
    }

    // Undo group only around comp changes; try/finally guarantees endUndoGroup (an open group also hangs undo).
    // Undo-группа только вокруг изменений композиции; try/finally гарантирует endUndoGroup.
    app.beginUndoGroup("Boney Bones: Skeleton");

    try {
        // Copy layers into the target comp. Deselect all before each paste so copyToComp puts the layer
        // at layer(1); copy bottom-up and keep the ref to each pasted layer (no index dependence).
        // AE won't copy a parented layer (or one with linked expressions) while an undo group is open,
        // so unparent the sources — hierarchy is saved in parentRelations and restored on the copies.
        // Снимаем выделение перед вставкой (слой ляжет в layer(1)); AE не копирует слой с родителем
        // при открытой undo-группе — поэтому отвязываем исходники и восстанавливаем иерархию на копиях.
        for (var i = 0; i < shapeLayers.length; i++) {
            if (shapeLayers[i].parent) shapeLayers[i].parent = null;
        }

        var copied = []; // copied[i] — pasted copy of shapeLayers[i] / копия shapeLayers[i]
        for (var i = shapeLayers.length - 1; i >= 0; i--) {
            for (var k = 1; k <= targetComp.numLayers; k++) {
                targetComp.layer(k).selected = false;
            }
            shapeLayers[i].copyToComp(targetComp);
            copied[i] = targetComp.layer(1); // just pasted layer is on top / вставленный слой наверху
        }

        // Restore parent links via direct layer refs / Восстанавливаем родителей по прямым ссылкам
        for (var i = 0; i < copied.length; i++) {
            copied[i].parent = null;
        }
        for (var i = 0; i < copied.length; i++) {
            if (parentRelations[i] !== -1) {
                copied[i].parent = copied[parentRelations[i]];
            }
        }

        // Delete all imported items / Удаляем импортированные айтемы
        cleanupNewItems(newItems);

        // Center and scale "C | NULL" / Центрируем и масштабируем "C | NULL"
        var nullLayer = null;
        for (var i = 1; i <= targetComp.numLayers; i++) {
            if (targetComp.layer(i).name === "C | NULL") {
                nullLayer = targetComp.layer(i);
                break;
            }
        }
        if (nullLayer) {
            var cx = targetComp.width  / 2;
            var cy = targetComp.height / 2;
            nullLayer.property("Position").setValue([cx, cy]);
            var sc = 100 * (targetComp.height / 2800);
            nullLayer.property("Scale").setValue([sc, sc]);
        }

        alert("Готово! Скопировано шейп-слоёв: " + shapeLayers.length);

    } catch (err) {
        alert("Ошибка: " + err.toString());
    } finally {
        app.endUndoGroup();
    }

    // Helpers

    // Delete imported items in passes: a folder can't go until empty, so repeat while anything gets deleted.
    // Удаляем в несколько проходов: папка не удаляется, пока не опустеет — повторяем, пока что-то удаляется.
    function cleanupNewItems(items) {
        var progress = true;
        while (progress) {
            progress = false;
            for (var i = 0; i < items.length; i++) {
                if (!items[i]) continue; // already deleted / уже удалён
                try {
                    items[i].remove();
                    items[i] = null;
                    progress = true;
                } catch (e) {
                    // not empty yet or in use — retry next pass / ещё не пусто — на следующем проходе
                }
            }
        }
    }

})();