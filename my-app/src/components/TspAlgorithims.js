// Contains TSP algorithms 
import { permutations, getAdjacentNodes, getDegree } from "../utils/GraphUtil";

  
// Fix up the 0 weighted stuff
export const bruteForceTSP = (resetBestTour,numNodes , tourWeight, adjacencyMatrix, setBestTour, setBestWeight) => {
    resetBestTour();
    
    var possible_tours = permutations([...Array(numNodes).keys()]); // Generate all possible tours
    var best_tour = [];
    var best_weight = Number.MAX_VALUE;

    // Find the tour with the smallest weight
    for (let i = 0; i < possible_tours.length; i++) {
        possible_tours[i].push(possible_tours[i][0]);
        const tour = possible_tours[i];
        var weight = tourWeight(tour, adjacencyMatrix);
        if (weight < best_weight) {
        best_tour = tour;
        best_weight = weight;
        }
    }

    setBestTour(best_tour);
    setBestWeight(best_weight);
    return best_weight; // Return the weight of the best tour
};


// NOT WORKING
export const NearestNeighborTSP = (resetBestTour,numNodes , tourWeight, adjacencyMatrix, setBestTour, setBestWeight) => {
    resetBestTour();
    
    // Initialize variables
    var visited = new Array(numNodes).fill(false);
    var tour = [];

    // Randomly select a starting vertex
    const starting_vertex = Math.floor(Math.random() * numNodes);
    let current_vertex = Math.floor(Math.random() * numNodes); 
    console.log("starting_vertex",starting_vertex);
    tour.push(starting_vertex);

    // Repeat until all nodes are visited
    while (visited.includes(false)) {
        const adjacentNodes = getAdjacentNodes(current_vertex, adjacencyMatrix);

        
        // add closest node to tour
        let closestNode = -1;
        let closestDistance = Number.MAX_VALUE;

        for (let i = 0; i < adjacentNodes.length; i++) {
            if (!visited[adjacentNodes[i]] && adjacencyMatrix[`${current_vertex}-${adjacentNodes[i]}`] < closestDistance) {
                // Can't complete cycle (go to start) until all nodes are visited
                closestNode = adjacentNodes[i];

                console.log("closestNode ",closestNode + " =?= " + starting_vertex );

                if (closestNode === starting_vertex && visited.includes(false) ){
                    console.log("NOT OVER YET")
                    closestDistance = Number.MAX_VALUE;
                }

                else{
                    closestDistance = adjacencyMatrix[`${current_vertex}-${adjacentNodes[i]}`];
                }
                
            }
        }

        // Mark the closest node as visited and add it to the tour
        tour.push(closestNode);
        console.log("tour",tour);
        visited[closestNode] = true;
        current_vertex = closestNode;
    }
    // Add the starting vertex to the end of the tour
    tour.push(tour[0]);
    console.log("final tour",tour);

    // Set the best tour and weight
    setBestTour(tour);
    setBestWeight(tourWeight(tour, adjacencyMatrix));

    // Return the weight of the tour
    return tourWeight(tour, adjacencyMatrix);

};
