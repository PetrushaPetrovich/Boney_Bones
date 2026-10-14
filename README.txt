Boney_Bones — a toolset for fast and convenient character rigging in After Effects.
Author: Petrusha Petrovich
E-mail: syslef@gmail.com
Version: 1.9

=============================================================================
WHAT IT IS
=============================================================================
A launcher panel (Boney_Bones_1.9.jsx) with buttons that run the scripts and
presets from the boney_files folder. Buttons are grouped by rigging stage:
creating bones, behaviour modifiers, linking layers and frame-by-frame tools.
The panel wraps buttons onto several rows and collapses into a compact mode
(emoji-only buttons) when space is short; full names show in hover tooltips.

TOOLS:

  --- Bones ---
  🦴 create Bone      — create a bone: an empty shape layer at the comp center
                        with the create_bone.ffx preset and rig expressions.
  💪 create Limb      — copy the boney_limb rig (shoulder/elbow/hand chain)
                        from boney_template.aep into the active comp.
  ☠️ create Skeleton  — copy the boney_skeleton rig from boney_template.aep,
                        restoring parents; "C | NULL" is centered in the comp.
  🤡 create AI Dummy  — copy the boney_dummy test character for rig testing.

  --- Modifiers ---
  ✅ activate properties — put the rig expressions on Position / Rotation /
                           Scale of the selected layers (plus the preset), so a
                           layer follows the limb effect where it is Point A/B/C.
  +  follow_position     — add follow-position (preset + expression on Position).
  +  follow_rotation     — add follow-rotation (preset + expression on Rotation).
  +  IK Controller       — add an IK controller (preset + expressions on
                           Position / Rotation / Scale).

  --- Connecters ---
  🔗 set Parents — for each selected layer, set as parent the nearest layer
                   whose comment contains "Structure" or "Bone" (within 50 px).
  📌 set Puppets — select ONE layer with Puppet pins and the pins themselves:
                   each selected pin is bound (position, scale, rotation) to the
                   nearest layer whose comment contains "Structure", "Bone" or
                   "Pin" (within 100 px).
  🪝 pin To      — select ONE layer with Puppet pins and the pins: creates a
                   "Pinned to" Layer Control effect and binds the pin positions
                   to the layer chosen in it.

  --- Frame-by-frame ---
  🖼️ Add PSD frame — render the current frame to PSD into the Frames folder
                     (inside "(Footage)" if it exists next to the project),
                     import it above the top selected layer as a 1-frame layer
                     and open it in Photoshop with a clean layer added.
                     The project must be saved first.
  📂 Open layer    — open the source files of the selected layers in their
                     default apps (PSD opens in Photoshop).
  🧅 Add Onion Skin — add an adjustment guide shape layer "Onion Skin" on top of
                     the comp with CC Wide Time and CC Composite; no preset needed.

=============================================================================
CONTENTS
=============================================================================
  Boney_Bones_1.9.jsx    — launcher panel (an item in the Window menu)
  boney_files\           — scripts, presets (.ffx) and the boney_template.aep template

=============================================================================
INSTALLATION
=============================================================================
Put Boney_Bones_1.9.jsx and the boney_files folder into the ScriptUI Panels folder:
  Windows: C:\Program Files\Adobe\Adobe After Effects <ver>\Support Files\Scripts\ScriptUI Panels\
  macOS:   /Applications/Adobe After Effects <ver>/Scripts/ScriptUI Panels/
Open: Window menu > Boney_Bones_1.9.jsx
(keep the panel and the boney_files folder side by side — button paths are relative).

=============================================================================
USAGE (general order)
=============================================================================
  1. Open the composition with the character.
  2. Bones — create bones / limbs / a skeleton (or a dummy for testing).
  3. Modifiers — select a layer and add the properties and controllers you need
     (activate properties, follow_position / rotation, IK Controller).
  4. Connecters — link the layers: parents, Puppet pins, pin To.
  5. Frame-by-frame — add PSD frames, open them in Photoshop, add Onion Skin.
Each action is wrapped in its own Undo group — undo with the usual Ctrl+Z.

=============================================================================
REQUIREMENTS
=============================================================================
  • After Effects 24.x or newer (the rig is built on expressions, Puppet pins and parenting).
  • The boney_files folder next to the panel (.jsx, .ffx and boney_template.aep).
  • Photoshop for the frame-by-frame tools.


#############################################################################
#############################################################################


Boney_Bones — набор инструментов для быстрого и удобного рига персонажей в After Effects.
Автор: Petrusha Petrovich
Почта: syslef@gmail.com
Версия: 1.9

