// Contains TSP algorithms 
import { permutations, getAdjacentNodes , tourWeight, sortDictionary, removeDupeDict} from "../utils/GraphUtil";



export const BruteForceTSP = (resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight) => {
    resetBestTour();
    
    let possible_tours = permutations([...Array(numNodes).keys()]);  // returns all permutations of the tour
    let best_weight = Number.MAX_VALUE;  
    let intermediate_tours = []; // Stores all the tours with the same weight as the best tour


    for (let i = 0; i < possible_tours.length; i++) {
        possible_tours[i].push(possible_tours[i][0]);
        const tour = possible_tours[i];
        let weight = tourWeight(tour, adjacencyMatrix);
        if (weight < best_weight) {
            best_weight = weight;
        }
        intermediate_tours.push(tour);
    }

    // Remove identiacal tours with same weight inside the intermediate tours
    let filteredTours = [];
    let seenWeights = new Set(); // Keep track of seen weights

    for (let tour of intermediate_tours) {
        let weight = tourWeight(tour, adjacencyMatrix);
        if (!seenWeights.has(weight)) {
            seenWeights.add(weight);
            filteredTours.push(tour);
        }
    }
    intermediate_tours = filteredTours;

    // Mix up the intermediate tours order
    intermediate_tours = intermediate_tours.sort(() => Math.random() - 0.5);
        
    // loop through the intermediate tours and find a tour with the same weight as the best tour
    let index = 0;
    for (let i = 0; i < intermediate_tours.length; i++) {
        let weight = tourWeight(intermediate_tours[i], adjacencyMatrix);
        if (weight === best_weight) {
            index = i;
            break;
        }
    }

    if (best_weight >= Number.MAX_VALUE) {
        return;
    }

    // Remove after the best tour in intermediate tours
    intermediate_tours = intermediate_tours.slice(0, index + 1);

    // Set the best tour and weight
    setBestTour(intermediate_tours);
    setBestWeight(best_weight);

    // Metadata
    return best_weight; 
};


