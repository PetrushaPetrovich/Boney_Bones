// =============================================================================
//  Script launcher panel template for After Effects
//  Шаблон панели-лаунчера скриптов для After Effects
//  Author: Petrusha Petrovich <syslef@gmail.com>  ·  Template v1.4
//    1.4 — SCRIPTS_DIR for helper scripts; missing file → button disabled.
//          SCRIPTS_DIR для вспомогательных скриптов; нет файла → кнопка выключена.
//    1.3 — scripts run via app.scheduleTask (fixes AE crash 0::42 on dialogs).
//          запуск через app.scheduleTask (исправляет краш AE 0::42 на диалогах).
//
//  Usage: copy & rename (file name = Window menu item); edit only
//  SCRIPT_VERSION and PANEL_CONFIG. Install into Scripts/ScriptUI Panels/.
//  Использование: скопируйте и переименуйте файл; правьте только
//  SCRIPT_VERSION и PANEL_CONFIG. Установка: Scripts/ScriptUI Panels/.
// =============================================================================
//  SETTINGS — edit only this block / НАСТРОЙКА — правьте только этот блок
// =============================================================================

// Panel name and version (shown in the corner) / Имя и версия панели
var SCRIPT_VERSION = "Boney_Bones v1.9";

// Helper scripts folder: relative to the panel, absolute, or { win, mac }.
// Папка скриптов: относительно панели, абсолютная или { win, mac }.
var SCRIPTS_DIR = "boney_files";

// Buttons / Кнопки:
//   { type: "script",    label: "Text", file: "script.jsx", args: { key: "value" } }
//   { type: "preset",    label: "Text", file: "preset.ffx" }
//   { type: "separator", label: "Title" }   (label: "" — plain line / просто линия)
//   args in the script / в скрипте:  var args = $.global.SCRIPT_ARGS || {};
//   file: relative to SCRIPTS_DIR, absolute, or { win, mac }; any slashes.
//   file: относительно SCRIPTS_DIR, абсолютный или { win, mac }; слеши любые.
var PANEL_CONFIG = [

    { type: "separator", label: " --- Bones --- " },

    { type: "script", label: "🦴 create Bone",     file: "create_bone.jsx" },
    { type: "script", label: "💪 create Limb",     file: "create_limb.jsx" },
    { type: "script", label: "☠️ create Skeleton", file: "create_skeleton.jsx" },
    { type: "script", label: "🤡 create AI Dummy", file: "create_dummy.jsx" },

    { type: "separator", label: " --- Modifiers --- " },

    { type: "script", label: "✅ activate properties", file: "add_properties.jsx" },
    { type: "script", label: "+ follow_position",      file: "add_follow_position.jsx" },
    { type: "script", label: "+ follow_rotation",      file: "add_follow_rotation.jsx" },
    { type: "script", label: "+ IK Controller",        file: "add_IK_Controller.jsx" },

    { type: "separator", label: " --- Connecters --- " },

    { type: "script", label: "🔗 set Parents", file: "set_parents.jsx" },
    { type: "script", label: "📌 set Puppets", file: "set_puppets.jsx" },
    { type: "script", label: "🪝 pin To",      file: "pin_to.jsx" },

    { type: "separator", label: " --- Frame-by-frame --- " },

    { type: "script", label: "🖼️ Add PSD frame",  file: "fbf_add_psd_frame.jsx" },
    { type: "script", label: "📂 Open layer",     file: "fbf_open_layer.jsx" },
    { type: "script", label: "🧅 Add Onion Skin",  file: "fbf_add_onion_skin.jsx" },

];

// Appearance (optional) / Внешний вид (необязательно)
var STYLE = {
    fontSize:        10,       // pt
    fontName:        "dialog", // "dialog" = AE system font / системный шрифт AE
    fontStyle:       "bold",   // "" | "bold" | "italic" | "bolditalic"

    btnPadH:         7,        // button padding H (px)
    btnPadV:         3,        // button padding V (px)
    btnGap:          2,        // gap between buttons (px)
    rowGap:          2,        // gap between rows (px)
    panelPadding:    4,        // panel margins (px)

    // Approx. char width (px); increase if labels get clipped.
    // Ширина символа (px); увеличьте, если текст обрезается.
    charWidth:       7.5,

    sepLabelSize:    10,
    sepMarginTop:    12,
    sepMarginBottom: 4,

    // Compact mode (auto when height is short) / Компактный режим (при нехватке высоты)
    compactBtnW:     26,       // icon button width (px)
    compactSepW:     10,       // "|" width (px)
    verRowH:         18        // version row height (px)
};

