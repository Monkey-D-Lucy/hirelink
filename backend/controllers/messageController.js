const db = require('../config/db');

// Get conversations for current user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const [conversations] = await db.query(
      `SELECT 
        m.*,
        CASE 
          WHEN m.sender_id = ? THEN m.receiver_id
          ELSE m.sender_id
        END as other_user_id,
        u.email as other_user_email,
        u.user_type as other_user_type,
        p.full_name as other_user_name,
        p.profile_pic_url as other_user_avatar,
        j.title as job_title
      FROM messages m
      JOIN users u ON u.user_id = (CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END)
      LEFT JOIN job_seekers p ON u.user_id = p.user_id AND u.user_type = 'job_seeker'
      LEFT JOIN employers e ON u.user_id = e.user_id AND u.user_type = 'employer'
      LEFT JOIN jobs j ON m.job_id = j.job_id
      WHERE m.sender_id = ? OR m.receiver_id = ?
      ORDER BY m.created_at DESC
      LIMIT 50`,
      [userId, userId, userId, userId]
    );
    
    // Group by conversation
    const conversationMap = new Map();
    conversations.forEach(msg => {
      const key = msg.other_user_id;
      if (!conversationMap.has(key) || msg.created_at > conversationMap.get(key).lastMessageTime) {
        conversationMap.set(key, {
          userId: msg.other_user_id,
          name: msg.other_user_name || msg.other_user_email,
          avatar: msg.other_user_avatar,
          userType: msg.other_user_type,
          lastMessage: msg.message,
          lastMessageTime: msg.created_at,
          unreadCount: msg.is_read ? 0 : 1,
          jobTitle: msg.job_title
        });
      } else if (!msg.is_read) {
        const conv = conversationMap.get(key);
        conv.unreadCount++;
      }
    });
    
    res.json({
      success: true,
      conversations: Array.from(conversationMap.values())
    });
    
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get messages between two users
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { otherUserId } = req.params;
    
    const [messages] = await db.query(
      `SELECT m.*, 
              u.email as sender_email,
              CASE WHEN u.user_type = 'job_seeker' THEN js.full_name ELSE e.full_name END as sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.user_id
       LEFT JOIN job_seekers js ON u.user_id = js.user_id
       LEFT JOIN employers e ON u.user_id = e.user_id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) 
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC
       LIMIT 100`,
      [userId, otherUserId, otherUserId, userId]
    );
    
    // Mark messages as read
    await db.query(
      `UPDATE messages 
       SET is_read = TRUE 
       WHERE receiver_id = ? AND sender_id = ? AND is_read = FALSE`,
      [userId, otherUserId]
    );
    
    res.json({
      success: true,
      messages
    });
    
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.user_id;
    const { receiverId, message, jobId } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO messages (sender_id, receiver_id, job_id, message) 
       VALUES (?, ?, ?, ?)`,
      [senderId, receiverId, jobId || null, message]
    );
    
    const [newMessage] = await db.query(
      `SELECT m.*, 
              u.email as sender_email
       FROM messages m
       JOIN users u ON m.sender_id = u.user_id
       WHERE m.message_id = ?`,
      [result.insertId]
    );
    
    // Emit via socket if needed
    const io = req.app.get('io');
    io.to(`user_${receiverId}`).emit('new-message', newMessage[0]);
    
    res.json({
      success: true,
      message: newMessage[0]
    });
    
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};