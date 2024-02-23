// Contains TSP algorithms 
import { permutations, getAdjacentNodes , tourWeight} from "../utils/GraphUtil";
  

export const bruteForceTSP = (resetBestTour,numNodes , adjacencyMatrix, setBestTour, setBestWeight) => {
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


export const NearestNeighborTSP = (resetBestTour,numNodes , adjacencyMatrix, setBestTour, setBestWeight, setSteps , setAltSteps ,setCurrentStep, setConsideredStep) => {
    resetBestTour();

    // Pick a random starting node
    var start = Math.floor(Math.random() * numNodes);
    var tour = [start];
    var weight = 0;

    var considered = [];
    var current = tour[tour.length - 1];
    var adjNodes = getAdjacentNodes(current, adjacencyMatrix)
    considered.push(adjNodes.filter(node => !tour.includes(node)));


    // Find the nearest neighbor for each node
    for (let i = 0; i < numNodes - 1; i++) {
        
        var current = tour[tour.length - 1];
        var adjNodes = getAdjacentNodes(current, adjacencyMatrix);
        var minWeight = Number.MAX_VALUE;
        var minNode = -1;
 

        // Find the nearest neighbor
        for (let j = 0; j < adjNodes.length; j++) {
            if (!tour.includes(adjNodes[j]) && adjacencyMatrix[`${current}-${adjNodes[j]}`] < minWeight) {
                minWeight = adjacencyMatrix[`${current}-${adjNodes[j]}`];
                minNode = adjNodes[j];
            }
            
        }
        weight += minWeight;
        tour.push(minNode);

       
        // if we are in 2nd last node
        if(i === numNodes - 2){
            // put back to start into concidred 
            considered.push([start]);
            
        }
        else{
            considered.push(adjNodes.filter(node => !tour.includes(node)));
        }
    }

    // Add the weight of the last edge
    weight += adjacencyMatrix[`${tour[tour.length - 1]}-${start}`];
    tour.push(start);

    var current = tour[tour.length - 1];
    var adjNodes = getAdjacentNodes(current, adjacencyMatrix)
    considered.push(adjNodes.filter(node => !tour.includes(node)));


    setConsideredStep(considered);
    setBestTour(tour);
    setBestTour(tour);
    setBestWeight(weight);
    setSteps([tour[0]]);
   
    setAltSteps(prevSteps => [...prevSteps, considered[0]]);
    setCurrentStep(1);

    return weight;
};

