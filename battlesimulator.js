// battleSimulator.js

class Unit {
    constructor(name, attack, health, supplyLevel, speed) {
        this.name = name;
        this.attack = attack;
        this.health = health;
        this.supplyLevel = supplyLevel;
        this.baseMorale = this.initialMorale();
        this.speed = speed;
    }

    initialMorale() {
        switch (this.supplyLevel) {
            case 'high':
                return 1.0;
            case 'normal':
                return 0.8;
            case 'low':
                return 0.6;
            default:
                return 0.8;
        }
    }
}

const unitTypes = {
    'Peasant': new Unit('Peasant', 5, 50, 'low', 2),
    'Knight': new Unit('Knight', 20, 150, 'high', 4),
    'Foot Soldier': new Unit('Foot Soldier', 10, 100, 'normal', 3)
};

class Army {
    constructor(units) {
        this.units = JSON.parse(JSON.stringify(units)); // Create a copy
        this.initialUnits = JSON.parse(JSON.stringify(units)); // For initial count per unit type
        this.totalUnits = this.getTotalUnits();
        this.morale = 1.0;
        this.capturedUnits = {};
        this.killedUnits = {};
        this.fledUnits = {};
    }

    getTotalAttack() {
        let totalAttack = 0;
        for (let unitName in this.units) {
            let unit = unitTypes[unitName];
            let count = this.units[unitName];
            totalAttack += unit.attack * count * unit.baseMorale * this.morale;
        }
        return totalAttack;
    }

    getTotalHealth() {
        let totalHealth = 0;
        for (let unitName in this.units) {
            let unit = unitTypes[unitName];
            let count = this.units[unitName];
            totalHealth += unit.health * count;
        }
        return totalHealth;
    }

    getTotalUnits() {
        let total = 0;
        for (let unitName in this.units) {
            total += this.units[unitName];
        }
        return total;
    }

    adjustMorale(lossPercentage) {
        if (lossPercentage > 0.3) {
            this.morale -= 0.2;
        } else if (lossPercentage > 0.1) {
            this.morale -= 0.1;
        }

        if (this.morale < 0.1) {
            this.morale = 0.1;
        }
    }

    applyCasualties(casualties) {
        for (let unitName in casualties) {
            let lost = casualties[unitName];
            this.units[unitName] -= lost;

            if (!this.killedUnits[unitName]) this.killedUnits[unitName] = 0;
            this.killedUnits[unitName] += lost;

            if (this.units[unitName] < 0) this.units[unitName] = 0;
        }
    }

    handleRetreat() {
        for (let unitName in this.units) {
            let count = this.units[unitName];
            let unit = unitTypes[unitName];

            let captureProbability = (5 - unit.speed) / 5;

            let unitsCaptured = Math.floor(count * captureProbability * Math.random());
            if (unitsCaptured > count) unitsCaptured = count;

            if (!this.capturedUnits[unitName]) this.capturedUnits[unitName] = 0;
            this.capturedUnits[unitName] += unitsCaptured;

            let unitsFled = count - unitsCaptured;

            if (!this.fledUnits[unitName]) this.fledUnits[unitName] = 0;
            this.fledUnits[unitName] += unitsFled;

            // Remove units from the army
            this.units[unitName] = 0;
        }
    }

    isRouted() {
        return this.morale <= 0.3 || this.getTotalUnits() <= this.totalUnits * 0.3;
    }
}

function simulateBattle(army1, army2, environmentalFactors, player1Name, player2Name) {
    army1.morale = 1.0;
    army2.morale = 1.0;

    let round = 1;
    const maxRounds = 10;

    while (round <= maxRounds) {
        let attack1 = army1.getTotalAttack() * (environmentalFactors.bonusArmy1 || 1);
        let attack2 = army2.getTotalAttack() * (environmentalFactors.bonusArmy2 || 1);

        attack1 *= Math.random() * 0.2 + 0.9;
        attack2 *= Math.random() * 0.2 + 0.9;

        let casualties1 = calculateCasualties(army1, attack2);
        let casualties2 = calculateCasualties(army2, attack1);

        army1.applyCasualties(casualties1);
        army2.applyCasualties(casualties2);

        let lossPercentage1 = sumObjectValues(casualties1) / army1.totalUnits;
        let lossPercentage2 = sumObjectValues(casualties2) / army2.totalUnits;

        army1.adjustMorale(lossPercentage1);
        army2.adjustMorale(lossPercentage2);

        if (army1.isRouted() || army2.isRouted()) {
            break;
        }

        round++;
    }

    let winner, loser;
    let winningArmy, losingArmy;

    if (army1.isRouted() && army2.isRouted()) {
        winner = 'Draw';
        loser = 'Draw';
    } else if (army1.isRouted()) {
        winner = player2Name;
        loser = player1Name;
        winningArmy = army2;
        losingArmy = army1;
    } else if (army2.isRouted()) {
        winner = player1Name;
        loser = player2Name;
        winningArmy = army1;
        losingArmy = army2;
    } else {
        if (army1.getTotalUnits() > army2.getTotalUnits()) {
            winner = player1Name;
            loser = player2Name;
            winningArmy = army1;
            losingArmy = army2;
        } else if (army2.getTotalUnits() > army1.getTotalUnits()) {
            winner = player2Name;
            loser = player1Name;
            winningArmy = army2;
            losingArmy = army1;
        } else {
            winner = 'Draw';
            loser = 'Draw';
        }
    }

    if (losingArmy) {
        losingArmy.handleRetreat();
    }

    return {
        winner,
        loser,
        player1Name,
        player2Name,
        army1: compileArmyResults(army1),
        army2: compileArmyResults(army2),
        totalUnitsStart: army1.totalUnits + army2.totalUnits,
        totalUnitsEnd: army1.getTotalUnits() + army2.getTotalUnits(),
    };
}

function compileArmyResults(army) {
    let results = {};
    for (let unitName in army.initialUnits) {
        let initial = army.initialUnits[unitName] || 0;
        let killed = army.killedUnits[unitName] || 0;
        let captured = army.capturedUnits[unitName] || 0;
        let fled = army.fledUnits[unitName] || 0;
        let remaining = army.units[unitName] || 0;
        let survived = remaining; // Units remaining on the battlefield

        results[unitName] = {
            initial,
            killed,
            captured,
            fled,
            survived
        };
    }
    return results;
}

function calculateCasualties(army, incomingAttack) {
    let casualties = {};
    let totalHealth = army.getTotalHealth();

    for (let unitName in army.units) {
        let unit = unitTypes[unitName];
        let count = army.units[unitName];
        let unitHealth = unit.health * count;

        let damageShare = unitHealth / totalHealth;
        let unitDamage = incomingAttack * damageShare;

        let unitsLost = Math.floor(unitDamage / unit.health);
        if (unitsLost > count) unitsLost = count;

        casualties[unitName] = unitsLost;
    }

    return casualties;
}

function sumObjectValues(obj) {
    return Object.values(obj).reduce((a, b) => a + b, 0);
}

