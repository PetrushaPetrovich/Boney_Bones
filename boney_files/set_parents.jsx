/*
 * @author Petrusha Petrovich <syslef@gmail.com>
 */
(function () {
    var PARENT_TAGS = ["Structure", "Bone"]; // substrings in parent layer comment / подстроки в комментарии родителя
    var TOL = 50;
    var USE_TOL = true; // limit by distance TOL / ограничение по расстоянию TOL
    var TOL2 = TOL * TOL;
    var DEBUG = true;

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

    function anchorInComp2D(lyr) {
        var t = lyr.property("ADBE Transform Group");
        var ap = t.property("ADBE Anchor Point").value;

        var p = layerToParent2D(lyr, ap);

        var cur = lyr.parent;
        while (cur != null) {
            p = layerToParent2D(cur, p);
            cur = cur.parent;
        }
        return p;
    }

    function dist2(a, b) {
        var dx = a[0] - b[0], dy = a[1] - b[1];
        return dx * dx + dy * dy;
    }

    function hasStructuresTag(lyr) {
        var cmt = "";
        try { cmt = lyr.comment || ""; } catch (e) { cmt = ""; }
        for (var t = 0; t < PARENT_TAGS.length; t++) {
            if (cmt.indexOf(PARENT_TAGS[t]) !== -1) return true;
        }
        return false;
    }

    app.beginUndoGroup("Parent by Anchor Proximity (optional TOL)");

    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("No Comp is activated");
        app.endUndoGroup();
        return;
    }

    var sl = comp.selectedLayers;
    if (!sl || sl.length < 1) {
        alert("No Layers are selected");
        app.endUndoGroup();
        return;
    }

    var donors = [];
    for (var i = 1; i <= comp.numLayers; i++) {
        var lyr = comp.layer(i);
        if (lyr && hasStructuresTag(lyr)) donors.push(lyr);
    }

    if (donors.length === 0) {
        if (DEBUG) alert('No donors in comp: no layers with "' + PARENT_TAGS.join('" / "') + '" in comment.');
        app.endUndoGroup();
        return;
    }

    var assigned = 0;

    for (var a = 0; a < sl.length; a++) {
        var target = sl[a];
        if (!target) continue;
        if (target.parent != null) continue;

        var tPos = anchorInComp2D(target);

        var bestParent = null;
        var bestD2 = Number.POSITIVE_INFINITY;

        for (var d = 0; d < donors.length; d++) {
            var candidateParent = donors[d];
            if (!candidateParent) continue;
            if (candidateParent === target) continue;

            var p = candidateParent;
            while (p != null) {
                if (p === target) { candidateParent = null; break; }
                p = p.parent;
            }
            if (candidateParent == null) continue;

            var dPos = anchorInComp2D(candidateParent);
            var dd2 = dist2(tPos, dPos);

            if (dd2 < bestD2) {
                bestD2 = dd2;
                bestParent = candidateParent;
            }
        }

        if (bestParent != null) {
            if (!USE_TOL || bestD2 <= TOL2) {
                target.parent = bestParent;
                assigned++;
            }
        }
    }

    app.endUndoGroup();

    if (DEBUG) alert("Assigned: " + assigned);
})();