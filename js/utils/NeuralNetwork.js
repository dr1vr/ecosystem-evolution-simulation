/**
 * Neural Network class for organism decision making
 * Implements a simple feed-forward neural network
 */
class NeuralNetwork {
    /**
     * Initialize a neural network
     * @param {Object} options Configuration options
     * @param {Array} options.layers Array of layer sizes (e.g. [4, 8, 3] for 4 inputs, 8 hidden neurons, 3 outputs)
     * @param {Function} options.activation Activation function (defaults to sigmoid)
     * @param {Array} options.weights Pre-defined weights (for loading saved networks)
     * @param {Array} options.biases Pre-defined biases (for loading saved networks)
     */
    constructor(options = {}) {
        this.layers = options.layers || [3, 4, 2]; // Default: 3 inputs, 4 hidden, 2 outputs
        this.activation = options.activation || NeuralNetwork.sigmoid;
        this.activationName = options.activationName || 'sigmoid';
        this.weights = [];
        this.biases = [];
        
        // Initialize weights and biases if not provided
        if (!options.weights || !options.biases) {
            this.initialize();
        } else {
            this.weights = options.weights;
            this.biases = options.biases;
        }
        
        // Cache for forward pass calculations
        this.layerOutputs = [];
        
        // Performance optimization flag
        this.useOptimizedOperations = true;
    }
    
    /**
     * Initialize weights with random values
     */
    initialize() {
        // Initialize weights between layers
        for (let i = 0; i < this.layers.length - 1; i++) {
            const layerWeights = [];
            const layerBiases = [];
            
            // Xavier/Glorot initialization for better convergence
            const fanIn = this.layers[i];
            const fanOut = this.layers[i + 1];
            const weightScale = Math.sqrt(2 / (fanIn + fanOut));
            
            // For each neuron in the current layer
            for (let j = 0; j < this.layers[i + 1]; j++) {
                const neuronWeights = [];
                
                // For each input from the previous layer
                for (let k = 0; k < this.layers[i]; k++) {
                    // Random weight with xavier initialization
                    neuronWeights.push((Math.random() * 2 - 1) * weightScale);
                }
                
                layerWeights.push(neuronWeights);
                // Random bias centered at zero
                layerBiases.push((Math.random() * 2 - 1) * 0.1);
            }
            
            this.weights.push(layerWeights);
            this.biases.push(layerBiases);
        }
    }
    
    /**
     * Feed forward through the network to get output values
     * @param {Array} inputs Array of input values
     * @returns {Array} Output values
     */
    feedForward(inputs) {
        if (this.useOptimizedOperations) {
            return this.feedForwardOptimized(inputs);
        }
        
        let outputs = inputs;
        this.layerOutputs = [inputs]; // Store input as first layer output
        
        // Process each layer
        for (let i = 0; i < this.weights.length; i++) {
            const layerOutputs = [];
            
            // For each neuron in the current layer
            for (let j = 0; j < this.weights[i].length; j++) {
                let sum = this.biases[i][j];
                
                // Sum weighted inputs
                for (let k = 0; k < this.weights[i][j].length; k++) {
                    sum += outputs[k] * this.weights[i][j][k];
                }
                
                // Apply activation function
                layerOutputs.push(this.activation(sum));
            }
            
            outputs = layerOutputs;
            this.layerOutputs.push(outputs);
        }
        
        return outputs;
    }
    
    /**
     * Optimized feed forward implementation using matrix operations
     * @param {Array} inputs Array of input values
     * @returns {Array} Output values
     */
    feedForwardOptimized(inputs) {
        let outputs = inputs;
        this.layerOutputs = [inputs]; // Store input as first layer output
        
        // Process each layer
        for (let i = 0; i < this.weights.length; i++) {
            const currentLayerSize = this.weights[i].length;
            const prevLayerSize = this.weights[i][0].length;
            const layerOutputs = new Array(currentLayerSize).fill(0);
            
            // Vectorized matrix-vector multiplication
            for (let j = 0; j < currentLayerSize; j++) {
                let sum = this.biases[i][j];
                const weights = this.weights[i][j];
                
                // Unrolled loop for better performance
                for (let k = 0; k < prevLayerSize; k += 4) {
                    // Process 4 inputs at once if possible
                    if (k + 3 < prevLayerSize) {
                        sum += outputs[k] * weights[k] + 
                               outputs[k+1] * weights[k+1] + 
                               outputs[k+2] * weights[k+2] + 
                               outputs[k+3] * weights[k+3];
                    } else {
                        // Handle remaining elements
                        for (let m = k; m < prevLayerSize; m++) {
                            sum += outputs[m] * weights[m];
                        }
                    }
                }
                
                // Apply activation function
                layerOutputs[j] = this.activation(sum);
            }
            
            outputs = layerOutputs;
            this.layerOutputs.push(outputs);
        }
        
        return outputs;
    }
    
