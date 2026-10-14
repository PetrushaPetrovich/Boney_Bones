// author: Petrusha Petrovich <syslef@gmail.com>
// Scale (bone layer): aScale / bScale of the limb effect that names this layer as Point A / B
// (stretch factor), then every enabled APPLY / set_Scale effect; applied to the X scale only.
// Scale (слой кости): aScale / bScale того эффекта конечности, где этот слой указан как Point A / B
// (коэффициент стретча), затем все включённые APPLY / set_Scale; применяется только к масштабу по X.
results = 1;
for (var l = 1; l <= thisComp.numLayers; l++){
    var L = thisComp.layer(l);
    for (var i = 1; i <= L("Effects").numProperties; i++){
        try{
            var fx = L("Effects")(i);
            if (fx.enabled && fx("Point A").index == thisLayer.index && fx("Point B") != null && fx("Point C") != null){
                results = thisComp.layer(l).effect(i)("aScale");
                l = thisComp.numLayers + 1; // stop the outer loop / остановить внешний цикл
                break; // stop the inner loop / остановить внутренний
            }
			if (fx.enabled && fx("Point B").index == thisLayer.index && fx("Point A") != null && fx("Point C") != null){
                results = thisComp.layer(l).effect(i)("bScale");
                l = thisComp.numLayers + 1; // stop the outer loop / остановить внешний цикл
                break; // stop the inner loop / остановить внутренний
            }
        }catch(e){}
    }
}

for (var i = 1; i <= thisLayer("Effects").numProperties; i++) {
  try {
	fx = thisLayer("Effects")(i);
	fx.enabled ? results = linear(fx("APPLY"), 0 , 100, results, fx("set_Scale")) : results;
  } catch (e) {}
}
[value[0]*results, value[1]]
