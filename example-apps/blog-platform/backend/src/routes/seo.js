const express = require('express');
const router = express.Router();
const { generateSitemap, generateRobotsTxt } = require('../utils/seo');

// Sitemap route
router.get('/sitemap.xml', async (req, res) => {
  try {
    const sitemap = await generateSitemap();
    
    if (!sitemap) {
      return res.status(500).send('Error generating sitemap');
    }

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Robots.txt route
router.get('/robots.txt', (req, res) => {
  try {
    const robotsTxt = generateRobotsTxt();
    res.set('Content-Type', 'text/plain');
    res.send(robotsTxt);
  } catch (error) {
    console.error('Robots.txt generation error:', error);
    res.status(500).send('Error generating robots.txt');
  }
});

module.exports = router;