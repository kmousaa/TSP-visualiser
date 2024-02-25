// Contains TSP algorithms 
import { permutations, getAdjacentNodes , tourWeight, sortDictionary, removeDupeDict} from "../utils/GraphUtil";
  

export const BruteForceTSP = (resetBestTour,numNodes , adjacencyMatrix, setBestTour, setBestWeight) => {
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

    // Consider the nodes we can visit
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

       
        if(i === numNodes - 2){
            // We can only consider the last node in the last step
            considered.push([start]);
        }
        else{
            considered.push(adjNodes.filter(node => !tour.includes(node)));
        }
    }

    // Add the weight of the last edge
    weight += adjacencyMatrix[`${tour[tour.length - 1]}-${start}`];
    tour.push(start);
    

    // Show the sequence of nodes in the tour
    setBestTour(tour);
    setBestWeight(weight);
    // In every step of the tour, show what nodes we considered along the way
    setConsideredStep(considered);

    // Initialise the steps to 1 in order to show the first step of simulating the algorithim
    setSteps([tour[0]]);
    setAltSteps(prevSteps => [...prevSteps, considered[0]]);
    setCurrentStep(1);

    return weight;
};



export const GreedyTSP= (resetBestTour,numNodes , adjacencyMatrix, setBestTour, setBestWeight, setSteps , setAltSteps ,setCurrentStep, setConsideredStep) => {
    resetBestTour();
    
    // Remove duplicates and sort the adjacency matrix by weight (smallest weight first)
    var adjMarixNoDupes = removeDupeDict(adjacencyMatrix);
    var sortedAdjMatrix = sortDictionary(adjMarixNoDupes);
    console.log("Sorted Adjacency Matrix: ");
    console.log(sortedAdjMatrix);

    var tour = [];
    var stop = false;

    while (!stop) {

        console.log("Tour: ");
        console.log(tour);

        console.log("sorted Adj Matrix")
        console.log(sortedAdjMatrix);

        let smallestEdge = null;
        let smallestWeight = Infinity;

        // Find the smallest edge in sortedAdjMatrix
        for (const [edge, weight] of Object.entries(sortedAdjMatrix)) {
            if (weight < smallestWeight) {
                smallestWeight = weight;
                smallestEdge = edge;
            }
        }

        if (smallestEdge) {

            // split into two nodes
            let smallNode1 = parseInt(smallestEdge.split('-')[0]);
            let smallnode2 = parseInt(smallestEdge.split('-')[1]);
            
            if (tour.length + 1 === numNodes) {
                console.log("LIT")
                console.log("NAMBER ONE: ", tour[0][0])
                console.log("NAMBER TWO: ", smallNode1)

                if (sortedAdjMatrix.length === 1){
                    const [node1, node2] = smallestEdge.split('-').map(Number);
                    tour.push([ node1, node2 ]);
                    delete sortedAdjMatrix[smallestEdge];

                    console.log("We have a valid low it but kkkkkkk");
                }
                else{
            
                    var smallNode1Count = 0;
                    var smallNode2Count = 0;
                    for (let i = 0; i < tour.length; i++) {
                        if (tour[i][0] === smallNode1) {
                            smallNode1Count++;
                        }
                    }

                    if ( smallNode1Count != 1 && smallNode2Count != 1){
                        const [node1, node2] = smallestEdge.split('-').map(Number);
                        tour.push([ node1, node2 ]);
                        delete sortedAdjMatrix[smallestEdge];

                        console.log("We have a valid low it but kkkkkkk");

                    }
                    delete sortedAdjMatrix[smallestEdge]; // This is not the node we want
                    console.log("This aint what we want pt 1");
                }

               
            }

            else{

                
                if (tour.length > 1) {

                    var smallNode1Count = 0;
                    var smallNode2Count = 0;
                    for (let i = 0; i < tour.length; i++) {
                        for (let j = 0; j < tour[i].length; j++) {
                            if (tour[i][j] === smallNode1) {
                                smallNode1Count++;
                            }
                            if (tour[i][j] === smallnode2) {
                                smallNode2Count++;
                            }
                        }
                    }

                    if ( smallNode1Count > 1 || smallNode2Count > 1){
                        delete sortedAdjMatrix[smallestEdge]; // This is not the node we want
                        console.log("This aint what we want pt 2");
                    }
                    else{
                        const [node1, node2] = smallestEdge.split('-').map(Number);
                        tour.push([ node1, node2 ]);
                        delete sortedAdjMatrix[smallestEdge];
                        console.log("This is what we want ");
                    }
                }
                else{
                    const [node1, node2] = smallestEdge.split('-').map(Number);
                    tour.push([ node1, node2 ]);
                    delete sortedAdjMatrix[smallestEdge];
                    console.log("This is what we want ");
                }
            }

        } else {
            stop = true; // Stop the loop if no smallest edge is found
        }

        if (tour.length === numNodes) {
            console.log("OIIIII");
            console.log("Tour: ");
            console.log(tour);
            console.log("node num")
            console.log(numNodes);
            stop = true; // Stop the loop if we have a valid tour
        }
    }

    console.log("Tour: ");
    console.log(tour);
    console.log("sorted Adj Matrix")
    console.log(sortedAdjMatrix);

    // Show the sequence of nodes in the tour
    setBestTour(tour);
    // setBestWeight(weight);
    // In every step of the tour, show what nodes we considered along the way
    // setConsideredStep(considered);
    // Initialise the steps to 1 in order to show the first step of simulating the algorithim
    setSteps([tour[0]]);
    // setAltSteps(prevSteps => [...prevSteps, considered[0]]);
    setCurrentStep(1);




};


