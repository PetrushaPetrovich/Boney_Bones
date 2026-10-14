/*
 * @author Petrusha Petrovich <syslef@gmail.com>
 */

// add_follow_position.jsx
// Applies add_follow_position.ffx to the selected layer
// and sets a follow-position expression on its Position property.
// Применяет add_follow_position.ffx к выбранному слою и ставит
// выражение следования на его Position.

(function () {
    var PRESET_NAME = "add_follow_position.ffx";

    var EXPRESSION = [
        "// author: Petrusha Petrovich <syslef@gmail.com>",
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

    app.beginUndoGroup("Add follow position");

    try {
        for (var n = 0; n < layers.length; n++) {
            var layer = layers[n];
            layer.applyPreset(presetFile);

            var position = layer.property("ADBE Transform Group")
                                .property("ADBE Position");
            position.expression = EXPRESSION;
        }
    } catch (e) {
        alert("Error: " + e.toString());
    } finally {
        app.endUndoGroup();
    }
})();
