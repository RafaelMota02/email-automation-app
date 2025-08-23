const pool = require('../db/pool');

const createDatabase = async (req, res) => {
  try {
    const { name, columns, csvData, emailColumn } = req.body;
    
    if (!emailColumn) {
      throw new Error('Email column must be specified');
    }
    
    // Parse CSV data to JSON
    const parsedData = parseCSV(csvData);
    
    // Validate that the email column exists
    if (!parsedData.headers.includes(emailColumn)) {
      throw new Error('Specified email column does not exist in CSV data');
    }
    
    // Validate and transform email column
    let hasValidEmail = false;
    parsedData.data = parsedData.data.map(row => {
      const email = row[emailColumn];
      
      // If email column contains non-email values, try to find email in other columns
      if (!isValidEmail(email)) {
        for (const key in row) {
          if (isValidEmail(row[key])) {
            row[emailColumn] = row[key]; // Move valid email to email column
            hasValidEmail = true;
            break;
          }
        }
      } else {
        hasValidEmail = true;
      }
      return row;
    });
    
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
    res.status(500).json({ error: err.message });
  }
};

// Simple email validation function
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    const databasesWithMetrics = result.rows.map(db => {
      let contactCount = 0;
      let variables = [];
      
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
      
      return {
        ...db,
        contact_count: contactCount,
        variables: variables
      };
    });
    
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
