const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);

// Protected routes
router.post('/', auth, jobController.createJob);
router.get('/my-jobs', auth, jobController.getMyJobs);
router.put('/:id', auth, jobController.updateJob);
router.delete('/:id', auth, jobController.deleteJob);
router.get('/recommended', auth, jobController.getRecommendedJobs);
router.post('/saved', auth, jobController.saveJob);
router.get('/saved', auth, jobController.getSavedJobs);
router.delete('/saved/:id', auth, jobController.removeSavedJob);

module.exports = router;