// Contains TSP algorithms 
import { permutations } from "../utils/GraphUtil";


// Fix up the 0 weighted stuff
export const bruteForceTSP = (resetBestTour,numNodes , tourWeight, adjacencyMatrix, setBestTour, setBestWeight) => {
    resetBestTour();
    var possible_tours = permutations([...Array(numNodes).keys()]);
    var best_tour = [];
    var best_weight = Number.MAX_VALUE;
    for (let i = 0; i < possible_tours.length; i++) {
        possible_tours[i].push(possible_tours[i][0]);
        const tour = possible_tours[i];
        var weight = tourWeight(tour, adjacencyMatrix);
        if (weight < best_weight) {
        best_tour = tour;
        best_weight = weight;
        }
    }
    console.log("Best Tour: " + best_tour + " Weight: " + best_weight);
    setBestTour(best_tour);
    setBestWeight(best_weight);
    return best_weight; // Return the weight of the best tour
};
    