/**
 * Test Harness for Ecosystem Evolution Simulation
 * Used to run performance tests, stress tests, and evaluate the simulation behavior
 */
class TestHarness {
    /**
     * Initialize the test harness
     * @param {Simulation} simulation Reference to the simulation instance
     */
    constructor(simulation) {
        this.simulation = simulation;
        this.testResults = {};
        this.testQueue = [];
        this.runningTest = false;
        this.perfMetrics = {
            fps: [],
            memoryUsage: [],
            updateTimes: [],
            renderTimes: []
        };
        
        // Register with the simulation to track metrics
        this.simulation.addEventListener('update', this.collectMetrics.bind(this));
    }
    
    /**
     * Collect performance metrics during simulation runs
     * @param {Object} data Event data from simulation
     */
    collectMetrics(data) {
        // Skip if we're not actively testing
        if (!this.runningTest) return;
        
        // Record FPS
        this.perfMetrics.fps.push(data.fps || 0);
        
        // Record memory usage if available
        if (window.performance && window.performance.memory) {
            this.perfMetrics.memoryUsage.push(window.performance.memory.usedJSHeapSize / (1024 * 1024));
        }
        
        // Record update and render times
        this.perfMetrics.updateTimes.push(data.updateTime || 0);
        this.perfMetrics.renderTimes.push(data.renderTime || 0);
    }
    
    /**
     * Run a series of tests to evaluate simulation performance
     * @returns {Promise} Promise resolving to test results
     */
    runPerformanceTests() {
        return new Promise((resolve, reject) => {
            this.resetMetrics();
            this.runningTest = true;
            
            // Queue the tests
            this.testQueue = [
                this.testBasePerformance.bind(this),
                this.testHighPopulationPerformance.bind(this),
                this.testNeuralNetworkEfficiency.bind(this)
            ];
            
            this.runNextTest().then(() => {
                this.runningTest = false;
                resolve(this.testResults);
            }).catch(error => {
                this.runningTest = false;
                reject(error);
            });
        });
    }
    
    /**
     * Reset all performance metrics
     */
    resetMetrics() {
        Object.keys(this.perfMetrics).forEach(key => {
            this.perfMetrics[key] = [];
        });
    }
    
    /**
     * Run the next test in the queue
     */
    runNextTest() {
        const nextTest = this.testQueue.shift();
        if (!nextTest) return Promise.resolve();
        
        return nextTest().then(() => this.runNextTest());
    }
    
    /**
     * Test baseline performance with default simulation settings
     */
    testBasePerformance() {
        console.log("Running base performance test...");
        return new Promise(resolve => {
            // Reset simulation to baseline
            this.simulation.reset();
            
            // Wait for 10 seconds to gather metrics
            setTimeout(() => {
                this.testResults.basePerformance = this.calculatePerformanceMetrics();
                console.log("Base performance test completed", this.testResults.basePerformance);
                resolve();
            }, 10000);
        });
    }
    
    /**
     * Test performance with high population counts
     */
    testHighPopulationPerformance() {
        console.log("Running high population performance test...");
        return new Promise(resolve => {
            // Reset simulation with high population
            this.simulation.reset({
                initialPlants: 500,
                initialHerbivores: 200,
                initialCarnivores: 50
            });
            
            // Reset metrics for this test
            this.resetMetrics();
            
            // Wait for 10 seconds to gather metrics
            setTimeout(() => {
                this.testResults.highPopulationPerformance = this.calculatePerformanceMetrics();
                console.log("High population test completed", this.testResults.highPopulationPerformance);
                resolve();
            }, 10000);
        });
    }
    
