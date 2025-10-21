const nodemailer = require('nodemailer');

const pool = require('../db/pool');
const { getEmailProvider, setEmailProvider } = require('../services/emailService');

// Test SMTP configuration
exports.testSmtp = async (req, res) => {
  try {
    console.log(`Received testSmtp request: ${req.method} ${req.originalUrl}`);
    let { host, port, username, password, encryption, fromEmail, testEmail } = req.body;

    // Trim whitespace from all fields
    host = host.trim();
    username = username.trim();
    password = password.trim();
    fromEmail = fromEmail.trim();
    testEmail = testEmail.trim();
    if (typeof encryption === 'string') encryption = encryption.trim();
    port = typeof port === 'string' ? port.trim() : port;
    
    if (!host || !port || !username || !password || !fromEmail || !testEmail) {
      return res.status(400).json({ error: 'All fields are required for testing' });
    }

    // Create a transporter using the provided configuration
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: encryption === 'ssl',
      auth: {
        user: username,
        pass: password
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
      },
      connectionTimeout: 10000, // 10 seconds
      socketTimeout: 10000 // 10 seconds
    });

    console.log("SMTP Configuration:", {
      host,
      port: parseInt(port),
      secure: encryption === 'ssl',
      auth: {
        user: username,
        pass: password ? '***' : 'undefined'
      }
    });
    
    // Send test email
    const info = await transporter.sendMail({
      from: `"Email Automation" <${fromEmail}>`,
      to: testEmail,
      subject: 'SMTP Configuration Test',
      text: 'This is a test email to verify your SMTP configuration.',
      html: '<p>This is a test email to verify your SMTP configuration.</p>'
    });
    
    console.log("Test email sent successfully!", info);
    console.log(`SMTP test completed successfully for ${testEmail}`);

    res.json({ 
      success: true,
      message: `Test email sent successfully! Message ID: ${info.messageId}`
    });
  } catch (error) {
    console.error('SMTP test failed:', error);
    
    let errorCode = 'SMTP_GENERIC_ERROR';
    let userMessage = 'Failed to send test email';
    let remediation = 'Check your SMTP settings and try again';

    // Handle specific error types
    if (error.code === 'ECONNREFUSED') {
      errorCode = 'SMTP_CONNECTION_REFUSED';
      userMessage = 'Connection to SMTP server refused';
      remediation = 'Verify host and port, check firewall settings';
    } else if (error.code === 'EAUTH') {
      errorCode = 'SMTP_AUTH_FAILED';
      userMessage = 'Authentication failed';
      remediation = 'Verify username and password, check app passwords for Gmail';
    } else if (error.code === 'ETIMEDOUT') {
      errorCode = 'SMTP_CONNECTION_TIMEOUT';
      userMessage = 'Connection to SMTP server timed out';
      remediation = 'Check network connection and server availability';
    } else if (error.message.includes('WRONG_VERSION_NUMBER') || 
               error.message.includes('tls_validate_record_header')) {
      errorCode = 'SMTP_TLS_VERSION_MISMATCH';
      userMessage = 'TLS/SSL version mismatch';
      remediation = 'Try different encryption/port combination (e.g., SSL on port 465 or TLS on port 587)';
    }

    res.status(500).json({ 
      success: false,
      errorCode,
      message: userMessage,
      remediation
    });
  }
};

// Save SMTP configuration
exports.saveSmtp = async (req, res) => {
  try {
    let { host, port, username, password, encryption, fromEmail } = req.body;

    // Trim whitespace from all fields
    host = host.trim();
    username = username.trim();
    password = password.trim();
    fromEmail = fromEmail.trim();
    if (typeof encryption === 'string') encryption = encryption.trim();
    port = typeof port === 'string' ? port.trim() : port;

    if (!host || !port || !username || !password || !fromEmail) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate SMTP configuration before saving
    try {
      const testTransporter = nodemailer.createTransport({
        host,
        port: parseInt(port),
        secure: encryption === 'ssl',
        auth: {
          user: username,
          pass: password
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        socketTimeout: 10000
      });

      // Verify the SMTP configuration
      await testTransporter.verify();
      console.log('SMTP configuration validated successfully');
    } catch (validationError) {
      console.error('SMTP configuration validation failed:', validationError);

      let errorCode = 'SMTP_GENERIC_ERROR';
      let userMessage = 'SMTP configuration is invalid';
      let remediation = 'Check your SMTP settings and try again';

      // Handle specific error types
      if (validationError.code === 'ECONNREFUSED') {
        errorCode = 'SMTP_CONNECTION_REFUSED';
        userMessage = 'Connection to SMTP server refused';
        remediation = 'Verify host and port, check firewall settings';
      } else if (validationError.code === 'EAUTH') {
        errorCode = 'SMTP_AUTH_FAILED';
        userMessage = 'Authentication failed';
        remediation = 'Verify username and password, check app passwords for Gmail';
      } else if (validationError.code === 'ETIMEDOUT') {
        errorCode = 'SMTP_CONNECTION_TIMEOUT';
        userMessage = 'Connection to SMTP server timed out';
        remediation = 'Check network connection and server availability';
      } else if (validationError.message.includes('WRONG_VERSION_NUMBER') ||
                 validationError.message.includes('tls_validate_record_header')) {
        errorCode = 'SMTP_TLS_VERSION_MISMATCH';
        userMessage = 'TLS/SSL version mismatch';
        remediation = 'Try different encryption/port combination (e.g., SSL on port 465 or TLS on port 587)';
      }

      return res.status(400).json({
        success: false,
        errorCode,
        message: userMessage,
        remediation
      });
    }

    // Save the configuration to the database
    const result = await pool.query(`
      INSERT INTO smtp_configurations (user_id, host, port, username, password, encryption, from_email)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id)
      DO UPDATE SET
        host = EXCLUDED.host,
        port = EXCLUDED.port,
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        encryption = EXCLUDED.encryption,
        from_email = EXCLUDED.from_email
      RETURNING id
    `, [req.userId, host, parseInt(port), username, password, encryption, fromEmail]);

    res.json({
      success: true,
      message: 'SMTP configuration saved successfully!',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Failed to save SMTP config:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save SMTP configuration'
    });
  }
};

// Get current SMTP configuration
exports.getSmtp = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, host, port, username, encryption, from_email FROM smtp_configurations WHERE user_id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'SMTP configuration not found for this user' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to get SMTP config:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get SMTP configuration'
    });
  }
};

// Get email provider preference
exports.getEmailProvider = async (req, res) => {
  try {
    const provider = await getEmailProvider(req.userId);
    res.json({ provider });
  } catch (error) {
    console.error('Failed to get email provider:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get email provider preference'
    });
  }
};

// Set email provider preference
exports.setEmailProvider = async (req, res) => {
  try {
    const { provider } = req.body;

    if (!provider) {
      return res.status(400).json({ error: 'Provider is required' });
    }

    const result = await setEmailProvider(req.userId, provider);
    res.json(result);
  } catch (error) {
    console.error('Failed to set email provider:', error);

    let statusCode = 500;
    let message = error.message || 'Failed to set email provider preference';

    if (error.message.includes('SMTP configuration not found')) {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};
