// Active Recall Practice - Standard Mode Only

document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const textInput = document.getElementById('textInput');
    const addButton = document.getElementById('addButton');
    const clearButton = document.getElementById('clearButton');
    const practiceSection = document.getElementById('practiceSection');
    const practiceContent = document.getElementById('practiceContent');
    const analyzeButton = document.getElementById('analyzeButton');
    const feedbackSection = document.getElementById('feedbackSection');
    const feedbackContent = document.getElementById('feedbackContent');
    
    // API Key elements
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiKey = document.getElementById('saveApiKey');
    const clearApiKey = document.getElementById('clearApiKey');
    const apiStatus = document.getElementById('apiStatus');
    
    // Initialize demo lines
    initializeDemoLines(document.querySelectorAll('.line'));
    
    // Load API key from config or localStorage
    loadApiKey();
    
    // Array to store practice items
    let practiceItems = [];
    
    // Save API Key
    saveApiKey.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem('openrouter_api_key', apiKey);
            showApiStatus('API Key saved successfully!', 'success');
            apiKeyInput.type = 'password';
        } else {
            showApiStatus('Please enter a valid API key', 'error');
        }
    });
    
    // Clear API Key
    clearApiKey.addEventListener('click', function() {
        if (confirm('Are you sure you want to remove the saved API key?')) {
            localStorage.removeItem('openrouter_api_key');
            apiKeyInput.value = '';
            showApiStatus('API Key cleared', 'error');
        }
    });
    
    // Show/hide API key
    apiKeyInput.addEventListener('focus', function() {
        this.type = 'text';
    });
    
    apiKeyInput.addEventListener('blur', function() {
        if (this.value) {
            this.type = 'password';
        }
    });
    
    // Add Lines button click handler
    addButton.addEventListener('click', function() {
        const text = textInput.value.trim();
        
        if (text === '') {
            alert('Please enter some text first!');
            return;
        }
        
        // Split text by line breaks
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        // Create practice items for each line
        lines.forEach(lineText => {
            createPracticeRow(lineText);
        });
        
        // Show the practice section
        practiceSection.style.display = 'block';
        
        // Clear the input
        textInput.value = '';
        
        // Scroll to practice content
        practiceSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    
    // Clear All button click handler
    clearButton.addEventListener('click', function() {
        if (practiceItems.length === 0) {
            return;
        }
        
        if (confirm('Are you sure you want to clear all content?')) {
            practiceContent.innerHTML = '';
            practiceItems = [];
            practiceSection.style.display = 'none';
            feedbackSection.style.display = 'none';
        }
    });
    
    // Analyze button click handler (Standard mode only)
    analyzeButton.addEventListener('click', async function() {
        const apiKey = localStorage.getItem('openrouter_api_key');
        
        if (!apiKey) {
            alert('Please set your OpenRouter API key in the settings above!');
            return;
        }
        
        // Get all user answers
        const answers = practiceItems.map((item, index) => {
            return {
                index: index,
                correct: item.correctAnswer,
                userAnswer: item.inputElement.value.trim()
            };
        });
        
        // Check if any answers are filled
        const hasAnswers = answers.some(a => a.userAnswer !== '');
        if (!hasAnswers) {
            alert('Please write at least one answer before analyzing!');
            return;
        }
        
        // Disable analyze button and show loading
        analyzeButton.disabled = true;
        analyzeButton.textContent = '⏳ Analyzing...';
        
        // Show feedback section with loading spinner
        feedbackSection.style.display = 'block';
        feedbackContent.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>AI is analyzing your answers...</p>
            </div>
        `;
        
        feedbackSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        try {
            // Call OpenRouter API - Standard mode only
            const feedback = await analyzeWithAI(apiKey, answers);
            displayFeedback(feedback);
        } catch (error) {
            console.error('Error analyzing answers:', error);
            feedbackContent.innerHTML = `
                <div class="feedback-item">
                    <h3>❌ Error</h3>
                    <p style="color: #721c24;">${error.message}</p>
                    <p style="margin-top: 1rem; color: #7f8c8d;">Please check your API key and try again.</p>
                </div>
            `;
        } finally {
            analyzeButton.disabled = false;
            analyzeButton.textContent = '🤖 Analyze My Answers';
        }
    });
    
    // Allow Ctrl+Enter to add lines
    textInput.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            addButton.click();
        }
    });
    
    // Function to load saved API key
    function loadApiKey() {
        // First check if config.js exists and has a key
        if (window.APP_CONFIG && window.APP_CONFIG.OPENROUTER_API_KEY && window.APP_CONFIG.AUTO_LOAD) {
            apiKeyInput.value = window.APP_CONFIG.OPENROUTER_API_KEY;
            // Auto-save to localStorage
            localStorage.setItem('openrouter_api_key', window.APP_CONFIG.OPENROUTER_API_KEY);
            showApiStatus('API Key loaded from config.js', 'success');
            return;
        }
        
        // Otherwise check localStorage
        const savedKey = localStorage.getItem('openrouter_api_key');
        if (savedKey) {
            apiKeyInput.value = savedKey;
            showApiStatus('API Key loaded from storage', 'success');
        }
    }
    
    // Function to show API status
    function showApiStatus(message, type) {
        apiStatus.textContent = message;
        apiStatus.className = `api-status ${type}`;
        apiStatus.style.display = 'block';
        
        setTimeout(() => {
            apiStatus.style.display = 'none';
        }, 3000);
    }
    
    // Function to create a practice row (two columns)
    function createPracticeRow(correctAnswer) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'practice-row';
        
        // Left column - Correct answer (blurred)
        const leftCol = document.createElement('div');
        leftCol.className = 'practice-col';
        leftCol.innerHTML = `
            <div class="practice-label">Correct Answer (Hover to peek)</div>
            <div class="answer-line" tabindex="0">${correctAnswer}</div>
        `;
        
        // Right column - User input
        const rightCol = document.createElement('div');
        rightCol.className = 'practice-col';
        const textarea = document.createElement('textarea');
        textarea.className = 'user-answer-input';
        textarea.placeholder = 'Write what you remember here...';
        textarea.rows = 3;
        
        rightCol.innerHTML = '<div class="practice-label">Your Answer</div>';
        rightCol.appendChild(textarea);
        
        // Add columns to row
        rowDiv.appendChild(leftCol);
        rowDiv.appendChild(rightCol);
        
        // Add to practice content
        practiceContent.appendChild(rowDiv);
        
        // Initialize blur effect on answer line
        const answerLine = leftCol.querySelector('.answer-line');
        initializeAnswerLine(answerLine);
        
        // Store reference
        practiceItems.push({
            correctAnswer: correctAnswer,
            inputElement: textarea,
            rowElement: rowDiv
        });
        
        // Add animation
        rowDiv.style.animation = 'fadeIn 0.3s ease-out';
    }
    
    // Function to initialize blur effect on answer lines
    function initializeAnswerLine(line) {
        line.addEventListener('click', function() {
            this.classList.toggle('revealed');
        });
        
        line.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.classList.toggle('revealed');
            }
        });
    }
    
    // Function to initialize demo lines
    function initializeDemoLines(lines) {
        lines.forEach(line => {
            line.addEventListener('click', function() {
                this.classList.toggle('revealed');
            });
            
            line.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.classList.toggle('revealed');
                }
            });
            
            line.setAttribute('tabindex', '0');
        });
    }
    
    // Function to call OpenRouter API - Standard mode only
    async function analyzeWithAI(apiKey, answers) {
        // Filter only answered items
        const answeredItems = answers.filter(a => a.userAnswer !== '');
        
        // Standard Teaching Mode Prompt
        const prompt = `You are an expert cognitive learning tutor specializing in active recall and memory science. A student is practicing active recall - they tried to retrieve information from memory and wrote their answers. Your mission is to be their personal learning coach.

TEACHING APPROACH:
1. **Celebrate what they got right** - Reinforce correct neural pathways with positive feedback
2. **Identify knowledge gaps** - Pinpoint exactly what was missing or incorrect
3. **Teach, don't just correct** - Explain WHY the correct answer matters and HOW to remember it
4. **Provide memory techniques** - Offer mnemonics, associations, analogies, or stories to aid retention
5. **Connect concepts** - Show how this relates to other knowledge they might have
6. **Encourage retrieval practice** - Suggest specific ways to practice this concept again

FEEDBACK STRUCTURE for each item:
- Score: Rate as "Excellent" (95-100% accurate), "Good" (70-94% accurate), "Needs Improvement" (40-69% accurate), or "Poor" (<40% accurate or blank)
- Feedback should include:
  * What they captured correctly (be specific and encouraging)
  * What they missed or misunderstood
  * A clear explanation of the correct concept
  * A practical memory technique (acronym, story, visual, analogy, pattern, etc.)
  * A tip for better recall next time

Be conversational, encouraging, and genuinely helpful. Write 3-5 sentences per feedback. Make learning feel achievable and exciting.

Respond in JSON format as an array:
[
  {
    "index": <number>,
    "score": "Excellent|Good|Needs Improvement|Poor",
    "feedback": "Your detailed, encouraging teaching feedback here"
  }
]

STUDENT'S PRACTICE SESSION:

${answeredItems.map((item, idx) => `
Item ${idx + 1}:
📚 Correct Answer: "${item.correct}"
✍️ Student's Attempt: "${item.userAnswer || "[No answer provided]"}"
`).join('\n')}

Respond ONLY with the JSON array, no additional text outside the JSON.`;
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'Active Recall Learning',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'x-ai/grok-4-fast',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }
        
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        // Parse JSON response
        try {
            // Try to extract JSON from response (in case AI added extra text)
            const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return {
                    mode: 'standard',
                    feedback: JSON.parse(jsonMatch[0])
                };
            }
            return {
                mode: 'standard',
                feedback: JSON.parse(aiResponse)
            };
        } catch (e) {
            // If JSON parsing fails, create structured feedback from text
            return {
                mode: 'standard',
                feedback: answeredItems.map((item, idx) => ({
                    index: item.index,
                    score: 'Good',
                    feedback: aiResponse
                }))
            };
        }
    }
    
    // Function to display AI feedback - Standard mode only
    function displayFeedback(feedbackData) {
        feedbackContent.innerHTML = '';
        
        // Standard Teaching Mode - Display as structured cards
        const feedbackArray = feedbackData.feedback || feedbackData;
        
        feedbackArray.forEach((feedback, idx) => {
            const itemIndex = feedback.index;
            const item = practiceItems[itemIndex];
            
            const feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'feedback-item';
            
            // Determine score class
            const scoreClass = feedback.score.toLowerCase().replace(/\s+/g, '-');
            
            feedbackDiv.innerHTML = `
                <div class="feedback-item-header">
                    <span class="feedback-item-number">Question ${itemIndex + 1}</span>
                    <span class="feedback-score ${scoreClass}">${feedback.score}</span>
                </div>
                
                <div class="feedback-comparison">
                    <div class="feedback-text feedback-correct">
                        <h4>✓ Correct Answer</h4>
                        <p>${item.correctAnswer}</p>
                    </div>
                    <div class="feedback-text feedback-yours">
                        <h4>✍️ Your Answer</h4>
                        <p>${item.inputElement.value || '<em>No answer provided</em>'}</p>
                    </div>
                </div>
                
                <div class="feedback-teaching">
                    <h4>🎓 AI Teacher Feedback</h4>
                    <p>${feedback.feedback}</p>
                </div>
            `;
            
            feedbackContent.appendChild(feedbackDiv);
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
});

