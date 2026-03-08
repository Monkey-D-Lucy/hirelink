const db = require('../config/db');

// Get user notifications
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        const [notifications] = await db.query(
            `SELECT * FROM notifications 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT 50`,
            [userId]
        );
        
        // Get unread count
        const [unread] = await db.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [userId]
        );
        
        res.json({
            success: true,
            notifications,
            unreadCount: unread[0].count
        });
        
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user.user_id;
        
        await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?',
            [notificationId, userId]
        );
        
        res.json({
            success: true,
            message: 'Notification marked as read'
        });
        
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
            [userId]
        );
        
        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
        
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user.user_id;
        
        await db.query(
            'DELETE FROM notifications WHERE notification_id = ? AND user_id = ?',
            [notificationId, userId]
        );
        
        res.json({
            success: true,
            message: 'Notification deleted'
        });
        
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};