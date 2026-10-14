/*
 * @author Petrusha Petrovich <syslef@gmail.com>
 */

// add_follow_rotation.jsx
// Applies add_follow_rotation.ffx to selected layers and sets a follow-rotation expression on Rotation.
// Применяет add_follow_rotation.ffx к выделенным слоям и ставит выражение follow-rotation на Rotation.

(function () {
    var PRESET_NAME = "add_follow_rotation.ffx";

    var EXPRESSION = [
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

    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Please open / activate a composition first.");
        return;
    }

    var layers = comp.selectedLayers;
    if (!layers.length) {
        alert("Please select a layer first.");
        return;
    }

    var scriptFile = new File($.fileName);
    var presetFile = new File(scriptFile.parent.fsName + "/" + PRESET_NAME);

    if (!presetFile.exists) {
        alert("Preset file not found:\n" + presetFile.fsName +
              "\n\nMake sure \"" + PRESET_NAME + "\" is in the same folder as this script.");
        return;
    }

    app.beginUndoGroup("Add follow rotation");

    try {
        for (var n = 0; n < layers.length; n++) {
            var layer = layers[n];
            layer.applyPreset(presetFile);

            var rotation = layer.property("ADBE Transform Group")
                                .property("ADBE Rotate Z");
            rotation.expression = EXPRESSION;
        }
    } catch (e) {
        alert("Error: " + e.toString());
    } finally {
        app.endUndoGroup();
    }
})();
