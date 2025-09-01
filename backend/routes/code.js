const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Base path for example files  
const examplesBasePath = path.join(__dirname, '../../example-apps');

// Define all routes explicitly - this is the most reliable approach
const fileRoutes = [
    'blog-platform/backend/src/server.js',
    'chat-application/backend/src/server.ts', 
    'sonnet-comparison/chat-application/backend/src/server.ts',
    'finance-tracker/frontend/src/App.tsx',
    'sonnet-comparison/finance-tracker/frontend/src/App.tsx',
    'task-manager/backend/src/server.js'
];

// Helper function to serve a file
async function serveCodeFile(filePath, res) {
    try {
        console.log(`Serving file: ${filePath}`);
        const fullPath = path.join(examplesBasePath, filePath);
        const content = await fs.readFile(fullPath, 'utf8');
        res.set('Content-Type', 'text/plain');
        res.send(content);
    } catch (error) {
        console.error('Error serving code file:', error);
        res.status(404).json({ error: 'File not found' });
    }
}

// Create explicit routes for each file
fileRoutes.forEach(filePath => {
    router.get(`/example-apps/${filePath}`, async (req, res) => {
        await serveCodeFile(filePath, res);
    });
});

module.exports = router;