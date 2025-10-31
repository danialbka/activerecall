# ⚡ AI-Powered Active Recall Learning

A beautiful, minimal web application for active recall practice with AI-powered feedback. Features two learning modes: standard cognitive tutoring and Tesla-style Memory Palace visualization.

## 🌟 Features

- **📝 Active Recall Practice** - Test your memory with blur-to-reveal content
- **🤖 AI Feedback** - Get personalized teaching and improvement suggestions
- **⚡ Tesla Memory Palace Mode** - Transform concepts into vivid spatial memories
- **🎨 Clean, Modern UI** - Responsive design with smooth animations
- **💾 Local Storage** - Your API key is saved securely in your browser

## 🚀 Quick Start

### Option 1: Manual Setup (Easiest)

1. Open `index.html` in your web browser
2. Click "⚙️ API Settings" to expand
3. Enter your OpenRouter API key
4. Click "Save"
5. Start learning!

### Option 2: Config File (Developer Friendly)

1. **Copy the example config:**
   ```bash
   copy config.example.js config.js
   # Or on Mac/Linux:
   cp config.example.js config.js
   ```

2. **Add your API key to `config.js`:**
   ```javascript
   const CONFIG = {
       OPENROUTER_API_KEY: 'sk-or-v1-your-actual-key-here',
       // ... rest of config
   };
   ```

3. **Open `index.html`** - Your API key will auto-load!

## 🔑 Get Your API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for a free account
3. Generate an API key
4. Paste it into the app (or `config.js`)

**Model Used:** `x-ai/grok-4-fast` - Fast and intelligent responses

## 📖 How to Use

### Adding Content

1. Type or paste your learning material in the text box
2. Use line breaks to separate different facts/concepts
3. Click "Add Content"

### Practice Mode

1. **Left Column**: Correct answers (blurred - hover to peek)
2. **Right Column**: Your answers (write what you remember)
3. Click "🤖 Analyze My Answers" when ready

### Tesla Memory Palace Mode ⚡

Enable this for immersive spatial memory visualization:

- Toggle ON "⚡ Tesla Memory Palace Mode"
- Write your answers
- Get a cinematic memory palace simulation with:
  - 🏠 Vivid settings and environments
  - 🎨 Visual encoding with sensory details
  - ⚡ Interactive mental simulations
  - 🗺️ Spatial memory maps
  - 🔁 Recall practice rituals

## 🎯 Learning Modes

### Standard Mode (Default)
- Structured feedback with scores
- Identifies what you got right and wrong
- Provides memory techniques
- Encourages improvement

### Tesla Mode ⚡
- Method of Loci (Memory Palace)
- Vivid spatial visualizations
- Cinematic, Tesla-style mental simulations
- Emotional and sensory encoding
- Perfect for complex material

## 📁 File Structure

```
activerecall/
├── index.html          # Main HTML file
├── styles.css          # All styles and themes
├── script.js           # Application logic and AI integration
├── config.example.js   # Configuration template
├── .gitignore          # Ignore sensitive files
└── README.md           # This file
```

## 🔒 Security

- Your API key is stored locally in your browser
- Never committed to version control (via `.gitignore`)
- `config.js` is git-ignored (only `config.example.js` is tracked)
- No server-side storage

## 🎨 Customization

Edit `config.js` to customize:
- AI model selection
- Site name and URL
- Auto-load behavior

## 📝 Tips for Best Results

1. **Be specific** - Write detailed answers, not just keywords
2. **Use Tesla Mode** for complex topics that need visual encoding
3. **Practice regularly** - Active recall works best with spaced repetition
4. **Review feedback** - Learn from the AI's teaching points
5. **Iterate** - Use the suggestions to improve your next practice session

## 🛠️ Technologies

- Pure HTML, CSS, and JavaScript (no frameworks)
- OpenRouter API (Grok-4-fast model)
- localStorage for persistence
- Responsive design for all devices

## 📄 License

Free to use and modify for personal learning.

## 🙏 Acknowledgments

- Inspired by Nikola Tesla's visualization techniques
- Built on active recall and spaced repetition science
- Powered by OpenRouter and X.AI's Grok

---

**Happy Learning! 🧠✨**

