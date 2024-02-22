// GraphUtil.js

// Function to generate coordinates for equidistant nodes on a circle
export const generateNodeCoordinates = (numNodes) => {
    const coordinates = [];
    const centerX = 250; // X coordinate of the center of the circle
    const centerY = 250; // Y coordinate of the center of the circle
    const radius = 200; // Radius of the circle

    for (let i = 0; i < numNodes; i++) {
        const angle = (2 * Math.PI * i) / numNodes;   // Angle in radians
        const x = centerX + radius * Math.cos(angle); // X coordinate of the node
        const y = centerY + radius * Math.sin(angle); // Y coordinate of the node
        coordinates.push({ x, y });
    }
    return coordinates;
};

// Given TSP tour return weight , tour looks like [x1, x2 ,x3 x4, x1]
export const tourWeight = (tour, adjacencyMatrix) => {
    let weight = 0;
    for (let i = 0; i < tour.length - 1; i++) {
        const node1 = tour[i];
        const node2 = tour[i + 1];
        weight += adjacencyMatrix[`${node1}-${node2}`];
    }
    return weight;
};

// Helper function taken from source : https://www.30secondsofcode.org/js/s/array-permutations/
export const permutations = arr => {
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

// Function to obtain adjacent nodes for a specific node
export const getAdjacentNodes = (nodeIndex, adjacencyMatrix) => {
    const adjNodes = [];
    for (const key in adjacencyMatrix) {
      const [node1, node2] = key.split('-').map(Number);
      if (node1 === nodeIndex) {
        adjNodes.push(node2);
      } else if (node2 === nodeIndex) {
        adjNodes.push(node1);
      }
    }
    const adjacentNodes = [...new Set(adjNodes)];
    return adjacentNodes;
};

    