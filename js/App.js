/**
 * Main application entry point
 * Initializes the simulation and UI components
 */
class App {
    constructor() {
        this.simulation = null;
        this.testHarness = null;
        this.testUI = null;
        this.canvas = document.getElementById('ecosystem-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Resize canvas to match window dimensions
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize components
        this.init();
    }
    
    /**
     * Initialize the application
     */
    init() {
        console.log('Initializing Ecosystem Evolution Simulation');
        
        // Create test harness first for performance monitoring
        this.testHarness = new TestHarness();
        
        // Initialize the simulation
        this.simulation = new Simulation(this.canvas, this.testHarness);
        
        // Initialize UI components
        this.initUI();
        
        // Start animation loop
        this.animate();
        
        console.log('Initialization complete');
    }
    
    /**
     * Initialize UI components
     */
    initUI() {
        // Initialize test UI panel
        this.testUI = new TestUI(this.testHarness);
        
        // Set up event listeners for control panel
        document.getElementById('start-btn').addEventListener('click', () => this.simulation.start());
        document.getElementById('pause-btn').addEventListener('click', () => this.simulation.pause());
        document.getElementById('reset-btn').addEventListener('click', () => this.simulation.reset());
        
        // Set up speed slider
        const speedSlider = document.getElementById('speed-slider');
        const speedValue = document.getElementById('speed-value');
        
        speedSlider.addEventListener('input', () => {
            const speed = speedSlider.value;
            speedValue.textContent = speed + 'x';
            this.simulation.setSpeed(parseFloat(speed));
        });
        
        // Set up environment size selector
        document.getElementById('environment-size').addEventListener('change', (e) => {
            const size = e.target.value;
            this.simulation.setEnvironmentSize(size);
        });
        
        // Set up panel toggle buttons
        document.querySelectorAll('.panel-header .close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const panel = e.target.closest('.panel');
                panel.style.display = 'none';
            });
        });
    }
    
    /**
     * Resize canvas to match window dimensions
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // If simulation exists, notify it of resize
        if (this.simulation) {
            this.simulation.handleResize();
        }
    }
    
    /**
     * Main animation loop
     */
    animate() {
        // Begin performance measurement
        this.testHarness.startMeasurement('animationFrame');
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update simulation if it exists
        if (this.simulation) {
            this.testHarness.startMeasurement('simulationUpdate');
            this.simulation.update();
            this.testHarness.endMeasurement('simulationUpdate');
            
            this.testHarness.startMeasurement('simulationRender');
            this.simulation.render();
            this.testHarness.endMeasurement('simulationRender');
        }
        
        // Update FPS counter
        this.updateStats();
        
        // End performance measurement
        this.testHarness.endMeasurement('animationFrame');
        
        // Request next animation frame
        requestAnimationFrame(() => this.animate());
    }
    
    /**
     * Update statistics display
     */
    updateStats() {
        if (!this.simulation) return;
        
        // Get current stats
        const stats = this.simulation.getStats();
        
        // Update stats display
        document.getElementById('stat-generation').textContent = stats.generation;
        document.getElementById('stat-population').textContent = stats.population;
        document.getElementById('stat-avg-fitness').textContent = stats.averageFitness.toFixed(2);
        document.getElementById('stat-max-fitness').textContent = stats.maxFitness.toFixed(2);
        document.getElementById('stat-resources').textContent = stats.resources;
        
        // Update FPS
        const fps = Math.round(this.testHarness.getFPS());
        document.getElementById('stat-fps').textContent = fps;
    }
}

// Initialize the application when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});