// Contains TSP algorithms 
import { permutations, getAdjacentNodes , tourWeight, sortDictionary, removeDupeDict} from "../utils/GraphUtil";
import { Munkres } from 'munkres-js';
import { minWeightAssign, maxWeightAssign } from 'munkres-algorithm';



// Import the Munkres library


export const BruteForceTSP = (resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight) => {
    resetBestTour();
    
    let possible_tours = permutations([...Array(numNodes).keys()]); // Generate all possible tours
    let best_tour = [];
    let best_weight = Number.MAX_VALUE;
    let intermediate_tours = [];

    // Find the tour with the smallest weight
    for (let i = 0; i < possible_tours.length; i++) {
        possible_tours[i].push(possible_tours[i][0]);
        const tour = possible_tours[i];
        let weight = tourWeight(tour, adjacencyMatrix);
        if (weight < best_weight) {
            best_tour = tour;
            best_weight = weight;
        }
        intermediate_tours.push(tour);
    }

    // remove identiacal tours with same weight inside the intermediate tours
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

            
        

    // mix up the intermediate tours order
    intermediate_tours = intermediate_tours.sort(() => Math.random() - 0.5);
    

    // go through the intermediate tours , if the weight of the intermediate tour is same as best tour then keep all until what we found
    console.log("Trying to find tour: ", best_tour + " with weight: " + best_weight );
    
    // loop through the intermediate tours and find a tour with the same weight as the best tour
    let index = 0;
    for (let i = 0; i < intermediate_tours.length; i++) {
        let weight = tourWeight(intermediate_tours[i], adjacencyMatrix);
        if (weight === best_weight) {
            index = i;
            break;
        }
    }

    // remove identiacal tours with same weight inside the intermediate tours
    
    


    // remove after the best tour in intermediate tours
    intermediate_tours = intermediate_tours.slice(0, index + 1);
    
    setBestTour(intermediate_tours);
    setBestWeight(best_weight);

    console.log("Intermediate Tours");
    console.log(intermediate_tours);


    console.log("Total weight:", best_weight); // Log the total weight

    return best_weight; // Return the weight of the best tour
};


export const NearestNeighborTSP = (resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight, setSteps, setAltSteps, setCurrentStep, setConsideredStep, setChristofidesAlgorithim, startNode) => {
    resetBestTour();

    // Pick a random starting node (unless we are in interactive mode, in which case the user picks the starting node)
    console.log("Start Node freshhh", startNode);
    let start = startNode ?  startNode : Math.floor(Math.random() * numNodes) ;
    console.log("Lets start here", start);
    console.log( startNode !== null);

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

        console.log("Current", current);
        console.log("Adj Nodes", adjNodes);
        console.log("Tour", tour);

 

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

    console.log("Tour", tour);

    // Add the weight of the last edge
    weight += adjacencyMatrix[`${tour[tour.length - 1]}-${start}`];
    tour.push(start);
    

    // Show the sequence of nodes in the tour
    setBestTour(tour);
    setBestWeight(weight);
    // In every step of the tour, show what nodes we considered along the way

    setConsideredStep(considered);

    // Initialise the steps to 1 in order to show the first step of simulating the algorithim
    // setSteps([tour[0]]);
    // setAltSteps(prevSteps => [...prevSteps, considered[0]]);
    // setCurrentStep(1);

    console.log("Considering,,,,,", considered);

    console.log("Total weight:", weight); // Log the total weight

    return {considered, weight, tour, considered};
};





// Its US - this does not work
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
    return degreeDict;

};


// Function that checks if adding a new edge to the graph creates a cycle [TICK]
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




// Function to find the Minimum Spanning Tree using Prim's algorithm [Chat GPT]
// Check logs we allow dupes

