const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Register user
exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            errors: errors.array() 
        });
    }

    const { email, password, user_type, full_name, company_name, phone } = req.body;
    
    try {
        // Check if user exists
        const [existing] = await db.query(
            'SELECT * FROM users WHERE email = ?', 
            [email]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'User already exists' 
            });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS));
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Start transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();
        
        try {
            // Insert user
            const [userResult] = await connection.query(
                'INSERT INTO users (email, password_hash, user_type) VALUES (?, ?, ?)',
                [email, hashedPassword, user_type]
            );
            
            const userId = userResult.insertId;
            
            // Insert profile based on user type
            if (user_type === 'job_seeker') {
                await connection.query(
                    `INSERT INTO job_seekers 
                     (user_id, full_name, phone) 
                     VALUES (?, ?, ?)`,
                    [userId, full_name, phone || null]
                );
            } else if (user_type === 'employer') {
                // Check if company exists or create new
                let companyId;
                const [company] = await connection.query(
                    'SELECT company_id FROM companies WHERE company_name = ?',
                    [company_name]
                );
                
                if (company.length > 0) {
                    companyId = company[0].company_id;
                } else {
                    const [companyResult] = await connection.query(
                        'INSERT INTO companies (company_name, verified) VALUES (?, ?)',
                        [company_name, false]
                    );
                    companyId = companyResult.insertId;
                }
                
                await connection.query(
                    'INSERT INTO employers (user_id, company_id, full_name, designation, phone) VALUES (?, ?, ?, ?, ?)',
                    [userId, companyId, full_name, 'Recruiter', phone || null]
                );
            }
            
            await connection.commit();
            
            // Generate token
            const token = jwt.sign(
                { 
                    user_id: userId, 
                    email, 
                    user_type 
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE }
            );
            
            res.status(201).json({
                success: true,
                token,
                user: { 
                    user_id: userId, 
                    email, 
                    user_type 
                }
            });
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during registration' 
        });
    }
};

// Login user
exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            errors: errors.array() 
        });
    }

    const { email, password, user_type } = req.body;
    
    try {
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ? AND user_type = ?',
            [email, user_type]
        );
        
        if (users.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }
        
        const user = users[0];
        
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }
        
        // Update last login
        await db.query(
            'UPDATE users SET last_login = NOW() WHERE user_id = ?',
            [user.user_id]
        );
        
        // Get additional profile info
        let profile = null;
        if (user.user_type === 'job_seeker') {
            const [seeker] = await db.query(
                'SELECT * FROM job_seekers WHERE user_id = ?', 
                [user.user_id]
            );
            profile = seeker[0];
        } else if (user.user_type === 'employer') {
            const [employer] = await db.query(
                `SELECT e.*, c.company_name, c.verified, c.logo_url 
                 FROM employers e 
                 JOIN companies c ON e.company_id = c.company_id 
                 WHERE e.user_id = ?`,
                [user.user_id]
            );
            profile = employer[0];
        }
        
        const token = jwt.sign(
            { 
                user_id: user.user_id, 
                email: user.email, 
                user_type: user.user_type 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );
        
        res.json({
            success: true,
            token,
            user: {
                user_id: user.user_id,
                email: user.email,
                user_type: user.user_type,
                profile
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
};

// Get current user
exports.getMe = async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT user_id, email, user_type, is_verified, created_at, last_login 
             FROM users WHERE user_id = ?`,
            [req.user.user_id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        const user = users[0];
        
        // Get profile based on type
        if (user.user_type === 'job_seeker') {
            const [profile] = await db.query(
                'SELECT * FROM job_seekers WHERE user_id = ?', 
                [user.user_id]
            );
            user.profile = profile[0];
            
            // Get skills
            const [skills] = await db.query(
                `SELECT s.*, ss.years_experience 
                 FROM seeker_skills ss
                 JOIN skills s ON ss.skill_id = s.skill_id
                 WHERE ss.seeker_id = ?`,
                [profile[0].seeker_id]
            );
            user.skills = skills;
            
        } else if (user.user_type === 'employer') {
            const [profile] = await db.query(
                `SELECT e.*, c.company_name, c.verified, c.logo_url, c.description as company_description
                 FROM employers e 
                 JOIN companies c ON e.company_id = c.company_id 
                 WHERE e.user_id = ?`,
                [user.user_id]
            );
            user.profile = profile[0];
        }
        
        res.json({
            success: true,
            user
        });
        
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};