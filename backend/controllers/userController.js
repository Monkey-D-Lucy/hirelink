const db = require('../config/db');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';
        if (file.fieldname === 'profile_pic') {
            uploadPath += 'profiles/';
        } else if (file.fieldname === 'resume') {
            uploadPath += 'resumes/';
        } else if (file.fieldname === 'document') {
            uploadPath += 'documents/';
        }
        
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'profile_pic' || file.fieldname === 'cover_image') {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    } else if (file.fieldname === 'resume') {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and DOC files are allowed'), false);
        }
    } else {
        cb(null, true);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        const [users] = await db.query(
            'SELECT user_id, email, user_type, created_at FROM users WHERE user_id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        const user = users[0];
        let profile = null;
        
        if (user.user_type === 'job_seeker') {
            const [seeker] = await db.query(
                `SELECT * FROM job_seekers WHERE user_id = ?`,
                [userId]
            );
            profile = seeker[0];
            
            const [apps] = await db.query(
                'SELECT COUNT(*) as count FROM applications WHERE seeker_id = ?',
                [profile?.seeker_id]
            );
            profile.applications_count = apps[0].count;
            
            const [saved] = await db.query(
                'SELECT COUNT(*) as count FROM saved_jobs WHERE seeker_id = ?',
                [profile?.seeker_id]
            );
            profile.saved_jobs_count = saved[0].count;
            
        } else if (user.user_type === 'employer') {
            const [employer] = await db.query(
                `SELECT e.*, c.company_name, c.website, c.logo_url, c.description as company_description,
                        c.industry, c.size, c.founded_year, c.headquarters, c.verified
                 FROM employers e
                 JOIN companies c ON e.company_id = c.company_id
                 WHERE e.user_id = ?`,
                [userId]
            );
            profile = employer[0];
            
            const [jobs] = await db.query(
                'SELECT COUNT(*) as count FROM jobs WHERE employer_id = ?',
                [profile?.employer_id]
            );
            profile.jobs_count = jobs[0].count;
            
            const [active] = await db.query(
                'SELECT COUNT(*) as count FROM jobs WHERE employer_id = ? AND is_active = 1',
                [profile?.employer_id]
            );
            profile.active_jobs = active[0].count;
            
            const [applicants] = await db.query(
                `SELECT COUNT(*) as count 
                 FROM applications a
                 JOIN jobs j ON a.job_id = j.job_id
                 WHERE j.employer_id = ?`,
                [profile?.employer_id]
            );
            profile.total_applicants = applicants[0].count;
        }
        
        const [views] = await db.query(
            'SELECT COUNT(*) as count FROM profile_views WHERE viewed_user_id = ?',
            [userId]
        );
        profile.profile_views = views[0].count;
        
        res.json({
            success: true,
            user: { ...user, profile }
        });
        
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const updates = req.body;
        
        const [users] = await db.query(
            'SELECT user_type FROM users WHERE user_id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        const userType = users[0].user_type;
        
        if (userType === 'job_seeker') {
            const allowedFields = [
                'full_name', 'headline', 'phone', 'location', 'about',
                'skills', 'experience_years', 'education', 'certifications',
                'languages', 'linkedin_url', 'github_url', 'portfolio_url',
                'is_public'
            ];
            
            const updateFields = [];
            const values = [];
            
            allowedFields.forEach(field => {
                if (updates[field] !== undefined) {
                    updateFields.push(`${field} = ?`);
                    values.push(updates[field]);
                }
            });
            
            if (updateFields.length > 0) {
                values.push(userId);
                await db.query(
                    `UPDATE job_seekers SET ${updateFields.join(', ')} WHERE user_id = ?`,
                    values
                );
            }
            
        } else if (userType === 'employer') {
            const employerFields = ['full_name', 'designation', 'phone'];
            const employerUpdates = [];
            const employerValues = [];
            
            employerFields.forEach(field => {
                if (updates[field] !== undefined) {
                    employerUpdates.push(`${field} = ?`);
                    employerValues.push(updates[field]);
                }
            });
            
            if (employerUpdates.length > 0) {
                employerValues.push(userId);
                await db.query(
                    `UPDATE employers SET ${employerUpdates.join(', ')} WHERE user_id = ?`,
                    employerValues
                );
            }
            
            const companyFields = [
                'company_name', 'website', 'description', 'industry',
                'size', 'founded_year', 'headquarters'
            ];
            const companyUpdates = [];
            const companyValues = [];
            
            companyFields.forEach(field => {
                if (updates[field] !== undefined) {
                    companyUpdates.push(`${field} = ?`);
                    companyValues.push(updates[field]);
                }
            });
            
            if (companyUpdates.length > 0) {
                const [employer] = await db.query(
                    'SELECT company_id FROM employers WHERE user_id = ?',
                    [userId]
                );
                
                if (employer.length > 0) {
                    companyValues.push(employer[0].company_id);
                    await db.query(
                        `UPDATE companies SET ${companyUpdates.join(', ')} WHERE company_id = ?`,
                        companyValues
                    );
                }
            }
        }
        
        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
        
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Upload image
exports.uploadImage = (req, res) => {
    // Use a fixed field name - always 'profile_pic'
    const uploadSingle = upload.single('profile_pic');
    
    uploadSingle(req, res, async (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({ 
                success: false, 
                message: err.message 
            });
        }
        
        if (!req.file) {
            console.error('No file in request');
            return res.status(400).json({ 
                success: false, 
                message: 'No file uploaded' 
            });
        }
        
        try {
            const userId = req.user.user_id;
            const fileUrl = `${req.protocol}://${req.get('host')}/${req.file.path}`;
            
            const [users] = await db.query(
                'SELECT user_type FROM users WHERE user_id = ?',
                [userId]
            );
            
            if (users.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }
            
            const userType = users[0].user_type;
            
            if (userType === 'job_seeker') {
                await db.query(
                    'UPDATE job_seekers SET profile_pic_url = ? WHERE user_id = ?',
                    [fileUrl, userId]
                );
            } else if (userType === 'employer') {
                await db.query(
                    'UPDATE employers SET profile_pic_url = ? WHERE user_id = ?',
                    [fileUrl, userId]
                );
            }
            
            res.json({
                success: true,
                message: 'Image uploaded successfully',
                url: fileUrl
            });
            
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Server error' 
            });
        }
    });
};

// ============= ADD THIS MISSING FUNCTION =============
// Upload resume
exports.uploadResume = (req, res) => {
    const uploadSingle = upload.single('resume');
    
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
            const fileUrl = `${req.protocol}://${req.get('host')}/${req.file.path}`;
            
            // Update job_seekers table
            await db.query(
                'UPDATE job_seekers SET resume_url = ? WHERE user_id = ?',
                [fileUrl, userId]
            );
            
            res.json({
                success: true,
                message: 'Resume uploaded successfully',
                url: fileUrl
            });
            
        } catch (error) {
            console.error('Resume upload error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Server error' 
            });
        }
    });
};
// =====================================================

// Change password
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    try {
        const userId = req.user.user_id;
        
        const [users] = await db.query(
            'SELECT * FROM users WHERE user_id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        const user = users[0];
        
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: 'Current password is incorrect' 
            });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        await db.query(
            'UPDATE users SET password_hash = ? WHERE user_id = ?',
            [hashedPassword, userId]
        );
        
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
        
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};