// main.js

// Assuming unitTypes and Army classes are accessible

const unitSelectOptions = Object.keys(unitTypes).map(unitName => `<option value="${unitName}">${unitName}</option>`).join('');

// Initialize unit selects for existing unit rows
document.querySelectorAll('.unit-select').forEach(select => {
    select.innerHTML = unitSelectOptions;
});

const simulateButton = document.getElementById('simulateButton');
const resultDiv = document.getElementById('result');

simulateButton.addEventListener('click', () => {
    // Capture player names
    const player1Name = document.getElementById('player1Name').value || 'Player 1';
    const player2Name = document.getElementById('player2Name').value || 'Player 2';

    const army1Units = {};
    document.querySelectorAll('.player1 .unit-row').forEach(row => {
        const unitName = row.querySelector('.unit-select').value;
        const count = parseInt(row.querySelector('.unit-count').value) || 0;
        if (count > 0) {
            army1Units[unitName] = (army1Units[unitName] || 0) + count;
        }
    });

    const army2Units = {};
    document.querySelectorAll('.player2 .unit-row').forEach(row => {
        const unitName = row.querySelector('.unit-select').value;
        const count = parseInt(row.querySelector('.unit-count').value) || 0;
        if (count > 0) {
            army2Units[unitName] = (army2Units[unitName] || 0) + count;
        }
    });

    const terrain = document.getElementById('terrain').value;
    const weather = document.getElementById('weather').value;

    let environmentalFactors = {
        bonusArmy1: 1.0,
        bonusArmy2: 1.0
    };

    // Terrain effects
    if (terrain === 'forest') {
        environmentalFactors.bonusArmy1 *= 1.1;
        environmentalFactors.bonusArmy2 *= 0.9;
    } else if (terrain === 'plains') {
        environmentalFactors.bonusArmy1 *= 1.0;
        environmentalFactors.bonusArmy2 *= 1.0;
    } else if (terrain === 'hills') {
        environmentalFactors.bonusArmy1 *= 0.9;
        environmentalFactors.bonusArmy2 *= 1.1;
    }

    // Weather effects
    if (weather === 'rain') {
        environmentalFactors.bonusArmy1 *= 0.9;
        environmentalFactors.bonusArmy2 *= 0.9;
    } else if (weather === 'fog') {
        environmentalFactors.bonusArmy1 *= 0.8;
        environmentalFactors.bonusArmy2 *= 0.8;
    } else if (weather === 'storm') {
        environmentalFactors.bonusArmy1 *= 0.85;
        environmentalFactors.bonusArmy2 *= 0.85;
    } else if (weather === 'snow') {
        environmentalFactors.bonusArmy1 *= 0.9;
        environmentalFactors.bonusArmy2 *= 0.9;
    }

    const army1 = new Army(army1Units);
    const army2 = new Army(army2Units);

    const result = simulateBattle(army1, army2, environmentalFactors, player1Name, player2Name);

    // Generate battle summary
    const battleSummary = generateBattleSummary(result, weather);

    // Display results including the battle summary
    resultDiv.innerHTML = `
        <h2>Battle Results</h2>
        <p><strong>Winner:</strong> ${result.winner}</p>
        <p><strong>Loser:</strong> ${result.loser}</p>
        <p><strong>Summary:</strong> ${battleSummary}</p>
        <div class="army-results">
            <h3>${result.player1Name}</h3>
            ${formatArmyResults(result.army1)}
        </div>
        <div class="army-results">
            <h3>${result.player2Name}</h3>
            ${formatArmyResults(result.army2)}
        </div>
    `;
});

function formatArmyResults(army) {
    return `
        <table>
            <thead>
                <tr>
                    <th>Unit</th>
                    <th>Start</th>
                    <th>Killed</th>
                    <th>Captured</th>
                    <th>Fled</th>
                    <th>Survived</th>
                </tr>
            </thead>
            <tbody>
                ${Object.keys(army).map(unitName => {
                    const total = army[unitName].initial || 0;
                    const killed = army[unitName].killed || 0;
                    const captured = army[unitName].captured || 0;
                    const fled = army[unitName].fled || 0;
                    const survived = army[unitName].survived || 0; // Remaining units on the battlefield

                    return `
                        <tr>
                            <td>${unitName}</td>
                            <td>${total}</td>
                            <td>${killed}</td>
                            <td>${captured}</td>
                            <td>${fled}</td>
                            <td>${survived}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function generateBattleSummary(result, weather) {
    const { winner, loser, player1Name, player2Name } = result;
    let summary = '';

    // Funny battle adjectives
    const battleAdjectives = ['epic', 'fierce', 'grueling', 'legendary', 'unforgettable'];
    const randomAdjective = battleAdjectives[Math.floor(Math.random() * battleAdjectives.length)];

    // Weather descriptions
    const weatherDescriptions = {
        'sunny': 'under the blazing sun',
        'rain': 'amidst pouring rain',
        'fog': 'shrouded in fog',
        'storm': 'during a raging storm',
        'snow': 'in a snowy battlefield',
    };

    const weatherDescription = weatherDescriptions[weather] || 'in favorable conditions';

    // Determine if the battle was devastating
    const totalUnitsStart = result.totalUnitsStart;
    const totalUnitsEnd = result.totalUnitsEnd;
    const lossPercentage = ((totalUnitsStart - totalUnitsEnd) / totalUnitsStart) * 100;
    const devastationLevel = lossPercentage > 70 ? 'devastating' : 'hard-fought';

    // Construct the summary
    if (winner === 'Draw') {
        summary = `In a ${randomAdjective} battle ${weatherDescription}, neither ${player1Name} nor ${player2Name} could claim victory. It was a stalemate with heavy losses on both sides.`;
    } else {
        summary = `${winner} triumphed over ${loser} in a ${devastationLevel} battle ${weatherDescription}. `;
        summary += `The battle will be remembered for its ${randomAdjective} clashes and heroic feats.`;
    }

    return summary;
}

// Event listeners for adding and removing units
document.getElementById('addUnitP1').addEventListener('click', () => {
    const unitRow = document.createElement('div');
    unitRow.classList.add('unit-row');
    unitRow.innerHTML = `
        <select class="unit-select input-field"></select>
        <input type="number" class="unit-count input-field" min="0" value="0">
        <button type="button" class="remove-unit">Remove</button>
    `;
    unitRow.querySelector('.unit-select').innerHTML = unitSelectOptions;
    document.querySelector('.player1 .units').appendChild(unitRow);
});

document.getElementById('addUnitP2').addEventListener('click', () => {
    const unitRow = document.createElement('div');
    unitRow.classList.add('unit-row');
    unitRow.innerHTML = `
        <select class="unit-select input-field"></select>
        <input type="number" class="unit-count input-field" min="0" value="0">
        <button type="button" class="remove-unit">Remove</button>
    `;
    unitRow.querySelector('.unit-select').innerHTML = unitSelectOptions;
    document.querySelector('.player2 .units').appendChild(unitRow);
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-unit')) {
        e.target.parentElement.remove();
    }
});
