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

// Create transporter using SendGrid SMTP
const createTransporter = async () => {
  logger.info(`[EmailService] Creating SendGrid transporter`);

  const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000, // 10 seconds
    socketTimeout: 10000 // 10 seconds
  });

  // Note: Skipping verification as it can fail in hosted environments
  // The transporter will be tested when actually sending emails
  logger.info(`[EmailService] SendGrid transporter created (verification skipped)`);
  return transporter;
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
    const transporter = await createTransporter();
    const config = await getSmtpConfig(userId);

    // Replace placeholders in email content
    const htmlContent = replacePlaceholders(template, recipient);

    // Ensure we have a valid email address
    if (!recipient.email) {
      logger.warn(`[EmailService] Skipping recipient with no email address: ${JSON.stringify(recipient)}`);
      return { success: false, error: 'No email address provided' };
    }

    console.log(`[DEBUG] Sending email to: ${recipient.email}`);
    console.log(`[DEBUG] Email subject: ${subject}`);
    console.log(`[DEBUG] Email content: ${htmlContent.substring(0, 200)}...`);

    const info = await transporter.sendMail({
      from: `"Email Automation" <no-reply.eaafp@outlook.com>`,
      replyTo: config.from_email,
      to: recipient.email, // Use the actual email address
      subject: subject,
      html: htmlContent
    });

    logger.info(`[EmailService] Email sent to ${recipient.email}: Message ID ${info.messageId}`);
    return { success: true };
  } catch (error) {
    logger.error(`[EmailService] Failed to send email to ${recipient.email}:`, error);

    // Extract meaningful error message
    let errorMessage = 'Unknown error occurred';
    if (error.code) {
      switch (error.code) {
        case 'EAUTH':
          errorMessage = 'Authentication failed - check SendGrid credentials';
          break;
        case 'ECONNREFUSED':
          errorMessage = 'Connection refused - check SendGrid SMTP';
          break;
        case 'ETIMEDOUT':
          errorMessage = 'Connection timed out - check network connectivity';
          break;
        case 'EENVELOPE':
          errorMessage = 'Invalid email address format';
          break;
        default:
          errorMessage = `SMTP error (${error.code}): ${error.message}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
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
      const result = await sendCampaignEmail(userId, recipient, subject, message);
      sentResults.push({
        email: recipient.email,
        success: result.success,
        error: result.error || null,
        timestamp: new Date().toISOString()
      });

      if (result.success) {
        logger.info(`[EmailService] ✅ Sent to ${recipient.email}`);
      } else {
        logger.warn(`[EmailService] ❌ Failed to send to ${recipient.email}: ${result.error}`);
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
