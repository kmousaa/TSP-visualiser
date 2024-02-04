import React, { useState } from 'react';
import './App.css';

function Graph() {
  const [numNodes, setNumNodes] = useState(0); // Number of nodes
  const [adjMatrix, setAdjMatrix] = useState([]); // Adjacency matrix for the graph
  const [edgeWeights, setEdgeWeights] = useState({}); // Edge weights

  // Function to generate coordinates for equidistant nodes on a circle
  const generateNodeCoordinates = (numNodes) => {
    const coordinates = [];
    const centerX = 250; // X coordinate of the center of the circle
    const centerY = 250; // Y coordinate of the center of the circle
    const radius = 200; // Radius of the circle

    for (let i = 0; i < numNodes; i++) {
      const angle = (2 * Math.PI * i) / numNodes;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      coordinates.push({ x, y });
    }

    return coordinates;
  };

  // Function to add a new node to the graph
  const addNode = () => {
    setNumNodes(numNodes + 1);

    // Update adjacency matrix
    const newMatrix = [...adjMatrix];
    for (let i = 0; i < numNodes; i++) {
      newMatrix[i].push(0);
    }
    newMatrix.push(new Array(numNodes + 1).fill(0));
    setAdjMatrix(newMatrix);
  };

  // Function to remove the last node from the graph
  const removeNode = () => {
    if (numNodes > 0) {
      setNumNodes(numNodes - 1);

      // Update adjacency matrix
      const newMatrix = [...adjMatrix];
      newMatrix.pop();
      for (let i = 0; i < newMatrix.length; i++) {
        newMatrix[i].pop();
      }
      setAdjMatrix(newMatrix);
    }
  };

  // Function to update edge weight
  const updateEdgeWeight = (node1, node2, weight) => {
    const newWeights = { ...edgeWeights };
    newWeights[`${node1}-${node2}`] = weight;
    
    // Assuming symmetry for the adjacency matrix
    newWeights[`${node2}-${node1}`] = weight;

    // Assume weight 0 for the node to itself
    newWeights[`${node1}-${node1}`] = 0;
    newWeights[`${node2}-${node2}`] = 0;

    setEdgeWeights(newWeights);
  };

  // Function to print adjacency matrix and edge weights to console
  const logData = () => {
    console.log("Adjacency Matrix:");
    console.table(adjMatrix);
    console.log("Edge Weights:");
    console.table(edgeWeights);
  };

  // Function to render the adjacency matrix
const renderAdjacencyMatrix = () => {
  return (
    <table className="adjacency-matrix">
      <thead>
        <tr>
          <th></th>
          {[...Array(numNodes).keys()].map((node) => (
            <th key={node}>Node {node + 1}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {adjMatrix.map((row, rowIndex) => (
          <tr key={rowIndex}>
            <td>Node {rowIndex + 1}</td>
            {row.map((_, columnIndex) => (
              <td key={columnIndex}>
                {columnIndex === rowIndex ? (
                  0 // Display 0 for the node to itself
                ) : (
                  <input
                    type="number"
                    value={edgeWeights[`${rowIndex}-${columnIndex}`] || ''}
                    onChange={(e) =>
                      updateEdgeWeight(rowIndex, columnIndex, e.target.value)
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



  // Generate coordinates for nodes
  const nodeCoordinates = generateNodeCoordinates(numNodes);

  return (
    <div className="Graph">
      <h2>Graph Visualization</h2>
      <svg width="500" height="500">
        {/* Render connections */}
        {nodeCoordinates.map((node, index) => {
          return (
            nodeCoordinates.slice(index + 1).map((nextNode, nextIndex) => {
              const node1 = index;
              const node2 = index + nextIndex + 1;
              return (
                <line
                  key={`${node1}-${node2}`}
                  x1={node.x}
                  y1={node.y}
                  x2={nextNode.x}
                  y2={nextNode.y}
                  stroke="black"
                />
              );
            })
          );
        })}
        {/* Render nodes */}
        {nodeCoordinates.map((node, index) => (
          <circle key={index} cx={node.x} cy={node.y} r="10" fill="blue" />
        ))}
      </svg>
      <div className="buttons">
        <button onClick={addNode}>Add Node</button>
        <button onClick={removeNode} disabled={numNodes === 0}>
          Remove Node
        </button>
        <button onClick={logData}>Log</button>
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
