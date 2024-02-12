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
      />
    </div>
  );
}

export default App;
