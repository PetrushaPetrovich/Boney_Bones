// author: Petrusha Petrovich <syslef@gmail.com>
// Position (bone layer): keyframes, then every enabled SET POSITION effect, then bPosition / cPosition
// of the limb effect that names this layer as Point B / Point C.
// Position (слой кости): ключи, затем все включённые SET POSITION, затем bPosition / cPosition
// того эффекта конечности, где этот слой указан как Point B / Point C.
results = value;

for (var i = 1; i <= thisLayer("Effects").numProperties; i++) {
  try {
	fx = thisLayer("Effects")(i);
	fx.enabled ? results = linear(fx("SET POSITION"), 0 , 100, results, fx("setPosition")) : results;
  } catch (e) {}
}

for (var l = 1; l <= thisComp.numLayers; l++){
    var L = thisComp.layer(l);
    for (var i = 1; i <= L("Effects").numProperties; i++){
        try{
            var fx = L("Effects")(i);
			if (fx.enabled && fx("Point B").index == thisLayer.index && fx("Point A") != null && fx("Point C") != null){
                results = thisComp.layer(l).effect(i)("bPosition");
                l = thisComp.numLayers + 1; // stop the outer loop / остановить внешний цикл
                break; // stop the inner loop / остановить внутренний
            }
			if (fx.enabled && fx("Point C").index == thisLayer.index && fx("Point A") != null && fx("Point B") != null){
                results = thisComp.layer(l).effect(i)("cPosition");
                l = thisComp.numLayers + 1; // stop the outer loop / остановить внешний цикл
                break; // stop the inner loop / остановить внутренний
            }
        }catch(e){}
    }
}
results
