import { generateNodeCoordinates , renderCustomNode } from "../utils/GraphUtil";
import { NearestNeighborTSP, bruteForceTSP  } from "./TspAlgorithims";
import { useState } from "react";


// Represents the graph and its adjacency matrix
function Graph ({numNodes, setNumNodes, adjacencyMatrix, setAdjacencyMatrix, bestTour, setBestTour, bestWeight, setBestWeight , currentStep, setCurrentStep, steps, setSteps}) {

    // Keeps track of steps
    const [stepNum, setStepNum] = useState(0); 
  
    // Reset the best tours
    const resetBestTour = () => {
      setBestTour([]);
      setBestWeight(Number.MAX_VALUE);
      setSteps([]);
      setStepNum(1);
      
    }

    // Generate the adjacency matrix 
    const generateAdjacencyMatrix = () => {
      
      const newMatrix = Array.from({ length: numNodes }, () => Array(numNodes).fill(0)); // Initialize a 2D array of 0s
      
      // Loop through existing edges and update the matrix accordingly
      for (const [edge, weight] of Object.entries(adjacencyMatrix)) {
        const [node1, node2] = edge.split('-').map(Number);

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
      resetBestTour();
      setNumNodes(numNodes + 1);
    };
  
    // Function to remove the last node from the graph
    const removeNode = () => {
      if (numNodes > 0) {
        resetBestTour();
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
      resetBestTour();
      setNumNodes(0);
      setAdjacencyMatrix({});
    };
  
    // Function to clear all edge weights
    const clearWeights = () => {
      resetBestTour();
      setAdjacencyMatrix({});
    };
  
    // DELETE LATER - Function to log edge weights and adjacency matrix dimensions
    const logWeights = () => {
      console.log(" --------------- LOG --------------- ")
      console.log("Number of Nodes: " + numNodes)
      console.log("Adjacency Matrix:");
      console.log(adjacencyMatrix);
      console.log("BEST TOUR: ");
      console.log(bestTour)
      console.log("BEST WEIGHT: ");
      console.log(bestWeight)
      console.log("STEPS: ");
      console.log(steps)
      console.log("STEP NUM: ");
      console.log(stepNum)
      console.log(" --------------- END LOG --------------- ")
    };
  
    // Function to save the graph as a JSON file
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
  
    // Function to load the graph from a JSON file
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
  
    // Function to update edge weight in the adjacency matrix
    const updateEdgeWeight = (node1, node2, weight) => {
      resetBestTour();
      const newWeights = { ...adjacencyMatrix }; // Shallow copy of the adjacency matrix
      newWeights[`${node1}-${node2}`] = Number(weight);
      newWeights[`${node2}-${node1}`] = Number(weight); // Symmetrically assign weight
      
      // if weight empty put 0
      if (weight === "") {
        newWeights[`${node1}-${node2}`] = 0;
        newWeights[`${node2}-${node1}`] = 0; 
      }
      setAdjacencyMatrix(newWeights);
    };
    
    // Function to add random weights to the adjacency matrix
    const generateRandomWeights = () => {
      resetBestTour();
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
  
    // Function to render the adjacency matrix as a table
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

    // Display the weight of the selected edge
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
      e.target.style.stroke = "#00aeff";
      showWeight(e, node1, node2);
    }
  
    const showUnweightedEdges = (e, node1, node2) => {
      e.target.style.stroke = "#00aeff";
      showWeight(e, node1, node2);
    }
  
    const SelectAdjMatrix = (e,node1, node2) => {
      const inputId = `${node1}-${node2}`;
      const inputElement = document.getElementById(inputId);
      if (inputElement) {
        inputElement.focus(); // Focus on the input element
      }
    };

    // Functions for simulation
    const nextStep = () => {
      if (stepNum < bestTour.length) { 
        setSteps([...steps, bestTour[stepNum]]);
        setStepNum(stepNum + 1);
        console.log(steps)
      } else {
        console.log("Reached maximum step.");
      }
    };

    const prevStep = () => {
      if (stepNum > 0) {
        setSteps(steps.slice(0, -1));
        setStepNum(stepNum - 1);
      } else {
        console.log("Reached minimum step.");
      }
    };

    const restart = () => {
      setSteps([]);
      setStepNum(0);
    };

    // Function to render nodes
    const renderNodes = () => {
      let nodeCoordinates = generateNodeCoordinates(numNodes);
      return nodeCoordinates.map((node, index) => (

        renderCustomNode(node, index, steps.includes(index))
        // index === steps[steps.length - 1] ? (
        //   renderCustomNode(node, index, true)
        // ) : (
        //   renderCustomNode(node, index, false)
        // )
      ));
    };

    // const renderNodes = () => {
    //   let nodeCoordinates = generateNodeCoordinates(numNodes);
    //   return nodeCoordinates.map((node, index) => (

    //     <g key={index}>
    //       {/* Node outline */}
    //       <circle cx={node.x} cy={node.y} r="20" fill="none" stroke="#000000" strokeWidth="2" />
    //       {/* Node body */}
    //       <circle cx={node.x} cy={node.y} r="18" fill="#ffffff" />
    //       {/* Bold number inside the node */}
    //       <text x={node.x} y={node.y} fill="#000000" fontSize="14" fontWeight="bold" textAnchor="middle" alignmentBaseline="central">
    //         {index + 1}
    //       </text>
    //     </g>
    //   ));
    // };

    

    
    

    
    



    // Generate coordinates for nodes
    const nodeCoordinates = generateNodeCoordinates(numNodes);
    const AdjMatrix = generateAdjacencyMatrix()

    // Helper function to generate TSP algorithm handlers
    const generateTSPHandler = (tspAlgorithm) => {
      return () => {
        tspAlgorithm(resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight , setSteps, setCurrentStep);
      };
    };

    return (
      
      <div className="Graph">
        <h2>TSP Graph Visualization</h2>
      
        <svg width="700" height="700"  style={{ border: "1px solid black" }} >
  
        {/* Render connections */}
        {nodeCoordinates.map((node, index) => {
          // Go through each node
          return (
            // For each node, find its connections to other nodes
            nodeCoordinates.slice(index + 1).map((nextNode, nextIndex) => {

              // Define the current node and the node it's connected to
              const node1 = index;
              const node2 = index + nextIndex + 1;
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
                    strokeOpacity="0.1"
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
                  strokeOpacity="1"
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

        console.log(steps)
        {/* make every line inside best tour red */}
        { steps.map((node, index) => {
          if (index < steps.length - 1) {
            const node1 = steps[index];
            const node2 = steps[index + 1];
            const x1 = nodeCoordinates[node1].x;
            const y1 = nodeCoordinates[node1].y;
            const x2 = nodeCoordinates[node2].x;
            const y2 = nodeCoordinates[node2].y;
            const result = AdjMatrix[node1][node2] === 0; // Check if the value is not "NA"

            return (
              result ? (
              <line
                key={`${node1}-${node2}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="blue"
                strokeWidth="3"
                onMouseMove={(e) => { showWeightedEdges(e, node1,node2)}}  
                onClick = {(e) => { SelectAdjMatrix(e,node1,node2); }}
                onMouseOut={(e) => { e.target.style.stroke = "red"; }}
              />
              ) : (
              <line
                key={`${node1}-${node2}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#ff8a27"
                strokeWidth="3"
                onMouseMove={(e) => { showWeightedEdges(e, node1,node2)}}  
                onClick = {(e) => { SelectAdjMatrix(e,node1,node2); }}
                onMouseOut={(e) => { e.target.style.stroke = "#ff8a27"; }}
              />

            )
            );
          }
        })}

        {/* Render nodes */}
        {renderNodes()}
  
        {/* Render node numbers */}
        {/* {renderNodeNumbers()} */}
        
        {/* // Higher-order function to generate TSP algorithm handlers */}
          
        </svg>


        <br/> <br/> <br/> <br/>
        <div className="buttons">
          
          {/* Graph Operations */}
          <button onClick={() => addNode()}>Add Node</button>
          <button onClick={() => removeNode()} disabled={numNodes === 0}> Remove Node </button>
          <button onClick={() => resetGraph()}>Reset Graph</button>
          <button onClick={() => clearWeights()}>ClearWeights</button>
          <button onClick={() => generateRandomWeights()}>Random Weight</button>
          <button onClick={() => logWeights()}>Log Weights</button>
          <button onClick={() => saveGraph()}>Save Graph</button>
          <button onClick={() => loadGraph()}>Load Graph</button>

          {/* TSP algorithms */}
          <button onClick={generateTSPHandler(bruteForceTSP)}>Brute Force</button>
          <button onClick={generateTSPHandler(NearestNeighborTSP)}>Nearest Neighbor - NW</button>
          <br/> <br/>
          <button onClick={nextStep} > Next Step</button>
          <button onClick={prevStep} > Previous Step</button>
          <button> Play </button>
          <button> Stop </button>
          <button onClick={restart} > BB </button>
          <button> FF </button>

          <br/> <br/> <br/> <br/>

  

          {/* Display the best tour and its weight */}
          <p1 id = "weight">Selected weight: NA </p1>
          <br/>
          <p1>Best Tour: {bestTour} </p1>
          <br/>
          <p1> Tour length: {bestTour.length} </p1>
          <br/>
          <p1>Best Weight: {bestWeight} </p1>
          
        </div>
        
        <div className="adjacency-matrix-container">
          <h3>Adjacency Matrix</h3>
          {renderAdjacencyMatrix()}
        </div>
        
      </div>
    );

    
  }

  export default Graph;