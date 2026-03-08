const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.get('/employer', auth, analyticsController.getEmployerAnalytics);
router.get('/seeker', auth, analyticsController.getSeekerAnalytics);
router.post('/track/:userId', auth, analyticsController.trackProfileView);

module.exports = router;
