import { generateNodeCoordinates , renderCustomNode } from "../utils/GraphUtil";
import { NearestNeighborTSP, bruteForceTSP  } from "./TspAlgorithims";
import { FaSave, FaDownload } from 'react-icons/fa'; // Import icons
import { FaPersonHiking } from "react-icons/fa6";

// Represents the graph and its adjacency matrix
function Graph ({numNodes, setNumNodes, adjacencyMatrix, setAdjacencyMatrix, bestTour, setBestTour, bestWeight, setBestWeight , stepNum, setStepNum , steps, setSteps , altSteps, setAltSteps , presentTour, setPresentTour , consideredStep, setConsideredStep}) {
    
    // Function to restart states
    const resetBestTour = () => {
      setBestTour([]);
      setBestWeight(Number.MAX_VALUE);
      setSteps([]);
      setStepNum(0);
      setPresentTour(false);
      setConsideredStep([]);
      setAltSteps([]);
    }

    // Function to generate the adjacency matrix
    const generateAdjacencyMatrix = () => {
      const newMatrix = Array.from({ length: numNodes }, () => Array(numNodes).fill(0)); // Initialize a 2D array of 0s
      // Loop through existing edges and update the matrix accordingly
      for (const [edge, weight] of Object.entries(adjacencyMatrix)) {
        const [node1, node2] = edge.split('-').map(Number);
        if (newMatrix[node1] && newMatrix[node2]) {
          newMatrix[node1][node2] = weight;
          newMatrix[node2][node1] = weight; // Symmetrically assign weight [e.g 1-2 and 2-1 have the same weight]
          newMatrix[node1][node1] = 0; // Set the diagonal to 0 [e.g 0-0 has no weight]
          newMatrix[node2][node2] = 0; // Set the diagonal to 0 [e.g 0-0 has no weight] 
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
  
    // Function to reset the graphs state
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
      console.log("Adj matrix generated: ");
      console.log(generateAdjacencyMatrix());
      console.log("BEST TOUR: ");
      console.log(bestTour)
      console.log("CONSIDERED STEP: ");
      console.log(consideredStep)
      console.log("BEST WEIGHT: ");
      console.log(bestWeight)
      console.log("STEPS: ");
      console.log(steps)
      console.log("ALT STEPS: ");
      console.log(altSteps)
      console.log("STEP NUM: ");
      console.log(stepNum)
      console.log("PRESENT TOUR: ");
      console.log(presentTour)
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


    // Function to render the adjacency matrix as a table onto the screen
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

    // TEMPORARY - Display the weight of the selected edge onto the screen
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
  
    // When clicking an edge in the graph, select the adjacnecy matrix input
    const SelectAdjMatrix = (e,node1, node2) => {
      const inputId = `${node1}-${node2}`;
      const inputElement = document.getElementById(inputId);
      if (inputElement) {
        inputElement.focus(); // Focus on the input element
      }
    };

    // Move forwards in the TSP simulation
    const nextStep = () => {
      if (stepNum < bestTour.length) { 
        setSteps(prevSteps => [...prevSteps, bestTour[stepNum]]);
        setStepNum(prevStepNum => prevStepNum + 1);
        setAltSteps(prevSteps => [...prevSteps, consideredStep[stepNum]]);
      } else {
        if (!(steps.length === 0)) {
          setPresentTour(true);
        }
        console.log("Reached maximum step.");
      }
    };
    
    // Move backwards in the TSP simulation
    const prevStep = () => {
      if (stepNum > 0) {
        setPresentTour(false);
        setSteps(steps.slice(0, -1));
        setStepNum(stepNum - 1);
        setAltSteps(altSteps.slice(0, -1));
      } else {
        console.log("Reached minimum step.");
      }
    };

    // Show the answer of the TSP simulation
    const fastForward = () => {
      setSteps(bestTour);
      setStepNum(bestTour.length);
      setPresentTour(true);
      setAltSteps(consideredStep);

    };

    // Restart the TSP simulation
    const restart = () => {
      setSteps([]);
      setStepNum(0);
      setPresentTour(false);
    };

    // Function to render nodes
    const renderNodes = () => {
      let nodeCoordinates = generateNodeCoordinates(numNodes);
      return nodeCoordinates.map((node, index) => (
        renderCustomNode(node, index, steps.includes(index) , steps[steps.length - 1] === index , presentTour)
      ));
    };


    // Helper function to generate TSP algorithm handlers
    const generateTSPHandler = (tspAlgorithm) => {
      return () => {
        tspAlgorithm(resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight , setSteps, setAltSteps ,setStepNum , setConsideredStep);
        logWeights();
      };
    };


    const nodeCoordinates = generateNodeCoordinates(numNodes);
    const AdjMatrix = generateAdjacencyMatrix();
    const currentAltStep = altSteps[altSteps.length - 1];

    // Render the graph and adjacency matrix
    return (
      
      <div className="Graph">
        {/* Title bar */}
        <div className="title-bar bg-dark p-3 d-flex align-items-center justify-content-between">
            <div>
                {/* Styled title */}
                <h2 className="text-white fw-bold d-flex align-items-center">
                    <FaPersonHiking className="me-2" />
                    <span>TSP Heuristic Algorithim Visualiser</span>
                </h2>
            </div>
 
            <div>
                {/* Save button with icon */}
                <button className="btn btn-light mx-4" onClick={saveGraph}>
                    <FaSave className="me-1" />
                    <span className="fw-bold">Save</span>
                </button>
                {/* Load button with icon */}
                <button className="btn btn-light" onClick={loadGraph} >
                    <FaDownload className="me-1" />
                    <span className="fw-bold">Load</span>
                </button>
            </div>
        </div>


        {/* Graph */}
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
                    strokeWidth="3"
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
                  stroke= "black"
                  strokeOpacity="0.5"
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

        {/* Render all alternate connections */}
        {currentAltStep && currentAltStep.map((altNode, index) => {
          console.log("ALT STEPS: ", altSteps, "INDEX: ", index);
          const currentNode = steps[steps.length - 1]; // Get the current node
          const x1 = nodeCoordinates[currentNode].x;
          const y1 = nodeCoordinates[currentNode].y;
          const x2 = nodeCoordinates[altNode].x;
          const y2 = nodeCoordinates[altNode].y;
          const color = "#30bbd1";
          return (
            <line
              key={`${currentNode}-${altNode}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeOpacity="0.5"
              strokeWidth="4"
              onMouseMove={(e) => { showWeightedEdges(e, currentNode, altNode) }}
              onClick={(e) => { SelectAdjMatrix(e, currentNode, altNode); }}
              onMouseOut={(e) => { e.target.style.stroke = color; }}
            />
          );
      })}

        {/* make every line inside best tour red */}
        { steps.map((node, index) => {
          if (index < steps.length - 1) {
            const node1 = steps[index];
            const node2 = steps[index + 1];
            const x1 = nodeCoordinates[node1].x;
            const y1 = nodeCoordinates[node1].y;
            const x2 = nodeCoordinates[node2].x;
            const y2 = nodeCoordinates[node2].y;
            const color = presentTour ? "#ff0000" : "#ff8a27";
            
            return (
              <line
                key={`${node1}-${node2}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth="4"
                onMouseMove={(e) => { showWeightedEdges(e, node1,node2)}}  
                onClick={(e) => { SelectAdjMatrix(e,node1,node2); }}
                onMouseOut={(e) => { e.target.style.stroke = color; }}
              />

            );
          }
        })}

        {/* Render nodes */}
        {renderNodes()}
        
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


          {/* TSP algorithms */}
          <button onClick={generateTSPHandler(bruteForceTSP)}>Brute Force</button>
          <button onClick={generateTSPHandler(NearestNeighborTSP)}>Nearest Neighbor - NW</button>
          <br/> <br/>
          <button onClick={nextStep} > Next Step</button>
          <button onClick={prevStep} > Previous Step</button>
          <button > Play </button>
          <button> Stop </button>
          <button onClick={restart} > BB </button>
          <button onClick ={fastForward}> FF </button>

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