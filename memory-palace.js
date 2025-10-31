// Memory Palace Generator - Timeline Experience

document.addEventListener('DOMContentLoaded', () => {
    // Core UI elements
    const textInput = document.getElementById('textInput');
    const goalInput = document.getElementById('goalInput');
    const themeInput = document.getElementById('themeInput');
    const generateButton = document.getElementById('generateButton');
    const clearButton = document.getElementById('clearButton');
    const feedbackSection = document.getElementById('feedbackSection');
    const feedbackContent = document.getElementById('feedbackContent');

    // Mode tabs
    const directModeTab = document.getElementById('directModeTab');
    const goalModeTab = document.getElementById('goalModeTab');
    const directMode = document.getElementById('directMode');
    const goalMode = document.getElementById('goalMode');

    // Chat elements
    const chatSection = document.getElementById('chatSection');
    const chatMessages = document.getElementById('chatMessages');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatStatus = document.getElementById('chatStatus');
    const chatSendButton = document.getElementById('chatSendButton');

    // API key controls
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiKeyButton = document.getElementById('saveApiKey');
    const clearApiKeyButton = document.getElementById('clearApiKey');
    const apiStatus = document.getElementById('apiStatus');

    // Application state
    const state = {
        currentMode: 'direct',
        lastPrompt: '',
        currentPalaceData: null,
        chatInitialized: false,
        conversationHistory: []
    };

    const CHAT_SYSTEM_PROMPT = `You are the cinematic memory guide who crafted the learner's Memory Palace timeline. Stay enthusiastic, reference the existing palace nodes when helpful, and answer every follow-up without asking the learner to re-enter content. When code or math is relevant, include concise snippets. Only rebuild or replace the palace if the learner explicitly requests it.`;

    // Initialisation
    loadApiKey();
    loadLastMemoryPalace();

    // Mode tab events
    directModeTab.addEventListener('click', () => switchMode('direct'));
    goalModeTab.addEventListener('click', () => switchMode('goal'));

    // Keyboard shortcuts
    textInput.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            generateButton.click();
        }
    });
    goalInput.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            generateButton.click();
        }
    });

    // API key handlers
    saveApiKeyButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            showApiStatus('Please enter a valid API key', 'error');
            return;
        }
        localStorage.setItem('openrouter_api_key', apiKey);
        showApiStatus('API Key saved successfully!', 'success');
        apiKeyInput.type = 'password';
    });

    clearApiKeyButton.addEventListener('click', () => {
        if (confirm('Remove the saved API key?')) {
            localStorage.removeItem('openrouter_api_key');
            apiKeyInput.value = '';
            showApiStatus('API Key cleared', 'error');
        }
    });

    apiKeyInput.addEventListener('focus', function () {
        this.type = 'text';
    });
    apiKeyInput.addEventListener('blur', function () {
        if (this.value) {
            this.type = 'password';
        }
    });

    // Chat handlers
    if (chatForm && chatInput) {
        chatForm.addEventListener('submit', handleChatSubmit);
        chatInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                chatForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
        });
    }

    // Generate button
    generateButton.addEventListener('click', async () => {
        const apiKey = localStorage.getItem('openrouter_api_key');
        if (!apiKey) {
            alert('Please set your OpenRouter API key in the settings above!');
            return;
        }

        let content = '';
        let originalInput = '';

        if (state.currentMode === 'direct') {
            content = textInput.value.trim();
            originalInput = content;
            if (!content) {
                alert('Please enter some learning content first!');
                return;
            }
        } else {
            const goalText = goalInput.value.trim();
            originalInput = goalText;
            if (!goalText) {
                alert('Please describe what you want to learn!');
                return;
            }

            try {
                generateButton.disabled = true;
                generateButton.textContent = '🤖 Expanding learning goal...';
                showLoadingCard('Expanding your learning goal into structured content...');
                content = await expandLearningGoal(apiKey, goalText);
            } catch (error) {
                console.error('Error expanding learning goal:', error);
                showErrorCard('Error Expanding Goal', error.message, 'Please try again or use Direct Content mode.');
                generateButton.disabled = false;
                generateButton.textContent = '⚡ Generate Memory Palace';
                return;
            }
        }

        const lines = content
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        if (lines.length === 0) {
            alert('Please provide at least one learning item (use line breaks to separate concepts).');
            return;
        }

        const theme = themeInput.value.trim();

        // Prepare UI
        generateButton.disabled = true;
        generateButton.textContent = '⚡ Creating Memory Palace...';
        showLoadingCard('Building your Tesla Memory Palace timeline...');
        resetChat();

        try {
            const prompt = buildPalacePrompt(lines, theme);
            state.lastPrompt = prompt;

            const rawPalace = await requestPalace(apiKey, prompt);
            const palaceData = parsePalaceResponse(rawPalace);

            if (!palaceData) {
                throw new Error('Model returned data in an unexpected format. Please try again.');
            }

            displayMemoryPalace(palaceData);
            const narrative = palaceDataToNarrative(palaceData);
            initializeChatConversation(state.lastPrompt, narrative);

            try {
                await saveMemoryPalace(originalInput, theme, JSON.stringify(palaceData));
            } catch (error) {
                console.error('Error saving Memory Palace:', error);
            }
        } catch (error) {
            console.error('Error generating memory palace:', error);
            showErrorCard('Generation Error', error.message, 'Please check your API key and try again.');
        } finally {
            generateButton.disabled = false;
            generateButton.textContent = '⚡ Generate Memory Palace';
        }
    });

    // Clear button
    clearButton.addEventListener('click', () => {
        if (!confirm('Are you sure you want to clear everything?')) {
            return;
        }

        textInput.value = '';
        goalInput.value = '';
        themeInput.value = '';
        feedbackSection.style.display = 'none';
        feedbackContent.innerHTML = '';
        resetChat();
    });

    // ---------------------------
    // Mode switching and loading
    // ---------------------------

    function switchMode(mode) {
        state.currentMode = mode;
        if (mode === 'direct') {
            directModeTab.classList.add('active');
            goalModeTab.classList.remove('active');
            directMode.classList.add('active');
            directMode.style.display = 'block';
            goalMode.classList.remove('active');
            goalMode.style.display = 'none';
        } else {
            goalModeTab.classList.add('active');
            directModeTab.classList.remove('active');
            goalMode.classList.add('active');
            goalMode.style.display = 'block';
            directMode.classList.remove('active');
            directMode.style.display = 'none';
        }
    }

    async function loadLastMemoryPalace() {
        try {
            const lastPalace = await getLatestMemoryPalace();
            if (!lastPalace) {
                return;
            }

            const content = lastPalace.content || '';
            if (content.length < 200 && /^(i want to learn|teach me|i need to understand)/i.test(content)) {
                goalInput.value = content;
                switchMode('goal');
            } else {
                textInput.value = content;
                switchMode('direct');
            }

            themeInput.value = lastPalace.theme || '';

            if (lastPalace.result) {
                const palaceData = parsePalaceResponse(lastPalace.result);
                if (palaceData) {
                    displayMemoryPalace(palaceData);
                    const narrative = palaceDataToNarrative(palaceData);
                    initializeChatConversation('', narrative);
                }
            }
        } catch (error) {
            console.error('Error loading last Memory Palace:', error);
        }
    }

    // ---------------------------
    // API helpers
    // ---------------------------

    function loadApiKey() {
        if (window.APP_CONFIG && window.APP_CONFIG.OPENROUTER_API_KEY && window.APP_CONFIG.AUTO_LOAD) {
            apiKeyInput.value = window.APP_CONFIG.OPENROUTER_API_KEY;
            localStorage.setItem('openrouter_api_key', window.APP_CONFIG.OPENROUTER_API_KEY);
            showApiStatus('API Key loaded from config.js', 'success');
            return;
        }

        const savedKey = localStorage.getItem('openrouter_api_key');
        if (savedKey) {
            apiKeyInput.value = savedKey;
            showApiStatus('API Key loaded from storage', 'success');
        }
    }

    function showApiStatus(message, type) {
        apiStatus.textContent = message;
        apiStatus.className = `api-status ${type}`;
        apiStatus.style.display = 'block';
        setTimeout(() => {
            apiStatus.style.display = 'none';
        }, 3000);
    }

    function buildPalacePrompt(lines, theme) {
        let themeInstruction = '';
        if (theme) {
            themeInstruction = `\n\nTHEME_GUIDANCE:\n- Anchor every scene inside the universe of "${theme}".\n- Reference iconic locations, characters, props, and atmosphere specific to this theme.\n- Ensure sensory hooks and metaphors feel authentic to dedicated fans.`;
        }

        const escapedItems = lines.map((line) => `"${line.replace(/"/g, '\\"')}"`).join(',\n');

        return `You are a cinematic memory architect who speaks with the energetic, story-first tone shown in example.md. Transform the learner's content into a Tesla-style Memory Palace that unfolds as a timeline adventure. Do not ask the learner questions or request additional input—speak as their mentor narrating the experience.${themeInstruction}

Build a horizontal Memory Palace timeline using the learning items below. Create exactly ${lines.length} nodes—one per item—and return ONLY strict JSON (no markdown, no commentary) following this schema:
{
  "orientation": {
    "setting": "Vivid palace setting name",
    "mission": "Motivational mission statement (~1 sentence)",
    "highlights": ["Key highlight 1", "Key highlight 2"]
  },
  "timeline": [
    {
      "id": "unique id like room1",
      "title": "Room label with emoji (e.g. 'Room 1 – ⚡ Spark Gate')",
      "icon": "Emoji for the node",
      "summary": "≤120 character summary of what this node teaches",
      "concept": "Plain-language anchor sentence for the concept",
      "scene": "2-3 sentence cinematic description packed with sensory cues",
      "hooks": ["Hook 1", "Hook 2", "Hook 3"],
      "quickCue": "Short mantra for instant recall",
      "callout": {
        "type": "code" or "example",
        "language": "Language name when type is code, otherwise empty string",
        "content": "Code snippet or real-world illustration"
      }
    }
  ],
  "retrieval": {
    "steps": ["Step 1", "Step 2", "Step 3"],
    "mantra": "2-sentence confidence-boosting mantra"
  }
}

Rules:
- timeline array length must equal the number of learning items.
- hooks array must contain exactly three vivid sensory/emotional hooks.
- callout.type must be "code" when sharing syntax/math/step-by-step instructions; otherwise use "example".
- Escape any internal newlines with \\n so the JSON remains valid.
- Do not include markdown formatting, headings, or additional commentary—return JSON only.

LEARNING_ITEMS:
[
${escapedItems}
]`;
    }

    async function requestPalace(apiKey, prompt) {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'Memory Palace Generator',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'x-ai/grok-4-fast',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.8
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async function expandLearningGoal(apiKey, goal) {
        const prompt = `You are an expert educational content creator. A user wants to learn about something and has provided their learning goal.

Your task is to expand their learning goal into structured, comprehensive learning content that covers:
- Key concepts and definitions
- Important facts and details
- Examples and applications
- Related sub-topics
- Critical points to remember

Format the content as clear, concise statements - one per line. Each line should be a distinct fact, concept, or piece of information that the user should learn.

Make it comprehensive but focused. Aim for 10-20 key learning points.

USER'S LEARNING GOAL:
"${goal}"

Provide structured learning content (one concept/fact per line):`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'Memory Palace Generator',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'x-ai/grok-4-fast',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    // ---------------------------
    // Rendering helpers
    // ---------------------------

    function showLoadingCard(message) {
        feedbackSection.style.display = 'block';
        feedbackContent.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>${escapeHtml(message)}</p>
            </div>
        `;
    }

    function showErrorCard(title, message, hint) {
        feedbackSection.style.display = 'block';
        feedbackContent.innerHTML = `
            <div class="feedback-item">
                <h3>❌ ${escapeHtml(title)}</h3>
                <p style="color: #721c24;">${escapeHtml(message)}</p>
                <p style="margin-top: 1rem; color: #7f8c8d;">${escapeHtml(hint)}</p>
            </div>
        `;
    }

    function parsePalaceResponse(raw) {
        if (!raw) {
            return null;
        }
        try {
            const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (!data || !Array.isArray(data.timeline) || data.timeline.length === 0) {
                return null;
            }
            return data;
        } catch (error) {
            console.error('Failed to parse palace response:', error);
            return null;
        }
    }

    function displayMemoryPalace(data) {
        state.currentPalaceData = data;
        feedbackContent.innerHTML = '';
        feedbackSection.style.display = 'block';

        if (!data || !Array.isArray(data.timeline) || data.timeline.length === 0) {
            showErrorCard('Display Error', 'No timeline nodes were provided.', 'Try generating again with clearer learning items.');
            return;
        }

        const container = document.createElement('div');
        container.className = 'palace-dashboard';

        if (data.orientation) {
            container.appendChild(renderOrientation(data.orientation));
        }

        const layout = document.createElement('div');
        layout.className = 'palace-layout';

        const timelineSection = document.createElement('section');
        timelineSection.className = 'timeline-section';

        const timelineScroll = document.createElement('div');
        timelineScroll.className = 'timeline-scroll';

        const progressTrack = document.createElement('div');
        progressTrack.className = 'timeline-progress-track';
        const progressBar = document.createElement('div');
        progressBar.className = 'timeline-progress-bar';
        progressTrack.appendChild(progressBar);

        const detailPanel = document.createElement('section');
        detailPanel.className = 'palace-detail';

        const nodeButtons = [];

        data.timeline.forEach((node, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'timeline-node';

            const icon = escapeHtml(node.icon || '🧠');
            const title = escapeHtml(node.title || `Room ${index + 1}`);
            const summary = escapeHtml(node.summary || node.concept || '');

            button.innerHTML = `
                <span class="timeline-node-icon">${icon}</span>
                <span class="timeline-node-text">
                    <span class="timeline-node-title">${title}</span>
                    <span class="timeline-node-summary">${summary}</span>
                </span>
            `;

            button.addEventListener('click', () => selectNode(index));
            timelineScroll.appendChild(button);
            nodeButtons.push(button);
        });

        timelineSection.appendChild(timelineScroll);
        timelineSection.appendChild(progressTrack);

        layout.appendChild(timelineSection);
        layout.appendChild(detailPanel);
        container.appendChild(layout);

        if (data.retrieval) {
            container.appendChild(renderRetrieval(data.retrieval));
        }

        feedbackContent.appendChild(container);

        selectNode(0);

        function selectNode(index) {
            const node = data.timeline[index];
            if (!node) {
                return;
            }

            nodeButtons.forEach((btn, idx) => {
                if (idx === index) {
                    btn.classList.add('active');
                    btn.setAttribute('aria-current', 'step');
                } else {
                    btn.classList.remove('active');
                    btn.removeAttribute('aria-current');
                }
            });

            const completion = ((index + 1) / nodeButtons.length) * 100;
            progressBar.style.width = `${completion}%`;

            detailPanel.innerHTML = renderDetailContent(node, index);

            nodeButtons[index].scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest'
            });
        }
    }

    function renderOrientation(orientation) {
        const section = document.createElement('section');
        section.className = 'palace-orientation';

        const setting = escapeHtml(orientation.setting || 'Memory Palace');
        const mission = formatText(orientation.mission || '');

        section.innerHTML = `
            <div class="palace-orientation-header">
                <span class="palace-orientation-icon">🧭</span>
                <div>
                    <h3>${setting}</h3>
                    <p class="palace-mission">${mission}</p>
                </div>
            </div>
        `;

        if (Array.isArray(orientation.highlights) && orientation.highlights.length) {
            const list = document.createElement('ul');
            list.className = 'palace-highlights';
            orientation.highlights.forEach((item) => {
                if (!item) return;
                const li = document.createElement('li');
                li.textContent = item;
                list.appendChild(li);
            });
            section.appendChild(list);
        }

        return section;
    }

    function renderDetailContent(node, index) {
        const title = escapeHtml(node.title || `Room ${index + 1}`);
        const concept = formatText(node.concept || '');
        const scene = formatText(node.scene || '');
        const quickCue = escapeHtml(node.quickCue || '');

        const hooks = Array.isArray(node.hooks) ? node.hooks.slice(0, 3) : [];
        const hooksList = hooks
            .map((hook) => `<li>${escapeHtml(hook)}</li>`)
            .join('');

        let calloutMarkup = '';
        if (node.callout && node.callout.content) {
            if (node.callout.type === 'code') {
                const languageClass = node.callout.language
                    ? ` class="language-${escapeHtml(node.callout.language.toLowerCase())}"`
                    : '';
                calloutMarkup = `
                    <div class="palace-callout">
                        <div class="palace-callout-label">Code Simulation</div>
                        <pre><code${languageClass}>${escapeHtml(node.callout.content)}</code></pre>
                    </div>
                `;
            } else {
                calloutMarkup = `
                    <div class="palace-callout">
                        <div class="palace-callout-label">Example</div>
                        <p>${formatText(node.callout.content)}</p>
                    </div>
                `;
            }
        }

        return `
            <header class="palace-detail-header">
                <h3>${title}</h3>
                <p class="palace-detail-summary">${escapeHtml(node.summary || '')}</p>
            </header>
            <div class="palace-detail-body">
                <p class="palace-concept"><strong>Concept Anchor:</strong> ${concept}</p>
                <p class="palace-scene">${scene}</p>
                ${
                    hooksList
                        ? `<div class="palace-hooks">
                            <h4>Sensory Hooks</h4>
                            <ul>${hooksList}</ul>
                           </div>`
                        : ''
                }
                ${
                    quickCue
                        ? `<p class="palace-quick-cue"><em>${quickCue}</em></p>`
                        : ''
                }
                ${calloutMarkup}
            </div>
        `;
    }

    function renderRetrieval(retrieval) {
        const section = document.createElement('section');
        section.className = 'palace-retrieval';
        section.innerHTML = '<h3>🔁 Retrieval Ritual</h3>';

        if (Array.isArray(retrieval.steps) && retrieval.steps.length) {
            const ol = document.createElement('ol');
            retrieval.steps.forEach((step) => {
                if (!step) return;
                const li = document.createElement('li');
                li.textContent = step;
                ol.appendChild(li);
            });
            section.appendChild(ol);
        }

        if (retrieval.mantra) {
            const mantra = document.createElement('p');
            mantra.className = 'palace-mantra';
            mantra.innerHTML = `<em>${escapeHtml(retrieval.mantra)}</em>`;
            section.appendChild(mantra);
        }

        return section;
    }

    function palaceDataToNarrative(data) {
        if (!data || !Array.isArray(data.timeline)) {
            return '';
        }

        const chunks = [];

        if (data.orientation) {
            const setting = data.orientation.setting ? `Setting: ${data.orientation.setting}` : '';
            const mission = data.orientation.mission ? `Mission: ${data.orientation.mission}` : '';
            const highlights = Array.isArray(data.orientation.highlights)
                ? data.orientation.highlights.filter(Boolean)
                : [];

            const orientationLines = [setting, mission, ...highlights.map((item) => `• ${item}`)]
                .filter(Boolean)
                .join('\n');

            if (orientationLines) {
                chunks.push('Palace Orientation\n' + orientationLines);
            }
        }

        const timelineChunk = data.timeline
            .map((node, idx) => {
                const title = node.title || `Node ${idx + 1}`;
                const summary = node.summary || node.concept || '';
                return `${idx + 1}. ${title} — ${summary}`;
            })
            .join('\n');

        if (timelineChunk) {
            chunks.push('Timeline Overview\n' + timelineChunk);
        }

        if (data.retrieval) {
            const steps = Array.isArray(data.retrieval.steps)
                ? data.retrieval.steps
                      .filter(Boolean)
                      .map((step, idx) => `${idx + 1}. ${step}`)
                      .join('\n')
                : '';
            const mantra = data.retrieval.mantra ? `Mantra: ${data.retrieval.mantra}` : '';

            const retrievalLines = [steps, mantra].filter(Boolean).join('\n');
            if (retrievalLines) {
                chunks.push('Retrieval Ritual\n' + retrievalLines);
            }
        }

        return chunks.join('\n\n');
    }

    // ---------------------------
    // Chat helpers
    // ---------------------------

    function initializeChatConversation(promptText, palaceNarrative) {
        if (!chatSection || !chatMessages) {
            return;
        }

        state.chatInitialized = true;
        state.conversationHistory = [{ role: 'system', content: CHAT_SYSTEM_PROMPT }];

        if (promptText && promptText.trim()) {
            state.conversationHistory.push({ role: 'user', content: promptText });
        }

        if (palaceNarrative && palaceNarrative.trim()) {
            state.conversationHistory.push({ role: 'assistant', content: palaceNarrative });
        }

        chatSection.style.display = 'block';
        chatMessages.innerHTML = '';
        appendChatMessage('assistant', 'Your Memory Palace timeline is ready! Ask me anything else and I\'ll guide you through it. ✨');
        setChatStatus('', '');
    }

    async function handleChatSubmit(event) {
        event.preventDefault();

        if (!state.chatInitialized) {
            setChatStatus('Generate a Memory Palace first, then we can keep riffing!', 'error');
            return;
        }

        if (!chatInput) {
            return;
        }

        const userMessage = chatInput.value.trim();
        if (!userMessage) {
            return;
        }

        const apiKey = localStorage.getItem('openrouter_api_key');
        if (!apiKey) {
            setChatStatus('Please add your OpenRouter API key in the settings above.', 'error');
            return;
        }

        appendChatMessage('user', userMessage);
        state.conversationHistory.push({ role: 'user', content: userMessage });

        chatInput.value = '';
        chatInput.disabled = true;
        if (chatSendButton) {
            chatSendButton.disabled = true;
            chatSendButton.textContent = 'Sending...';
        }

        setChatStatus('Summoning your palace guide...', 'loading');
        const pendingMessage = appendChatMessage('assistant', '⏳ Whispering with the palace spirits...', { pending: true });

        try {
            const reply = await continueChat(apiKey, state.conversationHistory);
            if (!reply) {
                throw new Error('The model returned an empty reply.');
            }

            if (pendingMessage) {
                pendingMessage.classList.remove('pending');
                pendingMessage.innerHTML = markdownToHtml(reply);
            } else {
                appendChatMessage('assistant', reply);
            }

            state.conversationHistory.push({ role: 'assistant', content: reply });
            setChatStatus('Ready for your next question.', 'success');
        } catch (error) {
            console.error('Error continuing chat:', error);
            const errorMessage = error?.message || 'Unexpected error while contacting the model.';
            if (pendingMessage) {
                pendingMessage.classList.remove('pending');
                pendingMessage.innerHTML = `<p>⚠️ ${escapeHtml(errorMessage)}</p>`;
            } else {
                appendChatMessage('assistant', `⚠️ ${errorMessage}`);
            }
            if (chatInput) {
                chatInput.value = userMessage;
            }
            if (state.conversationHistory.length && state.conversationHistory[state.conversationHistory.length - 1].role === 'user') {
                state.conversationHistory.pop();
            }
            setChatStatus(errorMessage, 'error');
        } finally {
            if (chatInput) {
                chatInput.disabled = false;
                chatInput.focus();
            }
            if (chatSendButton) {
                chatSendButton.disabled = false;
                chatSendButton.textContent = 'Send';
            }
        }
    }

    async function continueChat(apiKey, messages) {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'Memory Palace Generator',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'x-ai/grok-4-fast',
                messages,
                temperature: 0.75
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    function appendChatMessage(role, content, options = {}) {
        if (!chatMessages) {
            return null;
        }

        const message = document.createElement('div');
        message.className = `chat-message ${role}`;
        if (options.pending) {
            message.classList.add('pending');
        }

        if (role === 'assistant') {
            message.innerHTML = markdownToHtml(content);
        } else {
            message.innerHTML = `<p>${formatUserMessage(content)}</p>`;
        }

        chatMessages.appendChild(message);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return message;
    }

    function setChatStatus(message, type) {
        if (!chatStatus) {
            return;
        }
        chatStatus.textContent = message || '';
        chatStatus.className = 'chat-status';
        if (type) {
            chatStatus.classList.add(type);
        }
    }

    function resetChat() {
        state.chatInitialized = false;
        state.conversationHistory = [];
        state.currentPalaceData = null;
        state.lastPrompt = '';

        if (chatSection) {
            chatSection.style.display = 'none';
        }
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
        if (chatInput) {
            chatInput.value = '';
            chatInput.disabled = false;
        }
        if (chatSendButton) {
            chatSendButton.disabled = false;
            chatSendButton.textContent = 'Send';
        }
        setChatStatus('', '');
    }

    // ---------------------------
    // Markdown utilities (for chat)
    // ---------------------------

    function formatUserMessage(text) {
        return escapeHtml(text).replace(/\n/g, '<br>');
    }

    function markdownToHtml(markdown) {
        const lines = markdown.split('\n');
        let html = '';
        let inParagraph = false;
        let inUnorderedList = false;
        let inOrderedList = false;
        let inCodeBlock = false;
        let codeLanguage = '';
        let inBlockquote = false;
        let tableBuffer = [];

        const closeParagraph = () => {
            if (inParagraph) {
                html += '</p>';
                inParagraph = false;
            }
        };

        const closeLists = () => {
            if (inUnorderedList) {
                html += '</ul>';
                inUnorderedList = false;
            }
            if (inOrderedList) {
                html += '</ol>';
                inOrderedList = false;
            }
        };

        const closeBlockquote = () => {
            if (inBlockquote) {
                html += '</blockquote>';
                inBlockquote = false;
            }
        };

        const flushTable = () => {
            if (tableBuffer.length) {
                html += renderTable(tableBuffer);
                tableBuffer = [];
            }
        };

        lines.forEach((rawLine) => {
            const line = rawLine.replace(/\r$/, '');

            if (inCodeBlock) {
                if (line.trim().startsWith('```')) {
                    html += '</code></pre>';
                    inCodeBlock = false;
                    codeLanguage = '';
                } else {
                    html += `${escapeHtml(line)}\n`;
                }
                return;
            }

            if (line.trim() === '') {
                flushTable();
                closeParagraph();
                closeLists();
                closeBlockquote();
                return;
            }

            const codeMatch = line.match(/^```(\w+)?/);
            if (codeMatch) {
                flushTable();
                closeParagraph();
                closeLists();
                closeBlockquote();

                inCodeBlock = true;
                codeLanguage = codeMatch[1] ? `language-${codeMatch[1].toLowerCase()}` : '';
                html += `<pre><code${codeLanguage ? ` class="${codeLanguage}"` : ''}>`;
                return;
            }

            const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
            if (headingMatch) {
                flushTable();
                closeParagraph();
                closeLists();
                closeBlockquote();

                const level = headingMatch[1].length;
                html += `<h${level}>${formatInline(headingMatch[2])}</h${level}>`;
                return;
            }

            if (/^\|.*\|$/.test(line.trim())) {
                closeParagraph();
                closeLists();
                closeBlockquote();
                tableBuffer.push(line.trim());
                return;
            } else {
                flushTable();
            }

            if (/^\s*>\s?/.test(line)) {
                flushTable();
                closeParagraph();
                closeLists();

                if (!inBlockquote) {
                    html += '<blockquote>';
                    inBlockquote = true;
                }

                const contentLine = line.replace(/^\s*>\s?/, '');
                html += formatInline(contentLine);
                return;
            } else {
                closeBlockquote();
            }

            if (/^\s*[-*+]\s+/.test(line)) {
                flushTable();
                closeParagraph();
                closeBlockquote();

                if (!inUnorderedList) {
                    html += '<ul>';
                    inUnorderedList = true;
                }

                const item = line.replace(/^\s*[-*+]\s+/, '');
                html += `<li>${formatInline(item)}</li>`;
                return;
            }

            if (/^\s*\d+\.\s+/.test(line)) {
                flushTable();
                closeParagraph();
                closeBlockquote();

                if (!inOrderedList) {
                    html += '<ol>';
                    inOrderedList = true;
                }

                const item = line.replace(/^\s*\d+\.\s+/, '');
                html += `<li>${formatInline(item)}</li>`;
                return;
            }

            if (!inParagraph) {
                html += '<p>';
                inParagraph = true;
            }

            html += `${formatInline(line)} `;
        });

        flushTable();
        closeParagraph();
        closeLists();
        closeBlockquote();

        if (inCodeBlock) {
            html += '</code></pre>';
        }

        return html;
    }

    function renderTable(rows) {
        if (!rows.length) return '';

        const parsedRows = rows.map((row) =>
            row
                .split('|')
                .slice(1, -1)
                .map((cell) => cell.trim())
        );

        if (!parsedRows.length) return '';

        const header = parsedRows[0];
        let body = parsedRows.slice(1);

        if (body.length && body[0].every((cell) => /^:?-{2,}:?$/.test(cell))) {
            body = body.slice(1);
        }

        let tableHtml = '<table><thead><tr>';
        header.forEach((cell) => {
            tableHtml += `<th>${formatInline(cell)}</th>`;
        });
        tableHtml += '</tr></thead>';

        if (body.length) {
            tableHtml += '<tbody>';
            body.forEach((row) => {
                tableHtml += '<tr>';
                row.forEach((cell) => {
                    tableHtml += `<td>${formatInline(cell)}</td>`;
                });
                tableHtml += '</tr>';
            });
            tableHtml += '</tbody>';
        }

        tableHtml += '</table>';
        return tableHtml;
    }

    function formatInline(text) {
        let formatted = escapeHtml(text);

        formatted = formatted.replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`);
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

        return formatted;
    }

    function formatText(text) {
        return escapeHtml(text || '').replace(/\n/g, '<br>');
    }

    function escapeHtml(str) {
        const value = str == null ? '' : String(str);
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
});
