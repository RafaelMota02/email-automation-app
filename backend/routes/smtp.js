const express = require('express');
const router = express.Router();
const smtpController = require('../controllers/smtpController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all SMTP routes with authentication
router.use(authMiddleware);

// Test SMTP configuration
router.post('/test', smtpController.testSmtp);

// Save SMTP configuration
router.post('/', smtpController.saveSmtp);

// Get SMTP configuration
router.get('/', smtpController.getSmtp);

module.exports = router;