// =============================================================================
//  CORE — do not edit below / ЯДРО — ниже не редактировать
// =============================================================================

var PANEL_VERSION = "1.4";     // template version (not SCRIPT_VERSION) / версия шаблона

(function (thisObj) {

    // Normalize slashes to "/", keep UNC prefix / Нормализация слешей, UNC сохраняется
    function normalizePath(p) {
        p = String(p);
        p = p.replace(/\\/g, "/");
        var unc = (p.substring(0, 2) === "//");
        p = p.replace(/\/+/g, "/");
        if (unc) { p = "/" + p; }
        return p;
    }

    function isAbsolutePath(p) {
        return (/^[a-zA-Z]:\//).test(p) || p.charAt(0) === "/";
    }

    // Config path: string or { win, mac } / Путь из конфига: строка или { win, mac }
    function pickPath(val) {
        if (!val) { return null; }
        var raw = val;
        if (typeof val === "object") {
            var isWin = ($.os.toLowerCase().indexOf("win") !== -1);
            raw = isWin ? val.win : val.mac;
            if (!raw) { raw = val.win || val.mac; }
        }
        return normalizePath(raw);
    }

    var PANEL_DIR = (new File($.fileName)).parent;

    function resolveScriptsDir() {
        var p = pickPath((typeof SCRIPTS_DIR !== "undefined") ? SCRIPTS_DIR : null);
        if (!p) { return PANEL_DIR; }
        if (isAbsolutePath(p)) { return new Folder(p); }
        return new Folder(PANEL_DIR.absoluteURI + "/" + p);
    }
    var SCRIPTS_FOLDER = resolveScriptsDir();

    // Relative path: SCRIPTS_DIR first, then panel folder (legacy "ai_Tools/foo.jsx").
    // Относительный путь: сначала SCRIPTS_DIR, затем папка панели (старый стиль).
    function resolveFile(file) {
        var p = pickPath(file);
        if (!p) { return null; }
        if (isAbsolutePath(p)) { return new File(p); }
        var inDir = new File(SCRIPTS_FOLDER.absoluteURI + "/" + p);
        if (inDir.exists) { return inDir; }
        var inPanel = new File(PANEL_DIR.absoluteURI + "/" + p);
        return inPanel.exists ? inPanel : inDir;
    }

    // Check files on disk; true if any found / Проверка файлов; true, если найден хоть один
    function prepareItems(config) {
        var anyFound = false;
        for (var i = 0; i < config.length; i++) {
            var it = config[i];
            if (it.type === "separator") { continue; }
            it._file   = resolveFile(it.file);
            it._exists = !!(it._file && it._file.exists);
            if (it._exists) { anyFound = true; }
        }
        return anyFound;
    }

    // Panel id from file name (key for saved size) / ID панели из имени файла
    function panelId() {
        try { return (new File($.fileName)).name.replace(/\.[^.]+$/, ""); }
        catch (e) { return "ScriptPanel"; }
    }

    function calcBtnW(label) {
        var ratio = STYLE.fontSize / 12;
        return Math.ceil(label.length * STYLE.charWidth * ratio) + STYLE.btnPadH * 2;
    }

    function calcBtnH() {
        return STYLE.fontSize + STYLE.btnPadV * 2 + 4;
    }

    // Compact icon: label up to first space / Иконка: текст до первого пробела
    function getIcon(label) {
        if (!label) { return "•"; }
        var sp = label.indexOf(" ");
        return (sp > 0) ? label.substring(0, sp) : label;
    }

    // Deferred run via app.scheduleTask, not inside onClick: a modal dialog fires
    // onResize → reflow() destroys the button whose handler is running → AE crash.
    // Запуск отложен: диалог из onClick пересобирает кнопки под обработчиком → краш AE.
    function runScript(f, args) {
        if (!f || !f.exists) { alert("Файл не найден:\n" + (f ? f.fsName : "(путь не задан)")); return; }
        $.global.SCRIPT_ARGS = args || {};
        $.global.__aiToolsBusy = true;

        var uri = String(f.absoluteURI).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        var code =
            '(function () {' +
            '  var f = new File("' + uri + '");' +
            '  try { $.evalFile(f); }' +
            '  catch (e) { alert("Ошибка в скрипте " + f.name + ":\\n" + e.message); }' +
            '  finally {' +
            '    try { delete $.global.SCRIPT_ARGS; } catch (e1) {}' +
            '    $.global.__aiToolsBusy = false;' +
            '  }' +
            '})();';

        try {
            app.scheduleTask(code, 20, false);
        } catch (eSched) {
            // Fallback: direct run / Запасной путь: прямой запуск
            try { $.evalFile(f); }
            catch (eRun) { alert("Ошибка в скрипте " + f.name + ":\n" + eRun.message); }
            finally {
                try { delete $.global.SCRIPT_ARGS; } catch (e2) {}
                $.global.__aiToolsBusy = false;
            }
        }
    }

    function applyPreset(f) {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) { alert("Активируйте композицию."); return; }
        var sel = comp.selectedLayers;
        if (!sel.length) { alert("Выделите хотя бы один слой."); return; }
        if (!f || !f.exists) { alert("Файл не найден:\n" + (f ? f.fsName : "(путь не задан)")); return; }
        app.beginUndoGroup("Apply Preset");
        for (var i = 0; i < sel.length; i++) { sel[i].applyPreset(f); }
        app.endUndoGroup();
    }

    function makeHandler(item) {
        var t = item.type;
        var a = item.args;
        var f = item._file || resolveFile(item.file);
        return function () {
            if (t === "preset") { applyPreset(f); } else { runScript(f, a); }
        };
    }

    // Missing file: disable button, path in tooltip / Нет файла: кнопка выключена, путь в подсказке
    function markMissing(btn, item) {
        if (item._exists !== false) { return; }
        btn.enabled = false;
        btn.helpTip = "Файл не найден:\n" + (item._file ? item._file.fsName : "(путь не задан)");
    }

    // Rebuild wrapped button rows / Пересборка строк кнопок с переносом
    function rebuildFlow(host, defs, availW) {
        while (host.children.length > 0) {
            host.remove(host.children[0]);
        }

        var bh      = calcBtnH();
        var gap     = STYLE.btnGap;
        var row     = null;
        var rowUsed = 0;

        for (var i = 0; i < defs.length; i++) {
            var d  = defs[i];
            var bw = d.w;
            var needed = (row === null) ? bw : (rowUsed + gap + bw);

            if (row === null || needed > availW) {
                row = host.add("group");
                row.orientation   = "row";
                row.alignChildren = ["left", "center"];
                row.alignment     = ["left", "top"];
                row.spacing       = gap;
                row.margins       = 0;
                rowUsed = 0;
            }

            var btn = row.add("button", undefined, d.label);
            try { btn.graphics.font = ScriptUI.newFont(STYLE.fontName, STYLE.fontStyle, STYLE.fontSize); } catch (e) {}
            btn.preferredSize = [bw, bh];
            btn.onClick       = makeHandler(d.item);
            markMissing(btn, d.item);

            rowUsed += (rowUsed === 0) ? bw : (gap + bw);
        }

        // Stretch buttons to fill each row / Растянуть кнопки на всю строку
        for (var r = 0; r < host.children.length; r++) {
            var rowItem = host.children[r];
            rowItem.alignment = ["fill", "top"];
            for (var c = 0; c < rowItem.children.length; c++) {
                rowItem.children[c].alignment = ["fill", "center"];
            }
        }

        try { host.layout.layout(true); } catch (e) {}
    }

// ---- UI build / Интерфейс ----
    function buildUI(ctx) {
        var isPanel = (ctx instanceof Panel);

        var anyScriptsFound = prepareItems(PANEL_CONFIG);
        var win = isPanel
            ? ctx
            : new Window("palette", SCRIPT_VERSION, undefined, { resizeable: true });

        win.orientation   = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing       = 0;
        win.margins       = STYLE.panelPadding;

        var body = win.add("group");
        body.orientation   = "column";
        body.alignChildren = ["fill", "top"];
        body.alignment     = ["fill", "fill"];
        body.spacing       = 0;
        body.margins       = 0;

        // Version label / Метка версии
        var verRow = win.add("group");
        verRow.orientation   = "row";
        verRow.alignment     = ["fill", "bottom"];
        verRow.alignChildren = ["right", "center"];
        verRow.margins       = [0, 2, 2, 0];
        var verLbl = verRow.add("statictext", undefined, SCRIPT_VERSION);
        try { verLbl.graphics.font = ScriptUI.newFont(STYLE.fontName, "", 8); } catch (e) {}
        try { verLbl.graphics.foregroundColor = verLbl.graphics.newPen(verLbl.graphics.PenType.SOLID_COLOR, [0.5, 0.5, 0.5, 1], 1); } catch (e) {}
        verLbl.helpTip = "Шаблон панели v" + PANEL_VERSION;

        // Split config into sections / Разбить конфиг на секции
        var sections    = [];
        var pendingBtns = [];

        for (var i = 0; i < PANEL_CONFIG.length; i++) {
            var item = PANEL_CONFIG[i];
            if (item.type === "separator") {
                if (pendingBtns.length) {
                    sections.push({ kind: "buttons", items: pendingBtns });
                    pendingBtns = [];
                }
                sections.push({ kind: "sep", label: item.label });
            } else {
                pendingBtns.push(item);
            }
        }
        if (pendingBtns.length) {
            sections.push({ kind: "buttons", items: pendingBtns });
        }

        var minW = 120;

        // Full-mode height, computed without drawing / Высота полного режима без отрисовки
        function measureFullHeight(availW) {
            var bh    = calcBtnH();
            var total = 0;

            for (var s = 0; s < sections.length; s++) {
                var sec = sections[s];

                if (sec.kind === "sep") {
                    total += STYLE.sepMarginTop + STYLE.sepMarginBottom + (STYLE.sepLabelSize + 6);
                } else {
                    var gap = STYLE.btnGap, rowUsed = 0, rows = 0, started = false;
                    for (var b = 0; b < sec.items.length; b++) {
                        var bw = calcBtnW(sec.items[b].label);
                        if (bw > availW) { bw = availW; }
                        var needed = !started ? bw : (rowUsed + gap + bw);
                        if (!started || needed > availW) {
                            rows++; rowUsed = bw; started = true;
                        } else {
                            rowUsed += gap + bw;
                        }
                    }
                    total += rows * bh + (rows > 1 ? (rows - 1) * STYLE.rowGap : 0);
                }
            }
            return total;
        }

        // Compact mode: icon buttons, "|" separators, full name in tooltip
        // Компактный режим: иконки, "|" вместо разделителей, имя в подсказке
        function buildCompact(availW) {
            var bh  = calcBtnH();
            var cw  = STYLE.compactBtnW;
            var sw  = STYLE.compactSepW;
            var gap = STYLE.btnGap;

            var host = body.add("group");
            host.orientation   = "column";
            host.alignChildren = ["left", "top"];
            host.alignment     = ["fill", "top"];
            host.spacing       = STYLE.rowGap;
            host.margins       = 0;

            var row = null, rowUsed = 0;
            function newRow() {
                row = host.add("group");
                row.orientation   = "row";
                row.alignChildren = ["left", "center"];
                row.alignment     = ["left", "top"];
                row.spacing       = gap;
                row.margins       = 0;
                rowUsed = 0;
            }

            for (var i = 0; i < PANEL_CONFIG.length; i++) {
                var it    = PANEL_CONFIG[i];
                var isSep = (it.type === "separator");
                var w     = isSep ? sw : cw;
                var needed = (row === null) ? w : (rowUsed + gap + w);

                if (row === null || needed > availW) { newRow(); }

                if (isSep) {
                    var sp = row.add("statictext", undefined, "|");
                    try { sp.graphics.font = ScriptUI.newFont(STYLE.fontName, "", STYLE.fontSize); } catch (e) {}
                    sp.preferredSize = [sw, bh];
                    if (it.label) { sp.helpTip = it.label.replace(/^[\-\s]+|[\-\s]+$/g, ""); }
                } else {
                    var btn = row.add("button", undefined, getIcon(it.label));
                    try { btn.graphics.font = ScriptUI.newFont(STYLE.fontName, STYLE.fontStyle, STYLE.fontSize); } catch (e) {}
                    btn.preferredSize = [cw, bh];
                    btn.helpTip       = it.label;
                    btn.onClick       = makeHandler(it);
                    markMissing(btn, it);
                    if (!btn.enabled) { btn.helpTip = it.label + "\n" + btn.helpTip; }
                }

                rowUsed += (rowUsed === 0) ? w : (gap + w);
            }

            try { host.layout.layout(true); } catch (e) {}
        }

        // Layout signature: rebuild only when it changes (prevents resize crashes)
        // Сигнатура раскладки: пересборка только при её смене (без крашей на ресайзе)
        function fullSignature(availW) {
            var sig = "F";
            for (var s = 0; s < sections.length; s++) {
                var sec = sections[s];
                if (sec.kind === "sep") { sig += "|"; continue; }
                var gap = STYLE.btnGap, rowUsed = 0, rows = 0, started = false;
                for (var b = 0; b < sec.items.length; b++) {
                    var bw = calcBtnW(sec.items[b].label);
                    if (bw > availW) { bw = availW; }
                    var needed = !started ? bw : (rowUsed + gap + bw);
                    if (!started || needed > availW) { rows++; rowUsed = bw; started = true; }
                    else { rowUsed += gap + bw; }
                }
                sig += rows + ".";
            }
            return sig;
        }

        function compactSignature(availW) {
            var cw = STYLE.compactBtnW, sw = STYLE.compactSepW, gap = STYLE.btnGap;
            var rowUsed = 0, rows = 0, started = false;
            for (var i = 0; i < PANEL_CONFIG.length; i++) {
                var w = (PANEL_CONFIG[i].type === "separator") ? sw : cw;
                var needed = !started ? w : (rowUsed + gap + w);
                if (!started || needed > availW) { rows++; rowUsed = w; started = true; }
                else { rowUsed += gap + w; }
            }
            return "C" + rows;
        }

        function layoutSignature(availW, availH) {
            if (availH && availH > 0 && measureFullHeight(availW) > availH) {
                return compactSignature(availW);
            }
            return fullSignature(availW);
        }

        // Rebuild body from scratch (avoids ScriptUI size cache on Windows)
        // Полная пересборка body (обход кэша размеров ScriptUI на Windows)
        function buildContent(availW, availH) {
            while (body.children.length > 0) {
                body.remove(body.children[0]);
            }

            // No scripts found: show where we looked / Скриптов нет: показать, где искали
            if (!anyScriptsFound) {
                try { verRow.visible = true; } catch (e) {}
                var dirName = (typeof SCRIPTS_DIR !== "undefined" && pickPath(SCRIPTS_DIR)) ? pickPath(SCRIPTS_DIR) : SCRIPTS_FOLDER.name;
                var msg = body.add("statictext", undefined,
                    "Скрипты в папке " + dirName + " не найдены.\n\n" +
                    "Искали здесь:\n" + SCRIPTS_FOLDER.fsName + "\n\n" +
                    "Положите скрипты в эту папку (или поправьте SCRIPTS_DIR\n" +
                    "в начале файла панели) и переоткройте панель.",
                    { multiline: true });
                msg.alignment = ["fill", "top"];
                msg.preferredSize = [Math.max(availW, 10), 150];
                try { msg.graphics.font = ScriptUI.newFont(STYLE.fontName, "", STYLE.fontSize); } catch (e) {}
                try { body.layout.layout(true); } catch (e) {}
                return;
            }

            // Not enough height → compact mode (version hidden) / Мало высоты → компактный режим
            var compact = (availH && availH > 0 && measureFullHeight(availW) > availH);
            try { verRow.visible = !compact; } catch (e) {}
            if (compact) {
                buildCompact(availW);
                try { body.layout.layout(true); } catch (e) {}
                return;
            }

            for (var s = 0; s < sections.length; s++) {
                var sec = sections[s];

                if (sec.kind === "sep") {
                    var sepWrap = body.add("group");
                    sepWrap.orientation   = "row";
                    sepWrap.alignChildren = ["center", "center"];
                    sepWrap.alignment     = ["fill", "top"];
                    sepWrap.spacing       = 4;
                    sepWrap.margins       = [0, STYLE.sepMarginTop, 0, STYLE.sepMarginBottom];

                    if (sec.label && sec.label !== "") {
                        var lbl = sepWrap.add("statictext", undefined, sec.label);
                        lbl.alignment = ["center", "center"];
                        try { lbl.graphics.font = ScriptUI.newFont(STYLE.fontName, "", STYLE.sepLabelSize); } catch (e) {}
                    } else {
                        var ln = sepWrap.add("panel", undefined, "");
                        ln.alignment   = ["fill", "center"];
                        ln.maximumSize = [4000, 1];
                    }

                } else {
                    var host = body.add("group");
                    host.orientation   = "column";
                    host.alignChildren = ["left", "top"];
                    host.alignment     = ["fill", "top"];
                    host.spacing       = STYLE.rowGap;
                    host.margins       = 0;

                    var defs = [];
                    for (var b = 0; b < sec.items.length; b++) {
                        var it = sec.items[b];
                        defs.push({ label: it.label, w: calcBtnW(it.label), item: it });
                    }

                    rebuildFlow(host, defs, availW);
                }
            }

            try { body.layout.layout(true); } catch (e) {}
        }

        // Resize handler with re-entry guard (ScriptUI crashes on re-entrant reflow)
        // Ресайз с защитой от повторного входа (иначе ScriptUI падает)
        var reflowing = false;
        var lastSig   = null;
        function reflow() {
            if (reflowing) { return; }
            // Script running: resize only, no rebuild / Скрипт работает: без пересборки
            if ($.global.__aiToolsBusy) {
                try { win.layout.resize(); } catch (e) {}
                return;
            }
            reflowing = true;
            try {
                var pw    = (win.size && win.size[0] > 0) ? win.size[0] : 300;
                var ph    = (win.size && win.size[1] > 0) ? win.size[1] : 300;
                var avail = pw - STYLE.panelPadding * 2 - 4;
                if (avail < 10) avail = 10;
                var availH = ph - STYLE.panelPadding * 2 - STYLE.verRowH;
                if (availH < 10) availH = 10;
                try { win.layout.resize(); } catch (e) {}
                var sig = layoutSignature(avail, availH);
                if (sig !== lastSig) {
                    lastSig = sig;
                    buildContent(avail, availH);
                }
            } finally {
                reflowing = false;
            }
        }

        // Save/restore window size (Window only) / Сохранение размера окна (только Window)
        var SETTINGS_SECTION = panelId();
        var SETTINGS_KEY     = "windowSize";

        function saveWindowSize() {
            try {
                app.settings.saveSetting(SETTINGS_SECTION, SETTINGS_KEY,
                    win.size[0] + "," + win.size[1]);
            } catch (e) {}
        }

        function loadWindowSize(fallbackW, fallbackH) {
            try {
                if (app.settings.haveSetting(SETTINGS_SECTION, SETTINGS_KEY)) {
                    var parts = app.settings.getSetting(SETTINGS_SECTION, SETTINGS_KEY).split(",");
                    var w = parseInt(parts[0], 10);
                    var h = parseInt(parts[1], 10);
                    if (w >= minW && h >= 60) { return [w, h]; }
                }
            } catch (e) {}
            return [fallbackW, fallbackH];
        }

        win.onResizing = win.onResize = reflow;

        // Floating window / Плавающее окно
        if (!isPanel) {
            win.minimumSize = [minW, 60];

            var savedSize = loadWindowSize(160, 450);
            var availW0 = savedSize[0] - STYLE.panelPadding * 2 - 4;
            var availH0 = savedSize[1] - STYLE.panelPadding * 2 - STYLE.verRowH;
            buildContent(availW0, availH0);
            lastSig = layoutSignature(availW0, availH0); // else first onResize rebuilds / иначе первый onResize всё пересоберёт
            try { win.layout.layout(true); } catch (e) {}

            win.size = savedSize;
            win.center();
            win.show();

            win.onResize = function () { saveWindowSize(); reflow(); };

        } else {
            var pw = (win.size && win.size[0] > 0) ? win.size[0] : 200;
            var ph = (win.size && win.size[1] > 0) ? win.size[1] : 300;
            var availWp = pw - STYLE.panelPadding * 2 - 4;
            var availHp = ph - STYLE.panelPadding * 2 - STYLE.verRowH;
            buildContent(availWp, availHp);
            lastSig = layoutSignature(availWp, availHp); // else first onResize rebuilds / иначе первый onResize всё пересоберёт
            try { win.layout.layout(true); } catch (e) {}
        }

        return win;
    }

    buildUI(thisObj);

}(this));
