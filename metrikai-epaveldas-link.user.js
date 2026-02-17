// ==UserScript==
// @name         Metrikai.lt + ePaveldas.lt link
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Fixes broken epaveldas.lt links and auto-navigates to the correct page
// @author       Alfonsas Cirtautas
// @updateURL    https://raw.githubusercontent.com/acirtautas/metrikai-epaveldas-link/main/metrikai-epaveldas-link.user.js
// @downloadURL  https://raw.githubusercontent.com/acirtautas/metrikai-epaveldas-link/main/metrikai-epaveldas-link.user.js
// @match        https://metrikai.lt/*
// @match        https://www.epaveldas.lt/*
// @grant        none
// ==/UserScript==
(function () {
    'use strict';

    // =========================================================
    //  EPAVELDAS SIDE — read ?page= from URL, fill the input
    // =========================================================
    if (location.hostname.includes('epaveldas.lt')) {
        const params = new URLSearchParams(location.search);
        const page = params.get('page');
        if (!page) return;

        // The viewer is an Angular app, so the input may not exist yet — poll for it
        const MAX_WAIT_MS = 10000;
        const POLL_INTERVAL_MS = 300;
        let elapsed = 0;

        const poller = setInterval(() => {
            elapsed += POLL_INTERVAL_MS;

            const input = document.querySelector('#page-number-input');
            if (input) {
                clearInterval(poller);

                // Angular listens to native input + change events, not just .value =
                const nativeInputSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype, 'value'
                ).set;
                nativeInputSetter.call(input, page);
                input.dispatchEvent(new Event('input',  { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
                input.dispatchEvent(new KeyboardEvent('keyup',   { key: 'Enter', keyCode: 13, bubbles: true }));
            }

            if (elapsed >= MAX_WAIT_MS) clearInterval(poller);
        }, POLL_INTERVAL_MS);

        return; // nothing else to do on epaveldas side
    }

    // =========================================================
    //  METRIKAI SIDE — fix broken links, append &page=
    // =========================================================
    const LAPO_PATTERN = /Lapo Nr\.\s*(\S+)/i;

    function resolveNewLink(link, tableText) {
        const url = new URL(link.href);

        // --- Type 1: vbspi/biRecord.do?...&biExemplarId=...&psl=... ---
        if (url.pathname.includes('/vbspi/biRecord.do')) {
            const lviaMatch = tableText.match(/LVIA\/([^\s]+)/);
            if (!lviaMatch) return null;

            const lviaPath = lviaMatch[1];
            const encodedPath = lviaPath.split('/').map(encodeURIComponent).join('%2F');

            const lapoMatch = tableText.match(LAPO_PATTERN);
            const pageHint = lapoMatch ? ` (p. ${lapoMatch[1]})` : '';

            // psl= in the old URL was the viewer's internal page offset
            const psl = url.searchParams.get('psl');
            const pageParam = psl ? `&page=${psl}` : '';

            return {
                newHref: `https://www.epaveldas.lt/preview?id=${encodedPath}${pageParam}`,
                pageHint
            };
        }

        // --- Type 2: /recordImageSmall/ARCH|LVIA/...?exId=...&seqNr=... ---
        const imgMatch = url.pathname.match(/\/recordImageSmall\/(?:ARCH|LVIA)\/(.+)/);
        if (imgMatch) {
            const rawPath = imgMatch[1].replace(/\/$/, '');
            const encodedPath = rawPath.split('/').map(encodeURIComponent).join('%2F');

            const seqNr = url.searchParams.get('seqNr');
            const pageHint = seqNr ? ` (p. ${seqNr})` : '';
            const pageParam = seqNr ? `&page=${seqNr}` : '';

            return {
                newHref: `https://www.epaveldas.lt/preview?id=${encodedPath}${pageParam}`,
                pageHint
            };
        }

        return null;
    }

    function styleOldLink(link) {
        link.style.cssText += 'text-decoration: line-through; color: #999; font-size: 0.85em;';
        link.title = 'Sena (neveikianti) nuoroda';
    }

    function createNewLink(href, label) {
        const a = document.createElement('a');
        a.href = href;
        a.target = '_blank';
        a.textContent = `🔗 ${label}`;
        a.style.cssText = `
            display: inline-block;
            margin-left: 8px;
            padding: 1px 6px;
            background: #d4edda;
            border: 1px solid #28a745;
            border-radius: 3px;
            color: #155724;
            font-size: 0.85em;
            text-decoration: none;
        `;
        return a;
    }

    const BROKEN_PATTERNS = [
        /epaveldas\.lt\/vbspi\/biRecord\.do/,
        /epaveldas\.lt\/recordImageSmall\//,
    ];

    document.querySelectorAll('a[href]').forEach(link => {
        const isBroken = BROKEN_PATTERNS.some(p => p.test(link.href));
        if (!isBroken) return;

        const sourceTable = link.closest('table');
        const tableText = sourceTable ? sourceTable.innerText : '';

        const resolved = resolveNewLink(link, tableText);
        if (!resolved) return;

        const { newHref, pageHint } = resolved;
        styleOldLink(link);
        const newLink = createNewLink(newHref, `ePaveldas${pageHint}`);
        link.insertAdjacentElement('afterend', newLink);
    });

})();