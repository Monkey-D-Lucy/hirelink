const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Placeholder routes - add actual controller later
router.get('/', auth, (req, res) => {
    res.json({ message: 'Messages route working' });
});

module.exports = router;