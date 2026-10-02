const escapeHTML = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const TOKEN =
    /((?:^|(?<=\s))\/\/.*$)|("(?:[^"\\]|\\.)*")(\s*:)?|\b(true|false|null)\b|(-?\b\d+(?:\.\d+)?\b)/g;

function highlightBodyLine(line: string) {
    let out = "";
    let last = 0;
    line.replace(
        TOKEN,
        (
            match: string,
            comment: string,
            str: string,
            colon: string,
            lit: string,
            num: string,
            offset: number,
        ) => {
            out += escapeHTML(line.slice(last, offset));
            if (comment) {
                out += `<span class="c">${escapeHTML(comment)}</span>`;
            } else if (str && colon) {
                out += `<span class="k">${escapeHTML(str)}</span>${colon}`;
            } else if (str) {
                out += `<span class="s">${escapeHTML(str)}</span>`;
            } else {
                out += `<span class="n">${escapeHTML(lit || num)}</span>`;
            }
            last = offset + match.length;
            return match;
        },
    );
    return out + escapeHTML(line.slice(last));
}

const START_LINE = /^(GET|POST|PUT|PATCH|DELETE|HTTP\/1\.1)\b/;
const HEADER_LINE = /^([A-Za-z][A-Za-z0-9-]*)(:\s.*)$/;

export function highlight(text: string) {
    const lines = text.replace(/^\n+|\s+$/g, "").split("\n");
    let inHeaders = false;
    return lines
        .map((line) => {
            if (START_LINE.test(line)) {
                inHeaders = true;
                const [first, ...rest] = line.split(" ");
                return `<span class="m">${escapeHTML(first)}</span> ${escapeHTML(rest.join(" "))}`;
            }
            if (inHeaders) {
                if (line.trim() === "") {
                    inHeaders = false;
                    return "";
                }
                const h = line.match(HEADER_LINE);
                if (h) {
                    return `<span class="h">${escapeHTML(h[1])}</span>${escapeHTML(h[2])}`;
                }
            }
            return highlightBodyLine(line);
        })
        .join("\n");
}