    /**
     * Mutate the network with random changes
     * @param {number} rate Mutation rate (0-1)
     * @param {number} amount Maximum amount of mutation
     */
    mutate(rate = 0.1, amount = 0.5) {
        // Mutate weights
        for (let i = 0; i < this.weights.length; i++) {
            for (let j = 0; j < this.weights[i].length; j++) {
                for (let k = 0; k < this.weights[i][j].length; k++) {
                    if (Math.random() < rate) {
                        // Apply mutation: add or subtract a random value
                        this.weights[i][j][k] += (Math.random() * 2 - 1) * amount;
                    }
                }
            }
        }
        
        // Mutate biases
        for (let i = 0; i < this.biases.length; i++) {
            for (let j = 0; j < this.biases[i].length; j++) {
                if (Math.random() < rate) {
                    // Apply mutation: add or subtract a random value
                    this.biases[i][j] += (Math.random() * 2 - 1) * amount;
                }
            }
        }
    }
    
    /**
     * Create a new neural network that is a crossover between this and another
     * @param {NeuralNetwork} other Another neural network to cross with
     * @param {number} crossoverRate Rate of gene crossover (0-1)
     * @returns {NeuralNetwork} New neural network with combined properties
     */
    crossover(other, crossoverRate = 0.5) {
        // Verify compatibility
        if (this.layers.length !== other.layers.length) {
            throw new Error("Cannot crossover networks with different architectures");
        }
        
        for (let i = 0; i < this.layers.length; i++) {
            if (this.layers[i] !== other.layers[i]) {
                throw new Error("Cannot crossover networks with different layer sizes");
            }
        }
        
        // Create new weights and biases arrays
        const newWeights = [];
        const newBiases = [];
        
        // Cross weights
        for (let i = 0; i < this.weights.length; i++) {
            const layerWeights = [];
            
            for (let j = 0; j < this.weights[i].length; j++) {
                const neuronWeights = [];
                
                for (let k = 0; k < this.weights[i][j].length; k++) {
                    // Randomly choose weight from either parent
                    if (Math.random() < crossoverRate) {
                        neuronWeights.push(this.weights[i][j][k]);
                    } else {
                        neuronWeights.push(other.weights[i][j][k]);
                    }
                }
                
                layerWeights.push(neuronWeights);
            }
            
            newWeights.push(layerWeights);
        }
        
        // Cross biases
        for (let i = 0; i < this.biases.length; i++) {
            const layerBiases = [];
            
            for (let j = 0; j < this.biases[i].length; j++) {
                // Randomly choose bias from either parent
                if (Math.random() < crossoverRate) {
                    layerBiases.push(this.biases[i][j]);
                } else {
                    layerBiases.push(other.biases[i][j]);
                }
            }
            
            newBiases.push(layerBiases);
        }
        
        // Create a new neural network with the crossed genes
        return new NeuralNetwork({
            layers: [...this.layers],
            activation: this.activation,
            activationName: this.activationName,
            weights: newWeights,
            biases: newBiases
        });
    }
    
    /**
     * Create a copy of this neural network
     * @returns {NeuralNetwork} Copy of this neural network
     */
    clone() {
        // Deep copy weights
        const newWeights = [];
        for (let i = 0; i < this.weights.length; i++) {
            const layerWeights = [];
            
            for (let j = 0; j < this.weights[i].length; j++) {
                layerWeights.push([...this.weights[i][j]]);
            }
            
            newWeights.push(layerWeights);
        }
        
        // Deep copy biases
        const newBiases = [];
        for (let i = 0; i < this.biases.length; i++) {
            newBiases.push([...this.biases[i]]);
        }
        
        // Create a new neural network as a clone
        return new NeuralNetwork({
            layers: [...this.layers],
            activation: this.activation,
            activationName: this.activationName,
            weights: newWeights,
            biases: newBiases
        });
    }
    
