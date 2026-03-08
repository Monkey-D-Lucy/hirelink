const db = require('../config/db');

// Get employer analytics
exports.getEmployerAnalytics = async (req, res) => {
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
        
        const employerId = employer[0].employer_id;
        
        // Get job statistics
        const [jobStats] = await db.query(
            `SELECT 
                COUNT(*) as total_jobs,
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_jobs,
                SUM(applications_count) as total_applications,
                AVG(applications_count) as avg_applications_per_job,
                SUM(views_count) as total_views
             FROM jobs
             WHERE employer_id = ?`,
            [employerId]
        );
        
        // Get application trends (last 30 days)
        const [trends] = await db.query(
            `SELECT 
                DATE(applied_date) as date,
                COUNT(*) as count
             FROM applications a
             JOIN jobs j ON a.job_id = j.job_id
             WHERE j.employer_id = ? 
               AND applied_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             GROUP BY DATE(applied_date)
             ORDER BY date DESC`,
            [employerId]
        );
        
        // Get status breakdown
        const [statusBreakdown] = await db.query(
            `SELECT 
                a.status,
                COUNT(*) as count
             FROM applications a
             JOIN jobs j ON a.job_id = j.job_id
             WHERE j.employer_id = ?
             GROUP BY a.status`,
            [employerId]
        );
        
        // Get top jobs by applications
        const [topJobs] = await db.query(
            `SELECT 
                j.job_id, j.title, j.applications_count,
                (SELECT COUNT(*) FROM applications WHERE job_id = j.job_id AND status = 'shortlisted') as shortlisted
             FROM jobs j
             WHERE j.employer_id = ?
             ORDER BY j.applications_count DESC
             LIMIT 5`,
            [employerId]
        );
        
        res.json({
            success: true,
            analytics: {
                overview: jobStats[0],
                trends,
                statusBreakdown,
                topJobs
            }
        });
        
    } catch (error) {
        console.error('Get employer analytics error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Get job seeker analytics
exports.getSeekerAnalytics = async (req, res) => {
    try {
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
        
        const seekerId = seeker[0].seeker_id;
        
        // Get application statistics
        const [appStats] = await db.query(
            `SELECT 
                COUNT(*) as total_applications,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'reviewed' THEN 1 ELSE 0 END) as reviewed,
                SUM(CASE WHEN status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN status = 'hired' THEN 1 ELSE 0 END) as hired
             FROM applications
             WHERE seeker_id = ?`,
            [seekerId]
        );
        
        // Get application trends (last 30 days)
        const [trends] = await db.query(
            `SELECT 
                DATE(applied_date) as date,
                COUNT(*) as count
             FROM applications
             WHERE seeker_id = ? 
               AND applied_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             GROUP BY DATE(applied_date)
             ORDER BY date DESC`,
            [seekerId]
        );
        
        // Get profile views
        const [profileViews] = await db.query(
            `SELECT 
                DATE(viewed_date) as date,
                COUNT(*) as count
             FROM profile_views
             WHERE viewed_user_id = ?
               AND viewed_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             GROUP BY DATE(viewed_date)
             ORDER BY date DESC`,
            [userId]
        );
        
        // Get saved jobs count
        const [savedJobs] = await db.query(
            'SELECT COUNT(*) as count FROM saved_jobs WHERE seeker_id = ?',
            [seekerId]
        );
        
        res.json({
            success: true,
            analytics: {
                applications: appStats[0],
                trends,
                profileViews,
                savedJobs: savedJobs[0].count
            }
        });
        
    } catch (error) {
        console.error('Get seeker analytics error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Track profile view
exports.trackProfileView = async (req, res) => {
    try {
        const viewedUserId = req.params.userId;
        const viewerId = req.user?.user_id || null;
        
        await db.query(
            'INSERT INTO profile_views (viewer_id, viewed_user_id) VALUES (?, ?)',
            [viewerId, viewedUserId]
        );
        
        res.json({
            success: true,
            message: 'Profile view tracked'
        });
        
    } catch (error) {
        console.error('Track profile view error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};