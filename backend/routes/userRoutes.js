const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Profile routes
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.post('/upload-image', auth, userController.uploadImage);
router.post('/upload-resume', auth, userController.uploadResume);  // ADD THIS LINE
router.put('/change-password', auth, userController.changePassword);

module.exports = router;