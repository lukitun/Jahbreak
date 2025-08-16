const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - Allow all origins for public API
app.use(cors({
    origin: true, // Allow all origins
    credentials: false // Disable credentials for public API
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
const generateRoute = require('./routes/generate');
const feedbackRoute = require('./routes/feedback');

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/generate', generateRoute);
app.use('/api/feedback', feedbackRoute);

// API documentation endpoint
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

// Serve index.html for root path (MUST be after static files)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
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
    console.log(`✅ Jahbreak Server running on port ${PORT}`);
    console.log(`📍 Frontend: http://localhost:${PORT}`);
    console.log(`🔌 API: http://localhost:${PORT}/api`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});