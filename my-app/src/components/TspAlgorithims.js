// Contains TSP algorithms 
import { permutations, getAdjacentNodes , tourWeight, sortDictionary, removeDupeDict} from "../utils/GraphUtil";
import { Munkres } from 'munkres-js';

// Import the Munkres library


export const BruteForceTSP = (resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight) => {
    resetBestTour();
    
    let possible_tours = permutations([...Array(numNodes).keys()]); // Generate all possible tours
    let best_tour = [];
    let best_weight = Number.MAX_VALUE;

    // Find the tour with the smallest weight
    for (let i = 0; i < possible_tours.length; i++) {
        possible_tours[i].push(possible_tours[i][0]);
        const tour = possible_tours[i];
        let weight = tourWeight(tour, adjacencyMatrix);
        if (weight < best_weight) {
            best_tour = tour;
            best_weight = weight;
        }
    }
        
    setBestTour(best_tour);
    setBestWeight(best_weight);

    console.log("Total weight:", best_weight); // Log the total weight

    return best_weight; // Return the weight of the best tour
};


export const NearestNeighborTSP = (resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight, setSteps, setAltSteps, setCurrentStep, setConsideredStep) => {
    resetBestTour();

    // Pick a random starting node
    let start = Math.floor(Math.random() * numNodes);
    let tour = [start];
    let weight = 0;

    // Consider the nodes we can visit
    let considered = [];
    let current = tour[tour.length - 1];
    let adjNodes = getAdjacentNodes(current, adjacencyMatrix)
    considered.push(adjNodes.filter(node => !tour.includes(node)));


    // Find the nearest neighbor for each node
    for (let i = 0; i < numNodes - 1; i++) {
        
        let current = tour[tour.length - 1];
        let adjNodes = getAdjacentNodes(current, adjacencyMatrix);
        let minWeight = Number.MAX_VALUE;
        let minNode = -1;
 

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

    console.log("Total weight:", weight); // Log the total weight

    return weight;
};


export const GreedyTSP = (resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight, setSteps, setAltSteps, setCurrentStep, setConsideredStep, setChristofidesAlgorithim) => {

    resetBestTour();
    let considered = [];

    let tour = [];
    let weight = 0;
    let stop = false;

    // Dictionary that stores every node as well as the number of degree it has
    let degreeDict = {};
    for (let i = 0; i < numNodes; i++) {
        degreeDict[i] = 0;
    }

    // Remove duplicates from adjacency matrix
    let adjMatrixNoDupes = removeDupeDict(adjacencyMatrix);

    while (!stop) {

        // Sort the current adjacency matrix to make the smallest edge come first
        let sortedAdjMatrix = sortDictionary(adjMatrixNoDupes);
        let sortedAdjMatrixLength = Object.keys(sortedAdjMatrix).length;
        

        // If adding the last edge completes the cycle 
        if (tour.length + 1 === numNodes) {

            // Find the node that causes both edges to be 2-2 from remaining sorted edges
            for (let i = 0; i < sortedAdjMatrixLength; i++) {

                let edge = Object.keys(sortedAdjMatrix)[i];
                let nodes = edge.split('-');
                let node1 = parseInt(nodes[0]);
                let node2 = parseInt(nodes[1]);

                // Add the edge if it does not cause the degree to increase over 2
                let entry1 = degreeDict[node1];
                let entry2 = degreeDict[node2];

                if (entry1 === 1 && entry2 === 1) {
                    // That means we can add this final edge to the tour
                    tour.push([node1, node2]);
                    considered.push([node1, node2]);
                    weight += adjacencyMatrix[edge];
                    degreeDict[node1] += 1;
                    degreeDict[node2] += 1;
                    delete adjMatrixNoDupes[edge];

                    break;
                } else {

                    // This means it is not the node we want and remove it from the adjMatrixNoDupe
                    delete adjMatrixNoDupes[edge];
                }


            }
        } else {

            for (let i = 0; i < sortedAdjMatrixLength; i++) {

                // Split up the currently considered edge  {1-2: 1, 0-2: 2, 1-3: 3, 2-3: 5, 0-1: 6, …}
                let edge = Object.keys(sortedAdjMatrix)[i];
                let nodes = edge.split('-');
                let node1 = parseInt(nodes[0]);
                let node2 = parseInt(nodes[1]);

                // Add the edge if it does not cause the degree to increase over 2
                let entry1 = degreeDict[node1];
                let entry2 = degreeDict[node2];

                // This shall increase degree more than 2
                if (entry1 === 2 || entry2 === 2) {
                    // Skip that entry then - remove it from the adjMatrixNoDupe
                    delete adjMatrixNoDupes[edge];

                } else {
                    tour.push([node1, node2]);
                    weight += adjacencyMatrix[edge];
                    degreeDict[node1] += 1;
                    degreeDict[node2] += 1;
                    delete adjMatrixNoDupes[edge];

                    break;
                }

            }

        }

        // If the tour is complete, stop
        if (tour.length >= numNodes) {
            stop = true;
        }

    }

    // Ensure the tour is properly closed for odd number of vertices
    if (tour.length % 2 !== 0) {
        const lastEdge = tour[tour.length - 1];
        const firstNode = lastEdge[1];
        const secondNode = tour[0][0];
        tour.push([firstNode, secondNode]);
        weight += adjacencyMatrix[`${firstNode}-${secondNode}`];
    }

    console.log(tour);

    setBestTour(tour);
    setSteps([tour[0]]);
    setCurrentStep(1);
    
    console.log("Total weight:", weight); // Log the total weight

};





// Function to find the Minimum Spanning Tree using Prim's algorithm [Chat GPT]
const PrimsMST = (resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight, setSteps, setAltSteps, setCurrentStep, setConsideredStep) => {
    resetBestTour();

    // Initialize an empty set to store included nodes and an array to store MST edges
    const includedNodes = new Set();
    const mstEdges = [];

    // Start with an arbitrary node (0)
    let currentNode = 0;
    includedNodes.add(currentNode);

    // Dictionary that stores every node as well as the number of degree it has
    let degreeDict = {};
    for (let i = 0; i < numNodes; i++) {
        degreeDict[i] = 0;
    }

    // Continue until all nodes are included in the MST
    while (includedNodes.size < numNodes) {
        let minWeight = Infinity;
        let nextNode = null;
        let edge = null;

        // Find the minimum weight edge connecting an included node to a not-yet-included node
        for (let node of includedNodes) {
            for (let adjacentNode = 0; adjacentNode < numNodes; adjacentNode++) {
                if (!includedNodes.has(adjacentNode) && adjacencyMatrix[`${node}-${adjacentNode}`] < minWeight) {
                    minWeight = adjacencyMatrix[`${node}-${adjacentNode}`];
                    nextNode = adjacentNode;
                    edge = [node, adjacentNode];
                }
            }
        }

        // Add the next node and edge to the MST
        includedNodes.add(nextNode);
        mstEdges.push(edge);
        
        degreeDict[edge[0]] += 1;
        degreeDict[edge[1]] += 1;

        // Update the current node for the next iteration
        currentNode = nextNode;
    }

    return {mstEdges, degreeDict};
};

export const ChristofidesTSP = (resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight, setSteps, setAltSteps, setCurrentStep, setConsideredStep, setChristofidesAlgorithim) => {
    resetBestTour();

    let finalTour = [];

    // Step 1 - Find the Minimum Spanning Tree
    let mst = PrimsMST(resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight, setSteps, setAltSteps, setCurrentStep, setConsideredStep);
    console.log("MST")
    console.log(mst);
    // {mstEdges: [[0, 2], [0, 3], [3, 1]], degreeDict: Object}
    finalTour.push(mst.mstEdges);
    

    // Step 2 - Find the odd-degree nodes
    let oddDegreeNodes = [];
    for (let node in mst.degreeDict) {
        if (mst.degreeDict[node] % 2 !== 0) {
            oddDegreeNodes.push(parseInt(node));
        }
    }
    console.log("ODD DEGREE NODES");
    console.log(oddDegreeNodes);

    // finalTour.push(oddDegreeNodes);

    // Step 3 - Find the Minimum Weight Perfect Matching

    // Build adjancecy matrix for the odd degree nodes, we will find the best mmacthing from that. Remeber we have symetry in the matrix, as well as the diagonal is 0
    let oddMatrix = [];
    for (let i = 0; i < oddDegreeNodes.length; i++) {
        let row = [];
        for (let j = 0; j < oddDegreeNodes.length; j++) {
            if (i === j) {
                row.push(Infinity);
            } else {
                row.push(adjacencyMatrix[`${oddDegreeNodes[i]}-${oddDegreeNodes[j]}`]);
            }
        }
        oddMatrix.push(row);
    }

    // Find the minimum weight perfect matching
    let munkres = require('munkres-js');
    let bestMatch = munkres(oddMatrix)
    // Remove symetry from the best match for example [1,0] and [0,1] are the same, so we only need one of them
    let bestMatchNoSym = [];
    for (let i = 0; i < bestMatch.length; i++) {
        if (bestMatch[i][0] < bestMatch[i][1]) {
            bestMatchNoSym.push([oddDegreeNodes[bestMatch[i][0]], oddDegreeNodes[bestMatch[i][1]]]);
        }
    }

    console.log("Best Match");
    console.log(bestMatchNoSym);

    finalTour.push(bestMatchNoSym);



    // Step 4 - Combine the MST and the minimum weight perfect matching to form a multigraph
    let multigraph = mst.mstEdges.concat(bestMatchNoSym);

    // remove any duplicates such as [0,2] and [0,2]
    multigraph = Array.from(new Set(multigraph.map(JSON.stringify)), JSON.parse);

    console.log("Multigraph");
    console.log(multigraph);

    finalTour.push(multigraph);

    // Step 5 - Find an Eulerian Tour
    const findEulerianTour = (graph, currentVertex, eulerianTour) => {
        while (graph[currentVertex].length > 0) {
            const nextVertex = graph[currentVertex].shift();
            // Remove the corresponding edge from the graph
            graph[nextVertex].splice(graph[nextVertex].indexOf(currentVertex), 1);
            findEulerianTour(graph, nextVertex, eulerianTour);
        }
        eulerianTour.push(currentVertex);
    };



    // Construct adjacency list representation of the multigraph
    const adjacencyList = {};
    for (const [u, v] of multigraph) {
        if (!adjacencyList[u]) adjacencyList[u] = [];
        if (!adjacencyList[v]) adjacencyList[v] = [];
        adjacencyList[u].push(v);
        adjacencyList[v].push(u);
    }

    const eulerianTour = [];
    findEulerianTour(adjacencyList, multigraph[0][0], eulerianTour);
    console.log("Eulerian Tour");
    console.log(eulerianTour);

    // Step 6 - Generate the TSP tour from the Eulerian tour
    const tspTour = [];
    for (let vertex of eulerianTour) {
        if (!tspTour.includes(vertex)) {
            tspTour.push(vertex);
        }
    }

    // Add the first vertex to the end of the tour
    tspTour.push(tspTour[0]);
    console.log("TSP Tour");

    finalTour.push(tspTour);
    console.log(finalTour);

    setBestTour(finalTour);
    console.log("Final Tour", finalTour);
    setSteps([finalTour[0]]);

    
    console.log("Step", [finalTour[0]]);
    setCurrentStep(1);

    setChristofidesAlgorithim(true);
    


    console.log("Total weight:", tourWeight(tspTour, adjacencyMatrix)); // Log the total weight
};




// export const GreedyTSP= (resetBestTour,numNodes , adjacencyMatrix, setBestTour, setBestWeight, setSteps , setAltSteps ,setCurrentStep, setConsideredStep) => {
    
//     resetBestTour();
    
//     let tour = [];
//     let stop = false;

//     // Dictionary that stores every node as well as the number of degree it has
//     let degreeDict = {};
//     for (let i = 0; i < numNodes; i++) {
//         degreeDict[i] = 0;
//     }

//     // Remove duplicates from adjacency matrix
//     let adjMatrixNoDupes = removeDupeDict(adjacencyMatrix);

//     while (!stop){

//         // Sort the current adjacency matrix to make the smallest edge come first
//         let sortedAdjMatrix = sortDictionary(adjMatrixNoDupes);
//         let sortedAdjMatrixLength =  Object.keys(sortedAdjMatrix).length;
        
//         // If adding the last edge completes the cycle 
//         if (tour.length + 1 === numNodes){

//             // Find the node that causes both edges to be 2-2 from remaining sorted edges
//             for (let i = 0; i < sortedAdjMatrixLength; i++) {

//                 let edge = Object.keys(sortedAdjMatrix)[i];
//                 let nodes = edge.split('-');
//                 let node1 = parseInt(nodes[0]);
//                 let node2 = parseInt(nodes[1]);
            
//                 // Add the edge if it does not cause the degree to increase over 2
//                 let entry1 = degreeDict[node1];
//                 let entry2 = degreeDict[node2];
            
    
//                 if (entry1 === 1 && entry2 === 1) {
//                     // That means we can add this final edge to the tour
//                     tour.push([node1,node2]);
//                     degreeDict[node1] += 1;
//                     degreeDict[node2] += 1;
//                     delete adjMatrixNoDupes[edge];

//                     break;
//                 }
//                 else{

//                     // This means it is not the node we want and remove it from the adjMatrixNoDupe
//                     delete adjMatrixNoDupes[edge];
//                 }
                
                
//             }           
//         }
//         else{

//             for (let i = 0; i < sortedAdjMatrixLength; i++) {
                
//                 // Split up the currently considered edge  {1-2: 1, 0-2: 2, 1-3: 3, 2-3: 5, 0-1: 6, …}
//                 let edge = Object.keys(sortedAdjMatrix)[i];
//                 let nodes = edge.split('-');
//                 let node1 = parseInt(nodes[0]);
//                 let node2 = parseInt(nodes[1]);
            
//                 // Add the edge if it does not cause the degree to increase over 2
//                 let entry1 = degreeDict[node1];
//                 let entry2 = degreeDict[node2];
            
//                 // This shall increase degree more than 2
//                 if (entry1 === 2 || entry2 === 2) {
//                     // Skip that entry then - remove it from the adjMatrixNoDupe
//                     delete adjMatrixNoDupes[edge];

//                 }
//                 else{
//                     tour.push([node1,node2]);
//                     degreeDict[node1] += 1;
//                     degreeDict[node2] += 1;
//                     delete adjMatrixNoDupes[edge];
         
//                     break;
//                 }
                
//             }

//         }

//         // If the tour is complete, stop
//         if (tour.length === numNodes){
//             stop = true;
//         }

//     }
//     console.log(tour);

//     setBestTour(tour);
//     setSteps([tour[0]]);
//     setCurrentStep(1);

// };

