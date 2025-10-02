const nodemailer = require('nodemailer');
const pool = require('../db/pool');
const logger = require('../utils/logger');

// Get SMTP configuration from database
const getSmtpConfig = async (userId) => {
  try {
    logger.info(`[EmailService] Fetching SMTP config for user: ${userId}`);
    const result = await pool.query(
      'SELECT host, port, username, password, encryption, from_email FROM smtp_configurations WHERE user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      logger.warn(`[EmailService] No SMTP configuration found for user: ${userId}`);
      throw new Error('No SMTP configuration found. Please configure your SMTP settings in the application before sending campaigns.');
    }
    
    logger.info(`[EmailService] Found SMTP config for user: ${userId}`);
    return result.rows[0];
  } catch (error) {
    logger.error(`[EmailService] Error fetching SMTP configuration for user ${userId}:`, error);
    throw error;
  }
};

// Create transporter using SMTP configuration
const createTransporter = async (userId) => {
  logger.info(`[EmailService] Creating transporter for user: ${userId}`);
  const config = await getSmtpConfig(userId);

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.encryption === 'ssl',
    auth: {
      user: config.username,
      pass: config.password
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000, // 10 seconds
    socketTimeout: 10000 // 10 seconds
  });

  // Verify transporter configuration
  try {
    await transporter.verify();
    logger.info(`[EmailService] Transporter verified for user: ${userId}`);
    return transporter;
  } catch (error) {
    logger.error(`[EmailService] Transporter verification failed for user ${userId}:`, error);
    throw new Error('SMTP configuration is invalid');
  }
};

// Replace placeholders in email content with recipient data
const replacePlaceholders = (template, recipient) => {
  let content = template;
  
  // Use recipient's raw data for replacements
  const data = recipient._raw || recipient;
  
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key] || '';
      
      // Only process string values
      if (typeof value === 'string') {
        // Create regex patterns that match exact placeholders
        const patterns = [
          `\\{${key}\\}`,         // {key}
          `\\{\\{${key}\\}\\}`,   // {{key}}
          `\\[${key}\\]`,         // [key]
          `\\[\\[${key}\\]\\]`,   // [[key]]
          `<${key}>`,              // <key>
          `<<${key}>>`            // <<key>>
        ];
        
        patterns.forEach(pattern => {
          const regex = new RegExp(pattern, 'g');
          content = content.replace(regex, value);
        });
      }
    }
  }
  
  // Preserve newlines in the content
  return content.replace(/\r?\n/g, '<br>');
};

// Send campaign email
const sendCampaignEmail = async (userId, recipient, subject, template) => {
  logger.info(`[EmailService] Sending email to ${recipient.email} for user: ${userId}`);
  
  try {
    const transporter = await createTransporter(userId);
    const config = await getSmtpConfig(userId);
    
    // Replace placeholders in email content
    const htmlContent = replacePlaceholders(template, recipient);
    
    // Ensure we have a valid email address
    if (!recipient.email) {
      logger.warn(`[EmailService] Skipping recipient with no email address: ${JSON.stringify(recipient)}`);
      return false;
    }

    console.log(`[DEBUG] Sending email to: ${recipient.email}`);
    console.log(`[DEBUG] Email subject: ${subject}`);
    console.log(`[DEBUG] Email content: ${htmlContent.substring(0, 200)}...`);

    const info = await transporter.sendMail({
      from: `"Email Automation" <${config.from_email}>`,
      to: recipient.email, // Use the actual email address
      subject: subject,
      html: htmlContent
    });
    
    logger.info(`[EmailService] Email sent to ${recipient.email}: Message ID ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`[EmailService] Failed to send email to ${recipient.email}:`, error);
    return false;
  }
};

// Send campaign to all recipients using provided data
const sendCampaignWithData = async (userId, campaignId, subject, message, recipients) => {
  logger.info(`[EmailService] Starting campaign send with data: User ${userId}, Campaign ${campaignId}`);
  
  try {
    const sentResults = [];
    
    logger.info(`[EmailService] Sending campaign ${campaignId} to ${recipients.length} recipients`);
    
    // Send to each recipient
    for (const recipient of recipients) {
      const success = await sendCampaignEmail(userId, recipient, subject, message);
      sentResults.push({
        email: recipient.email,
        success,
        timestamp: new Date().toISOString()
      });
      
      if (success) {
        logger.info(`[EmailService] ✅ Sent to ${recipient.email}`);
      } else {
        logger.warn(`[EmailService] ❌ Failed to send to ${recipient.email}`);
      }
    }
    
    const sentCount = sentResults.filter(r => r.success).length;
    const failedCount = sentResults.filter(r => !r.success).length;
    
    logger.info(`[EmailService] Campaign ${campaignId} completed: ${sentCount} sent, ${failedCount} failed`);
    
    // Update campaign with send results
    await pool.query(
      `UPDATE campaigns 
       SET sent_at = NOW(), send_results = $1
       WHERE id = $2`,
      [JSON.stringify(sentResults), campaignId]
    );
    
    return {
      success: true,
      sent: sentCount,
      failed: failedCount
    };
  } catch (error) {
    logger.error(`[EmailService] Failed to send campaign ${campaignId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Function to send a campaign by ID (for resending)
const sendCampaign = async (userId, campaignId) => {
  logger.info(`[EmailService] Sending campaign by ID: ${campaignId}`);
  
  try {
    // Get campaign from database
    const campaignResult = await pool.query(
      `SELECT * FROM campaigns WHERE id = $1 AND user_id = $2`,
      [campaignId, userId]
    );
    
    if (campaignResult.rows.length === 0) {
      throw new Error('Campaign not found');
    }
    
    const campaign = campaignResult.rows[0];
    return await sendCampaignWithData(
      userId,
      campaignId,
      campaign.subject,
      campaign.template,
      campaign.recipients
    );
  } catch (error) {
    logger.error(`[EmailService] Failed to send campaign ${campaignId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendCampaignEmail,
  sendCampaignWithData,
  sendCampaign
};
