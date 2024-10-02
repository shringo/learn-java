window.addEventListener("DOMContentLoaded", function() {
    for(var question of [...document.getElementsByClassName("quizsnippet")]) {
        const input = [...question.children].filter(c => c instanceof HTMLInputElement && c.type.toLowerCase() === "radio")[0];
        if(input) {
            question.addEventListener("click",  function() {
                input.checked = true;
            })
        }
    }

    const AnswerKey = {
        "w-1-1": "Not quite, system needs to be capitalized to be System.",
        "w-1-2": "console.log is for JavaScript, and public doesn't make sense here.",
        "w-1-3": "print() is for Python, and we are missing System.out.",

        "w-2-1": "I wish.",
        "w-2-2": "This is the modulo operator, and it's used for calculating the remainder",
        "w-2-3": "That is division, or the / operator.",

        "w-3-1": "int will only store whole numbers.",
        "w-3-2": "short is like int as well, where it only stores whole numbers.",

        "w-4-1": "Recall that int only stores whole numbers, so this will error.",
        "w-4-2": "char can only hold one character, so this will error.",
        "w-4-3": "You can't store a boolean value (true, false) in an integer.",
        
        "w-5-1": "String() is wrong. You should use the square brackets instead.",
        "w-5-2": "String{} is wrong, but [ ... ] is also wrong. Swap the two for it to be right.",
        "w-5-3": "String{} and ( ... ) is also wrong. It should be String[] and { ... }.",

        "w-6-1": "Almost. is should be if.",
        "w-6-2": "While these keywords may make sense, if and else are shorter and concise.",
        "w-6-3": "if is correct, but then is where it falls short. then should be else.",
        
        "w-7-1": "Parameters would be the int number, int[] array, and Object other.",
        "w-7-2": "Adults don't exist in Java, but these are called methods.",
        "w-7-3": "Abstractions do exist, but these would be called either functions or methods.",
        
        "w-8-1": "Squaring is multiplying a number by itself.",
        "w-8-2": "Squaring is multiplying a number by itself.",
        
        "q9": "public class CerealBox",
        "q9c": "We type public class, then the name: CerealBox.",
        "q9w": "Not quite, you may have added a {",

        "q10": "int",
        "q10c": "int, because we want to return an int, and are also adding ints.",
        "q10w": "Not quite, if you entered a type like float or double, those store decimals, which ints can't.",
        
        "w-11-1": "Not quite, if we wanted 4 to be correct, i could be set to 1, or 5 could be set to 4.",
        "w-11-2": "This is a correct for loop. We start from 0, check if i is below 5, run code, increment i, and repeat.",
        "w-11-3": "Funny number, but not correct.",

        "q12": "extends",
        "q12c": "Extends is what we use if we want to \"branch\" off of a more general class",
        "q12w": "Honestly a hit/miss question if you don't know the keyword.",
        
        "q13": "Scanner",
        "q13c": "Scanner was used to grab input from the user.",
        "q13w": "Also another hit/miss question if you didn't quite catch it during the lecture.",
        
        "w-14-1": "Yes, the syntax is correct, but this code will run all 3 print statements if price is set higher than 9.",
        "w-14-2": "The += operator is shorthand for saying price = price + (price * 0.04F), so it is still valid.",
        "w-14-3": "The syntax is correct, but this code suffers from a bug where all 3 blocks inside the if statements can be set off.",

        "w-15-1": "This is a quiz",
              
        "c-1-1": "System is capital, and out, println are lowercase. println means print with a newline (when you hit the return key)",
        "c-2-1": "Remainder is the leftovers of division, this operator is called modulo.",
        "c-3-1": "Float is also correct, but takes up less memory for lesser precision",
        "c-3-2": "Double is also correct, but takes up more memory to be more precise",
        "c-4-1": "You can also use new String(\"...\") to create a string.",
        "c-5-1": "List types are [] after the type, then { ... } to hold the actual items.",
        "c-6-1": "Keywords like then, assume, otherwise and is aren't keywords.",
        "c-7-1": "Methods or functions are what these snippets are called.",
        "c-8-1": "Sure.",
        "c-8-2": "Use the multiplication operator, and multiply the number by itself.",
        "c-11-1": "We start at 0, but stop before 5, executing the inner code 5 times.",
        "c-14-1": "Else statements make it so only one of these blocks will execute",
        "c-15-1": "But only in instances of the class.",
        "c-15-2": "Technically the truth!",
        "c-15-3": ">:(",

        "na": "(No answer provided)"

    }

    const submit = document.getElementById("submitbtn");
    var sure = false;
    var comeagain = false;
    submit.addEventListener("click", function() {
        sure = sure || confirm("Are you sure?");
        if(sure && !comeagain) {
            comeagain = true;
            const questions = [...document.getElementsByTagName("label")];
            var score = 0;
            for(const question of questions) {
                const answers = [...question.getElementsByTagName("input")];
                const answerBox = document.createElement("div");
                if(answers.length === 1) {
                    const userInput = answers[0].value.trim();
                    const isCorrect = userInput.toLowerCase() === AnswerKey[question.htmlFor].toLowerCase();

                    answerBox.classList = isCorrect ? "correct" : "wrong";
                    answerBox.innerHTML = isCorrect ? "Correct!" : "Incorrect...";

                    answerBox.innerHTML += "<br><br>";
                    if(!isCorrect) answerBox.innerHTML += "Correct Answer:<br>" + AnswerKey[question.htmlFor] + "<br><br>";
                    answerBox.innerHTML += AnswerKey[question.htmlFor + (isCorrect?'c':'w')];
                    if(isCorrect) score++;
                } else {
                    const realAnswers = [...answers.filter(e => e.value.startsWith("c"))];
                    const chosenAnswer = answers.filter(e => e.checked)[0];

                    const isCorrect = realAnswers.includes(chosenAnswer);
                    answerBox.classList = isCorrect ? "correct" : "wrong";
                    answerBox.innerHTML = isCorrect ? "Correct!" : "Incorrect...";
                    answerBox.innerHTML += '<br>';
                    answerBox.innerHTML += AnswerKey[chosenAnswer?.value ?? "na"];

                    answers.forEach(e => {
                        if(e !== chosenAnswer) e.parentElement.setAttribute("data-tooltip", AnswerKey[e.value]);
                        e.disabled = true;
                        if(e.value.startsWith("c")) e.parentElement.classList.add("answer");
                    });

                    if(!isCorrect && chosenAnswer) {
                        chosenAnswer.parentElement.classList.add("wrongchoice");
                    }
                    if(isCorrect) score++;
                }
                question.insertBefore(answerBox, question.firstChild.nextSibling);
            }
            const scoreDiv = document.getElementById("score");
            scoreDiv.innerText = "Score: " + score + "/15";
            document.getElementById("scoremsg").innerText = "Hover above options to see explanations";
            window.scrollTo(0, 0);
        }
    });
});