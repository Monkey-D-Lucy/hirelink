const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const auth = require('../middleware/auth');

// IMPORTANT: Order matters! Place specific routes BEFORE /:id

// Public routes
router.get('/', jobController.getAllJobs);

// Protected routes - SPECIFIC routes FIRST
router.get('/my-jobs', auth, jobController.getMyJobs);
router.get('/recommended', auth, jobController.getRecommendedJobs);
router.get('/saved', auth, jobController.getSavedJobs);

// Dynamic route with :id - MUST be LAST among GET routes
router.get('/:id', jobController.getJobById);

// POST routes
router.post('/', auth, jobController.createJob);
router.post('/saved', auth, jobController.saveJob);

// PUT/DELETE routes with :id
router.put('/:id', auth, jobController.updateJob);
router.delete('/:id', auth, jobController.deleteJob);
router.delete('/saved/:id', auth, jobController.removeSavedJob);

module.exports = router;