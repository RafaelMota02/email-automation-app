const express = require('express');
const router = express.Router();
const { 
  createDatabase,
  getDatabases,
  getDatabase,
  updateDatabase,
  deleteDatabase
} = require('../controllers/databaseController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', createDatabase);
router.get('/', getDatabases);
router.get('/:id', getDatabase);
router.put('/:id', updateDatabase);
router.delete('/:id', deleteDatabase);

module.exports = router;
