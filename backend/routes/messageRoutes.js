const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

router.get('/conversations', auth, messageController.getConversations);
router.get('/:otherUserId', auth, messageController.getMessages);
router.post('/', auth, messageController.sendMessage);

module.exports = router;