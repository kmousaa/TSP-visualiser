import React, { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function Graph() {

  // State of the Graph
  const [numNodes, setNumNodes] = useState(0); // Number of nodes
  const [adjacencyMatrix, setAdjacencyMatrix] = useState({}); // Edge weights

  // Function to generate coordinates for equidistant nodes on a circle
  const generateNodeCoordinates = (numNodes) => {
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

  // Function to update adjacency matrix when number of nodes changes
  const generateAdjacencyMatrix = () => {
    const newMatrix = Array.from({ length: numNodes }, () => Array(numNodes).fill(0)); // Initialize a 2D array of 0s
    
    // Loop through existing edges and update the matrix accordingly
    for (const [edge, weight] of Object.entries(adjacencyMatrix)) {
      const [node1, node2] = edge.split('-').map(Number);
      
      // Ensure newMatrix[node1] and newMatrix[node2] exist before modifying them
      if (newMatrix[node1] && newMatrix[node2]) {
        newMatrix[node1][node2] = weight;
        newMatrix[node2][node1] = weight; // Symmetrically assign weight
        newMatrix[node1][node1] = 0; // Set the diagonal to 0
        newMatrix[node2][node2] = 0; // Set the diagonal to 0
      }
    }
    return newMatrix;
  };
  
  // Function to add a new node to the graph
  const addNode = () => {
    setNumNodes(numNodes + 1);
  };

  // Function to remove the last node from the graph
  const removeNode = () => {
    if (numNodes > 0) {
      setNumNodes(numNodes - 1);

      // Remove all edges connected to the last node
      const newAdjacencyMatrix = { ...adjacencyMatrix };
      for (const key in newAdjacencyMatrix) {
        const [node1, node2] = key.split('-').map(Number);
        if (node1 === numNodes - 1 || node2 === numNodes - 1) {
          delete newAdjacencyMatrix[key];
        }
      }
      setAdjacencyMatrix(newAdjacencyMatrix);
    }
  };

  // Function to reset the graph
  const resetGraph = () => {
    setNumNodes(0);
    setAdjacencyMatrix({});
  };

  // Function to clear all edge weights
  const clearWeights = () => {
    setAdjacencyMatrix({});
  };

  // Function to log edge weights and adjacency matrix dimensions
  const logWeights = () => {
    console.log("Number of Nodes: " + numNodes)
    console.log("Adjacency Matrix:");
    console.log(generateAdjacencyMatrix());
    console.log("Node Coordinates:");
    console.log(generateNodeCoordinates(numNodes));
  };

  // Function to save the graph
  const saveGraph = () => {
    const graph = {
      numNodes,
      adjacencyMatrix
    };
    const json = JSON.stringify(graph);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "graph.json";
    a.click();
  };

  // Function to load the graph
  const loadGraph = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = (readerEvent) => {
        const content = readerEvent.target.result;
        const graph = JSON.parse(content);
        setNumNodes(graph.numNodes);
        setAdjacencyMatrix(graph.adjacencyMatrix);
      };
    };
    input.click();
  };

  // Function to update edge weight
  const updateEdgeWeight = (node1, node2, weight) => {
    const newWeights = { ...adjacencyMatrix }; // Shallow copy of the adjacency matrix
    newWeights[`${node1}-${node2}`] = Number(weight);
    newWeights[`${node2}-${node1}`] = Number(weight); // Symmetrically assign weight
    // if weight empty put NA
    if (weight === "") {
      newWeights[`${node1}-${node2}`] = 0;
      newWeights[`${node2}-${node1}`] = 0; // Symmetrically assign weight
    }
    setAdjacencyMatrix(newWeights);
  };
  
  // Function to generate random weights for the edge weights
  const generateRandomWeights = () => {
    const newWeights = {};
    for (let i = 0; i < numNodes; i++) {
      for (let j = i + 1; j < numNodes; j++) {
        const weight = Math.floor(Math.random() * 10) + 1; // Generate a random weight between 1 and 10
        newWeights[`${i}-${j}`] = weight;
        newWeights[`${j}-${i}`] = weight; // Symmetrically assign weight
      }
    }
    setAdjacencyMatrix(newWeights);
  };


  // Function to render node numbers around the circle
  const renderNodeNumbers = () => {
    const nodeCoordinates = generateNodeCoordinates(numNodes);
    const radius = 15; // Radius for positioning node numbers
    
    return (
      <svg>
        {nodeCoordinates.map((node, index) => {
          const angle = (2 * Math.PI * index) / numNodes;
          const x = node.x + radius * Math.cos(angle);
          const y = node.y + radius * Math.sin(angle);
          
          return (
            // Tag representing node number
            <text
              key={index}
              x={x}
              y={y}
              fill="black"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle" // Center align the text
              alignmentBaseline="central" // Vertically align the text
            >
              {index + 1}
            </text>
          );
        })}
      </svg>
    );
  };

  // Function to render the adjacency matrix
  const renderAdjacencyMatrix = () => {

    const adjacencyMatrix = generateAdjacencyMatrix();
    return (
      <table className="adjacency-matrix">
        <thead>
          <tr>
            <th>Vertex</th>
            {[...Array(numNodes).keys()].map((node) => (
              <th key={node}>Node {node + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {adjacencyMatrix.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td>Node {rowIndex + 1}</td>
              {row.map((weight, columnIndex) => (
                <td key={columnIndex}>
                  {columnIndex === rowIndex ? (
                    0 // Display 0 for the node to itself
                  ) : (
                    <input
                      id={`${rowIndex}-${columnIndex}`}
                      type="number"
                      placeholder = '0'
                      value={weight || ''}
                      onChange={(e) =>{
                        updateEdgeWeight(rowIndex, columnIndex, e.target.value)
                      }
                      }
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const factorial = (n) => {
    if (n === 0) {
      return 1;
    }
    return n * factorial(n - 1);
  }

  // Given TSP tour return weight , input looks like [x1, x2 ,x3 x4, x1]
  const tourWeight = (tour) => {
    let weight = 0;
    for (let i = 0; i < tour.length - 1; i++) {
      const node1 = tour[i];
      const node2 = tour[i + 1];
      weight += adjacencyMatrix[`${node1}-${node2}`];
    }
    return weight;
  }

  // From: https://www.30secondsofcode.org/js/s/array-permutations/
  const permutations = arr => {
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

  // Fix up the 0 weighted stuff
  const bruteForceTSP = () => {
    var possible_tours = permutations([...Array(numNodes).keys()]);
    var best_tour = [];
    var best_weight = Number.MAX_VALUE;
    for (let i = 0; i < possible_tours.length; i++) {
      possible_tours[i].push(possible_tours[i][0]);
      const tour = possible_tours[i];
      var weight = tourWeight(tour);
      if (weight < best_weight) {
        best_tour = tour;
        best_weight = weight;
      }
    }
    console.log("Best Tour: " + best_tour + " Weight: " + best_weight);
    return best_weight; // Return the weight of the best tour
  };
  

  const showWeight = (e, node1, node2) => {
    const weight = adjacencyMatrix[`${node1}-${node2}`];
    let displayText;
    if (typeof weight === "undefined") {
      displayText = "Selected weight: Click to input weight";
    } else {
      displayText = "Selected weight: " + weight + "   " + "  (" + (node1 + 1) + "-" + (node2 + 1) + ")";
    }
    document.getElementById("weight").innerHTML = displayText;
  }
  

  const showWeightedEdges = (e, node1, node2) => {
    e.target.style.stroke = "blue";
    showWeight(e, node1, node2);
  }

  const showUnweightedEdges = (e, node1, node2) => {
    e.target.style.stroke = "blue";
    showWeight(e, node1, node2);
  }


  const SelectAdjMatrix = (e,node1, node2) => {
    const inputId = `${node1}-${node2}`;
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
      inputElement.focus(); // Focus on the input element
    }
  };
  

  // Generate coordinates for nodes
  const nodeCoordinates = generateNodeCoordinates(numNodes);
  const AdjMatrix = generateAdjacencyMatrix()
  return (
    <div className="Graph">
      <h2>TSP Graph Visualization</h2>
      <svg width="500" height="500">

      {/* Render connections */}
      {nodeCoordinates.map((node, index) => {
        // Go through each node
        return (
          // For each node, find its connections to other nodes
          nodeCoordinates.slice(index + 1).map((nextNode, nextIndex) => {
            // Define the current node and the node it's connected to
            const node1 = index;
            const node2 = index + nextIndex + 1;
            // Draw a line between the current node and the connected node
            const result = AdjMatrix[node1][node2] === 0; // Check if the value is not "NA"
            
            return (
              // Check if node-node2 in the adjacency matrix has a value not "NA"
              result ? (
                <a href="#" class="pe-auto  stretched-link d-inline-block p-2">
                <line
                  key={`${node1}-${node2}`} // Line with undefined weight
                  x1={node.x} 
                  y1={node.y} 
                  x2={nextNode.x} 
                  y2={nextNode.y} 
                  stroke= "black"
                  strokeOpacity="0.25"
                  strokeWidth="2"
                  onMouseMove={(e) => { showUnweightedEdges(e,node1,node2)}}
                  onClick = {(e) => { SelectAdjMatrix(e,node1,node2); }}
                  onMouseOut={(e) => { e.target.style.stroke = "black"; }}
                />
                </a>
              ) : (
              <a href="#" class="pe-auto">
              <line
                key={`${node1}-${node2}`} // Line with defined weight
                x1={node.x} 
                y1={node.y} 
                x2={nextNode.x} 
                y2={nextNode.y} 
                stroke="black"
                strokeWidth="3"
                onMouseMove={(e) => { showWeightedEdges(e, node1,node2)}}  
                onClick = {(e) => { SelectAdjMatrix(e,node1,node2); }}
                onMouseOut={(e) => { e.target.style.stroke = "black"; }}
              />
              </a>
              ) // Show line differently if the value is "NA"
            );
            
          })
        );
      })}

      {/* Render nodes */}
      {nodeCoordinates.map((node, index) => (
        <circle key={index} cx={node.x} cy={node.y} r="10" fill="blue" />
      ))}

      {/* Render node numbers */}
      {renderNodeNumbers()}
        
      </svg>
      <div className="buttons">
        <button onClick={addNode}>Add Node</button>
        <button onClick={removeNode} disabled={numNodes === 0}>
          Remove Node
        </button>
        <button onClick={resetGraph}>Reset Graph</button>
        <button onClick={clearWeights} >ClearWeights</button>
        <button onClick={generateRandomWeights}>Random Weight</button>
        <button onClick={logWeights}>Log Weights</button>
        <button onClick={saveGraph}>Save Graph</button>
        <button onClick={loadGraph}>Load Graph</button>
        <button onClick={bruteForceTSP}>TSP</button>
        <br/> <br/>
        <p1 id = "weight">Selected weight: NA </p1>
        {/* <button onClick={tspBruteForce}>Brute Force</button> */}
      </div>
      
      <div className="adjacency-matrix-container">
        <h3>Adjacency Matrix</h3>
        {renderAdjacencyMatrix()}
      </div>
      
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Graph />
    </div>
  );
}

export default App;
