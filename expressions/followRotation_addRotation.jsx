// author: Petrusha Petrovich <syslef@gmail.com>
// Follow_Rotation effect, property "addRotation": rotation that follows the Target layer, scaled by
// ADD ROTATION (%). Method 1 = aim at the Target's anchor; Method 2 = copy the Target's world rotation.
// Эффект Follow_Rotation, свойство "addRotation": поворот вслед за слоем Target с весом ADD ROTATION (%).
// Method 1 = направление на якорь Target; Method 2 = копия мирового поворота Target.
var effectIndex = thisProperty.propertyGroup(1).propertyIndex;
var target = effect(effectIndex)("Target");
var method = effect(effectIndex)("Method");
var addRot = effect(effectIndex)("ADD ROTATION");
var mult = addRot / 100;

if (addRot != 0) {
    if (method == 1) {
        try {
            var p2 = target.toWorld(target.anchorPoint);
            var localTarget = fromWorld(p2);
            var delta = localTarget - anchorPoint;
            radiansToDegrees(Math.atan2(delta[1], delta[0])) * mult + transform.rotation;
        } catch(e) {
            transform.rotation;
        }
    } else if (method == 2) {
        try {
            var wRot = radiansToDegrees(
                Math.atan2(
                    target.toWorldVec([1,0,0])[1],
                    target.toWorldVec([1,0,0])[0]
                )
            );
            if (thisLayer.hasParent) {
                wRot * mult - thisLayer.parent.rotation;
            } else {
                wRot * mult;
            }
        } catch(e) {
            transform.rotation;
        }
    } else {
        transform.rotation;
    }
} else { 0 }
