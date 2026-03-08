const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');
const bcrypt = require('bcryptjs');

passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const [users] = await db.query('SELECT * FROM users WHERE user_id = ?', [id]);
        done(null, users[0]);
    } catch (error) {
        done(error, null);
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
            proxy: true
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                const name = profile.displayName;
                
                // Check if user exists
                const [existingUser] = await db.query(
                    'SELECT * FROM users WHERE email = ?',
                    [email]
                );
                
                if (existingUser.length > 0) {
                    // Update last login
                    await db.query(
                        'UPDATE users SET last_login = NOW() WHERE user_id = ?',
                        [existingUser[0].user_id]
                    );
                    return done(null, existingUser[0]);
                }
                
                // Create new user
                const connection = await db.getConnection();
                await connection.beginTransaction();
                
                try {
                    // Generate random password
                    const randomPassword = Math.random().toString(36).slice(-8);
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(randomPassword, salt);
                    
                    const [userResult] = await connection.query(
                        'INSERT INTO users (email, password_hash, user_type) VALUES (?, ?, ?)',
                        [email, hashedPassword, 'job_seeker']
                    );
                    
                    const userId = userResult.insertId;
                    
                    await connection.query(
                        'INSERT INTO job_seekers (user_id, full_name) VALUES (?, ?)',
                        [userId, name]
                    );
                    
                    await connection.commit();
                    
                    const [newUser] = await connection.query(
                        'SELECT * FROM users WHERE user_id = ?',
                        [userId]
                    );
                    
                    return done(null, newUser[0]);
                    
                } catch (error) {
                    await connection.rollback();
                    throw error;
                } finally {
                    connection.release();
                }
                
            } catch (error) {
                console.error('Google auth error:', error);
                return done(error, null);
            }
        }
    )
);

module.exports = passport;