export const NearestNeighborTSP = (resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight, setSteps, setAltSteps, setCurrentStep, setConsideredSteps, setChristofidesAlgorithim, startNode) => {
    resetBestTour();

    // Pick a random starting node (unless we are in interactive mode, in which case the user picks the starting node)
    let start = startNode ?  startNode : Math.floor(Math.random() * numNodes) ;
    let tour = [start];
    let weight = 0;

    // Consider the possible next nodes we can visit
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

        // Find the nearest neighbor for a node
        for (let j = 0; j < adjNodes.length; j++) {
            if (!tour.includes(adjNodes[j]) && adjacencyMatrix[`${current}-${adjNodes[j]}`] < minWeight) {
                minWeight = adjacencyMatrix[`${current}-${adjNodes[j]}`];
                minNode = adjNodes[j];
            }   
        }
        weight += minWeight;
        tour.push(minNode);

        // We can only consider the last node in the last step
        if(i === numNodes - 2){
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
    setConsideredSteps(considered);

    // Metadata
    return {considered, weight, tour};
};


export const GreedyTSP = (resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight) => {
    resetBestTour();
    let tour = [];
    let adjacencyMatrixNoDupes = removeDupeDict(adjacencyMatrix);
    let sortedAdjacencyMatrix = sortDictionary(adjacencyMatrixNoDupes);
    let degreeDict = {};
    let weight = 0;

    for (let i = 0; i < numNodes; i++) {
        degreeDict[i] = 0;
    }

    // loop until we have all the nodes in the tour
    while (tour.length < numNodes) {

        // Get the first edge from the sorted adjacency matrix
        let edge = Object.keys(sortedAdjacencyMatrix)[0];
        if (!edge) {
            return;
        }
        let nodes = edge.split('-');
        let node1 = parseInt(nodes[0]);
        let node2 = parseInt(nodes[1]);

        // if we are adding the last edge to the tour
        if (tour.length + 1 === numNodes && hasCycle(tour, [node1, node2]) && degreeDict[node1] < 2 && degreeDict[node2] < 2) {
            // Add the last edge to the tour
            tour.push([node1, node2]);
            degreeDict[node1] += 1;
            degreeDict[node2] += 1;
            weight += adjacencyMatrix[`${node1}-${node2}`];
        }

        // If adding the edge does not create a cycle, add it to the tour
        if (!hasCycle(tour, [node1, node2]) && degreeDict[node1] < 2 && degreeDict[node2] < 2) {
            tour.push([node1, node2]);
            degreeDict[node1] += 1;
            degreeDict[node2] += 1;
            weight += adjacencyMatrix[`${node1}-${node2}`];
        }

        // Remove the edge from the sorted adjacency matrix
        delete sortedAdjacencyMatrix[edge];

    }

    // Show the sequence of nodes in the tour
    setBestTour(tour);
    setBestWeight(weight);

    // Metadata
    return degreeDict;

};


// Function that checks if adding a new edge to the graph creates a cycle 
export const hasCycle = (graph, newNode) => {
    const adjacencyList = {};
    
    // Construct adjacency list
    for (let [node1, node2] of graph) {
        if (!adjacencyList[node1]) adjacencyList[node1] = [];
        if (!adjacencyList[node2]) adjacencyList[node2] = [];
        adjacencyList[node1].push(node2);
        adjacencyList[node2].push(node1);
    }
    
    const visited = {};
    
    function dfs(node, parent) {
        visited[node] = true;
        for (let neighbor of adjacencyList[node]) {
            if (!visited[neighbor]) {
                if (dfs(neighbor, node)) return true;
            } else if (neighbor !== parent) {
                return true;
            }
        }
        return false;
    }
    
    // Check if adding the new edge creates a cycle
    const [node1, node2] = newNode;
    if (!adjacencyList[node1]) adjacencyList[node1] = [];
    if (!adjacencyList[node2]) adjacencyList[node2] = [];
    adjacencyList[node1].push(node2);
    adjacencyList[node2].push(node1);
    if (dfs(node1, null)) {
        adjacencyList[node1].pop();
        adjacencyList[node2].pop();
        return true;
    }
    adjacencyList[node1].pop();
    adjacencyList[node2].pop();
    return false;
}




// Function to find the Minimum Spanning Tree using Prim's algorithm 
const PrimsMST = (resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight, setSteps, setAltSteps, setCurrentStep, setConsideredSteps, setChristofidesAlgorithim) => {
    resetBestTour();

    // Initialize an empty set to store included nodes and an array to store MST edges
    const includedNodes = new Set();
    const mstEdges = [];

    // Start with an arbitrary node 
    let currentNode = Math.floor(Math.random() * numNodes);
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

        if (!edge){
            return;
        }

        
        degreeDict[edge[0]] += 1;
        degreeDict[edge[1]] += 1

        // Update the current node for the next iteration
        currentNode = nextNode;
    }

    return {mstEdges, degreeDict};
};



