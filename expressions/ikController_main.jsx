// author: Petrusha Petrovich <syslef@gmail.com>
// IK_Controller effect, slider properties: one expression for all limb sliders (bPosition, aRotation,
// bRotation, aScale, bScale, cPosition, cRotation); branch by thisProperty.name. Only cPosition reads the raw hand target,
// every other branch derives from final layer positions, so layer order never affects the result.
// Эффект IK_Controller, свойства-слайдеры: один экспрешн на все слайдеры конечности (bPosition, aRotation,
// bRotation, aScale, bScale, cPosition, cRotation); ветка — по thisProperty.name. Сырую цель кисти читает только cPosition,
// остальные ветки выводятся из финальных позиций слоёв, поэтому порядок слоёв на результат не влияет.
// Ver: 7.1

var effectIndex = thisProperty.propertyGroup(1).propertyIndex;
var fxLimb = effect(effectIndex);

// Name of the property holding the expression (slider name) / Имя свойства с экспрешном
var propName = "";
try { propName = thisProperty.name; } catch (e) { propName = ""; }

// Slider by name; missing one -> default value instead of breaking all seven properties.
// Слайдер по имени; нет слайдера — значение по умолчанию, а не падение всех семи свойств.
function slider(name, dflt) { try { return fxLimb(name); } catch (e) { return dflt; } }

var LA = fxLimb("Point A"); // arm
var LB = fxLimb("Point B"); // forearm
var LC = fxLimb("Point C"); // hand or controller
var flip        = effect(effectIndex)("Flip", 100);
var follow      = effect(effectIndex)("Follow", 100);
var autoStretch = effect(effectIndex)("Auto Stretch", false);
var stretchAB   = effect(effectIndex)("Stretch AB", 100);
var stretchBC   = effect(effectIndex)("Stretch BC", 100);
var ikfk        = effect(effectIndex)("IK / FK", 0);
var fkAngleA    = effect(effectIndex)("FK Angle A", 0);  // degrees
var fkAngleB    = effect(effectIndex)("FK Angle B", 0);  // degrees
var fkAngleC    = effect(effectIndex)("FK Angle C", 0);  // degrees
var setLength   = effect(effectIndex)("Set Length", false);
var lengthAB    = effect(effectIndex)("Length AB", 0);
var lengthBC    = effect(effectIndex)("Length BC", 0);

