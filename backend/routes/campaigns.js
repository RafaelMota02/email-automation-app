const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../controllers/campaignController').upload;

router.use(authMiddleware);

router.post('/', authMiddleware, upload.single('file'), campaignController.createCampaign);
router.post('/parse-csv', upload.single('file'), campaignController.parseCSV);
router.get('/', campaignController.getCampaigns);
router.get('/stats', campaignController.getCampaignStats);
router.get('/:id', campaignController.getCampaign);
router.get('/:id/export', campaignController.exportCampaignResults);
router.post('/:id/resend', authMiddleware, campaignController.resendCampaign);
router.post('/:id/send', authMiddleware, campaignController.sendCampaign);

module.exports = router;
