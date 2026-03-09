import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBriefcase, FiMapPin, FiClock, FiDollarSign,
  FiCheckCircle, FiXCircle, FiEye, FiCalendar,
  FiFilter
} from 'react-icons/fi';
import API from '../../services/api';
import { theme } from '../../styles/theme';
import toast from 'react-hot-toast';

const Container = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background};
  padding: 100px ${theme.spacing.xl} ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.md}) {
    padding: 100px ${theme.spacing.md} ${theme.spacing.md};
  }
`;

const Header = styled.div`
  max-width: 1200px;
  margin: 0 auto ${theme.spacing.xl};

  h1 {
    font-size: 32px;
    color: ${theme.colors.primary};
    margin-bottom: ${theme.spacing.xs};
  }

  p {
    color: ${theme.colors.text.secondary};
  }
`;

const FilterTabs = styled.div`
  max-width: 1200px;
  margin: 0 auto ${theme.spacing.xl};
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

const FilterTab = styled(motion.button)`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: ${props => props.$active ? theme.colors.primary : theme.colors.surface};
  color: ${props => props.$active ? 'white' : theme.colors.text.secondary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? theme.colors.primary : theme.colors.background};
  }
`;

const StatsGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto ${theme.spacing.xl};
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.lg};

  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  background: ${theme.colors.surface};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.small};
  text-align: center;

  h3 {
    font-size: 32px;
    color: ${theme.colors.primary};
    margin-bottom: ${theme.spacing.xs};
  }

  p {
    color: ${theme.colors.text.secondary};
    font-size: 14px;
  }
`;

const ApplicationsList = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const ApplicationCard = styled(motion.div)`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.md};
  box-shadow: ${theme.shadows.small};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  border-left: 4px solid ${props => {
    switch(props.$status) {
      case 'pending': return '#F59E0B';
      case 'reviewed': return '#3B82F6';
      case 'shortlisted': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'hired': return '#10B981';
      default: return theme.colors.border;
    }
  }};

  @media (min-width: ${theme.breakpoints.md}) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const JobInfo = styled.div`
  flex: 2;

  h3 {
    font-size: 18px;
    margin-bottom: ${theme.spacing.xs};
    cursor: pointer;
    color: ${theme.colors.primary};

    &:hover {
      color: ${theme.colors.secondary};
    }
  }

  h4 {
    color: ${theme.colors.text.secondary};
    font-size: 14px;
    margin-bottom: ${theme.spacing.sm};
  }
`;

const JobMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  font-size: 13px;
  color: ${theme.colors.text.light};

  span {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
  }
`;

const StatusInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${theme.spacing.sm};
`;

const StatusBadge = styled.span`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.small};
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch(props.$status) {
      case 'pending': return '#FEF3C7';
      case 'reviewed': return '#DBEAFE';
      case 'shortlisted': return '#D1FAE5';
      case 'rejected': return '#FEE2E2';
      case 'hired': return '#10B981';
      default: return '#F3F4F6';
    }
  }};
  color: ${props => {
    switch(props.$status) {
      case 'pending': return '#92400E';
      case 'reviewed': return '#1E40AF';
      case 'shortlisted': return '#065F46';
      case 'rejected': return '#991B1B';
      case 'hired': return 'white';
      default: return '#4B5563';
    }
  }};
`;

const AppliedDate = styled.div`
  font-size: 12px;
  color: ${theme.colors.text.light};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const InterviewCard = styled.div`
  background: ${theme.colors.success}10;
  border: 1px solid ${theme.colors.success}30;
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.md};
  margin-top: ${theme.spacing.sm};
  width: 100%;

  p {
    color: ${theme.colors.success};
    font-size: 14px;
    font-weight: 500;
    margin-bottom: ${theme.spacing.xs};
  }
`;

const NoApplications = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxl};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  max-width: 600px;
  margin: 0 auto;

  svg {
    font-size: 60px;
    color: ${theme.colors.text.light};
    margin-bottom: ${theme.spacing.lg};
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
    transition: ${theme.transitions.base};

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.primary};
    }
  }
`;

