/**
 * TestUI Component
 * Provides a user interface for running tests and viewing test results
 */
class TestUI {
    /**
     * Initialize the Test UI
     * @param {TestHarness} testHarness Reference to the test harness instance
     */
    constructor(testHarness) {
        this.testHarness = testHarness;
        this.container = null;
        this.resultsContainer = null;
        this.isVisible = false;
        
        this.initUI();
    }
    
    /**
     * Initialize the UI elements
     */
    initUI() {
        // Create test panel
        this.container = document.createElement('div');
        this.container.id = 'test-panel';
        this.container.className = 'panel';
        this.container.style.display = 'none';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'panel-header';
        header.innerHTML = '<h3>Simulation Testing</h3>';
        
        // Add toggle button
        const closeButton = document.createElement('button');
        closeButton.className = 'close-btn';
        closeButton.textContent = '×';
        closeButton.addEventListener('click', () => this.hide());
        header.appendChild(closeButton);
        
        // Create controls
        const controls = document.createElement('div');
        controls.className = 'panel-controls';
        
        const runTestsBtn = document.createElement('button');
        runTestsBtn.textContent = 'Run Performance Tests';
        runTestsBtn.addEventListener('click', () => this.runTests());
        
        const optimizeBtn = document.createElement('button');
        optimizeBtn.textContent = 'Analyze & Recommend';
        optimizeBtn.addEventListener('click', () => this.analyzeAndRecommend());
        
        controls.appendChild(runTestsBtn);
        controls.appendChild(optimizeBtn);
        
        // Create results container
        this.resultsContainer = document.createElement('div');
        this.resultsContainer.className = 'test-results';
        
        // Assemble panel
        this.container.appendChild(header);
        this.container.appendChild(controls);
        this.container.appendChild(this.resultsContainer);
        
        // Append to document
        document.body.appendChild(this.container);
        
        // Create toggle button for main UI
        this.createToggleButton();
    }
    
    /**
     * Create a button to toggle the test panel
     */
    createToggleButton() {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'toggle-test-panel';
        toggleBtn.textContent = 'Tests';
        toggleBtn.addEventListener('click', () => this.toggle());
        
        // Add to UI container
        const uiContainer = document.getElementById('ui-container');
        if (uiContainer) {
            uiContainer.appendChild(toggleBtn);
        } else {
            document.body.appendChild(toggleBtn);
        }
    }
    
    /**
     * Show the test panel
     */
    show() {
        this.container.style.display = 'block';
        this.isVisible = true;
    }
    
    /**
     * Hide the test panel
     */
    hide() {
        this.container.style.display = 'none';
        this.isVisible = false;
    }
    
    /**
     * Toggle the test panel visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    /**
     * Run the test suite and display results
     */
    runTests() {
        // Clear previous results
        this.resultsContainer.innerHTML = '<div class="loading">Running tests... This may take a moment.</div>';
        
        // Run the tests
        this.testHarness.runPerformanceTests()
            .then(results => {
                this.displayResults(results);
            })
            .catch(error => {
                this.resultsContainer.innerHTML = `<div class="error">Test error: ${error.message}</div>`;
                console.error('Test error:', error);
            });
    }
    
    /**
     * Analyze the simulation and recommend optimizations
     */
    analyzeAndRecommend() {
        const analysis = this.testHarness.analyzeAndRecommendOptimizations();
        
        if (typeof analysis === 'string') {
            // It's an error message
            this.resultsContainer.innerHTML += `<div class="error">${analysis}</div>`;
            return;
        }
        
        // Create recommendations section
        const recsContainer = document.createElement('div');
        recsContainer.className = 'recommendations';
        
        const recsHeader = document.createElement('h4');
        recsHeader.textContent = 'Optimization Recommendations';
        recsContainer.appendChild(recsHeader);
        
        const recsList = document.createElement('ul');
        analysis.recommendations.forEach(rec => {
            const item = document.createElement('li');
            item.textContent = rec;
            recsList.appendChild(item);
        });
        
        recsContainer.appendChild(recsList);
        this.resultsContainer.appendChild(recsContainer);
    }
    
    /**
     * Display test results in the UI
     * @param {Object} results Test results from TestHarness
     */
    displayResults(results) {
        // Clear loading message
        this.resultsContainer.innerHTML = '';
        
        // Create results section
        const resultsHeader = document.createElement('h4');
        resultsHeader.textContent = 'Performance Test Results';
        this.resultsContainer.appendChild(resultsHeader);
        
        // Process each test
        Object.entries(results).forEach(([testName, testData]) => {
            // Skip neural network test (it's displayed separately)
            if (testName === 'neuralNetworkPerformance') return;
            
            const testSection = document.createElement('div');
            testSection.className = 'test-section';
            
            const testTitle = document.createElement('h5');
            testTitle.textContent = this.formatTestName(testName);
            testSection.appendChild(testTitle);
            
            // Create metrics table
            const table = document.createElement('table');
            table.className = 'metrics-table';
            
            // Add table header
            const thead = document.createElement('thead');
            thead.innerHTML = '<tr><th>Metric</th><th>Average</th><th>Min</th><th>Max</th></tr>';
            table.appendChild(thead);
            
            // Add table body
            const tbody = document.createElement('tbody');
            
            Object.entries(testData).forEach(([metricName, metricData]) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${this.formatMetricName(metricName)}</td>
                    <td>${metricData.avg.toFixed(2)}</td>
                    <td>${metricData.min.toFixed(2)}</td>
                    <td>${metricData.max.toFixed(2)}</td>
                `;
                tbody.appendChild(row);
            });
            
            table.appendChild(tbody);
            testSection.appendChild(table);
            this.resultsContainer.appendChild(testSection);
        });
        
        // Process neural network results separately
        if (results.neuralNetworkPerformance) {
            const nnSection = document.createElement('div');
            nnSection.className = 'test-section';
            
            const nnTitle = document.createElement('h5');
            nnTitle.textContent = 'Neural Network Performance';
            nnSection.appendChild(nnTitle);
            
            // Create metrics table
            const table = document.createElement('table');
            table.className = 'metrics-table';
            
            // Add table header
            const thead = document.createElement('thead');
            thead.innerHTML = '<tr><th>Network</th><th>Avg Time (ms)</th><th>Operations/sec</th></tr>';
            table.appendChild(thead);
            
            // Add table body
            const tbody = document.createElement('tbody');
            
            Object.entries(results.neuralNetworkPerformance).forEach(([netName, netData]) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${netName}</td>
                    <td>${netData.avgProcessingTimeMs.toFixed(4)}</td>
                    <td>${netData.iterationsPerSecond.toFixed(0)}</td>
                `;
                tbody.appendChild(row);
            });
            
            table.appendChild(tbody);
            nnSection.appendChild(table);
            this.resultsContainer.appendChild(nnSection);
        }
    }
    
    /**
     * Format test name for display
     * @param {string} name Raw test name
     * @returns {string} Formatted name
     */
    formatTestName(name) {
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    }
    
    /**
     * Format metric name for display
     * @param {string} name Raw metric name
     * @returns {string} Formatted name
     */
    formatMetricName(name) {
        const nameMap = {
            'fps': 'FPS',
            'memoryMB': 'Memory (MB)',
            'updateTimeMs': 'Update Time (ms)',
            'renderTimeMs': 'Render Time (ms)'
        };
        
        return nameMap[name] || name;
    }
}