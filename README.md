<p align="center">
  <img src="docs/images/logo.png" alt="Boney Bones logo" width="220">
</p>

<h1 align="center">Boney Bones</h1>

<p align="center">
  A character rigging script for After Effects: a full, editable rig in minutes.<br>
  Скрипт для рига персонажей в After Effects: полноценный редактируемый риг за минуты.
</p>

<p align="center">
  <i>Dedicated to Bonya, my beloved cat, who is no longer with us · <a href="https://www.instagram.com/boneymeme/">@boneymeme</a></i><br>
  <i>Посвящается Боне, моей любимой кошке, которой больше нет с нами · <a href="https://www.instagram.com/boneymeme/">@boneymeme</a></i>
</p>

<p align="center">
  <b>Version 1.9</b> · After Effects 24.x or newer · Author: Petrusha Petrovich · <a href="mailto:syslef@gmail.com">syslef@gmail.com</a>
</p>

<p align="center">
  <a href="https://github.com/PetrushaPetrovich/Boney_Bones/releases/latest/download/Boney_Bones_1.9.zip"><img src="https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20DOWNLOAD-Boney__Bones__1.9.zip-2ea44f?style=for-the-badge" alt="Download Boney_Bones_1.9.zip"></a>
</p>
<p align="center">
  ⬇️ <b><a href="https://github.com/PetrushaPetrovich/Boney_Bones/releases/latest/download/Boney_Bones_1.9.zip">Download Boney_Bones_1.9.zip</a></b> · <a href="https://github.com/PetrushaPetrovich/Boney_Bones/releases">all releases</a><br>
  ⬇️ <b><a href="https://github.com/PetrushaPetrovich/Boney_Bones/releases/latest/download/Boney_Bones_1.9.zip">Скачать Boney_Bones_1.9.zip</a></b> · <a href="https://github.com/PetrushaPetrovich/Boney_Bones/releases">все релизы</a>
</p>

---

