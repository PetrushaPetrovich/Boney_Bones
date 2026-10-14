/*
 * @author Petrusha Petrovich <syslef@gmail.com>
 */

// add_properties.jsx
// Sets follow expressions on Position, Rotation and Scale of the selected layer.
// Ставит follow-экспрешены на Position, Rotation и Scale выбранного слоя.

(function () {
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
    var presetFile = new File(scriptFile.parent.fsName + "/add_properties-fixRotation.ffx");
    var presetMissingWarned = false;

    app.beginUndoGroup("Add properties");

    try {
        for (var n = 0; n < layers.length; n++) {
            var layer = layers[n];

            if (layer instanceof AVLayer && !(layer instanceof ShapeLayer)) {
                if (presetFile.exists) {
                    layer.applyPreset(presetFile);
                } else if (!presetMissingWarned) {
                    alert("Пресет не найден:\n" + presetFile.fsName);
                    presetMissingWarned = true;
                }
            }

            var transform = layer.property("ADBE Transform Group");
            transform.property("ADBE Position").expression  = EXPR_POSITION;
            transform.property("ADBE Rotate Z").expression  = EXPR_ROTATION;
            transform.property("ADBE Scale").expression     = EXPR_SCALE;
        }
    } catch (e) {
        alert("Error: " + e.toString());
    } finally {
        app.endUndoGroup();
    }
})();
