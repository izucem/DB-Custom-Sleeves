// ==UserScript==
// @name         DuelingBook Independent P1 & P2 Sleeves
// @namespace    http://tampermonkey.net
// @author       Claude
// @version      7.1
// @description  Separate custom sleeves for you (bottom) and your opponent (top), with an in-game settings panel.
// @match        *://*.duelingbook.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ---- Defaults (used whenever a slot has no custom sleeve) ----
    const DEFAULTS = {
        p1: "https://i.postimg.cc/pVSBMjdh/manga.png",
        p2: "https://i.postimg.cc/W330QpLQ/magenta.png"
    };

    const KEY = 'dbSleeveChanger.v7';
    const MIDLINE = 0.5; // backup detection only: above this = opponent
    const ID_KEYS = ['id', 'user_id', 'username', 'name'];
    const srcDesc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');

    // ---------------------------------------------------------------- settings
    function loadSettings() {
        try {
            const s = JSON.parse(localStorage.getItem(KEY) || 'null');
            if (s && typeof s === 'object') {
                return {
                    enabled: s.enabled !== false,
                    p1: typeof s.p1 === 'string' ? s.p1 : null,
                    p2: typeof s.p2 === 'string' ? s.p2 : null
                };
            }
        } catch (e) { /* ignore */ }
        return { enabled: true, p1: null, p2: null };
    }
    let settings = loadSettings();

    function saveSettings() {
        try { localStorage.setItem(KEY, JSON.stringify(settings)); return true; }
        catch (e) { return false; }
    }

    const sleeveFor = side => side === 2 ? (settings.p2 || DEFAULTS.p2) : (settings.p1 || DEFAULTS.p1);

    // ------------------------------------------------------- owner detection
    function dataOf(cardEl) {
        try { return window.jQuery ? (window.jQuery(cardEl).data() || {}) : {}; }
        catch (e) { return {}; }
    }

    function sideOfValue(v) {
        if (v === undefined || v === null) return null;
        const p1 = window.player1, p2 = window.player2;
        if (p1 && v === p1) return 1;
        if (p2 && v === p2) return 2;
        if (typeof v === 'object') {
            for (const k of ID_KEYS) {
                if (v[k] !== undefined) {
                    if (p1 && p1[k] === v[k]) return 1;
                    if (p2 && p2[k] === v[k]) return 2;
                }
            }
            return null;
        }
        for (const k of ID_KEYS) {
            if (p1 && p1[k] === v) return 1;
            if (p2 && p2[k] === v) return 2;
        }
        if (v === 1 || v === '1') return 1;
        if (v === 2 || v === '2') return 2;
        return null;
    }

    function sideByPosition(el) {
        if (!el.isConnected) return null;
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) return null;
        return (r.top + r.height / 2) < window.innerHeight * MIDLINE ? 2 : 1;
    }

    function resolveSide(cardEl) {
        const d = dataOf(cardEl);
        return sideOfValue(d.owner) || sideOfValue(d.controller) || sideByPosition(cardEl) || null;
    }

    // ------------------------------------------------------- applying sleeves
    function restoreImg(img) {
        // Put back whatever the game had set, if we had replaced it
        if (img.dataset.sbApplied === undefined) return;
        if (img.src === img.dataset.sbApplied && img.dataset.sbOrig) {
            srcDesc.set.call(img, img.dataset.sbOrig);
        }
        delete img.dataset.sbApplied;
        delete img.dataset.sbTarget;
    }

    function applyImg(img) {
        if (!img || img.nodeName !== 'IMG') return;
        const holder = img.parentElement;
        if (!holder || !holder.classList.contains('cardback')) return;

        if (!settings.enabled) { restoreImg(img); return; }

        const card = holder.closest('.card');
        if (!card) return;
        const side = resolveSide(card);
        if (!side) return; // not classifiable yet; the periodic scan retries

        const target = sleeveFor(side);
        if (img.dataset.sbTarget === target && img.src === img.dataset.sbApplied) return; // already correct

        // If the src isn't one we set, it came from the game: remember it for "disable"
        if (img.src !== img.dataset.sbApplied) img.dataset.sbOrig = img.src;
        srcDesc.set.call(img, target);
        img.dataset.sbTarget = target;
        img.dataset.sbApplied = img.src;
    }

    if (srcDesc) {
        Object.defineProperty(HTMLImageElement.prototype, 'src', {
            set: function (url) {
                srcDesc.set.call(this, url);
                applyImg(this);
                setTimeout(() => applyImg(this), 0);
            },
            get: srcDesc.get,
            configurable: true,
            enumerable: true
        });
    }

    const scanAll = () => document.querySelectorAll('.card .cardback img').forEach(applyImg);

    new MutationObserver(muts => {
        for (const m of muts) m.addedNodes.forEach(n => {
            if (n.nodeType !== 1) return;
            applyImg(n);
            if (n.querySelectorAll) n.querySelectorAll('.card .cardback img').forEach(applyImg);
        });
    }).observe(document.documentElement, { childList: true, subtree: true });

    // ------------------------------------------------------------ settings UI
    const CSS = `
    #dbsl-root{position:fixed;right:10px;top:10px;z-index:2147483000;font:12px/1.35 Arial,sans-serif;color:#eee}
    #dbsl-btn{background:#222;color:#eee;border:1px solid #666;border-radius:6px;padding:4px 9px;cursor:pointer;opacity:.6}
    #dbsl-btn:hover{opacity:1}
    #dbsl-root.dbsl-off #dbsl-btn{text-decoration:line-through;opacity:.4}
    #dbsl-panel{position:absolute;right:0;top:32px;width:290px;background:#1b1b1f;border:1px solid #666;border-radius:8px;padding:10px;box-shadow:0 4px 16px rgba(0,0,0,.6)}
    #dbsl-panel[hidden]{display:none}
    #dbsl-panel .dbsl-head{font-weight:bold;margin-bottom:6px}
    #dbsl-panel .dbsl-slot{border-top:1px solid #444;margin-top:8px;padding-top:8px}
    #dbsl-panel .dbsl-title{font-weight:bold;margin-bottom:4px}
    #dbsl-panel .dbsl-line{display:flex;gap:6px;align-items:center;margin-top:4px}
    #dbsl-panel .dbsl-prev{width:33px;height:48px;object-fit:cover;border:1px solid #555;border-radius:3px;background:#000;flex:none}
    #dbsl-panel input[type=text]{flex:1;min-width:0;background:#111;color:#eee;border:1px solid #555;border-radius:4px;padding:3px 5px}
    #dbsl-panel button{background:#2c2c33;color:#eee;border:1px solid #666;border-radius:4px;padding:3px 8px;cursor:pointer}
    #dbsl-panel button:hover{background:#3a3a44}
    #dbsl-status{min-height:15px;margin-top:8px;color:#9fd;font-size:11px}
    #dbsl-panel .dbsl-note{color:#999;font-size:11px;margin-top:4px}
    `;

    function buildUI() {
        if (!document.body || document.getElementById('dbsl-root')) return;

        const style = document.createElement('style');
        style.textContent = CSS;
        (document.head || document.documentElement).appendChild(style);

        const slot = (side, label) => `
            <div class="dbsl-slot" data-side="${side}">
                <div class="dbsl-title">${label}</div>
                <div class="dbsl-line"><img class="dbsl-prev" alt=""><input class="dbsl-url" type="text" spellcheck="false"></div>
                <div class="dbsl-line">
                    <button class="dbsl-upload" type="button">Upload...</button>
                    <button class="dbsl-reset" type="button">Reset to default</button>
                    <input class="dbsl-file" type="file" accept="image/*" hidden>
                </div>
            </div>`;

        const root = document.createElement('div');
        root.id = 'dbsl-root';
        root.innerHTML = `
            <button id="dbsl-btn" type="button" title="Sleeve settings (Shift+click: quick on/off)">Sleeves</button>
            <div id="dbsl-panel" hidden>
                <div class="dbsl-head">Custom sleeves</div>
                <label><input type="checkbox" id="dbsl-enabled"> Enabled</label>
                ${slot(1, 'You (bottom)')}
                ${slot(2, 'Opponent (top)')}
                <div id="dbsl-status"></div>
                <div class="dbsl-note">Only you see these sleeves. Settings are saved in this browser.</div>
            </div>`;
        document.body.appendChild(root);

        const $ = s => root.querySelector(s);
        const panel = $('#dbsl-panel');
        const statusEl = $('#dbsl-status');
        const say = msg => { statusEl.textContent = msg || ''; };

        // Keep game hotkeys from reacting while typing in the panel
        ['keydown', 'keyup', 'keypress'].forEach(ev => panel.addEventListener(ev, e => e.stopPropagation()));

        function refreshUI() {
            $('#dbsl-enabled').checked = settings.enabled;
            root.classList.toggle('dbsl-off', !settings.enabled);
            root.querySelectorAll('.dbsl-slot').forEach(el => {
                const side = +el.dataset.side;
                const val = side === 2 ? settings.p2 : settings.p1;
                el.querySelector('.dbsl-prev').src = sleeveFor(side);
                const inp = el.querySelector('.dbsl-url');
                if (document.activeElement !== inp) inp.value = (val && !val.startsWith('data:')) ? val : '';
                inp.placeholder = (val && val.startsWith('data:')) ? '(uploaded image)' : 'Default - or paste an image URL';
            });
        }

        function commit(msg) {
            const ok = saveSettings();
            refreshUI();
            scanAll();
            say(ok ? msg : 'Could not save (storage full?). It applies until you reload.');
        }

        $('#dbsl-btn').addEventListener('click', e => {
            if (e.shiftKey) {
                settings.enabled = !settings.enabled;
                commit(settings.enabled ? 'Enabled.' : 'Disabled (game sleeves restored).');
            } else {
                panel.hidden = !panel.hidden;
                say('');
            }
        });

        $('#dbsl-enabled').addEventListener('change', e => {
            settings.enabled = e.target.checked;
            commit(settings.enabled ? 'Enabled.' : 'Disabled (game sleeves restored).');
        });

        root.querySelectorAll('.dbsl-slot').forEach(el => {
            const key = +el.dataset.side === 2 ? 'p2' : 'p1';
            const inp = el.querySelector('.dbsl-url');
            const file = el.querySelector('.dbsl-file');

            inp.addEventListener('change', () => {
                const v = inp.value.trim();
                if (!v) { settings[key] = null; commit('Using the default sleeve.'); return; }
                if (!/^https?:\/\//i.test(v)) { say('Please enter a full link starting with https://'); refreshUI(); return; }
                settings[key] = v;
                commit('Saved.');
            });

            el.querySelector('.dbsl-reset').addEventListener('click', () => {
                settings[key] = null;
                inp.value = '';
                commit('Reset to default.');
            });

            el.querySelector('.dbsl-upload').addEventListener('click', () => file.click());
            file.addEventListener('change', () => { handleFile(key, file.files && file.files[0]); file.value = ''; });
        });

        // Uploaded images are center-cropped to card proportions and shrunk before saving,
        // so they stay small enough for browser storage.
        function handleFile(key, f) {
            if (!f) return;
            const objUrl = URL.createObjectURL(f);
            const im = new Image();
            im.onload = () => {
                try {
                    const W = 200, H = 290;
                    const c = document.createElement('canvas');
                    c.width = W; c.height = H;
                    const g = c.getContext('2d');
                    const s = Math.max(W / im.naturalWidth, H / im.naturalHeight);
                    const w = im.naturalWidth * s, h = im.naturalHeight * s;
                    g.drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
                    let data = c.toDataURL('image/webp', 0.85);
                    if (!data.startsWith('data:image/webp')) data = c.toDataURL('image/jpeg', 0.85);
                    settings[key] = data;
                    commit('Uploaded and saved.');
                } catch (e) {
                    say('Could not process that image.');
                } finally {
                    URL.revokeObjectURL(objUrl);
                }
            };
            im.onerror = () => { say('Could not load that file as an image.'); URL.revokeObjectURL(objUrl); };
            im.src = objUrl;
        }

        refreshUI();
    }

    if (document.body) buildUI();
    else document.addEventListener('DOMContentLoaded', buildUI);

    // Periodic rescan (cards move, detached cards couldn't be classified earlier) + re-mount UI if removed
    setInterval(() => {
        scanAll();
        if (document.body && !document.getElementById('dbsl-root')) buildUI();
    }, 250);

    // ---- Debug: in the console run   copy(sleeveDebug())   then paste the result
    function desc(v) {
        if (v === undefined || v === null) return String(v);
        if (typeof v === 'object') {
            const o = { type: 'object', keys: Object.keys(v).slice(0, 12).join(',') };
            for (const k of ID_KEYS) if (v[k] !== undefined) o[k] = String(v[k]).slice(0, 40);
            return o;
        }
        return { type: typeof v, value: String(v).slice(0, 60) };
    }

    window.sleeveDebug = function () {
        const cards = [...document.querySelectorAll('.card')].slice(0, 80).map(c => {
            const d = dataOf(c);
            const r = c.getBoundingClientRect();
            const img = c.querySelector('.cardback img');
            return {
                top: Math.round(r.top), left: Math.round(r.left),
                owner: desc(d.owner), controller: desc(d.controller),
                sideByOwner: sideOfValue(d.owner), sideByController: sideOfValue(d.controller),
                sideByPosition: sideByPosition(c),
                img: img ? img.src.slice(-40) : null
            };
        });
        return JSON.stringify({
            scriptVersion: '7.1',
            enabled: settings.enabled,
            custom: { p1: settings.p1 ? settings.p1.slice(0, 40) : null, p2: settings.p2 ? settings.p2.slice(0, 40) : null },
            player1: desc(window.player1), player2: desc(window.player2),
            cards: cards
        }, null, 1);
    };
})();
