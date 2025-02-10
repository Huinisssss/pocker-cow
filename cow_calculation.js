let values = [];
let result = null;

function addValue(val) {
    if (values.length < 5) {
        values.push(val);
        updateDisplay();
    }
}

function removeLast() {
    values.pop();
    result = null;
    updateDisplay();
}

function refreshBoxes() {
    values = [];
    result = null;
    updateDisplay();
}

function updateDisplay() {
    document.querySelectorAll('.box').forEach((box, index) => {
        box.innerHTML = values[index] ? values[index] : "<img src='poker_card.png' alt='Card'>";
    });

    // Perform calculation only when 5 cards are entered
    if (values.length === 5) {
        calculateCows();

    } else {
        document.getElementById('result').textContent = "🐮";
        document.getElementById('calculationResult').innerText = "";
        document.getElementById('calculationResult').style.display = "none";
    }
}

function getTriplets(arr) {
    let triplets = new Set(); // Use a Set to store unique triplets
    let swapMap = { 3: 6, 6: 3 }; // Define swap rules

    for (let i = 0; i < arr.length - 2; i++) {
        for (let j = i + 1; j < arr.length - 1; j++) {
            for (let k = j + 1; k < arr.length; k++) {
                let triplet = [arr[i], arr[j], arr[k]];
                let uniqueTriplets = new Set();

                // Add the original triplet
                uniqueTriplets.add(JSON.stringify(triplet.sort((a, b) => a - b)));

                // Generate swapped versions
                for (let idx = 0; idx < 3; idx++) {
                    if (triplet[idx] in swapMap) {
                        let swapped = [...triplet];
                        swapped[idx] = swapMap[triplet[idx]];
                        uniqueTriplets.add(JSON.stringify(swapped.sort((a, b) => a - b)));

                        // If more than one swappable number, swap the other one too
                        for (let idx2 = idx + 1; idx2 < 3; idx2++) {
                            if (triplet[idx2] in swapMap) {
                                let doubleSwapped = [...swapped];
                                doubleSwapped[idx2] = swapMap[triplet[idx2]];
                                uniqueTriplets.add(JSON.stringify(doubleSwapped.sort((a, b) => a - b)));
                            }
                        }
                    }
                }

                // Add unique swapped triplets to the final Set
                uniqueTriplets.forEach(trip => triplets.add(trip));
            }
        }
    }

    // Convert back to array before returning
    return Array.from(triplets).map(JSON.parse);
}

function checkCowCondition(triplets) {
    let cowBaseCombination = [];
    for (let triplet of triplets) {
        let sum = triplet.reduce((a, b) => a + b, 0);
        if (sum == 10 || sum == 20 || sum == 30) {
            cowBaseCombination.push(triplet)
        }
    }
    return cowBaseCombination;
}

function swapNumbers(subset, fullSetCount) {
    let subsetCount = { 3: 0, 6: 0 };
    subset.forEach(num => {
        if (num === 3) subsetCount[3]++;
        if (num === 6) subsetCount[6]++;
    });

    let modifiedSubset = [...subset];

    // Swap extra 6s to 3 if subset has more 6s than fullSet
    if (subsetCount[6] > fullSetCount[6]) {
        let excess = subsetCount[6] - fullSetCount[6];
        for (let i = 0; i < modifiedSubset.length && excess > 0; i++) {
            if (modifiedSubset[i] === 6) {
                modifiedSubset[i] = 3;
                excess--;
            }
        }
    }

    // Swap extra 3s to 6 if subset has more 3s than fullSet
    if (subsetCount[3] > fullSetCount[3]) {
        let excess = subsetCount[3] - fullSetCount[3];
        for (let i = 0; i < modifiedSubset.length && excess > 0; i++) {
            if (modifiedSubset[i] === 3) {
                modifiedSubset[i] = 6;
                excess--;
            }
        }
    }

    // If subset contains 6 but fullSet has 0, swap all 6s to 3
    if (fullSetCount[6] === 0) {
        modifiedSubset = modifiedSubset.map(num => (num === 6 ? 3 : num));
    }

    // If subset contains 3 but fullSet has 0, swap all 3s to 6
    if (fullSetCount[3] === 0) {
        modifiedSubset = modifiedSubset.map(num => (num === 3 ? 6 : num));
    }

    return modifiedSubset;
}

