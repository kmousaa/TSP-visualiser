// GraphUtil.js

// Function to render the edges of the graph      
export const renderCustomNode = (node, index, isColorA, isLatest, tourFound, christofidesAlgorithim ,christofidesStepNum , setClickedNode, interactiveMode) => {
    // Define the color based on the boolean value
    
    let tempColor; // Define tempColor outside of the if-else blocks

    if (christofidesAlgorithim && christofidesStepNum === 1){
      tempColor = "#2730ff";
    }
    else if (christofidesAlgorithim && christofidesStepNum === 2){
      tempColor = "#ff2730";
    }
    else if (christofidesAlgorithim && christofidesStepNum === 3){
      tempColor = "#e100ff";
    }

    else{
      tempColor = "#ff8a27";
    }
    
    let nodeColor = tourFound ? "#ff0000" : isLatest ? "#30bbd1" : isColorA ? tempColor : "#FFFFFF"; // Red, Blue, Color A, or Color B
    let borderColor = tourFound ? "#ff0000" : isLatest ? "#30bbd1" : isColorA ? tempColor : "#000000"; // Red, Blue, Border color A, or Border color B
    let textColor = tourFound ? "#FFFFFF" : isLatest ? "#FFFFFF" : isColorA ? "#FFFFFF" : "#000000"; // Text color White, Blue, Text color A, or Text color B
    

    return (
      <a href="#0" class="pe-auto" style={{ textDecoration: 'none' }}>
      <g class="node" onClick={() =>  interactiveMode ? setClickedNode(index) :    setClickedNode(null)  }  key={index} className="node-group">
      {/* Node outline */}
      <circle class="node" cx={node.x} cy={node.y} r="20" fill="none" stroke={borderColor} strokeWidth="4" />
      {/* Node body */}
      <circle class="node" cx={node.x} cy={node.y} r="18" fill={nodeColor} />
      {/* Bold number inside the node */}
      <text class="nodeNo" x={node.x} y={node.y} fill={textColor} fontSize="20" fontWeight="bold" textAnchor="middle" alignmentBaseline="central">
        {index }
      </text>
    </g>
    </a>
    );
  };
  

// Function to generate coordinates for equidistant nodes on a circle
export const generateNodeCoordinates = (numNodes) => {
    const coordinates = [];
    const centerX = 330; // X coordinate of the center of the circle
    const centerY = 330; // Y coordinate of the center of the circle
    const radius = 295; // Radius of the circle

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

    


// Sort the adjacency matrix dictionary by weight src: https://www.educative.io/answers/how-can-we-sort-a-dictionary-by-value-in-javascript
export const sortDictionary = (dict) => {

  // Step - 1
  // Create the array of key-value pairs
  let items = Object.keys(dict).map(
    (key) => { return [key, dict[key]] });
  
  // Step - 2
  // Sort the array based on the second element (i.e. the value)
  items.sort(
      (first, second) => { return first[1] - second[1] }
  );
    
  // Step - 3
  // Obtain the sorted dictionary

  let sorted_dict = {};
  for (let i = 0; i < items.length; i++) {
    let key = items[i][0];
    let value = items[i][1];
    sorted_dict[key] = value;
  }


  return sorted_dict;

};

// Remove duplicate edges from the adjacency matrix
export const removeDupeDict = (dict) => {
  let dictNoDupe = {};
  for (const [edge, weight] of Object.entries(dict)) {
    const [node1, node2] = edge.split('-').map(Number);
    if (node1 < node2) {
      dictNoDupe[`${node1}-${node2}`] = weight;
    }
  }
  return dictNoDupe;
};
