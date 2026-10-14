/*
 * @author Petrusha Petrovich <syslef@gmail.com>
 */
(function () {
    var BASE_NAME = "Pinned to";

    // ── helpers / хелперы ──

    function getSelectedPinPosProps(comp) {
        var res = [];
        var sp = comp.selectedProperties;
        if (!sp) return res;
        for (var i = 0; i < sp.length; i++) {
            var p = sp[i];
            while (p) {
                if (p.matchName === "ADBE FreePin3 PosPin Atom") {
                    var pos = p.property("ADBE FreePin3 PosPin Position");
                    if (pos) res.push(pos);
                    break;
                }
                p = p.parentProperty;
            }
        }
        return res;
    }

    function buildExpression(name) {
        return [
            '// author: Petrusha Petrovich <syslef@gmail.com>',
            'var fx = effect("' + name + '");',
            'var L;',
            'try { L = fx("Layer"); } catch(e) { L = null; }',
            '',
            'if (fx.enabled) {',
            '    var worldAtZero = thisLayer.toComp(value, 0);',
            '    if (L != null) {',
            '        var P = L.fromComp(worldAtZero, 0);',
            '        thisLayer.fromComp(L.toComp(P));',
            '    } else {',
            '        thisLayer.fromComp(worldAtZero);',
            '    }',
            '} else {',
            '    value;',
            '}'
        ].join("\n");
    }


    // ── main / основное ──

    app.beginUndoGroup("Create Pinned To control and bind Puppet Pins");

    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Active item is not a Composition.");
        app.endUndoGroup();
        return;
    }

    var sl = comp.selectedLayers;
    if (!sl || sl.length !== 1) {
        alert("Select exactly ONE layer with Puppet pins.");
        app.endUndoGroup();
        return;
    }

    var pinProps = getSelectedPinPosProps(comp);
    if (pinProps.length === 0) {
        alert("No Puppet Pin positions selected.");
        app.endUndoGroup();
        return;
    }

    var target = sl[0];

    // Unique effect name / Уникальное имя эффекта
    var fxGroup = target.property("ADBE Effect Parade");
    var usedNames = {};
    for (var i = 1; i <= fxGroup.numProperties; i++) {
        usedNames[fxGroup.property(i).name] = true;
    }

    var effectName = BASE_NAME;
    var idx = 2;
    while (usedNames[effectName]) {
        effectName = BASE_NAME + " " + idx;
        idx++;
    }

    // 1. Expressions FIRST, before touching effects / Сначала выражения, до эффектов
    var expr = buildExpression(effectName);
    for (var j = 0; j < pinProps.length; j++) {
        pinProps[j].expression = expr;
    }

    // 2. Layer Control AFTER — adding effects invalidates pin property refs
    // 2. Layer Control ПОСЛЕ — добавление эффекта инвалидирует ссылки на свойства пинов
    var ctrl = fxGroup.addProperty("Layer Control");
    ctrl.name = effectName;

    app.endUndoGroup();

    alert('Done! Effect "' + effectName + '" created, expression applied to '
          + pinProps.length + ' pin(s).');
})();