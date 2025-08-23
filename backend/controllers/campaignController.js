const path = require('path');
const fs = require('fs');
const multer = require('multer');
const csv = require('csv-parser');
const pool = require('../db/pool');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`Upload directory verified: ${uploadDir}`);
      cb(null, uploadDir);
    } catch (err) {
      console.error('Error creating upload directory:', err);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

const processCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    let headers = [];
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (receivedHeaders) => {
        headers = receivedHeaders.map(h => h.trim());
      })
      .on('data', (data) => {
        const recipient = { _raw: {} };
        headers.forEach(header => {
          const value = data[header] || '';
          recipient._raw[header] = value;
          
          // Only set email property if we find an email column
          if (header.trim().toLowerCase().includes('email') && 
              !header.toLowerCase().includes('example')) {
            recipient.email = value;
          }
        });
        
        if (recipient.email) {
          results.push(recipient);
        }
      })
      .on('end', () => {
        // Don't delete the file - we need it for future exports
        resolve({ headers, recipients: results });
      })
      .on('error', reject);
  });
};

const createAndSendCampaign = async (req, res) => {
  try {
    // Verify user exists
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1', 
      [req.userId]
    );
    if (userCheck.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { subject, template, databaseId } = req.body;
    let recipients = [];
    let csvHeaders = [];
    
    if (databaseId) {
      const dbResult = await pool.query(
        'SELECT data, email_column FROM saved_databases WHERE id = $1 AND user_id = $2',
        [databaseId, req.userId]
      );
      if (dbResult.rows.length > 0) {
        const dbData = dbResult.rows[0];
        
        // Case-insensitive email lookup
        const emailKey = Object.keys(dbData.data[0] || {}).find(
          key => key.toLowerCase() === dbData.email_column.toLowerCase()
        ) || dbData.email_column;
        
        logger.info(`[CampaignController] Using email column: ${emailKey} for database ${databaseId}`);
        
        recipients = dbData.data.map(entry => {
          // Create a consistent recipient structure
          return {
            email: entry[emailKey],
            _raw: entry
          };
        }).filter(r => {
          // Validate email format
          const isValidEmail = r.email && r.email.includes('@');
          if (!isValidEmail) {
            logger.warn(`[CampaignController] Skipping recipient with invalid email: ${r.email}`);
          }
          return isValidEmail;
        });
        
        logger.info(`[CampaignController] Found ${recipients.length} valid recipients in database ${databaseId}`);
        csvHeaders = Object.keys(dbData.data[0] || {});
      }
    } else if (req.file) {
      const { headers, recipients: csvRecipients } = await processCSV(req.file.path);
      csvHeaders = headers;
      recipients = csvRecipients;
    }
    
    // Extract variables from CSV headers
    const variables = csvHeaders.length > 0 
      ? csvHeaders
          .filter(h => !h.toLowerCase().includes('email'))
          .map(h => h.trim())
          .filter(h => h) // Remove empty strings
      : [];
    
    const campaign = await pool.query(
      `INSERT INTO campaigns 
       (user_id, subject, template, recipients, variables, database_id, file_name) 
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7) 
       RETURNING *`,
      [
        req.userId, 
        subject, 
        template, 
        JSON.stringify(recipients || []), 
        JSON.stringify(variables || []),
        databaseId || null,
        req.file ? req.file.originalname : null
      ]
    );

    // Immediately send the campaign using the data we already have
    const campaignData = campaign.rows[0];
    const result = await emailService.sendCampaignWithData(
      req.userId, 
      campaignData.id,
      campaignData.subject,
      campaignData.template,
      campaignData.recipients
    );
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    // Get the updated campaign with send results
    const updatedCampaign = await pool.query(
      `SELECT * FROM campaigns WHERE id = $1`,
      [campaignData.id]
    );

    const finalCampaign = {
      ...updatedCampaign.rows[0],
      sent: result.sent,
      failed: result.failed
    };

    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').to(`user-${req.userId}`).emit('campaign-updated', finalCampaign);
    }

    res.status(201).json(finalCampaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const exportCampaignResults = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const userId = req.userId;

    // Get the campaign and ensure the user owns it
    const result = await pool.query(
      `SELECT 
        c.id, 
        c.subject, 
        c.recipients,
        c.send_results
      FROM campaigns c
      WHERE c.id = $1 AND c.user_id = $2`,
      [campaignId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = result.rows[0];
    const recipients = campaign.recipients || [];
    const sendResults = campaign.send_results || [];

    // Create a CSV string
    let csvContent = 'Email,Status,Timestamp\n';

    recipients.forEach((recipient, index) => {
      const result = sendResults[index] || { success: false, timestamp: null };
      const email = recipient.email || '';
      const status = result.success ? 'Sent' : 'Failed';
      const timestamp = result.timestamp ? new Date(result.timestamp).toISOString() : '';
      csvContent += `"${email}","${status}","${timestamp}"\n`;
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=campaign-${campaignId}-results.csv`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCampaign = async (req, res) => {
  try {
  const campaign = await pool.query(
    `SELECT 
      c.id, 
      c.subject, 
      c.template as message, 
      c.recipients, 
      c.variables, 
      c.sent_at, 
      c.send_results, 
      c.database_id,
      c.file_name,
      c.resend_count,
      d.name as database_name
     FROM campaigns c
     LEFT JOIN saved_databases d ON c.database_id = d.id
     WHERE c.id = $1 AND c.user_id = $2`,
    [req.params.id, req.userId]
  );
    
    if (campaign.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json(campaign.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCampaignStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total_campaigns,
        SUM(jsonb_array_length(recipients)) as total_recipients,
        COUNT(*) FILTER (WHERE sent_at >= NOW() - INTERVAL '30 days') as last_30_days_campaigns,
        SUM(jsonb_array_length(recipients)) FILTER (WHERE sent_at >= NOW() - INTERVAL '30 days') as last_30_days_recipients
      FROM campaigns
      WHERE user_id = $1
      AND sent_at IS NOT NULL
    `, [req.userId]);

    res.json({
      totalCampaigns: Number(stats.rows[0].total_campaigns) || 0,
      totalRecipients: Number(stats.rows[0].total_recipients) || 0,
      last30DaysCampaigns: Number(stats.rows[0].last_30_days_campaigns) || 0,
      last30DaysRecipients: Number(stats.rows[0].last_30_days_recipients) || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCampaigns = async (req, res) => {
  try {
    const campaigns = await pool.query(
      `SELECT id, subject, template as message, recipients, sent_at, resend_count 
       FROM campaigns 
       WHERE user_id = $1 
       ORDER BY sent_at DESC`,
      [req.userId]
    );
    res.json(campaigns.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const parseCSV = async (req, res) => {
  try {
    const { recipients } = await processCSV(req.file.path);
    const variables = recipients.length > 0 
      ? Object.keys(recipients[0]).filter(k => k !== 'email' && k !== '_raw')
      : [];
    res.json({ variables, recipients });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send campaign to recipients
const sendCampaign = async (req, res) => {
  logger.info(`[CampaignController] Starting sendCampaign for campaign ID: ${req.params.id}, User ID: ${req.userId}`);
  
  try {
    const campaignId = req.params.id;
    const userId = req.userId;
    
    // Get campaign to ensure it exists and belongs to the user
    const campaignResult = await pool.query(
      `SELECT id FROM campaigns 
       WHERE id = $1 AND user_id = $2 AND sent_at IS NULL`,
      [campaignId, userId]
    );
    
    if (campaignResult.rows.length === 0) {
      logger.warn(`[CampaignController] Campaign not found or already sent: ${campaignId}`);
      return res.status(404).json({ error: 'Campaign not found or already sent' });
    }
    
    logger.info(`[CampaignController] Sending campaign: ${campaignId}`);
    const result = await emailService.sendCampaign(userId, campaignId);
    
    if (!result.success) {
      logger.error(`[CampaignController] Failed to send campaign ${campaignId}: ${result.error}`);
      return res.status(500).json({ error: result.error });
    }
    
    logger.info(`[CampaignController] Campaign sent successfully: ${campaignId}, Sent: ${result.sent}, Failed: ${result.failed}`);
    
    // Get the updated campaign
    const updatedCampaign = await pool.query(
      `SELECT * FROM campaigns WHERE id = $1`,
      [campaignId]
    );
    
    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').to(`user-${req.userId}`).emit('campaign-updated', updatedCampaign.rows[0]);
    }
    
    res.json({
      success: true,
      sent: result.sent,
      failed: result.failed
    });
  } catch (err) {
    logger.error(`[CampaignController] Error sending campaign ${req.params.id}: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const resendCampaign = async (req, res) => {
  logger.info(`\n🔥 Resend Campaign Triggered for campaign ID: ${req.params.id}`);
  logger.info(`📝 Params: ${JSON.stringify(req.params)}`);
  logger.info(`🔑 User: ${req.userId}`);
  logger.info(`📦 Request Body: ${JSON.stringify(req.body)}`);
  logger.info(`🔒 Headers: ${req.headers.authorization ? 'Auth header exists' : 'No auth header'}`);
  
  try {
    // Get existing campaign
    const campaignResult = await pool.query(
      `SELECT * FROM campaigns WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );
    
    if (campaignResult.rows.length === 0) {
      logger.warn(`[CampaignController] Campaign not found for resend: ${req.params.id}`);
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    const campaign = campaignResult.rows[0];
    
    // Increment the resend count
    const newResendCount = campaign.resend_count + 1;
    await pool.query(
      `UPDATE campaigns 
       SET resend_count = $1, sent_at = NULL, send_results = NULL
       WHERE id = $2`,
      [newResendCount, req.params.id]
    );

    // Send the campaign again
    const result = await emailService.sendCampaign(req.userId, req.params.id);
    
    if (!result.success) {
      logger.error(`[CampaignController] Failed to resend campaign: ${result.error}`);
      return res.status(500).json({ error: result.error });
    }
    
    // Get the updated campaign with the same structure as GET endpoint
    const updatedCampaignResult = await pool.query(
      `SELECT 
        c.id, 
        c.subject, 
        c.template as message, 
        c.recipients, 
        c.variables, 
        c.sent_at, 
        c.send_results, 
        c.database_id,
        c.file_name,
        c.resend_count,
        d.name as database_name
      FROM campaigns c
      LEFT JOIN saved_databases d ON c.database_id = d.id
      WHERE c.id = $1 AND c.user_id = $2`,
      [req.params.id, req.userId]
    );
    const updatedCampaign = updatedCampaignResult.rows[0];

    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').to(`user-${req.userId}`).emit('campaign-updated', updatedCampaign);
    }

    logger.info(`[CampaignController] Resend successful for campaign ${req.params.id}`);
    res.json({
      success: true,
      sent: result.sent,
      failed: result.failed,
      campaign: updatedCampaign,
      resendCount: newResendCount
    });
  } catch (err) {
    logger.error(`[CampaignController] Error resending campaign: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { 
  createCampaign: createAndSendCampaign, 
  getCampaign, 
  getCampaigns, 
  getCampaignStats,
  parseCSV,
  upload,
  resendCampaign,
  sendCampaign,
  exportCampaignResults
};
