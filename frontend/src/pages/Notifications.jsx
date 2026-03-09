import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBell, FiCheckCircle, FiXCircle, FiClock, 
  FiBriefcase, FiMessageSquare, FiUser, FiAward 
} from 'react-icons/fi';
import API from '../services/api';
import { theme } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

const Container = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background};
  padding: 100px ${theme.spacing.xl} ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.md}) {
    padding: 100px ${theme.spacing.md} ${theme.spacing.md};
  }
`;

const Header = styled.div`
  max-width: 800px;
  margin: 0 auto ${theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: space-between;

  div {
    h1 {
      font-size: 32px;
      color: ${theme.colors.primary};
      margin-bottom: ${theme.spacing.xs};
    }

    p {
      color: ${theme.colors.text.secondary};
    }
  }
`;

const MarkAllButton = styled(motion.button)`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: ${theme.colors.primary}10;
  color: ${theme.colors.primary};
  border-radius: ${theme.borderRadius.medium};
  font-weight: 500;
  font-size: 14px;

  &:hover {
    background: ${theme.colors.primary}20;
  }
`;

const NotificationsList = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const NotificationCard = styled(motion.div)`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.md};
  box-shadow: ${theme.shadows.small};
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.md};
  border-left: 4px solid ${props => props.read ? theme.colors.border : theme.colors.primary};
  opacity: ${props => props.read ? 0.7 : 1};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(5px);
    box-shadow: ${theme.shadows.medium};
  }
`;

const NotificationIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${theme.borderRadius.medium};
  background: ${props => {
    switch(props.type) {
      case 'application': return theme.colors.primary + '15';
      case 'interview': return theme.colors.success + '15';
      case 'message': return theme.colors.accent + '15';
      case 'job': return theme.colors.secondary + '15';
      case 'certificate': return theme.colors.info + '15';
      default: return theme.colors.primary + '10';
    }
  }};
  color: ${props => {
    switch(props.type) {
      case 'application': return theme.colors.primary;
      case 'interview': return theme.colors.success;
      case 'message': return theme.colors.accent;
      case 'job': return theme.colors.secondary;
      case 'certificate': return theme.colors.info;
      default: return theme.colors.primary;
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
`;

const NotificationContent = styled.div`
  flex: 1;

  h4 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: ${theme.spacing.xs};
    color: ${theme.colors.text.primary};
  }

  p {
    color: ${theme.colors.text.secondary};
    font-size: 14px;
    margin-bottom: ${theme.spacing.xs};
    line-height: 1.5;
  }

  small {
    color: ${theme.colors.text.light};
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
  }
`;

const NotificationActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.sm};
`;

const ActionButton = styled(motion.button)`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.small};
  font-size: 13px;
  font-weight: 500;
  background: ${props => props.primary ? theme.colors.primary : theme.colors.background};
  color: ${props => props.primary ? 'white' : theme.colors.text.secondary};

  &:hover {
    background: ${props => props.primary ? theme.colors.primary + 'dd' : theme.colors.border};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxl};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  max-width: 800px;
  margin: 0 auto;

  svg {
    font-size: 80px;
    color: ${theme.colors.text.light};
    margin-bottom: ${theme.spacing.lg};
    opacity: 0.5;
  }

  h3 {
    font-size: 24px;
    margin-bottom: ${theme.spacing.sm};
    color: ${theme.colors.text.primary};
  }

  p {
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing.lg};
  }

  a {
    display: inline-block;
    background: ${theme.gradients.primary};
    color: white;
    padding: ${theme.spacing.md} ${theme.spacing.xl};
    border-radius: ${theme.borderRadius.medium};
    font-weight: 600;

    &:hover {
      opacity: 0.9;
    }
  }
`;

const FilterTabs = styled.div`
  max-width: 800px;
  margin: 0 auto ${theme.spacing.lg};
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

