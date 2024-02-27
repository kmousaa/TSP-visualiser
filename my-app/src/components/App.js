import React, { useState } from 'react';
import '../utils/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Graph from './Graph';

// Root of the application
function App() {

  // Stores instance of the graph
  const [numNodes, setNumNodes] = useState(0); // Number of nodes in the graph
  const [adjacencyMatrix, setAdjacencyMatrix] = useState({}); // Edge weights dictionary

  // Stores the best tour and its weight found by the TSP algorithm
  const [bestTour, setBestTour] = useState([]);
  const [bestWeight, setBestWeight] = useState(Number.MAX_VALUE);

  // Stores the intermediate steps of the TSP algorithm
  const [stepNum, setStepNum] = useState(0); 
  const [steps, setSteps] = useState([]);
  const [presentTour, setPresentTour] = useState(false);

  // Keeps track of the edges considered by the TSP algorithm
  // There are denoted by a different color in the graph
  const [altSteps, setAltSteps] = useState([]);
  const [consideredStep, setConsideredStep] = useState([]);

  // Keeps track if we sould show or hide adj matrix
  const [showAdjacencyMatrix, setShowAdjacencyMatrix] = useState(false);

  // Keep track of christodies algorithm
  const [christofidesAlgorithim, setChristofidesAlgorithim] = useState(false);
  const [christofidesStepNum, setChristofidesStepNum] = useState(0);


  return (
    <div className="App">

      {/* Consists of the graph and the adjacency matrix */}
      <Graph 
        numNodes={numNodes} 
        setNumNodes={setNumNodes} 
        adjacencyMatrix={adjacencyMatrix} 
        setAdjacencyMatrix={setAdjacencyMatrix} 
        bestTour={bestTour}
        setBestTour={setBestTour}
        bestWeight={bestWeight}
        setBestWeight={setBestWeight}
        stepNum={stepNum}
        setStepNum={setStepNum}
        steps={steps}
        setSteps={setSteps}
        altSteps={altSteps}
        setAltSteps={setAltSteps}
        presentTour={presentTour}
        setPresentTour={setPresentTour}
        consideredStep={consideredStep}
        setConsideredStep={setConsideredStep}
        showAdjacencyMatrix={showAdjacencyMatrix}
        setShowAdjacencyMatrix={setShowAdjacencyMatrix}
        christofidesAlgorithim={christofidesAlgorithim}
        setChristofidesAlgorithim={setChristofidesAlgorithim}
        christofidesStepNum={christofidesStepNum}
        setChristofidesStepNum={setChristofidesStepNum}
        
      />
    </div>
  );
}

export default App;
