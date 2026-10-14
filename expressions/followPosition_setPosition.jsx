// author: Petrusha Petrovich <syslef@gmail.com>
// Follow Position effect, property "setPosition": the Target layer's anchor in this layer's parent space
// while SET POSITION > 0, otherwise the layer's own position.
// Эффект Follow Position, свойство "setPosition": якорь слоя Target в локали родителя этого слоя,
// пока SET POSITION > 0, иначе собственная позиция слоя.
var effectIndex = thisProperty.propertyGroup(1).propertyIndex;
var target = effect(effectIndex)("Target");
if (effect(effectIndex)("SET POSITION") > 0 ) {
	try {
		var wp = target.toWorld(target.anchorPoint);
		if (hasParent){
			parent.fromWorld(wp);
		}else{
			wp;
		}
	} catch (e) {transform.position; }
} else { transform.position; }
