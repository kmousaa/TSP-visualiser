// Graph.js

// External imports
import React from "react";
import "react-toggle/style.css";
import "../utils/Graph.css";
import Tooltip from '@mui/material/Tooltip';

import { generateNodeCoordinates, renderCustomNode } from "../utils/GraphUtil";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { FaSave, FaDownload, FaSquare ,FaPlay, FaPause, FaStepForward, FaStepBackward, FaFastForward , FaPlus, FaMinus, FaEraser, FaSync, FaEye, FaRandom , FaRuler , FaRegHandPointLeft, FaFastBackward} from 'react-icons/fa';
import { IoIosCheckmarkCircle } from "react-icons/io";
import { BiSolidError } from "react-icons/bi";
import { FaPersonHiking } from "react-icons/fa6";
import { AiTwotoneExperiment } from "react-icons/ai";
import { useState , useEffect} from "react";
import { motion } from "framer-motion";
import { RxQuestionMarkCircled } from "react-icons/rx";

import Toggle from 'react-toggle';

// Internal imports
import {getAdjacentNodes , sortDictionary, removeDupeDict, calculateTextAttributes, generateTextJSX, areOddVerticesConnected, functionName} from "../utils/GraphUtil";
import { NearestNeighborTSP, BruteForceTSP, GreedyTSP, ChristofidesTSP , hasCycle} from "./TspAlgorithims";
import presetGraphs from '../utils/preset_graphs.json';



