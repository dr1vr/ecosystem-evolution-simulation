# Ecosystem Evolution Simulation

A JavaScript-based ecosystem evolution simulation with neural networks and genetic algorithms.

## Overview

This project simulates an ecosystem where creatures with neural networks evolve over multiple generations using genetic algorithms. The simulation provides tools for visualizing the ecosystem and analyzing performance metrics.

## Features

- Neural networks with optimized feed-forward processing
- Performance testing framework with detailed metrics
- Real-time visualization of the ecosystem
- Performance monitoring and optimization recommendations
- User interface for controlling simulation parameters
- Statistics tracking for population, fitness, and resources

## Neural Network Optimizations

The simulation includes several neural network optimizations:

- Loop unrolling for faster feed-forward calculations
- Optimized weight initialization
- Weight pruning
- Multiple activation functions (sigmoid, ReLU, leaky ReLU, tanh)
- Efficient mutation and crossover operations

## Performance Testing

A built-in test harness provides performance metrics:

- Neural network processing speed
- Rendering and update time
- Memory usage
- Frame rate
- Custom performance tests

## Running the Simulation

1. Clone the repository
2. Open `index.html` in a web browser
3. Use the control panel to adjust simulation parameters
4. Click the "Tests" button to open the performance testing panel

## Structure

The project is organized as follows:

- `js/core/` - Core simulation components
- `js/entities/` - Entity definitions (creatures, plants)
- `js/environment/` - Environment components
- `js/utils/` - Utility classes (NeuralNetwork, TestHarness)
- `js/ui/` - User interface components
- `css/` - Styling for the UI

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.