=============================================================================
ЧТО ЭТО
=============================================================================
Панель-лаунчер (Boney_Bones_1.9.jsx) с кнопками, которые запускают скрипты и
пресеты из папки boney_files. Кнопки сгруппированы по этапам рига: создание
костей, модификаторы поведения, связывание слоёв и покадровая анимация.
Панель переносит кнопки на несколько строк и сворачивается в компактный режим
(кнопки-смайлики) при нехватке места; полные названия видны в подсказках при
наведении.

ИНСТРУМЕНТЫ:

  --- Bones (создание костей) ---
  🦴 create Bone      — создать кость: пустой шейп-слой в центре композиции
                        с пресетом create_bone.ffx и экспрешенами рига.
  💪 create Limb      — скопировать риг конечности boney_limb (цепочка
                        плечо/локоть/кисть) из boney_template.aep в активную композицию.
  ☠️ create Skeleton  — скопировать скелет boney_skeleton из boney_template.aep
                        с восстановлением родителей; "C | NULL" центрируется в композиции.
  🤡 create AI Dummy  — скопировать болвана boney_dummy (тестовый персонаж для проверки рига).

  --- Modifiers (модификаторы) ---
  ✅ activate properties — поставить экспрешены рига на Position / Rotation /
                           Scale выделенных слоёв (плюс пресет): слой следует
                           за эффектом конечности, где он указан как Point A/B/C.
  +  follow_position     — добавить следование за позицией (пресет + экспрешен на Position).
  +  follow_rotation     — добавить следование за вращением (пресет + экспрешен на Rotation).
  +  IK Controller       — добавить IK-контроллер (пресет + экспрешены на
                           Position / Rotation / Scale).

  --- Connecters (связывание) ---
  🔗 set Parents — каждому выделенному слою назначить родителем ближайший слой,
                   в комментарии которого есть "Structure" или "Bone" (в радиусе 50 px).
  📌 set Puppets — выделите ОДИН слой с Puppet-пинами и сами пины: каждый
                   выделенный пин привязывается (позиция, масштаб, вращение)
                   к ближайшему слою с "Structure", "Bone" или "Pin" в комментарии
                   (в радиусе 100 px).
  🪝 pin To      — выделите ОДИН слой с Puppet-пинами и пины: создаётся эффект
                   Layer Control "Pinned to", и позиции пинов привязываются
                   к выбранному в нём слою.

  --- Frame-by-frame (покадровая анимация) ---
  🖼️ Add PSD frame — отрендерить текущий кадр в PSD в папку Frames (внутри
                     "(Footage)", если она лежит рядом с проектом), импортировать
                     его над верхним выделенным слоем длиной в один кадр и открыть
                     в Photoshop с добавленным чистым слоем. Проект должен быть сохранён.
  📂 Open layer    — открыть исходники выделенных слоёв в приложениях
                     по умолчанию (PSD откроется в Photoshop).
  🧅 Add Onion Skin — добавить наверх композиции корректирующий направляющий
                     шейп-слой "Onion Skin" с CC Wide Time и CC Composite;
                     пресет не нужен.

=============================================================================
СОСТАВ
=============================================================================
  Boney_Bones_1.9.jsx    — панель-лаунчер (пункт в меню Window)
  boney_files\           — скрипты, пресеты (.ffx) и шаблон boney_template.aep

=============================================================================
УСТАНОВКА
=============================================================================
Положите файл Boney_Bones_1.9.jsx и папку boney_files в папку ScriptUI Panels:
  Windows: C:\Program Files\Adobe\Adobe After Effects <ver>\Support Files\Scripts\ScriptUI Panels\
  macOS:   /Applications/Adobe After Effects <ver>/Scripts/ScriptUI Panels/
Откройте: меню Window > Boney_Bones_1.9.jsx
(панель и папку boney_files держите рядом — пути в кнопках относительные).

=============================================================================
ИСПОЛЬЗОВАНИЕ (общий порядок)
=============================================================================
  1. Откройте композицию с персонажем.
  2. Bones — создайте кости/конечности/скелет (или болвана для теста).
  3. Modifiers — выделите слой и навесьте нужные свойства и контроллеры
     (activate properties, follow_position/rotation, IK Controller).
  4. Connecters — свяжите слои: родительские связи, Puppet-пины, pin To.
  5. Frame-by-frame — добавляйте PSD-кадры, открывайте их в Photoshop, включайте Onion Skin.
Каждое действие оборачивается в свою Undo-группу — отменяется обычным Ctrl+Z.

=============================================================================
ТРЕБОВАНИЯ
=============================================================================
  • After Effects 24.x или новее (риг построен на выражениях, Puppet-пинах и родительских связях).
  • Папка boney_files рядом с панелью (содержит .jsx, .ffx и boney_template.aep).
  • Photoshop для инструментов покадровой анимации.