    /**
     * Test neural network computational efficiency
     */
    testNeuralNetworkEfficiency() {
        console.log("Testing neural network efficiency...");
        return new Promise(resolve => {
            // Create a profiling point
            const testNets = [];
            const iterations = 1000;
            const inputSize = 10;
            
            // Create a few test networks with different complexities
            const architectures = [
                [inputSize, 5, 3],
                [inputSize, 10, 5, 3],
                [inputSize, 20, 10, 5, 3]
            ];
            
            // Create test networks
            architectures.forEach(arch => {
                testNets.push(new NeuralNetwork({
                    layers: arch
                }));
            });
            
            // Generate random test inputs
            const testInputs = Array(iterations).fill().map(() => 
                Array(inputSize).fill().map(() => Math.random())
            );
            
            // Test performance for each network
            const results = {};
            
            architectures.forEach((arch, idx) => {
                const net = testNets[idx];
                const name = `${arch.length}-layer (${arch.join('-')})`;
                
                const start = performance.now();
                
                // Run the network many times
                testInputs.forEach(input => {
                    net.feedForward(input);
                });
                
                const end = performance.now();
                const avgTime = (end - start) / iterations;
                
                results[name] = {
                    avgProcessingTimeMs: avgTime,
                    iterationsPerSecond: 1000 / avgTime
                };
            });
            
            this.testResults.neuralNetworkPerformance = results;
            console.log("Neural network test completed", results);
            resolve();
        });
    }
    
    /**
     * Calculate summary performance metrics from collected data
     */
    calculatePerformanceMetrics() {
        const calcStats = (data) => {
            if (data.length === 0) return { avg: 0, min: 0, max: 0 };
            
            const sum = data.reduce((acc, val) => acc + val, 0);
            const avg = sum / data.length;
            const min = Math.min(...data);
            const max = Math.max(...data);
            
            return { avg, min, max };
        };
        
        return {
            fps: calcStats(this.perfMetrics.fps),
            memoryMB: calcStats(this.perfMetrics.memoryUsage),
            updateTimeMs: calcStats(this.perfMetrics.updateTimes),
            renderTimeMs: calcStats(this.perfMetrics.renderTimes)
        };
    }
    
    /**
     * Test and recommend optimizations for the simulation
     */
    analyzeAndRecommendOptimizations() {
        // Make sure we have test results
        if (Object.keys(this.testResults).length === 0) {
            return "Please run performance tests first";
        }
        
        const recommendations = [];
        
        // Check FPS
        const baseFps = this.testResults.basePerformance.fps.avg;
        const highPopFps = this.testResults.highPopulationPerformance?.fps.avg;
        
        if (baseFps < 30) {
            recommendations.push("Base FPS is low (<30). Consider optimizing the main render loop.");
        }
        
        if (highPopFps && (baseFps - highPopFps) > 10) {
            recommendations.push("Significant FPS drop with higher populations. Consider implementing level-of-detail rendering or improving spatial partitioning.");
        }
        
        // Check update times
        const baseUpdateTime = this.testResults.basePerformance.updateTimeMs.avg;
        if (baseUpdateTime > 16) { // 16ms = approx 60fps
            recommendations.push("Update loop is taking >16ms. Consider optimizing organism update logic or using worker threads.");
        }
        
        // Check neural network performance
        const nnPerf = this.testResults.neuralNetworkPerformance;
        if (nnPerf) {
            const complexNet = Object.values(nnPerf).find(net => 
                net.avgProcessingTimeMs > 0.1
            );
            
            if (complexNet) {
                recommendations.push("Neural network processing is slow for complex networks. Consider network pruning, quantization, or SIMD optimization.");
            }
        }
        
        // Memory recommendations
        const baseMemory = this.testResults.basePerformance.memoryMB.avg;
        const highPopMemory = this.testResults.highPopulationPerformance?.memoryMB.avg;
        
        if (highPopMemory && (highPopMemory - baseMemory) > 100) {
            recommendations.push("Memory usage scales significantly with population. Consider object pooling for organisms and implementing memory-efficient data structures.");
        }
        
        if (recommendations.length === 0) {
            recommendations.push("Performance looks good! No immediate optimizations needed.");
        }
        
        return {
            metrics: this.testResults,
            recommendations
        };
    }
}