const PrimsMST = (resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight, setSteps, setAltSteps, setCurrentStep, setConsideredStep, setChristofidesAlgorithim) => {
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



// TRIANGLE INEQUALITY MUST HOLD for this to work
export const ChristofidesTSP = (resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight, setSteps, setAltSteps, setCurrentStep, setConsideredStep, setChristofidesAlgorithim, mstOverwrite, bestPairOverwrite) => {
    resetBestTour();


    let finalTour = [];

    // Step 1 - Find the Minimum Spanning Tree
    let mst = PrimsMST(resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight, setSteps, setAltSteps, setCurrentStep, setConsideredStep);
    console.log("MST")
    console.log(mst);
    if (!mst) {
        return;
    }

    // overwrite the mst if we are in interactive mode
    if (mstOverwrite) {
        mst.mstEdges = mstOverwrite;

        // build new degree dictionary based on edges from mstOverwrite
        let degreeDict = {};
        for (let i = 0; i < numNodes; i++) {
            degreeDict[i] = 0;
        }

        console.log("Overwrite MST")
        console.log(mstOverwrite);
        for (let edge of mstOverwrite) {
            degreeDict[edge[0]] += 1;
            degreeDict[edge[1]] += 1;
        }
        mst.degreeDict = degreeDict;
        
        console.log("Overwrite MST")
    }
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
    console.log("Odd Matrix");
    console.log(oddMatrix);

    // NUMBER 0
    // Brute force to find the best match of the odd degree nodes

    // const bruteForcePerfectMatching = (oddDegreeNodes, adjacencyMatrix) => {
    //     let bestMatching = null;
    //     let bestWeight = Infinity;

    //     // Generate all possible permutations of odd degree nodes
    //     const generatePermutations = (arr, permutation) => {
    //         if (arr.length === 0) {
    //             // Calculate weight of this permutation
    //             let weight = 0;
    //             for (let i = 0; i < permutation.length - 1; i++) {
    //                 const node1 = permutation[i];
    //                 const node2 = permutation[i + 1];
    //                 weight += adjacencyMatrix[`${node1}-${node2}`];
    //             }

    //             // Update best matching if this permutation has a lower weight
    //             if (weight < bestWeight) {
    //                 bestWeight = weight;
    //                 bestMatching = permutation.slice(); // Copy the permutation to avoid mutation
    //             }
    //             return;
    //         }

    //         for (let i = 0; i < arr.length; i++) {
    //             const newArr = arr.slice(0, i).concat(arr.slice(i + 1));
    //             generatePermutations(newArr, permutation.concat(arr[i]));
    //         }
    //     };

    //     generatePermutations(oddDegreeNodes, []);

    //     // Convert the permutation into pairs
    //     const pairs = [];
    //     for (let i = 0; i < bestMatching.length - 1; i += 2) {
    //         pairs.push([bestMatching[i], bestMatching[i + 1]]);
    //     }

    //     return pairs;
    // };

    // // Find the minimum weight perfect matching using brute force
    // let bestMatch = bruteForcePerfectMatching(oddDegreeNodes, adjacencyMatrix);
    // console.log("Best Match Perfect Brute Force");
    // console.log(bestMatch);

    // // NUMBER 1 
    let munkres1 = require('munkres-js');
    let bestMatch = munkres1(oddMatrix)
    console.log("Best Match");
    console.log(bestMatch);

    // Remove symetry from the best match for example [1,0] and [0,1] are the same, so we only need one of them
    // Remove symmetry from the best match
    bestMatch = bestMatch.filter(pair => pair[0] < pair[1]);

    // Convert indicies to odd degree nodes
    bestMatch = bestMatch.map(pair => [oddDegreeNodes[pair[0]], oddDegreeNodes[pair[1]]]);

    
    console.log("Best Match After");
    console.log(bestMatch);

    // // NUMBER 2
    // let munkres2 = require('hungarian-on3');
    // let bestMatch2 = munkres2(oddMatrix);
    // console.log("Best Match 2");
    // console.log(bestMatch2);

    // // NUMBER 3
    // let munkres3 = minWeightAssign(oddMatrix);
    // console.log("Best Match 3");
    // console.log(munkres3);

    if (bestPairOverwrite) {
        bestMatch = bestPairOverwrite;
        console.log("Overwrite Best Match");
    }


    finalTour.push(bestMatch);



    // Step 4 - Combine the MST and the minimum weight perfect matching to form a multigraph
    let multigraph = mst.mstEdges.concat(bestMatch);

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

    let eulerianTour = [];
    findEulerianTour(adjacencyList, multigraph[0][0], eulerianTour);
    console.log("Eulerian Tour");
    console.log(eulerianTour);

    // eulerianTour = [0,5,0,2,1,3,4,3]

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
    // setSteps([finalTour[0]]);

    setBestWeight(tourWeight(finalTour[finalTour.length - 1], adjacencyMatrix));

    
    console.log("Step", [finalTour[0]]);
    // setCurrentStep(1);

    setChristofidesAlgorithim(true);
    


    console.log("Total weight:", tourWeight(tspTour, adjacencyMatrix)); // Log the total weight

    // weight of the MST
    let mstWeight = 0;
    for (let edge of mst.mstEdges) {
        mstWeight += adjacencyMatrix[`${edge[0]}-${edge[1]}`];
    }

    // weight of the perfect matching
    let matchingWeight = 0;
    for (let edge of bestMatch) {
        matchingWeight += adjacencyMatrix[`${edge[0]}-${edge[1]}`];
    }

    
    return { mst, mstWeight, matchingWeight, oddDegreeNodes, bestMatch, multigraph, eulerianTour, tspTour};
};

