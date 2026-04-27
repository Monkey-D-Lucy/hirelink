const db = require('../config/db');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for certificate upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/certificates/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'cert-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Generate SHA-256 hash
const generateHash = (fileBuffer) => {
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
};

// Upload certificate
exports.uploadCertificate = (req, res) => {
    const uploadSingle = upload.single('certificate');
    
    uploadSingle(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ 
                success: false, 
                message: err.message 
            });
        }
        
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'No file uploaded' 
            });
        }
        
        try {
            const userId = req.user.user_id;
            let { certificate_name, issuing_organization, issue_date, expiry_date } = req.body;
            
            // Read file and generate hash
            const fileBuffer = fs.readFileSync(req.file.path);
            const hash = generateHash(fileBuffer);
            
            // Fix file path for Windows (replace backslashes with forward slashes)
            const normalizedPath = req.file.path.replace(/\\/g, '/');
            const fileUrl = `${req.protocol}://${req.get('host')}/${normalizedPath}`;
            
            // Handle empty date values - convert empty strings to NULL
            const validIssueDate = issue_date && issue_date.trim() !== '' ? issue_date : null;
            const validExpiryDate = expiry_date && expiry_date.trim() !== '' ? expiry_date : null;
            
            // Insert certificate
            const [result] = await db.query(
                `INSERT INTO certificates 
                 (user_id, certificate_name, issuing_organization, issue_date, expiry_date, certificate_hash, certificate_url)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, certificate_name, issuing_organization, validIssueDate, validExpiryDate, hash, fileUrl]
            );
            
            res.status(201).json({
                success: true,
                message: 'Certificate uploaded successfully',
                certificate: {
                    id: result.insertId,
                    name: certificate_name,
                    hash: hash,
                    url: fileUrl
                }
            });
            
        } catch (error) {
            console.error('Upload certificate error:', error);
            
            // Delete file if database insert failed
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            
            res.status(500).json({ 
                success: false, 
                message: 'Server error: ' + error.message
            });
        }
    });
};

// Get user certificates
exports.getCertificates = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        const [certificates] = await db.query(
            `SELECT * FROM certificates 
             WHERE user_id = ? 
             ORDER BY created_at DESC`,
            [userId]
        );
        
        res.json({
            success: true,
            certificates
        });
        
    } catch (error) {
        console.error('Get certificates error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Verify certificate (public endpoint)
exports.verifyCertificate = async (req, res) => {
    try {
        const { hash } = req.params;
        
        const [certificates] = await db.query(
            `SELECT c.*, u.email, 
                    CASE 
                        WHEN u.user_type = 'job_seeker' THEN js.full_name
                        ELSE NULL
                    END as owner_name,
                    js.full_name as user_full_name
             FROM certificates c
             JOIN users u ON c.user_id = u.user_id
             LEFT JOIN job_seekers js ON u.user_id = js.user_id
             WHERE c.certificate_hash = ?`,
            [hash]
        );
        
        if (certificates.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Certificate not found or invalid hash',
                isValid: false
            });
        }
        
        const certificate = certificates[0];
        
        // Check if certificate is expired
        const isExpired = certificate.expiry_date && new Date(certificate.expiry_date) < new Date();
        
        res.json({
            success: true,
            isValid: !isExpired,
            certificate: {
                certificate_id: certificate.certificate_id,
                certificate_name: certificate.certificate_name,
                issuing_organization: certificate.issuing_organization,
                issue_date: certificate.issue_date,
                expiry_date: certificate.expiry_date,
                certificate_hash: certificate.certificate_hash,
                certificate_url: certificate.certificate_url,
                owner_name: certificate.user_full_name || certificate.owner_name || 'Certificate Owner',
                verified_at: certificate.created_at,
                is_expired: isExpired
            }
        });
        
    } catch (error) {
        console.error('Verify certificate error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            isValid: false
        });
    }
};

// Delete certificate
exports.deleteCertificate = async (req, res) => {
    try {
        const certificateId = req.params.id;
        const userId = req.user.user_id;
        
        // Get certificate info to delete file
        const [certificates] = await db.query(
            'SELECT certificate_url FROM certificates WHERE certificate_id = ? AND user_id = ?',
            [certificateId, userId]
        );
        
        if (certificates.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Certificate not found' 
            });
        }
        
        // Delete file
        if (certificates[0].certificate_url) {
            // Extract file path from URL
            const urlParts = certificates[0].certificate_url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const filePath = path.join('uploads', 'certificates', fileName);
            
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        // Delete from database
        await db.query(
            'DELETE FROM certificates WHERE certificate_id = ? AND user_id = ?',
            [certificateId, userId]
        );
        
        res.json({
            success: true,
            message: 'Certificate deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete certificate error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};