const Applications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0
  });

  useEffect(() => {
    fetchApplications();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchApplications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterApplications();
  }, [activeFilter, applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await API.get('/applications/my-applications');
      const appsData = res.data.applications || res.data || [];
      setApplications(appsData);
      
      const newStats = {
        total: appsData.length,
        pending: appsData.filter(a => a.status === 'pending').length,
        reviewed: appsData.filter(a => a.status === 'reviewed').length,
        shortlisted: appsData.filter(a => a.status === 'shortlisted').length,
        rejected: appsData.filter(a => a.status === 'rejected').length,
        hired: appsData.filter(a => a.status === 'hired').length
      };
      setStats(newStats);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
      setLoading(false);
    }
  };

  const filterApplications = () => {
    if (activeFilter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(a => a.status === activeFilter));
    }
  };

  if (loading && applications.length === 0) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
          Loading applications...
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>My Applications</h1>
        <p>Track the status of your job applications</p>
      </Header>

      {applications.length > 0 ? (
        <>
          <StatsGrid>
            <StatCard>
              <h3>{stats.total}</h3>
              <p>Total</p>
            </StatCard>
            <StatCard>
              <h3>{stats.pending}</h3>
              <p>Pending</p>
            </StatCard>
            <StatCard>
              <h3>{stats.shortlisted}</h3>
              <p>Shortlisted</p>
            </StatCard>
            <StatCard>
              <h3>{stats.hired}</h3>
              <p>Hired</p>
            </StatCard>
          </StatsGrid>

          <FilterTabs>
            <FilterTab
              $active={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              All
            </FilterTab>
            <FilterTab
              $active={activeFilter === 'pending'}
              onClick={() => setActiveFilter('pending')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Pending
            </FilterTab>
            <FilterTab
              $active={activeFilter === 'reviewed'}
              onClick={() => setActiveFilter('reviewed')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reviewed
            </FilterTab>
            <FilterTab
              $active={activeFilter === 'shortlisted'}
              onClick={() => setActiveFilter('shortlisted')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Shortlisted
            </FilterTab>
            <FilterTab
              $active={activeFilter === 'rejected'}
              onClick={() => setActiveFilter('rejected')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Rejected
            </FilterTab>
            <FilterTab
              $active={activeFilter === 'hired'}
              onClick={() => setActiveFilter('hired')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Hired
            </FilterTab>
          </FilterTabs>

          <ApplicationsList>
            <AnimatePresence>
              {filteredApplications.map((app, index) => (
                <ApplicationCard
                  key={app.application_id}
                  $status={app.status}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <JobInfo>
                    <h3 onClick={() => navigate(`/job/${app.job_id}`)}>
                      {app.title}
                    </h3>
                    <h4>{app.company_name}</h4>
                    <JobMeta>
                      <span><FiMapPin /> {app.location || 'Remote'}</span>
                      {app.salary_min && (
                        <span>
                          <FiDollarSign /> ₹{app.salary_min.toLocaleString()}
                          {app.salary_max && ` - ₹${app.salary_max.toLocaleString()}`}
                        </span>
                      )}
                    </JobMeta>

                    {app.interview_date && (
                      <InterviewCard>
                        <p>
                          <FiCalendar /> Interview Scheduled
                        </p>
                        <p style={{ fontSize: '13px', marginTop: theme.spacing.xs }}>
                          {new Date(app.interview_date).toLocaleString()}
                        </p>
                      </InterviewCard>
                    )}
                  </JobInfo>

                  <StatusInfo>
                    <StatusBadge $status={app.status}>
                      {app.status.toUpperCase()}
                    </StatusBadge>
                    <AppliedDate>
                      <FiClock /> Applied {new Date(app.applied_date).toLocaleDateString()}
                    </AppliedDate>
                  </StatusInfo>
                </ApplicationCard>
              ))}
            </AnimatePresence>
          </ApplicationsList>
        </>
      ) : (
        <NoApplications>
          <FiBriefcase />
          <h3>No applications yet</h3>
          <p>Start applying to jobs that match your skills and interests</p>
          <Link to="/jobs">Browse Jobs</Link>
        </NoApplications>
      )}
    </Container>
  );
};

export default Applications;