export const ChristofidesTSP = (resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight, setSteps, setAltSteps, setCurrentStep, setConsideredSteps, setChristofidesAlgorithim, mstOverwrite, bestPairOverwrite) => {
    resetBestTour();

    // Final Tour will be an array of arrays, each array will represent a step in the algorithm
    let finalTour = [];

    // Step 1 - Find the Minimum Spanning Tree
    let mst = PrimsMST(resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight, setSteps, setAltSteps, setCurrentStep, setConsideredSteps);
    if (!mst) {
        return;
    }

    // Overwrite the mst if user defined
    if (mstOverwrite) {
        mst.mstEdges = mstOverwrite;

        // build new degree dictionary based on edges from mstOverwrite
        let degreeDict = {};
        for (let i = 0; i < numNodes; i++) {
            degreeDict[i] = 0;
        }
        for (let edge of mstOverwrite) {
            degreeDict[edge[0]] += 1;
            degreeDict[edge[1]] += 1;
        }
        mst.degreeDict = degreeDict;
        
    }
    finalTour.push(mst.mstEdges);
    

    // Step 2 - Find the odd-degree nodes
    let oddDegreeNodes = [];
    for (let node in mst.degreeDict) {
        if (mst.degreeDict[node] % 2 !== 0) {
            oddDegreeNodes.push(parseInt(node));
        }
    }


    // Step 3 - Find the Minimum Weight Perfect Matching of the odd-degree nodes

    // Build adjacency matrix for the odd degree nodes, we will find the best matching from that. Remember we have symmetry in the matrix, as well as the diagonal is 0
    let oddMatrix = [];
    for (let i = 0; i < oddDegreeNodes.length; i++) {
        let row = [];
        for (let j = 0; j < oddDegreeNodes.length; j++) {
            if (i === j) {
                row.push(Infinity);
            } else {
                // Slight perturbation to ensure determinism in case of equal weights
                let weight = adjacencyMatrix[`${oddDegreeNodes[i]}-${oddDegreeNodes[j]}`];
                let tieBreaker = 1e-10 * (i + j); 
                row.push(weight + tieBreaker);
            }
        }
        oddMatrix.push(row);
    }


    // Using the Munkres algorithm to find the best matching for odd nodes:
    // The Munkres algorithm (also known as the Hungarian algorithm) is utilized here to find the best way to match the odd nodes in a graph, ensuring the minimum total weight.
    let munkres1 = require('munkres-js');
    let bestMatch = munkres1(oddMatrix) 


    // Remove symmetry from the best match
    bestMatch = bestMatch.filter(pair => pair[0] < pair[1]);

    // Convert indicies to odd degree nodes
    bestMatch = bestMatch.map(pair => [oddDegreeNodes[pair[0]], oddDegreeNodes[pair[1]]]);

    // Overwrite the best match if user defined it
    if (bestPairOverwrite) {
        bestMatch = bestPairOverwrite;
    }
    finalTour.push(bestMatch);

    // Step 4 - Combine the MST and the minimum weight perfect matching to form a multigraph
    let multigraph = mst.mstEdges.concat(bestMatch);
    // multigraph = Array.from(new Set(multigraph.map(JSON.stringify)), JSON.parse); // remove dupe edges
    finalTour.push(multigraph);


    // Step 5 - Find an Eulerian Tour using Hierholzer's algorithm
    const findEulerianTour = (graph, currentVertex, eulerianTour) => {
        while (graph[currentVertex].length > 0) {
            const nextVertex = graph[currentVertex].shift();
            // Remove the edge from the next vertex's list only if it exists to account for duplicates
            const edgeIndex = graph[nextVertex].indexOf(currentVertex);
            if (edgeIndex > -1) {
                graph[nextVertex].splice(edgeIndex, 1);
            }
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
    let eulerianTour = [];

    
    findEulerianTour(adjacencyList, multigraph[0][0], eulerianTour);
    

    

    // Step 6 - Generate the Hamiltonian (TSP tour) from the Eulerian tour
    const tspTour = [];
    for (let vertex of eulerianTour) {
        // Add the vertex to the tour if it hasn't been visited yet
        if (!tspTour.includes(vertex)) {
            tspTour.push(vertex);
        }
    }
    // Close the tour by adding the first vertex to the end
    tspTour.push(tspTour[0]);
    finalTour.push(tspTour);

    // Set the best tour and its weight
    setBestTour(finalTour);
    setBestWeight(tourWeight(finalTour[finalTour.length - 1], adjacencyMatrix));
    setChristofidesAlgorithim(true);
    
    // Calculate the weight of the MST
    let mstWeight = 0;
    for (let edge of mst.mstEdges) {
        mstWeight += adjacencyMatrix[`${edge[0]}-${edge[1]}`];
    }

    // Calculate the weight of the perfect matching
    let matchingWeight = 0;
    for (let edge of bestMatch) {
        matchingWeight += adjacencyMatrix[`${edge[0]}-${edge[1]}`];
    }

    // Metadata information for the algorithm
    return { mst, mstWeight, matchingWeight, oddDegreeNodes, bestMatch, multigraph, eulerianTour, tspTour};
};

