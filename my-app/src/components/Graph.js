import { generateNodeCoordinates, renderCustomNode } from "../utils/GraphUtil";
import { NearestNeighborTSP, BruteForceTSP, GreedyTSP, ChristofidesTSP } from "./TspAlgorithims";
import { FaSave, FaDownload, FaSquare ,FaPlay, FaPause, FaStepForward, FaStepBackward, FaRedo, FaFastForward , FaPlus, FaMinus, FaEraser, FaSync, FaEye, FaRandom, FaHandPointer, FaRuler, FaToggleOff, FaToggleOn} from 'react-icons/fa';
import { FaPersonHiking } from "react-icons/fa6";
import "../utils/Graph.css";
import React from "react";
import { useState , useEffect} from "react";
import { motion } from "framer-motion";





// Represents the graph and its adjacency matrix
function Graph ({numNodes, setNumNodes, adjacencyMatrix, setAdjacencyMatrix, bestTour, setBestTour, bestWeight, setBestWeight , stepNum, setStepNum , steps, setSteps , altSteps, setAltSteps , presentTour, setPresentTour , consideredStep, setConsideredStep, showAdjacencyMatrix, setShowAdjacencyMatrix , christofidesAlgorithim, setChristofidesAlgorithim, setChristofidesStepNum, christofidesStepNum , interactiveMode, setInteractiveMode}) {

    const [algo, setAlgo] = useState("Select Algorithm");
    const [stop, setStop] = useState(true);

    // Function to restart states
    const resetBestTour = () => {
      setBestTour([]);
      setBestWeight(Number.MAX_VALUE);
      setSteps([]);
      setStepNum(0);
      setPresentTour(false);
      setConsideredStep([]);
      setAltSteps([]);
      setChristofidesAlgorithim(false);
      setChristofidesStepNum(0);
      // setAlgo("Select Algorithm");
    }


    // Function to generate the adjacency matrix
    const generateAdjacencyMatrix = () => {
      const newMatrix = Array.from({ length: numNodes }, () => Array(numNodes).fill(0)); // Initialize a 2D array of 0s
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
          resetBestTour();
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

    const showAdjMatrix = () => {
      setShowAdjacencyMatrix(!showAdjacencyMatrix);
    };


    // Function to return the component that renders the adjacency matrix
    const renderAdjacencyMatrix = () => {
      const adjacencyMatrix = generateAdjacencyMatrix();
      return (
          showAdjacencyMatrix ? (
          <div className="table-responsive">
              <table id="adjMatrix" className="table  table-sm adjacency-matrix">
                  <thead>
                      <tr>
                          <th>Node</th>
                          {[...Array(numNodes).keys()].map((node) => (
                              <th key={node}>{node + 1}</th>
                          ))}
                      </tr>
                  </thead>
                  <tbody>
                    
                      {adjacencyMatrix.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                              <td>{rowIndex + 1}</td>
                              {row.map((weight, columnIndex) => (
                                  <td key={columnIndex}>
                                      {columnIndex === rowIndex ? (
                                           <div className="bg-secondary rounded bg-dark " style={{ width: '100%', height: '100%' }}></div> // Gray box for the node itself
                                      ) : (
                                              <input
                                                  className="form-control form-control-sm"
                                                  inputMode="numeric" 
                                                  id={`${rowIndex}-${columnIndex}`}
                                                
                                                  placeholder='0'
                                                  value={weight || ''}
                                                  onChange={(e) => {
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
          </div>
      ) : <div>  

          {

            <div>
                {algo !== "Select Algorithm" ? (
                    <div>
                        <div class="alert alert-info" role="alert">
                            You have selected: <span className="fw-bold">{algo} Algorithm</span>
                        </div>

                        <div className="key">
                            <h5>Key:</h5>
                            <ul class="list-group">
                                {algo === "Brute Force" && (
                                    <>
                                        <li class="algorithm">
                                            <FaSquare className="icon" style={{ color: "#30bbd1" }} />
                                            <span class="badge bg-primary"></span> Current Node
                                        </li>
                                        <li class="algorithm">
                                            <FaSquare className="icon" style={{ color: '#ff8a27' }} />
                                            <span class="badge bg-primary"></span> Current Tour
                                        </li>
                                        <li class="algorithm">
                                            <FaSquare className="icon" style={{ color: '#ff0000' }} />
                                            <span class="badge bg-primary"></span> Final Tour
                                        </li>
                                    </>
                                )}
                                {algo === "Greedy" && (
                                    <>
                                    <li class="algorithm">
                                        <FaSquare className="icon" style={{ color: '#ff8a27' }} />
                                        <span class="badge bg-primary"></span> Current Tour
                                    </li>
                                    <li class="algorithm">
                                        <FaSquare className="icon" style={{ color: '#ff0000' }} />
                                        <span class="badge bg-primary"></span> Final Tour
                                    </li>
                                    </>
                                )}
                                {algo === "Nearest Neighbor" && (
                                    <>
                                    <li class="algorithm">
                                        <FaSquare className="icon" style={{ color: "#30bbd1" }} />
                                        <span class="badge bg-primary"></span> Current Edge + Potential Next Edges
                                    </li>
                                    <li class="algorithm">
                                        <FaSquare className="icon" style={{ color: '#ff8a27' }} />
                                        <span class="badge bg-primary"></span> Current Tour
                                    </li>
                                    <li class="algorithm">
                                        <FaSquare className="icon" style={{ color: '#ff0000' }} />
                                        <span class="badge bg-primary"></span> Final Tour
                                    </li>
                                    </>
                                )}
                                {algo === "Christofides" && (
                                    <>
                                    <li class="algorithm">
                                        <FaSquare className="icon" style={{ color: "#2730ff" }} />
                                        <span class="badge bg-primary"></span> Minimum Spanning Tree
                                    </li>
                                    <li class="algorithm">
                                        <FaSquare className="icon" style={{ color: "#ff2730" }} />
                                        <span class="badge bg-primary"></span> Minimum Weight Perfect Matching for Odd Vertices 
                                    </li>
                                    <li class="algorithm">
                                        <FaSquare className="icon" style={{ color: "#e100ff" }} />
                                        <span class="badge bg-primary"></span> Connected Multigraph
                                    </li>
                                    <li class="algorithm">
                                        <FaSquare className="icon" style={{ color: '#ff8a27' }} />
                                        <span class="badge bg-primary"></span> Hamiltoinian Cycle 
                                    </li>
                                    <li class="algorithm">
                                        <FaSquare className="icon" style={{ color: '#ff0000' }} />
                                        <span class="badge bg-primary"></span> Final Tour
                                    </li>
                                    </>
                                )}
                            </ul>


                       
                        </div>



                    </div>
                ) : (
                    <div>
                        <div class="alert alert-primary" role="alert">
                        Begin by constructing the graph and assigning weights. Then, choose a TSP algorithm to visualise.
                        </div>
                    </div>
                )}
            </div>
        }
      </div>
      );
    };


    // TEMPORARY - Display the weight of the selected edge onto the screen
    const showWeight = (e, node1, node2) => {
      const weight = adjacencyMatrix[`${node1}-${node2}`];
     
    }
    
    const showWeightedEdges = (e, node1, node2) => {
      // e.target.style.stroke = "#00aeff";
      showWeight(e, node1, node2);
    }
  
    const showUnweightedEdges = (e, node1, node2) => {
      // e.target.style.stroke = "#00aeff";
      showWeight(e, node1, node2);
    }
  
    // When clicking an edge in the graph, select the adjacnecy matrix input
    const SelectAdjMatrix = (e, node1, node2) => {
      setShowAdjacencyMatrix(true);
      setTimeout(() => {
        const inputId = `${node1}-${node2}`;
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
          inputElement.focus(); // Focus on the input element
        }
      }, 1); // Delay to make sure adjancecy matrix shown if hidden 

    };

    const logTour = (e, node1, node2) => {
      console.log("_________________________");
      console.log("Best Tour: ");
      console.log(bestTour);
      console.log("Steps: ")
      console.log(steps);
      console.log(stepNum);
      console.log("Considered Steps: ")
      console.log(consideredStep);
      console.log("Alternate Steps: ")
      console.log(altSteps);
      console.log("_________________________");
    };


    // Move forwards in the TSP simulation
    const nextStep = () => {

      // call the same algorithim on any graph we we reset
      // if (stepNum === 0) {
      //   if (algo === "Brute Force") {
      //     BruteForceTSP(resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight , setSteps, setAltSteps ,setStepNum , setConsideredStep, setChristofidesAlgorithim);
      //   }
      //   if (algo === "Nearest Neighbor") {
      //     NearestNeighborTSP(resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight , setSteps, setAltSteps ,setStepNum , setConsideredStep, setChristofidesAlgorithim);
      //   }
      //   if (algo === "Greedy") {
      //     GreedyTSP(resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight , setSteps, setAltSteps ,setStepNum , setConsideredStep, setChristofidesAlgorithim);
      //   }
      //   if (algo === "Christofides") {
      //     ChristofidesTSP(resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight , setSteps, setAltSteps ,setStepNum , setConsideredStep, setChristofidesAlgorithim);
      //   }
      // }


      if (stepNum < bestTour.length) { 

        setSteps(prevSteps => [...prevSteps, bestTour[stepNum]]);
        setStepNum(prevStepNum => prevStepNum + 1);
        setChristofidesStepNum(prevStepNum => prevStepNum + 1);
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
        setChristofidesStepNum(christofidesStepNum - 1);
        setAltSteps(altSteps.slice(0, -1));
      } else {
        console.log("Reached minimum step.");
      }
    };

    // Show the answer of the TSP simulation
    const fastForward = () => {
      if (algo != "Select Algorithm") {
        setSteps(bestTour);
        setChristofidesStepNum(4);
        setStepNum(bestTour.length);
        setPresentTour(true);
        setAltSteps(consideredStep);
      }
    };

    // Restart the TSP simulation
    const restart = () => {
      setSteps([]);
      setStepNum(0);
      setPresentTour(false);
    };


    const play = () => {
      console.log("Play button clicked");
      setStop(!stop);
    };


    // Function to render nodes
    const renderNodes = () => {
      let nodeCoordinates = generateNodeCoordinates(numNodes);
      const flattenedSteps = steps.flat(); // Flatten the steps array if it's 2D
      const flattendedLastStep = (christofidesAlgorithim && lastStep) ? lastStep.flat() : []; // Flatten the last step array if it's 2D
      return nodeCoordinates.map((node, index) => (
        renderCustomNode(node, index, (flattenedSteps.includes(index) || flattendedLastStep.includes(index))  , (steps[steps.length - 1] === index), presentTour , christofidesAlgorithim, christofidesStepNum)
      ));
    };

   
    // Function to return the name of the TSP algorithm
    function functionName(fun) {
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


    // Helper function to generate TSP algorithm handlers
    const generateTSPHandler = (tspAlgorithm) => {
      return () => {
        setAlgo(functionName(tspAlgorithm));
        tspAlgorithm(resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight , setSteps, setAltSteps ,setStepNum , setConsideredStep, setChristofidesAlgorithim);
      };
    };

    // Variables that will help us render the graph
    const nodeCoordinates = generateNodeCoordinates(numNodes);
    const AdjMatrix = generateAdjacencyMatrix();
    const lastStep = steps[steps.length - 1];
    const currentAltStep = altSteps[altSteps.length - 1];

    const eachStepIsTour = lastStep && Array.isArray(lastStep) && lastStep.length > 2; // for brute force

    // Render the graph and adjacency matrix
    return (
      <div className="Graph">
        {/* Title bar */}
        <div className="title-bar bg-dark p-3 px-4 d-flex justify-content-between">
          
          <div>
            {/* Styled title */}
            <h2 className="text-white fw-bold d-flex align-items-center justify-content-between">
              <FaPersonHiking className="me-2" />
              <span>TSP Heuristic Algorithm Visualizer</span>
            </h2>
          </div>

          <div>
            <div class="btn-group">
              <a class="btn btn-light dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">
                <span className="fw-bold">Select Algorithim</span>
              </a>
              <ul class="dropdown-menu">
                <li><a  onClick={generateTSPHandler(BruteForceTSP)}  class="dropdown-item" href="#">Brute Force</a></li>
                <li><a  onClick={generateTSPHandler(NearestNeighborTSP)} class="dropdown-item" href="#">Nearest Neighbor</a></li>
                <li><a  onClick={generateTSPHandler(GreedyTSP)} class="dropdown-item" href="#">Greedy</a></li>
                <li><a  onClick={generateTSPHandler(ChristofidesTSP)} class="dropdown-item" href="#">Christofides</a></li>
              </ul>
            </div>
  
            {/* Save and load buttons with icons */}
            <button className="btn btn-light mx-4" onClick={saveGraph}>
              <FaSave className="me-1" />
              <span className="fw-bold">Save</span>
            </button>
            <button className="btn btn-light" onClick={loadGraph} >
              <FaDownload className="me-1" />
              <span className="fw-bold">Load</span>
            </button>
          </div>
        </div>



        <div className="container-fluid d-flex flex-column">
          <div className="row flex-grow-1">
          {/* Graph */}
          <div className="col-lg-8">
          <svg width="700" height="700">
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
                      class="edge"
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
                      // onMouseOut={(e) => { e.target.style.stroke = "black"; }}
                    />
                    </a>
                  ) : (

          
                  <a href="#" class="pe-auto">
                  <line
                    class="edge"  
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
                    // onMouseOut={(e) => { e.target.style.stroke = "black"; }}
                  />
                  </a>

                
                  ) // Show line differently if the value is "NA"
                );
                
              })
            );
          })}

          {/* Render all alternate connections */}
          {!interactiveMode && currentAltStep && currentAltStep.map((altNode, index) => {
            const currentNode = steps[steps.length - 1]; // Get the current node
            const x1 = nodeCoordinates[currentNode].x;
            const y1 = nodeCoordinates[currentNode].y;
            const x2 = nodeCoordinates[altNode].x;
            const y2 = nodeCoordinates[altNode].y;
            const color = "#30bbd1";
            
            return (
              <motion.line
                class="edge"
                key={`${currentNode}-${altNode}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeOpacity="0.5"
                strokeWidth="4"

                initial={{ pathLength: 0, x2: x1, y2: y1 }} // Initial values
                animate={{ pathLength: 1, x2: x2, y2: y2 }} // Animate to final values
                transition={{ duration: 0.45 , delay: 0.45 }} // Adjust the duration of the animation
                
                onMouseMove={(e) => { showWeightedEdges(e, currentNode, altNode) }}
                onClick={(e) => { SelectAdjMatrix(e, currentNode, altNode); }}
                // onMouseOut={(e) => { e.target.style.stroke = color; }}
              />
            );
        })}

          {/* make every line inside best tour red */}
          {christofidesAlgorithim ? (
              lastStep && lastStep.map((node, index) => {
                  if (Array.isArray(node)) {
                      const node1 = node[0];
                      const node2 = node[1];

                      const x1 = nodeCoordinates[node1].x;
                      const y1 = nodeCoordinates[node1].y;
                      const x2 = nodeCoordinates[node2].x;
                      const y2 = nodeCoordinates[node2].y;

                      let color = "#ff8a27"

                      if (christofidesStepNum === 1) {
                        color = "#2730ff";
                      }
                      else if (christofidesStepNum === 2) {
                        color = "#ff2730";
                      }
                      else if (christofidesStepNum === 3){
                        color = "#e100ff";

                        // Check if [1, 3] is in secondLast
                        // const secondLast = steps[steps.length - 3];
                        // const isPresent = secondLast.some(step => step[0] === node1 && step[1] === node2);
                        // if (isPresent) {
                        //     color =  "#e100ff"; // Set color to pink if [1, 3] is present
                        // } else {
                        //     color = "#ff2730" ; // Set color to orange if [1, 3] is not present
                        // }
                      }
                      
                      return (
                          <motion.line
                              class="edge"
                              key={`${node1}-${node2}`}
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke={color}
                              strokeWidth="4"

                              initial={{ pathLength: 0, x2: x1, y2: y1 }} // Initial values
                              animate={{ pathLength: 1, x2: x2, y2: y2 }} // Animate to final values
                              transition={{ duration: 0.5}} // Adjust the duration of the animation

                              onMouseMove={(e) => { showWeightedEdges(e, node1, node2); }}
                              onClick={(e) => { SelectAdjMatrix(e, node1, node2); }}
                              // onMouseOut={(e) => { e.target.style.stroke = color; }}
                          />
                      );
                  } else {
         

                      if (index < lastStep.length - 1) {
                          const node1 = lastStep[index];
                          const node2 = lastStep[index + 1];
                          const x1 = nodeCoordinates[node1].x;
                          const y1 = nodeCoordinates[node1].y;
                          const x2 = nodeCoordinates[node2].x;
                          const y2 = nodeCoordinates[node2].y;
                          let color = "#ff8a27"
                          if (christofidesStepNum === 4) {
                            color = presentTour ? "#ff0000" : "#ff8a27";
                          }
                          return (
                              <motion.line
                                  class="edge"
                                  key={`${node1}-${node2}`}
                                  x1={x1}
                                  y1={y1}
                                  x2={x2}
                                  y2={y2}
                                  stroke={color}
                                  strokeWidth="4"  

                                  initial={{ pathLength: 0, x2: x1, y2: y1 }} // Initial values
                                  animate={{ pathLength: 1, x2: x2, y2: y2 }} // Animate to final values
                                  transition={{ duration: 0.45 }} // Adjust the duration of the animation

                                  onMouseMove={(e) => { showWeightedEdges(e, node1, node2); }}
                                  onClick={(e) => { SelectAdjMatrix(e, node1, node2); }}
                                  // onMouseOut={(e) => { e.target.style.stroke = color; }}
                              />
                          );
                      }
                  }
              })

          ) : (
              // All other algorithms
              
              
              steps.map((node, index) => {
                if (Array.isArray(node)) {
                    const node1 = node[0];
                    const node2 = node[1];
                    const x1 = nodeCoordinates[node1].x;
                    const y1 = nodeCoordinates[node1].y;
                    const x2 = nodeCoordinates[node2].x;
                    const y2 = nodeCoordinates[node2].y;
                    const color = presentTour ? "#ff0000" : "#ff8a27";
                    return (
                        <motion.line
                            class="edge"
                            key={`${node1}-${node2}`}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={color}
                            strokeWidth="4"

                            initial={{ pathLength: 0, x2: x1, y2: y1 }} // Initial values
                            animate={{ pathLength: 1, x2: x2, y2: y2 }} // Animate to final values
                            transition={{ duration: 0.45 }} // Adjust the duration of the animation

                            onMouseMove={(e) => { showWeightedEdges(e, node1, node2); }}
                            onClick={(e) => { SelectAdjMatrix(e, node1, node2); }}
                            // onMouseOut={(e) => { e.target.style.stroke = color; }}
                        />
                    );
                  } else {
                      if (index < steps.length - 1) {
                          const node1 = steps[index];
                          const node2 = steps[index + 1];
                          const x1 = nodeCoordinates[node1].x;
                          const y1 = nodeCoordinates[node1].y;
                          const x2 = nodeCoordinates[node2].x;
                          const y2 = nodeCoordinates[node2].y;
                          const color = presentTour ? "#ff0000" : "#ff8a27";
                          return (
                              <motion.line
                                  class="edge"
                                  key={`${node1}-${node2}`}
                                  x1={x1}
                                  y1={y1}
                                  x2={x2}
                                  y2={y2}
                                  stroke={color}
                                  strokeWidth="4"

                                  initial={{ pathLength: 0, x2: x1, y2: y1 }} // Initial values
                                  animate={{ pathLength: 1, x2: x2, y2: y2 }} // Animate to final values
                                  transition={{ duration: 0.45 }} // Adjust the duration of the animation

                                  onMouseMove={(e) => { showWeightedEdges(e, node1, node2); }}
                                  onClick={(e) => { SelectAdjMatrix(e, node1, node2); }}
                                  // onMouseOut={(e) => { e.target.style.stroke = color; }}
                              />
                          );
                      }
                  }
              })
          )}

          {/* Render nodes */}
          {renderNodes()}
          
          </svg>
          </div>
            
            {/* Adjacency Matrix */}
            <div className="col-lg-4 py-5 d-flex flex-column justify-content-between">
              <div className="adjacency-matrix-container">
              {renderAdjacencyMatrix()}
              </div>


              {
                presentTour && (
                  <div class="alert alert-success" role="alert">
                    <span className="fw-bold">Final Tour</span> has been found! 
                    <br/>
                    <span className="fw-bold"> Weight: {bestWeight} </span>
                  </div>
                )
              }


              {/* Additional buttons */}
              <div className="edit-graph-box p-3 border">
                <h3>Edit Graph</h3>
                <div className="d-flex flex-wrap gap-2 justify-content-evenly">
                  <button onClick={() => addNode()} className="btn btn-outline-dark btn-sm ">  <FaPlus/> Add Node</button>
                  <button onClick={() => removeNode()} disabled={numNodes === 0} className="btn btn-outline-dark btn-sm"><FaMinus /> Remove Node</button>
                  <button onClick={() => resetGraph()} className="btn btn-outline-dark btn-sm"><FaSync /> Reset Graph</button>
                  <button onClick={() => clearWeights()} className="btn btn-outline-dark btn-sm"><FaEraser /> Clear Weights</button>
                  <button onClick={() => generateRandomWeights()} className="btn btn-outline-dark btn-sm"><FaRandom /> Random Weight</button>
                  <button onClick={() => showAdjMatrix()} className="btn btn-outline-dark btn-sm"><FaRuler /> Show Distance</button>
                  <button onClick={() => logTour()} className="btn btn-outline-dark btn-sm"><FaEye /> loggin</button>
                </div>
              </div>

            </div>
          </div>

          {/* Control buttons */}
          
          <div className="title-bar bg-dark d-flex align-items-center justify-content-center fixed-bottom w-100 p-3">

            {
              interactiveMode ? (
                <>

                <button className="btn btn-success mx-1" onClick={() => setInteractiveMode(!interactiveMode)}><FaToggleOn /> Interactive Mode  </button>
                </>
              ) : (
                <>
                <button className="btn btn-light mx-1" onClick={prevStep}><FaStepBackward /></button>
                <button className="btn btn-light mx-1" onClick={play}>   {stop ? <FaPlay /> : <FaPause />}</button>
                <button className="btn btn-light mx-1" onClick={nextStep}><FaStepForward /></button>
                <button className="btn btn-light mx-1" onClick={restart}><FaRedo /></button>
                <button className="btn btn-light mx-1" onClick={fastForward}><FaFastForward /></button>
                <button className="btn btn-danger mx-1" onClick={() => setInteractiveMode(!interactiveMode)}> <FaToggleOff /> Interactive Mode </button>
                </>
              )
            }
           
          </div>
        </div>



      </div>
    );
  }


  export default Graph;