const express = require('express');

const scrapeRoutes = require('../../features/scrapper/scrapper.routes');

const router = express.Router();

/**
 * GET v1/health
 */
router.get('/health', (req, res) => res.send('OK'));

/**
 * GET v1/docs
 */
router.use('/docs', express.static('docs'));

router.use('/scrape', scrapeRoutes);

module.exports = router;
