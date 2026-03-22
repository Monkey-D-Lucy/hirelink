import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSend, FiUser, FiMessageCircle, FiCheck,
  FiCheckCircle, FiClock, FiUsers
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { 
  initializeSocket, getSocket, disconnectSocket,
  sendMessage, markMessageRead, sendTyping,
  onNewMessage, onUserTyping, onUserOnline
} from '../services/socket';
import { theme } from '../styles/theme';
import toast from 'react-hot-toast';

const Container = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background};
  padding: 100px ${theme.spacing.xl} ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.md}) {
    padding: 100px ${theme.spacing.md} ${theme.spacing.md};
  }
`;

const MessagesContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  overflow: hidden;
  box-shadow: ${theme.shadows.medium};
  height: calc(100vh - 180px);

  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const ConversationsList = styled.div`
  border-right: 1px solid ${theme.colors.border};
  overflow-y: auto;
  background: ${theme.colors.surface};
`;

const ConversationHeader = styled.div`
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
  font-weight: 600;
  background: ${theme.colors.primary}05;
`;

const ConversationItem = styled(motion.div)`
  padding: ${theme.spacing.lg};
  display: flex;
  gap: ${theme.spacing.md};
  cursor: pointer;
  transition: ${theme.transitions.base};
  border-bottom: 1px solid ${theme.colors.border};
  background: ${props => props.$active ? theme.colors.primary + '10' : 'transparent'};

  &:hover {
    background: ${theme.colors.background};
  }
`;

const ConversationAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${theme.borderRadius.round};
  background: ${theme.gradients.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: ${theme.borderRadius.round};
  }
`;

const ConversationInfo = styled.div`
  flex: 1;
  min-width: 0;

  h4 {
    font-size: 14px;
    margin-bottom: ${theme.spacing.xs};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
  }

  p {
    font-size: 12px;
    color: ${theme.colors.text.light};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const UnreadBadge = styled.span`
  background: ${theme.colors.primary};
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: ${theme.borderRadius.round};
`;

const OnlineDot = styled.span`
  width: 8px;
  height: 8px;
  background: ${theme.colors.success};
  border-radius: ${theme.borderRadius.round};
  display: inline-block;
`;

const ChatArea = styled.div`
  display: flex;
  flex-direction: column;
  background: ${theme.colors.background};
`;

const ChatHeader = styled.div`
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
  background: ${theme.colors.surface};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const MessageBubble = styled(motion.div)`
  max-width: 70%;
  align-self: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
  background: ${props => props.$isOwn ? theme.colors.primary : theme.colors.surface};
  color: ${props => props.$isOwn ? 'white' : theme.colors.text.primary};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.large};
  border-bottom-right-radius: ${props => props.$isOwn ? '4px' : theme.borderRadius.large};
  border-bottom-left-radius: ${props => props.$isOwn ? theme.borderRadius.large : '4px'};
  position: relative;
`;

const MessageTime = styled.div`
  font-size: 10px;
  color: ${props => props.$isOwn ? 'rgba(255,255,255,0.7)' : theme.colors.text.light};
  margin-top: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const MessageInput = styled.div`
  padding: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
  background: ${theme.colors.surface};
  display: flex;
  gap: ${theme.spacing.sm};
  align-items: flex-end;
