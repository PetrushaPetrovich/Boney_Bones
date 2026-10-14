/*
 * @author Petrusha Petrovich <syslef@gmail.com>
 */

// create_bone.jsx
// Creates an empty shape layer in the center of the composition
// and applies a specified .ffx preset from the same folder as this script.
// Создаёт пустой шейп-слой в центре композиции и применяет .ffx-пресет из папки скрипта.

(function () {
    // SETTINGS / НАСТРОЙКИ
    var PRESET_NAME = "create_bone.ffx"; // preset file name / имя файла пресета
    var LAYER_COMMENT = "Bone";           // comment added to the new bone / комментарий новой кости

    // Expressions (same as add_properties.jsx) / Выражения (как в add_properties.jsx)
    var EXPR_POSITION = [
        "// author: Petrusha Petrovich <syslef@gmail.com>",
        "// Position",
        "results = value;",
        "",
        "for (var i = 1; i <= thisLayer(\"Effects\").numProperties; i++) {",
        "  try {",
        "\tfx = thisLayer(\"Effects\")(i);",
        "\tfx.enabled ? results = linear(fx(\"SET POSITION\"), 0 , 100, results, fx(\"setPosition\")) : results;",
        "  } catch (e) {}",
        "}",
        "",
        "for (var l = 1; l <= thisComp.numLayers; l++){",
        "    var L = thisComp.layer(l);",
        "    for (var i = 1; i <= L(\"Effects\").numProperties; i++){",
        "        try{",
        "            var fx = L(\"Effects\")(i);",
        "\t\t\tif (fx.enabled && fx(\"Point B\").index == thisLayer.index && fx(\"Point A\") != null && fx(\"Point C\") != null){",
        "                results = thisComp.layer(l).effect(i)(\"bPosition\");",
        "                l = thisComp.numLayers + 1; // остановить внешний цикл",
        "                break; // остановить внутренний",
        "            }",
        "\t\t\tif (fx.enabled && fx(\"Point C\").index == thisLayer.index && fx(\"Point A\") != null && fx(\"Point B\") != null){",
        "                results = thisComp.layer(l).effect(i)(\"cPosition\");",
        "                l = thisComp.numLayers + 1; // остановить внешний цикл",
        "                break; // остановить внутренний",
        "            }",
        "        }catch(e){}",
        "    }",
        "}",
        "results"
    ].join("\n");

    var EXPR_ROTATION = [
        "// author: Petrusha Petrovich <syslef@gmail.com>",
        "// Rotation",
        "var results = value;",
        "for (var l = 1; l <= thisComp.numLayers; l++){",
        "    var L = thisComp.layer(l);",
        "    for (var i = 1; i <= L(\"Effects\").numProperties; i++){",
        "        try{",
        "            var fx = L(\"Effects\")(i);",
        "            if (fx.enabled && fx(\"Point A\").index == thisLayer.index && fx(\"Point B\") != null && fx(\"Point C\") != null){",
        "                results = thisComp.layer(l).effect(i)(\"aRotation\");",
        "                l = thisComp.numLayers + 1; // остановить внешний цикл",
        "                break; // остановить внутренний",
        "            }",
        "\t\t\tif (fx.enabled && fx(\"Point B\").index == thisLayer.index && fx(\"Point A\") != null && fx(\"Point C\") != null){",
        "                results = thisComp.layer(l).effect(i)(\"bRotation\");",
        "                l = thisComp.numLayers + 1; // остановить внешний цикл",
        "                break; // остановить внутренний",
        "            }",
        "\t\t\tif (fx.enabled && fx(\"Point C\").index == thisLayer.index && fx(\"Point A\") != null && fx(\"Point B\") != null){",
        "                results = thisComp.layer(l).effect(i)(\"cRotation\");",
        "                l = thisComp.numLayers + 1; // остановить внешний цикл",
        "                break; // остановить внутренний",
        "            }",
        "        }catch(e){}",
        "    }",
        "}",
        "",
        "for (var i = 1; i <= thisLayer(\"Effects\").numProperties; i++) {",
        "  try {",
        "\tfx = thisLayer(\"Effects\")(i);",
        "\tfx.enabled ? results += linear(fx(\"ADD ROTATION\"), 0 , 100, 0, fx(\"addRotation\")) : 0;",
        "  } catch (e) {}",
        "}",
        "results"
    ].join("\n");

    var EXPR_SCALE = [
        "// author: Petrusha Petrovich <syslef@gmail.com>",
        "// Scale",
        "results = 1;",
        "for (var l = 1; l <= thisComp.numLayers; l++){",
        "    var L = thisComp.layer(l);",
        "    for (var i = 1; i <= L(\"Effects\").numProperties; i++){",
        "        try{",
        "            var fx = L(\"Effects\")(i);",
        "            if (fx.enabled && fx(\"Point A\").index == thisLayer.index && fx(\"Point B\") != null && fx(\"Point C\") != null){",
        "                results = thisComp.layer(l).effect(i)(\"aScale\");",
        "                l = thisComp.numLayers + 1; // остановить внешний цикл",
        "                break; // остановить внутренний",
        "            }",
        "\t\t\tif (fx.enabled && fx(\"Point B\").index == thisLayer.index && fx(\"Point A\") != null && fx(\"Point C\") != null){",
        "                results = thisComp.layer(l).effect(i)(\"bScale\");",
        "                l = thisComp.numLayers + 1; // остановить внешний цикл",
        "                break; // остановить внутренний",
        "            }",
        "        }catch(e){}",
        "    }",
        "}",
        "",
        "for (var i = 1; i <= thisLayer(\"Effects\").numProperties; i++) {",
        "  try {",
        "\tfx = thisLayer(\"Effects\")(i);",
        "\tfx.enabled ? results = linear(fx(\"APPLY\"), 0 , 100, results, fx(\"set_Scale\")) : results;",
        "  } catch (e) {}",
        "}",
        "[value[0]*results, value[1]]"
    ].join("\n");

    // 1. Composition must be active
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Please open / activate a composition first.");
        return;
    }

    app.beginUndoGroup("Boney Bones: Create bone");

    try {
        // 2. Deselect all layers so the new layer is created at the very top
        for (var s = 1; s <= comp.numLayers; s++) {
            comp.layer(s).selected = false;
        }

        // 3. Create an empty shape layer via the menu command (Edit > New > Shape Layer)
        app.executeCommand(3736);

        // 4. The new shape layer (it becomes selected)
        var shapeLayer = comp.selectedLayers[0];
        if (!shapeLayer) {
            alert("Could not find the newly created shape layer.");
            return;
        }

        // 4a. Preset path: same folder as this script
        var scriptFile = new File($.fileName);
        var presetFile = new File(scriptFile.parent.fsName + "/" + PRESET_NAME);

        if (!presetFile.exists) {
            alert("Preset file not found:\n" + presetFile.fsName +
                  "\n\nMake sure \"" + PRESET_NAME + "\" is in the same folder as this script.");
            return;
        }

        // 5. Apply the animation preset to the selected layer
        shapeLayer.applyPreset(presetFile);

        // 6. Set anchor point to [0,0,0] and move the layer to the composition center
        var cx = comp.width  / 2;
        var cy = comp.height / 2;

        var transform = shapeLayer.property("ADBE Transform Group");
        transform.property("ADBE Anchor Point").setValue([0, 0, 0]);
        transform.property("ADBE Position").setValue([cx, cy]);

        // 6a. Follow expressions (as in add_properties.jsx) / выражения следования
        transform.property("ADBE Position").expression = EXPR_POSITION;
        transform.property("ADBE Rotate Z").expression = EXPR_ROTATION;
        transform.property("ADBE Scale").expression    = EXPR_SCALE;

        shapeLayer.comment = LAYER_COMMENT;

        // 7. Rename the layer (append number if "Bone" already exists)
        var baseName = "Bone";
        var newName = baseName;
        var counter = 2;
        var nameExists = function (n) {
            for (var i = 1; i <= comp.numLayers; i++) {
                if (comp.layer(i) !== shapeLayer && comp.layer(i).name === n) return true;
            }
            return false;
        };
        while (nameExists(newName)) {
            newName = baseName + " " + counter;
            counter++;
        }
        shapeLayer.name = newName;

        // 8. Set as Guide layer
        shapeLayer.guideLayer = true;

    } catch (e) {
        alert("Error: " + e.toString());
    } finally {
        app.endUndoGroup();
    }
})();
