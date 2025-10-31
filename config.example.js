// Configuration file for Active Recall Learning
// 
// SETUP INSTRUCTIONS:
// 1. Rename this file from 'config.example.js' to 'config.js'
// 2. Add your OpenRouter API key below
// 3. The app will automatically use this key instead of manual entry
//
// Get your API key from: https://openrouter.ai/

const CONFIG = {
    // Your OpenRouter API key
    OPENROUTER_API_KEY: '', // Paste your API key here: 'sk-or-v1-...'
    
    // Optional: Site information for OpenRouter rankings
    SITE_URL: window.location.href,
    SITE_NAME: 'Active Recall Learning',
    
    // AI Model to use
    MODEL: 'x-ai/grok-4-fast',
    
    // Auto-load API key on page load (set to false to always require manual entry)
    AUTO_LOAD: true
};

// Make config available globally
window.APP_CONFIG = CONFIG;

