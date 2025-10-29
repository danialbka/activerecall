// Active Recall Learning - Interactive Features

document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const textInput = document.getElementById('textInput');
    const addButton = document.getElementById('addButton');
    const clearButton = document.getElementById('clearButton');
    const userContent = document.getElementById('userContent');
    const userLines = document.getElementById('userLines');
    
    // Initialize line interactivity for existing lines
    initializeLines(document.querySelectorAll('.line'));
    
    // Add Lines button click handler
    addButton.addEventListener('click', function() {
        const text = textInput.value.trim();
        
        if (text === '') {
            alert('Please enter some text first!');
            return;
        }
        
        // Split text by line breaks
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        // Create and add each line
        lines.forEach(lineText => {
            createBlurredLine(lineText);
        });
        
        // Show the user content section
        userContent.style.display = 'block';
        
        // Clear the input
        textInput.value = '';
        
        // Scroll to user content
        userContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    
    // Clear All button click handler
    clearButton.addEventListener('click', function() {
        if (userLines.children.length === 0) {
            return;
        }
        
        if (confirm('Are you sure you want to clear all your added content?')) {
            userLines.innerHTML = '';
            userContent.style.display = 'none';
        }
    });
    
    // Allow Enter key to add lines (Ctrl+Enter or Cmd+Enter)
    textInput.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            addButton.click();
        }
    });
    
    // Function to create a new blurred line
    function createBlurredLine(text) {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'line';
        lineDiv.textContent = text;
        lineDiv.setAttribute('tabindex', '0');
        
        // Add interactive features to this line
        initializeLines([lineDiv]);
        
        // Add to user content area
        userLines.appendChild(lineDiv);
        
        // Add animation
        lineDiv.style.animation = 'fadeIn 0.3s ease-out';
    }
    
    // Function to initialize blur/reveal interactivity on lines
    function initializeLines(lines) {
        lines.forEach(line => {
            // Add click to toggle blur (for mobile/touch devices)
            line.addEventListener('click', function() {
                this.classList.toggle('revealed');
            });
            
            // Handle keyboard interaction
            line.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.classList.toggle('revealed');
                }
            });
            
            // Track revealed lines
            line.addEventListener('mouseenter', function() {
                if (!this.classList.contains('was-revealed')) {
                    this.classList.add('was-revealed');
                }
            });
        });
    }
    
    // Add smooth reveal style for clicked items
    const style = document.createElement('style');
    style.textContent = `
        .line.revealed {
            filter: blur(0) !important;
            background: #e8f4f8 !important;
            transform: translateX(4px);
        }
    `;
    document.head.appendChild(style);
    
    // Optional: Press Escape to blur all revealed lines
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const allLines = document.querySelectorAll('.line');
            allLines.forEach(line => {
                line.classList.remove('revealed');
            });
        }
    });
});
