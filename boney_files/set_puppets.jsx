/*
 * @author Petrusha Petrovich <syslef@gmail.com>
 */
(function () {
    var DEBUG = true;
    var PIN_TAGS = ["Structure", "Bone", "Pin"]; // substrings in target layer comment that mark pin layers / подстроки в комментарии слоя-цели для пинов
    var TOL = 100;
    var TOL2 = TOL * TOL;

    function deg2rad(d) { return d * Math.PI / 180; }

    function rot2D(pt, rad) {
        var c = Math.cos(rad), s = Math.sin(rad);
        return [pt[0] * c - pt[1] * s, pt[0] * s + pt[1] * c];
    }

    function layerToParent2D(lyr, pt) {
        var t = lyr.property("ADBE Transform Group");
        var anchor = t.property("ADBE Anchor Point").value;
        var pos    = t.property("ADBE Position").value;
        var sc     = t.property("ADBE Scale").value;
        var rot    = t.property("ADBE Rotate Z").value;

        var v = [pt[0] - anchor[0], pt[1] - anchor[1]];
        v = [v[0] * (sc[0] / 100), v[1] * (sc[1] / 100)];
        v = rot2D(v, deg2rad(rot));
        return [v[0] + pos[0], v[1] + pos[1]];
    }

    function pointInComp2D(lyr, pt) {
        var p = layerToParent2D(lyr, pt);
        var cur = lyr.parent;
        while (cur) {
            p = layerToParent2D(cur, p);
            cur = cur.parent;
        }
        return p;
    }

    function dist2(a, b) {
        var dx = a[0] - b[0], dy = a[1] - b[1];
        return dx * dx + dy * dy;
    }

    function hasPinTag(lyr) {
        var cmt = "";
        try { cmt = lyr.comment || ""; } catch (e) {}
        for (var t = 0; t < PIN_TAGS.length; t++) {
            if (cmt.indexOf(PIN_TAGS[t]) !== -1) return true;
        }
        return false;
    }

    function getSelectedPinAtoms(comp) {
        var res = [];
        var sp = comp.selectedProperties;
        if (!sp) return res;

        for (var i = 0; i < sp.length; i++) {
            var pr = sp[i];
            var p = pr;
            while (p) {
                if (p.matchName === "ADBE FreePin3 PosPin Atom") {
                    var exists = false;
                    for (var k = 0; k < res.length; k++) {
                        if (res[k] === p) { exists = true; break; }
                    }
                    if (!exists) res.push(p);
                    break;
                }
                p = p.parentProperty;
            }
        }
        return res;
    }

    function safeProp(atom, mn) {
        try {
            var pr = atom.property(mn);
            return pr ? pr : null;
        } catch (e) { return null; }
    }

    function isShapeLayer(lyr) {
        return lyr && lyr.matchName === "ADBE Vector Layer";
    }

    app.beginUndoGroup("Bind selected Puppet Pins to |Pin| layers");

    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("No Comp");
        app.endUndoGroup();
        return;
    }

    var sl = comp.selectedLayers;
    if (!sl || sl.length !== 1) {
        alert("Select ONE layer with Puppet");
        app.endUndoGroup();
        return;
    }

    var target = sl[0];
    var targetIsShape = isShapeLayer(target);

    var pinLayers = [];
    for (var i = 1; i <= comp.numLayers; i++) {
        var l = comp.layer(i);
        if (l !== target && hasPinTag(l)) pinLayers.push(l);
    }

    if (pinLayers.length === 0) {
        alert('No "' + PIN_TAGS.join('" / "') + '" layers in comp');
        app.endUndoGroup();
        return;
    }

    var pinAtoms = getSelectedPinAtoms(comp);
    if (pinAtoms.length === 0) {
        alert("No Puppet Pins selected");
        app.endUndoGroup();
        return;
    }

    var assigned = 0;

    for (var j = 0; j < pinAtoms.length; j++) {
        var atom = pinAtoms[j];
        var pinPos = safeProp(atom, "ADBE FreePin3 PosPin Position");
        if (!pinPos) continue;

        var pinLS = pinPos.value;
        var pinCS = targetIsShape ? [pinLS[0], pinLS[1]] : pointInComp2D(target, pinLS);

        var best = null;
        var bestD2 = Infinity;

        for (var k = 0; k < pinLayers.length; k++) {
            var pl = pinLayers[k];
            var a = pl.property("ADBE Transform Group")
                      .property("ADBE Anchor Point").value;

            var aCS = pointInComp2D(pl, a);
            var d2 = dist2(pinCS, aCS);

            if (d2 < bestD2) {
                bestD2 = d2;
                best = pl;
            }
        }

        if (best && bestD2 <= TOL2) {
            var nm = best.name;

            if (targetIsShape) {
                pinPos.expression =
                    'var L = thisComp.layer("' + nm + '");\n' +
                    'L.toComp(L.anchorPoint);';
            } else {
                pinPos.expression =
                    'var L = thisComp.layer("' + nm + '");\n' +
                    'thisLayer.fromComp( L.toComp(L.anchorPoint) );';
            }

            var pinScale = safeProp(atom, "ADBE FreePin3 PosPin Scale");
            if (pinScale && pinScale.canSetExpression) {
                pinScale.expression =
                    'var L = thisComp.layer("' + nm + '");\n' +
                    'var t0 = thisComp.displayStartTime;\n' +
                    'var sc = L.transform.scale;\n' +
                    'var sc0 = L.transform.scale.valueAtTime(t0);\n' +
                    'value * (sc[0] / sc0[1]);';
            }

            var pinRot = safeProp(atom, "ADBE FreePin3 PosPin Rotation");
            if (pinRot && pinRot.canSetExpression) {
                pinRot.expression =
                    'var L = thisComp.layer("' + nm + '");\n' +
                    'var t0 = thisComp.displayStartTime;\n' +
                    'var d = 0;\n' +
                    'try {\n' +
                    '    var p = L;\n' +
                    '    while (p) { d += p.transform.rotation - p.transform.rotation.valueAtTime(t0); p = p.parent; }\n' +
                    '} catch (e) {}\n' +
                    'value + d;';
            }

            assigned++;
        }
    }

    app.endUndoGroup();

    if (DEBUG) alert("Assigned: " + assigned + " / " + pinAtoms.length);
})();