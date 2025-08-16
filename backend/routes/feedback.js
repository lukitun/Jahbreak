const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.post('/', async (req, res) => {
    try {
        const { payload, prompt, feedback } = req.body;
        
        // Basic validation
        if (!payload || !prompt || !feedback) {
            return res.status(400).json({ 
                error: 'Missing required fields: payload, prompt, and feedback are required' 
            });
        }

        const entry = {
            timestamp: new Date().toISOString(),
            payload,
            prompt,
            feedback
        };

        // Ensure data directory exists
        const dataDir = path.join(__dirname, '..', 'data');
        fs.mkdirSync(dataDir, { recursive: true });
        
        // Read existing feedback logs
        const filePath = path.join(dataDir, 'feedback.json');
        let logs = [];
        if (fs.existsSync(filePath)) {
            try {
                logs = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            } catch (parseError) {
                console.error('Error parsing feedback.json, starting fresh:', parseError);
                logs = [];
            }
        }
        
        // Add new entry and save
        logs.push(entry);
        fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));

        res.json({ success: true });
    } catch (err) {
        console.error('Failed to write feedback log:', err);
        res.status(500).json({ 
            error: 'Failed to store feedback',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

module.exports = router;