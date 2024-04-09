# TSP-Solver

The travelling salesman problem (TSP) is widely renowned and used all around us in the real world. It involves finding the best path in a graph where distance is minimised. Think of the nodes in the graph as houses, the edges as roads, and you are a delivery driver trying to drop off packages in each home and return to the starting point. This project brings the TSP to life by allowing you to solve it visually using four algorithms: Brute Force, Nearest Neighbor, Greedy, and Christofides.

# Features
1. Create your own graph by adding and removing nodes - or click "random graph" for a template one
2. Add weights to the graph by clicking the edge and input your desired weight
3. You can generate random weights too
4. Once happy, select the algorithm and visualise it using the media buttons at the bottom of the screen
6. If you want to test your understanding of an algorithm, toggle "interactive mode" and select the next step of the algorithm


<img width="1440" alt="image" src="https://github.com/kmousaa/TSP-visualiser/assets/99260175/ac77b9c5-821c-4309-8250-720693ed4464">



## Deployment

To deploy this project on your local machine, follow these steps:
- Before you begin, ensure you have installed Node.js - you can download it from the [Node.js official website](https://nodejs.org/en/download/). 
```bash
# Clone the repository
git clone https://github.com/kmousaa/TSP-visualiser.git

# Navigate to the project directory
cd TSP-visualiser/my-app

# Install dependencies
npm install

# Start the server
npm start

```
- Once both the server and client are running, open your browser and navigate to http://localhost:3000

# Future Work

The current iteration of the tool offers a solid foundation for understanding and visualizing the Traveling Salesman Problem. Looking ahead, there are exciting potential enhancements that could further enrich the tool's capabilities:

- **2-opt Algorithm**: Implementing this local search algorithm could provide users with a hands-on experience in refining TSP solutions, showcasing the iterative process of optimization.
- **Simulated Annealing**: Integrating this algorithm could offer a more nuanced approach to finding optimal solutions by navigating the trade-off between exploration and exploitation.
- **Ant Colony Optimization**: By simulating the foraging behavior of ants, this addition could provide a unique and dynamic method for solving TSP instances, potentially leading to new insights and strategies.

These features would not only add depth to the tool's algorithmic repertoire but also give users more avenues to explore complex problem-solving techniques in computational theory.



## Credits

This project was developed by Karim Mousa as a final year individual project for King's College London. It represents a culmination of the skills and knowledge acquired over the course of my studies and serves as a practical application of theoretical concepts in computer science.

