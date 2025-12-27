// ==UserScript==
// @name         Twitch Chat Welcome Message Remover
// @namespace    https://twitch.tv/
// @version      1.0
// @description  Removes the welcome message from the Twitch chat
// @author       revunix
// @match        https://www.twitch.tv/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    function removeWelcomeMessage() {
        const messages = document.querySelectorAll(
            'div[data-a-target="chat-welcome-message"]'
        );
        messages.forEach(el => {
            el.style.display = 'none';
        });
    }

    const observerConfig = {
        childList: true,
        subtree: true
    };

    function startObserver(container) {
        const observer = new MutationObserver(() => {
            removeWelcomeMessage();
        });
        observer.observe(container, observerConfig);
        removeWelcomeMessage();
        console.log('welcomeToTheChat found chat container');
    }

    function findChatContainer() {
        return document.querySelector(
            '[data-test-selector="chat-scrollable-area__message-container"]'
        );
    }

    const interval = setInterval(() => {
        const container = findChatContainer();
        if (container) {
            clearInterval(interval);
            startObserver(container);
        }
    }, 1000);
})();
