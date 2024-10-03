// words to make red
const keywords = [
    "abstract",	"continue",	"for",	        "new",	        "switch",
    "assert",	"default",	"goto",	        "package",	    "synchronized",
    "boolean",	"do",	    "if",	        "private",	    "this",
    "break",	"double",	"implements",	"protected",	"throw",
    "byte",	    "else",	    "import",	    "public",	    "throws",
    "case",	    "enum",	    "instanceof",	"return",	    "transient",
    "catch",	"extends",	"int",	        "short",	    "try",
    "char",	    "final",	"interface",	"static",	    "void",
    "class",	"finally",	"long",     	"strictfp",	    "volatile",
    "const",	"float",	"native",   	"super",	    "while",

    "true",     "false",    "record",
];

/**
 * @param {number} i 
 * @param {RegExpMatchArray[]} matches 
 * @param {RegExpMatchArray} match 
 * @param {HTMLElement} wordEl 
 */
function handleNons(i, matches, match, wordEl) {
    wordEl.appendChild(handleThis(match.input.substring(match.index + match[0].length, (matches[parseInt(i) + 1]?.index || match.input.length))));
}

// 
const noFormat = false;
const keywordRegex = new RegExp("(?<!\\w|((a|div|pre) (class)?[^<]*?))(" + keywords.join('|') + ")(?!\\w)", 'g');
const numberRegex = /\d(\d|_)*([FLDfld])?/g;
const annotationRegex = /@[A-Za-z]+/g;
const methodRegex = /(?<!new|=)(?<=\w)\s([A-Za-z_]+\w)(?=\s*?\()/g;

/**
 * @param {string} str 
 */
function handleThis(str) {
    const span = document.createElement("span");
    span.innerText += str;

    return span;
}

// Syntax is not checked. only highlighting is available
window.addEventListener("DOMContentLoaded", function() {
    for(const element of document.getElementsByClassName("codeeditor")) {
        var javaEl = element.getElementsByTagName("java")[0]
        if(!javaEl) continue;
        /**
         * @type {string}
         */
        const java = javaEl.textContent;
        const preview = document.createElement("pre");
        preview.classList = "preview";
        var lowestCutoff = -1;
        java.split('\n').forEach(line => {
            if(!line.length) return;
            const trimmed = line.replace(/^\s+/g, "");
            if(!trimmed.length) return;
            var cutoff = line.length - trimmed.length;
            if(cutoff < lowestCutoff || lowestCutoff < 0) lowestCutoff = cutoff;
        });

        var toolTip = "";

        // split code block into lines, and remove all leading whitespaces so code isn't put far off screen
        const lines = java.split('\n').map(line => line.substring(lowestCutoff)).filter((l, i, a) => i == 0 || i == a.length-1 ? l.trim().length : true);
        for(const cIn in lines) {
            const line = lines[cIn];
            if(line.trim().length > 0 && noFormat) {
                const __ = document.createElement("span");
                __.classList = "method";
                __.innerText = line + '\n';
                preview.appendChild(__);
            }

            // split code line into words
            const lineEl = document.createElement("div");
            lineEl.classList = "line";
            if(line.trimStart().startsWith('|')) {
                toolTip += line.trimStart().substring(1).trimStart() + '\n';
            } else {
                lineEl.innerText = line;
                for(const regex of [
                    // Safari doesn't do lookarounds correctly. Involved MAJOR refactoring of code
                    // add tooltip at the end so we can simply stay focused on strings without HTML attributes making life hard
                    [/(?<!(\\|<a\s+class=(("|')?string("|')?>?)?))"/m, `"`],
                    [/(?<!(\\|<a\s+class=(("|')?string("|')?>?)?))'/m, `'`]
                ]) {
                    const stSt = `<a class='string'>${regex[1]}`;
                    const enSt = `${regex[1]}</a>`;
                    var times = 0;
                    while(regex[0].test(lineEl.innerHTML)) {
                        lineEl.innerHTML = lineEl.innerHTML.replace(regex[0], 
                            times++ % 2 === 0 ? stSt : enSt
                        );
                        // Too many times for my code.
                        if(times > 50) break;
                    }
                }
                
                lineEl.innerHTML = lineEl.innerHTML
                    .replaceAll(methodRegex, "<a class='method'>$&</a>")
                    .replaceAll(keywordRegex, `<a class="keyword">$&</a>`)
                    .replaceAll(annotationRegex, `<a class="annotation">$&</a>`)
                    .replaceAll(numberRegex, `<a class="number">$&</a>`);

                if(toolTip.length) {
                    lineEl.setAttribute("data-tooltip", toolTip);
                    toolTip = "";
                }
                preview.appendChild(lineEl);
                if(cIn != lines.length - 1) preview.appendChild(document.createElement("br"));
            }
        }  
        preview.innerHTML = preview.innerHTML
            .replaceAll(
                /(?<=\.\s*?)(?<!data-tooltip=("|')[^"']*?)\w+?(?=\s*?\.)/gms,
                "<a class=\"field\">$&</a>")
            .replaceAll(
                /\/\/.*?(?=<br>)/g,
                "<a class='comment'>$&</a>")
            .replaceAll(
                /(?<!data-tooltip=("|')[^<>]*?)(?<!&(l|g)t)(,|;)/gs,
                "<a class='misc'>$&</a>"); 
        /* */
        element.appendChild(preview);

        // Add console
        const stdout = document.createElement("div");
        stdout.classList = "console";
        const cnHeader = document.createElement("div");
        cnHeader.classList = "consoleheader";
        const implementedScript = element.getElementsByTagName("script")[0];
        if(!implementedScript) continue;
        // https://stackoverflow.com/questions/39251318/javascript-function-document-createelementtagname-options-doesnt-work-as-i
        const runBtn = Object.assign(document.createElement("a"), { classList: "btn run", innerText: '▶' });
        runBtn.setAttribute("data-tooltip", "Run code");
        const clearBtn = Object.assign(document.createElement("a"), { classList: "btn", innerText: '🗑️' });
        clearBtn.setAttribute("data-tooltip", "Clear console output");
        // Quick! Add a button that doesn't do anything!
        const offBtn = Object.assign(document.createElement("a"), { classList: "btn btnoff", innerText: '🛑' });
        offBtn.setAttribute("data-tooltip", "Stop running the program");
        const stout = Object.assign(document.createElement("div"), { classList: "stout", innerText: "..." });

        // Temporarily change the definition of console.log to add text to an element
        runBtn.addEventListener("click", function() {
            stout.innerText = "";
            const realConsole = console.log;
            console.log = (...data) => {
                if(data.length === 1 && data[0] === "$end") {
                    stout.appendChild(Object.assign(document.createElement("i"), { innerText: (stout.innerText.length ? "\n" : "") + "Process finished with exit code 0"}))
                } else {
                    stout.innerText += data.join(' ') + '\n';
                }
            }
            // Usage of eval but WHATEVER
            eval(implementedScript.innerText);
            console.log("$end");
            console.log = realConsole;
        });

        clearBtn.addEventListener("click", function() {
            stout.innerText = "";
        });

        cnHeader.appendChild(runBtn);
        cnHeader.appendChild(clearBtn);
        cnHeader.appendChild(offBtn);
        cnHeader.appendChild(Object.assign(document.createElement("span"), { classList:"cnstxt", innerText: (implementedScript.getAttribute("data-label") ?? "") + " Runnable Demo (Output)" }));
        stdout.appendChild(cnHeader);
        stdout.appendChild(Object.assign(document.createElement("hr"), { classList: "nomg" }));
        stdout.appendChild(stout);
        element.appendChild(stdout);

    }
});