`;

const Input = styled.textarea`
  flex: 1;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  resize: none;
  font-family: inherit;
  font-size: 14px;
  max-height: 100px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const SendButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.round};
  background: ${theme.gradients.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TypingIndicator = styled.div`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  font-size: 12px;
  color: ${theme.colors.text.light};
  font-style: italic;
`;

const NoConversation = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  flex-direction: column;
  gap: ${theme.spacing.md};
  color: ${theme.colors.text.light};

  svg {
    font-size: 60px;
    opacity: 0.5;
  }
`;

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (user?.user_id) {
      const socket = initializeSocket(user.user_id);
      
      onNewMessage((message) => {
        if (selectedUser?.userId === message.senderId) {
          setMessages(prev => [...prev, message]);
        }
        fetchConversations();
      });
      
      onUserTyping(({ userId, isTyping }) => {
        if (selectedUser?.userId === userId) {
          setIsUserTyping(isTyping);
        }
      });
      
      onUserOnline(({ userId, online }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          if (online) newSet.add(userId);
          else newSet.delete(userId);
          return newSet;
        });
      });
      
      fetchConversations();
      
      return () => {
        disconnectSocket();
      };
    }
  }, [user]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.userId);
      const socket = getSocket();
      if (socket) {
        socket.emit('join-conversation', selectedUser.userId);
      }
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await API.get('/messages/conversations');
      setConversations(res.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const res = await API.get(`/messages/${otherUserId}`);
      setMessages(res.data.messages);
      
      // Mark as read via socket
      const unreadMessages = res.data.messages.filter(m => !m.is_read && m.receiver_id === user.user_id);
      unreadMessages.forEach(msg => markMessageRead(msg.message_id));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    
    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');
    
    sendMessage({
      senderId: user.user_id,
      receiverId: selectedUser.userId,
      message: messageText,
      jobId: selectedUser.jobId
    });
    
    // Optimistically add message
    const tempMessage = {
      message_id: Date.now(),
      sender_id: user.user_id,
      receiver_id: selectedUser.userId,
      message: messageText,
      created_at: new Date().toISOString(),
      is_read: false
    };
    setMessages(prev => [...prev, tempMessage]);
    setSending(false);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!typing && e.target.value.trim()) {
      setTyping(true);
      sendTyping(selectedUser.userId, true);
    }
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      sendTyping(selectedUser.userId, false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getConversationName = (conv) => {
    return conv.name || conv.userType === 'job_seeker' ? 'Job Seeker' : 'Employer';
  };

  return (
    <Container>
      <MessagesContainer>
        <ConversationsList>
          <ConversationHeader>
            <FiUsers /> Messages ({conversations.length})
          </ConversationHeader>
          
          {conversations.length === 0 ? (
            <div style={{ padding: theme.spacing.xl, textAlign: 'center', color: theme.colors.text.light }}>
              <FiMessageCircle size={40} />
              <p>No conversations yet</p>
              <small>Apply to jobs and start chatting with employers</small>
            </div>
          ) : (
            conversations.map(conv => (
              <ConversationItem
                key={conv.userId}
                $active={selectedUser?.userId === conv.userId}
                onClick={() => setSelectedUser(conv)}
                whileHover={{ x: 5 }}
              >
                <ConversationAvatar>
                  {conv.avatar ? (
                    <img src={conv.avatar} alt={getConversationName(conv)} />
                  ) : (
                    getConversationName(conv)[0]?.toUpperCase()
                  )}
                </ConversationAvatar>
                <ConversationInfo>
                  <h4>
                    {getConversationName(conv)}
                    {onlineUsers.has(conv.userId) && <OnlineDot />}
                  </h4>
                  <p>{conv.lastMessage?.substring(0, 50)}</p>
                </ConversationInfo>
                {conv.unreadCount > 0 && (
                  <UnreadBadge>{conv.unreadCount}</UnreadBadge>
                )}
              </ConversationItem>
            ))
          )}
        </ConversationsList>

        <ChatArea>
          {selectedUser ? (
            <>
              <ChatHeader>
                <ConversationAvatar>
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt={getConversationName(selectedUser)} />
                  ) : (
                    getConversationName(selectedUser)[0]?.toUpperCase()
                  )}
                </ConversationAvatar>
                <div>
                  <h4>{getConversationName(selectedUser)}</h4>
                  <small style={{ color: theme.colors.text.light }}>
                    {onlineUsers.has(selectedUser.userId) ? (
                      <span><OnlineDot /> Online</span>
                    ) : (
                      'Offline'
                    )}
                  </small>
                </div>
              </ChatHeader>

              <ChatMessages>
                <AnimatePresence>
                  {messages.map(msg => (
                    <MessageBubble
                      key={msg.message_id}
                      $isOwn={msg.sender_id === user.user_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {msg.message}
                      <MessageTime $isOwn={msg.sender_id === user.user_id}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {msg.sender_id === user.user_id && (
                          msg.is_read ? <FiCheckCircle size={12} /> : <FiCheck size={12} />
                        )}
                      </MessageTime>
                    </MessageBubble>
                  ))}
                </AnimatePresence>
                {isUserTyping && (
                  <TypingIndicator>Typing...</TypingIndicator>
                )}
                <div ref={messagesEndRef} />
              </ChatMessages>

              <MessageInput>
                <Input
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  rows={1}
                />
                <SendButton
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiSend />
                </SendButton>
              </MessageInput>
            </>
          ) : (
            <NoConversation>
              <FiMessageCircle />
              <h3>Select a conversation</h3>
              <p>Choose someone to start messaging</p>
            </NoConversation>
          )}
        </ChatArea>
      </MessagesContainer>
    </Container>
  );
};

export default Messages;