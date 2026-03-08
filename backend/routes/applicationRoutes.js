const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const auth = require('../middleware/auth');

router.post('/', auth, applicationController.applyForJob);
router.get('/my-applications', auth, applicationController.getMyApplications);
router.get('/job/:jobId', auth, applicationController.getJobApplications);
router.put('/:id/status', auth, applicationController.updateApplicationStatus);
router.post('/:id/schedule', auth, applicationController.scheduleInterview);
router.delete('/:id', auth, applicationController.withdrawApplication);

module.exports = router;