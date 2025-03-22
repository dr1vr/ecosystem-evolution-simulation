/**
 * Core Simulation class
 * Controls the overall simulation loop and coordinates components
 */
class Simulation {
    /**
     * Initialize the simulation
     * @param {HTMLCanvasElement} canvas Canvas element for rendering
     * @param {TestHarness} testHarness Performance testing harness
     */
    constructor(canvas, testHarness) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.testHarness = testHarness;
        
        // Simulation state
        this.running = false;
        this.speed = 1;
        this.generation = 0;
        this.timeSinceLastUpdate = 0;
        this.timeScale = 1000 / 60; // 60 fps target
        
        // Performance metrics
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        this.fps = 0;
        
        // Simulation components (to be initialized)
        this.environment = null; 
        this.creatures = [];
        this.plants = [];
        
        // Initialize configuration
        this.config = {
            environmentSize: 'medium',
            initialCreatureCount: 50,
            initialPlantCount: 100,
            generationLength: 60 * 1000, // 1 minute in ms
            mutationRate: 0.1,
            neuralNetworkConfig: {
                inputSize: 10,
                hiddenLayers: [8, 6],
                outputSize: 4,
                activation: 'leakyReLU'
            }
        };
        
        // Initialize components
        this.init();
    }
    
    /**
     * Initialize simulation components
     */
    init() {
        // Create test networks for performance testing
        this.createTestNetworks();
        
        // Create environment based on canvas size and config
        this.environment = {
            width: this.getEnvironmentWidth(),
            height: this.getEnvironmentHeight(),
            resources: 1000
        };
        
        // Initialize entities
        this.initializeEntities();
        
        console.log('Simulation initialized');
    }
    
    /**
     * Create test neural networks for performance measurements
     */
    createTestNetworks() {
        // Create a standard neural network for testing
        this.standardNetwork = new NeuralNetwork(100, [50, 20], 10);
        
        // Test network performance
        this.testHarness.testNeuralNetworkPerformance(this.standardNetwork);
    }
    
    /**
     * Initialize simulation entities
     */
    initializeEntities() {
        // Placeholder for entity initialization
        this.creatures = Array(this.config.initialCreatureCount).fill().map(() => ({
            x: Math.random() * this.environment.width,
            y: Math.random() * this.environment.height,
            energy: 100,
            age: 0,
            fitness: 0,
            network: new NeuralNetwork(
                this.config.neuralNetworkConfig.inputSize, 
                this.config.neuralNetworkConfig.hiddenLayers, 
                this.config.neuralNetworkConfig.outputSize,
                this.config.neuralNetworkConfig.activation
            )
        }));
        
        this.plants = Array(this.config.initialPlantCount).fill().map(() => ({
            x: Math.random() * this.environment.width,
            y: Math.random() * this.environment.height,
            energy: 50
        }));
    }
    
    /**
     * Get environment width based on configuration
     * @returns {number} Width in pixels
     */
    getEnvironmentWidth() {
        const sizeMap = {
            small: 500,
            medium: 1000,
            large: 2000
        };
        return sizeMap[this.config.environmentSize] || 1000;
    }
    
    /**
     * Get environment height based on configuration
     * @returns {number} Height in pixels
     */
    getEnvironmentHeight() {
        const sizeMap = {
            small: 500,
            medium: 1000,
            large: 2000
        };
        return sizeMap[this.config.environmentSize] || 1000;
    }
    
    /**
     * Start the simulation
     */
    start() {
        if (!this.running) {
            this.running = true;
            console.log('Simulation started');
        }
    }
    
    /**
     * Pause the simulation
     */
    pause() {
        if (this.running) {
            this.running = false;
            console.log('Simulation paused');
        }
    }
    
    /**
     * Reset the simulation
     */
    reset() {
        this.pause();
        this.generation = 0;
        this.timeSinceLastUpdate = 0;
        
        // Reset environment
        this.environment.resources = 1000;
        
        // Reinitialize entities
        this.initializeEntities();
        
        console.log('Simulation reset');
    }
    
    /**
     * Set simulation speed
     * @param {number} speed Speed multiplier
     */
    setSpeed(speed) {
        this.speed = Math.max(0.1, Math.min(10, speed));
        console.log(`Simulation speed set to ${this.speed}x`);
    }
    
    /**
     * Set environment size
     * @param {string} size Environment size ('small', 'medium', 'large')
     */
    setEnvironmentSize(size) {
        if (this.config.environmentSize !== size) {
            this.config.environmentSize = size;
            this.environment.width = this.getEnvironmentWidth();
            this.environment.height = this.getEnvironmentHeight();
            
            // Reposition entities to fit new environment
            this.repositionEntities();
            
            console.log(`Environment size set to ${size}`);
        }
    }
    
    /**
     * Reposition entities after environment size change
     */
    repositionEntities() {
        // Reposition creatures
        this.creatures.forEach(creature => {
            creature.x = Math.min(creature.x, this.environment.width);
            creature.y = Math.min(creature.y, this.environment.height);
        });
        
        // Reposition plants
        this.plants.forEach(plant => {
            plant.x = Math.min(plant.x, this.environment.width);
            plant.y = Math.min(plant.y, this.environment.height);
        });
    }
    
    /**
     * Handle window resize event
     */
    handleResize() {
        // Update camera and viewport if needed
        console.log('Window resized, updating rendering');
    }
    
    /**
     * Update simulation state
     */
    update() {
        if (!this.running) return;
        
        const now = performance.now();
        const deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;
        
        // Scale time based on simulation speed
        const scaledDelta = deltaTime * this.speed;
        this.timeSinceLastUpdate += scaledDelta;
        
        // Check if generation is complete
        if (this.timeSinceLastUpdate >= this.config.generationLength) {
            this.nextGeneration();
            this.timeSinceLastUpdate = 0;
        }
        
        // Update entities
        this.updateEntities(scaledDelta / this.timeScale);
        
        // Update FPS counter
        this.frameCount++;
        if (now - this.lastFrameTime > 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
        }
    }
    
    /**
     * Advance to the next generation
     */
    nextGeneration() {
        this.generation++;
        
        // Perform genetic algorithm operations
        // (selection, crossover, mutation would happen here)
        
        // For now, just reset creatures with some random mutations
        this.creatures.forEach(creature => {
            creature.energy = 100;
            creature.age = 0;
            creature.fitness = 0;
            
            // Apply random mutations
            if (Math.random() < this.config.mutationRate) {
                creature.network.mutate(0.1);
            }
        });
        
        console.log(`Advanced to generation ${this.generation}`);
    }
    
    /**
     * Update all entities in the simulation
     * @param {number} deltaTime Time elapsed since last update
     */
    updateEntities(deltaTime) {
        // Update creatures
        this.creatures.forEach(creature => {
            // Simulate creature movement
            creature.x += (Math.random() - 0.5) * 2;
            creature.y += (Math.random() - 0.5) * 2;
            
            // Keep within bounds
            creature.x = Math.max(0, Math.min(this.environment.width, creature.x));
            creature.y = Math.max(0, Math.min(this.environment.height, creature.y));
            
            // Update creature state
            creature.age += deltaTime;
            creature.energy -= 0.1 * deltaTime;
            creature.fitness += 0.01 * deltaTime;
        });
        
        // Update plants
        this.plants.forEach(plant => {
            // Simple plant growth
            if (plant.energy < 100) {
                plant.energy += 0.05 * deltaTime;
            }
        });
    }
    
    /**
     * Render the simulation
     */
    render() {
        // Clear canvas and setup transform for camera
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate scale factor to fit environment to canvas
        const scaleX = this.canvas.width / this.environment.width;
        const scaleY = this.canvas.height / this.environment.height;
        const scale = Math.min(scaleX, scaleY);
        
        // Center the environment in the canvas
        const offsetX = (this.canvas.width - this.environment.width * scale) / 2;
        const offsetY = (this.canvas.height - this.environment.height * scale) / 2;
        
        // Save context state
        this.ctx.save();
        this.ctx.translate(offsetX, offsetY);
        this.ctx.scale(scale, scale);
        
        // Draw environment boundary
        this.ctx.strokeStyle = '#444';
        this.ctx.lineWidth = 1 / scale;
        this.ctx.strokeRect(0, 0, this.environment.width, this.environment.height);
        
        // Draw plants
        this.ctx.fillStyle = '#3c3';
        this.plants.forEach(plant => {
            this.ctx.beginPath();
            this.ctx.arc(plant.x, plant.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw creatures
        this.ctx.fillStyle = '#39f';
        this.creatures.forEach(creature => {
            this.ctx.beginPath();
            this.ctx.arc(creature.x, creature.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Restore context state
        this.ctx.restore();
    }
    
    /**
     * Get current simulation statistics
     * @returns {Object} Current stats
     */
    getStats() {
        // Calculate average and max fitness
        let totalFitness = 0;
        let maxFitness = 0;
        
        this.creatures.forEach(creature => {
            totalFitness += creature.fitness;
            maxFitness = Math.max(maxFitness, creature.fitness);
        });
        
        const averageFitness = this.creatures.length > 0 ? totalFitness / this.creatures.length : 0;
        
        return {
            generation: this.generation,
            population: this.creatures.length,
            averageFitness: averageFitness,
            maxFitness: maxFitness,
            resources: this.environment.resources,
            fps: this.fps
        };
    }
}