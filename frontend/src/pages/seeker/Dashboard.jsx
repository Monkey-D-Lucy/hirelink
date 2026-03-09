import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiBriefcase, FiCheckCircle, FiClock, FiXCircle, 
  FiEye, FiTrendingUp, FiUser, FiAward 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
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
  max-width: 1400px;
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

const StatsGrid = styled.div`
  max-width: 1400px;
  margin: 0 auto ${theme.spacing.xl};
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.lg};

  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(motion.div)`
  background: ${theme.colors.surface};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.small};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  cursor: pointer;
  transition: ${theme.transitions.base};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.medium};
  }
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: ${theme.borderRadius.medium};
  background: ${props => props.$color || theme.colors.primary}15;
  color: ${props => props.$color || theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const StatInfo = styled.div`
  flex: 1;

  h3 {
    font-size: 28px;
    margin-bottom: ${theme.spacing.xs};
    color: ${theme.colors.primary};
  }

  p {
    color: ${theme.colors.text.secondary};
    font-size: 14px;
  }
`;

const ContentGrid = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.small};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.lg};

  h2 {
    font-size: 20px;
    color: ${theme.colors.text.primary};
  }

  a {
    color: ${theme.colors.primary};
    font-size: 14px;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const JobCard = styled(motion.div)`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  margin-bottom: ${theme.spacing.md};
  cursor: pointer;
  transition: ${theme.transitions.base};

  &:hover {
    border-color: ${theme.colors.primary};
    box-shadow: ${theme.shadows.small};
  }
`;

const JobHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
`;

const JobTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
`;

const JobCompany = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: 14px;
  margin-bottom: ${theme.spacing.xs};
`;

const JobMeta = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  font-size: 13px;
  color: ${theme.colors.text.light};
`;

const StatusBadge = styled.span`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.small};
  font-size: 12px;
  font-weight: 500;
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

const ChartCard = styled.div`
  background: ${theme.colors.background};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  margin-bottom: ${theme.spacing.md};

  h4 {
    font-size: 14px;
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing.sm};
  }
`;

const ChartBar = styled.div`
  height: 8px;
  background: ${theme.colors.border};
  border-radius: ${theme.borderRadius.small};
  overflow: hidden;
  margin: ${theme.spacing.sm} 0;
`;

const ChartFill = styled.div`
  height: 100%;
  width: ${props => props.$percentage || 0}%;
  background: ${props => props.$color || theme.colors.primary};
  border-radius: ${theme.borderRadius.small};
  transition: width 0.3s ease;
`;

const ProfileStrengthCard = styled.div`
  text-align: center;
  padding: ${theme.spacing.lg};

  h3 {
    font-size: 48px;
    color: ${theme.colors.primary};
    margin-bottom: ${theme.spacing.xs};
  }

  p {
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing.md};
  }

  button {
    background: ${theme.gradients.primary};
    color: white;
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    border-radius: ${theme.borderRadius.medium};
    font-weight: 500;
    transition: ${theme.transitions.base};

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.primary};
    }
  }
`;

const NoData = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.light};
`;

const SeekerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pending: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0,
    profileViews: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch applications
      const appsRes = await API.get('/applications/my-applications');
      const applications = appsRes.data.applications || appsRes.data || [];
      setRecentApplications(applications.slice(0, 5));
      
      // Calculate stats
      const totalApps = applications.length;
      const pendingApps = applications.filter(a => a.status === 'pending').length;
      const shortlistedApps = applications.filter(a => a.status === 'shortlisted').length;
      const rejectedApps = applications.filter(a => a.status === 'rejected').length;
      const hiredApps = applications.filter(a => a.status === 'hired').length;
      
      setStats({
        totalApplications: totalApps,
        pending: pendingApps,
        shortlisted: shortlistedApps,
        rejected: rejectedApps,
        hired: hiredApps,
        profileViews: user?.profile?.profile_views || 127
      });
      
      // Fetch recommended jobs
      try {
        const jobsRes = await API.get('/jobs/recommended');
        const jobs = jobsRes.data.jobs || jobsRes.data || [];
        setRecommendedJobs(jobs.slice(0, 5));
      } catch (jobError) {
        console.log('Recommended jobs not available');
        setRecommendedJobs([]);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileStrength = () => {
    let strength = 0;
    const profile = user?.profile;
    
    if (profile?.full_name) strength += 15;
    if (profile?.headline) strength += 15;
    if (profile?.about) strength += 20;
    if (profile?.skills) strength += 20;
    if (profile?.resume_url) strength += 15;
    if (profile?.profile_pic_url) strength += 15;
    
    return strength;
  };

  const profileStrength = calculateProfileStrength();

  if (loading && recentApplications.length === 0) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
          Loading dashboard...
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>Welcome back, {user?.profile?.full_name || 'Seeker'}!</h1>
        <p>Here's what's happening with your job search</p>
      </Header>

      <StatsGrid>
        <StatCard
          whileHover={{ y: -5 }}
          onClick={() => navigate('/seeker/applications')}
        >
          <StatIcon $color={theme.colors.primary}>
            <FiBriefcase />
          </StatIcon>
          <StatInfo>
            <h3>{stats.totalApplications}</h3>
            <p>Total Applications</p>
          </StatInfo>
        </StatCard>

        <StatCard
          whileHover={{ y: -5 }}
          onClick={() => navigate('/seeker/applications?status=pending')}
        >
          <StatIcon $color={theme.colors.warning}>
            <FiClock />
          </StatIcon>
          <StatInfo>
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </StatInfo>
        </StatCard>

        <StatCard
          whileHover={{ y: -5 }}
          onClick={() => navigate('/seeker/applications?status=shortlisted')}
        >
          <StatIcon $color={theme.colors.success}>
            <FiCheckCircle />
          </StatIcon>
          <StatInfo>
            <h3>{stats.shortlisted}</h3>
            <p>Shortlisted</p>
          </StatInfo>
        </StatCard>

        <StatCard
          whileHover={{ y: -5 }}
          onClick={() => navigate('/seeker/profile')}
        >
          <StatIcon $color={theme.colors.accent}>
            <FiEye />
          </StatIcon>
          <StatInfo>
            <h3>{stats.profileViews}</h3>
            <p>Profile Views</p>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <Section>
          <SectionHeader>
            <h2>Recent Applications</h2>
            <Link to="/seeker/applications">View all</Link>
          </SectionHeader>

          {recentApplications.length === 0 ? (
            <NoData>
              <p>No applications yet. Start applying to jobs!</p>
            </NoData>
          ) : (
            recentApplications.map((app, index) => (
              <JobCard
                key={app.application_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/job/${app.job_id}`)}
              >
                <JobHeader>
                  <JobTitle>{app.title}</JobTitle>
                  <StatusBadge $status={app.status}>
                    {app.status}
                  </StatusBadge>
                </JobHeader>
                <JobCompany>{app.company_name}</JobCompany>
                <JobMeta>
                  <span>📍 {app.location || 'Remote'}</span>
                  <span>💰 ₹{app.salary_min?.toLocaleString()}</span>
                  <span>📅 {new Date(app.applied_date).toLocaleDateString()}</span>
                </JobMeta>
              </JobCard>
            ))
          )}
        </Section>

        <div>
          <Section style={{ marginBottom: theme.spacing.lg }}>
            <SectionHeader>
              <h2>Analytics</h2>
            </SectionHeader>

            <ChartCard>
              <h4>Application Status</h4>
              <ChartBar>
                <ChartFill 
                  $percentage={stats.totalApplications > 0 ? (stats.shortlisted / stats.totalApplications) * 100 : 0}
                  $color={theme.colors.success}
                />
              </ChartBar>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>Shortlisted: {stats.shortlisted}</span>
                <span>
                  {stats.totalApplications > 0 ? 
                    ((stats.shortlisted / stats.totalApplications) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </ChartCard>

            <ChartCard>
              <h4>Success Rate</h4>
              <ChartBar>
                <ChartFill 
                  $percentage={stats.totalApplications > 0 ? (stats.hired / stats.totalApplications) * 100 : 0}
                  $color={theme.colors.primary}
                />
              </ChartBar>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>Hired: {stats.hired}</span>
                <span>
                  {stats.totalApplications > 0 ? 
                    ((stats.hired / stats.totalApplications) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </ChartCard>
          </Section>

          <Section>
            <SectionHeader>
              <h2>Profile Strength</h2>
            </SectionHeader>

            <ProfileStrengthCard>
              <h3>{profileStrength}%</h3>
              <p>Complete your profile to get noticed by employers</p>
              <button onClick={() => navigate('/seeker/profile')}>
                Complete Profile
              </button>
            </ProfileStrengthCard>
          </Section>
        </div>
      </ContentGrid>

      {recommendedJobs.length > 0 && (
        <Section style={{ maxWidth: '1400px', margin: `${theme.spacing.xl} auto 0` }}>
          <SectionHeader>
            <h2>Recommended Jobs</h2>
            <Link to="/jobs">View all</Link>
          </SectionHeader>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: theme.spacing.md }}>
            {recommendedJobs.map((job, index) => (
              <JobCard
                key={job.job_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/job/${job.job_id}`)}
                style={{ marginBottom: 0 }}
              >
                <JobTitle>{job.title}</JobTitle>
                <JobCompany>{job.company_name}</JobCompany>
                <JobMeta>
                  <span>📍 {job.location || 'Remote'}</span>
                  <span>💰 ₹{job.salary_min?.toLocaleString()}</span>
                </JobMeta>
              </JobCard>
            ))}
          </div>
        </Section>
      )}
    </Container>
  );
};

export default SeekerDashboard;