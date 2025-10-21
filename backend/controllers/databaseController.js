const pool = require('../db/pool');

const createDatabase = async (req, res) => {
  try {
    const { name, columns, csvData, emailColumn } = req.body;

    console.log('Creating database:', { name, emailColumn });
    console.log('CSV Data length:', csvData?.length);

    if (!emailColumn) {
      throw new Error('Email column must be specified');
    }

    // Parse CSV data to JSON
    const parsedData = parseCSV(csvData);
    console.log('Parsed headers:', parsedData.headers);
    console.log('Parsed data rows:', parsedData.data.length);

    // Validate that the email column exists
    if (!parsedData.headers.includes(emailColumn)) {
      throw new Error('Specified email column does not exist in CSV data');
    }

    // Validate and transform email column
    let hasValidEmail = false;
    let validEmailCount = 0;
    parsedData.data = parsedData.data.map((row, index) => {
      const email = row[emailColumn];
      const originalEmail = email;

      // If email column contains non-email values, try to find email in other columns
      if (!isValidEmail(email)) {
        console.log(`Row ${index}: Invalid email "${email}", checking other columns...`);
        for (const key in row) {
          if (key !== emailColumn && isValidEmail(row[key])) {
            console.log(`Row ${index}: Found valid email in column ${key}: ${row[key]}`);
            row[emailColumn] = row[key]; // Move valid email to email column
            hasValidEmail = true;
            validEmailCount++;
            break;
          }
        }
      } else {
        console.log(`Row ${index}: Valid email found: ${email}`);
        hasValidEmail = true;
        validEmailCount++;
      }

      if (originalEmail !== row[emailColumn]) {
        console.log(`Row ${index}: Email moved from "${originalEmail}" to "${row[emailColumn]}"`);
      }

      return row;
    });

    console.log(`Validation complete: ${validEmailCount} valid emails found`);

    if (!hasValidEmail) {
      throw new Error('No valid email addresses found in the database');
    }
    
    const result = await pool.query(
      `INSERT INTO saved_databases
       (user_id, name, email_column, data)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, created_at`,
      [req.userId, name, emailColumn, JSON.stringify(parsedData.data)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Simple email validation function
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmedEmail = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
}

// Add CSV parsing function similar to frontend
function parseCSV(csv) {
  try {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const row = {};
      
      headers.forEach((header, index) => {
        let value = values[index] || '';
        value = value.trim();
        
        // Preserve original value without type conversion
        row[header] = value;
      });
      
      data.push(row);
    }
    
    return { headers, data };
  } catch (err) {
    throw new Error(`CSV processing error: ${err.message}`);
  }
}

const getDatabases = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, created_at, email_column, data 
       FROM saved_databases 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.userId]
    );
    
    // Add metrics to each database
    const databasesWithMetrics = await Promise.all(result.rows.map(async (db) => {
      let contactCount = 0;
      let variables = [];
      let campaignCount = 0;

      try {
        if (db.data && Array.isArray(db.data)) {
          // Get all column names (variables) from the first row
          if (db.data.length > 0) {
            variables = Object.keys(db.data[0]);
          }

          // Count contacts (non-empty email values)
          if (db.email_column) {
            contactCount = db.data.filter(row =>
              row[db.email_column] && row[db.email_column].trim() !== ''
            ).length;
          }
        }
      } catch (e) {
        console.error('Error processing database metrics:', e);
      }

      // Count campaigns using this database
      try {
        const campaignResult = await pool.query(
          'SELECT COUNT(*) FROM campaigns WHERE database_id = $1 AND user_id = $2',
          [db.id, req.userId]
        );
        campaignCount = parseInt(campaignResult.rows[0].count) || 0;
      } catch (e) {
        console.error('Error counting campaigns:', e);
      }

      return {
        ...db,
        contact_count: contactCount,
        variables: variables,
        campaign_count: campaignCount
      };
    }));
    
    res.json(databasesWithMetrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDatabase = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM saved_databases 
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateDatabase = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, emailColumn, data } = req.body;
    
    // Ensure data is properly serialized as JSON
    const dataJson = JSON.stringify(data);
    
    const result = await pool.query(
      `UPDATE saved_databases 
       SET name = $1, email_column = $2, data = $3 
       WHERE id = $4 AND user_id = $5 
       RETURNING id, name, email_column, created_at`,
      [name, emailColumn, dataJson, id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Database not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteDatabase = async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM saved_databases WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = { 
  createDatabase, 
  getDatabases, 
  getDatabase, 
  updateDatabase, 
  deleteDatabase 
};