[English](#english) · [Русский](#русский)

---

## English

### What it is

Boney Bones is a script for building convenient, editable character rigs in After Effects. It creates a full rig fast, and the rig stays editable while you animate: move a bone, change a parent or fix a limb length in the middle of a shot without rebuilding anything. A rigged character can be copied into another composition, resized or even flipped with one parent null.

The legendary Duik has a few shortcomings that pushed me to write my own tool: simpler setup, a lighter animation process and the ability to edit the rig during animation.

- Fast rig setup.
- The rig can be edited while animating.
- Automatic limb stretch: no extra effects or Puppet tool needed to stretch a limb.
- Simple elbow flip.
- The character can be copied into another composition.
- The character can be resized.
- Few helper layers.
- A layer's parent can be switched during animation.

And the frame-by-frame tools are a bomb: with PSD frames, Photoshop round-trips and an onion skin, After Effects becomes a full-featured animation package.

The launcher panel (`Boney_Bones_1.9.jsx`) is just the front door: buttons that run the scripts and presets from the `boney_files` folder, grouped by rigging stage. The panel wraps buttons onto several rows and collapses into a compact mode (emoji-only buttons) when space is short; full names show in hover tooltips.

<p align="center">
  <img src="docs/images/panel_full.png" alt="Boney Bones panel, full mode" height="420">
  &nbsp;&nbsp;&nbsp;
  <img src="docs/images/panel_compact.png" alt="Boney Bones panel, compact mode" height="110">
</p>

### ⬇️ Download and installation

1. ⬇️ **[Download Boney_Bones_1.9.zip](https://github.com/PetrushaPetrovich/Boney_Bones/releases/latest/download/Boney_Bones_1.9.zip)** (or pick it on the [Releases](https://github.com/PetrushaPetrovich/Boney_Bones/releases) page) and unpack it.
2. 📁 Put `Boney_Bones_1.9.jsx` and the `boney_files` folder into the ScriptUI Panels folder:

| OS | Path |
|---|---|
| Windows | `C:\Program Files\Adobe\Adobe After Effects <ver>\Support Files\Scripts\ScriptUI Panels\` |
| macOS | `/Applications/Adobe After Effects <ver>/Scripts/ScriptUI Panels/` |

3. ▶️ Open: **Window → Boney_Bones_1.9.jsx**. Keep the panel and the `boney_files` folder side by side: button paths are relative.

### Interface

#### Main panel

**Bones**: everything the rig structure needs.

| Button | What it does |
|---|---|
| 🦴 **create Bone** | Create a bone: an empty shape layer at the comp center with the `create_bone.ffx` preset and rig expressions. |
| 💪 **create Limb** | Three bones already set up as a limb (shoulder / elbow / hand), copied from `boney_template.aep`. |
| ☠️ **create Skeleton** | A whole skeleton, copied from `boney_template.aep` with parents restored; `C \| NULL` is centered in the comp. |
| 🤡 **create AI Dummy** | A dummy character for reference animations (see [The Dummy](#the-dummy-a-rising-ai-star-)). |

**Modifiers**: layer position and rotation modifiers.

| Button | What it does |
|---|---|
| ✅ **activate properties** | Puts the expressions the modifiers need on Position / Rotation / Scale of the selected layers (plus the preset), so a layer follows the limb effect where it is Point A / B / C. |
| ➕ **follow_position** | Follow a chosen layer (preset + expression on Position). |
| ➕ **follow_rotation** | Turn toward a target or copy its rotation (preset + expression on Rotation). |
| ➕ **IK Controller** | Limb settings (preset + expressions on Position / Rotation / Scale). |

**Connecters**: attaching the art to the skeleton.

| Button | What it does |
|---|---|
| 🔗 **set Parents** | Automatic parenting: each selected layer gets the nearest layer whose comment contains `Structure` or `Bone` (within 50 px) as its parent. |
| 📌 **set Puppets** | Binds Puppet pins to bones: select ONE layer with Puppet pins and the pins themselves; each selected pin is bound (position, scale, rotation) to the nearest layer whose comment contains `Structure`, `Bone` or `Pin` (within 100 px). |
| 🪝 **pin To** | Glues Puppet pins to a chosen layer: select ONE layer with Puppet pins and the pins; a `Pinned to` Layer Control effect is created and the pin positions follow the layer chosen in it. |

**Frame-by-frame**: tools for frame-by-frame animation.

| Button | What it does |
|---|---|
| 🖼️ **Add PSD frame** | Adds a PSD frame to the timeline and opens it in Photoshop: the current frame is rendered to PSD into the `Frames` folder (inside `(Footage)` if it exists next to the project), imported above the top selected layer as a 1-frame layer and opened in Photoshop with a clean layer added. The project must be saved first. |
| 📂 **Open layer** | Opens the source files of the selected layers in their default apps (PSD opens in Photoshop). |
| 🧅 **Add Onion Skin** | Adds an onion skin: an adjustment guide shape layer `Onion Skin` on top of the comp with CC Wide Time and CC Composite; no preset needed. |

#### IK Controller panel

Controls a limb: inverse kinematics, forward kinematics and the switch between them.

| Parameter | Meaning |
|---|---|
| **Point A** | Layer of the limb's upper point, e.g. the shoulder or the hip. |
| **Point B** | Layer of the elbow or the knee. |
| **Point C** | Layer of the hand or the foot. |
| **Follow** | Turns on / off the hand following the forearm. |
| **Flip** | Elbow flip. |
| **Auto Stretch** | Turns off automatic limb stretching. |
| **Stretch AB** | Manual stretch of the upper arm (thigh) length. |
| **Stretch BC** | Manual stretch of the forearm (shin) length. |
| **FK → IK / FK** | Switch from inverse to forward kinematics. |
| **FK → FK Angle A** | Rotation angle of the upper arm (thigh). |
| **FK → FK Angle B** | Rotation angle of the forearm (shin). |
| **FK → FK Angle C** | Rotation angle of the hand (foot). |
| **Length → Set Length** | Manual mode for the bone lengths of the limb. |
| **Length → Length AB** | Length of the upper arm (thigh) bone. |
| **Length → Length BC** | Length of the forearm (shin) bone. |

#### Follow Position panel

Sets the layer's position to the layer chosen in Target. Several of these effects can be used on one layer, which is handy when you need to switch between several parents.

| Parameter | Meaning |
|---|---|
| **Target** | The target layer. |
| **SET POSITION** | Turns the effect on. |

#### Follow Rotation panel

Rotation that follows the target layer. Several of these effects can be used on one layer.

| Parameter | Meaning |
|---|---|
| **Target** | The target layer. |
| **Method** | Switch between the two modes: **Turn toward the target** turns the layer toward the target layer; **Copy value** adds the target layer's rotation value. |
| **ADD ROTATION** | Turns the effect on. |

### How to use

1. To make a limb, build three bones with **🦴 create Bone** and apply **➕ IK Controller** to the lowest one. The alternative is the ready-made **💪 create Limb**: it is optimized, works faster and can be copied into another composition, because the Point A, Point B and Point C layers are already set in the bones. Or create the whole skeleton at once with **☠️ create Skeleton**.
2. Place the bones at the character's joints. Perfect precision is not needed: the rig can be edited while animating. **Important:** set the rig up on the first frame of the composition, because the bone lengths are computed from the first frame.
3. The bone design can be changed in the shape settings (Center, Ellipse, Square, Triangle, Star, Cross, Skull, Hand, Foot).
4. Put the anchor points of the art layers where the bones are. To attach the art to the bones automatically, select the character's layers and press **🔗 set Parents**: the script finds the nearest bones and makes them parents.
5. To bind Puppet Mesh vertices to bones use **📌 set Puppets**. When needed, for example when the character's joints are not round, use **🪝 pin To**: it binds a group of Puppet Mesh vertices to a specific parent. A separate `Pinned to` effect is created for each group; choose the parent layer in it.
6. If you used the ready-made skeleton, set the parents of the hand, shoulder and hip bones after the character's structure is set up. By default their parent is the `C | NULL` layer.

Each action is wrapped in its own Undo group, so it is undone with the usual Ctrl+Z.

### Main features

**Fast rig**

- Limb lengths are computed from the first frame, so a character is easy to fix if mistakes were made at the rigging stage.
- A fixed limb length can be set in **IK Controller → Length** if the first-frame method does not suit you.
- With the common parent layer (`C | NULL`) the character is easy to resize or even flip.
- Art attaches to bones automatically with **set Parents**, **set Puppets** and **pin To**.
- Bone design and color change like any ordinary shape.
- Few helper layers (bones), or none at all.
- The character can be copied into another composition.

**Convenient animation**

- Automatic limb stretch with no extra steps.
- Simple switch of the wrist direction: **IK Controller → Follow**.
- Smooth elbow flip with the **IK Controller → Flip** slider.
- Switching between several parents with the **Follow Position** and **Follow Rotation** effects.
- Forward kinematics: **IK Controller → FK**.
- Resize or flip the character or a single limb with its parent null.

### The Dummy: a rising AI star ⭐

The Dummy is a ready character blank that is easy to adjust to the proportions you need, quick to animate and ready to be fed as a reference to neural networks such as Seedance 2.0.

### Requirements

- After Effects 24.x or newer (the rig is built on expressions, Puppet pins and parenting).
- The `boney_files` folder next to the panel (`.jsx`, `.ffx` and `boney_template.aep`).
- Photoshop for the frame-by-frame tools.

### Repository layout

| Path | Contents |
|---|---|
| `Boney_Bones_1.9.jsx` | The launcher panel. |
| `boney_files/` | Scripts, presets (`.ffx`) and the `boney_template.aep` template. |
| `expressions/` | The rig expressions as plain text: `ikController_main.jsx` (IK / FK blend, Follow, Flip, stretch; one text for all `IK_Controller` sliders), `position.jsx` / `rotation.jsx` / `scale.jsx` (bone layer transform wiring), `followPosition_setPosition.jsx` and `followRotation_addRotation.jsx` (the Follow Position / Follow_Rotation effects). |
| `docs/images/` | Logo and screenshots for this page. |
| `sync_from_workdir.ps1` | Copies the published file set from the author's working folder into this repository. |
| `build_release_zip.ps1` | Builds the distribution archive `dist/Boney_Bones_<ver>.zip` (panel + `boney_files` + `README.txt`) for a GitHub Release. |

---

## Русский

### Что это

Boney Bones — скрипт для создания удобных и редактируемых ригов персонажей в After Effects. Он быстро собирает полноценный риг, и этот риг остаётся редактируемым в процессе анимации: подвинуть кость, сменить родителя или поправить длину конечности можно прямо посреди сцены, ничего не пересобирая. Готового персонажа можно скопировать в другую композицию, изменить его размер и даже флипнуть одним родительским нулём.

У легендарного Duik есть ряд недостатков, которые подтолкнули меня написать свой инструмент: проще подготовка, легче процесс анимации и есть возможность редактировать риг во время анимации.

- Быстрая подготовка рига.
- Возможность редактировать риг в процессе анимации.
- Автоматический стретч конечностей: для растягивания не нужны дополнительные эффекты или Puppet tool.
- Простой разворот локтя.
- Возможность копирования персонажа в другую композицию.
- Изменение размера персонажа.
- Малое количество слоёв.
- Смена родителя слоя в процессе анимации.

А покадровая анимация в AE — просто бомба: с PSD-кадрами, обменом с Photoshop и onion skin After Effects становится полноценным анимационным софтом.

Панель-лаунчер (`Boney_Bones_1.9.jsx`) — лишь вход: кнопки запускают скрипты и пресеты из папки `boney_files`, сгруппированные по этапам рига. Панель переносит кнопки на несколько строк и сворачивается в компактный режим (кнопки-смайлики) при нехватке места; полные названия видны в подсказках при наведении.

<p align="center">
  <img src="docs/images/panel_full.png" alt="Панель Boney Bones, полный режим" height="420">
  &nbsp;&nbsp;&nbsp;
  <img src="docs/images/panel_compact.png" alt="Панель Boney Bones, компактный режим" height="110">
</p>

### ⬇️ Скачивание и установка

1. ⬇️ **[Скачать Boney_Bones_1.9.zip](https://github.com/PetrushaPetrovich/Boney_Bones/releases/latest/download/Boney_Bones_1.9.zip)** (или выберите на странице [Releases](https://github.com/PetrushaPetrovich/Boney_Bones/releases)) и распакуйте.
2. 📁 Положите `Boney_Bones_1.9.jsx` и папку `boney_files` в папку ScriptUI Panels:

| ОС | Путь |
|---|---|
| Windows | `C:\Program Files\Adobe\Adobe After Effects <ver>\Support Files\Scripts\ScriptUI Panels\` |
| macOS | `/Applications/Adobe After Effects <ver>/Scripts/ScriptUI Panels/` |

3. ▶️ Откройте: **Window → Boney_Bones_1.9.jsx**. Панель и папку `boney_files` держите рядом: пути в кнопках относительные.

### Интерфейс

#### Основная панель

**Bones** — всё необходимое для структуры рига.

| Кнопка | Что делает |
|---|---|
| 🦴 **create Bone** | Создать кость: пустой шейп-слой в центре композиции с пресетом `create_bone.ffx` и экспрешенами рига. |
| 💪 **create Limb** | Три настроенные кости (плечо / локоть / кисть), скопированные из `boney_template.aep`. |
| ☠️ **create Skeleton** | Целый скелет из `boney_template.aep` с восстановлением родителей; `C \| NULL` центрируется в композиции. |
| 🤡 **create AI Dummy** | Болван для референсных анимаций (см. [Болван](#болван-dummy-восходящая-ai-звезда-)). |

**Modifiers** — модификаторы положения и вращения слоя.

| Кнопка | Что делает |
|---|---|
| ✅ **activate properties** | Ставит на Position / Rotation / Scale выделенных слоёв экспрешены, необходимые для работы модификаторов (плюс пресет): слой следует за эффектом конечности, где он указан как Point A / B / C. |
| ➕ **follow_position** | Следование за указанным слоем (пресет + экспрешен на Position). |
| ➕ **follow_rotation** | Вращение в сторону цели либо повторение её вращения (пресет + экспрешен на Rotation). |
| ➕ **IK Controller** | Настройки конечности (пресет + экспрешены на Position / Rotation / Scale). |

**Connecters** — подключение арта к скелету.

| Кнопка | Что делает |
|---|---|
| 🔗 **set Parents** | Автоматическое назначение родителей: каждому выделенному слою назначается ближайший слой, в комментарии которого есть `Structure` или `Bone` (в радиусе 50 px). |
| 📌 **set Puppets** | Подключение папетов к костям: выделите ОДИН слой с Puppet-пинами и сами пины; каждый выделенный пин привязывается (позиция, масштаб, вращение) к ближайшему слою с `Structure`, `Bone` или `Pin` в комментарии (в радиусе 100 px). |
| 🪝 **pin To** | Приклеивание папетов к выбранному слою: выделите ОДИН слой с Puppet-пинами и пины; создаётся эффект Layer Control `Pinned to`, и позиции пинов следуют за выбранным в нём слоем. |

**Frame-by-frame** — инструменты для покадровой анимации.

| Кнопка | Что делает |
|---|---|
| 🖼️ **Add PSD frame** | Добавляет PSD-кадр на таймлайн и открывает его в Photoshop: текущий кадр рендерится в PSD в папку `Frames` (внутри `(Footage)`, если она лежит рядом с проектом), импортируется над верхним выделенным слоем длиной в один кадр и открывается в Photoshop с добавленным чистым слоем. Проект должен быть сохранён. |
| 📂 **Open layer** | Открывает исходники выделенных слоёв в приложениях по умолчанию (PSD откроется в Photoshop). |
| 🧅 **Add Onion Skin** | Добавляет onion skin: корректирующий направляющий шейп-слой `Onion Skin` наверх композиции с CC Wide Time и CC Composite; пресет не нужен. |

#### Панель управления IK Controller

Управляет конечностью: инверсная кинематика, прямая кинематика и переключение между ними.

| Параметр | Значение |
|---|---|
| **Point A** | Слой верхней точки конечности, например плечо или бедро. |
| **Point B** | Слой локтя или колена. |
| **Point C** | Слой кисти или ступни. |
| **Follow** | Включение и отключение следования кисти за предплечьем. |
| **Flip** | Разворот локтя. |
| **Auto Stretch** | Отключение автоматического растягивания конечности. |
| **Stretch AB** | Ручное растягивание длины плеча (бедра). |
| **Stretch BC** | Ручное растягивание длины предплечья (голени). |
| **FK → IK / FK** | Переключение инверсной кинематики на прямую. |
| **FK → FK Angle A** | Угол поворота плеча (бедра). |
| **FK → FK Angle B** | Угол поворота предплечья (голени). |
| **FK → FK Angle C** | Угол поворота кисти (стопы). |
| **Length → Set Length** | Режим ручной установки длин костей конечности. |
| **Length → Length AB** | Длина плечевой кости (бедра). |
| **Length → Length BC** | Длина кости предплечья (голени). |

#### Панель управления Follow Position

Устанавливает позицию слоя, указанного в Target. Можно использовать несколько эффектов на одном слое: это удобно, когда нужно переключаться между несколькими родителями.

| Параметр | Значение |
|---|---|
| **Target** | Целевой слой. |
| **SET POSITION** | Активирует эффект. |

#### Панель управления Follow Rotation

Вращение вслед за целевым слоем. Можно использовать несколько эффектов на одном слое.

| Параметр | Значение |
|---|---|
| **Target** | Целевой слой. |
| **Method** | Переключение между двумя режимами: **Turn toward the target** поворачивает слой в сторону целевого слоя; **Copy value** добавляет значение вращения целевого слоя. |
| **ADD ROTATION** | Активирует эффект. |

### Как пользоваться

1. Чтобы создать конечность, можно построить три кости с помощью **🦴 create Bone** и применить к нижней из них **➕ IK Controller**. Альтернатива — готовая сборка **💪 create Limb**: она оптимизирована, работает быстрее и позволяет копировать структуру в другую композицию, так как слои Point A, Point B и Point C уже заложены в настройках костей. Либо сразу создать весь скелет с помощью **☠️ create Skeleton**.
2. Расставьте кости в местах сгиба конечностей персонажа. Идеальная точность не нужна: риг можно отредактировать в процессе анимации. **Важно:** настраивайте риг в первом кадре композиции, так как длина костей рассчитывается по первому кадру.
3. Дизайн костей можно сменить в настройках шейпа (Center, Ellipse, Square, Triangle, Star, Cross, Skull, Hand, Foot).
4. Расположите якорные точки (anchor points) слоёв арта в местах расположения костей. Чтобы автоматически привязать арт к костям, выберите слои персонажа и нажмите **🔗 set Parents**: скрипт сам найдёт ближайшие кости и назначит их родителями.
5. Для привязки вершин Puppet Mesh к костям используйте **📌 set Puppets**. При необходимости, например если суставы персонажа не округлые, воспользуйтесь **🪝 pin To**: он привязывает группу вершин Puppet Mesh к определённому родителю. Для каждой группы создаётся отдельный эффект `Pinned to`, в котором нужно указать родительский слой.
6. Если вы использовали готовый скелет, после настройки структуры персонажа установите родителей для костей кистей, плеч и бёдер. По умолчанию их родитель — слой `C | NULL`.

Каждое действие оборачивается в свою Undo-группу и отменяется обычным Ctrl+Z.

### Основные фишки

**Быстрый риг**

- Длины конечностей рассчитываются относительно первого кадра: персонажа легко поправить, если на этапе рига были допущены ошибки.
- Можно установить фиксированную длину конечностей в блоке **IK Controller → Length**, если метод настройки по первому кадру не нравится.
- С помощью общего родительского слоя (`C | NULL`) легко изменить размер персонажа или даже развернуть его.
- Автоматическая привязка арта к костям с помощью **set Parents**, **set Puppets** и **pin To**.
- Удобная смена дизайна и цвета костей, как у обычного шейпа.
- Малое количество вспомогательных слоёв (костей) или их полное отсутствие.
- Возможность копирования персонажа в другую композицию.

**Удобная анимация**

- Автоматическое растягивание конечностей без дополнительных манипуляций.
- Простое переключение направления запястья: **IK Controller → Follow**.
- Плавный разворот локтя слайдером **IK Controller → Flip**.
- Переключение между несколькими родителями с помощью эффектов **Follow Position** и **Follow Rotation**.
- Прямая кинематика: **IK Controller → FK**.
- Изменение размера и разворот персонажа или отдельной конечности с помощью родительского нуля.

### Болван Dummy: восходящая AI-звезда ⭐

Dummy — готовая болванка персонажа, которую легко настроить под нужные пропорции, быстро анимировать и загрузить в качестве референса для нейросетей, например Seedance 2.0.

### Требования

- After Effects 24.x или новее (риг построен на выражениях, Puppet-пинах и родительских связях).
- Папка `boney_files` рядом с панелью (`.jsx`, `.ffx` и `boney_template.aep`).
- Photoshop для инструментов покадровой анимации.

### Состав репозитория

| Путь | Содержимое |
|---|---|
| `Boney_Bones_1.9.jsx` | Панель-лаунчер. |
| `boney_files/` | Скрипты, пресеты (`.ffx`) и шаблон `boney_template.aep`. |
| `expressions/` | Экспрешены рига текстом: `ikController_main.jsx` (блен IK / FK, Follow, Flip, стретч; один текст на все слайдеры `IK_Controller`), `position.jsx` / `rotation.jsx` / `scale.jsx` (обёртки transform-свойств костей), `followPosition_setPosition.jsx` и `followRotation_addRotation.jsx` (эффекты Follow Position / Follow_Rotation). |
| `docs/images/` | Логотип и скриншоты для этой страницы. |
| `sync_from_workdir.ps1` | Копирует публикуемый набор файлов из рабочей папки автора в этот репозиторий. |
| `build_release_zip.ps1` | Собирает архив дистрибутива `dist/Boney_Bones_<ver>.zip` (панель + `boney_files` + `README.txt`) для GitHub Release. |
