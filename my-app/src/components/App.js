import React, { useState } from 'react';
import '../utils/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Graph from './Graph';

// Root of the application
function App() {

  // State of the Graph
  const [numNodes, setNumNodes] = useState(0); // Number of nodes
  const [adjacencyMatrix, setAdjacencyMatrix] = useState({}); // Edge weights

  // State of the best tour
  const [bestTour, setBestTour] = useState([]);
  const [bestWeight, setBestWeight] = useState(Number.MAX_VALUE);

  // Stores state of the steps of the algorithm
  const [stepNum, setStepNum] = useState(0); 
  const [steps, setSteps] = useState([]);
  const [presentTour, setPresentTour] = useState(false);

  // Considered steps
  const [consideredStep, setConsideredStep] = useState([]);
  
  return (
    <div className="App">
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
        presentTour={presentTour}
        setPresentTour={setPresentTour}
        consideredStep={consideredStep}
        setConsideredStep={setConsideredStep}
      />
    </div>
  );
}

export default App;