try {
    var t0 = thisComp.displayStartTime;
    var t  = time;
    var eps = 1e-4;

    // ---------------- Helpers (cheap, shared by all branches) / Хелперы ----------------
    function shortAngle(from, to) {
        var d = (to - from) % 360;
        if (d > 180)  d -= 360;
        if (d < -180) d += 360;
        return from + d;
    }

    // Layer world position WITHOUT its own rotation/scale (see dependency rule) / без своих rotation/scale
    function worldPos(L, atTime) {
        var p = L.transform.position.valueAtTime(atTime);
        return L.hasParent ? L.parent.toComp(p, atTime) : p;
    }

    // Sign of the determinant of the layer's parent-chain linear transform / знак детерминанта цепочки родителей
    function orientDet(layer, atTime) {
        if (!layer.hasParent) return 1;
        var o  = layer.parent.toComp([0, 0], atTime);
        var ex = layer.parent.toComp([1, 0], atTime);
        var ey = layer.parent.toComp([0, 1], atTime);
        return (ex[0]-o[0])*(ey[1]-o[1]) - (ex[1]-o[1])*(ey[0]-o[0]);
    }

    // Shared limb geometry in LB.parent local (IK frame: bones are rigid, parent scale/rotation don't
    // distort the triangle). Assumes LA, LB, LC share one parent. Computed only in branches that need it.
    // Общая геометрия в локали LB.parent (кости жёсткие); LA, LB, LC — на одном родителе.
    function limbFrame() {
        var F = {};
        F.ref = LB.hasParent ? LB.parent : null;
        F.toRef   = function (pw, atTime) { return F.ref ? F.ref.fromComp(pw, atTime) : pw; };
        F.fromRef = function (pl, atTime) { return F.ref ? F.ref.toComp(pl, atTime) : pl; };

        F.A0w = worldPos(LA, t0);
        F.B0w = worldPos(LB, t0);
        F.C0w = worldPos(LC, t0);
        F.Aw  = worldPos(LA, t);
        F.Cw  = worldPos(LC, t);   // cPosition: raw target; other branches: final hand position / сырая цель или финальная кисть

        F.A0 = F.toRef(F.A0w, t0);
        F.B0 = F.toRef(F.B0w, t0);
        F.C0 = F.toRef(F.C0w, t0);
        F.A  = F.toRef(F.Aw, t);
        F.C  = F.toRef(F.Cw, t);

        // Bone lengths in local space are constant / Длины костей в локали постоянны
        F.AB0 = (setLength == true) ? Math.max(lengthAB, 0) : length(F.A0, F.B0);
        F.BC0 = (setLength == true) ? Math.max(lengthBC, 0) : length(F.B0, F.C0);
        F.AB  = F.AB0 * Math.max(stretchAB, 0) / 100.0;
        F.BC  = F.BC0 * Math.max(stretchBC, 0) / 100.0;

        F.fkBlend = (t > t0 || setLength == true) ? clamp(ikfk, 0, 100) / 100.0 : 0.0;
        return F;
    }

    // IK/FK solver on frame F (LB.parent local). Same for cPosition and the bPosition group —
    // that's why the bPosition elbow sits exactly at the forearm end leading to C.
    // Солвер IK/FK — общий для cPosition и bPosition, поэтому локоть точно на конце предплечья.
    function makeSolver(F) {
        var S = {};
        var f = clamp(flip, -100, 100) / 100.0;

        // baseSign — elbow side in rest pose (constant) / сторона локтя в рест-позе
        var u0 = normalize(F.C0 - F.A0);
        var v0 = [-u0[1], u0[0]];
        var baseSign = (dot(F.B0 - F.A0, v0) >= 0) ? 1 : -1;

        // IK elbow height factor: sign = side, |m| < 1 = elbow flattened by Flip slider / множитель высоты локтя
        S.mIK = baseSign * f;

        // FK pose: fkAngleA / fkAngleA+fkAngleB are LA / LB rotation in parent local / FK-поза по слайдерам
        var aRadFK  = degreesToRadians(fkAngleA);
        var abRadFK = degreesToRadians(fkAngleA + fkAngleB);
        S.B_fk = F.A + [Math.cos(aRadFK),  Math.sin(aRadFK)]  * F.AB;
        S.C_fk = S.B_fk + [Math.cos(abRadFK), Math.sin(abRadFK)] * F.BC;

        // FK elbow side (same perp = [-dir.y, dir.x] convention as baseSign / solveB) / сторона локтя FK
        var v = S.C_fk - F.A;
        var Lv = length(v);
        var side = S.mIK;
        if (Lv >= eps) {
            var perp0 = [-v[1] / Lv, v[0] / Lv];
            var s = dot(S.B_fk - F.A, perp0);
            if (Math.abs(s) >= 1e-3) side = s;
        }
        S.sFK = (side >= 0) ? 1 : -1;

        // Elbow height factor at current blend. With different sides m crosses 0 — then cPosition puts
        // the hand at full reach AB+BC and the arm passes through straight.
        // При разных сторонах m проходит через 0 — рука проходит через прямую без скачка.
        S.mBlend = linear(F.fkBlend, S.mIK, S.sFK);

        // Bone lengths from FINAL A→C distance: autoStretch stretches both evenly / autoStretch — равномерно
        S.lengthsFor = function (d) {
            var reach = F.AB + F.BC;
            var k = (autoStretch == true && reach > eps && d > reach) ? d / reach : 1;
            return [F.AB * k, F.BC * k];
        };

        // Law of cosines: elbow from A, final C and factor m. null — C on A (degenerate) / теорема косинусов
        S.solveB = function (A_, C_, m) {
            var ACv = C_ - A_;
            var d = length(ACv);
            var Ls = S.lengthsFor(d);
            var ab = Ls[0], bc = Ls[1];
            if (ab <= eps) return A_;
            if (bc <= eps) return C_;
            if (d < eps) return null;
            var CA = Math.max(Math.min(d, ab + bc - eps), Math.abs(ab - bc) + eps);
            var x  = (ab*ab - bc*bc + CA*CA) / (2*CA);
            var h  = Math.sqrt(Math.max(ab*ab - x*x, 0));
            var dir  = ACv / d;
            var P    = A_ + dir * x;
            var perp = [-dir[1], dir[0]];
            return P + perp * (h * m);
        };
        return S;
    }

    var result;

    // ── aRotation — fast path: A aims at the ACTUAL LB position (bPosition output); no solver ──
    //    A смотрит на фактическую позицию LB, без солвера
    if (propName == "aRotation") {
        var Aw_a = worldPos(LA, t);
        var Bw_a = worldPos(LB, t);
        var Apl_a = LA.hasParent ? LA.parent.fromComp(Aw_a) : Aw_a;
        var Bpl_a = LA.hasParent ? LA.parent.fromComp(Bw_a) : Bw_a;
        var v_a = Bpl_a - Apl_a;
        result = radiansToDegrees(Math.atan2(v_a[1], v_a[0]));

    // ── cRotation — local offset for C rotation. No IK recompute: forearm direction comes from
    //    ACTUAL LB and LC positions, already consistent.
    //    IK:         (follow/100) * (B->C delta from t0 in inherited frame)
    //    FK:         (B->C delta from t0 by sliders, in LC.parent local) + fkAngleC
    //    Controller: LC.transform.rotation — added independently on top of IK/FK.
    //    Добавка к rotation C; направление предплечья — из фактических позиций LB и LC.
    } else if (propName == "cRotation") {
        // World point -> LC parent local (rotation AND scale of the chain, incl. negative scale)
        function pToLCParent(pWorld, atTime) {
            if (!LC.hasParent) return pWorld;
            return LC.parent.fromComp(pWorld, atTime);
        }
        // World point -> frame LC.parent inherits from ancestors (WITHOUT LC.parent's own rotation),
        // so that rotation reaches world via AE composition instead of being eaten by the delta
        // (else the layer won't follow its parent at follow=100). / Иначе слой не крутится за родителем.
        function pToInherited(pWorld, atTime) {
            if (!LC.hasParent || !LC.parent.hasParent) return pWorld;
            return LC.parent.parent.fromComp(pWorld, atTime);
        }

        var B0c = worldPos(LB, t0);
        var C0c = worldPos(LC, t0);
        var fkBlendC = (t > t0 || setLength == true) ? clamp(ikfk, 0, 100) / 100.0 : 0.0;

        // Reference B->C angle at t0 in LC.parent local, for the FK delta / эталонный угол для FK-дельты
        var v0_fk = pToLCParent(C0c, t0) - pToLCParent(B0c, t0);
        var ang0_fk = radiansToDegrees(Math.atan2(v0_fk[1], v0_fk[0]));

        function calcIKAngle() {
            // Chirality fix: delta is measured in the inherited frame (det = detInh) but AE applies it in
            // LC.parent world chain (det = detLCp); different reflection parity mirrors atan2's sign.
            // Фикс хиральности: при разной чётности отражений знак atan2 зеркалится.
            var detLCp = orientDet(LC, t);
            var detInh = LC.hasParent ? orientDet(LC.parent, t) : 1;
            var ikChirality = (detInh * detLCp > 0) ? 1 : -1;

            var v0_ik = pToInherited(C0c, t0) - pToInherited(B0c, t0);
            var ang0_ik = radiansToDegrees(Math.atan2(v0_ik[1], v0_ik[0]));

            var Bw = worldPos(LB, t);
            var Cw = worldPos(LC, t);
            var v_pl = pToInherited(Cw, t) - pToInherited(Bw, t);
            if (length(v_pl) < eps) return 0;
            var ang = radiansToDegrees(Math.atan2(v_pl[1], v_pl[0]));
            return (ang - ang0_ik) * ikChirality;
        }

        var angle;
        if (fkBlendC > 0) {
            // FK: B->C angle in LC.parent local = fkAngleA + fkAngleB (shared parent of LA/LB/LC)
            var angle_fk = (fkAngleA + fkAngleB - ang0_fk) + fkAngleC;
            if (fkBlendC < 1.0) {
                var angle_ik = calcIKAngle();
                var angle_ik_followed = linear(follow, 0, 100, 0, angle_ik);
                angle = linear(fkBlendC, angle_ik_followed, shortAngle(angle_ik_followed, angle_fk));
            } else {
                angle = angle_fk;
            }
        } else {
            angle = linear(follow, 0, 100, 0, calcIKAngle());
        }

        // Controller: LC.rotation keys are added regardless of follow and IK/FK. Under a mirrored parent
        // AE flips local rotation visually — multiply by determinant sign so clockwise stays clockwise.
        // Под зеркальным родителем домножаем на знак детерминанта: «по часовой» остаётся «по часовой».
        var ctrlChirality = (orientDet(LC, t) < 0) ? -1 : 1;
        result = angle + LC.transform.rotation * ctrlChirality;

    // ── cPosition — the only solver: raw target → IK target → IK↔FK blend by (direction, distance)
    //    A→C. Blend is defined so the elbow is uniquely recoverable from final C by one law of cosines
    //    (done by the bPosition branch). / Единственный солвер; локоть восстановим из финальной C.
    } else if (propName == "cPosition") {
        var F = limbFrame();     // F.C here = RAW target (animator keys) / СЫРАЯ цель, см. правило зависимостей
        var S = makeSolver(F);
        var A = F.A, A0 = F.A0, C0 = F.C0, AB = F.AB, BC = F.BC, u = F.fkBlend;

        // IK target: raw LC position + SET POSITION effects (world) + reach clamp / IK-цель + клампинг
        var C_ik = F.C;
        if (setLength == true || t > t0 || (length(A, A0) > 1e-3 && length(F.C, C0) > 1e-3)) {
            var Cw_eff = F.Cw;
            var fxGroup = LC("Effects");
            var nFx = fxGroup.numProperties;
            for (var i = 1; i <= nFx; i++) {
                var fxC = fxGroup(i);
                try { if (fxC.enabled) Cw_eff = linear(fxC("SET POSITION"), 0 , 100, Cw_eff, fxC("Target").toWorld(fxC("Target").anchorPoint)); } catch (e) {}
            }
            C_ik = F.toRef(Cw_eff, t);

            if (autoStretch != true) {
                var ACv = C_ik - A;
                var CA  = length(ACv);
                var maxReach = AB + BC;  // incl. stretch sliders / с учётом стретча
                if (CA > maxReach && CA > eps) C_ik = A + (ACv / CA) * maxReach;
            }
        }

        var C;
        if (u <= 1e-6) {
            C = C_ik;
        } else if (u >= 1 - 1e-6) {
            C = S.C_fk;
        } else {
            var dIK = length(C_ik, A);
            var dFK = length(S.C_fk, A);
            var phiFK = (dFK > eps) ? radiansToDegrees(Math.atan2(S.C_fk[1] - A[1], S.C_fk[0] - A[0]))
                                    : radiansToDegrees(Math.atan2(C0[1] - A0[1], C0[0] - A0[0]));
            var phiIK = (dIK > eps) ? radiansToDegrees(Math.atan2(C_ik[1] - A[1], C_ik[0] - A[0])) : phiFK;
            var phi = linear(u, phiIK, shortAngle(phiIK, phiFK));

            var d;
            if (S.mIK * S.sFK < 0) {
                // Elbow sides differ: m(u) = linear(u, mIK, sFK) hits 0 at uStar; put distance at full reach
                // AB+BC there — straight arm, side switches without a jump. / Рука прямая, смена стороны без скачка.
                var uStar = Math.abs(S.mIK) / (Math.abs(S.mIK) + 1);
                var reach = AB + BC;
                d = (u < uStar) ? linear(u, 0, uStar, dIK, reach) : linear(u, uStar, 1, reach, dFK);
            } else {
                d = linear(u, dIK, dFK);
            }
            var pr = degreesToRadians(phi);
            C = A + [Math.cos(pr), Math.sin(pr)] * d;
        }

        // LB.parent local → world → LC.parent local (LC position property) / Локаль LB.parent → world → LC.parent
        var CwOut = F.fromRef(C, t);
        result = LC.hasParent ? LC.parent.fromComp(CwOut, t) : CwOut;

    // ── bPosition (default), bRotation, aScale, bScale — elbow as IK solution for FINAL C ──
    //    Локоть как IK-решение для финальной C
    } else {
        var F = limbFrame();     // F.C here = FINAL hand position (cPosition output) / ФИНАЛЬНАЯ позиция кисти
        var S = makeSolver(F);
        var A = F.A, C = F.C, A0 = F.A0, B0 = F.B0, C0 = F.C0;

        var B;
        if (setLength == true || t > t0 || (length(A, A0) > 1e-3 && length(C, C0) > 1e-3)) {
            B = S.solveB(A, C, S.mBlend);
            if (B == null) {
                var tPrev = t - thisComp.frameDuration;
                B = F.toRef(worldPos(LB, tPrev), tPrev);
            }
        } else {
            B = B0;   // t0, rest pose — B0 is the actual LB position / B0 и есть фактическая позиция LB
        }

        if (propName == "bRotation") {
            // B and C in LB.parent local — forearm direction to the hand / направление предплечья
            var v_b = C - B;
            result = radiansToDegrees(Math.atan2(v_b[1], v_b[0]));
        } else if (propName == "aScale") {
            // Measure AB in LA.parent local — parent scale/rotation don't affect length / длина AB в локали LA.parent
            var Bw = F.fromRef(B, t);
            var A_la = LA.hasParent ? LA.parent.fromComp(F.Aw, t) : F.Aw;
            var B_la = LA.hasParent ? LA.parent.fromComp(Bw, t)   : Bw;
            result = (F.AB0 > 1e-6) ? length(A_la, B_la) / F.AB0 : 1;
        } else if (propName == "bScale") {
            result = (F.BC0 > 1e-6) ? length(B, C) / F.BC0 : 1;
        } else {
            // bPosition: B is already in LB.parent local, as LB position needs / B уже в нужной локали
            result = F.ref ? B : F.fromRef(B, t);
        }
    }

    result;

} catch (e) {
    (propName == "cRotation") ? 0 : value;
}
