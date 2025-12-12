let luciClicks = 0;
let score = 0;
let multiplier = 1;
let exponent = 1;

const luci = document.getElementById("clickable-luci");
const multipliers = document.getElementById("multipliers");
const scoreCounter = document.getElementById("score-counter");
const multCounter = document.getElementById("mult-counter");
const expCounter = document.getElementById("exp-counter");


function luciClicked(event) {
    let rng = Math.random()
    if (rng < 0.15) {
        multiplier += 1
        multCounter.textContent = "multiplier - x" + multiplier.toString();
    }
    if (rng < 0.02) {
        exponent += 1
        expCounter.innerHTML = "exponent - x<sup>" + exponent.toString() + "</sup>";
    }

    score += Math.pow(multiplier, exponent);
    scoreCounter.textContent = "score - " + scoretoText(score, 2, true);

    luciClicks++;
    if (luciClicks > 10) {
        multipliers.style.display = "block";
        createFloatingLabel(event, "+" + scoretoText(Math.pow(multiplier, exponent), 0, false));
    }
}

luci.addEventListener("click", luciClicked);


function createFloatingLabel(event, text) {
    const x = event.clientX + window.scrollX;
    const y = event.clientY + window.scrollY;

    const labelContainer = document.createElement("div");
    labelContainer.className = "floating-label";
    labelContainer.style.left = `${x}px`;
    labelContainer.style.top = `${y}px`;

    const newLabel = document.createElement("h3");
    newLabel.textContent = text;

    document.body.appendChild(labelContainer)
    labelContainer.appendChild(newLabel);
    
    setTimeout(() => {
        labelContainer.remove();
    }, 850);
}


function scoretoText(score, decimals, isLong) {
    let suffix = "";
    let power = Math.floor(Math.log10(score) / 3);
    let displayScore = score;
    if (power > 0) {
        if (isLong) {
            suffix = formatLong[power - 1];
        }
        else {
            suffix = formatShort[power - 1];
        }
        displayScore = (score / Math.pow(10, power * 3)).toFixed(decimals);
    }

    if (!isFinite(score)) {
        multCounter.style.display = "none";
        expCounter.style.display = "none";
        return "congrats, you won...?";
    }

    return displayScore + suffix;
}


// thank u orteil
var formatLong=[' thousand',' million',' billion',' trillion',' quadrillion',' quintillion',' sextillion',' septillion',' octillion',' nonillion'];
var prefixes=['','un','duo','tre','quattuor','quin','sex','septen','octo','novem'];
var suffixes=['decillion','vigintillion','trigintillion','quadragintillion','quinquagintillion','sexagintillion','septuagintillion','octogintillion','nonagintillion'];
for (var i in suffixes)
{
	for (var ii in prefixes)
	{
		formatLong.push(' '+prefixes[ii]+suffixes[i]);
	}
}

var formatShort=['k','M','B','T','Qa','Qi','Sx','Sp','Oc','No']; 
var prefixes=['','Un','Do','Tr','Qa','Qi','Sx','Sp','Oc','No']; 
var suffixes=['D','V','T','Qa','Qi','Sx','Sp','O','N']; 
for (var i in suffixes) { 
    for (var ii in prefixes) { 
        formatShort.push(' '+prefixes[ii]+suffixes[i]); 
    } 
} 
formatShort[10]='Dc';