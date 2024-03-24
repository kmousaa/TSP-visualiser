// GraphUtil.js

// Function to render the nodes of the graph      
export const renderCustomNode = (node, index, isColorA, isLatest, tourFound, christofidesAlgorithim ,christofidesStepNum , setClickedNode, interactiveMode) => {
    let tempColor; 
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
    
    let nodeColor = tourFound ? "#ff0000" : isLatest ? "#30bbd1" : isColorA ? tempColor : "#FFFFFF"; 
    let borderColor = tourFound ? "#ff0000" : isLatest ? "#30bbd1" : isColorA ? tempColor : "#000000"; 
    let textColor = tourFound ? "#FFFFFF" : isLatest ? "#FFFFFF" : isColorA ? "#FFFFFF" : "#000000"; 
  
    return (
      <a href="#0" class="pe-auto" style={{ textDecoration: 'none' }}>
      <g class="node" onClick={() =>  interactiveMode ? setClickedNode(index) :    setClickedNode(null)  }  key={index} className="node-group">
      {/* Node outline */}
      <circle class="node" cx={node.x} cy={node.y} r="20" fill="none" stroke={borderColor} strokeWidth="4" />
      {/* Node body */}
      <circle class="node" cx={node.x} cy={node.y} r="18" fill={nodeColor} />
      {/* Bold number inside the node */}
      <text class="nodeNo" x={node.x} y={node.y} fill={textColor} fontSize="20" fontWeight="bold" textAnchor="middle" alignmentBaseline="central">
        {index + 1}
      </text>
    </g>
    </a>
    );
  };
  

