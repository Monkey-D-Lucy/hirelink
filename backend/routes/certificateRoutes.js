const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const auth = require('../middleware/auth');

// Protected routes
router.post('/', auth, certificateController.uploadCertificate);
router.get('/', auth, certificateController.getCertificates);
router.delete('/:id', auth, certificateController.deleteCertificate);

// Public routes
router.get('/verify/:hash', certificateController.verifyCertificate);

module.exports = router;