// Represents the graph and its adjacency matrix
function Graph ({numNodes, setNumNodes, adjacencyMatrix, setAdjacencyMatrix, bestTour, setBestTour, bestWeight, setBestWeight , stepNum, setStepNum , steps, setSteps , altSteps, setAltSteps , presentTour, setPresentTour , consideredStep, setConsideredSteps, showAdjacencyMatrix, setShowAdjacencyMatrix , christofidesAlgorithim, setChristofidesAlgorithim, setChristofidesStepNum, christofidesStepNum , interactiveMode, setInteractiveMode}) {

    // States to handel graph visualisation
    const [algo, setAlgo] = useState("Select Algorithm");
    const [stop, setStop] = useState(true);
    const [clickedNode, setClickedNode] = useState(null);
    const [clickedEdge, setClickedEdge] = useState(null);
    const [beginInteractiveMode, setBeginInteractiveMode] = useState(false);
    const [beginVisualisationMode, setBeginVisualisationMode] = useState(false);


    // States to handel the Christofides algorithim interactive mode
    const [mst, setMst] = useState([[]]);
    const [mstWeight, setMstWeight] = useState(0);
    const [oddDegreeVerticies, setOddDegreeVerticies] = useState([]);
    const [minOddPairWeight, setMinOddPairWeight] = useState(0);
    const [minOddPairNum, setMinOddPairNum] = useState(0);
    const [multiGraph, setMultiGraph] = useState([[]]);

    const [expectingInput, setExpectingInput] = useState(false);
    const [inputValueEularian, setInputEularian] = useState('');
    const [inputHamiltonian, setInputHamiltonian] = useState('');
    const [stepStore, setStepStore] = useState([]);
    const [tempAdjacencyMatrix, setTempAdjMatrix] = useState({});
    const [maxChristofidesStep, setMaxChristofidesStep] = useState(0);

    // Error handeling
    const [errorAlertVisible, setErrorAlertVisible] = useState(false);
    const [errorAlertMessage, setErrorAlertMessage] = useState('');
    const [errorAlertTimeout, setErrorAlertTimeout] = useState(null); // State for managing timeout ID

    const showErrorAlert = (errorMessage) => {
      setErrorAlertMessage(errorMessage);
      setErrorAlertVisible(true);
      clearTimeout(errorAlertTimeout); // Clear the previous timeout
      setErrorAlertTimeout(setTimeout(() => {
        setErrorAlertVisible(false);
      }, 4000)); // Hides the alert after 5 seconds
    };

    // reset edge and node after 1ms
    useEffect(() => {
      if (clickedEdge) {
        setTimeout(() => {
          setClickedEdge(null);
        }, 1);
      }
    }, [clickedEdge]);

    useEffect(() => {
      if (clickedNode) {
        setTimeout(() => {
          setClickedNode(null);
        }, 1);
      }
    }, [clickedNode]);




    // Function to restart states
    const resetBestTour = () => {
      setBestTour([]);
      setBestWeight(Number.MAX_VALUE);
      setSteps([]);
      setStepNum(0);
      setPresentTour(false);
      setConsideredSteps([]);
      setAltSteps([]);
      setChristofidesAlgorithim(false);
      setChristofidesStepNum(0);
      setClickedNode(null);
      setExpectingInput(false);
      setTempAdjMatrix({});
      setStepStore([]);
      setStop(true);
      setMaxChristofidesStep(0);
    }


    // Handels user input for the Christofides algorithim
    const handleChangeEularian = (event) => {
      setInputEularian(event.target.value);
    };

    const handleChangeHamiltonian = (event) => {
      setInputHamiltonian(event.target.value);
    };

    const handleSubmit = () => {
      nextChristofidesStep(inputValueEularian, inputHamiltonian);
      setInputEularian('');
      setInputHamiltonian('');
    };
  

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
    
    // Graph creation functions
    const addNode = () => {
      resetBestTour();
      setNumNodes(numNodes + 1);
    };
  
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
  
    const resetGraph = () => {
      resetBestTour();
      setNumNodes(0);
      setAdjacencyMatrix({});
    };
  
    const clearWeights = () => {
      resetBestTour();
      setAdjacencyMatrix({});
      setInteractiveMode(false);
    };

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

    // imports preset graphs from preset_graphs.json
    const randomPresetGraph = () => {
      resetBestTour();
      const randomIndex = Math.floor(Math.random() * presetGraphs.length);
      const randomGraph = presetGraphs[randomIndex];
      setNumNodes(randomGraph.numNodes);
      setAdjacencyMatrix(randomGraph.adjacencyMatrix);
    };
    
    // Function to update edge weight in the adjacency matrix
    const updateEdgeWeight = (node1, node2, weight) => {
      resetBestTour();
      const newWeights = { ...adjacencyMatrix }; 
      newWeights[`${node1}-${node2}`] = Number(weight);
      newWeights[`${node2}-${node1}`] = Number(weight); // Symmetrically assign weight
      if (weight === "") {
        newWeights[`${node1}-${node2}`] = 0;
        newWeights[`${node2}-${node1}`] = 0; 
      }
      setAdjacencyMatrix(newWeights);
    };
    

    // Function to add random weights to the adjacency matrix without triangle inequality
    const generateRandomWeights = () => {
      resetBestTour();
      let newWeights = {};

      // Brute-force approach to ensure no triangle inequality
      while (true) {
          newWeights = generateWeights();
          if (!hasTriangleInequality(newWeights)) {
              break; // Found valid weights without triangle inequality
          }
      }

      setAdjacencyMatrix(newWeights);
    };

    // Generate random weights
    const generateWeights = () => {
      const weights = {};
      for (let i = 0; i < numNodes; i++) {
          for (let j = i + 1; j < numNodes; j++) {
              const weight = Math.floor(Math.random() * 50) + 1; // Generate a random weight between 1 and 20
              weights[`${i}-${j}`] = weight;
              weights[`${j}-${i}`] = weight; // Symmetrically assign weight
          }
      }
      return weights;
    };

    // Check for triangle inequality
    const hasTriangleInequality = (weights) => {
      for (const [edge1, weight1] of Object.entries(weights)) {
          const [i, j] = edge1.split('-').map(Number);
          for (const [edge2, weight2] of Object.entries(weights)) {
              const [j2, k] = edge2.split('-').map(Number);
              if (j === j2 && i !== k) {
                  const edge3 = `${i}-${k}`;
                  const weight3 = weights[edge3] || weights[`${k}-${i}`];
                  if (weight3 && (weight1 + weight2 <= weight3 || weight1 + weight3 <= weight2 || weight2 + weight3 <= weight1)) {
                      return true; // Triangle inequality violated
                  }
              }
          }
      }
      return false; // No triangle inequality found
    };

    const showAdjMatrix = () => {
      setShowAdjacencyMatrix(!showAdjacencyMatrix);
    };

    // Function to return the component that renders the adjacency matrix
    const renderAdjacencyMatrix = () => {
      
      const adjacencyMatrix = generateAdjacencyMatrix()
      

      let percent = (stepNum / bestTour.length) * 100;
      if (interactiveMode && algo === "Christofides") {
        percent = (christofidesStepNum / bestTour.length) * 100;
      }


      return (
          showAdjacencyMatrix ? (
          <>
          <div className="table-responsive" data-testid="distance-matrix">
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
          <button onClick={() => showAdjMatrix()} className="btn btn-outline-dark btn-sm"> <IoIosCheckmarkCircle /> Done </button>
          </>
      ) : <div>  

          {
            <div>
              {errorAlertVisible && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <span className="fw-bold">
                  <BiSolidError className="pr-5" /> 
                  {" " + errorAlertMessage}
                  </span>
                </div>
              )}
              {interactiveMode ? (
              <div class="alert alert-warning d-flex align-items-center " role="alert">
                  <span className="fw-bold"> <AiTwotoneExperiment /> Interactive mode</span>
              </div>
              ) : ( 
                <div class="alert alert-warning d-flex align-items-center " role="alert">
                  <span className="fw-bold"> <FaEye />    Visualisation mode</span>
                </div>

               )}

                {algo !== "Select Algorithm" ? (
                    <div>

                        <div class="alert alert-info d-flex align-items-cente" role="alert">
                        <span className="fw-bold">{algo} Algorithm</span>
                        </div>

                        <div className="key">
                        <div className="progress mb-4">
                          <div
                            className="progress-bar progress-bar-striped bg-info "
                            role="progressbar"
                            style={{ width: `${percent}%` }}
                            aria-valuenow={percent}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                            <h5>Key:</h5>
                            <ul class="list-group">
                                {algo === "Brute Force" && (
                                    <>
                                        <li class="algorithm">
                                            <FaSquare className="icon" style={{ color: '#ff8a27' }} />
                                            <span class="badge bg-primary"></span> Current Tour {(presentTour === false ) ? <FaRegHandPointLeft /> : null}
                                        </li>
                                        <li class="algorithm">
                                            <FaSquare className="icon" style={{ color: '#ff0000' }} />
                                            <span class="badge bg-primary"></span> Final Tour {(presentTour === true ) ? <FaRegHandPointLeft /> : null}
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
                                        <span class="badge bg-primary"></span> Current Tour {(presentTour === false ) ? <FaRegHandPointLeft /> : null}
                                    </li>
                                    <li class="algorithm">
                                        <FaSquare className="icon" style={{ color: '#ff0000' }} />
                                        <span class="badge bg-primary"></span> Final Tour {(presentTour === true ) ? <FaRegHandPointLeft /> : null}
                                    </li>
                                    </>
                                )}
                                {algo === "Christofides" && (
                                    <>
                                    <li class="algorithm">
                                        <FaSquare className="icon" style={{ color: "#2730ff" }} />
                                        <span class="badge bg-primary"></span> Minimum Spanning Tree {(christofidesStepNum === 0 || christofidesStepNum === 1 ) ? <FaRegHandPointLeft /> : null}
                                    </li>
                                    <li class="algorithm">
                                        <FaSquare className="icon" style={{ color: "#ff2730" }} />
                                        <span class="badge bg-primary"></span> Minimum Weight Perfect Matching for Odd Vertices {christofidesStepNum === 2 ? <FaRegHandPointLeft /> : null}
                                    </li>
                                    <li class="algorithm">
                                        <FaSquare className="icon" style={{ color: "#e100ff" }} />
                                        <span class="badge bg-primary"></span> Connected Multigraph {christofidesStepNum === 3 ? <FaRegHandPointLeft /> : null}
                                    </li>
                                    <li class="algorithm">
                                        <FaSquare className="icon" style={{ color: '#ff8a27' }} />
                                        <span class="badge bg-primary"></span> Hamiltoinian Cycle {presentTour === false && christofidesStepNum === 4 ? <FaRegHandPointLeft /> : null}
                                    </li>
                                    <li class="algorithm">
                                        <FaSquare className="icon" style={{ color: '#ff0000' }} />
                                        <span class="badge bg-primary"></span> Final Tour {presentTour === true  && christofidesStepNum === 4 ? <FaRegHandPointLeft /> : null}
                                    </li>
                                    </>
                                )}
                            </ul>                       
                        </div>

                    </div>
                ) : (
                    <div>
                      <div class="alert alert-primary text-left" role="alert">
                          <h4>Instructions:</h4> 
                          <p class="text-left d-flex justify-content-start">1) Create the graph and assign weights.</p>
                          <p class="text-left d-flex justify-content-start">2) Select an algorithm for visualization.</p>
                          <p class="text-left d-flex">3) Test yourself by selecting interactive mode.</p>
                          <p>Please be aware of the triangle inequality when adding weights to the graph. You can use our preset graphs.</p>
                      </div>
                    </div>
                )}
            </div>
        }
      </div>
      );
    };

    const showWeight = (e, node1, node2) => {
      const weight = adjacencyMatrix[`${node1}-${node2}`];
    }
    
    const showWeightedEdges = (e, node1, node2) => {
      showWeight(e, node1, node2);
    }
  
    const showUnweightedEdges = (e, node1, node2) => {
      showWeight(e, node1, node2);
    }
  
    // When clicking an edge in the graph, select the adjacnecy matrix input
    const SelectAdjMatrix = (e, node1, node2) => {
      // Adj matrix not shown if interactive mode is on
      if (interactiveMode) {
        setClickedEdge([node1, node2]);
        setShowAdjacencyMatrix(false);
        return;
      }
      setShowAdjacencyMatrix(true);
      setTimeout(() => {
        const inputId = `${node1}-${node2}`;
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
          setClickedEdge([node1, node2]);
          inputElement.focus(); // Focus on the input element
        }
      }, 1); 
    };

    // Check if we have a valid tour present
    function checkUndefined() {
      if (bestTour.length === 0) {
        showErrorAlert('Add weights to all edges before running the algorithm');
        return true;
      }
      
      if (bestTour.includes(-1) || bestTour.flat().includes(-1)) {
        showErrorAlert('Add weights to all edges before running the algorithm');
        return true;
      }
    }
    
    // Checks if the current input for christofides interactive mode is correct before moving to the next step
    const nextChristofidesStep = (eularianInput , hamiltonianInput) => {

      if (christofidesStepNum === 1) {
        let mstStep = steps[0];

        // weight of the MST
        let calculatedMstWeight = 0;
        for (let edge of mstStep) {
          calculatedMstWeight += adjacencyMatrix[`${edge[0]}-${edge[1]}`];
        }

        // Compares the calculated MST weight to the user defined MST weight
        if (calculatedMstWeight === mstWeight) {
        
          // Call the algorithim again to refresh the states, using the user defined mst
          let stepsBefore = steps;
          let data = ChristofidesTSP(resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight, setSteps, setAltSteps, setStepNum, setConsideredSteps, setChristofidesAlgorithim, mstStep);
          
          // Updates information needed for future steps
          setMst(mstStep);
          setMstWeight(data.matchingWeight);
          setOddDegreeVerticies(data.oddDegreeNodes);
          setMinOddPairWeight(data.matchingWeight);
          setMinOddPairNum(data.bestMatch.length);

          // Proceed to the next step
          setChristofidesStepNum(2);
          setMaxChristofidesStep(2);
          setStepNum(1);
          setSteps([...stepsBefore, []]);

        }
        else{
          // Clear the MST steps
          setSteps([]);
          setSteps(prevSteps => {
            const newState = prevSteps.slice(0, -1); 
            newState.push([]);
            return newState;
          });
          showErrorAlert("Selected MST is incorrect");
          
        }

      }

      else if (christofidesStepNum === 2) {
        
        let bestPairStep = steps[steps.length - 1];

        // weight of the perfect weight matching
        let calculatedMatchingWeight = 0;
        for (let edge of bestPairStep) {
          calculatedMatchingWeight += adjacencyMatrix[`${edge[0]}-${edge[1]}`];
        }

        // Checks if the users perfect matching weight is correct,
        if (calculatedMatchingWeight === minOddPairWeight && bestPairStep.length === minOddPairNum && areOddVerticesConnected(bestPairStep, oddDegreeVerticies)) {

          // Call the algorithim again to refresh the states, using the user defined perfect weight matching
          let stepsBefore = steps;
          let data = ChristofidesTSP(resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight, setSteps, setAltSteps, setStepNum, setConsideredSteps, setChristofidesAlgorithim, mst,  bestPairStep);

          
          // Update information needed for future steps
          setMstWeight(data.matchingWeight);
          setOddDegreeVerticies(data.oddDegreeNodes);
          setMinOddPairWeight(data.matchingWeight);
          setMinOddPairNum(data.bestMatch.length);
          setMultiGraph(data.multigraph);


          // Proceed to the next step

          setChristofidesStepNum(3);
          setMaxChristofidesStep(3);
          setStepNum(2);
          setSteps([...stepsBefore, []]);
          
        }
        else{
          // Clear the perfect matching steps
          showErrorAlert("Minimum weight perfect matching is incorrect");
          setSteps(prevSteps => {
            const newState = prevSteps.slice(0, -1);
            newState.push([]);
            return newState;
          });

        }

      }
      else if (christofidesStepNum === 3){

        // Function to see if 2 arrays are equal
        const isEqual = (a, b) => JSON.stringify(a.sort()) === JSON.stringify(b.sort());
        
        // If user inputted the correct multiGraph, then proceed
        if (isEqual(steps[steps.length - 1], multiGraph)) {
          setExpectingInput(true);
        }
        else{
          // Clear the multigraph steps
          showErrorAlert("Selected multigraph is incorrect");
          setSteps(prevSteps => {
            const newState = prevSteps.slice(0, -1); 
            newState.push([]);
            return newState;
          });
        } 
      }
      
      // Last step, the user is expected to input the eularian and hamiltonian tour
      if (eularianInput !== "" && eularianInput !== null && hamiltonianInput !== "" && hamiltonianInput !== null){

        if (expectingInput === true){
          
          // Dicitonary that stores edge and a boolean indicited if the edge has been visited
          let visitedEdgeDict = {};
          for (let edge of multiGraph) {
            visitedEdgeDict[edge] = false;
          }

          // - Check if edge [node1,node2] exists in the multigraph tour in any order. If it does, mark it as visited.
          // - If all edges are visited, then the Eulerian tour is correct.
          // - If we visit an edge that is already visited, then the Eulerian tour is incorrect.
          // - If we visit an edge that does not exist, then the Eulerian tour is incorrect.
          // - All edges in multiGraph must be visited.

          // Reduce the user input by 1 to match the array index
          let eularianInputArray = eularianInput.split(',').map(Number);
          for (let i = 0; i < eularianInputArray.length; i++) {
            eularianInputArray[i] -= 1;
          }

          let correctEulerianTour = true;
          for (let i = 0; i < eularianInputArray.length - 1; i++) {

              let node1 = parseInt(eularianInputArray[i]);
              let node2 = parseInt(eularianInputArray[i + 1]);          
              let found = false;

              for (let edge of multiGraph) {
                  if ((edge[0] === node1 && edge[1] === node2) || (edge[0] === node2 && edge[1] === node1)) {
                      found = true;
                      break;
                  }
              }
              if (found) {
                  if (visitedEdgeDict[[node1,node2]] === true || visitedEdgeDict[[node2,node1]] === true) {
                      correctEulerianTour = false;
                      break;
                  }
                  visitedEdgeDict[[node1,node2]] = true;
                  visitedEdgeDict[[node2,node1]] = true;
              } else {
                  correctEulerianTour = false;
                  break;
              }
          }

          // Check to see if all edges have been visited
          for (let edge in visitedEdgeDict) {
              if (visitedEdgeDict[edge] === false) {
                  correctEulerianTour = false;
                  break;
              }
          }

          if (!correctEulerianTour) {
            showErrorAlert("Eulerian tour is incorrect");
            return;
          }

          // Convert the user input to a hamiltonian tour
          const hamiltonian = [];
          for (let vertex of eularianInputArray) {
              if (!hamiltonian.includes(vertex)) {
                hamiltonian.push(vertex);
              }
          }
          hamiltonian.push(hamiltonian[0]);
          
          // convert the user into array index
          let hamiltonianInputArray = hamiltonianInput.split(',').map(Number);
          for (let i = 0; i < hamiltonianInputArray.length; i++) {
            hamiltonianInputArray[i] -= 1;
          }

          let correctHamiltonianTour = JSON.stringify(hamiltonian) === JSON.stringify(hamiltonianInputArray);
          // If the user inputted the correct hamiltonian tour, then proceed
          if (correctHamiltonianTour) {
            setExpectingInput(false);
            setChristofidesStepNum(4);
            setMaxChristofidesStep(4);
            setStepNum(3);
            setSteps([...steps, bestTour[bestTour.length - 1]]);
            setPresentTour(true);
          }


          // error message if eulairan false, if eularian true and hamiltonian false, if both false
          if (!correctEulerianTour && !correctHamiltonianTour) {
            showErrorAlert("Eulerian and Hamiltonian tours are incorrect");
          }
          else if (!correctEulerianTour) {
            showErrorAlert("Eulerian tour is incorrect");
          }
          else if (!correctHamiltonianTour) {
            showErrorAlert("Hamiltonian tour is incorrect");
          }

        }
      }
    }

    // Functions to handle the graph visualisation
    const cforwards = () => {

      if (stepStore.length > 0) {
        let lastStep = stepStore.pop();
        setSteps([...lastStep]);
        setChristofidesStepNum(prevStepNum => prevStepNum + 1);
      }
      if (christofidesStepNum + 1 === 4) {
        setPresentTour(true);
      }
    }

    const cbackwards = () => {
      if (christofidesStepNum > 0) {
        setStepStore([...stepStore, steps]);
        setSteps(prevSteps => {
          const newState = prevSteps.slice(0, -1); // Keep all arrays except the last one
          return newState;
        });
        setChristofidesStepNum(prevStepNum => prevStepNum - 1);
      }
      // if currently in last step, then set the present tour to false
      if (christofidesStepNum === 4) {
        setPresentTour(false);
      }
    }

    
    // Move forwards in the TSP simulation
    const nextStep = () => {

      // Prevents error
      if ( checkUndefined() ){
        return;
      }

      if (stepNum < bestTour.length) {

        // If in interactive mode, then check if the user input is correct before moving to the next step
        if (interactiveMode) {

          if (algo === "Nearest Neighbor") {
         
            const adjacentNodes = getAdjacentNodes(steps[steps.length-1], adjacencyMatrix);                      
            let current = steps[steps.length - 1];
            let minWeight = Number.MAX_VALUE;
            let potentialHops = [];

            // Find the nearest neighbor
            for (let j = 0; j < adjacentNodes.length; j++) {
              if (!steps.includes(adjacentNodes[j]) && adjacencyMatrix[`${current}-${adjacentNodes[j]}`] < minWeight) {
                  minWeight = adjacencyMatrix[`${current}-${adjacentNodes[j]}`];
                  potentialHops = [];
                  potentialHops.push(adjacentNodes[j]);
              }
              else if (!steps.includes(adjacentNodes[j]) && adjacencyMatrix[`${current}-${adjacentNodes[j]}`] === minWeight) {

                  potentialHops.push(adjacentNodes[j]);
              }
            }

            let degreeDict = {};
            for (let i = 0; i < numNodes; i++) {
                degreeDict[i] = 0;
            }
            for (const edge of steps) {
                degreeDict[edge] += 1;
            }

            // find all alternate nodes that can be clicked
            // Consider the nodes we can visit
            let considered = [];
            let cur = steps[steps.length - 1];
            let adj = getAdjacentNodes(cur, adjacencyMatrix)
            considered.push(adj.filter(node => !steps.includes(node)));
            // remove 1st element of considered

            // if not last step
            if (stepNum < bestTour.length - 2) {
              considered = considered.flat();
            }
            else{
              // add first node to the considered list
              considered = considered.flat();
              considered.push(bestTour[0]);
            }


            // if adding the node to the tour closes it prematurely display an error message and return
            // means if node is already in "Steps"
            if (stepNum !== bestTour.length - 1 && potentialHops.length !== 0  && steps.includes(clickedNode)) {
              showErrorAlert("Adding this node will cause an incomplete cycle");
              return;
            }
          

            if (stepNum === bestTour.length - 1 && potentialHops.length === 0 && clickedNode === steps[0]) {

              setPresentTour(false);
              setSteps(prevSteps => [...prevSteps, clickedNode]);
              setStepNum(prevStepNum => prevStepNum + 1);
              setChristofidesStepNum(prevStepNum => prevStepNum + 1);
              setAltSteps(prevSteps => [...prevSteps, considered]);
              setInteractiveMode(false);
              setPresentTour(true);
            }

            else if (potentialHops.includes(clickedNode)) {

              setPresentTour(false);
              setSteps(prevSteps => [...prevSteps, clickedNode]);
              setStepNum(prevStepNum => prevStepNum + 1);
              setChristofidesStepNum(prevStepNum => prevStepNum + 1);
              setAltSteps(prevSteps => [...prevSteps, considered]);

            }
            else{

              showErrorAlert("Selected node is not the nearest neighbor");
            }

            
          }
          else if (algo === "Greedy") {

            let adjacencyMatrixNoDupes = removeDupeDict(tempAdjacencyMatrix);
            let sortedAdjacencyMatrix = sortDictionary(adjacencyMatrixNoDupes);
            let potentialEdges = [];
        
            let degreeDict = {};
            for (let i = 0; i < numNodes; i++) {
                degreeDict[i] = 0;
            }
            for (const edge of steps) {
                degreeDict[edge[0]] += 1;
                degreeDict[edge[1]] += 1; 
            }
        
        
            let smallestWeight = Number.MAX_VALUE;
            for (const [key, value] of Object.entries(sortedAdjacencyMatrix)) {
                let [node1, node2] = key.split('-').map(Number);
                if (value <= smallestWeight && degreeDict[node1] < 2 && degreeDict[node2] < 2 && !hasCycle(steps, [node1, node2])) {
                    if (value < smallestWeight) {
                        smallestWeight = value;
                        potentialEdges = [];
                    }
                    potentialEdges.push([node1, node2]);
                } 
            }
        
            // if the clicked edge is in the potential edges, then go to the next step
            let included = false;
            for (const edge of potentialEdges) {
                if (edge[0] === clickedEdge[0] && edge[1] === clickedEdge[1]) {
                    included = true;
                    break;
                }
            }
                
            // last edge
            if (steps.length + 1 === numNodes && hasCycle(steps, clickedEdge) && degreeDict[clickedEdge[0]]< 2 && degreeDict[clickedEdge[1]] < 2) {
                setPresentTour(false);
                setSteps(prevSteps => [...prevSteps, clickedEdge]);
                setStepNum(prevStepNum => prevStepNum + 1);
                setChristofidesStepNum(prevStepNum => prevStepNum + 1);
                setAltSteps(prevSteps => [...prevSteps, consideredStep[stepNum]]);
                setInteractiveMode(false);
                setPresentTour(true);
            }
        
                
            if (included && !hasCycle(steps, clickedEdge) && degreeDict[clickedEdge[0]] < 2 && degreeDict[clickedEdge[1]] < 2) {
                setPresentTour(false);
                setSteps(prevSteps => [...prevSteps, clickedEdge]);
                setStepNum(prevStepNum => prevStepNum + 1);
                setChristofidesStepNum(prevStepNum => prevStepNum + 1);
                setAltSteps(prevSteps => [...prevSteps, consideredStep[stepNum]]);
        
                // remove the edge from the temp adj matrix
                let tempAdjacencyMatrixCopy = tempAdjacencyMatrix;
                delete tempAdjacencyMatrixCopy[`${clickedEdge[0]}-${clickedEdge[1]}`];
                delete tempAdjacencyMatrixCopy[`${clickedEdge[1]}-${clickedEdge[0]}`];
                setTempAdjMatrix(tempAdjacencyMatrixCopy);
        
            } else {
              // id adding caused cycle error message 
              if (hasCycle(steps, clickedEdge) &&  ((steps.length + 1) !== numNodes)){
                showErrorAlert("Adding this edge will cause an incomplete cycle");
              }
              else{
                // if adding causes degree to be greater than 2 error message
                if (degreeDict[clickedEdge[0]] >= 2 || degreeDict[clickedEdge[1]] >= 2) {
                  showErrorAlert("Adding this edge will cause a vertex to have a degree greater than 2");
                }
                else{
                  // if last step and edge is not the smallest weight its ok
                  if (!(steps.length + 1 === numNodes && !included)) {
                    showErrorAlert("Selected edge does not have the smallest weight");
                  }

            
                }

              }

            }
        }
        
          else if (algo === "Christofides") { 

            if (christofidesStepNum === 1) {
              // if adding the edge creates a cycle, then go to next step
                setPresentTour(false);
                setSteps(prevSteps => {
                  // Toggle edge: if already present, remove it; if not, add it
                  const updatedArray = prevSteps[0].filter(edge => !(edge[0] === clickedEdge[0] && edge[1] === clickedEdge[1]));
                  if (updatedArray.length === prevSteps[0].length) {
                      // Edge is not present, add it
                      return [[...prevSteps[0], clickedEdge]];
                  } else {
                      // Edge is present, remove it
                      return [updatedArray];
                  }
              });

                setAltSteps(prevSteps => [...prevSteps, consideredStep[stepNum]]);

    
            }
            else if (christofidesStepNum === 2) {
              
              setPresentTour(false);
              setSteps(prevSteps => {
                // Toggle edge: if already present, remove it; if not, add it
                const updatedArray = prevSteps[1].filter(edge => !(edge[0] === clickedEdge[0] && edge[1] === clickedEdge[1]));
                if (updatedArray.length === prevSteps[1].length) {
                    // Edge is not present, add it
                    return [...prevSteps.slice(0, 1), [...prevSteps[1], clickedEdge]];
                } else {
                    // Edge is present, remove it
                    return [...prevSteps.slice(0, 1), updatedArray];
                }
            });
              setAltSteps(prevSteps => [...prevSteps, consideredStep[stepNum]]);

            }
            else if (christofidesStepNum === 3) {

              setSteps(prevSteps => {
                // Check if clickedEdge is already in the last array
                const updatedLastArray = prevSteps[prevSteps.length - 1].filter(edge => !(edge[0] === clickedEdge[0] && edge[1] === clickedEdge[1]));
    
                // Toggle edge: if already present, remove it; if not, add it
                if (updatedLastArray.length === prevSteps[prevSteps.length - 1].length) {
                    // Edge is not present, add it
                    return [...prevSteps.slice(0, -1), [...prevSteps[prevSteps.length - 1], clickedEdge]];
                } else {
                    // Edge is present, remove it
                    return [...prevSteps.slice(0, -1), updatedLastArray];
                }
            });
            }
            else{
              // no more steps
            }
          }
        }

        else{
          // Proceed to the next step
          setPresentTour(false);
          setSteps(prevSteps => [...prevSteps, bestTour[stepNum]]);
          setStepNum(prevStepNum => prevStepNum + 1);
          setChristofidesStepNum(prevStepNum => prevStepNum + 1);
          setAltSteps(prevSteps => [...prevSteps, consideredStep[stepNum]]);
        }
      } else {
        // On the last step, then show the final tour (graph becomes red)
        if (!(steps.length === 0)) {
          setPresentTour(true);
        }
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
        
      }
    };

    // Show the answer of the TSP simulation
    const fastForward = () => {
      if (algo !== "Select Algorithm") {
        setSteps(bestTour);
        setChristofidesStepNum(4);
        setStepNum(bestTour.length);
        setPresentTour(true);
        setAltSteps(consideredStep);
        setBeginInteractiveMode(false);
        setBeginVisualisationMode(false);
      }
    };

    // Restart the TSP simulation
    const restart = () => {
      setSteps([]);
      setAltSteps([]);
      setStepNum(0);
      setPresentTour(false);
      setChristofidesStepNum(0);
      setMaxChristofidesStep(0);
      setClickedNode(null);
      setBeginInteractiveMode(false);
      setBeginVisualisationMode(false);

      // Run the algorithm again, to avoid the user having to click the button again
      if (algo === "Nearest Neighbor") {
        NearestNeighborTSP(resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight, setSteps, setAltSteps, setStepNum, setConsideredSteps, setChristofidesAlgorithim);
        setBestTour(bestTour);
        setConsideredSteps(consideredStep);
      }
      else if (algo === "Greedy") {
        GreedyTSP(resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight);
      }
      else if (algo === "Christofides") {
        ChristofidesTSP(resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight, setSteps, setAltSteps, setStepNum, setConsideredSteps, setChristofidesAlgorithim);
      }
    };

    // Play the TSP simulation
    const play = () => {
      if (stepNum === bestTour.length) {
        restart();
      }
      setStop(!stop);
    };

    // Plays the TSP simulation
    useEffect(() => {
      if (!stop) {
        const interval = setInterval(() => {
          nextStep();
        }, 1000);
        return () => clearInterval(interval);
      }
    }, [stop, nextStep]);
    
    useEffect(() => {
      if (presentTour) {
        setStop(true);
      }
    }, [presentTour]);




    // Function to render nodes
    const renderNodes = () => {
      let nodeCoordinates = generateNodeCoordinates(numNodes);
      const flattenedSteps = steps.flat(); // Flatten the steps array if it's 2D
      const flattendedLastStep = (christofidesAlgorithim && lastStep) ? lastStep.flat() : []; // Flatten the last step array if it's 2D
      return nodeCoordinates.map((node, index) => (
        renderCustomNode(node, index, (flattenedSteps.includes(index) || flattendedLastStep.includes(index))  , (steps[steps.length - 1] === index), presentTour , christofidesAlgorithim, christofidesStepNum, setClickedNode, interactiveMode)
      ));
    };

   
    // Helper function to generate TSP algorithm handlers
    const generateTSPHandler = (tspAlgorithm) => {
      return () => {
        setAlgo(functionName(tspAlgorithm));
      
        if (functionName(tspAlgorithm) === "Nearest Neighbor") {
          NearestNeighborTSP(resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight, setSteps, setAltSteps, setStepNum, setConsideredSteps, setChristofidesAlgorithim);
        }
        else{
          tspAlgorithm(resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight , setSteps, setAltSteps ,setStepNum , setConsideredSteps, setChristofidesAlgorithim);
        }

       
      };
    };

    // Prevent interactive mode for the brute force algorithm
    useEffect(() => {
      if (algo === "Brute Force") {
        setInteractiveMode(false);
      }
    }, [algo]);


    // Starting point for the interactive mode, user selects a node / edge to start the algorithm
    useEffect(() => {

      if (interactiveMode) {
        if (algo === "Select Algorithm") {
          showErrorAlert("Please select an algorithm");
        }
        else if (algo === "Nearest Neighbor") {
          if (clickedNode !== null ) {
            if (stepNum === 0) {
              resetBestTour();
              let data = NearestNeighborTSP(resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight, setSteps, setAltSteps, setStepNum, setConsideredSteps, setChristofidesAlgorithim, clickedNode);
              setSteps([clickedNode]);
              setStepNum(1);
              let arr = data.considered[0] ;
              arr.push(data.considered[data.considered.length -1][0]);
              setAltSteps([arr]);
            }
            else{
              nextStep();
            }
          }
        }

        else if (algo === "Greedy") {
          if (clickedEdge !== null){
            if (stepNum === 0) {
              resetBestTour();
              GreedyTSP(resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight);
              let adjacencyMatrixNoDupes = removeDupeDict(adjacencyMatrix);
              let sortedAdjacencyMatrix = sortDictionary(adjacencyMatrixNoDupes);
              let potentialEdges = [];
              let firstValue = Object.values(sortedAdjacencyMatrix)[0]; 
              while (true) {
                let nextValue = Object.values(sortedAdjacencyMatrix)[potentialEdges.length];
                if (nextValue === firstValue) {          
                  let edge = Object.keys(sortedAdjacencyMatrix)[potentialEdges.length]; 
                  let edgeArray = edge.split("-");
                  let node1 = parseInt(edgeArray[0]);
                  let node2 = parseInt(edgeArray[1]);
                  potentialEdges.push([node1,node2]);
                }
                else{
                  break;
                }
              }
              let included = false;
              for (const edge of potentialEdges) {
                  if (edge[0] === clickedEdge[0] && edge[1] === clickedEdge[1]) {
                      included = true;
                      break;
                  }
              }
              if (included) {
                setSteps([clickedEdge]);
                setStepNum(1);
                let newAdjacencyMatrix = {...adjacencyMatrix};
                delete newAdjacencyMatrix[`${clickedEdge[0]}-${clickedEdge[1]}`];
                delete newAdjacencyMatrix[`${clickedEdge[1]}-${clickedEdge[0]}`];
                setTempAdjMatrix(newAdjacencyMatrix);
              }
              else{
                showErrorAlert("Selected edge does not have the smallest weight");
              } 
            }
            else{
              nextStep();
            }
          }
        }

        if (algo === "Christofides") {
          if (clickedEdge !== null){
            if (stepNum === 0) {
              resetBestTour();
              let data = ChristofidesTSP(resetBestTour, numNodes, adjacencyMatrix, setBestTour, setBestWeight, setSteps, setAltSteps, setSteps, setConsideredSteps, setChristofidesAlgorithim);
              setMstWeight(data.mstWeight);
              setChristofidesAlgorithim(true);
              setChristofidesStepNum(1);
              setMaxChristofidesStep(1);
              setSteps([[clickedEdge]]);
              setStepNum(1);           
              setBeginInteractiveMode(true);  
            }
            else{
              nextStep();
            }
          }
        }
      }
    }, [clickedNode, clickedEdge]);

    // Maintain the states that stores if viusalsaition or interaction is running
    useEffect(() => {
      if (!interactiveMode && stepNum >= 1 && !beginInteractiveMode) {
        setBeginInteractiveMode(false);
        setBeginVisualisationMode(true);
      }
      if (stepNum === 0 && !interactiveMode) {
        setBeginInteractiveMode(false);
        setBeginVisualisationMode(false);
      }
    }, [nextStep, prevStep]);

    useEffect(() => {
      setAlgo("Select Algorithm");
    }, [adjacencyMatrix, numNodes]);



    // Variables that will help us render the graph
    const nodeCoordinates = generateNodeCoordinates(numNodes);
    const AdjMatrix = generateAdjacencyMatrix();
    const lastStep = steps[steps.length - 1];
    const currentAltStep = altSteps[altSteps.length - 1];

    // Generate the weights for the edges of the graph
    const textOverlays = [];
    nodeCoordinates.forEach((node, index) => {
      nodeCoordinates.slice(index + 1).forEach((nextNode, nextIndex) => {
        const node1 = index;
        const node2 = index + nextIndex + 1;
        const result = AdjMatrix[node1][node2] === 0;
  
        if (!result) {
          textOverlays.push(generateTextJSX(node, nextNode, node1, node2, AdjMatrix, calculateTextAttributes(node1, node2, numNodes)));
        }
      });
    });

    // Render the graph and adjacency matrix
    return (
      <div className="Graph" data-testid="graph-container">


        {/* Top of page */}
        <div className="title-bar bg-dark p-3 px-4 d-flex justify-content-between">
          {/* Page Title */}
          <div>
            <h2 className="text-white fw-bold d-flex align-items-center justify-content-between">
              <FaPersonHiking className="me-2" />
              <span>TSP Heuristic Algorithm Visualizer</span>
            </h2>
          </div>

          {/* Dropdown to select the algorithm */}
          <div>
            <div class="btn-group">
              <a class="btn btn-light dropdown-toggle" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">
                <span className="fw-bold">Select Algorithim</span>
              </a>
              <ul class="dropdown-menu">
                
                <li><a  onClick={generateTSPHandler(BruteForceTSP)}  class={numNodes < 3 ||  numNodes > 9 ? "dropdown-item disabled" : "dropdown-item"}href="#0" >Brute Force</a></li>
                <li><a  onClick={generateTSPHandler(NearestNeighborTSP)} class={numNodes < 3 ? "dropdown-item disabled" : "dropdown-item"} href="#0">Nearest Neighbor</a></li>
                <li><a  onClick={generateTSPHandler(GreedyTSP)} class={numNodes < 3 ? "dropdown-item disabled" : "dropdown-item"} href="#0">Greedy</a></li>
                <li><a  onClick={generateTSPHandler(ChristofidesTSP)} class={numNodes < 3 ? "dropdown-item disabled" : "dropdown-item"} href="#0">Christofides</a></li>
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

        {/* Middle section */}
        <div className="container-fluid d-flex flex-column">
          <div className="row flex-grow-1">
         
          {/* Graph */}
          <div className="col-lg-8">
          <svg width="700" height="700">

          {/* Render connections between the nodes */}
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
                    <a href="#0" class="pe-auto  stretched-link d-inline-block p-2">
                    <line
                      class="edge"
                      data-testid="line-undefined"
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
                    />
                    </a>
                  ) : (

                    // If numNodes bigger than 9, then show the weights USING tooltips
                    numNodes > 9 ? (
                      <Tooltip title={adjacencyMatrix[`${node1}-${node2}`]} followCursor>
                      <a href="#0" class="pe-auto" >
                      <line
                        class="edge"
                        data-testid="line-defined"
                        key={`${node1}-${node2}`} // Line with defined weight
                        x1={node.x}
                        y1={node.y}
                        x2={nextNode.x}
                        y2={nextNode.y}
                        stroke="black"
                        strokeOpacity="0.5"
                        strokeWidth="3"
                        onMouseMove={(e) => {
                          showWeightedEdges(e, node1, node2);
                        }}
                        onClick={(e) => {
                          SelectAdjMatrix(e, node1, node2);
                        }}
                      />
                    </a>
                    </Tooltip>
                    ) : (
                      <a href="#0" class="pe-auto" >
                      <line
                        class="edge"
                        data-testid="line-defined"
                        key={`${node1}-${node2}`} // Line with defined weight
                        x1={node.x}
                        y1={node.y}
                        x2={nextNode.x}
                        y2={nextNode.y}
                        stroke="black"
                        strokeOpacity="0.5"
                        strokeWidth="3"
                        onMouseMove={(e) => {
                          showWeightedEdges(e, node1, node2);
                        }}
                        onClick={(e) => {
                          SelectAdjMatrix(e, node1, node2);
                        }}
                      />
                    </a>
                    )




      
                  ) // Show line differently if the value is "NA"
                );
                
              })
            );
          })}

          {/* Render all alternate connections, if it exists */}
          { currentAltStep && currentAltStep.map((altNode, index) => {
            const currentNode = steps[steps.length - 1]; // Get the current node
            const x1 = nodeCoordinates[currentNode].x;
            const y1 = nodeCoordinates[currentNode].y;
            const x2 = nodeCoordinates[altNode].x;
            const y2 = nodeCoordinates[altNode].y;
            const color = "#30bbd1";
            
            
            
            return (
              numNodes > 9 ? (
                <Tooltip title={adjacencyMatrix[`${currentNode}-${altNode}`]} followCursor >
                <motion.line
                  class="edge"
                  data-testid="line-defined-algo"
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
                </Tooltip>
              ) : (
                <motion.line
                class="edge"
                data-testid="line-defined-algo"
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
                
              )

              

    
            );
        })}

          {/* Render the current / final TSP tour */}
          {/* There is a difference in rendering tours for each algorithim, for example nearest neighbor has the nodes inside the tour, while the other algorithms have the edges inside the tour */}
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
                      }
                      
                      return (

                          numNodes > 9 ? (
                            <Tooltip title={adjacencyMatrix[`${node1}-${node2}`]} followCursor>
                            <motion.line
                                class="edge"
                                data-testid="line-defined-algo"
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
  
                            />
                            </Tooltip>
                          ) : (
                            <motion.line
                            class="edge"
                            data-testid="line-defined-algo"
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

                            />
                            
                          )
    

                        
 
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
                              numNodes > 9 ? (
                                                            
                                <Tooltip title={adjacencyMatrix[`${node1}-${node2}`]} followCursor>
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
                                />
                                </Tooltip>
                              ) : (
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
                            />
                                
                              )
        


                          );
                      }
                      else{
                        return null;
                      }
                  }
              })

          ) : (
              // All other algorithms
              steps.map((node, index) => {
                if (Array.isArray(node)) {

                    if (algo === "Brute Force") {
                      // find the weight of the "node" anrray as the node array in this case is a tour
                      
                      return (
                        <g >
                            { (index === steps.length - 1) && node.map((nodeIn, indexIn) => {
                                const node1 = nodeIn;
                                const node2 = steps[index][indexIn + 1];
                                if (node2 === undefined) {
                                  return null;
                                }
                                const x1 = nodeCoordinates[node1].x;
                                const y1 = nodeCoordinates[node1].y;
                                const x2 = nodeCoordinates[node2].x;
                                const y2 = nodeCoordinates[node2].y;
                                const color = presentTour ? "#ff0000" : "#ff8a27";
                                return (

                                    numNodes > 9 ? (
                                                    
                                    <Tooltip title={adjacencyMatrix[`${node1}-${node2}`]} followCursor>
                                    <motion.line
                                        className="edge"
                                        key={`edge-${node1}-${node2}`}
                                        x1={x1}
                                        y1={y1}
                                        x2={x2}
                                        y2={y2}
                                        stroke={color}
                                        strokeWidth="4"
                                        initial={{ pathLength: 0, x2: x1, y2: y1 }}
                                        animate={{ pathLength: 1, x2: x2, y2: y2 }}
                                        transition={{ duration: 0.45 }}
                                        onMouseMove={(e) => { showWeightedEdges(e, node1, node2); }}
                                        onClick={(e) => { SelectAdjMatrix(e, node1, node2); }}
                                    />
                                    </Tooltip>
                                    ) : (
                                      <motion.line
                                      className="edge"
                                      key={`edge-${node1}-${node2}`}
                                      x1={x1}
                                      y1={y1}
                                      x2={x2}
                                      y2={y2}
                                      stroke={color}
                                      strokeWidth="4"
                                      initial={{ pathLength: 0, x2: x1, y2: y1 }}
                                      animate={{ pathLength: 1, x2: x2, y2: y2 }}
                                      transition={{ duration: 0.45 }}
                                      onMouseMove={(e) => { showWeightedEdges(e, node1, node2); }}
                                      onClick={(e) => { SelectAdjMatrix(e, node1, node2); }}
                                  />
                                    )

                                );
                            })}
                        </g>
                    );
                      
                    }
                    else{ 
                    const node1 = node[0];
                    const node2 = node[1];
                    const x1 = nodeCoordinates[node1].x;
                    const y1 = nodeCoordinates[node1].y;
                    const x2 = nodeCoordinates[node2].x;
                    const y2 = nodeCoordinates[node2].y;
                    const color = presentTour ? "#ff0000" : "#ff8a27";
                    return (

                        numNodes > 9 ? (
                          <Tooltip title={adjacencyMatrix[`${node1}-${node2}`]} followCursor>
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
  
                          />
                          </Tooltip>
                        ) : (
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

                      />
                        )
  

                    );
                  }
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

                                numNodes > 9 ? (
                                  
                                <Tooltip title={adjacencyMatrix[`${node1}-${node2}`]} followCursor>
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

                                />
                                </Tooltip>
                                ) : (
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

                              />
                                )

                          );
                      }
                      else {
                        return null;
                      }
                  }
              })
          )}

          {/* Render nodes */}
          {renderNodes()}
          {textOverlays}
          </svg>

          </div>
            {/* Right panel of screen */}
            <div className="col-lg-4 py-5 d-flex flex-column justify-content-between">
              
              {/* Adjacency Matrix */}
              <div className="adjacency-matrix-container">
              {renderAdjacencyMatrix()}
              </div>
              {
                presentTour && (
                  <div class="alert alert-success text-left" role="alert">
                    {/* Shows weight and tour when found */}
                    <span className="fw-bold text-left">Final Tour</span> has been found! 
                    <br/>
                    <span className="fw-bold text-left"> Weight: {bestWeight} </span>
                  </div>
                )
              }

              {/* Buttons to edit graph  */}
              { /*  <button onClick={() => generateRandomWeights()} className="btn btn-outline-dark btn-sm"><FaRuler /> Script to generate Confirm</button> */}
              <div className="edit-graph-box p-3 border">
                <h3>Edit Graph</h3>
                <div className="d-flex flex-wrap gap-2 justify-content-evenly">
                  <button onClick={() => addNode()} className="btn btn-outline-dark btn-sm " data-testid="add-node">  <FaPlus/> Add Node</button>
                  <button onClick={() => removeNode()} disabled={numNodes === 0} className="btn btn-outline-dark btn-sm"><FaMinus /> Remove Node</button>
                  <button onClick={() => resetGraph()} className="btn btn-outline-dark btn-sm"><FaSync /> Reset Graph</button>
                  <button onClick={() => clearWeights()} className="btn btn-outline-dark btn-sm"><FaEraser /> Clear Weights</button>
                  <button onClick={randomPresetGraph} className="btn btn-outline-dark btn-sm"><FaRandom /> Random Graph</button>
                  <button onClick={() => showAdjMatrix()} className="btn btn-outline-dark btn-sm"><FaRuler /> Show Distance</button>
                  <button onClick={() => generateRandomWeights()} className="btn btn-outline-dark btn-sm" disabled={numNodes > 7}><GiPerspectiveDiceSixFacesRandom /> Random Weights</button>
                 
                </div>
              </div>
            </div>
          </div>

          {/* Control buttons */}

          <div className="title-bar bg-dark d-flex fixed-bottom w-100 p-3 ">
            <div className="container-fluid">
              <div className="row justify-content-center">
                <div className="col text-center">
                  {interactiveMode ? (
                    <>
                      {christofidesAlgorithim ? (
                        <>
                          {/* Input need for the 4th step in chrisofides algorithim */}
                          {expectingInput === true ? (
                            <div>
                              <input 
                                type="text"
                                value={inputValueEularian}
                                onChange={handleChangeEularian}
                                placeholder="Eularian Tour..."
                              />
                              <input 
                                type="text"
                                value={inputHamiltonian}
                                onChange={handleChangeHamiltonian}
                                placeholder="Hamiltonian Tour..."
                              />
                              
                              <button className="btn btn-primary" onClick={handleSubmit}>
                                Submit 
                                <Tooltip title="Input is the node number separated by commas, e.g., 1,2,3,4,1 " arrow> <RxQuestionMarkCircled /> </Tooltip>
                              </button>
                              
                            </div>
                          ) : (
                            // Allows users to step through the chrisofides algorithim during interactive mode
                            <div className="controller">
                              <button className="btn btn-light mx-1" onClick={() => cbackwards() } disabled={(christofidesStepNum <= 1) } >
                                <FaStepBackward /> 
                              </button>
                              <button className="btn btn-light mx-1" onClick={() => nextChristofidesStep()} disabled={(christofidesStepNum !== maxChristofidesStep)} >
                              <IoIosCheckmarkCircle /> Check Step 
                              </button>
                              <button className="btn btn-light mx-1" onClick={() => cforwards() } disabled={ ( christofidesStepNum === 0 ||  (christofidesStepNum === maxChristofidesStep)  ) }  >
                                <FaStepForward />
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <button className="btn btn-light mx-1"   style={{ visibility: "hidden" }}>
                          <FaStepForward /> PLACEHOLDER
                        </button>
                      )}
                    </>
                  ) : (
                    // Control buttons for the TSP simulation

                    
                    <div className = "controller">
                      <button className="btn btn-light mx-1" onClick={restart} disabled={algo === "Select Algorithm"}>
                        <FaFastBackward />
                      </button>
                      <button className="btn btn-light mx-1" onClick={prevStep} disabled={ (beginInteractiveMode && algo === "Christofides") || algo === "Select Algorithm" }>
                        <FaStepBackward />
                      </button>
                      <button className="btn btn-light mx-1" onClick={play} disabled={(beginInteractiveMode && algo === "Christofides") || algo === "Select Algorithm"}>
                        {stop ? <FaPlay /> : <FaPause />}
                      </button>
                      <button className="btn btn-light mx-1" onClick={nextStep} disabled={ (beginInteractiveMode && algo === "Christofides") || algo === "Select Algorithm"}>
                        <FaStepForward />
                      </button>
                      <button className="btn btn-light mx-1" onClick={fastForward} disabled={algo === "Select Algorithm"}>
                        <FaFastForward />
                      </button>
                    </div>
                  )
                  }
                </div>
                
                {/* Interactive Mode toggle on the right side */}
                <div className="flicker col-auto">
                  <Toggle
                    id='cheese-status'
                    data-testid="interactive-mode-toggle"
                    checked={interactiveMode} // Set checked prop to interactiveMode
                    onChange={() => {
                      if (!presentTour) {
                        setInteractiveMode(!interactiveMode);
                        setClickedNode(null);
                        setShowAdjacencyMatrix(false);
                        setStepStore([]);
                        restart();
                      }
                    }}
                    disabled={(beginVisualisationMode && algo === "Christofides") || algo === "Brute Force"}
                  />
                  <span className="flicker-text ms-2 text-white">Interactive Mode</span>
                </div>
              </div>
            </div>
          </div>

          
        </div>
      </div>
    );
  }


  export default Graph;