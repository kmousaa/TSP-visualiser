// Graph.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Graph from '../components/Graph';

// Import the userEvent library
import userEvent from '@testing-library/user-event';


// Mock the props for the Graph component
const mockProps = {
    numNodes: 4,
    setNumNodes: jest.fn(),
    adjacencyMatrix: {"0-1":1,"1-0":1,"0-3":1,"3-0":1,"1-3":1,"3-1":1,"2-3":1,"3-2":1,"0-2":1,"2-0":1,"1-2":1,"2-1":1},
    setAdjacencyMatrix: jest.fn(),
    bestTour: [],
    setBestTour: jest.fn(),
    bestWeight: Number.MAX_VALUE,
    setBestWeight: jest.fn(),
    stepNum: 0,
    setStepNum: jest.fn(),
    steps: [],
    setSteps: jest.fn(),
    altSteps: [],
    setAltSteps: jest.fn(),
    presentTour: false,
    setPresentTour: jest.fn(),
    consideredStep: [],
    setConsideredSteps: jest.fn(),
    showAdjacencyMatrix: false,
    setShowAdjacencyMatrix: jest.fn(),
    christofidesAlgorithim: false,
    setChristofidesAlgorithim: jest.fn(),
    christofidesStepNum: 0,
    setChristofidesStepNum: jest.fn(),
    interactiveMode: false,
    setInteractiveMode: jest.fn(),
    degreeDict: {},
    setDegreeDict: jest.fn(),
};

describe('Graph component creation / editing', () => {



    it('should render the Graph component', () => {
        render(<Graph {...mockProps} />);
        expect(screen.getByTestId('graph-container')).toBeInTheDocument();  
        expect(screen.getByTestId('interactive-mode-toggle')).toBeInTheDocument();  
    });


    test('graph starts with 4 nodes, with 6 defined edges', () => {
        render(<Graph {...mockProps} />);
        expect(screen.getAllByTestId('node')).toHaveLength(4);
        expect(screen.getAllByTestId('line-defined')).toHaveLength(6);
    });


    it('should add a node when "Add Node" button is clicked', async () => {
        render(<Graph {...mockProps} />);
        const addButton = screen.getByRole('button', { name: /add node/i });
        userEvent.click(addButton);
        expect(mockProps.setNumNodes).toHaveBeenCalledTimes(1);
        expect(mockProps.setNumNodes).toHaveBeenCalledWith(mockProps.numNodes + 1);
    });

    it('should remove a node when "Remove Node" button is clicked', async () => {
        render(<Graph {...mockProps} />);
        const removeButton = screen.getByRole('button', { name: /remove node/i });
        userEvent.click(removeButton);
        expect(mockProps.setNumNodes).toHaveBeenCalledTimes(1);
        expect(mockProps.setNumNodes).toHaveBeenCalledWith(mockProps.numNodes - 1);
    });

    it('should clear the weight when "Clear Weight" button is clicked', async () => {
        render(<Graph {...mockProps} />);
        const clearWeightButton = screen.getByRole('button', { name: /clear weight/i });
        userEvent.click(clearWeightButton);
        expect(mockProps.setAdjacencyMatrix).toHaveBeenCalledTimes(1);
        expect(mockProps.setAdjacencyMatrix).toHaveBeenCalledWith({});
    });

    //  Random Graph Generation
    it('should generate a random graph when "Random Graph" button is clicked', async () => {
        render(<Graph {...mockProps} />);
        const randomGraphButton = screen.getByRole('button', { name: /random graph/i });
        userEvent.click(randomGraphButton);
        expect(mockProps.setAdjacencyMatrix).toHaveBeenCalledTimes(1);
        expect(mockProps.setAdjacencyMatrix).toHaveBeenCalledWith(expect.any(Object));

        // Check that new graph is not the same as the one we mocked in mockProps
        expect(mockProps.setAdjacencyMatrix.mock.calls[0][0]).not.toEqual(mockProps.adjacencyMatrix);
    });

    it('should generate random weights when "Random Weights" button is clicked', async () => {
        render(<Graph {...mockProps} />);
        const randomWeightsButton = screen.getByRole('button', { name: /random weights/i });
        userEvent.click(randomWeightsButton);
        expect(mockProps.setAdjacencyMatrix).toHaveBeenCalledTimes(1);
        expect(mockProps.setAdjacencyMatrix).toHaveBeenCalledWith(expect.any(Object));

        // Check that new graph is not the same as the one we mocked in mockProps
        expect(mockProps.setAdjacencyMatrix.mock.calls[0][0]).not.toEqual(mockProps.adjacencyMatrix);
    });


    it('should clear the graph when "Clear Graph" button is clicked', async () => {
        render(<Graph {...mockProps} />);
        const clearGraphButton = screen.getByRole('button', { name: /clear weight/i });
        userEvent.click(clearGraphButton);
        expect(mockProps.setAdjacencyMatrix).toHaveBeenCalledTimes(1);
        expect(mockProps.setAdjacencyMatrix).toHaveBeenCalledWith({});
    });

    it('should show the distance matrix when "Show Distance Matrix" button is clicked', async () => {
        render(<Graph {...mockProps} />);
        const showDistanceMatrixButton = screen.getByRole('button', { name: /show distance/i });
        userEvent.click(showDistanceMatrixButton);
        expect(mockProps.setShowAdjacencyMatrix).toHaveBeenCalledTimes(1);
        expect(mockProps.setShowAdjacencyMatrix).toHaveBeenCalledWith(true);
    });


});
