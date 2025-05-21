// Subject data with units
const subjectData = {
  "PSLP": {
    "Unit 1": "Probability Theory",
    "Unit 2": "Random Variables & Distributions",
    "Unit 3": "Sampling & Estimation",
    "Unit 4": "Hypothesis Testing & LPP"
  },
  "Analog Electronics": {
    "Unit 1": "Op-Amps & Applications",
    "Unit 2": "Comparators, Converters, Oscillators",
    "Unit 3": "Filters & Regulators",
    "Unit 4": "Timers & Advanced Circuits"
  },
  "Chemistry": {
    "Unit 1": "Atomic Structure & Bonding",
    "Unit 2": "Thermodynamics & Electrochemistry",
    "Unit 3": "Polymers & Biomolecules",
    "Unit 4": "Environmental & Industrial Chemistry"
  },
  "Mathematics": {
    "Unit 1": "Differential Equations",
    "Unit 2": "Linear Algebra",
    "Unit 3": "Vector Calculus & PDEs",
    "Unit 4": "Transform Methods (Laplace, Fourier)"
  },
  "NAS": {
    "Unit 1": "Network Theorems",
    "Unit 2": "Laplace Transforms & Transient Analysis",
    "Unit 3": "Two-Port Networks",
    "Unit 4": "Network Synthesis"
  },
  "MPMC": {
    "Unit 1": "8085 Architecture & Programming",
    "Unit 2": "8086 & Interfacing Concepts",
    "Unit 3": "Memory & I/O Interfacing",
    "Unit 4": "Peripheral Devices & ADC/DAC"
  },
  "EMFT": {
    "Unit 1": "Electrostatics & Coordinate Systems",
    "Unit 2": "Magnetostatics & Boundary Conditions",
    "Unit 3": "Maxwell's Equations & Waves",
    "Unit 4": "Transmission Lines"
  },
  "Digital Communication": {
    "Unit 1": "Baseband Transmission",
    "Unit 2": "Modulation Techniques",
    "Unit 3": "Noise & Detection",
    "Unit 4": "Information Theory & Source Coding"
  },
  "Electrical": {
    "Unit 1": "DC Circuits & Theorems",
    "Unit 2": "AC Circuits & Phasors",
    "Unit 3": "Transformers & Machines",
    "Unit 4": "Instruments & Measurements"
  },
  "Physics": {
    "Unit 1": "Wave Optics",
    "Unit 2": "Quantum Mechanics",
    "Unit 3": "Solid State Physics",
    "Unit 4": "Lasers & Fiber Optics"
  },
  "Engineering Mechanics": {
    "Unit 1": "Statics & Free Body Diagrams",
    "Unit 2": "Friction & Centroid",
    "Unit 3": "Kinetics & Kinematics",
    "Unit 4": "Virtual Work & Impulse-Momentum"
  }
};

// Global variables
let progressChart = null;
let progressData = {
    done: 0,
    remaining: 33
};
const MAX_UNITS_PER_SUBJECT = 3;
const TOTAL_REQUIRED_UNITS = 33; // 11 subjects × 3 units each
const STORAGE_KEY = 'btech_progress_tracker';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadProgress();
    renderSubjects();
    createChart();
    updateProgressStats();
    
    // Reset button
    document.getElementById('reset-progress').addEventListener('click', resetProgress);
});

