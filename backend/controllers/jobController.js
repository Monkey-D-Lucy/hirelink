const db = require('../config/db');

// Get all jobs (with pagination and filters)
exports.getAllJobs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;
        
        const { search, location, jobType, salaryMin, salaryMax, experienceLevel } = req.query;
        
        let query = `
            SELECT j.*, 
                   c.company_name, c.logo_url,
                   (SELECT COUNT(*) FROM applications WHERE job_id = j.job_id) as applications_count,
                   (SELECT COUNT(*) FROM saved_jobs WHERE job_id = j.job_id) as saved_count
            FROM jobs j
            JOIN employers e ON j.employer_id = e.employer_id
            JOIN companies c ON e.company_id = c.company_id
            WHERE j.is_active = 1 AND j.expiry_date > NOW()
        `;
        
        const queryParams = [];
        
        if (search) {
            query += ` AND (j.title LIKE ? OR j.description LIKE ? OR c.company_name LIKE ?)`;
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (location) {
            query += ` AND j.location LIKE ?`;
            queryParams.push(`%${location}%`);
        }
        
        if (jobType) {
            query += ` AND j.job_type = ?`;
            queryParams.push(jobType);
        }
        
        if (salaryMin) {
            query += ` AND j.salary_min >= ?`;
            queryParams.push(parseInt(salaryMin));
        }
        
        if (salaryMax) {
            query += ` AND j.salary_max <= ?`;
            queryParams.push(parseInt(salaryMax));
        }
        
        if (experienceLevel) {
            query += ` AND j.experience_required <= ?`;
            queryParams.push(parseInt(experienceLevel));
        }
        
        query += ` ORDER BY j.created_at DESC LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);
        
        const [jobs] = await db.query(query, queryParams);
        
        // Get total count for pagination - FIXED: Use parameterized query
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM jobs j
            JOIN employers e ON j.employer_id = e.employer_id
            JOIN companies c ON e.company_id = c.company_id
            WHERE j.is_active = 1 AND j.expiry_date > NOW()
        `;
        
        const countParams = [];
        
        if (search) {
            countQuery += ` AND (j.title LIKE ? OR j.description LIKE ? OR c.company_name LIKE ?)`;
            const searchTerm = `%${search}%`;
            countParams.push(searchTerm, searchTerm, searchTerm);
        }
        if (location) {
            countQuery += ` AND j.location LIKE ?`;
            countParams.push(`%${location}%`);
        }
        if (jobType) {
            countQuery += ` AND j.job_type = ?`;
            countParams.push(jobType);
        }
        if (salaryMin) {
            countQuery += ` AND j.salary_min >= ?`;
            countParams.push(parseInt(salaryMin));
        }
        if (salaryMax) {
            countQuery += ` AND j.salary_max <= ?`;
            countParams.push(parseInt(salaryMax));
        }
        if (experienceLevel) {
            countQuery += ` AND j.experience_required <= ?`;
            countParams.push(parseInt(experienceLevel));
        }
        
        const [countResult] = await db.query(countQuery, countParams);
        const totalJobs = countResult[0].total;
        const totalPages = Math.ceil(totalJobs / limit);
        
        res.json({
            success: true,
            jobs,
            pagination: {
                currentPage: page,
                totalPages,
                totalJobs,
                limit
            }
        });
        
    } catch (error) {
        console.error('Get all jobs error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Get job by ID - FIXED: Added check for 'my-jobs'
exports.getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.user?.user_id;
        
        // FIX: Prevent 'my-jobs' from being treated as a job ID
        if (jobId === 'my-jobs' || jobId === 'recommended' || jobId === 'saved') {
            return res.status(404).json({ 
                success: false, 
                message: 'Invalid job ID' 
            });
        }
        
        // Increment view count
        await db.query(
            'UPDATE jobs SET views_count = views_count + 1 WHERE job_id = ?',
            [jobId]
        );
        
        // Get job details
        const [jobs] = await db.query(
            `SELECT j.*, 
                    c.company_name, c.logo_url, c.description as company_description,
                    c.website, c.industry, c.size, c.founded_year, c.headquarters,
                    e.full_name as employer_name, e.designation
             FROM jobs j
             JOIN employers e ON j.employer_id = e.employer_id
             JOIN companies c ON e.company_id = c.company_id
             WHERE j.job_id = ?`,
            [jobId]
        );
        
        if (jobs.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Job not found' 
            });
        }
        
        const job = jobs[0];
        
        // Check if user has applied (if logged in)
        let hasApplied = false;
        let isSaved = false;
        
        if (userId) {
            // Get seeker_id if user is job seeker
            const [seeker] = await db.query(
                'SELECT seeker_id FROM job_seekers WHERE user_id = ?',
                [userId]
            );
            
            if (seeker.length > 0) {
                const [application] = await db.query(
                    'SELECT * FROM applications WHERE job_id = ? AND seeker_id = ?',
                    [jobId, seeker[0].seeker_id]
                );
                hasApplied = application.length > 0;
                
                const [saved] = await db.query(
                    'SELECT * FROM saved_jobs WHERE job_id = ? AND seeker_id = ?',
                    [jobId, seeker[0].seeker_id]
                );
                isSaved = saved.length > 0;
            }
        }
        
        // Get similar jobs
        const [similarJobs] = await db.query(
            `SELECT j.job_id, j.title, j.location, j.job_type, j.salary_min, j.salary_max,
                    c.company_name
             FROM jobs j
             JOIN employers e ON j.employer_id = e.employer_id
             JOIN companies c ON e.company_id = c.company_id
             WHERE j.is_active = 1 
               AND j.expiry_date > NOW()
               AND j.job_id != ?
               AND (j.title LIKE ? OR j.skills_required LIKE ? OR c.industry = ?)
             LIMIT 5`,
            [jobId, `%${job.title?.split(' ')[0] || ''}%`, `%${job.skills_required || ''}%`, job.industry || '']
        );
        
        res.json({
            success: true,
            job,
            hasApplied,
            isSaved,
            similarJobs
        });
        
    } catch (error) {
        console.error('Get job by ID error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Post a new job (employer only)
exports.createJob = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        // Get employer_id
        const [employer] = await db.query(
            'SELECT employer_id FROM employers WHERE user_id = ?',
            [userId]
        );
        
        if (employer.length === 0) {
            return res.status(403).json({ 
                success: false, 
                message: 'Employer profile not found' 
            });
        }
        
        const employerId = employer[0].employer_id;
        
        // Get company_id
        const [company] = await db.query(
            'SELECT company_id FROM employers WHERE employer_id = ?',
            [employerId]
        );
        
        const companyId = company[0].company_id;
        
        const {
            title, description, requirements, responsibilities,
            salary_min, salary_max, salary_currency, location,
            job_type, experience_required, skills_required,
            benefits, expiry_date
        } = req.body;
        
        // Set expiry date (default 30 days)
        const expiry = expiry_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        // Insert job
        const [result] = await db.query(
            `INSERT INTO jobs 
             (employer_id, company_id, title, description, requirements, responsibilities,
              salary_min, salary_max, salary_currency, location, job_type,
              experience_required, skills_required, benefits, expiry_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [employerId, companyId, title, description, requirements, responsibilities,
             salary_min || null, salary_max || null, salary_currency || 'INR', location,
             job_type, experience_required || 0, skills_required, benefits, expiry]
        );
        
        res.status(201).json({
            success: true,
            message: 'Job posted successfully',
            job_id: result.insertId
        });
        
    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Get jobs posted by current employer
exports.getMyJobs = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        const [employer] = await db.query(
            'SELECT employer_id FROM employers WHERE user_id = ?',
            [userId]
        );
        
        if (employer.length === 0) {
            return res.status(403).json({ 
                success: false, 
                message: 'Employer profile not found' 
            });
        }
        
        const [jobs] = await db.query(
            `SELECT j.*, 
                    (SELECT COUNT(*) FROM applications WHERE job_id = j.job_id) as applications_count,
                    (SELECT COUNT(*) FROM applications WHERE job_id = j.job_id AND status = 'pending') as new_applications
             FROM jobs j
             WHERE j.employer_id = ?
             ORDER BY j.created_at DESC`,
            [employer[0].employer_id]
        );
        
        res.json({
            success: true,
            jobs
        });
        
    } catch (error) {
        console.error('Get my jobs error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Update job (employer only)
exports.updateJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.user.user_id;
        const updates = req.body;
        
        // Check if job belongs to this employer
        const [employer] = await db.query(
            'SELECT employer_id FROM employers WHERE user_id = ?',
            [userId]
        );
        
        const [job] = await db.query(
            'SELECT * FROM jobs WHERE job_id = ? AND employer_id = ?',
            [jobId, employer[0].employer_id]
        );
        
        if (job.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Job not found or unauthorized' 
            });
        }
        
        // Build update query
        const allowedFields = [
            'title', 'description', 'requirements', 'responsibilities',
            'salary_min', 'salary_max', 'salary_currency', 'location',
            'job_type', 'experience_required', 'skills_required',
            'benefits', 'is_active', 'expiry_date'
        ];
        
        const updateFields = [];
        const values = [];
        
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                updateFields.push(`${field} = ?`);
                values.push(updates[field]);
            }
        });
        
        if (updateFields.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No fields to update' 
            });
        }
        
        values.push(jobId);
        
        await db.query(
            `UPDATE jobs SET ${updateFields.join(', ')} WHERE job_id = ?`,
            values
        );
        
        res.json({
            success: true,
            message: 'Job updated successfully'
        });
        
    } catch (error) {
        console.error('Update job error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Delete job (employer only)
exports.deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.user.user_id;
        
        const [employer] = await db.query(
            'SELECT employer_id FROM employers WHERE user_id = ?',
            [userId]
        );
        
        await db.query(
            'DELETE FROM jobs WHERE job_id = ? AND employer_id = ?',
            [jobId, employer[0].employer_id]
        );
        
        res.json({
            success: true,
            message: 'Job deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete job error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Get recommended jobs for job seeker
exports.getRecommendedJobs = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        // Get seeker_id and skills
        const [seeker] = await db.query(
            'SELECT seeker_id, skills FROM job_seekers WHERE user_id = ?',
            [userId]
        );
        
        if (seeker.length === 0) {
            return res.json({ success: true, jobs: [] });
        }
        
        const seekerSkills = seeker[0].skills ? seeker[0].skills.split(',').map(s => s.trim()) : [];
        
        let query = `
            SELECT j.*, 
                   c.company_name, c.logo_url,
                   (SELECT COUNT(*) FROM applications WHERE job_id = j.job_id) as applications_count
            FROM jobs j
            JOIN employers e ON j.employer_id = e.employer_id
            JOIN companies c ON e.company_id = c.company_id
            WHERE j.is_active = 1 AND j.expiry_date > NOW()
        `;
        
        const queryParams = [];
        
        // Add skill matching
        if (seekerSkills.length > 0) {
            const skillConditions = [];
            seekerSkills.forEach(skill => {
                skillConditions.push(`j.skills_required LIKE ?`);
                queryParams.push(`%${skill}%`);
            });
            query += ` AND (${skillConditions.join(' OR ')})`;
        }
        
        query += ` ORDER BY j.created_at DESC LIMIT 10`;
        
        const [jobs] = await db.query(query, queryParams);
        
        res.json({
            success: true,
            jobs
        });
        
    } catch (error) {
        console.error('Get recommended jobs error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Save a job
exports.saveJob = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { job_id } = req.body;
        
        // Get seeker_id
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
        
        await db.query(
            'INSERT INTO saved_jobs (seeker_id, job_id) VALUES (?, ?)',
            [seeker[0].seeker_id, job_id]
        );
        
        res.json({
            success: true,
            message: 'Job saved successfully'
        });
        
    } catch (error) {
        console.error('Save job error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Remove saved job
exports.removeSavedJob = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const jobId = req.params.id;
        
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
        
        await db.query(
            'DELETE FROM saved_jobs WHERE seeker_id = ? AND job_id = ?',
            [seeker[0].seeker_id, jobId]
        );
        
        res.json({
            success: true,
            message: 'Job removed from saved'
        });
        
    } catch (error) {
        console.error('Remove saved job error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Get saved jobs
exports.getSavedJobs = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        const [seeker] = await db.query(
            'SELECT seeker_id FROM job_seekers WHERE user_id = ?',
            [userId]
        );
        
        if (seeker.length === 0) {
            return res.json({ success: true, jobs: [] });
        }
        
        const [jobs] = await db.query(
            `SELECT j.*, c.company_name, c.logo_url
             FROM saved_jobs sj
             JOIN jobs j ON sj.job_id = j.job_id
             JOIN employers e ON j.employer_id = e.employer_id
             JOIN companies c ON e.company_id = c.company_id
             WHERE sj.seeker_id = ?
             ORDER BY sj.saved_date DESC`,
            [seeker[0].seeker_id]
        );
        
        res.json({
            success: true,
            jobs
        });
        
    } catch (error) {
        console.error('Get saved jobs error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};