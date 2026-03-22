const db = require('../config/db');

// Apply for a job - FIXED: Added user type check
exports.applyForJob = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { job_id, cover_letter } = req.body;
        
        // 🔴 FIX: Verify user is a job seeker first
        if (req.user.user_type !== 'job_seeker') {
            return res.status(403).json({ 
                success: false, 
                message: 'Only job seekers can apply for jobs' 
            });
        }
        
        // Get seeker_id
        const [seeker] = await db.query(
            'SELECT seeker_id, resume_url FROM job_seekers WHERE user_id = ?',
            [userId]
        );
        
        if (seeker.length === 0) {
            return res.status(403).json({ 
                success: false, 
                message: 'Job seeker profile not found' 
            });
        }
        
        const seekerId = seeker[0].seeker_id;
        
        // Check if already applied
        const [existing] = await db.query(
            'SELECT * FROM applications WHERE job_id = ? AND seeker_id = ?',
            [job_id, seekerId]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Already applied for this job' 
            });
        }
        
        // Start transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();
        
        try {
            // Insert application
            await connection.query(
                `INSERT INTO applications 
                 (job_id, seeker_id, cover_letter, resume_used) 
                 VALUES (?, ?, ?, ?)`,
                [job_id, seekerId, cover_letter || 'I am interested in this position', seeker[0].resume_url]
            );
            
            // Update job applications count
            await connection.query(
                'UPDATE jobs SET applications_count = applications_count + 1 WHERE job_id = ?',
                [job_id]
            );
            
            // Get employer id for notification
            const [job] = await connection.query(
                'SELECT employer_id, title FROM jobs WHERE job_id = ?',
                [job_id]
            );
            
            if (job.length > 0) {
                const [employer] = await connection.query(
                    'SELECT user_id FROM employers WHERE employer_id = ?',
                    [job[0].employer_id]
                );
                
                if (employer.length > 0) {
                    await connection.query(
                        `INSERT INTO notifications 
                         (user_id, title, message, type, link)
                         VALUES (?, ?, ?, ?, ?)`,
                        [employer[0].user_id, 'New Application',
                         `Someone applied for "${job[0].title}"`,
                         'application', `/employer/applicants/${job_id}`]
                    );
                }
            }
            
            await connection.commit();
            
            res.status(201).json({
                success: true,
                message: 'Application submitted successfully'
            });
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Apply for job error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Get applications for a job (employer only)
exports.getJobApplications = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const userId = req.user.user_id;
        
        const [employer] = await db.query(
            'SELECT employer_id FROM employers WHERE user_id = ?',
            [userId]
        );
        
        // Verify job belongs to this employer
        const [job] = await db.query(
            'SELECT * FROM jobs WHERE job_id = ? AND employer_id = ?',
            [jobId, employer[0].employer_id]
        );
        
        if (job.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Job not found' 
            });
        }
        
        const [applicants] = await db.query(
            `SELECT a.*, 
                    js.full_name, js.headline, js.phone, js.location,
                    js.skills, js.resume_url, js.profile_pic_url,
                    js.linkedin_url, js.github_url, js.portfolio_url,
                    u.email
             FROM applications a
             JOIN job_seekers js ON a.seeker_id = js.seeker_id
             JOIN users u ON js.user_id = u.user_id
             WHERE a.job_id = ?
             ORDER BY a.applied_date DESC`,
            [jobId]
        );
        
        res.json({
            success: true,
            job: job[0],
            applicants
        });
        
    } catch (error) {
        console.error('Get job applications error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Get my applications (job seeker)
exports.getMyApplications = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        const [seeker] = await db.query(
            'SELECT seeker_id FROM job_seekers WHERE user_id = ?',
            [userId]
        );
        
        if (seeker.length === 0) {
            return res.json({ success: true, applications: [] });
        }
        
        const [applications] = await db.query(
            `SELECT a.*, j.title, j.location, j.salary_min, j.salary_max,
                    j.job_type, j.company_id,
                    c.company_name, c.logo_url
             FROM applications a
             JOIN jobs j ON a.job_id = j.job_id
             JOIN employers e ON j.employer_id = e.employer_id
             JOIN companies c ON e.company_id = c.company_id
             WHERE a.seeker_id = ?
             ORDER BY a.applied_date DESC`,
            [seeker[0].seeker_id]
        );
        
        res.json({
            success: true,
            applications
        });
        
    } catch (error) {
        console.error('Get my applications error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Update application status (employer only)
exports.updateApplicationStatus = async (req, res) => {
    try {
        const applicationId = req.params.id;
        const { status } = req.body;
        
        // Get application details
        const [application] = await db.query(
            `SELECT a.*, j.employer_id, j.title, js.user_id 
             FROM applications a
             JOIN jobs j ON a.job_id = j.job_id
             JOIN job_seekers js ON a.seeker_id = js.seeker_id
             WHERE a.application_id = ?`,
            [applicationId]
        );
        
        if (application.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Application not found' 
            });
        }
        
        // Verify employer owns this job
        const [employer] = await db.query(
            'SELECT employer_id FROM employers WHERE user_id = ?',
            [req.user.user_id]
        );
        
        if (application[0].employer_id !== employer[0].employer_id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Unauthorized' 
            });
        }
        
        // Update status
        await db.query(
            'UPDATE applications SET status = ? WHERE application_id = ?',
            [status, applicationId]
        );
        
        // Notify seeker
        await db.query(
            `INSERT INTO notifications 
             (user_id, title, message, type, link)
             VALUES (?, ?, ?, ?, ?)`,
            [application[0].user_id, 'Application Status Updated',
             `Your application for "${application[0].title}" is now ${status}`,
             'application', `/seeker/applications`]
        );
        
        res.json({
            success: true,
            message: 'Application status updated'
        });
        
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Schedule interview
exports.scheduleInterview = async (req, res) => {
    try {
        const applicationId = req.params.id;
        const { interview_date } = req.body;
        
        // Get application details
        const [application] = await db.query(
            `SELECT a.*, j.title, js.user_id 
             FROM applications a
             JOIN jobs j ON a.job_id = j.job_id
             JOIN job_seekers js ON a.seeker_id = js.seeker_id
             WHERE a.application_id = ?`,
            [applicationId]
        );
        
        if (application.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Application not found' 
            });
        }
        
        // Update interview date
        await db.query(
            'UPDATE applications SET interview_date = ? WHERE application_id = ?',
            [interview_date, applicationId]
        );
        
        // Notify seeker
        await db.query(
            `INSERT INTO notifications 
             (user_id, title, message, type, link)
             VALUES (?, ?, ?, ?, ?)`,
            [application[0].user_id, 'Interview Scheduled',
             `Interview scheduled for ${new Date(interview_date).toLocaleString()} for "${application[0].title}"`,
             'interview', `/seeker/applications`]
        );
        
        res.json({
            success: true,
            message: 'Interview scheduled successfully'
        });
        
    } catch (error) {
        console.error('Schedule interview error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Withdraw application (job seeker)
exports.withdrawApplication = async (req, res) => {
    try {
        const applicationId = req.params.id;
        const userId = req.user.user_id;
        
        const [seeker] = await db.query(
            'SELECT seeker_id FROM job_seekers WHERE user_id = ?',
            [userId]
        );
        
        if (seeker.length === 0) {
            return res.status(403).json({ 
                success: false, 
                message: 'Job seeker profile not found' 
            });
        }
        
        const [result] = await db.query(
            'DELETE FROM applications WHERE application_id = ? AND seeker_id = ?',
            [applicationId, seeker[0].seeker_id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Application not found' 
            });
        }
        
        res.json({
            success: true,
            message: 'Application withdrawn successfully'
        });
        
    } catch (error) {
        console.error('Withdraw application error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};