// Create and setup the progress chart
function createChart() {
    const ctx = document.getElementById('progress-chart').getContext('2d');
    
    progressChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Remaining'],
            datasets: [{
                data: [progressData.done, progressData.remaining],
                backgroundColor: [
                    '#4CAF50', // Green
                    '#F44336'  // Red
                ],
                borderWidth: 0,
                borderRadius: 5,
                hoverOffset: 4
            }]
        },
        options: {
            cutout: '70%',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        padding: 15,
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = 33;
                            const percentage = Math.round((value / total) * 100);
                            return `${value} units (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Render all subjects with their units
function renderSubjects() {
    const container = document.getElementById('subjects-container');
    container.innerHTML = '';
    
    let counter = 0;
    Object.keys(subjectData).forEach(subject => {
        counter++;
        const units = subjectData[subject];
        
        // Create subject accordion item
        const subjectElement = document.createElement('div');
        subjectElement.className = 'accordion-item';
        subjectElement.id = `subject-${formatId(subject)}`;
        
        // Check if subject is completed (3+ units)
        const checkedUnits = getCheckedUnitsCount(subject);
        if (checkedUnits >= MAX_UNITS_PER_SUBJECT) {
            subjectElement.classList.add('completed');
        }
        
        // Create accordion header
        const headerId = `heading-${formatId(subject)}`;
        const contentId = `collapse-${formatId(subject)}`;
        
        subjectElement.innerHTML = `
            <h2 class="accordion-header" id="${headerId}">
                <button class="accordion-button ${counter > 1 ? 'collapsed' : ''}" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#${contentId}" 
                        aria-expanded="${counter === 1}" 
                        aria-controls="${contentId}">
                    <div class="subject-title">
                        ${subject}
                        <span class="subject-progress" title="${checkedUnits} of ${MAX_UNITS_PER_SUBJECT} units complete">
                            ${checkedUnits}/${MAX_UNITS_PER_SUBJECT}
                        </span>
                    </div>
                    <i class="fas fa-check-circle checkmark"></i>
                </button>
            </h2>
            <div id="${contentId}" 
                 class="accordion-collapse collapse ${counter === 1 ? 'show' : ''}" 
                 aria-labelledby="${headerId}" 
                 data-bs-parent="#subjects-container">
                <div class="accordion-body">
                    <ul class="unit-list">
                        ${renderUnits(subject, units)}
                    </ul>
                </div>
            </div>
        `;
        
        container.appendChild(subjectElement);
    });
    
    // Add event listeners to checkboxes
    document.querySelectorAll('.unit-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', handleUnitCheckboxChange);
    });
}

// Render units for a subject
function renderUnits(subject, units) {
    let unitHtml = '';
    Object.keys(units).forEach(unitKey => {
        const unitId = `${formatId(subject)}-${formatId(unitKey)}`;
        const isChecked = getUnitCheckedState(subject, unitKey);
        
        unitHtml += `
            <li class="unit-item">
                <input type="checkbox" 
                       id="${unitId}" 
                       class="unit-checkbox"
                       data-subject="${subject}"
                       data-unit="${unitKey}"
                       ${isChecked ? 'checked' : ''}>
                <label for="${unitId}" class="unit-label">
                    ${unitKey}: ${units[unitKey]}
                </label>
            </li>
        `;
    });
    return unitHtml;
}

// Format subject/unit names for use as IDs
function formatId(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

// Handle checkbox change event
function handleUnitCheckboxChange(event) {
    const checkbox = event.target;
    const subject = checkbox.dataset.subject;
    const unit = checkbox.dataset.unit;
    
    // Update storage
    saveUnitState(subject, unit, checkbox.checked);
    
    // Update subject completion status
    updateSubjectStatus(subject);
    
    // Update progress chart and stats
    updateProgress();
}

// Update subject visual status
function updateSubjectStatus(subject) {
    const subjectElement = document.getElementById(`subject-${formatId(subject)}`);
    const checkedUnits = getCheckedUnitsCount(subject);
    
    // Update progress indicator
    const progressIndicator = subjectElement.querySelector('.subject-progress');
    progressIndicator.textContent = `${checkedUnits}/${MAX_UNITS_PER_SUBJECT}`;
    progressIndicator.title = `${checkedUnits} of ${MAX_UNITS_PER_SUBJECT} units complete`;
    
    // Check if subject is completed
    const wasCompleted = subjectElement.classList.contains('completed');
    const isNowCompleted = checkedUnits >= MAX_UNITS_PER_SUBJECT;
    
    if (isNowCompleted && !wasCompleted) {
        // Subject just completed - animate
        subjectElement.classList.add('completed', 'pulse-animation');
        setTimeout(() => {
            subjectElement.classList.remove('pulse-animation');
        }, 600);
    } else if (!isNowCompleted && wasCompleted) {
        // Subject no longer completed
        subjectElement.classList.remove('completed');
    }
}

// Update progress chart and statistics
function updateProgress() {
    let totalCompleted = 0;
    
    // Count completed units (max 3 per subject)
    Object.keys(subjectData).forEach(subject => {
        const checkedUnits = getCheckedUnitsCount(subject);
        totalCompleted += Math.min(checkedUnits, MAX_UNITS_PER_SUBJECT);
    });
    
    // Update chart data
    progressData.done = totalCompleted;
    progressData.remaining = TOTAL_REQUIRED_UNITS - totalCompleted;
    
    progressChart.data.datasets[0].data = [progressData.done, progressData.remaining];
    progressChart.update();
    
    // Update progress stats
    updateProgressStats();
    
    // Save progress
    saveProgress();
}

// Update the text progress display
function updateProgressStats() {
    const unitsComplete = document.getElementById('units-complete');
    const percentage = document.getElementById('progress-percentage');
    
    unitsComplete.textContent = progressData.done;
    const percentValue = Math.round((progressData.done / TOTAL_REQUIRED_UNITS) * 100);
    percentage.textContent = `${percentValue}%`;
}

// Database functions for progress persistence
function saveUnitState(subject, unit, isChecked) {
    const progress = getProgressFromStorage();
    
    if (!progress[subject]) {
        progress[subject] = {};
    }
    
    progress[subject][unit] = isChecked;
    
    // Save to both localStorage (for redundancy) and server database
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    saveProgress();
}

function getUnitCheckedState(subject, unit) {
    const progress = getProgressFromStorage();
    return progress[subject] && progress[subject][unit] === true;
}

function getCheckedUnitsCount(subject) {
    const progress = getProgressFromStorage();
    if (!progress[subject]) return 0;
    
    return Object.values(progress[subject]).filter(val => val === true).length;
}

function getProgressFromStorage() {
    // First try localStorage as it's faster
    const storedProgress = localStorage.getItem(STORAGE_KEY);
    return storedProgress ? JSON.parse(storedProgress) : {};
}

function saveProgress() {
    // Save progress to server
    const progress = getProgressFromStorage();
    
    fetch('/api/save-progress', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(progress)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Progress saved to server successfully');
        } else {
            console.error('Error saving progress to server:', data.message);
        }
    })
    .catch(error => {
        console.error('Error saving progress to server:', error);
    });
}

function loadProgress() {
    // First load from localStorage for quick startup
    let progress = getProgressFromStorage();
    
    // Initialize progressData with localStorage data
    updateProgressDataFromProgress(progress);
    
    // Then try to load from server database
    fetch('/api/load-progress')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                // Update localStorage with server data
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data.data));
                
                // Update progress data
                updateProgressDataFromProgress(data.data);
                
                // Re-render UI with server data
                renderSubjects();
                if (progressChart) {
                    progressChart.data.datasets[0].data = [progressData.done, progressData.remaining];
                    progressChart.update();
                }
                updateProgressStats();
            }
        })
        .catch(error => {
            console.error('Error loading progress from server:', error);
        });
}

function updateProgressDataFromProgress(progress) {
    let totalCompleted = 0;
    Object.keys(subjectData).forEach(subject => {
        if (progress[subject]) {
            const checkedUnits = Object.values(progress[subject]).filter(val => val === true).length;
            totalCompleted += Math.min(checkedUnits, MAX_UNITS_PER_SUBJECT);
        }
    });
    
    progressData.done = totalCompleted;
    progressData.remaining = TOTAL_REQUIRED_UNITS - totalCompleted;
}

function resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY);
        
        // Reset server database by saving empty object
        fetch('/api/save-progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        })
        .catch(error => {
            console.error('Error resetting progress on server:', error);
        });
        
        // Reset progress data
        progressData.done = 0;
        progressData.remaining = TOTAL_REQUIRED_UNITS;
        
        // Re-render everything
        renderSubjects();
        updateProgress();
    }
}