const FilterTab = styled(motion.button)`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: ${props => props.active ? theme.colors.primary : theme.colors.surface};
  color: ${props => props.active ? 'white' : theme.colors.text.secondary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-weight: 500;
  font-size: 14px;

  &:hover {
    background: ${props => props.active ? theme.colors.primary : theme.colors.background};
  }
`;

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [activeFilter, notifications]);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // If API fails, use mock data for now
      setNotifications(getMockNotifications());
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    if (activeFilter === 'all') {
      setFilteredNotifications(notifications);
    } else if (activeFilter === 'unread') {
      setFilteredNotifications(notifications.filter(n => !n.is_read));
    } else {
      setFilteredNotifications(notifications.filter(n => n.type === activeFilter));
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.notification_id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
      // Optimistic update even if API fails
      setNotifications(notifications.map(n => 
        n.notification_id === id ? { ...n, is_read: true } : n
      ));
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.notification_id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'application': return <FiBriefcase />;
      case 'interview': return <FiCheckCircle />;
      case 'message': return <FiMessageSquare />;
      case 'job': return <FiBriefcase />;
      case 'certificate': return <FiAward />;
      case 'system': return <FiBell />;
      default: return <FiBell />;
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Mock data for development
  const getMockNotifications = () => {
    return [
      {
        notification_id: 1,
        title: 'New Application',
        message: 'John Doe applied for Senior Developer position',
        type: 'application',
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        link: '/employer/applicants/1'
      },
      {
        notification_id: 2,
        title: 'Interview Scheduled',
        message: 'Interview with Jane Smith for UX Designer role',
        type: 'interview',
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        link: '/seeker/applications'
      },
      {
        notification_id: 3,
        title: 'Profile Viewed',
        message: 'Your profile was viewed by TechCorp Inc.',
        type: 'system',
        is_read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        link: '/seeker/profile'
      },
      {
        notification_id: 4,
        title: 'Certificate Verified',
        message: 'Your JavaScript certificate has been verified',
        type: 'certificate',
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        link: '/seeker/profile'
      },
      {
        notification_id: 5,
        title: 'New Message',
        message: 'You have a new message from recruiter',
        type: 'message',
        is_read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        link: '/messages'
      }
    ];
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
          Loading notifications...
        </div>
      </Container>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Container>
      <Header>
        <div>
          <h1>Notifications</h1>
          <p>You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <MarkAllButton
            onClick={markAllAsRead}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Mark all as read
          </MarkAllButton>
        )}
      </Header>

      <FilterTabs>
        <FilterTab
          active={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          All
        </FilterTab>
        <FilterTab
          active={activeFilter === 'unread'}
          onClick={() => setActiveFilter('unread')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Unread
        </FilterTab>
        <FilterTab
          active={activeFilter === 'application'}
          onClick={() => setActiveFilter('application')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Applications
        </FilterTab>
        <FilterTab
          active={activeFilter === 'interview'}
          onClick={() => setActiveFilter('interview')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Interviews
        </FilterTab>
        <FilterTab
          active={activeFilter === 'message'}
          onClick={() => setActiveFilter('message')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Messages
        </FilterTab>
      </FilterTabs>

      <NotificationsList>
        <AnimatePresence>
          {filteredNotifications.length === 0 ? (
            <EmptyState
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FiBell />
              <h3>No notifications yet</h3>
              <p>We'll notify you when something happens</p>
              {!user && (
                <Link to="/jobs">Browse Jobs</Link>
              )}
            </EmptyState>
          ) : (
            filteredNotifications.map((notification, index) => (
              <NotificationCard
                key={notification.notification_id}
                read={notification.is_read}
                onClick={() => handleNotificationClick(notification)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 5 }}
              >
                <NotificationIcon type={notification.type}>
                  {getIcon(notification.type)}
                </NotificationIcon>
                <NotificationContent>
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <small>
                    <FiClock /> {getTimeAgo(notification.created_at)}
                  </small>
                  {!notification.is_read && (
                    <NotificationActions>
                      <ActionButton
                        primary
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.notification_id);
                        }}
                      >
                        Mark as read
                      </ActionButton>
                    </NotificationActions>
                  )}
                </NotificationContent>
              </NotificationCard>
            ))
          )}
        </AnimatePresence>
      </NotificationsList>
    </Container>
  );
};

export default Notifications;