let diceCount = 10;

const diceNumEl = document.getElementById('diceNum');
const decreaseBtn = document.getElementById('decrease');
const increaseBtn = document.getElementById('increase');
const rollBtn = document.getElementById('rollBtn');
const resultsEl = document.getElementById('results');
const diceDisplayEl = document.getElementById('diceDisplay');
const raisesDisplayEl = document.getElementById('raisesDisplay');
const raiseCountEl = document.getElementById('raiseCount');
const traitorsSectionEl = document.getElementById('traitorsSection');
const traitorsDisplayEl = document.getElementById('traitorsDisplay');

decreaseBtn.addEventListener('click', () => {
    if (diceCount > 1) {
        diceCount--;
        diceNumEl.textContent = diceCount;
    }
});

increaseBtn.addEventListener('click', () => {
    if (diceCount < 30) {
        diceCount++;
        diceNumEl.textContent = diceCount;
    }
});

rollBtn.addEventListener('click', rollDice);

function roll_d10() {
    return Math.floor(Math.random() * 10) + 1;
}

function bestFitGrouping(dice) {
    dice = [...dice].sort((a, b) => b - a);

    let bestGroup = null;
    let bestOverflow = null;

    for (let r = 1; r <= dice.length; r++) {
        const combos = getCombinations(dice, r);
        for (const combo of combos) {
            const total = combo.reduce((a, b) => a + b, 0);
            if (total >= 10) {
                const overflow = total - 10;
                if (bestGroup === null || overflow < bestOverflow) {
                    bestGroup = combo;
                    bestOverflow = overflow;
                }
                if (overflow === 0) break;
            }
        }
        if (bestOverflow === 0) break;
    }

    if (bestGroup === null) return [null, dice];

    const remaining = [...dice];
    for (const val of bestGroup) {
        const idx = remaining.indexOf(val);
        if (idx > -1) remaining.splice(idx, 1);
    }

    return [bestGroup, remaining];
}

function getCombinations(arr, r) {
    if (r === 1) return arr.map(x => [x]);
    if (r === arr.length) return [arr];

    const result = [];
    for (let i = 0; i <= arr.length - r; i++) {
        const head = arr[i];
        const tailCombos = getCombinations(arr.slice(i + 1), r - 1);
        for (const combo of tailCombos) {
            result.push([head, ...combo]);
        }
    }
    return result;
}

function rollDice() {
    const dice = Array.from({ length: diceCount }, roll_d10);

    diceDisplayEl.innerHTML = dice.map(d => 
        `<div class="die">${d}</div>`
    ).join('');

    const groups = [];
    let remaining = [...dice];

    while (true) {
        const [group, newRemaining] = bestFitGrouping(remaining);
        if (group === null) break;
        groups.push(group);
        remaining = newRemaining;
    }

    raiseCountEl.textContent = groups.length;

    if (groups.length > 0) {
        raisesDisplayEl.innerHTML = groups.map(g => {
            const total = g.reduce((a, b) => a + b, 0);
            return `
                <div class="raise-group">
                    <div class="raise-dice">
                        ${g.map(d => `<span>${d}</span>`).join('')}
                    </div>
                    <span class="raise-total">= ${total}</span>
                </div>
            `;
        }).join('');
    } else {
        raisesDisplayEl.innerHTML = '<p style="color: #8892b0;">No raises generated</p>';
    }

    if (remaining.length > 0) {
        traitorsSectionEl.classList.remove('hidden');
        traitorsDisplayEl.innerHTML = remaining.map(d => 
            `<span>${d}</span>`
        ).join('');
    } else {
        traitorsSectionEl.classList.add('hidden');
    }

    resultsEl.classList.remove('hidden');
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