function getCowCombinations(fullSet, subsets) {
    let results = [];

    // Count occurrences of 3 and 6 in the fullSet
    let fullSetCount = { 3: 0, 6: 0 };
    fullSet.forEach(num => {
        if (num === 3) fullSetCount[3]++;
        if (num === 6) fullSetCount[6]++;
    });

    subsets.forEach(subset => {

        let modifiedSubset = swapNumbers(subset, fullSetCount);
        console.log('modifiedSubset', modifiedSubset)

        // Create a copy of fullSet to modify
        let remaining = [...fullSet];

        // Remove elements found in modifiedSubset (accounting for duplicates)
        modifiedSubset.forEach(num => {
            let index = remaining.indexOf(num);
            if (index !== -1) {
                remaining.splice(index, 1); // Remove only one occurrence
            }
        });

        // Check if both remaining numbers are the same
        let isSame = remaining.length === 2 && remaining[0] === remaining[1];

        // Generate all possible swaps
        let combinations = new Set();
        function generateSwaps(arr, index) {
            if (index === arr.length) {
                let sortedArr = [...arr].sort();
                combinations.add(JSON.stringify(sortedArr)); // Store as string to avoid duplicates
                return;
            }

            if (arr[index] === 3 || arr[index] === 6) {
                let swappedArr = [...arr];
                swappedArr[index] = arr[index] === 3 ? 6 : 3;
                generateSwaps(swappedArr, index + 1);
            }

            generateSwaps(arr, index + 1);
        }

        generateSwaps(remaining, 0);

        // Add all unique combinations to results
        combinations.forEach(comb => {
            results.push({ cowBase: modifiedSubset, cowRemaining: JSON.parse(comb), isSame });
        });
    });

    return results;
}

function getLargestCowNumber(cowCombination) {
    let maxLastDigit = 0;
    let maxCombination = null;

    cowCombination.forEach(combination => {
        let sum = combination.cowRemaining.reduce((acc, num) => acc + num, 0);
        let lastDigit;
        if (sum == 10) {
            lastDigit = 10; // Get last digit
        } else {
            lastDigit = sum % 10; // Get last digit
        }

        if (lastDigit > maxLastDigit) {
            maxLastDigit = lastDigit;
            maxCombination = combination;
        }
    });

    return { maxLastDigit, maxCombination };
}


function calculateCows() {
    let resultDisplayText;

    // 1. Convert face cards (A=1, J=10, Q=10, K=10)
    let cardValues = values.map(val => {
        if (val === 'A') return 1;
        if (val === 'J' || val === 'Q' || val === 'K') return 10;
        return parseInt(val, 10);
    });

    // 2. Generate triplets from all possible variations with 3↔6 swaps
    let triplets = getTriplets(cardValues); // (10 combination)
    console.log('Triplets', triplets);

    // 3. Check if cow exist (a + b + c = 10 || 20 || 30)
    let cowBaseCombination = checkCowCondition(triplets);
    console.log('cowBaseCombination', cowBaseCombination)
    if (cowBaseCombination.length == 0) {
        document.getElementById('result').textContent = "🤡  No 🐮";
        return
    }

    // 4. Get all possible combination with 3↔6 swaps (5 numbers)
    let cowCombination = getCowCombinations(cardValues, cowBaseCombination);
    console.log('Cow Combination', cowCombination)

    // 5. Check if there is double number
    // let maxSameCow = null;
    cowCombination.forEach(combination => {
        if (combination.isSame) {
            // Track the largest cowRemaining[0]
            if (result === null || combination.cowRemaining[0] > result.cowRemaining[0]) {
                result = combination;
            }
        }
    });
    console.log("result", result)

    // If there's a "same" cow, display the largest one
    if (result !== null) {

        // Special case: when maxSameCow is 10 
        if (result.cowRemaining[0] == 10) {
            const targetCards = new Set(["K", "J", "Q", "10"]);
            const count = {};

            // Count occurrences of target cards
            for (const card of values) {
                count[card] = (count[card] || 0) + 1;
            }

            // Check for doubles
            for (const card of targetCards) {
                if (count[card] >= 2) {
                    result.cowRemaining[0] = card;
                    result.cowRemaining[1] = card;
                    resultDisplayText = "Double " + card + " 🐮";
                }
            }

            // If no double found, show the cowRemaining[0] value
            if (!resultDisplayText) resultDisplayText = result.cowRemaining[0] + " 🐮";
        } else {
            resultDisplayText = "Double " + result.cowRemaining[0] + " 🐮";
        }
    } else {
        // 6. Calculate the largest cow number
        let largestCowNumber = getLargestCowNumber(cowCombination);
        result = largestCowNumber;
        console.log('Largest Cow Number', largestCowNumber);
        resultDisplayText = result.maxLastDigit + " 🐮";
    }

    // 7. Display Calculation Result
    document.getElementById('result').textContent = resultDisplayText;
    let calResult = document.getElementById("calculationResult");
    calResult.textContent = 'Result'
    calResult.style.display = (calResult.style.display === "none" || calResult.style.display === "") ? "block" : "none";
}

function toggleResult() {
    let calResult = document.getElementById("calculationResult");
    if (calResult.textContent === "Result") {
        calResult.textContent = "Cow Base: " + (result.cowBase ?? result.maxCombination.cowBase);
    } else {
        calResult.textContent = "Result";
    }
}
