// TspSolver.js

// From: https://www.30secondsofcode.org/js/s/array-permutations/
const permutations = arr => {
    if (arr.length <= 2) return arr.length === 2 ? [arr, [arr[1], arr[0]]] : arr;
    return arr.reduce(
        (acc, item, i) =>
        acc.concat(
            permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map(val => [
            item,
            ...val,
            ])
        ),
        []
    );
    };
    
export const bruteForceTSP = (numNodes, tourWeight) => {
    var possible_tours = permutations([...Array(numNodes).keys()]);
    var best_tour = [];
    var best_weight = Number.MAX_VALUE;
    for (let i = 0; i < possible_tours.length; i++) {
        possible_tours[i].push(possible_tours[i][0]);
        const tour = possible_tours[i];
        var weight = tourWeight(tour);
        if (weight < best_weight) {
        best_tour = tour;
        best_weight = weight;
        }
    }
    console.log("Best Tour: " + best_tour + " Weight: " + best_weight);
    return best_weight; // Return the weight of the best tour
    };