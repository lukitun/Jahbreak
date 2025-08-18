const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Serve code files from example-apps directory
router.get('/:filepath(*)', async (req, res) => {
    try {
        const filePath = req.params.filepath;
        
        // Security: Only allow access to example-apps directory
        if (!filePath.startsWith('example-apps/')) {
            return res.status(403).json({ error: 'Access denied: Only example-apps files are accessible' });
        }
        
        // Resolve the full path
        const fullPath = path.join(__dirname, '../../', filePath);
        
        // Check if file exists
        try {
            await fs.access(fullPath);
        } catch (error) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        // Read and return the file content
        const content = await fs.readFile(fullPath, 'utf8');
        
        // Set appropriate content type
        const ext = path.extname(fullPath);
        if (ext === '.js' || ext === '.ts' || ext === '.tsx' || ext === '.jsx') {
            res.set('Content-Type', 'text/plain');
        }
        
        res.send(content);
        
    } catch (error) {
        console.error('Error serving code file:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;