// Function to generate coordinates for equidistant nodes on a circle
export const generateNodeCoordinates = (numNodes) => {
    const coordinates = []; // Stores the coordinates of the nodes
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


// Given TSP tour return its weight
export const tourWeight = (tour, adjacencyMatrix) => {
    let weight = 0;
    for (let i = 0; i < tour.length - 1; i++) {
        const node1 = tour[i];
        const node2 = tour[i + 1];
        weight += adjacencyMatrix[`${node1}-${node2}`];
    }
    return weight;
};

// Helper function to find permutations of an array : https://www.30secondsofcode.org/js/s/array-permutations/
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

// Function to obtain all adjacent nodes for a specific node
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

  // 1 - Create the array of key-value pairs
  let items = Object.keys(dict).map(
    (key) => { return [key, dict[key]] });
  
  // 2 - Sort the array based on the second element (i.e. the value)
  items.sort(
      (first, second) => { return first[1] - second[1] }
  );
    
  // 3 - Obtain the sorted dictionary
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

// Helper function to find how to adjust position of weight text
export const  calculateTextAttributes = (node1, node2, numNodes) => {
  let sizeMultiplier = 1; // This multiplier can be adjusted as needed

  let textAdjustmentX = 0;
  let textAdjustmentY = 0;
  let maxTextLength = 0;
  
  if (numNodes <= 3) {
    maxTextLength = 5;
    sizeMultiplier = 1.2;
  }
  else if (numNodes == 4) {
    maxTextLength = 5;
    sizeMultiplier = 1.2;

    if (node1 == 1 && node2 == 3) {
      textAdjustmentY = -110;
    }
    else if (node1 == 0 && node2 == 2) {
      textAdjustmentX = -110;
    }
  }
  else if (numNodes == 5) {
    maxTextLength = 5;
  }

  else if (numNodes == 6) {
    sizeMultiplier = 1;
    maxTextLength = 4;

    if (node1 == 0 && node2 == 3 ){
      textAdjustmentX = -100;
    }
    else if (node1 == 1 && node2 == 3) {
      textAdjustmentY = -67;
      textAdjustmentX = -120;
    }
    else if (node1== 3 && node2 == 5) {
      textAdjustmentY = 67;
      textAdjustmentX = -120;
    }
    else if (node1 == 0 && node2 == 4) {
      textAdjustmentY = +67;
      textAdjustmentX = +120;
    }
    else if (node1 == 0 && node2 == 2) {
      textAdjustmentX = +120;
      textAdjustmentY = -67;
    }
    else if (node1 == 2 && node2 == 4) {
      textAdjustmentY = +130;

    }
    else if (node1 == 1 && node2 == 5) {
      textAdjustmentY = -130;
    }
    else if (node1 == 1 && node2 == 4) {
      textAdjustmentX = -50;
      textAdjustmentY = -85;
    }
    else if (node1 == 2 && node2 == 5) {
      textAdjustmentX = 50;
      textAdjustmentY = -85;
    }
  }

  else if (numNodes == 7) {
    sizeMultiplier = 0.7
    maxTextLength = 4;
  }
  else if (numNodes == 8) { 
    sizeMultiplier = 0.7;
    maxTextLength = 4;
    if (node1 == 4 && node2 == 6) {
      textAdjustmentX = -120;
      textAdjustmentY = 120;
    }
    else if (node1 == 0 && node2 == 4) {
      textAdjustmentX = -105;
    }
    else if (node1 == 2 && node2 == 6) {
      textAdjustmentY = -105;
    }
    else if (node1 == 3 && node2 == 7) {
      textAdjustmentX = 80;
      textAdjustmentY = -80;
    }
    else if (node1 == 1 && node2 == 5) {
      textAdjustmentX = 80;
      textAdjustmentY = 80;
    }
    else if (node1 == 2 && node2 == 4) {
      textAdjustmentX = 120;
      textAdjustmentY = 120;                
    }
    else if (node1 == 1 && node2 == 3) {
      textAdjustmentX = 180;
    }
    else if (node1 == 0 && node2 == 2) {
      textAdjustmentY = -127;
      textAdjustmentX = 130;
    }
    else if (node1 == 0 && node2 == 6) {
      textAdjustmentY = -130;
      textAdjustmentX = -130;
    }
    else if (node1 == 5 && node2 == 7) {
      textAdjustmentX = -180;
    }
    else if (node1 == 1 && node2 == 7) {
      textAdjustmentY = -180;
    }
    else if (node1 == 3 && node2 == 5) {
      textAdjustmentY = 180;
    }
  }
  else if (numNodes == 9) {
    maxTextLength = 4;
    sizeMultiplier = 0.45;
  }
  else{
    sizeMultiplier = 0;
  }
  // 8.......idk!!!

  let textSize = 24 * sizeMultiplier; // Adjust font size based on the multiplier
  let boxSize = 35 * sizeMultiplier; // Adjust box size based on the multiplier

  return {textAdjustmentX, textAdjustmentY, textSize, boxSize, maxTextLength, sizeMultiplier};

}

// Generates the jsx for the text on the edge of the graph
export const  generateTextJSX = (node, nextNode, node1, node2, AdjMatrix, textAttributes)  => {
  const { sizeMultiplier, textAdjustmentX, textAdjustmentY, maxTextLength } = textAttributes;
  const textSize = 24 * sizeMultiplier; // Adjust font size based on the multiplier
  const boxSize = 35 * sizeMultiplier; // Adjust box size based on the multiplier

  return (
    <g>
      <rect
        x={(node.x + nextNode.x) / 2 - boxSize / 2 + textAdjustmentX * sizeMultiplier }
        y={(node.y + nextNode.y) / 2 - boxSize / 2 + textAdjustmentY * sizeMultiplier}
        width={boxSize}
        height={boxSize * 0.85}
        fill="white"
        strokeWidth="2"
        rx={boxSize / 2}
        style={{ pointerEvents: 'none' }}
      />
      <text
        x={(node.x + nextNode.x) / 2 + textAdjustmentX * sizeMultiplier}
        y={(node.y + nextNode.y) / 2 + textAdjustmentY * sizeMultiplier}
        dominantBaseline="middle"
        textAnchor="middle"
        fill="black"
        fontSize={textSize + "px"}
        fontWeight="bold"
        stroke="none"
        style={{ pointerEvents: 'none' }}
      >
        {AdjMatrix[node1][node2].toString().length > maxTextLength ? ".." : AdjMatrix[node1][node2]}
      </text>
    </g>
  );
}

// Checks if all odd verticies are connected together
export function areOddVerticesConnected(bestPairStep, oddVertices) {
  const coveredVertices = new Set();
  for (const [vertex1, vertex2] of bestPairStep) {
      coveredVertices.add(vertex1);
      coveredVertices.add(vertex2);
  }
  return oddVertices.every(vertex => coveredVertices.has(vertex));
}

// Returns the name of the algorithim
export function functionName(fun) {
  var ret = fun.name;
  if (ret === "BruteForceTSP") {
    return "Brute Force";
  }
  if (ret === "NearestNeighborTSP") {
    return "Nearest Neighbor";
  }
  if (ret === "GreedyTSP") {
    return "Greedy";
  }
  if (ret === "ChristofidesTSP") {
    return "Christofides";
  }
  else{
    return "Select Algorithim";
  }
}

