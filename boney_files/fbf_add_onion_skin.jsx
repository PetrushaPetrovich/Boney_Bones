// Onion Skin v2.0
// Adds an adjustment + guide shape layer "Onion Skin" on top of the active comp,
// sized to the comp by expressions, with CC Wide Time (2/2 steps, motion blur off)
// and CC Composite (opacity 50%, In Front, RGB Only off). No .ffx preset needed.
// Добавляет корректирующий направляющий шейп-слой «Onion Skin» наверх композиции,
// растянутый экспрешенами на всю комп, с CC Wide Time (2/2 шага, без блюра)
// и CC Composite (50%, In Front, RGB Only выкл.). Пресет .ffx не нужен.
(function createOnionSkin() {
    var scriptName = "Onion Skin";
    var SIZE = 1080;              // static value under the expression / значение под экспрешеном
    var FILL = [0, 1, 0];         // irrelevant for adjustment layer, only alpha matters / важна только альфа

    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
        alert("Откройте композицию.", scriptName);
        return;
    }

    // Effect prop by one of the names (AE versions differ), else by index; null if none.
    // Свойство эффекта по одному из имён (версии AE различаются), иначе по индексу.
    function effectProp(fx, names, index) {
        var p = null;
        for (var i = 0; i < names.length; i++) {
            try { p = fx.property(names[i]); } catch (e) { p = null; }
            if (p) return p;
        }
        try { p = fx.property(index); } catch (e2) { p = null; }
        return p;
    }

    function setIfPossible(p, value) {
        if (!p) return false;
        try { p.setValue(value); return true; } catch (e) { return false; }
    }

    // Returns matchName of the current (non-obsolete) effect by display name: in new AE
    // the hardcoded "CC Composite" matchName points to the obsolete version.
    // matchName актуального (не Obsolete) эффекта по имени: в новых AE жёсткий
    // matchName "CC Composite" указывает на устаревшую версию.
    function findEffectMatchName(displayName, fallback) {
        var list = app.effects, candidate = null;
        for (var i = 0; i < list.length; i++) {
            var e = list[i];
            if (e.displayName !== displayName) continue;
            var cat = String(e.category || "");
            var obsolete = /obsolete|устаревш/i.test(cat) || /obsolete/i.test(String(e.matchName));
            if (!obsolete) return e.matchName;   // current version / актуальная версия
            if (!candidate) candidate = e.matchName;
        }
        return candidate || fallback;
    }

    app.beginUndoGroup(scriptName);
    try {
        // New shape goes to layer(1), centered by default; rect is centered at [0,0].
        // Новый шейп встаёт в layer(1) по центру; прямоугольник центрирован в [0,0].
        var shape = comp.layers.addShape();
        shape.name = "Onion Skin";

        var contents = shape.property("ADBE Root Vectors Group");
        var group = contents.addProperty("ADBE Vector Group");
        group.name = "Solid";

        // IMPORTANT: each addProperty invalidates earlier refs ("Object is invalid"),
        // so add everything first, then re-fetch props by matchName.
        // ВАЖНО: addProperty инвалидирует прежние ссылки — сначала добавляем всё,
        // потом заново берём свойства по matchName.
        var gContents = group.property("ADBE Vectors Group");
        gContents.addProperty("ADBE Vector Shape - Rect");
        gContents.addProperty("ADBE Vector Graphic - Fill");

        var rect = group.property("ADBE Vectors Group").property("ADBE Vector Shape - Rect");
        var rSize = rect.property("ADBE Vector Rect Size");
        var rPos  = rect.property("ADBE Vector Rect Position");
        rSize.setValue([SIZE, SIZE]);
        rPos.setValue([0, 0]);
        rect.property("ADBE Vector Rect Roundness").setValue(0);
        rSize.expression = "[thisComp.width,thisComp.height]"; // size = comp size / размер = композиция
        rPos.expression  = "[0,0]";                             // centered at layer origin / центр в начале координат

        var fill = group.property("ADBE Vectors Group").property("ADBE Vector Graphic - Fill");
        fill.property("ADBE Vector Fill Color").setValue([FILL[0], FILL[1], FILL[2], 1]);

        var tg = shape.property("ADBE Transform Group");
        tg.property("ADBE Anchor Point").expression = "[0,0]";
        tg.property("ADBE Position").expression     = "[thisComp.width/2,thisComp.height/2]";
        tg.property("ADBE Scale").expression        = "[100,100]";

        shape.adjustmentLayer = true;
        shape.guideLayer = true;
        shape.label = 2; // yellow / жёлтый

        var effects = shape.property("ADBE Effect Parade");

        // 1) CC Wide Time
        var wideTime = effects.addProperty("CC Wide Time");
        setIfPossible(effectProp(wideTime, ["Forward Steps"],      1), 2);
        setIfPossible(effectProp(wideTime, ["Backward Steps"],     2), 2);
        // Cycore popup order: 1 = On, 2 = Off (verified in AE) / Порядок у Cycore: 1 = On, 2 = Off
        setIfPossible(effectProp(wideTime, ["Native Motion Blur"], 3), 2); // 2 = Off

        // 2) CC Composite, current (non-obsolete) version via app.effects.
        // New params: Top Layer(1), Opacity(2), Transfer Mode(3), RGB Only(4);
        // old: Opacity(1), Composite Original(2), RGB Only(3). Top Layer stays default.
        // Актуальная (не obsolete) версия; индексы параметров у новой/старой разные.
        var composite = effects.addProperty(findEffectMatchName("CC Composite", "CC Composite"));
        var hasTopLayer = !!effectProp(composite, ["Top Layer"], -1);
        var off = hasTopLayer ? 1 : 0;
        setIfPossible(effectProp(composite, ["Opacity"],  1 + off), 50);
        // Leave Transfer Mode alone: default is already "In Front"; index 1 is "Copy".
        // Transfer Mode не трогаем: по умолчанию «In Front», индекс 1 — «Copy».
        setIfPossible(effectProp(composite, ["RGB Only"], 3 + off), 0); // off / выкл.

        // Select only the new layer / Выделяем только новый слой
        for (var i = 1; i <= comp.numLayers; i++) comp.layer(i).selected = false;
        shape.selected = true;
    } catch (err) {
        alert("Ошибка: " + err.message, scriptName);
    } finally {
        app.endUndoGroup();
    }
})();
