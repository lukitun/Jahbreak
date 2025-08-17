# Jahbreak

Smart prompt engineering tool that generates better prompts using AI template selection. Takes your question and creates three different prompt styles: direct answers, interactive questions, and socratic discovery.

## What it does

Feed it any question and get back three approaches:
- **Direct**: Straight answers with frameworks and blueprints
- **Interactive**: Smart questions that help you think through the problem  
- **Socratic**: Deep questions that lead you to your own insights

Uses Groq AI to pick the best templates based on what you're asking about.

## Setup

Need Node.js and a Groq API key.

```bash
npm install
npm start
```

Add your Groq API key to `.env` in the backend folder.

That's it. Visit the site and ask questions.