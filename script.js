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
    handleThis(match.input.substring(match.index + match[0].length, (matches[parseInt(i) + 1]?.index || match.input.length))).forEach(e => wordEl.appendChild(e));
}

const noFormat = false;
const wordRegex = /[a-zA-Z]+/g;
const stringRegex = /(?<!\\)("|')/g;
const numberRegex = /\d(\d|_)*([FLDfld])?/g;
const annotationRegex = /^@[A-Za-z]+/g;
const extrasRegex = /;|,/g;
const variableRegex = /^[A-Za-z]\w*/g;
const accessFieldRegex = /(?<=\.\s*)[A-Za-z_]\w*\b(?!\()/g;
const methodRegex = /(?<!(new|<\/span>|<span>|=|\s)*?)(?<=(<\/span>|<span>)*?<span>\s*?)[A-Za-z_]\w+(?=\s*?(<\/span>|<span>)*?\()(?![{[])/g;

/**
 * @param {string} str 
 */
function handleThis(str, it=0) {
    it++;
    const block = [];
    str = str.split(' ');
    for(var i in str) {
        const word = str[i];
        const accFieldMatches = [...word.matchAll(accessFieldRegex)];
        /*if(accFieldMatches.length) {
            console.log(accFieldMatches)
            for(const i in accFieldMatches) {
                const match = accFieldMatches[i];
                const span = document.createElement("span");
                span.classList = "field";
                block.push(...handleThis(word.substring(accFieldMatches[i - 1]?.index ?? 0, match.index), it));
                span.innerText = match[0];
                block.push(span);
                block.push(...handleThis(word.substring(match.index + match[0].length, (accFieldMatches[i + 1]?.index ?? word.length)) + (str.length>1 ? ' ' : ''), it));
            }
        }*/
        // use regex on processed code rather than "along the way" with recursion
        // much easier
        /*else if(extraMatches.length) {
            for(const i in extraMatches) {
                const match = extraMatches[i];
                const span = document.createElement("span");
                span.classList = "misc";
                block.push(...handleThis(word.substring(extraMatches[i - 1]?.index ?? 0, match.index), it));
                span.innerText = match[0];
                block.push(span);
                block.push(...handleThis(word.substring(match.index + 1, extraMatches[i + 1]?.index ?? word.length), it));
            }
        } else */ {
            const span = document.createElement("span");
            span.innerText += word + (parseInt(i) === str.length - 1 || (it>1 && !word.length)  ? '' : ' ');
            block.push(span);
        }
    }

    return block;
}

// Syntax is not checked. only highlighting is available
window.addEventListener("DOMContentLoaded", function() {
    for(const element of document.getElementsByClassName("codeeditor")) {
        var java = element.getElementsByTagName("java")[0]
        if(!java) continue;
        java = java.textContent;
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
        const lines =java.split('\n').map(line => line.substring(lowestCutoff)).filter((l, i, a) => i == 0 || i == a.length-1 ? l.trim().length : true);
        for(const cIn in lines) {
            const code = lines[cIn];
            if(code.trim().length > 0 && noFormat) {
                const __ = document.createElement("span");
                __.classList = "method";
                __.innerText = code + '\n';
                preview.appendChild(__);
            }

            // split code line into words
            const lineEl = document.createElement("div");
            lineEl.classList = "line";
            if(code.trimStart().startsWith('|')) {
                toolTip += code.trimStart().substring(1).trimStart() + '\n';
            } else {
                if(toolTip.length) {
                    lineEl.setAttribute("data-tooltip", toolTip);
                    toolTip = "";
                }
                for(const word of code.split(' ')) {
                    const wordEl = document.createElement("span");
                    let manipulate = false;
                    {
                        const keywordMatches = [...word.matchAll(wordRegex)].filter(m => keywords.includes(m[0]));
                        // if(keywordMatches.length) console.log(keywordMatches);
                        // we could replace this with one giant for loop instead of repeating code
                        for(const i in keywordMatches) {
                            const match = keywordMatches[i];
                            if(i === "0") handleThis(match.input.substring(0,match.index)).forEach(e => wordEl.appendChild(e));
                            const kw = document.createElement("span");
                            kw.classList = "keyword";
                            kw.innerText = match[0];
                            wordEl.appendChild(kw);
                            handleNons(i, keywordMatches, match, wordEl);
                            manipulate = true;
                        }

                        const annotationMatches = [...word.matchAll(annotationRegex)];
                        for(const i in annotationMatches) {
                            const match = annotationMatches[i];
                            const kw = document.createElement("span");
                            kw.classList = "annotation";
                            kw.innerText = match[0];
                            wordEl.appendChild(kw);
                            handleNons(i, annotationMatches, match, wordEl);
                            manipulate = true;
                        }

                        const numberMatches = [...word.matchAll(numberRegex)];
                        for(const i in numberMatches) {
                            const match = numberMatches[i];
                            if(i === "0") handleThis(match.input.substring(0,match.index)).forEach(e => wordEl.appendChild(e));
                            const kw = document.createElement("span");
                            kw.classList = "number";
                            kw.innerText = match[0];
                            wordEl.appendChild(kw);
                            handleNons(i, numberMatches, match, wordEl);
                            manipulate = true;
                        }

                    }

                    lineEl.appendChild(wordEl);
                    handleThis((manipulate ? '' : word) + ' ').forEach(e => lineEl.appendChild(e));
                }
                preview.appendChild(lineEl);
                if(cIn != lines.length - 1) preview.appendChild(document.createElement("br"));
            }
        }  
        preview.innerHTML = preview.innerHTML
            // THESE NEED TO BE FIXED.
            // TRY BREAKING IT UP INTO TWO PARTS?
            .replaceAll(
                /(?<!\\|(class|data-tooltip)=((")[^"<>]*?)?)"(?!>).*?(?<!\\|(class|data-tooltip)=((")[^"<>]*?)?)("|<\/div>)(?!>)/gms,
                "<a class=\"string\">$&</a>")
            .replaceAll(
                /(?<!\\|(class|data-tooltip)=((")[^"<>]*?)?)'(?!>).*?(?<!\\|(class|data-tooltip)=((")[^"<>]*?)?)('|<\/div>)(?!>)/gms,
                "<a class='string'>$&</a>")
            .replaceAll(
                /(?<=\.\s*?)(?<!data-tooltip=("|')[^"']*?)\w+?(?=\s*?\.)/gms,
                "<a class=\"field\">$&</a>")
            .replaceAll(
                /(?<!(=|new|div\s+?class="line">)(<\/span>|<span>|\s)*?)(?<=(<\/span>|<span>)*?\s*?<span>)[A-Za-z_]\w+(?=\s*?(<\/span>|<span>)*?\()(?![{[])/g,
                ///(?<!(=|new)(<\/span>|<span>|\s*?)*?)(?<=(<\/span>|<span>)*?\s*?<span>)[A-Za-z_]\w+(?=\s*?(<\/span>|<span>)*?\()(?![{[])/g,
                "<a class='method'>$&</a>")
            .replaceAll(
                /\/\/.*?(?=<br>)/g,
                "<a class='comment'>$&</a>")
            .replaceAll(
                /(?<!data-tooltip=("|')[^<>]*?)(?<!&(l|g)t)(,|;)/gs,
                "<a class='misc'>$&</a>")
        /* */
            .replaceAll(
                /<span><\/span>/g,
                "");
        element.appendChild(preview);

        /*
         *  <div class="console">
                <div class="consoleheader">
                    <a class="btn run">▶</a>
                    <a class="btn" data-tooltip="Clear the console">🗑️</a>
                    <a class="btn btnoff" data-tooltip="Stop running the program">🛑</a>
                    <span class="cnstxt">Runnable Demo (Console Output)</span>
                </div>
                <hr>
                <div class="stout">
                </div>
            </div>
         */

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
        stdout.appendChild(Object.assign(document.createElement("hr")));
        stdout.appendChild(stout);
        element.appendChild(stdout);

    }
});