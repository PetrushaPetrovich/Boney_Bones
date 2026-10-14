/*
 * Boney Bones: copy the boney_dummy rig (from boney_template.aep) into the target comp.
 * Копирует риг boney_dummy (из boney_template.aep) в целевую композицию.
 * @author Petrusha Petrovich <syslef@gmail.com>
 */

(function () {

    var SOURCE_COMP_NAME = "boney_dummy";
    var FOLDER_NAME      = "_boney_bones";

    // Target comp: activeItem, or the single comp selected in Project (activeItem is null when Project has focus).
    // Целевая композиция: activeItem или единственная выделенная в Project (при фокусе на Project activeItem = null).
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

    // Find boney_dummy. NOTE: import BEFORE beginUndoGroup — importFile() keeps its own undo record,
    // inside an undo group it breaks Undo ("Undo group mismatch").
    // Ищем boney_dummy. ВАЖНО: импорт ДО beginUndoGroup — importFile() ведёт свою undo-запись,
    // внутри undo-группы ломает отмену («Undo group mismatch»).
    var srcComp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        var item = app.project.item(i);
        if (item instanceof CompItem && item.name === SOURCE_COMP_NAME) {
            srcComp = item;
            break;
        }
    }

    // Not found — import boney_template.aep (outside the undo group) / Не нашли — импорт шаблона (вне undo-группы)
    if (!srcComp) {
        var scriptFile  = new File($.fileName);
        var projectFile = new File(scriptFile.parent.fsName + "/boney_template.aep");

        if (!projectFile.exists) {
            alert("Файл boney_template.aep не найден рядом со скриптом.");
            return;
        }

        var existingIds = {};
        for (var i = 1; i <= app.project.numItems; i++) {
            existingIds[app.project.item(i).id] = true;
        }

        var io = new ImportOptions(projectFile);
        io.importAs = ImportAsType.PROJECT;
        app.project.importFile(io);

        var importedFolder = null;
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (existingIds[item.id]) continue;
            if (!srcComp && item instanceof CompItem && item.name === SOURCE_COMP_NAME) {
                srcComp = item;
            }
            if (item instanceof FolderItem &&
                item.parentFolder === app.project.rootFolder &&
                !importedFolder) {
                importedFolder = item;
            }
        }

        // Keep the imported project, only rename its folder / Проект не удаляем — только переименовываем папку
        if (importedFolder) {
            importedFolder.name = FOLDER_NAME;
        }

        if (!srcComp) {
            alert("Композиция '" + SOURCE_COMP_NAME + "' не найдена в boney_template.aep.");
            return;
        }
    }

    // All source layers in stack order (1 = top) / Все слои источника в порядке стека (1 = верх)
    var srcLayers = [];
    for (var i = 1; i <= srcComp.numLayers; i++) {
        srcLayers.push(srcComp.layer(i));
    }

    if (srcLayers.length === 0) {
        alert("В композиции '" + SOURCE_COMP_NAME + "' нет слоёв.");
        return;
    }

    // Save parent links before copying / Запоминаем parent-связи до копирования
    var srcIndexToArrayIndex = {};
    for (var i = 0; i < srcLayers.length; i++) {
        srcIndexToArrayIndex[srcLayers[i].index] = i;
    }

    var parentRelations = [];
    for (var i = 0; i < srcLayers.length; i++) {
        var p = srcLayers[i].parent;
        if (p && srcIndexToArrayIndex.hasOwnProperty(p.index)) {
            parentRelations[i] = srcIndexToArrayIndex[p.index];
        } else {
            parentRelations[i] = -1;
        }
    }

    // Undo group only around comp changes; try/finally always closes it (an open group hangs Undo).
    // Undo-группа только вокруг изменений композиции; try/finally всегда её закрывает.
    app.beginUndoGroup("Boney Bones: Dummy");

    try {
        // Unparent source layers: copyToComp can't copy a parented layer inside an undo group.
        // Снимаем родителей: copyToComp не копирует слой с родителем внутри undo-группы.
        for (var i = 0; i < srcLayers.length; i++) {
            if (srcLayers[i].parent) srcLayers[i].parent = null;
        }

        // Deselect all before each paste so copyToComp puts the layer at layer(1); copy bottom-up.
        // Снимаем выделение перед вставкой — copyToComp кладёт слой в layer(1); копируем снизу вверх.
        var copied = []; // copied[i] = copy of srcLayers[i] / копия srcLayers[i]
        for (var i = srcLayers.length - 1; i >= 0; i--) {
            for (var k = 1; k <= targetComp.numLayers; k++) {
                targetComp.layer(k).selected = false;
            }
            srcLayers[i].copyToComp(targetComp);
            copied[i] = targetComp.layer(1);
        }

        // Restore parents in the template comp / Возвращаем родителей в шаблоне
        for (var i = 0; i < srcLayers.length; i++) {
            if (parentRelations[i] !== -1) {
                srcLayers[i].parent = srcLayers[parentRelations[i]];
            }
        }

        // Rebuild parent links on the copies / Восстанавливаем parent-связи на копиях
        for (var i = 0; i < copied.length; i++) {
            copied[i].parent = null;
        }
        for (var i = 0; i < copied.length; i++) {
            if (parentRelations[i] !== -1) {
                copied[i].parent = copied[parentRelations[i]];
            }
        }

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

        alert("Готово! Скопировано слоёв: " + srcLayers.length);

    } catch (err) {
        alert("Ошибка: " + err.toString());
    } finally {
        app.endUndoGroup();
    }

})();
