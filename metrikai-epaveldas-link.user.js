// ==UserScript==
// @name         metrikai.lt + epaveldas.lt link
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Fixes broken epaveldas.lt links with correct page navigation
// @author       Alfonsas Cirtautas
// @updateURL    https://raw.githubusercontent.com/acirtautas/metrikai-epaveldas-link/main/metrikai-epaveldas-link.user.js
// @downloadURL  https://raw.githubusercontent.com/acirtautas/metrikai-epaveldas-link/main/metrikai-epaveldas-link.user.js
// @match        https://metrikai.lt/*
// @grant        none
// ==/UserScript==
(function () {
    'use strict';

    function resolveNewLink(link) {
        const url = new URL(link.href);

        // --- Type 1: vbspi/biRecord.do?...&biExemplarId=...&psl=... ---
        if (url.pathname.includes('/vbspi/biRecord.do')) {
            // Need to find LVIA reference in the page context
            const sourceTable = link.closest('table');
            if (!sourceTable) return null;
            
            const tableText = sourceTable.innerText;
            const lviaMatch = tableText.match(/LVIA\/([^\s]+)/);
            if (!lviaMatch) return null;

            const lviaPath = lviaMatch[1];
            const encodedPath = lviaPath.split('/').map(encodeURIComponent).join('%2F');

            // psl= is the real page number in the viewer
            const psl = url.searchParams.get('psl');
            const pageParam = psl ? `&wr=${psl}` : '';
            const pageHint = psl ? ` (p. ${psl})` : '';

            return {
                newHref: `https://www.epaveldas.lt/preview?id=${encodedPath}${pageParam}`,
                pageHint
            };
        }

        // --- Type 2: /recordImageSmall/ARCH|LVIA|KVB/...?exId=...&seqNr=... ---
        const imgMatch = url.pathname.match(/\/recordImageSmall\/(?:ARCH|LVIA|KVB)\/(.+)/);
        if (imgMatch) {
            const rawPath = imgMatch[1].replace(/\/$/, '');
            const encodedPath = rawPath.split('/').map(encodeURIComponent).join('%2F');

            // seqNr= is the real page number in the viewer
            const seqNr = url.searchParams.get('seqNr');
            const pageParam = seqNr ? `&wr=${seqNr}` : '';
            const pageHint = seqNr ? ` (p. ${seqNr})` : '';

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

        const resolved = resolveNewLink(link);
        if (!resolved) return;

        const { newHref, pageHint } = resolved;
        styleOldLink(link);
        const newLink = createNewLink(newHref, `ePaveldas${pageHint}`);
        link.insertAdjacentElement('afterend', newLink);
    });

})();
