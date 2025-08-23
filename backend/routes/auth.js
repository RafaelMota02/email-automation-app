const express = require("express");
const router = express.Router();
const { registerUser, loginUser, verifyUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.get('/verify', authMiddleware, verifyUser);

module.exports = router;
