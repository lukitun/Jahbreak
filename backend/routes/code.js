const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Serve specific code files for examples
router.get('/example-apps/blog-platform/backend/src/server.js', async (req, res) => {
    try {
        const fullPath = path.join(__dirname, '../../example-apps/blog-platform/backend/src/server.js');
        const content = await fs.readFile(fullPath, 'utf8');
        res.set('Content-Type', 'text/plain');
        res.send(content);
    } catch (error) {
        res.status(404).json({ error: 'File not found' });
    }
});

router.get('/example-apps/chat-application/backend/src/server.ts', async (req, res) => {
    try {
        const fullPath = path.join(__dirname, '../../example-apps/chat-application/backend/src/server.ts');
        const content = await fs.readFile(fullPath, 'utf8');
        res.set('Content-Type', 'text/plain');
        res.send(content);
    } catch (error) {
        res.status(404).json({ error: 'File not found' });
    }
});

router.get('/example-apps/sonnet-comparison/chat-application/backend/src/server.ts', async (req, res) => {
    try {
        const fullPath = path.join(__dirname, '../../example-apps/sonnet-comparison/chat-application/backend/src/server.ts');
        const content = await fs.readFile(fullPath, 'utf8');
        res.set('Content-Type', 'text/plain');
        res.send(content);
    } catch (error) {
        res.status(404).json({ error: 'File not found' });
    }
});

router.get('/example-apps/finance-tracker/frontend/src/App.tsx', async (req, res) => {
    try {
        const fullPath = path.join(__dirname, '../../example-apps/finance-tracker/frontend/src/App.tsx');
        const content = await fs.readFile(fullPath, 'utf8');
        res.set('Content-Type', 'text/plain');
        res.send(content);
    } catch (error) {
        res.status(404).json({ error: 'File not found' });
    }
});

router.get('/example-apps/sonnet-comparison/finance-tracker/frontend/src/App.tsx', async (req, res) => {
    try {
        const fullPath = path.join(__dirname, '../../example-apps/sonnet-comparison/finance-tracker/frontend/src/App.tsx');
        const content = await fs.readFile(fullPath, 'utf8');
        res.set('Content-Type', 'text/plain');
        res.send(content);
    } catch (error) {
        res.status(404).json({ error: 'File not found' });
    }
});

router.get('/example-apps/task-manager/backend/src/server.js', async (req, res) => {
    try {
        const fullPath = path.join(__dirname, '../../example-apps/task-manager/backend/src/server.js');
        const content = await fs.readFile(fullPath, 'utf8');
        res.set('Content-Type', 'text/plain');
        res.send(content);
    } catch (error) {
        res.status(404).json({ error: 'File not found' });
    }
});

module.exports = router;