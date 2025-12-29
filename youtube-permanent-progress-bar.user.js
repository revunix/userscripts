// ==UserScript==
// @name         Permanent Progress Bar for YouTube
// @namespace    https://youtube.com/
// @version      1.2
// @description  Permanent progress bar with optional chapters for YouTube
// @author       revunix
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const defaults = {
        hide: false,
        height: 3,
        top: true,
        embed: true,
        period: 2000,
        chapters: false,
        padding: 12,
        'progress-color': '#fe0000',
        'parent-color': 'rgba(255,255,255,0.2)',
        'loaded-color': 'rgba(255,255,255,0.4)',
        'chapter-color': 'rgba(0,0,0,0.5)'
    };

    const loadPrefs = () => ({
        ...defaults,
        ...JSON.parse(localStorage.getItem('ypp-prefs') || '{}')
    });

    const savePrefs = p =>
        localStorage.setItem('ypp-prefs', JSON.stringify(p));

    let prefs = loadPrefs();

    const style = document.createElement('style');
    style.textContent = `
        .pprogg {
            position: absolute;
            left: var(--padding);
            bottom: 0;
            width: calc(100% - var(--padding) * 2);
            height: var(--height);
            background: var(--parent-color);
            z-index: 50;
            display: none;
        }
        .pprogg.hidden,
        .pprogg.live {
            display: none !important;
        }
        .pprogg [data-type=progress] {
            position: absolute;
            height: 100%;
            width: var(--progress);
            background: var(--progress-color);
        }
        .pprogg [data-type=loaded] {
            position: absolute;
            height: 100%;
            width: var(--loaded);
            background: var(--loaded-color);
        }
        .pprogg span.pos {
            position: absolute;
            width: 2px;
            height: 100%;
            background: var(--chapter-color);
        }
        .ytp-autohide:not(.ytp-small-mode) .pprogg {
            display: block;
        }
    `;
    document.documentElement.append(style);

    let player;
    let bar;
    let timer;

    const removeChapters = () =>
        bar?.querySelectorAll('.pos').forEach(e => e.remove());

    const addChapters = response => {
        if (!prefs.chapters) return;
        const d = response?.videoDetails?.shortDescription;
        if (!d || !d.includes('0:00')) return;

        removeChapters();

        const regex = /((\d{0,2}):)?(\d{1,2}):(\d{2})/;
        const times = d.split('\n')
            .map(l => l.match(regex))
            .filter(Boolean)
            .map(m =>
                (parseInt(m[2] || 0) * 3600) +
                (parseInt(m[3]) * 60) +
                parseInt(m[4])
            );

        if (times.length < 3) return;

        const len = response.videoDetails.lengthSeconds;

        times.forEach(t => {
            if (!t) return;
            const s = document.createElement('span');
            s.className = 'pos';
            s.style.left = (t / len * 100) + '%';
            bar.append(s);
        });
    };

    const update = () => {
        if (!player || !bar) return;

        const r = player.getPlayerResponse();
        const live = r?.videoDetails?.isLive;
        bar.classList[live ? 'add' : 'remove']('live');

        bar.style.setProperty('--progress',
            (player.getCurrentTime() / player.getDuration() * 100).toFixed(2) + '%'
        );
        bar.style.setProperty('--loaded',
            (player.getVideoLoadedFraction() * 100).toFixed(2) + '%'
        );
    };

    const init = () => {
        if (!location.href.includes('/watch')) return;

        player = [...document.querySelectorAll('.html5-video-player')]
            .sort((a, b) => b.offsetHeight - a.offsetHeight)[0];

        if (!player) return;

        if (!bar) {
            bar = document.createElement('div');
            bar.className = 'pprogg';

            bar.style.setProperty('--height', prefs.height + 'px');
            bar.style.setProperty('--padding', prefs.padding + 'px');
            bar.style.setProperty('--parent-color', prefs['parent-color']);
            bar.style.setProperty('--progress-color', prefs['progress-color']);
            bar.style.setProperty('--loaded-color', prefs['loaded-color']);
            bar.style.setProperty('--chapter-color', prefs['chapter-color']);

            bar.classList[prefs.hide ? 'add' : 'remove']('hidden');

            const loaded = document.createElement('div');
            loaded.dataset.type = 'loaded';
            bar.append(loaded);

            const prog = document.createElement('div');
            prog.dataset.type = 'progress';
            bar.append(prog);

            player.append(bar);
        }

        clearInterval(timer);
        timer = setInterval(update, prefs.period);

        const r = player.getPlayerResponse();
        if (r) addChapters(r);
    };

    addEventListener('yt-navigate-finish', init);
    addEventListener('play', init, true);

    addEventListener('keydown', e => {
        if (e.altKey && e.key.toLowerCase() === 'p') {
            prefs.hide = !prefs.hide;
            savePrefs(prefs);
            bar?.classList[prefs.hide ? 'add' : 'remove']('hidden');
        }
    });

})();
