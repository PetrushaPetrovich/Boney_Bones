/*
 * @author Petrusha Petrovich <syslef@gmail.com>
 * Imports project.aep (next to the script), copies the boney_limb shape layers into the active comp
 * with parenting, then removes the imported items.
 * Импортирует project.aep, копирует шейп-слои boney_limb в активную композицию с родителями,
 * затем удаляет импортированное.
 */
(function () {

    // ── 1. Find project.aep next to the script / project.aep рядом со скриптом ──
    var scriptFile = new File($.fileName);
    var projectFile = new File(scriptFile.parent.fsName + "/boney_template.aep");

    if (!projectFile.exists) {
        alert("Файл project.aep не найден рядом со скриптом.");
        return;
    }

    // ── 2. Check the active (target) comp / Проверяем целевую композицию ──────
    var targetComp = app.project.activeItem;
    if (!(targetComp instanceof CompItem)) {
        alert("Активируйте целевую композицию перед запуском скрипта.");
        return;
    }

    // IMPORTANT (undo): importFile() manages its own undo record; calling it inside
    // beginUndoGroup gives "Undo group mismatch" and breaks undo. So import and data
    // collection run BEFORE the group; the group wraps only comp changes.
    // ВАЖНО (undo): importFile() внутри beginUndoGroup даёт «Undo group mismatch» и ломает
    // отмену. Поэтому импорт — ДО группы, в группе только изменения композиции.

    // ── 3. Snapshot existing items / Снимок существующих айтемов ─────────────
    var existingIds = {};
    for (var i = 1; i <= app.project.numItems; i++) {
        existingIds[app.project.item(i).id] = true;
    }

    // ── 4. Import project.aep (outside the undo group) / Импорт вне undo-группы ──
    var io = new ImportOptions(projectFile);
    io.importAs = ImportAsType.PROJECT;
    app.project.importFile(io);

    // ── 5. Collect new items, find the source comp / Ищем композицию-источник ──
    var SOURCE_COMP_NAME = "boney_limb"; // <-- source comp name / имя композиции-источника

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

    // ── 6. Collect shape layers in original order / Шейп-слои в исходном порядке ──
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

    // ── 7. Record parent links before copying / Записываем parent-связи ─────
    // parentRelations[i] = index in shapeLayers of the parent of shapeLayers[i]; -1 = none.
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

    // ── Undo group only around comp changes; try/finally always closes it ────
    // (an unclosed group also causes stuck undo) / незакрытая группа тоже ломает undo
    app.beginUndoGroup("Boney Bones: Limb Creation");

    try {
        // ── 8. Unparent source layers / Снимаем родителей с исходных слоёв ─────
        // AE won't copy a parented layer (or one with a linked expression) while an undo
        // group is open. Hierarchy is saved in parentRelations; source comp is deleted anyway.
        // AE не копирует слой с родителем внутри undo-группы; иерархия уже в parentRelations.
        for (var i = 0; i < shapeLayers.length; i++) {
            if (shapeLayers[i].parent) shapeLayers[i].parent = null;
        }

        // ── 9. Copy layers into the target comp / Копируем слои в целевую ──────
        // Deselect all before each paste so copyToComp puts the layer at layer(1),
        // not above the selection. Copy bottom-up and keep references (no index reliance).
        // Снимаем выделение перед вставкой — слой встаёт в layer(1); копируем снизу вверх.
        var copied = []; // pasted copy of shapeLayers[i] / вставленная копия
        for (var i = shapeLayers.length - 1; i >= 0; i--) {
            for (var k = 1; k <= targetComp.numLayers; k++) {
                targetComp.layer(k).selected = false;
            }
            shapeLayers[i].copyToComp(targetComp);
            copied[i] = targetComp.layer(1); // just pasted — on top / только что вставленный — наверху
        }

        // ── 10. Restore parent links via direct refs / Восстанавливаем родителей ──
        for (var i = 0; i < copied.length; i++) {
            copied[i].parent = null;
        }
        for (var i = 0; i < copied.length; i++) {
            if (parentRelations[i] !== -1) {
                copied[i].parent = copied[parentRelations[i]];
            }
        }

        // ── 11. Remove all imported items / Удаляем импортированное ───────────
        cleanupNewItems(newItems);

        alert("Готово! Скопировано шейп-слоёв: " + shapeLayers.length);

    } catch (err) {
        alert("Ошибка: " + err.toString());
    } finally {
        app.endUndoGroup();
    }

    // Helpers

    // Remove imported items in passes: a folder can't go until it's empty, so repeat
    // while a pass still deletes something (handles any nesting).
    // Удаляем в несколько проходов: папка не удаляется, пока не опустеет.
    function cleanupNewItems(items) {
        var progress = true;
        while (progress) {
            progress = false;
            for (var i = 0; i < items.length; i++) {
                if (!items[i]) continue; // already removed / уже удалён
                try {
                    items[i].remove();
                    items[i] = null;
                    progress = true;
                } catch (e) {
                    // not empty / in use yet — retry next pass / ещё не пусто — на след. проходе
                }
            }
        }
    }

})();