    /**
     * Calculate the difference between two neural networks
     * @param {NeuralNetwork} other Another neural network to compare with
     * @returns {number} Numerical difference between the networks
     */
    difference(other) {
        let totalDiff = 0;
        let totalElements = 0;
        
        // Compare weights
        for (let i = 0; i < this.weights.length; i++) {
            for (let j = 0; j < this.weights[i].length; j++) {
                for (let k = 0; k < this.weights[i][j].length; k++) {
                    totalDiff += Math.abs(this.weights[i][j][k] - other.weights[i][j][k]);
                    totalElements++;
                }
            }
        }
        
        // Compare biases
        for (let i = 0; i < this.biases.length; i++) {
            for (let j = 0; j < this.biases[i].length; j++) {
                totalDiff += Math.abs(this.biases[i][j] - other.biases[i][j]);
                totalElements++;
            }
        }
        
        // Average difference per parameter
        return totalElements > 0 ? totalDiff / totalElements : 0;
    }
    
    /**
     * Compress the network by pruning small weights
     * @param {number} threshold Threshold below which weights are set to zero
     * @returns {number} Number of weights pruned
     */
    prune(threshold = 0.01) {
        let prunedCount = 0;
        
        // Prune weights below threshold
        for (let i = 0; i < this.weights.length; i++) {
            for (let j = 0; j < this.weights[i].length; j++) {
                for (let k = 0; k < this.weights[i][j].length; k++) {
                    if (Math.abs(this.weights[i][j][k]) < threshold) {
                        this.weights[i][j][k] = 0;
                        prunedCount++;
                    }
                }
            }
        }
        
        return prunedCount;
    }
    
    /**
     * Convert network to a compact JSON representation
     */
    toJSON() {
        return {
            layers: this.layers,
            activationName: this.activationName,
            weights: this.weights,
            biases: this.biases
        };
    }
    
    /**
     * Create a neural network from JSON
     * @param {Object} json JSON representation of a neural network
     * @returns {NeuralNetwork} Reconstructed neural network
     */
    static fromJSON(json) {
        // Select activation function based on name
        const activationMap = {
            'sigmoid': NeuralNetwork.sigmoid,
            'relu': NeuralNetwork.relu,
            'tanh': NeuralNetwork.tanh,
            'leakyRelu': NeuralNetwork.leakyRelu
        };
        
        return new NeuralNetwork({
            layers: json.layers,
            activation: activationMap[json.activationName] || NeuralNetwork.sigmoid,
            activationName: json.activationName || 'sigmoid',
            weights: json.weights,
            biases: json.biases
        });
    }
    
    /**
     * Sigmoid activation function
     * @param {number} x Input value
     * @returns {number} Output value (0-1)
     */
    static sigmoid(x) {
        // Clamping to avoid extreme values that could cause numerical instability
        if (x < -15) return 0;
        if (x > 15) return 1;
        return 1 / (1 + Math.exp(-x));
    }
    
    /**
     * ReLU activation function
     * @param {number} x Input value
     * @returns {number} Output value (max of 0 and x)
     */
    static relu(x) {
        return Math.max(0, x);
    }
    
    /**
     * Leaky ReLU activation function
     * @param {number} x Input value
     * @param {number} alpha Leakage coefficient (default 0.01)
     * @returns {number} Output value
     */
    static leakyRelu(x, alpha = 0.01) {
        return x > 0 ? x : alpha * x;
    }
    
    /**
     * Tanh activation function
     * @param {number} x Input value
     * @returns {number} Output value (-1 to 1)
     */
    static tanh(x) {
        // Optimized tanh implementation
        if (x > 10) return 1;
        if (x < -10) return -1;
        
        // Calculate e^(2x) once
        const e2x = Math.exp(2 * x);
        return (e2x - 1) / (e2x + 1);
    }
}