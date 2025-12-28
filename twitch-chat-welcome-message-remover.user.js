// ==UserScript==
// @name         Twitch Chat Welcome Message Remover
// @namespace    https://twitch.tv/
// @version      1.3
// @description  Removes the welcome message from the Twitch chat
// @author       revunix
// @match        https://www.twitch.tv/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const style = document.createElement('style');
    style.textContent = `
        [data-a-target="chat-welcome-message"] {
            display: none !important;
        }
    `;
    document.documentElement.appendChild(style);

    function nukeWelcomeMessage() {
        document
            .querySelectorAll('[data-a-target="chat-welcome-message"]')
            .forEach(el => el.remove());
    }

    const observer = new MutationObserver(nukeWelcomeMessage);

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    setInterval(nukeWelcomeMessage, 500);
})();
