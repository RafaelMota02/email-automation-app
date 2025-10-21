const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const pool = require('../db/pool');
const logger = require('../utils/logger');

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
    // Get user's email provider preference
    const userResult = await pool.query(
      'SELECT email_provider FROM users WHERE id = $1',
      [userId]
    );

    const emailProvider = userResult.rows[0]?.email_provider || 'sendgrid';
    logger.info(`[EmailService] Using email provider: ${emailProvider} for user: ${userId}`);

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

    let result;

    if (emailProvider === 'smtp') {
      // Use SMTP configuration
      const config = await getSmtpConfig(userId);

      // Create Nodemailer transporter
      const transporter = nodemailer.createTransporter({
        host: config.host,
        port: parseInt(config.port),
        secure: config.encryption === 'ssl',
        auth: {
          user: config.username,
          pass: config.password
        },
        tls: {
          // Do not fail on invalid certs
          rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        socketTimeout: 10000
      });

      result = await transporter.sendMail({
        from: `"${config.from_email.split('@')[0]}" <${config.from_email}>`,
        to: recipient.email,
        subject: subject,
        html: htmlContent,
      });

      logger.info(`[EmailService] SMTP: Email sent to ${recipient.email}: Message ID ${result.messageId}`);
      await transporter.close();

    } else {
      // Default to SendGrid
      const config = await getSmtpConfig(userId);

      const msg = {
        to: recipient.email,
        from: {
          email: 'no-reply.eaafp@outlook.com',
          name: 'Email Automation'
        },
        replyTo: config.from_email,
        subject: subject,
        html: htmlContent,
      };

      result = await sgMail.send(msg);
      logger.info(`[EmailService] SendGrid: Email sent to ${recipient.email}: Message ID ${result[0]?.headers?.['x-message-id'] || 'unknown'}`);
    }

    return { success: true };
  } catch (error) {
    logger.error(`[EmailService] Failed to send email to ${recipient.email}:`, error);

    // Extract meaningful error message
    let errorMessage = 'Unknown error occurred';

    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'SMTP connection refused - check host and port';
    } else if (error.code === 'EAUTH') {
      errorMessage = 'SMTP authentication failed - check username and password';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'SMTP connection timed out - check network connectivity';
    } else if (error.response) {
      errorMessage = `SendGrid error: ${error.response.body?.errors?.[0]?.message || error.message}`;
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

// Get user's email provider preference
const getEmailProvider = async (userId) => {
  try {
    const result = await pool.query(
      'SELECT email_provider FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0]?.email_provider || 'sendgrid';
  } catch (error) {
    logger.error(`[EmailService] Error getting email provider for user ${userId}:`, error);
    return 'sendgrid'; // Default to SendGrid on error
  }
};

// Set user's email provider preference
const setEmailProvider = async (userId, provider) => {
  try {
    if (!['sendgrid', 'smtp'].includes(provider)) {
      throw new Error('Invalid email provider. Must be either "sendgrid" or "smtp"');
    }

    // If choosing SMTP, verify configuration exists
    if (provider === 'smtp') {
      const hasSmtpConfig = await pool.query(
        'SELECT COUNT(*) as count FROM smtp_configurations WHERE user_id = $1',
        [userId]
      );

      if (parseInt(hasSmtpConfig.rows[0].count) === 0) {
        throw new Error('SMTP configuration not found. Please configure your SMTP settings first.');
      }
    }

    await pool.query(
      'UPDATE users SET email_provider = $1 WHERE id = $2',
      [provider, userId]
    );

    logger.info(`[EmailService] Set email provider to ${provider} for user ${userId}`);
    return { success: true, provider };
  } catch (error) {
    logger.error(`[EmailService] Error setting email provider for user ${userId}:`, error);
    throw error;
  }
};

module.exports = {
  sendCampaignEmail,
  sendCampaignWithData,
  sendCampaign,
  getEmailProvider,
  setEmailProvider
};
