const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Note: CORS is handled by nginx proxy, not Express middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
const generateRoute = require('./routes/generate');
const feedbackRoute = require('./routes/feedback');
const templatesRoute = require('./routes/templates');
const codeRoute = require('./routes/code');

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// CORS test endpoint
app.get('/test-cors', (req, res) => {
    res.json({ 
        message: 'CORS test successful', 
        origin: req.headers.origin,
        timestamp: new Date().toISOString() 
    });
});

app.post('/test-cors', (req, res) => {
    res.json({ 
        message: 'POST CORS test successful', 
        origin: req.headers.origin,
        body: req.body,
        timestamp: new Date().toISOString() 
    });
});

// Serve static frontend files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve templates page
app.get('/templates', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'templates.html'));
});

// Jahbreak API routes (both with and without prefix for compatibility)
app.use('/api/generate', generateRoute);
app.use('/api/feedback', feedbackRoute);
app.use('/api/templates', templatesRoute);
app.use('/api/code', codeRoute);

// Jahbreak API routes with prefix for dual app support
app.use('/api/jahbreak/generate', generateRoute);
app.use('/api/jahbreak/feedback', feedbackRoute);
app.use('/api/jahbreak/templates', templatesRoute);
app.use('/api/jahbreak/code', codeRoute);

// Social app API routes placeholder
app.get('/api/health', (req, res) => {
    res.json({ 
        message: 'Social app backend is running',
        jahbreak: 'Available at /api/jahbreak/',
        timestamp: new Date().toISOString() 
    });
});

// Jahbreak health check
app.get('/api/jahbreak/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'jahbreak',
        timestamp: new Date().toISOString() 
    });
});

// Root Jahbreak API info
app.get('/api/jahbreak/', (req, res) => {
    res.json({
        name: 'Jahbreak API',
        version: '1.0.0',
        description: 'Advanced Prompt Engineering API',
        endpoints: {
            generate: 'POST /api/jahbreak/generate',
            feedback: 'POST /api/jahbreak/feedback',
            health: 'GET /api/jahbreak/health'
        },
        github: 'https://github.com/lukitun/Jahbreak'
    });
});

// Serve API documentation
app.get('/api/docs', (req, res) => {
    res.json({
        name: 'Jahbreak API',
        version: '1.0.0',
        description: 'Advanced Prompt Engineering API',
        endpoints: {
            generate: 'POST /api/generate',
            feedback: 'POST /api/feedback',
            health: 'GET /health'
        },
        github: 'https://github.com/lukitun/Jahbreak'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`API Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});