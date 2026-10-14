// author: Petrusha Petrovich <syslef@gmail.com>
// Rotation (bone layer): aRotation / bRotation / cRotation of the limb effect that names this layer
// as Point A / B / C, then every enabled ADD ROTATION effect.
// Rotation (слой кости): aRotation / bRotation / cRotation того эффекта конечности, где этот слой
// указан как Point A / B / C, затем все включённые ADD ROTATION.
var results = value;
for (var l = 1; l <= thisComp.numLayers; l++){
    var L = thisComp.layer(l);
    for (var i = 1; i <= L("Effects").numProperties; i++){
        try{
            var fx = L("Effects")(i);
            if (fx.enabled && fx("Point A").index == thisLayer.index && fx("Point B") != null && fx("Point C") != null){
                results = thisComp.layer(l).effect(i)("aRotation");
                l = thisComp.numLayers + 1; // stop the outer loop / остановить внешний цикл
                break; // stop the inner loop / остановить внутренний
            }
			if (fx.enabled && fx("Point B").index == thisLayer.index && fx("Point A") != null && fx("Point C") != null){
                results = thisComp.layer(l).effect(i)("bRotation");
                l = thisComp.numLayers + 1; // stop the outer loop / остановить внешний цикл
                break; // stop the inner loop / остановить внутренний
            }
			if (fx.enabled && fx("Point C").index == thisLayer.index && fx("Point A") != null && fx("Point B") != null){
                results = thisComp.layer(l).effect(i)("cRotation");
                l = thisComp.numLayers + 1; // stop the outer loop / остановить внешний цикл
                break; // stop the inner loop / остановить внутренний
            }
        }catch(e){}
    }
}

for (var i = 1; i <= thisLayer("Effects").numProperties; i++) {
  try {
	fx = thisLayer("Effects")(i);
	fx.enabled ? results += linear(fx("ADD ROTATION"), 0 , 100, 0, fx("addRotation")) : 0;
  } catch (e) {}
}
results
