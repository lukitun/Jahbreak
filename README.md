# Jahbreak

Jahbreak is a lightweight web app for advanced prompt engineering. It helps craft clear and effective prompts for AI assistants while enforcing safety and context rules through a Netlify serverless function.

## Features
- Theme toggle (dark/light)
- Optional role/personality selection with automatic fallback
- Multiple obfuscation modes
- Creative, enthusiastic, and formal prompt modes
- Serverless backend powered by the [Groq API](https://console.groq.com/)

## Getting Started

### Prerequisites
- Node.js 18+
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)
- A `GROQ_API_KEY` environment variable with access to the Groq API

### Installation
```bash
npm install
```

### Local Development
Run the Netlify development server:
```bash
npx netlify dev
```
The site will be available at the URL printed by the CLI. Requests to `/ .netlify/functions/generate` will be routed to the serverless function.

### Deployment
This project is configured for Netlify. Push your changes to your repository and connect it to Netlify, or deploy manually:
```bash
netlify deploy --prod
```

## Project Structure
```
├── index.html        # Frontend interface
├── main.js           # Client-side logic
├── style.css         # Styling
└── netlify
    └── functions
        └── generate.js  # Serverless prompt generator
```

## Disclaimer
This project is intended for research purposes only. Using this technology for illegal activities is strictly forbidden.

## License
MIT
